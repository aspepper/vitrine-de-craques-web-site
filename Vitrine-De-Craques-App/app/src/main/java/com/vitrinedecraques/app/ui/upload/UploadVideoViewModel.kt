package com.vitrinedecraques.app.ui.upload

import android.app.Application
import android.net.Uri
import android.provider.OpenableColumns
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.vitrinedecraques.app.data.upload.VideoUploadRepository
import com.vitrinedecraques.app.data.upload.VideoUploadRequest
import java.io.IOException
import kotlin.math.max
import kotlin.math.min
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import android.media.MediaMetadataRetriever

private const val CLIP_DURATION_SECONDS = 10f
private const val TARGET_RESOLUTION = "720x1280"
private const val DELIVERY_PROTOCOL = "hls"
private const val FALLBACK_PROTOCOL = "mpeg-dash"
private const val SUCCESS_MESSAGE = "Seu vídeo foi enviado! Entrará no ar assim que o processamento for concluído."

class UploadVideoViewModel @JvmOverloads constructor(
    application: Application,
    private val repository: VideoUploadRepository = VideoUploadRepository(),
) : AndroidViewModel(application) {

    private val _uiState = MutableStateFlow(UploadVideoUiState())
    val uiState: StateFlow<UploadVideoUiState> = _uiState.asStateFlow()

    fun onSelectVideo(uri: Uri?) {
        if (uri == null) {
            _uiState.update { state ->
                state.copy(
                    videoUri = null,
                    videoDisplayName = null,
                    videoMimeType = null,
                    videoDurationSeconds = 0f,
                    clipStartSeconds = 0f,
                    orientationWarning = false,
                    isVideoLoading = false,
                )
            }
            return
        }

        val application = getApplication<Application>()
        viewModelScope.launch {
            _uiState.update { state ->
                state.copy(
                    isVideoLoading = true,
                    errorMessage = null,
                    successMessage = null,
                )
            }

            val resolver = application.contentResolver
            try {
                val metadata = withContext(Dispatchers.IO) { loadMetadata(application, uri) }
                val displayName = withContext(Dispatchers.IO) { resolveDisplayName(resolver, uri) }
                val mimeType = resolver.getType(uri)
                val durationSeconds = metadata.durationMs.coerceAtLeast(0L) / 1000f
                val safeDuration = if (durationSeconds.isFinite()) durationSeconds else 0f
                _uiState.update { state ->
                    state.copy(
                        videoUri = uri,
                        videoDisplayName = displayName,
                        videoMimeType = mimeType,
                        videoDurationSeconds = safeDuration,
                        clipStartSeconds = 0f,
                        orientationWarning = !metadata.isVertical,
                        isVideoLoading = false,
                        errorMessage = null,
                        successMessage = null,
                    )
                }
            } catch (error: Exception) {
                val message = if (error is IOException) {
                    error.message ?: "Não foi possível carregar o vídeo selecionado."
                } else {
                    error.message ?: "Não foi possível carregar o vídeo selecionado."
                }
                _uiState.update { state ->
                    state.copy(
                        videoUri = null,
                        videoDisplayName = null,
                        videoMimeType = null,
                        videoDurationSeconds = 0f,
                        clipStartSeconds = 0f,
                        orientationWarning = false,
                        isVideoLoading = false,
                        errorMessage = message,
                    )
                }
            }
        }
    }

    fun updateClipStart(value: Float) {
        _uiState.update { state ->
            if (state.isSubmitting) state
            else {
                val maxStart = max(state.videoDurationSeconds - CLIP_DURATION_SECONDS, 0f)
                val clamped = value.coerceIn(0f, maxStart)
                state.copy(
                    clipStartSeconds = clamped,
                    successMessage = null,
                )
            }
        }
    }

    fun updateTitle(value: String) {
        _uiState.update { state ->
            state.copy(title = value, successMessage = null, errorMessage = null)
        }
    }

    fun updateDescription(value: String) {
        _uiState.update { state ->
            state.copy(description = value, successMessage = null, errorMessage = null)
        }
    }

    fun clearVideo() {
        _uiState.update { state ->
            state.copy(
                videoUri = null,
                videoDisplayName = null,
                videoMimeType = null,
                videoDurationSeconds = 0f,
                clipStartSeconds = 0f,
                orientationWarning = false,
                isVideoLoading = false,
            )
        }
    }

    fun submit() {
        val currentState = _uiState.value
        if (currentState.isSubmitting) {
            return
        }
        val videoUri = currentState.videoUri
        if (videoUri == null) {
            _uiState.update { it.copy(errorMessage = "Selecione um vídeo para continuar.") }
            return
        }
        val title = currentState.title.trim()
        val description = currentState.description.trim()
        if (title.isEmpty() || description.isEmpty()) {
            _uiState.update { it.copy(errorMessage = "Informe título e descrição para continuar.") }
            return
        }

        val application = getApplication<Application>()
        val resolver = application.contentResolver
        val clipDuration = if (currentState.videoDurationSeconds > 0f) {
            min(CLIP_DURATION_SECONDS, currentState.videoDurationSeconds)
        } else {
            CLIP_DURATION_SECONDS
        }
        val maxStart = max(currentState.videoDurationSeconds - CLIP_DURATION_SECONDS, 0f)
        val clipStart = currentState.clipStartSeconds.coerceIn(0f, maxStart)

        viewModelScope.launch {
            _uiState.update { state ->
                state.copy(
                    isSubmitting = true,
                    errorMessage = null,
                    successMessage = null,
                )
            }
            try {
                val request = VideoUploadRequest(
                    title = title,
                    description = description,
                    clipStartSeconds = clipStart,
                    clipDurationSeconds = clipDuration,
                    deliveryProtocol = DELIVERY_PROTOCOL,
                    fallbackProtocol = FALLBACK_PROTOCOL,
                    targetResolution = TARGET_RESOLUTION,
                    optimizeForMobile = true,
                    videoUri = videoUri,
                    fileName = currentState.videoDisplayName,
                    mimeType = currentState.videoMimeType,
                )
                repository.uploadVideo(resolver, request)
                _uiState.update { state ->
                    state.copy(
                        videoUri = null,
                        videoDisplayName = null,
                        videoMimeType = null,
                        videoDurationSeconds = 0f,
                        clipStartSeconds = 0f,
                        orientationWarning = false,
                        isVideoLoading = false,
                        isSubmitting = false,
                        title = "",
                        description = "",
                        successMessage = SUCCESS_MESSAGE,
                        errorMessage = null,
                    )
                }
            } catch (error: Exception) {
                val message = error.message ?: "Não foi possível concluir o envio."
                _uiState.update { state ->
                    state.copy(
                        isSubmitting = false,
                        errorMessage = message,
                    )
                }
            }
        }
    }

    private suspend fun loadMetadata(application: Application, uri: Uri): VideoMetadata {
        return withContext(Dispatchers.IO) {
            val retriever = MediaMetadataRetriever()
            try {
                retriever.setDataSource(application, uri)
                val durationMs = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION)
                    ?.toLongOrNull()
                    ?: 0L
                val width = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_WIDTH)
                    ?.toIntOrNull()
                    ?: 0
                val height = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_HEIGHT)
                    ?.toIntOrNull()
                    ?: 0
                val rotation = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_ROTATION)
                    ?.toIntOrNull()
                    ?: 0
                val adjustedWidth: Int
                val adjustedHeight: Int
                if (rotation == 90 || rotation == 270) {
                    adjustedWidth = height
                    adjustedHeight = width
                } else {
                    adjustedWidth = width
                    adjustedHeight = height
                }
                VideoMetadata(
                    durationMs = durationMs,
                    width = adjustedWidth,
                    height = adjustedHeight,
                )
            } finally {
                retriever.release()
            }
        }
    }

    private fun resolveDisplayName(resolver: android.content.ContentResolver, uri: Uri): String? {
        return resolver.query(uri, arrayOf(OpenableColumns.DISPLAY_NAME), null, null, null)?.use { cursor ->
            if (cursor.moveToFirst()) {
                val index = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
                if (index >= 0) {
                    return cursor.getString(index)
                }
            }
            null
        } ?: uri.lastPathSegment
    }
}

data class UploadVideoUiState(
    val videoUri: Uri? = null,
    val videoDisplayName: String? = null,
    val videoMimeType: String? = null,
    val videoDurationSeconds: Float = 0f,
    val clipStartSeconds: Float = 0f,
    val title: String = "",
    val description: String = "",
    val orientationWarning: Boolean = false,
    val isVideoLoading: Boolean = false,
    val isSubmitting: Boolean = false,
    val errorMessage: String? = null,
    val successMessage: String? = null,
)

data class VideoMetadata(
    val durationMs: Long,
    val width: Int,
    val height: Int,
) {
    val isVertical: Boolean
        get() = if (width <= 0 || height <= 0) {
            true
        } else {
            height >= width
        }
}

fun UploadVideoUiState.maxClipStart(): Float {
    return max(videoDurationSeconds - CLIP_DURATION_SECONDS, 0f)
}

fun UploadVideoUiState.clipDuration(): Float {
    return if (videoDurationSeconds > 0f) {
        min(CLIP_DURATION_SECONDS, videoDurationSeconds)
    } else {
        CLIP_DURATION_SECONDS
    }
}

fun UploadVideoUiState.clipEnd(): Float {
    return clipStartSeconds + clipDuration()
}

fun UploadVideoUiState.canSubmit(): Boolean {
    return videoUri != null && title.trim().isNotEmpty() && description.trim().isNotEmpty() && !isSubmitting
}
