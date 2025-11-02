package com.vitrinedecraques.app.data

import com.vitrinedecraques.app.BuildConfig
import com.vitrinedecraques.app.data.model.FeedUser
import com.vitrinedecraques.app.data.model.FeedUserProfile
import com.vitrinedecraques.app.data.model.FeedVideo
import com.vitrinedecraques.app.data.model.FollowStats
import com.vitrinedecraques.app.data.model.ProfileDetail
import com.vitrinedecraques.app.data.network.ApiBaseUrlResolver
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.json.Json
import okhttp3.HttpUrl
import okhttp3.HttpUrl.Companion.toHttpUrlOrNull
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.IOException
import java.util.Locale
import kotlin.math.abs
import com.vitrinedecraques.app.data.network.HttpClientProvider
import android.util.Log

private const val TAG = "NextApiService"

class NextApiService(
    private val client: OkHttpClient = HttpClientProvider.client,
    private val json: Json = Json {
        ignoreUnknownKeys = true
        isLenient = true
    },
    private val baseUrl: String = BuildConfig.API_BASE_URL,
) {
    private val fallbackVideoUrls = listOf(
        "https://storage.googleapis.com/coverr-main/mp4/Footboys.mp4",
        "https://storage.googleapis.com/coverr-main/mp4/Mountains.mp4",
        "https://storage.googleapis.com/coverr-main/mp4/Beach.mp4"
    )

    private val apiBaseUrl: HttpUrl = baseUrl.trim().takeIf { it.isNotEmpty() }
        ?.toHttpUrlOrNull()
        ?.newBuilder()
        ?.build()
        ?: throw IllegalStateException("API_BASE_URL inválida: $baseUrl")

    suspend fun fetchVideos(skip: Int, take: Int): List<FeedVideo> = withContext(Dispatchers.IO) {
        val effectiveBaseUrl = resolvedBaseUrl()
        val origin = effectiveBaseUrl.toOrigin()
        val httpUrl = effectiveBaseUrl.newBuilder()
            .addPathSegments("api/videos")
            ?.addQueryParameter("skip", skip.toString())
            ?.addQueryParameter("take", take.toString())
            ?.build()
            ?: throw IllegalStateException("API_BASE_URL inválida: $baseUrl")

        val request = Request.Builder()
            .url(httpUrl)
            .get()
            .build()

        Log.i(TAG, "Fetching videos from: ${'$'}{httpUrl}")

        execute(request).map { resolveVideoUrls(it, effectiveBaseUrl, origin) }
    }

    private fun execute(request: Request): List<FeedVideo> {
        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) {
                throw IOException("Erro ${'$'}{response.code()} ao carregar vídeos")
            }
            val body = response.body?.string() ?: "[]"
            return json.decodeFromString(body)
        }
    }

    suspend fun fetchProfileDetails(profileId: String, role: String?): ProfileDetail? =
        withContext(Dispatchers.IO) {
            val segments = when (role?.uppercase()) {
                "ATLETA" -> listOf("api", "atletas", profileId)
                "AGENTE" -> listOf("api", "agentes", profileId)
                else -> return@withContext null
            }

            val effectiveBaseUrl = resolvedBaseUrl()
            val httpUrlBuilder = effectiveBaseUrl.newBuilder()
            segments.forEach { httpUrlBuilder.addPathSegment(it) }
            val httpUrl = httpUrlBuilder.build()

            val request = Request.Builder()
                .url(httpUrl)
                .get()
                .build()

            Log.i(TAG, "Fetching profile details from: ${'$'}{httpUrl}")

            client.newCall(request).execute().use { response ->
                if (response.code == 404) {
                    return@withContext null
                }
                if (!response.isSuccessful) {
                    throw IOException("Erro ${'$'}{response.code()} ao carregar perfil")
                }
                val body = response.body?.string() ?: return@withContext null
                return@withContext json.decodeFromString<ProfileDetail>(body)
            }
        }

    suspend fun fetchFollowStats(userId: String): FollowStats? = withContext(Dispatchers.IO) {
        val effectiveBaseUrl = resolvedBaseUrl()
        val httpUrl = effectiveBaseUrl.newBuilder()
            .addPathSegment("api")
            .addPathSegment("follows")
            .addPathSegment(userId)
            .build()

        val request = Request.Builder()
            .url(httpUrl)
            .get()
            .build()

        client.newCall(request).execute().use { response ->
            if (response.code == 404) {
                return@withContext null
            }
            if (!response.isSuccessful) {
                throw IOException("Erro ${'$'}{response.code()} ao carregar seguidores")
            }
            val body = response.body?.string() ?: return@withContext null
            return@withContext json.decodeFromString<FollowStats>(body)
        }
    }

    private fun resolveVideoUrls(video: FeedVideo, baseUrl: HttpUrl, origin: HttpUrl): FeedVideo {
        val resolvedVideoUrl = resolveUrl(video.videoUrl, baseUrl, origin) ?: video.videoUrl
        val proxiedVideoUrl = buildProxiedVideoUrlIfNeeded(resolvedVideoUrl, origin)
        val sanitizedVideoUrl = proxiedVideoUrl
            .takeIf { isLikelyValidVideoUrl(it) }
            ?: fallbackVideoUrlFor(video.id, proxiedVideoUrl)
        val resolvedThumbnail = resolveUrl(video.thumbnailUrl, baseUrl, origin)
        val resolvedUser = video.user?.let { resolveUser(it, baseUrl, origin) }

        return video.copy(
            videoUrl = sanitizedVideoUrl,
            thumbnailUrl = resolvedThumbnail,
            user = resolvedUser,
        )
    }

    private fun resolveUser(user: FeedUser, baseUrl: HttpUrl, origin: HttpUrl): FeedUser {
        val resolvedProfile = user.profile?.let { resolveUserProfile(it, baseUrl, origin) }
        return user.copy(
            image = resolveUrl(user.image, baseUrl, origin),
            profile = resolvedProfile,
        )
    }

    private fun resolveUserProfile(profile: FeedUserProfile, baseUrl: HttpUrl, origin: HttpUrl): FeedUserProfile {
        return profile.copy(avatarUrl = resolveUrl(profile.avatarUrl, baseUrl, origin))
    }

    private fun resolveUrl(url: String?, baseUrl: HttpUrl, origin: HttpUrl): String? {
        if (url.isNullOrBlank()) {
            return url
        }
        val trimmed = url.trim()
        if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
            return trimmed
        }
        if (trimmed.startsWith("//")) {
            return "${baseUrl.scheme}:$trimmed"
        }
        return origin.resolve(trimmed)?.toString()
            ?: baseUrl.resolve(trimmed)?.toString()
            ?: trimmed
    }

    private suspend fun resolvedBaseUrl(): HttpUrl = ApiBaseUrlResolver.resolve(client, json, apiBaseUrl)

    private fun HttpUrl.toOrigin(): HttpUrl = newBuilder()
        .encodedPath("/")
        .query(null)
        .fragment(null)
        .build()

    private fun isLikelyValidVideoUrl(url: String): Boolean {
        val httpUrl = url.toHttpUrlOrNull() ?: return false
        val host = httpUrl.host.lowercase(Locale.ROOT)
        if (host == "example.com" || host == "localhost" || host == "127.0.0.1") {
            return false
        }
        val path = httpUrl.encodedPath
        if (path.isBlank() || path == "/") {
            return false
        }
        return true
    }

    private fun buildProxiedVideoUrlIfNeeded(originalUrl: String, origin: HttpUrl): String {
        val originalHttpUrl = originalUrl.toHttpUrlOrNull() ?: return originalUrl
        if (isSameOrigin(originalHttpUrl, origin)) {
            val normalizedPath = originalHttpUrl.encodedPath.trimStart('/')
            if (normalizedPath.startsWith("api/videos/proxy")) {
                return originalUrl
            }
            return originalUrl
        }

        return origin.newBuilder()
            .addPathSegment("api")
            .addPathSegment("videos")
            .addPathSegment("proxy")
            .addQueryParameter("url", originalUrl)
            .build()
            .toString()
    }

    private fun isSameOrigin(a: HttpUrl, b: HttpUrl): Boolean {
        val sameHost = a.host.equals(b.host, ignoreCase = true)
        if (!sameHost) {
            return false
        }

        val sameScheme = a.scheme.equals(b.scheme, ignoreCase = true)
        if (!sameScheme) {
            return false
        }

        return a.port == b.port
    }

    private fun fallbackVideoUrlFor(videoId: String, original: String): String {
        if (fallbackVideoUrls.isEmpty()) {
            return original
        }
        val index = abs(videoId.hashCode()) % fallbackVideoUrls.size
        return fallbackVideoUrls[index]
    }
}
