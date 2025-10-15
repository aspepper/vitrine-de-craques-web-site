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
    val pendingNewVideos: List<FeedVideo> = emptyList(),
    val showNewVideosBanner: Boolean = false,
    val isCheckingUpdates: Boolean = false,
)

class FeedViewModel @JvmOverloads constructor(
    application: Application,
    private val service: NextApiService = NextApiService(),
    private val cache: FeedCache = FeedCache(application)
) : AndroidViewModel(application) {

    private val _uiState = MutableStateFlow(FeedUiState(isLoading = true))
    val uiState: StateFlow<FeedUiState> = _uiState.asStateFlow()

    private var loadJob: Job? = null
    private var updatesJob: Job? = null
    private var currentSkip = 0
    private var lastViewedVideoId: String? = null

    init {
        viewModelScope.launch {
            restoreFromCache()
            if (_uiState.value.videos.isEmpty()) {
                loadInitial()
            } else {
                checkForUpdates()
            }
        }
    }

    fun refresh() {
        if (_uiState.value.videos.isEmpty()) {
            loadInitial()
        } else {
            checkForUpdates(force = true)
        }
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
            if (reset) {
                loadFirstPage()
            } else {
                loadNextPage()
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
            currentSkip = snapshot.videos.size
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

    fun checkForUpdates(force: Boolean = false) {
        val currentState = _uiState.value
        if (currentState.isLoading && !force) return
        if (updatesJob?.isActive == true && !force) return
        updatesJob?.cancel()
        updatesJob = viewModelScope.launch {
            val baseState = _uiState.value
            if (baseState.videos.isEmpty()) {
                loadFirstPage()
                return@launch
            }

            val interimState = if (force) {
                baseState.copy(isLoading = true, error = null)
            } else {
                baseState.copy(isCheckingUpdates = true, error = null)
            }
            _uiState.value = interimState

            try {
                val knownIds = (baseState.videos + baseState.pendingNewVideos).map { it.id }.toSet()
                val newVideos = fetchAllNewVideos(knownIds)
                val combinedPending = mergePendingVideos(newVideos, baseState.pendingNewVideos)
                currentSkip = baseState.videos.size + combinedPending.size
                _uiState.value = interimState.copy(
                    isLoading = false,
                    isCheckingUpdates = false,
                    pendingNewVideos = combinedPending,
                    showNewVideosBanner = combinedPending.isNotEmpty(),
                    error = null,
                )
            } catch (error: Exception) {
                _uiState.value = interimState.copy(
                    isLoading = false,
                    isCheckingUpdates = false,
                    error = error.message ?: "Não foi possível verificar por novos vídeos.",
                )
            }
        }
    }

    fun revealPendingNewVideos() {
        val state = _uiState.value
        if (state.pendingNewVideos.isEmpty()) return
        val merged = (state.pendingNewVideos + state.videos).distinctBy { it.id }
        currentSkip = merged.size
        val alignedLastViewed = alignLastViewedVideoId(merged)
        _uiState.value = state.copy(
            videos = merged,
            pendingNewVideos = emptyList(),
            showNewVideosBanner = false,
            lastViewedVideoId = alignedLastViewed,
        )
        persistVideos(merged)
    }

    private suspend fun loadFirstPage() {
        _uiState.value = FeedUiState(isLoading = true)
        try {
            val videos = service.fetchVideos(skip = 0, take = PAGE_SIZE)
            currentSkip = videos.size
            val alignedLastViewed = alignLastViewedVideoId(videos)
            _uiState.value = FeedUiState(
                videos = videos,
                isLoading = false,
                hasMore = videos.size == PAGE_SIZE,
                error = null,
                lastViewedVideoId = alignedLastViewed,
            )
            persistVideos(videos)
        } catch (error: Exception) {
            _uiState.value = FeedUiState(
                videos = emptyList(),
                isLoading = false,
                hasMore = true,
                error = error.message ?: "Não foi possível carregar o feed.",
                lastViewedVideoId = null,
            )
        }
    }

    private suspend fun loadNextPage() {
        val state = _uiState.value
        val skip = currentSkip
        _uiState.value = state.copy(isLoading = true, error = null)
        try {
            val videos = service.fetchVideos(skip = skip, take = PAGE_SIZE)
            currentSkip = skip + videos.size
            val merged = (state.videos + videos).distinctBy { it.id }
            val alignedLastViewed = alignLastViewedVideoId(merged)
            _uiState.value = state.copy(
                videos = merged,
                isLoading = false,
                hasMore = videos.size == PAGE_SIZE,
                error = null,
                lastViewedVideoId = alignedLastViewed,
                pendingNewVideos = state.pendingNewVideos,
                showNewVideosBanner = state.showNewVideosBanner,
                isCheckingUpdates = false,
            )
            persistVideos(merged)
        } catch (error: Exception) {
            _uiState.value = state.copy(
                isLoading = false,
                error = error.message ?: "Não foi possível carregar mais vídeos.",
            )
        }
    }

    private suspend fun fetchAllNewVideos(knownIds: Set<String>): List<FeedVideo> {
        val collected = mutableListOf<FeedVideo>()
        var skip = 0
        do {
            val page = service.fetchVideos(skip = skip, take = PAGE_SIZE)
            if (page.isEmpty()) break
            val newFromPage = page.filterNot { video ->
                knownIds.contains(video.id) || collected.any { it.id == video.id }
            }
            collected += newFromPage
            val reachedKnownVideo = newFromPage.size < page.size
            skip += page.size
            if (reachedKnownVideo || page.size < PAGE_SIZE) {
                break
            }
        } while (true)
        return collected
    }

    private fun mergePendingVideos(newVideos: List<FeedVideo>, pending: List<FeedVideo>): List<FeedVideo> {
        if (newVideos.isEmpty() && pending.isEmpty()) return emptyList()
        if (newVideos.isEmpty()) return pending
        if (pending.isEmpty()) return newVideos
        return (newVideos + pending).distinctBy { it.id }
    }
}
