package com.vitrinedecraques.app.data.model

import kotlinx.serialization.Serializable

@Serializable
data class FollowStats(
    val followerCount: Int? = null,
    val isFollowing: Boolean? = null,
)
