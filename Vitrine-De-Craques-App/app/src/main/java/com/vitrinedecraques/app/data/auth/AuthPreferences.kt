package com.vitrinedecraques.app.data.auth

import android.content.Context
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore

private const val AUTH_DATA_STORE_NAME = "auth_preferences"

val Context.authDataStore by preferencesDataStore(name = AUTH_DATA_STORE_NAME)

internal val SESSION_COOKIE_KEY = stringPreferencesKey("session_cookie")
internal val SESSION_USER_KEY = stringPreferencesKey("session_user")
