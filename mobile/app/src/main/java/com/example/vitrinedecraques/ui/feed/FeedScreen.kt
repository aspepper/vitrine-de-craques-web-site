package com.example.vitrinedecraques.ui.feed

import android.view.View
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.pager.VerticalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.painter.ColorPainter
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.lifecycle.viewmodel.compose.viewModel
import coil.compose.AsyncImage
import coil.request.ImageRequest
import com.example.vitrinedecraques.R
import com.example.vitrinedecraques.data.model.FeedVideo
import com.example.vitrinedecraques.ui.theme.BrandRed
import com.example.vitrinedecraques.ui.theme.BrandSand
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.AspectRatioFrameLayout
import androidx.media3.ui.PlayerView
import androidx.compose.foundation.ExperimentalFoundationApi

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun FeedScreen(
    modifier: Modifier = Modifier,
    viewModel: FeedViewModel = viewModel(),
) {
    val uiState by viewModel.uiState.collectAsState()
    val pagerState = rememberPagerState(initialPage = 0) { uiState.videos.size.coerceAtLeast(1) }
    val hasVideos = uiState.videos.isNotEmpty()
    val backgroundBrush = remember {
        Brush.verticalGradient(listOf(Color(0xFF1C432A), Color(0xFF0A1510)))
    }

    LaunchedEffect(pagerState.currentPage, uiState.videos.size, uiState.hasMore, uiState.isLoading) {
        if (!hasVideos) return@LaunchedEffect
        val index = pagerState.currentPage.coerceAtMost(uiState.videos.lastIndex)
        if (index >= uiState.videos.lastIndex - 1 && uiState.hasMore && !uiState.isLoading) {
            viewModel.loadMore()
        }
    }

    Box(
        modifier = modifier
            .fillMaxSize()
            .background(backgroundBrush)
    ) {
        when {
            uiState.isLoading && !hasVideos -> {
                CircularProgressIndicator(
                    modifier = Modifier.align(Alignment.Center),
                    color = BrandSand
                )
            }

            uiState.error != null && !hasVideos -> {
                uiState.error?.let { errorMessage ->
                    ErrorState(message = errorMessage, onRetry = viewModel::refresh)
                }
            }

            hasVideos -> {
                val currentPage = pagerState.currentPage
                VerticalPager(
                    state = pagerState,
                    modifier = Modifier.fillMaxSize(),
                    beyondViewportPageCount = 1,
                    key = { index -> uiState.videos[index].id },
                ) { page ->
                    val video = uiState.videos[page]
                    FeedVideoCard(
                        video = video,
                        isActive = page == currentPage,
                    )
                }
            }
        }

        AnimatedVisibility(
            visible = uiState.isLoading && hasVideos,
            enter = fadeIn(),
            exit = fadeOut(),
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 32.dp)
                .navigationBarsPadding()
        ) {
            CircularProgressIndicator(color = BrandSand)
        }
    }
}

@Composable
private fun FeedVideoCard(
    video: FeedVideo,
    isActive: Boolean,
    modifier: Modifier = Modifier,
) {
    val context = LocalContext.current
    var isMuted by remember { mutableStateOf(true) }
    val exoPlayer = remember(video.id) {
        ExoPlayer.Builder(context).build().apply {
            repeatMode = Player.REPEAT_MODE_ONE
            playWhenReady = false
        }
    }
    val mutedState by rememberUpdatedState(isMuted)

    DisposableEffect(exoPlayer, video.id) {
        exoPlayer.setMediaItem(MediaItem.fromUri(video.videoUrl))
        exoPlayer.prepare()
        onDispose { exoPlayer.release() }
    }

    LaunchedEffect(isActive) {
        if (isActive) {
            exoPlayer.playWhenReady = true
            exoPlayer.volume = if (mutedState) 0f else 1f
            if (exoPlayer.playbackState == Player.STATE_IDLE) {
                exoPlayer.prepare()
            }
            exoPlayer.play()
        } else {
            exoPlayer.playWhenReady = false
            exoPlayer.pause()
        }
    }

    LaunchedEffect(mutedState) {
        exoPlayer.volume = if (mutedState) 0f else 1f
    }

    Box(
        modifier = modifier.fillMaxSize()
    ) {
        AsyncImage(
            model = ImageRequest.Builder(context)
                .data(video.thumbnailUrl)
                .crossfade(true)
                .build(),
            contentDescription = null,
            contentScale = ContentScale.Crop,
            modifier = Modifier.fillMaxSize(),
            placeholder = ColorPainter(Color(0xFF0E1F36)),
            error = ColorPainter(Color(0xFF0E1F36)),
            fallback = ColorPainter(Color(0xFF0E1F36))
        )

        AndroidView(
            modifier = Modifier.fillMaxSize(),
            factory = { ctx ->
                PlayerView(ctx).apply {
                    useController = false
                    resizeMode = AspectRatioFrameLayout.RESIZE_MODE_ZOOM
                    player = exoPlayer
                    (videoSurfaceView as? View)?.alpha = 0.98f
                }
            },
            update = { view ->
                if (view.player !== exoPlayer) {
                    view.player = exoPlayer
                }
            }
        )

        VideoOverlay(
            video = video,
            isMuted = isMuted,
            onToggleSound = { isMuted = !isMuted }
        )
    }
}

@Composable
private fun VideoOverlay(
    video: FeedVideo,
    isMuted: Boolean,
    onToggleSound: () -> Unit,
) {
    Box(modifier = Modifier.fillMaxSize()) {
        Box(
            modifier = Modifier
                .matchParentSize()
                .background(
                    Brush.verticalGradient(
                        listOf(Color.Transparent, Color.Black.copy(alpha = 0.72f))
                    )
                )
        )

        Surface(
            modifier = Modifier
                .align(Alignment.TopEnd)
                .statusBarsPadding()
                .padding(top = 16.dp, end = 20.dp),
            shape = CircleShape,
            color = Color.Black.copy(alpha = 0.45f)
        ) {
            IconButton(onClick = { }, modifier = Modifier.size(44.dp)) {
                Icon(
                    painter = painterResource(id = R.drawable.ic_menu),
                    contentDescription = "Abrir menu",
                    tint = Color.White
                )
            }
        }

        Column(
            modifier = Modifier
                .align(Alignment.BottomStart)
                .padding(start = 20.dp, bottom = 36.dp, end = 120.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Row(
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(
                    shape = CircleShape,
                    color = Color.White.copy(alpha = 0.18f),
                    modifier = Modifier.size(60.dp)
                ) {
                    AsyncImage(
                        model = video.user?.profile?.avatarUrl ?: video.user?.image,
                        contentDescription = video.user?.profile?.displayName,
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.fillMaxSize(),
                        placeholder = ColorPainter(Color.Transparent)
                    )
                }
                Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                    Text(
                        text = video.user?.profile?.displayName ?: video.user?.name ?: "Craque",
                        style = MaterialTheme.typography.titleMedium.copy(
                            color = Color.White,
                            fontWeight = FontWeight.SemiBold
                        )
                    )
                    if (!video.title.isNullOrBlank()) {
                        Text(
                            text = video.title,
                            style = MaterialTheme.typography.bodySmall.copy(color = Color.White.copy(alpha = 0.85f)),
                            maxLines = 2,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                }
            }
        }

        Column(
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .padding(end = 20.dp, bottom = 28.dp)
                .navigationBarsPadding(),
            verticalArrangement = Arrangement.spacedBy(18.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            FeedActionButton(
                icon = R.drawable.ic_action_like,
                label = formatCount(video.likesCount ?: 0)
            )
            FeedActionButton(
                icon = R.drawable.ic_action_comment,
                label = "Comentar"
            )
            FeedActionButton(
                icon = R.drawable.ic_action_share,
                label = "Compartilhar"
            )
            FeedActionButton(
                icon = R.drawable.ic_action_save,
                label = "Salvar"
            )
            SoundToggleButton(isMuted = isMuted, onToggleSound = onToggleSound)
            Surface(
                shape = CircleShape,
                color = Color.White.copy(alpha = 0.2f),
                modifier = Modifier.size(64.dp)
            ) {
                AsyncImage(
                    model = video.user?.profile?.avatarUrl ?: video.user?.image,
                    contentDescription = video.user?.profile?.displayName,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize(),
                    placeholder = ColorPainter(Color.Transparent)
                )
            }
        }
    }
}

@Composable
private fun FeedActionButton(
    icon: Int,
    label: String,
    onClick: () -> Unit = {},
) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Surface(
            shape = CircleShape,
            color = Color.Black.copy(alpha = 0.45f)
        ) {
            IconButton(onClick = onClick, modifier = Modifier.size(56.dp)) {
                Icon(
                    painter = painterResource(id = icon),
                    contentDescription = label,
                    tint = Color.White
                )
            }
        }
        Spacer(modifier = Modifier.size(4.dp))
        Text(
            text = label,
            color = Color.White,
            style = MaterialTheme.typography.labelSmall,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
        )
    }
}

@Composable
private fun SoundToggleButton(
    isMuted: Boolean,
    onToggleSound: () -> Unit,
) {
    Surface(
        shape = CircleShape,
        color = Color.Black.copy(alpha = 0.45f)
    ) {
        IconButton(onClick = onToggleSound, modifier = Modifier.size(56.dp)) {
            val icon = if (isMuted) R.drawable.ic_volume_off else R.drawable.ic_volume_on
            Icon(
                painter = painterResource(id = icon),
                contentDescription = if (isMuted) "Ativar som" else "Desativar som",
                tint = Color.White
            )
        }
    }
}

@Composable
private fun ErrorState(message: String, onRetry: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Text(
            text = message,
            textAlign = TextAlign.Center,
            style = MaterialTheme.typography.bodyMedium.copy(color = Color.White)
        )
        Spacer(modifier = Modifier.size(16.dp))
        Surface(
            color = BrandRed,
            shape = RoundedCornerShape(24.dp),
            modifier = Modifier
                .clip(RoundedCornerShape(24.dp))
                .clickable(onClick = onRetry)
        ) {
            Text(
                text = "Tentar novamente",
                modifier = Modifier.padding(horizontal = 20.dp, vertical = 12.dp),
                color = Color.White,
                style = MaterialTheme.typography.labelLarge
            )
        }
    }
}

private fun formatCount(count: Int): String {
    if (count < 1000) return count.toString()
    val suffixes = listOf("K", "M", "B")
    var value = count.toDouble()
    var suffixIndex = 0
    while (value >= 1000 && suffixIndex < suffixes.lastIndex) {
        value /= 1000
        suffixIndex++
    }
    return String.format("%.1f%s", value, suffixes[suffixIndex]).replace(".0", "")
}
