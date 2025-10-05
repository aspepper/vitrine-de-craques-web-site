package com.example.vitrinedecraques.ui.feed

import android.view.View
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.runtime.snapshotFlow
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.graphics.painter.ColorPainter
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
import kotlinx.coroutines.flow.collectLatest
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.AspectRatioFrameLayout
import androidx.media3.ui.PlayerView

@Composable
fun FeedScreen(
    modifier: Modifier = Modifier,
    viewModel: FeedViewModel = viewModel(),
) {
    val uiState by viewModel.uiState.collectAsState()
    val listState = rememberLazyListState()
    var activeIndex by remember { mutableIntStateOf(0) }

    LaunchedEffect(listState, uiState.videos.size) {
        snapshotFlow { listState.firstVisibleItemIndex }
            .collectLatest { index ->
                activeIndex = index
                if (index >= uiState.videos.lastIndex - 1 && uiState.hasMore && !uiState.isLoading) {
                    viewModel.loadMore()
                }
            }
    }

    val backgroundBrush = remember {
        Brush.verticalGradient(listOf(Color(0xFF1C432A), Color(0xFF0A1510)))
    }

    Scaffold(
        modifier = modifier
            .fillMaxSize()
            .background(backgroundBrush),
        containerColor = Color.Transparent,
        topBar = { FeedTopBar() },
        bottomBar = { FeedBottomBar() }
    ) { padding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .background(backgroundBrush)
        ) {
            when {
                uiState.isLoading && uiState.videos.isEmpty() -> {
                    CircularProgressIndicator(
                        modifier = Modifier.align(Alignment.Center),
                        color = BrandSand
                    )
                }

                uiState.error != null && uiState.videos.isEmpty() -> {
                    uiState.error?.let { errorMessage ->
                        ErrorState(message = errorMessage, onRetry = viewModel::refresh)
                    }
                }

                else -> {
                    LazyColumn(
                        modifier = Modifier.fillMaxSize(),
                        state = listState,
                        verticalArrangement = Arrangement.spacedBy(24.dp),
                        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 16.dp)
                    ) {
                        itemsIndexed(uiState.videos) { index, video ->
                            FeedVideoCard(
                                video = video,
                                isActive = index == activeIndex,
                            )
                        }

                        item {
                            AnimatedVisibility(
                                visible = uiState.isLoading && uiState.videos.isNotEmpty(),
                                enter = fadeIn(),
                                exit = fadeOut()
                            ) {
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(vertical = 16.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    CircularProgressIndicator(color = BrandSand)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun FeedTopBar() {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .statusBarsPadding()
            .padding(horizontal = 24.dp, vertical = 12.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
            Text(
                text = "Vitrine de Craques",
                style = MaterialTheme.typography.titleMedium.copy(
                    color = Color.White,
                    fontWeight = FontWeight.SemiBold
                )
            )
            Text(
                text = "Descubra novos talentos",
                style = MaterialTheme.typography.bodySmall.copy(color = Color.White.copy(alpha = 0.8f))
            )
        }
        Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            IconButton(onClick = { }) {
                Icon(
                    painter = painterResource(id = R.drawable.ic_action_share),
                    contentDescription = "Compartilhar",
                    tint = Color.White
                )
            }
            Box {
                IconButton(onClick = { }) {
                    Icon(
                        painter = painterResource(id = R.drawable.ic_nav_inbox),
                        contentDescription = "Mensagens",
                        tint = Color.White
                    )
                }
                Image(
                    painter = painterResource(id = R.drawable.ic_notification_dot),
                    contentDescription = null,
                    modifier = Modifier
                        .size(12.dp)
                        .align(Alignment.TopEnd)
                        .offset(x = (-4).dp, y = 6.dp)
                )
            }
        }
    }
}

@Composable
private fun FeedBottomBar() {
    val activeColor = BrandSand
    val inactiveColor = Color.White.copy(alpha = 0.6f)
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .navigationBarsPadding()
            .padding(horizontal = 32.dp, vertical = 20.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        BottomBarItem(icon = R.drawable.ic_nav_home, label = "Home", isActive = true, activeColor = activeColor, inactiveColor = inactiveColor)
        BottomBarItem(icon = R.drawable.ic_nav_search, label = "Buscar", isActive = false, activeColor = activeColor, inactiveColor = inactiveColor)
        BottomBarItem(icon = R.drawable.ic_nav_add, label = "Criar", isActive = false, activeColor = activeColor, inactiveColor = inactiveColor)
        BottomBarItem(icon = R.drawable.ic_nav_inbox, label = "Inbox", isActive = false, activeColor = activeColor, inactiveColor = inactiveColor)
        BottomBarItem(icon = R.drawable.ic_nav_profile, label = "Perfil", isActive = false, activeColor = activeColor, inactiveColor = inactiveColor)
    }
}

@Composable
private fun BottomBarItem(
    icon: Int,
    label: String,
    isActive: Boolean,
    activeColor: Color,
    inactiveColor: Color,
) {
    val tint = if (isActive) activeColor else inactiveColor
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Surface(
            modifier = Modifier.size(48.dp),
            shape = CircleShape,
            color = if (isActive) Color.White.copy(alpha = 0.12f) else Color.Transparent
        ) {
            Box(contentAlignment = Alignment.Center) {
                Icon(
                    painter = painterResource(id = icon),
                    contentDescription = label,
                    tint = tint
                )
            }
        }
        Spacer(modifier = Modifier.height(4.dp))
        Text(
            text = label,
            color = tint,
            style = MaterialTheme.typography.labelSmall
        )
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
        modifier = modifier
            .fillMaxWidth()
            .aspectRatio(9f / 16f)
            .clip(RoundedCornerShape(32.dp))
            .shadow(20.dp, RoundedCornerShape(32.dp))
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

        Column(
            modifier = Modifier
                .align(Alignment.BottomStart)
                .padding(start = 20.dp, bottom = 28.dp, end = 20.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Row(
                horizontalArrangement = Arrangement.spacedBy(12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Surface(
                    shape = CircleShape,
                    color = Color.White.copy(alpha = 0.18f),
                    modifier = Modifier.size(52.dp)
                ) {
                    AsyncImage(
                        model = video.user?.profile?.avatarUrl ?: video.user?.image,
                        contentDescription = video.user?.profile?.displayName,
                        contentScale = ContentScale.Crop,
                        modifier = Modifier.fillMaxSize()
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

            Row(
                horizontalArrangement = Arrangement.spacedBy(16.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                ActionChip(icon = R.drawable.ic_action_like, label = formatCount(video.likesCount ?: 0))
                ActionChip(icon = R.drawable.ic_action_comment, label = "Comente")
                ActionChip(icon = R.drawable.ic_action_share, label = "Compartilhar")
            }
        }

        Surface(
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .padding(end = 24.dp, bottom = 32.dp),
            shape = CircleShape,
            color = Color.Black.copy(alpha = 0.45f)
        ) {
            IconButton(onClick = onToggleSound, modifier = Modifier.size(52.dp)) {
                val icon = if (isMuted) R.drawable.ic_volume_off else R.drawable.ic_volume_on
                Icon(
                    painter = painterResource(id = icon),
                    contentDescription = if (isMuted) "Ativar som" else "Desativar som",
                    tint = Color.White
                )
            }
        }
    }
}

@Composable
private fun ActionChip(icon: Int, label: String) {
    Surface(
        color = Color.Black.copy(alpha = 0.55f),
        shape = RoundedCornerShape(20.dp)
    ) {
        Row(
            modifier = Modifier.padding(horizontal = 12.dp, vertical = 8.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                painter = painterResource(id = icon),
                contentDescription = label,
                tint = Color.White
            )
            Text(
                text = label,
                style = MaterialTheme.typography.labelMedium.copy(color = Color.White)
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
        Spacer(modifier = Modifier.height(16.dp))
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
