package com.vitrinedecraques.app.data.network

import android.util.Log
import okhttp3.JavaNetCookieJar
import okhttp3.OkHttpClient
import okhttp3.HttpUrl
import java.net.CookieManager
import java.net.CookiePolicy
import java.net.HttpCookie
import java.util.LinkedHashMap
import java.util.concurrent.TimeUnit
import kotlinx.serialization.Serializable

internal val SESSION_COOKIE_PREFIXES = listOf(
    "next-auth.session-token",
    "__Secure-next-auth.session-token",
    "authjs.session-token",
    "__Secure-authjs.session-token",
)

/**
 * Provides a shared [OkHttpClient] instance configured with a cookie jar so that
 * authentication cookies obtained during login can be reused across requests.
 */
object HttpClientProvider {
    private const val TAG = "HttpClientProvider"
    private val cookieManager = CookieManager().apply {
        setCookiePolicy(CookiePolicy.ACCEPT_ALL)
    }

    private val cookieJar = JavaNetCookieJar(cookieManager)

    val client: OkHttpClient by lazy {
        OkHttpClient.Builder()
            .cookieJar(cookieJar)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .build()
    }

    fun getSessionCookies(baseUrl: HttpUrl): List<StoredCookie> {
        val store = cookieManager.cookieStore
        val targetHost = baseUrl.host
        val matched = LinkedHashMap<String, StoredCookie>()

        store.cookies
            .asSequence()
            .filter { cookie ->
                SESSION_COOKIE_PREFIXES.any { prefix ->
                    cookie.name.equals(prefix, ignoreCase = true) ||
                        cookie.name.startsWith("${prefix}.", ignoreCase = true)
                }
            }
            .filterNot { cookie -> cookie.hasExpired() }
            .filter { cookie ->
                val domain = cookie.domain?.takeIf { it.isNotBlank() } ?: targetHost
                HttpCookie.domainMatches(domain, targetHost)
            }
            .sortedByDescending { cookie -> cookie.maxAge }
            .forEach { cookie ->
                val key = listOfNotNull(cookie.name, cookie.path).joinToString("|")
                matched[key] = cookie.toStoredCookie(baseUrl)
        }

        return matched.values.toList().also { cookies ->
            Log.i(TAG, "getSessionCookies host=${baseUrl.host} -> ${cookies.describeCookies()}")
        }
    }

    fun updateSessionCookies(baseUrl: HttpUrl, cookies: List<StoredCookie>) {
        val uri = baseUrl.toUri()
        val store = cookieManager.cookieStore
        val existing = store.cookies.filter { cookie ->
            SESSION_COOKIE_PREFIXES.any { prefix ->
                cookie.name.equals(prefix, ignoreCase = true) ||
                    cookie.name.startsWith("${prefix}.", ignoreCase = true)
            }
        }
        existing.forEach { store.remove(uri, it) }

        cookies.forEach { cookie ->
            val httpCookie = HttpCookie(cookie.name, cookie.value).apply {
                domain = cookie.domain
                path = cookie.path
                cookie.expiresAt?.let { expiresAt ->
                    val deltaSeconds = ((expiresAt - System.currentTimeMillis()) / 1000).coerceAtLeast(0)
                    if (deltaSeconds > 0) {
                        maxAge = deltaSeconds
                    }
                }
            }
            store.add(uri, httpCookie)
        }
        Log.i(TAG, "updateSessionCookies host=${baseUrl.host} -> ${cookies.describeCookies()}")
    }

    fun clearSessionCookies() {
        val store = cookieManager.cookieStore
        val iterator = store.cookies.iterator()
        while (iterator.hasNext()) {
            val cookie = iterator.next()
            val matchesPrefix = SESSION_COOKIE_PREFIXES.any { prefix ->
                cookie.name.equals(prefix, ignoreCase = true) ||
                    cookie.name.startsWith("${prefix}.", ignoreCase = true)
            }
            if (matchesPrefix) {
                iterator.remove()
            }
        }
        Log.i(TAG, "clearSessionCookies executado")
    }
}

fun HttpCookie.toStoredCookie(baseUrl: HttpUrl): StoredCookie {
    val domain = domain?.takeIf { it.isNotBlank() }?.trim('.') ?: baseUrl.host
    val path = path ?: "/"
    val expiresAt = when {
        maxAge >= 0 -> System.currentTimeMillis() + maxAge * 1000
        else -> null
    }
    return StoredCookie(
        name = name,
        value = value,
        domain = domain,
        path = path,
        expiresAt = expiresAt,
    )
}

/**
 * Serialized representation of an authentication cookie, allowing us to persist
 * it and restore it when the application restarts.
 */
@Serializable
data class StoredCookie(
    val name: String,
    val value: String,
    val domain: String,
    val path: String,
    val expiresAt: Long?
)

private fun List<StoredCookie>.describeCookies(): String = if (isEmpty()) {
    "nenhum"
} else {
    joinToString { cookie ->
        "${'$'}{cookie.name}@${'$'}{cookie.domain}${'$'}{cookie.path}"
    }
}
