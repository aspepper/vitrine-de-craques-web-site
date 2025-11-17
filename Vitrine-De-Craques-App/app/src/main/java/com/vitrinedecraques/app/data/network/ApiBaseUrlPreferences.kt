package com.vitrinedecraques.app.data.network

import android.content.Context
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore

private const val API_BASE_URL_DATA_STORE = "api_base_url"

val Context.apiBaseUrlDataStore by preferencesDataStore(name = API_BASE_URL_DATA_STORE)

internal val RESOLVED_BASE_URL_KEY = stringPreferencesKey("resolved_api_base_url")
