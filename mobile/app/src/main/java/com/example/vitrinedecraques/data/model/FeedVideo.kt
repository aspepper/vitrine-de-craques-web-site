package com.example.vitrinedecraques.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class FeedVideo(
    val id: String,
    val title: String? = null,
    val description: String? = null,
    @SerialName("videoUrl")
    val videoUrl: String,
    @SerialName("thumbnailUrl")
    val thumbnailUrl: String? = null,
    @SerialName("likesCount")
    val likesCount: Int? = null,
    val user: FeedUser? = null,
)

@Serializable
data class FeedUser(
    val id: String? = null,
    val name: String? = null,
    val image: String? = null,
    val profile: FeedUserProfile? = null,
)

@Serializable
data class FeedUserProfile(
    val id: String? = null,
    val role: String? = null,
    @SerialName("displayName")
    val displayName: String? = null,
    @SerialName("avatarUrl")
    val avatarUrl: String? = null,
)
