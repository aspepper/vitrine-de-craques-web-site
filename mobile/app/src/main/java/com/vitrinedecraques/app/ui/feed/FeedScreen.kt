package com.vitrinedecraques.app.ui.feed

import android.graphics.BitmapFactory
import android.util.Base64
import android.view.View
import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateContentSize
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.tween
import androidx.compose.animation.core.AnimationSpec
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.BoxScope
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxHeight
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.foundation.layout.offset
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.pager.VerticalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.AccountBalance
import androidx.compose.material.icons.outlined.Article
import androidx.compose.material.icons.outlined.Flag
import androidx.compose.material.icons.outlined.Groups
import androidx.compose.material.icons.outlined.Info
import androidx.compose.material.icons.outlined.Lock
import androidx.compose.material.icons.outlined.PersonSearch
import androidx.compose.material.icons.outlined.PlayCircle
import androidx.compose.material.icons.outlined.Public
import androidx.compose.material.icons.outlined.Share
import androidx.compose.material.icons.outlined.SportsEsports
import androidx.compose.material.icons.outlined.SportsSoccer
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DrawerValue
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.ModalDrawerSheet
import androidx.compose.material3.ModalNavigationDrawer
import androidx.compose.material3.rememberDrawerState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.rememberUpdatedState
import androidx.compose.runtime.snapshotFlow
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.vector.ImageVector
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
import com.vitrinedecraques.app.R
import com.vitrinedecraques.app.data.model.FeedVideo
import com.vitrinedecraques.app.ui.theme.BrandRed
import com.vitrinedecraques.app.ui.theme.BrandSand
import androidx.lifecycle.Lifecycle
import androidx.lifecycle.LifecycleEventObserver
import androidx.lifecycle.compose.LocalLifecycleOwner
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.AspectRatioFrameLayout
import androidx.media3.ui.PlayerView
import androidx.compose.foundation.ExperimentalFoundationApi
import kotlinx.coroutines.launch

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
    val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
    val coroutineScope = rememberCoroutineScope()
    var selectedBottomItem by remember { mutableStateOf(FeedBottomNavItem.Home) }
    val lifecycleOwner = LocalLifecycleOwner.current

    DisposableEffect(lifecycleOwner) {
        val observer = LifecycleEventObserver { _, event ->
            if (event == Lifecycle.Event.ON_RESUME) {
                viewModel.checkForUpdates()
            }
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose {
            lifecycleOwner.lifecycle.removeObserver(observer)
        }
    }

    LaunchedEffect(uiState.lastViewedVideoId, uiState.videos) {
        val targetId = uiState.lastViewedVideoId ?: return@LaunchedEffect
        val targetIndex = uiState.videos.indexOfFirst { it.id == targetId }
        if (targetIndex >= 0 && targetIndex != pagerState.currentPage) {
            pagerState.scrollToPage(targetIndex)
        }
    }

    LaunchedEffect(pagerState) {
        snapshotFlow {
            PagerSnapshot(
                page = pagerState.currentPage,
                videos = uiState.videos,
                hasMore = uiState.hasMore,
                isLoading = uiState.isLoading,
            )
        }.collect { snapshot ->
            val videos = snapshot.videos
            if (videos.isEmpty()) return@collect
            val boundedIndex = snapshot.page.coerceIn(0, videos.lastIndex)
            val currentVideo = videos.getOrNull(boundedIndex)
            if (currentVideo != null) {
                viewModel.updateLastViewedVideo(currentVideo.id)
            }
            if (
                snapshot.hasMore &&
                !snapshot.isLoading &&
                boundedIndex >= (videos.lastIndex - 1).coerceAtLeast(0)
            ) {
                viewModel.loadMore()
            }
        }
    }

    ModalNavigationDrawer(
        drawerState = drawerState,
        drawerContent = {
            FeedNavigationDrawer(
                onItemSelected = {
                    coroutineScope.launch { drawerState.close() }
                },
                onSocialSelected = {
                    coroutineScope.launch { drawerState.close() }
                }
            )
        },
        gesturesEnabled = true
    ) {
        Column(
            modifier = modifier
                .fillMaxSize()
                .background(backgroundBrush)
        ) {
            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
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
                                onMenuClick = {
                                    coroutineScope.launch { drawerState.open() }
                                }
                            )
                        }
                    }
                }

                AnimatedVisibility(
                    visible = uiState.showNewVideosBanner,
                    modifier = Modifier
                        .align(Alignment.TopCenter)
                        .statusBarsPadding()
                        .padding(top = 88.dp)
                ) {
                    NewVideosBanner(
                        count = uiState.pendingNewVideos.size,
                        onClick = viewModel::revealPendingNewVideos,
                    )
                }

                LoadingIndicator(
                    visible = uiState.isLoading && hasVideos,
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .padding(bottom = 32.dp)
                        .navigationBarsPadding()
                )
            }

            FeedBottomNavigation(
                selectedItem = selectedBottomItem,
                onItemSelected = { selectedBottomItem = it },
            )
        }
    }
}

private data class PagerSnapshot(
    val page: Int,
    val videos: List<FeedVideo>,
    val hasMore: Boolean,
    val isLoading: Boolean,
)

@Composable
private fun BoxScope.LoadingIndicator(
    visible: Boolean,
    modifier: Modifier = Modifier,
    animationSpec: AnimationSpec<Float> = tween(durationMillis = 200),
) {
    val alpha by animateFloatAsState(
        targetValue = if (visible) 1f else 0f,
        animationSpec = animationSpec,
        label = "loadingIndicatorAlpha"
    )

    if (alpha > 0f) {
        CircularProgressIndicator(
            color = BrandSand,
            modifier = modifier.alpha(alpha)
        )
    }
}

@Composable
private fun NewVideosBanner(
    count: Int,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val label = if (count == 1) "1 vídeo novo" else "$count vídeos novos"
    Surface(
        modifier = modifier
            .clip(RoundedCornerShape(40.dp))
            .clickable(onClick = onClick),
        color = BrandRed,
        tonalElevation = 0.dp,
    ) {
        Text(
            text = "$label · toque para assistir",
            modifier = Modifier.padding(horizontal = 24.dp, vertical = 12.dp),
            style = MaterialTheme.typography.bodyMedium.copy(
                color = Color.White,
                fontWeight = FontWeight.Bold
            )
        )
    }
}

@Composable
private fun FeedVideoCard(
    video: FeedVideo,
    isActive: Boolean,
    modifier: Modifier = Modifier,
    onMenuClick: () -> Unit,
) {
    val context = LocalContext.current
    var isMuted by remember { mutableStateOf(true) }
    val exoPlayer = remember(video.id) {
        ExoPlayer.Builder(context).build().apply {
            repeatMode = Player.REPEAT_MODE_ONE
            playWhenReady = false
        }
    }
    val mutedState = rememberUpdatedState(isMuted)
    val isActiveState = rememberUpdatedState(isActive)
    val lifecycleOwner = LocalLifecycleOwner.current

    DisposableEffect(exoPlayer, video.id) {
        val listener = object : Player.Listener {
            override fun onPlaybackStateChanged(playbackState: Int) {
                if (playbackState == Player.STATE_READY && isActiveState.value) {
                    exoPlayer.playWhenReady = true
                    exoPlayer.play()
                }
            }
        }
        exoPlayer.addListener(listener)
        exoPlayer.setMediaItem(MediaItem.fromUri(video.videoUrl))
        exoPlayer.prepare()
        onDispose {
            exoPlayer.removeListener(listener)
            exoPlayer.release()
        }
    }

    DisposableEffect(lifecycleOwner, exoPlayer) {
        val observer = LifecycleEventObserver { _, event ->
            when (event) {
                Lifecycle.Event.ON_PAUSE, Lifecycle.Event.ON_STOP -> {
                    exoPlayer.playWhenReady = false
                    exoPlayer.pause()
                }

                Lifecycle.Event.ON_START, Lifecycle.Event.ON_RESUME -> {
                    if (isActiveState.value) {
                        exoPlayer.playWhenReady = true
                        exoPlayer.play()
                    }
                }

                else -> Unit
            }
        }
        lifecycleOwner.lifecycle.addObserver(observer)
        onDispose {
            lifecycleOwner.lifecycle.removeObserver(observer)
        }
    }

    LaunchedEffect(isActive, exoPlayer) {
        if (isActive) {
            exoPlayer.playWhenReady = true
            exoPlayer.volume = if (mutedState.value) 0f else 1f
            if (exoPlayer.playbackState == Player.STATE_IDLE) {
                exoPlayer.prepare()
            }
            exoPlayer.play()
        } else {
            exoPlayer.playWhenReady = false
            exoPlayer.pause()
            exoPlayer.seekToDefaultPosition()
        }
    }

    LaunchedEffect(mutedState.value, exoPlayer) {
        exoPlayer.volume = if (mutedState.value) 0f else 1f
    }

    Box(
        modifier = modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
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
                onToggleSound = { isMuted = !isMuted },
                onMenuClick = onMenuClick,
                modifier = Modifier.fillMaxSize()
            )
        }
    }
}

@Composable
private fun VideoOverlay(
    video: FeedVideo,
    isMuted: Boolean,
    onToggleSound: () -> Unit,
    onMenuClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Box(modifier = modifier) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        listOf(Color.Transparent, Color.Black.copy(alpha = 0.72f))
                    )
                )
        )

        FeedTopBar(
            onMenuClick = onMenuClick,
            modifier = Modifier.align(Alignment.TopCenter)
        )

        FeedVideoDetails(
            video = video,
            modifier = Modifier
                .align(Alignment.BottomStart)
                .padding(start = 24.dp, end = 120.dp, bottom = 48.dp)
        )

        FeedActionsPanel(
            video = video,
            isMuted = isMuted,
            onToggleSound = onToggleSound,
            modifier = Modifier
                .fillMaxHeight()
                .navigationBarsPadding()
                .padding(end = 16.dp, bottom = 24.dp)
                .align(Alignment.BottomEnd)
        )
    }
}

@Composable
private fun FeedTopBar(
    onMenuClick: () -> Unit,
    onNotificationsClick: () -> Unit = {},
    modifier: Modifier = Modifier,
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .statusBarsPadding()
            .padding(horizontal = 20.dp, vertical = 16.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        Surface(
            shape = CircleShape,
            color = Color.Black.copy(alpha = 0.45f)
        ) {
            IconButton(onClick = onMenuClick, modifier = Modifier.size(44.dp)) {
                Icon(
                    painter = painterResource(id = R.drawable.ic_menu),
                    contentDescription = "Abrir menu",
                    tint = Color.White
                )
            }
        }

        NotificationBellButton(onClick = onNotificationsClick)
    }
}

@Composable
private fun NotificationBellButton(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Surface(
        modifier = modifier,
        shape = CircleShape,
        color = Color.Black.copy(alpha = 0.45f)
    ) {
        Box(modifier = Modifier.size(44.dp)) {
            IconButton(onClick = onClick, modifier = Modifier.fillMaxSize()) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(
                        painter = painterResource(id = R.drawable.ic_bell_body_header),
                        contentDescription = "Notificações",
                        tint = Color.White,
                        modifier = Modifier.size(22.dp)
                    )
                    Icon(
                        painter = painterResource(id = R.drawable.ic_bell_bell_header),
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.size(16.dp)
                    )
                }
            }
            Icon(
                painter = painterResource(id = R.drawable.ic_bell_notification_header),
                contentDescription = null,
                tint = Color.Unspecified,
                modifier = Modifier
                    .align(Alignment.TopEnd)
                    .offset(x = (-2).dp, y = (-2).dp)
                    .size(10.dp)
            )
        }
    }
}

@Composable
private fun FeedVideoDetails(
    video: FeedVideo,
    modifier: Modifier = Modifier,
) {
    val title = video.title?.takeIf { it.isNotBlank() } ?: "Vídeo em destaque"
    val description = video.description?.takeIf { it.isNotBlank() }

    Column(
        modifier = modifier,
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Text(
            text = title,
            style = MaterialTheme.typography.titleLarge.copy(
                color = Color.White,
                fontWeight = FontWeight.Bold
            ),
        )

        if (description != null) {
            var showFullDescription by remember(video.id) { mutableStateOf(false) }
            Text(
                text = description,
                style = MaterialTheme.typography.bodyMedium.copy(color = Color.White.copy(alpha = 0.9f)),
                maxLines = if (showFullDescription) Int.MAX_VALUE else 1,
                overflow = TextOverflow.Ellipsis,
                modifier = Modifier
                    .fillMaxWidth()
                    .animateContentSize()
            )
            Text(
                text = if (showFullDescription) "ver menos..." else "ver mais...",
                style = MaterialTheme.typography.bodySmall.copy(
                    color = BrandSand,
                    fontWeight = FontWeight.SemiBold
                ),
                modifier = Modifier.clickable { showFullDescription = !showFullDescription }
            )
        }
    }
}

@Composable
private fun FeedActionsPanel(
    video: FeedVideo,
    isMuted: Boolean,
    onToggleSound: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Column(
        modifier = modifier,
        verticalArrangement = Arrangement.Bottom,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        val avatarUrl = video.user?.profile?.avatarUrl ?: video.user?.image
        Column(
            verticalArrangement = Arrangement.spacedBy(12.dp),
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
        }

        if (!avatarUrl.isNullOrBlank()) {
            Spacer(modifier = Modifier.height(24.dp))
            UserAvatar(
                imageUrl = avatarUrl,
                contentDescription = video.user?.profile?.displayName
            )
        }
    }
}

@Composable
private fun UserAvatar(
    imageUrl: String,
    contentDescription: String?
) {
    Surface(
        shape = CircleShape,
        color = Color.White.copy(alpha = 0.3f),
        modifier = Modifier.size(72.dp)
    ) {
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(6.dp)
                .clip(CircleShape)
                .background(Color.White)
                .border(2.dp, Color.White, CircleShape),
            contentAlignment = Alignment.Center
        ) {
            AsyncImage(
                model = imageUrl,
                contentDescription = contentDescription,
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .fillMaxSize()
                    .clip(CircleShape),
                placeholder = ColorPainter(Color.Transparent)
            )
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
            color = Color.Black.copy(alpha = 0.45f),
            modifier = Modifier.size(40.dp)
        ) {
            IconButton(
                onClick = onClick,
                modifier = Modifier.fillMaxSize()
            ) {
                Icon(
                    painter = painterResource(id = icon),
                    contentDescription = label,
                    tint = Color.White,
                    modifier = Modifier.size(20.dp)
                )
            }
        }
        Spacer(modifier = Modifier.size(6.dp))
        Text(
            text = label,
            color = Color.White,
            style = MaterialTheme.typography.labelSmall,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis
        )
    }
}

private enum class FeedBottomNavItem(val icon: Int, val contentDescription: String) {
    Home(R.drawable.ic_nav_home, "Início"),
    Search(R.drawable.ic_nav_search, "Buscar"),
    Add(R.drawable.ic_nav_add, "Adicionar"),
    Inbox(R.drawable.ic_nav_inbox, "Mensagens"),
    Profile(R.drawable.ic_nav_profile, "Perfil")
}

@Composable
private fun FeedBottomNavigation(
    selectedItem: FeedBottomNavItem,
    onItemSelected: (FeedBottomNavItem) -> Unit,
    modifier: Modifier = Modifier,
) {
    Surface(
        modifier = modifier
            .fillMaxWidth()
            .navigationBarsPadding(),
        color = Color.White.copy(alpha = 0.92f),
        shadowElevation = 16.dp,
        shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp, vertical = 12.dp),
            horizontalArrangement = Arrangement.SpaceEvenly,
            verticalAlignment = Alignment.CenterVertically
        ) {
            FeedBottomNavItem.values().forEach { item ->
                val isSelected = item == selectedItem
                val tint = if (isSelected) BrandRed else Color.Black.copy(alpha = 0.8f)
                IconButton(onClick = { onItemSelected(item) }) {
                    Icon(
                        painter = painterResource(id = item.icon),
                        contentDescription = item.contentDescription,
                        tint = tint,
                        modifier = Modifier.size(32.dp)
                    )
                }
            }
        }
    }
}

private data class DrawerMenuItem(
    val icon: ImageVector,
    val label: String,
)

@Composable
private fun FeedNavigationDrawer(
    onItemSelected: (DrawerMenuItem) -> Unit,
    onSocialSelected: (String) -> Unit,
) {
    val menuItems = listOf(
        DrawerMenuItem(Icons.Outlined.SportsSoccer, "Atletas"),
        DrawerMenuItem(Icons.Outlined.Groups, "Torcida"),
        DrawerMenuItem(Icons.Outlined.PersonSearch, "Agentes de Futebol e Olheiros"),
        DrawerMenuItem(Icons.Outlined.AccountBalance, "Clubes de Futebol"),
        DrawerMenuItem(Icons.Outlined.Article, "Notícias"),
        DrawerMenuItem(Icons.Outlined.SportsEsports, "Games"),
        DrawerMenuItem(Icons.Outlined.Flag, "Confederações"),
        DrawerMenuItem(Icons.Outlined.Info, "Sobre o Vitrine de Craques"),
        DrawerMenuItem(Icons.Outlined.Lock, "Privacidade"),
    )
    val socialItems = listOf(
        Icons.Outlined.SportsSoccer to "TikTok",
        Icons.Outlined.PlayCircle to "YouTube",
        Icons.Outlined.Share to "Instagram",
        Icons.Outlined.Public to "Site",
    )

    ModalDrawerSheet(
        modifier = Modifier.fillMaxHeight(),
        drawerShape = RoundedCornerShape(topEnd = 32.dp, bottomEnd = 32.dp),
        drawerContainerColor = Color.White
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp, vertical = 32.dp),
            verticalArrangement = Arrangement.spacedBy(24.dp)
        ) {
            VitrineLogo(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(72.dp)
            )

            Column(verticalArrangement = Arrangement.spacedBy(20.dp)) {
                menuItems.forEach { item ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(16.dp))
                            .clickable { onItemSelected(item) }
                            .padding(horizontal = 12.dp, vertical = 12.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        Surface(
                            modifier = Modifier.size(42.dp),
                            shape = CircleShape,
                            color = BrandSand.copy(alpha = 0.25f)
                        ) {
                            Box(contentAlignment = Alignment.Center) {
                                Icon(
                                    imageVector = item.icon,
                                    contentDescription = item.label,
                                    tint = Color(0xFF1E1E1E),
                                    modifier = Modifier.size(24.dp)
                                )
                            }
                        }
                        Text(
                            text = item.label,
                            style = MaterialTheme.typography.titleMedium.copy(color = Color.Black),
                            maxLines = 2,
                            overflow = TextOverflow.Ellipsis
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
                Text(
                    text = "Siga nossas redes",
                    style = MaterialTheme.typography.labelMedium.copy(color = Color.Black.copy(alpha = 0.7f))
                )
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    socialItems.forEach { (icon, label) ->
                        Surface(
                            modifier = Modifier.size(44.dp),
                            shape = CircleShape,
                            color = Color.Black
                        ) {
                            IconButton(onClick = { onSocialSelected(label) }) {
                                Icon(
                                    imageVector = icon,
                                    contentDescription = label,
                                    tint = Color.White,
                                    modifier = Modifier.size(22.dp)
                                )
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            Column(
                modifier = Modifier.fillMaxWidth(),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Text(
                    text = "Vitrine de Craques®",
                    style = MaterialTheme.typography.bodyMedium.copy(color = Color.Black)
                )
                Text(
                    text = "2025",
                    style = MaterialTheme.typography.bodySmall.copy(color = Color.Black.copy(alpha = 0.7f))
                )
            }
        }
    }
}

@Composable
private fun VitrineLogo(modifier: Modifier = Modifier) {
    val context = LocalContext.current
    val imageBitmap = remember {
        runCatching {
            val base64String = context.resources.openRawResource(R.raw.logo_vitrine_splash_screen_base64)
                .bufferedReader()
                .use { it.readText() }
            val decodedBytes = Base64.decode(base64String, Base64.DEFAULT)
            BitmapFactory.decodeByteArray(decodedBytes, 0, decodedBytes.size)?.asImageBitmap()
        }.getOrNull()
    }

    if (imageBitmap != null) {
        Image(
            bitmap = imageBitmap,
            contentDescription = "Logotipo Vitrine de Craques",
            modifier = modifier,
            contentScale = ContentScale.Fit
        )
    } else {
        Box(
            modifier = modifier,
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "Vitrine de Craques",
                style = MaterialTheme.typography.titleMedium.copy(color = Color.Black, fontWeight = FontWeight.SemiBold)
            )
        }
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
