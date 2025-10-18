package com.vitrinedecraques.app.data.auth

import com.vitrinedecraques.app.BuildConfig
import com.vitrinedecraques.app.data.network.HttpClientProvider
import com.vitrinedecraques.app.data.network.StoredCookie
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.json.Json
import okhttp3.FormBody
import okhttp3.HttpUrl
import okhttp3.HttpUrl.Companion.toHttpUrlOrNull
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.IOException
import java.net.HttpCookie

class AuthApiService(
    private val client: OkHttpClient = HttpClientProvider.client,
    private val json: Json = Json { ignoreUnknownKeys = true; isLenient = true },
    baseUrl: String = BuildConfig.API_BASE_URL,
) {
    val apiBaseUrl: HttpUrl = baseUrl.trim().takeIf { it.isNotEmpty() }
        ?.toHttpUrlOrNull()
        ?.newBuilder()
        ?.build()
        ?: throw IllegalStateException("API_BASE_URL inválida: $baseUrl")

    private val siteOrigin: HttpUrl = apiBaseUrl.newBuilder()
        .encodedPath("/")
        .query(null)
        .fragment(null)
        .build()

    suspend fun login(email: String, password: String): AuthLoginResult = withContext(Dispatchers.IO) {
        val csrfToken = fetchCsrfToken()
        val loginUrl = apiBaseUrl.newBuilder()
            .addPathSegment("api")
            .addPathSegment("auth")
            .addPathSegment("callback")
            .addPathSegment("credentials")
            .addQueryParameter("json", "true")
            .build()

        val formBody = FormBody.Builder()
            .add("csrfToken", csrfToken)
            .add("email", email)
            .add("password", password)
            .add("callbackUrl", siteOrigin.toString())
            .build()

        val request = Request.Builder()
            .url(loginUrl)
            .post(formBody)
            .build()

        client.newCall(request).execute().use { response ->
            val body = response.body?.string().orEmpty()
            if (response.code == 401) {
                throw InvalidCredentialsException("E-mail ou senha inválidos.")
            }
            if (!response.isSuccessful) {
                throw IOException("Erro ${'$'}{response.code} ao fazer login")
            }

            val callback = if (body.isNotBlank()) {
                runCatching { json.decodeFromString<AuthCallbackResponse>(body) }.getOrNull()
            } else null

            if (callback != null && (!callback.ok || callback.error != null)) {
                throw InvalidCredentialsException("E-mail ou senha inválidos.")
            }

            val cookie = extractSessionCookie(response.headers.values("Set-Cookie"))
                ?: throw IOException("Nenhum cookie de sessão retornado pela API.")

            val session = fetchSession()
            if (session.user == null) {
                throw IOException("Sessão inválida retornada pela API.")
            }

            AuthLoginResult(cookie = cookie, session = session)
        }
    }

    suspend fun fetchSession(): SessionResponse = withContext(Dispatchers.IO) {
        val sessionUrl = apiBaseUrl.newBuilder()
            .addPathSegment("api")
            .addPathSegment("auth")
            .addPathSegment("session")
            .build()

        val request = Request.Builder()
            .url(sessionUrl)
            .get()
            .build()

        client.newCall(request).execute().use { response ->
            if (response.code == 401) {
                return@withContext SessionResponse(user = null, expires = null)
            }
            if (!response.isSuccessful) {
                throw IOException("Erro ${'$'}{response.code} ao carregar sessão")
            }
            val body = response.body?.string().orEmpty()
            if (body.isBlank() || body == "null") {
                return@withContext SessionResponse(user = null, expires = null)
            }
            return@withContext json.decodeFromString<SessionResponse>(body)
        }
    }

    private suspend fun fetchCsrfToken(): String = withContext(Dispatchers.IO) {
        val csrfUrl = apiBaseUrl.newBuilder()
            .addPathSegment("api")
            .addPathSegment("auth")
            .addPathSegment("csrf")
            .build()

        val request = Request.Builder()
            .url(csrfUrl)
            .get()
            .build()

        client.newCall(request).execute().use { response ->
            if (!response.isSuccessful) {
                throw IOException("Erro ${'$'}{response.code} ao obter token CSRF")
            }
            val body = response.body?.string().orEmpty()
            if (body.isBlank()) {
                throw IOException("Resposta inválida ao obter token CSRF")
            }
            val csrf = json.decodeFromString<CsrfResponse>(body)
            csrf.csrfToken
        }
    }

    private fun extractSessionCookie(cookieHeaders: List<String>): StoredCookie? {
        cookieHeaders.forEach { header ->
            val parsed = HttpCookie.parse(header)
            val candidate = parsed.firstOrNull { cookie ->
                cookie.name.equals("next-auth.session-token", ignoreCase = true) ||
                    cookie.name.equals("__Secure-next-auth.session-token", ignoreCase = true)
            }
            if (candidate != null) {
                val domain = candidate.domain?.trim('.') ?: apiBaseUrl.host
                val path = candidate.path ?: "/"
                val expiresAt = when {
                    candidate.maxAge >= 0 -> System.currentTimeMillis() + candidate.maxAge * 1000
                    else -> null
                }
                return StoredCookie(
                    name = candidate.name,
                    value = candidate.value,
                    domain = domain,
                    path = path,
                    expiresAt = expiresAt,
                )
            }
        }
        return null
    }
}
