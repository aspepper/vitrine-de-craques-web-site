package com.vitrinedecraques.app.data.network

import okhttp3.JavaNetCookieJar
import okhttp3.OkHttpClient
import okhttp3.HttpUrl
import java.net.CookieManager
import java.net.CookiePolicy
import java.net.HttpCookie
import java.util.concurrent.TimeUnit
import kotlinx.serialization.Serializable

/**
 * Provides a shared [OkHttpClient] instance configured with a cookie jar so that
 * authentication cookies obtained during login can be reused across requests.
 */
object HttpClientProvider {
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

    private val sessionCookiePrefixes = listOf(
        "next-auth.session-token",
        "__Secure-next-auth.session-token",
    )

    fun updateSessionCookies(baseUrl: HttpUrl, cookies: List<StoredCookie>) {
        val uri = baseUrl.toUri()
        val store = cookieManager.cookieStore
        val existing = store.cookies.filter { cookie ->
            sessionCookiePrefixes.any { prefix ->
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
    }

    fun clearSessionCookies() {
        val store = cookieManager.cookieStore
        val iterator = store.cookies.iterator()
        while (iterator.hasNext()) {
            val cookie = iterator.next()
            val matchesPrefix = sessionCookiePrefixes.any { prefix ->
                cookie.name.equals(prefix, ignoreCase = true) ||
                    cookie.name.startsWith("${prefix}.", ignoreCase = true)
            }
            if (matchesPrefix) {
                iterator.remove()
            }
        }
    }
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
