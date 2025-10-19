package com.vitrinedecraques.app.data.auth

import android.util.Log
import com.vitrinedecraques.app.BuildConfig
import com.vitrinedecraques.app.data.network.ApiBaseUrlResolver
import com.vitrinedecraques.app.data.network.HttpClientProvider
import com.vitrinedecraques.app.data.network.SESSION_COOKIE_PREFIXES
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
import kotlin.collections.joinToString

private val COOKIE_DOMAIN_REGEX = Regex("(?i)domain=([^;]+)")

private const val TAG = "AuthApiService"

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

    suspend fun login(email: String, password: String): AuthLoginResult = withContext(Dispatchers.IO) {
        val baseUrl = ApiBaseUrlResolver.resolve(client, json, apiBaseUrl)
        val siteOrigin = baseUrl.toOrigin()

        val cookiesBeforeLogin = HttpClientProvider.getSessionCookies(baseUrl)
        Log.i(TAG, "Cookies antes do login: ${cookiesBeforeLogin.describeCookies()}")

        val csrfToken = fetchCsrfToken(baseUrl)
        Log.i(TAG, "CSRF token carregado (${csrfToken.length} chars) para host=${baseUrl.host}")
        Log.i(
            TAG,
            "Cookies após obter CSRF: ${HttpClientProvider.getSessionCookies(baseUrl).describeCookies()}"
        )
        val loginUrl = baseUrl.newBuilder()
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

        Log.i(TAG, "Enviando login POST para $loginUrl")
        client.newCall(request).execute().use { response ->
            val body = response.body?.string().orEmpty()
            logLoginResponseChain(response)
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

            detectNextAuthError(response)?.let { errorCode ->
                throw mapNextAuthError(errorCode)
            }

            val cookies = extractSessionCookies(response, baseUrl)
            Log.i(TAG, "Cookies de sessão extraídos: ${cookies.describeCookies()}")
            if (cookies.isEmpty()) {
                Log.e(
                    TAG,
                    "Nenhum cookie de sessão encontrado. set-cookie-final=${response.headers("Set-Cookie").maskCookieHeaders()} " +
                        "cookiesJar=${HttpClientProvider.getSessionCookies(baseUrl).describeCookies()} bodyPreview=${body.truncateForLog()}"
                )
                throw IOException("Nenhum cookie de sessão retornado pela API.")
            }

            val session = fetchSession(baseUrl)
            Log.i(TAG, "Sessão carregada: user=${session.user?.email ?: "null"} expires=${session.expires}")
            if (session.user == null) {
                throw IOException("Sessão inválida retornada pela API.")
            }

            AuthLoginResult(cookies = cookies, session = session)
        }
    }

    suspend fun fetchSession(baseUrl: HttpUrl? = null): SessionResponse = withContext(Dispatchers.IO) {
        val resolvedBaseUrl = baseUrl ?: ApiBaseUrlResolver.resolve(client, json, apiBaseUrl)
        val sessionUrl = resolvedBaseUrl.newBuilder()
            .addPathSegment("api")
            .addPathSegment("auth")
            .addPathSegment("session")
            .build()

        val request = Request.Builder()
            .url(sessionUrl)
            .get()
            .build()

        Log.i(TAG, "Buscando sessão em ${request.url}")
        client.newCall(request).execute().use { response ->
            Log.i(TAG, "Resposta da sessão: code=${response.code} bodyLength=${response.body?.contentLength() ?: -1}")
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

    private suspend fun fetchCsrfToken(baseUrl: HttpUrl): String = withContext(Dispatchers.IO) {
        val csrfUrl = baseUrl.newBuilder()
            .addPathSegment("api")
            .addPathSegment("auth")
            .addPathSegment("csrf")
            .build()

        val request = Request.Builder()
            .url(csrfUrl)
            .get()
            .build()

        Log.i(TAG, "Buscando CSRF token em ${request.url}")
        client.newCall(request).execute().use { response ->
            Log.i(TAG, "Resposta do CSRF: code=${response.code} bodyLength=${response.body?.contentLength() ?: -1}")
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

    private fun extractSessionCookies(response: okhttp3.Response, baseUrl: HttpUrl): List<StoredCookie> {
        val matched = linkedMapOf<String, StoredCookie>()
        var current: okhttp3.Response? = response
        while (current != null) {
            val requestUrl = current.request.url
            current.headers("Set-Cookie").forEach { header ->
                val cookie = runCatching { Cookie.parse(requestUrl, header) }.getOrNull()
                if (cookie != null) {
                    if (cookie.name.isSessionCookieName()) {
                        val key = listOfNotNull(cookie.name, cookie.path).joinToString("|")
                        matched[key] = cookie.toStoredCookie()
                        Log.i(
                            TAG,
                            "Cookie de sessão capturado da resposta ${current.code}: ${cookie.name} domínio=${cookie.domain} path=${cookie.path}"
                        )
                    } else {
                        Log.d(
                            TAG,
                            "Set-Cookie ignorado por não corresponder aos prefixos conhecidos: nome=${cookie.name} domínio=${cookie.domain} path=${cookie.path}"
                        )
                    }
                } else {
                    val masked = listOf(header).maskCookieHeaders().joinToString()
                    val domainAttr = COOKIE_DOMAIN_REGEX.find(header)?.groupValues?.getOrNull(1)?.trim()
                    Log.w(
                        TAG,
                        "Set-Cookie ignorado para host=${requestUrl.host}: header=${masked} domainAttr=${domainAttr ?: "<nenhum>"}"
                    )
                }
            }
            current = current.priorResponse
        }

        if (matched.isNotEmpty()) {
            return matched.values.toList()
        }

        val fallback = HttpClientProvider.getSessionCookies(baseUrl)
        Log.i(TAG, "Cookies obtidos do cookie jar: ${fallback.describeCookies()}")
        return fallback
    }

    suspend fun resolvedApiBaseUrl(): HttpUrl = ApiBaseUrlResolver.resolve(client, json, apiBaseUrl)
}

private fun logLoginResponseChain(response: okhttp3.Response) {
    var index = 0
    var current: okhttp3.Response? = response
    while (current != null) {
        val label = if (index == 0) "final" else "redirect#$index"
        Log.i(
            TAG,
            "Resposta ${label}: code=${current.code} url=${current.request.url} " +
                "setCookie=${current.headers("Set-Cookie").maskCookieHeaders()}"
        )
        current = current.priorResponse
        index += 1
    }
}

private fun detectNextAuthError(response: okhttp3.Response): String? {
    var current: okhttp3.Response? = response
    while (current != null) {
        val errorParam = current.request.url.queryParameter("error")
        if (errorParam != null) {
            return errorParam
        }
        current = current.priorResponse
    }
    return null
}

private fun mapNextAuthError(errorCode: String): Exception {
    return when (errorCode) {
        "CredentialsSignin" -> InvalidCredentialsException("E-mail ou senha inválidos.")
        else -> IOException("Falha no login: código de erro '${'$'}errorCode'.")
    }
}

private fun List<String>.maskCookieHeaders(): List<String> = map { header ->
    val parts = header.split(';')
    if (parts.isEmpty()) return@map header
    val nameValue = parts.first()
    val idx = nameValue.indexOf('=')
    if (idx == -1) {
        header
    } else {
        val masked = nameValue.substring(0, idx + 1) + "***"
        (listOf(masked) + parts.drop(1)).joinToString(";")
    }
}

private fun String.truncateForLog(limit: Int = 512): String {
    if (isEmpty()) return ""
    return if (length <= limit) this else substring(0, limit) + "…"
}

private fun HttpUrl.toOrigin(): HttpUrl = newBuilder()
    .encodedPath("/")
    .query(null)
    .fragment(null)
    .build()

private fun List<StoredCookie>.describeCookies(): String = if (isEmpty()) {
    "nenhum"
} else {
    joinToString { cookie ->
        "${'$'}{cookie.name}@${'$'}{cookie.domain}${'$'}{cookie.path}"
    }
}

private fun String.isSessionCookieName(): Boolean {
    val lowerName = lowercase()
    return SESSION_COOKIE_PREFIXES.any { prefix ->
        val lowerPrefix = prefix.lowercase()
        lowerName == lowerPrefix || lowerName.startsWith("${'$'}{lowerPrefix}.")
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
