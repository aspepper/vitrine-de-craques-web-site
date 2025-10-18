package com.vitrinedecraques.app.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class ProfileDetail(
    val id: String,
    @SerialName("displayName")
    val displayName: String? = null,
    @SerialName("avatarUrl")
    val avatarUrl: String? = null,
    val bio: String? = null,
    val role: String? = null,
    val posicao: String? = null,
    val perna: String? = null,
    val altura: String? = null,
    val peso: String? = null,
    val pais: String? = null,
    val uf: String? = null,
    val cidade: String? = null,
    val nascimento: String? = null,
    val site: String? = null,
    val telefone: String? = null,
    val whatsapp: String? = null,
    val favoriteClub: FavoriteClub? = null,
    @SerialName("userId")
    val userId: String? = null,
    val user: ProfileUser? = null,
)

@Serializable
data class FavoriteClub(
    val clube: String? = null,
)

@Serializable
data class ProfileUser(
    val id: String? = null,
    val name: String? = null,
    val image: String? = null,
    val email: String? = null,
)
