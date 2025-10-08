package com.vitrinedecraques.app.ui.feed

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.vitrinedecraques.app.data.FeedCache
import com.vitrinedecraques.app.data.NextApiService
import com.vitrinedecraques.app.data.model.FeedVideo
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

private const val PAGE_SIZE = 6

data class FeedUiState(
    val videos: List<FeedVideo> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null,
    val hasMore: Boolean = true,
    val lastViewedVideoId: String? = null,
)

class FeedViewModel(
    application: Application,
    private val service: NextApiService = NextApiService(),
    private val cache: FeedCache = FeedCache(application)
) : AndroidViewModel(application) {

    private val _uiState = MutableStateFlow(FeedUiState(isLoading = true))
    val uiState: StateFlow<FeedUiState> = _uiState.asStateFlow()

    private var loadJob: Job? = null
    private var currentSkip = 0
    private var lastViewedVideoId: String? = null

    init {
        viewModelScope.launch {
            restoreFromCache()
            loadInitial()
        }
    }

    fun refresh() {
        currentSkip = 0
        loadVideos(reset = true)
    }

    fun loadMore() {
        if (_uiState.value.isLoading || !_uiState.value.hasMore) return
        loadVideos(reset = false)
    }

    private fun loadInitial() {
        loadVideos(reset = true)
    }

    private fun loadVideos(reset: Boolean) {
        loadJob?.cancel()
        loadJob = viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, error = null)
            try {
                val skip = if (reset) 0 else currentSkip
                val videos = service.fetchVideos(skip = skip, take = PAGE_SIZE)
                currentSkip = if (reset) {
                    videos.size
                } else {
                    skip + videos.size
                }
                val merged = if (reset) {
                    (videos + _uiState.value.videos).distinctBy { it.id }
                } else {
                    (_uiState.value.videos + videos).distinctBy { it.id }
                }
                val alignedLastViewed = alignLastViewedVideoId(merged)
                _uiState.value = _uiState.value.copy(
                    videos = merged,
                    isLoading = false,
                    hasMore = videos.size == PAGE_SIZE,
                    error = null,
                    lastViewedVideoId = alignedLastViewed,
                )
                persistVideos(merged)
            } catch (error: Exception) {
                if (reset) {
                    val existing = _uiState.value.videos
                    if (existing.isEmpty()) {
                        _uiState.value = FeedUiState(
                            videos = emptyList(),
                            isLoading = false,
                            hasMore = true,
                            error = error.message ?: "Não foi possível carregar o feed.",
                            lastViewedVideoId = null,
                        )
                    } else {
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            error = error.message ?: "Não foi possível carregar o feed.",
                            hasMore = true,
                            lastViewedVideoId = lastViewedVideoId,
                        )
                    }
                } else {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = error.message ?: "Não foi possível carregar mais vídeos.",
                        lastViewedVideoId = lastViewedVideoId,
                    )
                }
            }
        }
    }

    fun updateLastViewedVideo(videoId: String) {
        if (lastViewedVideoId == videoId) return
        lastViewedVideoId = videoId
        _uiState.value = _uiState.value.copy(lastViewedVideoId = videoId)
        viewModelScope.launch {
            cache.saveLastViewedVideoId(videoId)
        }
    }

    private suspend fun restoreFromCache() {
        val snapshot = cache.loadSnapshot()
        if (snapshot.videos.isNotEmpty()) {
            lastViewedVideoId = snapshot.lastViewedVideoId
            _uiState.value = FeedUiState(
                videos = snapshot.videos,
                isLoading = true,
                hasMore = true,
                error = null,
                lastViewedVideoId = lastViewedVideoId,
            )
        }
    }

    private fun alignLastViewedVideoId(videos: List<FeedVideo>): String? {
        if (videos.isEmpty()) {
            lastViewedVideoId = null
            return null
        }
        if (lastViewedVideoId == null || videos.none { it.id == lastViewedVideoId }) {
            lastViewedVideoId = videos.first().id
        }
        return lastViewedVideoId
    }

    private fun persistVideos(videos: List<FeedVideo>) {
        viewModelScope.launch {
            cache.saveVideos(videos)
            cache.saveLastViewedVideoId(lastViewedVideoId)
        }
    }
}
