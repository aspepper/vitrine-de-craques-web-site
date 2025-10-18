package com.vitrinedecraques.app.data

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.emptyPreferences
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.vitrinedecraques.app.data.model.FeedVideo
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.serialization.builtins.ListSerializer
import kotlinx.serialization.json.Json
import java.io.IOException

private val Context.feedCacheDataStore by preferencesDataStore(name = "feed_cache")

class FeedCache(
    private val context: Context,
    private val json: Json = Json { ignoreUnknownKeys = true }
) {

    suspend fun loadSnapshot(): FeedCacheSnapshot {
        return context.feedCacheDataStore.data
            .catch { exception ->
                if (exception is IOException) {
                    emit(emptyPreferences())
                } else {
                    throw exception
                }
            }
            .map { preferences ->
                val videosJson = preferences[Keys.VIDEOS]
                val videos = videosJson?.let {
                    runCatching {
                        json.decodeFromString(ListSerializer(FeedVideo.serializer()), it)
                    }.getOrElse { emptyList() }
                } ?: emptyList()
                val lastViewedVideoId = preferences[Keys.LAST_VIEWED_VIDEO_ID]
                FeedCacheSnapshot(videos, lastViewedVideoId)
            }
            .first()
    }

    suspend fun saveVideos(videos: List<FeedVideo>) {
        val limited = videos.takeLast(MAX_CACHED_VIDEOS)
        val serialized = json.encodeToString(ListSerializer(FeedVideo.serializer()), limited)
        context.feedCacheDataStore.edit { preferences ->
            preferences[Keys.VIDEOS] = serialized
            val lastViewedId = preferences[Keys.LAST_VIEWED_VIDEO_ID]
            if (lastViewedId != null && limited.none { it.id == lastViewedId }) {
                preferences -= Keys.LAST_VIEWED_VIDEO_ID
            }
        }
    }

    suspend fun saveLastViewedVideoId(videoId: String?) {
        context.feedCacheDataStore.edit { preferences ->
            if (videoId.isNullOrBlank()) {
                preferences -= Keys.LAST_VIEWED_VIDEO_ID
            } else {
                preferences[Keys.LAST_VIEWED_VIDEO_ID] = videoId
            }
        }
    }

    data class FeedCacheSnapshot(
        val videos: List<FeedVideo>,
        val lastViewedVideoId: String?
    )

    private object Keys {
        val VIDEOS = stringPreferencesKey("videos")
        val LAST_VIEWED_VIDEO_ID = stringPreferencesKey("last_viewed_video_id")
    }

    companion object {
        private const val MAX_CACHED_VIDEOS = 10
    }
}
