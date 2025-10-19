package com.vitrinedecraques.app.data.network

import android.util.Log
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

    suspend fun resolve(
        client: OkHttpClient,
        json: Json,
        fallback: HttpUrl,
    ): HttpUrl {
        cachedBaseUrl?.let { return it }
        return mutex.withLock {
            cachedBaseUrl?.let { return it }
            val detected = runCatching { fetchCanonicalBaseUrl(client, json, fallback) }
                .onFailure { error ->
                    Log.w(TAG, "Falha ao detectar host canônico: ${error.message}")
                }
                .getOrNull()
            val result = detected ?: fallback
            if (detected != null && detected.host != fallback.host) {
                Log.i(TAG, "Host canônico detectado: ${detected} (fallback era ${fallback})")
            }
            cachedBaseUrl = result
            return result
        }
    }

    private fun fetchCanonicalBaseUrl(
        client: OkHttpClient,
        json: Json,
        fallback: HttpUrl,
    ): HttpUrl? {
        val healthUrl = fallback.newBuilder()
            .addPathSegment("api")
            .addPathSegment("health")
            .build()

        val request = Request.Builder()
            .url(healthUrl)
            .get()
            .build()

        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) {
                Log.w(TAG, "Falha ao consultar /api/health: code=${response.code}")
                return null
            }
            val body = response.body?.string().orEmpty()
            if (body.isBlank()) {
                Log.w(TAG, "Resposta vazia ao consultar /api/health")
                return null
            }
            val payload = runCatching { json.decodeFromString(HealthResponse.serializer(), body) }
                .onFailure { error ->
                    Log.w(TAG, "Não foi possível interpretar resposta do health endpoint: ${error.message}")
                }
                .getOrNull()
                ?: return null

            val hostUrl = payload.host?.trim()?.takeIf { it.isNotEmpty() }?.toHttpUrlOrNull()
            if (hostUrl == null) {
                Log.w(TAG, "Health endpoint não informou NEXTAUTH_URL válida: host='${payload.host}'")
                return null
            }
            return hostUrl.newBuilder()
                .encodedPath("/")
                .query(null)
                .fragment(null)
                .build()
        }
    }

    fun reset() {
        cachedBaseUrl = null
    }
}

@Serializable
private data class HealthResponse(
    val ok: Boolean? = null,
    val host: String? = null,
)
