package com.vitrinedecraques.app.data.network

import android.util.Log
import java.io.IOException
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import okhttp3.HttpUrl
import okhttp3.HttpUrl.Companion.toHttpUrlOrNull
import okhttp3.OkHttpClient
import okhttp3.Request

private const val TAG = "ApiBaseUrlResolver"

/**
 * Resolve and cache the canonical API base URL exposed by the backend.
 *
 * The mobile app is bundled with a fallback host (the Azure Static Web Apps
 * default domain), but in production the backend sets the `NEXTAUTH_URL`
 * environment variable to the public domain. The login flow relies on session
 * cookies whose domain must match the host being used. If we keep talking to
 * the fallback host, the cookies returned by the API become invalid and the
 * login fails with "Nenhum cookie de sessão retornado pela API". By probing the
 * `/api/health` endpoint we can learn the canonical host and reuse it across
 * the app.
 */
object ApiBaseUrlResolver {
    private val mutex = Mutex()
    @Volatile
    private var cachedBaseUrl: HttpUrl? = null

    private val additionalFallbackHosts = listOf(
        "https://vitrinedecraques.com",
        "https://www.vitrinedecraques.com",
        "https://app.vitrinedecraques.com",
        "https://nice-hill-01a3a1010.2.azurestaticapps.net",
    )

    suspend fun resolve(
        client: OkHttpClient,
        json: Json,
        fallback: HttpUrl,
    ): HttpUrl {
        cachedBaseUrl?.let { return it }
        return mutex.withLock {
            cachedBaseUrl?.let { return it }

            val candidates = buildCandidateList(fallback)
            var lastError: Throwable? = null

            for (candidate in candidates) {
                val result = runCatching { fetchCanonicalBaseUrl(client, json, candidate) }
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
                if (result.canonical != null && !result.canonical.hasSameOrigin(candidate)) {
                    Log.i(
                        TAG,
                        "Host canônico detectado: $resolved (fallback era ${candidate.normalize()})"
                    )
                }
                cachedBaseUrl = resolved
                return resolved
            }

            lastError?.let { error ->
                Log.w(
                    TAG,
                    "Não foi possível detectar host canônico; mantendo fallback ${fallback.normalize()}. Último erro: ${error.logMessage()}"
                )
            }

            val normalizedFallback = fallback.normalize()
            cachedBaseUrl = normalizedFallback
            return normalizedFallback
        }
    }

    private fun buildCandidateList(primary: HttpUrl): List<HttpUrl> {
        val unique = LinkedHashMap<String, HttpUrl>()
        fun addCandidate(url: HttpUrl) {
            val normalized = url.normalize()
            unique[normalized.canonicalKey()] = normalized
        }

        addCandidate(primary)
        additionalFallbackHosts.forEach { host ->
            host.toHttpUrlOrNull()?.let { addCandidate(it) }
        }

        return unique.values.toList()
    }

    private fun fetchCanonicalBaseUrl(
        client: OkHttpClient,
        json: Json,
        candidate: HttpUrl,
    ): HealthCheckResult {
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

    fun reset() {
        cachedBaseUrl = null
    }
}

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
