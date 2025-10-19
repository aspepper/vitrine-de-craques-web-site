package com.vitrinedecraques.app.data.auth

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import com.vitrinedecraques.app.data.network.StoredCookie

@Serializable
data class AuthCallbackResponse(
    val status: Int = 0,
    val ok: Boolean = false,
    val url: String? = null,
    val error: String? = null
)

@Serializable
data class CsrfResponse(
    @SerialName("csrfToken")
    val csrfToken: String
)

@Serializable
data class SessionResponse(
    val user: SessionUser? = null,
    val expires: String? = null
)

@Serializable
data class SessionUser(
    val id: String,
    val name: String? = null,
    val email: String? = null,
    val role: String? = null,
    val status: String? = null,
    val blockedReason: String? = null,
    val image: String? = null
)

data class AuthLoginResult(
    val cookies: List<StoredCookie>,
    val session: SessionResponse,
)

class InvalidCredentialsException(message: String) : Exception(message)
