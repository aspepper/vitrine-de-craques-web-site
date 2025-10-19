package com.vitrinedecraques.app.ui

import android.graphics.BitmapFactory
import android.util.Base64
import androidx.annotation.RawRes
import androidx.compose.animation.Crossfade
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.statusBarsPadding
import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import com.vitrinedecraques.app.R
import com.vitrinedecraques.app.BuildConfig
import com.vitrinedecraques.app.ui.feed.FeedScreen
import com.vitrinedecraques.app.ui.auth.AuthViewModel
import com.vitrinedecraques.app.ui.auth.AuthViewModelFactory
import com.vitrinedecraques.app.ui.auth.LoginScreen
import com.vitrinedecraques.app.ui.auth.ProfileSelectionScreen
import androidx.compose.runtime.collectAsState
import androidx.lifecycle.viewmodel.compose.viewModel
import kotlinx.coroutines.delay

private enum class AppDestination {
    Splash,
    Login,
    ProfileSelection,
    Feed,
}

@Composable
fun VitrineDeCraquesApp() {
    val authViewModel: AuthViewModel = viewModel(factory = AuthViewModelFactory)
    val authState by authViewModel.authState.collectAsState()
    val loginState by authViewModel.loginState.collectAsState()
    var destination by rememberSaveable { mutableStateOf(AppDestination.Splash) }
    val context = LocalContext.current
    val baseUrl = remember { BuildConfig.API_BASE_URL.trimEnd('/') }

    LaunchedEffect(authState.isAuthenticated) {
        if (authState.isAuthenticated) {
            destination = AppDestination.Feed
        }
    }

    Crossfade(targetState = destination, label = "AppDestination") { target ->
        when (target) {
            AppDestination.Splash -> SplashScreen(onFinished = {
                destination = if (authState.isAuthenticated) {
                    AppDestination.Feed
                } else {
                    AppDestination.Login
                }
            })
            AppDestination.Login -> LoginScreen(
                loginState = loginState,
                onLogin = authViewModel::login,
                onRegisterClick = { destination = AppDestination.ProfileSelection },
                onForgotPasswordClick = {
                    openExternalUrl(context, "$baseUrl/recuperar-senha")
                },
                onUserInteraction = authViewModel::clearLoginError
            )
            AppDestination.ProfileSelection -> ProfileSelectionScreen(
                baseUrl = baseUrl,
                onBack = { destination = AppDestination.Login }
            )
            AppDestination.Feed -> FeedScreen()
        }
    }
}

private fun openExternalUrl(context: Context, url: String) {
    runCatching {
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url))
        context.startActivity(intent)
    }
}

@Composable
private fun SplashScreen(onFinished: () -> Unit) {
    LaunchedEffect(Unit) {
        delay(2200)
        onFinished()
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.White)
            .statusBarsPadding(),
        contentAlignment = Alignment.Center
    ) {
        val illustration = rememberBase64ImageBitmap(R.raw.splash_illustration_base64)
        val logo = rememberBase64ImageBitmap(R.raw.logo_vitrine_splash_screen_base64)

        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 32.dp, vertical = 40.dp),
            verticalArrangement = Arrangement.spacedBy(48.dp, Alignment.CenterVertically),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Image(
                bitmap = illustration,
                contentDescription = "Ilustração do personagem Tico",
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 8.dp)
                    .aspectRatio(390f / 598f),
                contentScale = ContentScale.FillWidth
            )

            Image(
                bitmap = logo,
                contentDescription = "Logo Vitrine de Craques",
                modifier = Modifier
                    .fillMaxWidth(0.7f)
                    .aspectRatio(1024f / 767f),
                contentScale = ContentScale.FillWidth
            )
        }
    }
}

@Composable
private fun rememberBase64ImageBitmap(@RawRes rawResId: Int): ImageBitmap {
    val context = LocalContext.current
    return remember(rawResId) {
        context.resources.openRawResource(rawResId).use { stream ->
            val base64 = stream.bufferedReader().use { reader ->
                buildString {
                    reader.forEachLine { line ->
                        append(line.trim())
                    }
                }
            }
            val bytes = Base64.decode(base64, Base64.DEFAULT)
            BitmapFactory.decodeByteArray(bytes, 0, bytes.size).asImageBitmap()
        }
    }
}
