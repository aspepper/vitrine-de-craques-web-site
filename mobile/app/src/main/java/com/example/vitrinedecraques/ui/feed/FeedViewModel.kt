package com.example.vitrinedecraques.ui.feed

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.vitrinedecraques.data.NextApiService
import com.example.vitrinedecraques.data.model.FeedVideo
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
)

class FeedViewModel(
    private val service: NextApiService = NextApiService(),
) : ViewModel() {

    private val _uiState = MutableStateFlow(FeedUiState(isLoading = true))
    val uiState: StateFlow<FeedUiState> = _uiState.asStateFlow()

    private var loadJob: Job? = null
    private var currentSkip = 0

    init {
        loadInitial()
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
                currentSkip = skip + videos.size
                _uiState.value = if (reset) {
                    FeedUiState(
                        videos = videos,
                        isLoading = false,
                        hasMore = videos.size == PAGE_SIZE,
                    )
                } else {
                    val merged = _uiState.value.videos + videos
                    _uiState.value.copy(
                        videos = merged,
                        isLoading = false,
                        hasMore = videos.size == PAGE_SIZE,
                        error = null,
                    )
                }
            } catch (error: Exception) {
                if (reset) {
                    _uiState.value = FeedUiState(
                        videos = emptyList(),
                        isLoading = false,
                        hasMore = true,
                        error = error.message ?: "Não foi possível carregar o feed.",
                    )
                } else {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        error = error.message ?: "Não foi possível carregar mais vídeos.",
                    )
                }
            }
        }
    }
}
