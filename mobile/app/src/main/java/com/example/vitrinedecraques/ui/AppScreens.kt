package com.example.vitrinedecraques.ui

import androidx.compose.animation.Crossfade
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.rounded.PlayArrow
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.vitrinedecraques.ui.feed.FeedScreen
import com.example.vitrinedecraques.ui.theme.BrandDark
import com.example.vitrinedecraques.ui.theme.BrandRed
import kotlinx.coroutines.delay

private enum class AppDestination {
    Splash,
    Feed,
}

@Composable
private fun SplashIllustration(modifier: Modifier = Modifier) {
    Box(
        modifier = modifier
            .fillMaxSize()
            .aspectRatio(0.88f)
    ) {
        Canvas(modifier = Modifier.matchParentSize()) {
            val width = size.width
            val height = size.height
            drawRoundRect(
                brush = Brush.linearGradient(
                    listOf(Color(0xFF111C3A), Color(0xFF1B2C5B))
                ),
                topLeft = Offset.Zero,
                size = Size(width, height * 0.92f),
                cornerRadius = CornerRadius(width * 0.18f)
            )
            drawCircle(
                brush = Brush.radialGradient(
                    colors = listOf(Color(0xFF4A83FF), Color.Transparent)
                ),
                radius = width * 0.42f,
                center = Offset(width * 0.28f, height * 0.38f)
            )
            drawCircle(
                brush = Brush.radialGradient(
                    colors = listOf(Color(0xFFFAC744), Color.Transparent)
                ),
                radius = width * 0.26f,
                center = Offset(width * 0.78f, height * 0.26f)
            )
            drawCircle(
                color = Color.White.copy(alpha = 0.12f),
                radius = width * 0.22f,
                center = Offset(width * 0.72f, height * 0.72f)
            )
        }

        Surface(
            modifier = Modifier
                .align(Alignment.Center)
                .size(width = 220.dp, height = 320.dp),
            shape = RoundedCornerShape(42.dp),
            color = Color.White.copy(alpha = 0.08f),
            tonalElevation = 0.dp
        ) {
            Box(
                modifier = Modifier
                    .padding(18.dp)
                    .background(
                        Brush.verticalGradient(
                            listOf(Color(0xFF091427), Color(0xFF122E4F))
                        ),
                        shape = RoundedCornerShape(32.dp)
                    )
            ) {
                Surface(
                    modifier = Modifier
                        .align(Alignment.Center)
                        .size(96.dp),
                    shape = CircleShape,
                    color = Color.White.copy(alpha = 0.18f)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(
                            imageVector = Icons.Rounded.PlayArrow,
                            contentDescription = null,
                            tint = Color.White,
                            modifier = Modifier.size(48.dp)
                        )
                    }
                }

                Row(
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .padding(bottom = 18.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    repeat(3) { index ->
                        val alpha = when (index) {
                            0 -> 0.95f
                            1 -> 0.55f
                            else -> 0.35f
                        }
                        Surface(
                            shape = CircleShape,
                            color = Color.White.copy(alpha = alpha),
                            modifier = Modifier.size(10.dp)
                        ) {}
                    }
                }
            }
        }
    }
}

@Composable
private fun SplashBrandSignature(modifier: Modifier = Modifier) {
    Column(
        modifier = modifier,
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        Text(
            text = "vitrine de",
            style = MaterialTheme.typography.titleSmall.copy(
                color = BrandDark.copy(alpha = 0.72f),
                letterSpacing = 4.sp
            ),
            textAlign = TextAlign.Center
        )
        Text(
            text = "CRAQUES",
            style = MaterialTheme.typography.headlineSmall.copy(
                color = BrandDark,
                fontWeight = FontWeight.Bold,
                letterSpacing = 6.sp
            ),
            textAlign = TextAlign.Center
        )
        Box(
            modifier = Modifier
                .padding(top = 12.dp)
                .size(width = 140.dp, height = 4.dp)
                .background(BrandRed, RoundedCornerShape(6.dp))
        )
    }
}

@Composable
fun VitrineDeCraquesApp() {
    var destination by rememberSaveable { mutableStateOf(AppDestination.Splash) }

    Crossfade(targetState = destination, label = "AppDestination") { target ->
        when (target) {
            AppDestination.Splash -> SplashScreen(onFinished = { destination = AppDestination.Feed })
            AppDestination.Feed -> FeedScreen()
        }
    }
}

@Composable
private fun SplashScreen(onFinished: () -> Unit) {
    LaunchedEffect(Unit) {
        delay(2200)
        onFinished()
    }

    val backgroundBrush = remember {
        Brush.verticalGradient(listOf(Color(0xFFF5D7A3), Color.White))
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(backgroundBrush)
            .statusBarsPadding(),
        contentAlignment = Alignment.Center
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 32.dp, vertical = 48.dp),
            verticalArrangement = Arrangement.SpaceBetween,
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = "TICO",
                style = MaterialTheme.typography.headlineLarge.copy(
                    color = BrandDark,
                    fontWeight = FontWeight.Black,
                    letterSpacing = 8.sp
                )
            )
            Spacer(modifier = Modifier.size(12.dp))
            SplashIllustration(
                modifier = Modifier
                    .weight(1f, fill = true)
                    .fillMaxSize()
            )
            Spacer(modifier = Modifier.size(28.dp))
            SplashBrandSignature()
        }
    }
}
