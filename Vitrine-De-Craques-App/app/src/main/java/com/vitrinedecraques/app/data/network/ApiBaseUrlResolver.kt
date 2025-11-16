package com.vitrinedecraques.app.data.network

import android.content.Context
import android.util.Log
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.emptyPreferences
import com.vitrinedecraques.app.BuildConfig
import java.io.IOException
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import okhttp3.HttpUrl
import okhttp3.HttpUrl.Companion.toHttpUrlOrNull
import okhttp3.OkHttpClient
import okhttp3.Request

private const val TAG = "ApiBaseUrlResolver"

interface ApiBaseUrlResolver {
    suspend fun resolveBaseUrl(): HttpUrl
    fun cachedBaseUrlOrNull(): HttpUrl?
}

class DefaultApiBaseUrlResolver private constructor(
    private val client: OkHttpClient,
    private val json: Json,
    private val fallbackBaseUrl: HttpUrl,
    private val storage: ApiBaseUrlStorage,
    private val ioDispatcher: CoroutineDispatcher,
) : ApiBaseUrlResolver {

    private val mutex = Mutex()

    @Volatile
    private var cachedBaseUrl: HttpUrl? = null

    @Volatile
    private var persistedValueLoaded = false

    companion object {
        @Volatile
        private var instance: DefaultApiBaseUrlResolver? = null

        fun getInstance(
            context: Context,
            client: OkHttpClient = HttpClientProvider.client,
            json: Json = Json { ignoreUnknownKeys = true; isLenient = true },
            baseUrl: String = BuildConfig.API_BASE_URL,
            dispatcher: CoroutineDispatcher = Dispatchers.IO,
        ): DefaultApiBaseUrlResolver {
            val resolvedFallback = baseUrl.trim().takeIf { it.isNotEmpty() }
                ?.toHttpUrlOrNull()
                ?.newBuilder()
                ?.build()
                ?.normalize()
                ?: throw IllegalStateException("API_BASE_URL inválida: $baseUrl")

            return instance ?: synchronized(this) {
                instance ?: DefaultApiBaseUrlResolver(
                    client = client,
                    json = json,
                    fallbackBaseUrl = resolvedFallback,
                    storage = PreferencesApiBaseUrlStorage(context.applicationContext),
                    ioDispatcher = dispatcher,
                ).also { instance = it }
            }
        }
    }

    override fun cachedBaseUrlOrNull(): HttpUrl? = cachedBaseUrl

    override suspend fun resolveBaseUrl(): HttpUrl = withContext(ioDispatcher) {
        cachedBaseUrl?.let {
            Log.d(TAG, "Resolved base URL = $it (source=memory)")
            return@withContext it
        }

        return@withContext mutex.withLock {
            cachedBaseUrl?.let {
                Log.d(TAG, "Resolved base URL = $it (source=memory)")
                return@withLock it
            }

            if (!persistedValueLoaded) {
                persistedValueLoaded = true
                val stored = storage.readBaseUrl()
                if (stored != null) {
                    cachedBaseUrl = stored
                    Log.d(TAG, "Resolved base URL = $stored (source=persisted)")
                    return@withLock stored
                }
            }

            val candidates = buildCandidateList(fallbackBaseUrl)
            var lastError: Throwable? = null

            for (candidate in candidates) {
                val result = runCatching { fetchCanonicalBaseUrl(candidate) }
                    .onFailure { error ->
                        lastError = error
                        Log.w(
                            TAG,
                            "Falha ao consultar /api/health em ${candidate.host}: ${error.logMessage()}"
                        )
                    }
                    .getOrNull()
                    ?: continue

                val resolved = (result.canonical ?: candidate).normalize()
                val source = if (result.canonical != null && !result.canonical.hasSameOrigin(candidate)) {
                    "canonical"
                } else {
                    "health"
                }

                persistResolvedBaseUrl(resolved)
                Log.d(TAG, "Resolved base URL = $resolved (source=$source)")
                return@withLock resolved
            }

            lastError?.let { error ->
                Log.w(
                    TAG,
                    "Não foi possível detectar host canônico; mantendo fallback ${fallbackBaseUrl.normalize()}. Último erro: ${error.logMessage()}"
                )
            }

            val fallback = fallbackBaseUrl.normalize()
            persistResolvedBaseUrl(fallback)
            Log.d(TAG, "Resolved base URL = $fallback (source=fallback)")
            fallback
        }
    }

    private suspend fun persistResolvedBaseUrl(url: HttpUrl) {
        cachedBaseUrl = url
        storage.saveBaseUrl(url)
    }

    private fun buildCandidateList(primary: HttpUrl): List<HttpUrl> {
        val unique = LinkedHashMap<String, HttpUrl>()
        fun addCandidate(url: HttpUrl) {
            val normalized = url.normalize()
            unique[normalized.canonicalKey()] = normalized
        }

        addCandidate(primary)
        ADDITIONAL_FALLBACK_HOSTS.forEach { host ->
            host.toHttpUrlOrNull()?.let { addCandidate(it) }
        }

        return unique.values.toList()
    }

    private fun fetchCanonicalBaseUrl(candidate: HttpUrl): HealthCheckResult {
        val healthUrl = candidate.newBuilder()
            .addPathSegment("api")
            .addPathSegment("health")
            .build()

        val request = Request.Builder()
            .url(healthUrl)
            .get()
            .build()

        client.newCall(request).execute().use { response ->
            val body = response.body?.string().orEmpty()
            if (!response.isSuccessful) {
                val preview = body.previewForLog()
                throw IOException("HTTP ${response.code} ${response.message}. corpo=$preview")
            }

            val payload = runCatching { json.decodeFromString(HealthResponse.serializer(), body) }
                .onFailure { error ->
                    Log.w(
                        TAG,
                        "Não foi possível interpretar resposta do health endpoint (${candidate.host}): ${error.message ?: error.javaClass.simpleName}"
                    )
                }
                .getOrNull()

            val hostUrl = payload
                ?.host
                ?.trim()
                ?.takeIf { it.isNotEmpty() }
                ?.toHttpUrlOrNull()
                ?.normalize()

            if (payload != null && hostUrl == null) {
                Log.w(TAG, "Health endpoint não informou NEXTAUTH_URL válida: host='${payload.host}'")
            }

            return HealthCheckResult(canonical = hostUrl)
        }
    }
}

private interface ApiBaseUrlStorage {
    suspend fun readBaseUrl(): HttpUrl?
    suspend fun saveBaseUrl(url: HttpUrl)
}

private class PreferencesApiBaseUrlStorage(
    private val context: Context,
) : ApiBaseUrlStorage {
    override suspend fun readBaseUrl(): HttpUrl? {
        val rawUrl = context.apiBaseUrlDataStore.data
            .catch { error ->
                if (error is IOException) {
                    emit(emptyPreferences())
                } else {
                    throw error
                }
            }
            .map { prefs -> prefs[RESOLVED_BASE_URL_KEY] }
            .firstOrNull()
            ?.trim()
            ?.takeIf { it.isNotEmpty() }
            ?: return null

        return rawUrl.toHttpUrlOrNull()?.normalize()
    }

    override suspend fun saveBaseUrl(url: HttpUrl) {
        context.apiBaseUrlDataStore.edit { prefs ->
            prefs[RESOLVED_BASE_URL_KEY] = url.normalize().toString()
        }
    }
}

private val ADDITIONAL_FALLBACK_HOSTS = listOf(
    "https://vitrinedecraques.com",
    "https://www.vitrinedecraques.com",
    "https://app.vitrinedecraques.com",
    "https://nice-hill-01a3a1010.2.azurestaticapps.net",
)

private data class HealthCheckResult(
    val canonical: HttpUrl?,
)

private fun HttpUrl.normalize(): HttpUrl = newBuilder()
    .encodedPath("/")
    .query(null)
    .fragment(null)
    .build()

private fun HttpUrl.hasSameOrigin(other: HttpUrl): Boolean {
    val sameHost = host.equals(other.host, ignoreCase = true)
    if (!sameHost) return false
    val sameScheme = scheme.equals(other.scheme, ignoreCase = true)
    if (!sameScheme) return false
    return port == other.port
}

private fun HttpUrl.canonicalKey(): String = buildString {
    append(scheme.lowercase())
    append("://")
    append(host.lowercase())
    append(":")
    append(port)
}

private fun Throwable.logMessage(): String =
    message?.takeIf { it.isNotBlank() } ?: this::class.java.simpleName

private fun String.previewForLog(limit: Int = 256): String {
    if (isBlank()) return "<vazio>"
    return if (length <= limit) this else substring(0, limit) + "…"
}

@Serializable
private data class HealthResponse(
    val ok: Boolean? = null,
    val host: String? = null,
)
