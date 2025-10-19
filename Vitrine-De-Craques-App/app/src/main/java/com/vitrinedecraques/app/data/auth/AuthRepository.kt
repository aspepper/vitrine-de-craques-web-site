package com.vitrinedecraques.app.data.auth

import android.content.Context
import com.vitrinedecraques.app.data.network.HttpClientProvider
import com.vitrinedecraques.app.data.network.StoredCookie
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.onEach
import kotlinx.serialization.builtins.ListSerializer
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.emptyPreferences
import com.vitrinedecraques.app.data.auth.authDataStore

data class AuthData(
    val cookies: List<StoredCookie>,
    val user: SessionUser?,
)

private object AuthDataStoreMapper {
    private val json = Json { ignoreUnknownKeys = true }

    fun mapToAuthData(preferences: androidx.datastore.preferences.core.Preferences): AuthData {
        val cookiesJson = preferences[SESSION_COOKIE_KEY]
        val userJson = preferences[SESSION_USER_KEY]
        val cookies = cookiesJson?.let { rawCookiesJson ->
            runCatching {
                json.decodeFromString(ListSerializer(StoredCookie.serializer()), rawCookiesJson)
            }.getOrElse {
                runCatching { json.decodeFromString(StoredCookie.serializer(), rawCookiesJson) }
                    .map { stored -> listOf(stored) }
                    .getOrElse { emptyList() }
            }
        } ?: emptyList()
        val user = userJson?.let { rawUserJson ->
            json.decodeFromString(SessionUser.serializer(), rawUserJson)
        }
        return AuthData(cookies = cookies, user = user)
    }

    suspend fun persist(
        context: Context,
        cookies: List<StoredCookie>,
        user: SessionUser?,
    ) {
        context.authDataStore.edit { prefs ->
            if (cookies.isEmpty()) {
                prefs.remove(SESSION_COOKIE_KEY)
            } else {
                prefs[SESSION_COOKIE_KEY] = json.encodeToString(ListSerializer(StoredCookie.serializer()), cookies)
            }
            if (user != null) {
                prefs[SESSION_USER_KEY] = json.encodeToString(SessionUser.serializer(), user)
            } else {
                prefs.remove(SESSION_USER_KEY)
            }
        }
    }
}

class AuthRepository(
    private val context: Context,
    private val service: AuthApiService = AuthApiService(),
) {
    val authState: Flow<AuthData> = context.authDataStore.data
        .catch { throwable ->
            if (throwable is java.io.IOException) {
                emit(emptyPreferences())
            } else {
                throw throwable
            }
        }
        .map { preferences -> AuthDataStoreMapper.mapToAuthData(preferences) }
        .onEach { data ->
            HttpClientProvider.updateSessionCookies(service.apiBaseUrl, data.cookies)
        }

    suspend fun login(email: String, password: String): Result<Unit> = runCatching {
        val result = service.login(email, password)
        AuthDataStoreMapper.persist(context, result.cookies, result.session.user)
    }

    suspend fun logout() {
        AuthDataStoreMapper.persist(context, emptyList(), null)
        HttpClientProvider.clearSessionCookies()
    }
}
