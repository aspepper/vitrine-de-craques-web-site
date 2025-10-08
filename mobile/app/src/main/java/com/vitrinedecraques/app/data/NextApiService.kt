package com.vitrinedecraques.app.data

import com.vitrinedecraques.app.BuildConfig
import com.vitrinedecraques.app.data.model.FeedUser
import com.vitrinedecraques.app.data.model.FeedUserProfile
import com.vitrinedecraques.app.data.model.FeedVideo
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.json.Json
import okhttp3.HttpUrl
import okhttp3.HttpUrl.Companion.toHttpUrlOrNull
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.IOException

class NextApiService(
    private val client: OkHttpClient = OkHttpClient(),
    private val json: Json = Json {
        ignoreUnknownKeys = true
        isLenient = true
    },
    baseUrl: String = BuildConfig.API_BASE_URL,
) {
    private val apiBaseUrl: HttpUrl = baseUrl.trim().takeIf { it.isNotEmpty() }
        ?.toHttpUrlOrNull()
        ?.newBuilder()
        ?.build()
        ?: throw IllegalStateException("API_BASE_URL inválida: $baseUrl")

    private val apiOrigin: HttpUrl = apiBaseUrl.newBuilder()
        .encodedPath("/")
        .query(null)
        .fragment(null)
        .build()

    suspend fun fetchVideos(skip: Int, take: Int): List<FeedVideo> = withContext(Dispatchers.IO) {
        val httpUrl = apiBaseUrl.newBuilder()
            .addPathSegments("api/videos")
            ?.addQueryParameter("skip", skip.toString())
            ?.addQueryParameter("take", take.toString())
            ?.build()
            ?: throw IllegalStateException("API_BASE_URL inválida: $baseUrl")

        val request = Request.Builder()
            .url(httpUrl)
            .get()
            .build()

        execute(request).map(::resolveVideoUrls)
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

    private fun resolveVideoUrls(video: FeedVideo): FeedVideo {
        val resolvedVideoUrl = resolveUrl(video.videoUrl) ?: video.videoUrl
        val resolvedThumbnail = resolveUrl(video.thumbnailUrl)
        val resolvedUser = video.user?.let(::resolveUser)

        return video.copy(
            videoUrl = resolvedVideoUrl,
            thumbnailUrl = resolvedThumbnail,
            user = resolvedUser,
        )
    }

    private fun resolveUser(user: FeedUser): FeedUser {
        val resolvedProfile = user.profile?.let(::resolveUserProfile)
        return user.copy(
            image = resolveUrl(user.image),
            profile = resolvedProfile,
        )
    }

    private fun resolveUserProfile(profile: FeedUserProfile): FeedUserProfile {
        return profile.copy(avatarUrl = resolveUrl(profile.avatarUrl))
    }

    private fun resolveUrl(url: String?): String? {
        if (url.isNullOrBlank()) {
            return url
        }
        val trimmed = url.trim()
        if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
            return trimmed
        }
        if (trimmed.startsWith("//")) {
            return "${apiBaseUrl.scheme}:$trimmed"
        }
        return apiOrigin.resolve(trimmed)?.toString()
            ?: apiBaseUrl.resolve(trimmed)?.toString()
            ?: trimmed
    }
}
