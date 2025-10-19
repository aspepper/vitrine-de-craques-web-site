package com.vitrinedecraques.app.data.auth

import com.vitrinedecraques.app.BuildConfig
import com.vitrinedecraques.app.data.network.HttpClientProvider
import com.vitrinedecraques.app.data.network.StoredCookie
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.json.Json
import okhttp3.Cookie
import okhttp3.FormBody
import okhttp3.HttpUrl
import okhttp3.HttpUrl.Companion.toHttpUrlOrNull
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.IOException

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

            val cookies = extractSessionCookies(response)
            if (cookies.isEmpty()) {
                throw IOException("Nenhum cookie de sessão retornado pela API.")
            }

            val session = fetchSession()
            if (session.user == null) {
                throw IOException("Sessão inválida retornada pela API.")
            }

            AuthLoginResult(cookies = cookies, session = session)
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

    private fun extractSessionCookies(response: okhttp3.Response): List<StoredCookie> {
        val matched = linkedMapOf<String, StoredCookie>()
        var current: okhttp3.Response? = response
        while (current != null) {
            val requestUrl = current.request.url
            current.headers("Set-Cookie").forEach { header ->
                runCatching { Cookie.parse(requestUrl, header) }
                    .getOrNull()
                    ?.let { cookie ->
                        val lowerName = cookie.name.lowercase()
                        val isSessionCookie = lowerName == "next-auth.session-token" ||
                            lowerName == "__secure-next-auth.session-token" ||
                            lowerName.startsWith("next-auth.session-token.") ||
                            lowerName.startsWith("__secure-next-auth.session-token.")
                        if (isSessionCookie) {
                            val key = listOfNotNull(cookie.name, cookie.path).joinToString("|")
                            matched[key] = cookie.toStoredCookie()
                        }
                    }
            }
            current = current.priorResponse
        }

        if (matched.isNotEmpty()) {
            return matched.values.toList()
        }

        return HttpClientProvider.getSessionCookies(apiBaseUrl)
    }
}

private fun Cookie.toStoredCookie(): StoredCookie {
    val domain = domain.trimStart('.')
    val expiresAt = expiresAt
    return StoredCookie(
        name = name,
        value = value,
        domain = domain,
        path = path,
        expiresAt = if (expiresAt != Long.MAX_VALUE) expiresAt else null,
    )
}
