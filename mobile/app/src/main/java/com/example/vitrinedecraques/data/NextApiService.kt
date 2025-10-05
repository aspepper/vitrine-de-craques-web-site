package com.example.vitrinedecraques.data

import com.example.vitrinedecraques.BuildConfig
import com.example.vitrinedecraques.data.model.FeedVideo
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.json.Json
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.HttpUrl.Companion.toHttpUrlOrNull
import java.io.IOException

class NextApiService(
    private val client: OkHttpClient = OkHttpClient(),
    private val json: Json = Json {
        ignoreUnknownKeys = true
        isLenient = true
    },
) {
    suspend fun fetchVideos(skip: Int, take: Int): List<FeedVideo> = withContext(Dispatchers.IO) {
        val baseUrl = BuildConfig.API_BASE_URL.trimEnd('/')
        val httpUrl = baseUrl.toHttpUrlOrNull()?.newBuilder()
            ?.addPathSegments("api/videos")
            ?.addQueryParameter("skip", skip.toString())
            ?.addQueryParameter("take", take.toString())
            ?.build()
            ?: throw IllegalStateException("API_BASE_URL inválida: $baseUrl")

        val request = Request.Builder()
            .url(httpUrl)
            .get()
            .build()

        execute(request)
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
}
