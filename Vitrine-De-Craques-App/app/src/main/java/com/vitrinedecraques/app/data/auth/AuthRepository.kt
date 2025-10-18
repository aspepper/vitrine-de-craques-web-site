package com.vitrinedecraques.app.data.auth

import android.content.Context
import com.vitrinedecraques.app.data.network.HttpClientProvider
import com.vitrinedecraques.app.data.network.StoredCookie
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.catch
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.onEach
import kotlinx.serialization.decodeFromString
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.emptyPreferences
import com.vitrinedecraques.app.data.auth.authDataStore

data class AuthData(
    val cookie: StoredCookie?,
    val user: SessionUser?
)

private object AuthDataStoreMapper {
    private val json = Json { ignoreUnknownKeys = true }

    fun mapToAuthData(preferences: androidx.datastore.preferences.core.Preferences): AuthData {
        val cookieJson = preferences[SESSION_COOKIE_KEY]
        val userJson = preferences[SESSION_USER_KEY]
        val cookie = cookieJson?.let { json.decodeFromString(StoredCookie.serializer(), it) }
        val user = userJson?.let { json.decodeFromString(SessionUser.serializer(), it) }
        return AuthData(cookie = cookie, user = user)
    }

    suspend fun persist(
        context: Context,
        cookie: StoredCookie?,
        user: SessionUser?,
    ) {
        context.authDataStore.edit { prefs ->
            if (cookie != null) {
                prefs[SESSION_COOKIE_KEY] = json.encodeToString(StoredCookie.serializer(), cookie)
            } else {
                prefs.remove(SESSION_COOKIE_KEY)
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
            HttpClientProvider.updateSessionCookie(service.apiBaseUrl, data.cookie)
        }

    suspend fun login(email: String, password: String): Result<Unit> = runCatching {
        val result = service.login(email, password)
        AuthDataStoreMapper.persist(context, result.cookie, result.session.user)
    }

    suspend fun logout() {
        AuthDataStoreMapper.persist(context, null, null)
        HttpClientProvider.clearSessionCookies()
    }
}
