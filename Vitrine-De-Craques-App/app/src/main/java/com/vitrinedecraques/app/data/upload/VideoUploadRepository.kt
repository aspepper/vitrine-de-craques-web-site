package com.vitrinedecraques.app.data.upload

import android.content.ContentResolver
import android.net.Uri
import com.vitrinedecraques.app.data.network.ApiBaseUrlResolver
import com.vitrinedecraques.app.data.network.HttpClientProvider
import java.io.IOException
import java.util.Locale
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonObject
import kotlinx.serialization.json.jsonPrimitive
import okhttp3.MediaType.Companion.toMediaTypeOrNull
import okhttp3.MultipartBody
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody
import okio.BufferedSink
import okio.source

private const val SUCCESS_STATUS_RANGE_START = 200
private const val SUCCESS_STATUS_RANGE_END = 299

class VideoUploadRepository @JvmOverloads constructor(
    private val apiBaseUrlResolver: ApiBaseUrlResolver,
    private val client: OkHttpClient = HttpClientProvider.client,
    private val json: Json = Json {
        ignoreUnknownKeys = true
        isLenient = true
    },
) {

    suspend fun uploadVideo(contentResolver: ContentResolver, request: VideoUploadRequest) {
        return withContext(Dispatchers.IO) {
            val effectiveBaseUrl = apiBaseUrlResolver.resolveBaseUrl()
            val httpUrl = effectiveBaseUrl.newBuilder()
                .addPathSegment("api")
                .addPathSegment("videos")
                .build()

            val videoRequestBody = ContentUriRequestBody(
                contentResolver = contentResolver,
                uri = request.videoUri,
                mimeType = request.mimeType ?: "video/*",
            )

            val multipartBuilder = MultipartBody.Builder()
                .setType(MultipartBody.FORM)
                .addFormDataPart("title", request.title)
                .addFormDataPart("description", request.description)
                .addFormDataPart("clipStart", request.clipStartSeconds.formatSeconds())
                .addFormDataPart("clipDuration", request.clipDurationSeconds.formatSeconds())
                .addFormDataPart("deliveryProtocol", request.deliveryProtocol)
                .addFormDataPart("fallbackProtocol", request.fallbackProtocol)
                .addFormDataPart("targetResolution", request.targetResolution)
                .addFormDataPart("optimizeForMobile", request.optimizeForMobile.toString())
                .addFormDataPart(
                    name = "video",
                    filename = request.fileName ?: "video.mp4",
                    body = videoRequestBody,
                )

            request.thumbnail?.let { thumbnail ->
                multipartBuilder.addFormDataPart(
                    name = "thumbnail",
                    filename = thumbnail.fileName,
                    body = ContentUriRequestBody(
                        contentResolver = contentResolver,
                        uri = thumbnail.uri,
                        mimeType = thumbnail.mimeType ?: "image/jpeg",
                    ),
                )
            }

            val httpRequest = Request.Builder()
                .url(httpUrl)
                .post(multipartBuilder.build())
                .build()

            client.newCall(httpRequest).execute().use { response ->
                if (response.code !in SUCCESS_STATUS_RANGE_START..SUCCESS_STATUS_RANGE_END) {
                    val errorBody = response.body?.string()
                    throw IOException(resolveErrorMessage(errorBody, response.code))
                }
            }
        }
    }

    private fun resolveErrorMessage(rawBody: String?, statusCode: Int): String {
        if (!rawBody.isNullOrBlank()) {
            val parsed = runCatching { json.parseToJsonElement(rawBody) }.getOrNull()
            val message = parsed
                ?.jsonObject
                ?.get("message")
                ?.jsonPrimitive
                ?.content
                ?.takeIf { it.isNotBlank() }
            if (!message.isNullOrBlank()) {
                return message
            }
            if (rawBody.length < 120) {
                return rawBody
            }
        }
        return when (statusCode) {
            401 -> "É necessário fazer login antes de enviar um vídeo."
            else -> "Falha ao enviar o vídeo (código $statusCode)."
        }
    }
}

data class VideoUploadRequest(
    val title: String,
    val description: String,
    val clipStartSeconds: Float,
    val clipDurationSeconds: Float,
    val deliveryProtocol: String,
    val fallbackProtocol: String,
    val targetResolution: String,
    val optimizeForMobile: Boolean,
    val videoUri: Uri,
    val fileName: String?,
    val mimeType: String?,
    val thumbnail: ThumbnailData? = null,
)

data class ThumbnailData(
    val uri: Uri,
    val fileName: String?,
    val mimeType: String?,
)

private class ContentUriRequestBody(
    private val contentResolver: ContentResolver,
    private val uri: Uri,
    private val mimeType: String,
) : RequestBody() {

    override fun contentType() = mimeType.toMediaTypeOrNull()

    override fun contentLength(): Long {
        return contentResolver.openAssetFileDescriptor(uri, "r")?.use { descriptor ->
            descriptor.length
        } ?: -1L
    }

    override fun writeTo(sink: BufferedSink) {
        val inputStream = contentResolver.openInputStream(uri)
            ?: throw IOException("Não foi possível abrir o arquivo selecionado.")
        inputStream.source().use { source ->
            sink.writeAll(source)
        }
    }
}

private fun Float.formatSeconds(): String {
    val safeValue = if (isFinite()) this else 0f
    return String.format(Locale.US, "%.2f", safeValue.coerceAtLeast(0f))
}
