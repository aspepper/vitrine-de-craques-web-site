package com.vitrinedecraques.app.ui.feed

import android.graphics.BitmapFactory
import android.util.Base64
import android.view.View
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
import androidx.compose.foundation.layout.matchParentSize
import androidx.compose.foundation.layout.navigationBarsPadding
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
import com.vitrinedecraques.app.data.NextApiService
import com.vitrinedecraques.app.data.model.FeedVideo
import com.vitrinedecraques.app.data.model.ProfileDetail
import com.vitrinedecraques.app.ui.profile.ProfileScreen
import com.vitrinedecraques.app.ui.profile.ProfileUiState
import com.vitrinedecraques.app.ui.profile.ProfileVideo
import com.vitrinedecraques.app.ui.theme.BrandRed
import com.vitrinedecraques.app.ui.theme.BrandSand
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.AspectRatioFrameLayout
import androidx.media3.ui.PlayerView
import androidx.compose.foundation.ExperimentalFoundationApi
import kotlinx.coroutines.launch
import java.text.Normalizer
import java.util.Calendar
import java.util.Locale

@OptIn(ExperimentalFoundationApi::class)
@Composable
fun FeedScreen(
    modifier: Modifier = Modifier,
    viewModel: FeedViewModel = viewModel(),
) {
    val uiState by viewModel.uiState.collectAsState()
    val pagerState = rememberPagerState(initialPage = 0) { uiState.videos.size.coerceAtLeast(1) }
    val hasVideos = uiState.videos.isNotEmpty()
    val profileService = remember { NextApiService() }
    var profileUiState by remember { mutableStateOf(ProfileUiState(isLoading = uiState.isLoading)) }
    val profileVideo = uiState.lastViewedVideoId?.let { id ->
        uiState.videos.firstOrNull { it.id == id }
    } ?: uiState.videos.firstOrNull()
    val profileUserId = profileVideo?.user?.id
    val profileVideoIds = remember(profileUserId, uiState.videos) {
        uiState.videos.filter { it.user?.id == profileUserId }.map { it.id }
    }

    LaunchedEffect(profileVideo?.user?.profile?.id, profileUserId, profileVideoIds, uiState.isLoading) {
        if (profileVideo == null) {
            profileUiState = ProfileUiState(
                isLoading = uiState.isLoading,
                error = if (uiState.isLoading) null else "Nenhum perfil disponível no momento."
            )
            return@LaunchedEffect
        }

        profileUiState = ProfileUiState(isLoading = true)

        profileUiState = loadProfileUiState(
            video = profileVideo,
            allVideos = uiState.videos,
            service = profileService
        )
    }

    val backgroundBrush = remember {
        Brush.verticalGradient(listOf(Color(0xFF1C432A), Color(0xFF0A1510)))
    }
    val drawerState = rememberDrawerState(initialValue = DrawerValue.Closed)
    val coroutineScope = rememberCoroutineScope()
    var selectedBottomItem by remember { mutableStateOf(FeedBottomNavItem.Home) }

    LaunchedEffect(uiState.lastViewedVideoId, uiState.videos) {
        val targetId = uiState.lastViewedVideoId ?: return@LaunchedEffect
        val targetIndex = uiState.videos.indexOfFirst { it.id == targetId }
        if (targetIndex >= 0 && targetIndex != pagerState.currentPage) {
            pagerState.scrollToPage(targetIndex)
        }
    }

    LaunchedEffect(pagerState.currentPage, uiState.videos.size, uiState.hasMore, uiState.isLoading) {
        if (!hasVideos) return@LaunchedEffect
        val index = pagerState.currentPage.coerceAtMost(uiState.videos.lastIndex)
        val currentVideo = uiState.videos.getOrNull(index)
        if (currentVideo != null) {
            viewModel.updateLastViewedVideo(currentVideo.id)
        }
        if (index >= uiState.videos.lastIndex - 1 && uiState.hasMore && !uiState.isLoading) {
            viewModel.loadMore()
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
        val columnModifier = modifier
            .fillMaxSize()
            .let { base ->
                if (selectedBottomItem == FeedBottomNavItem.Home) {
                    base.background(backgroundBrush)
                } else {
                    base.background(Color.White)
                }
            }

        Column(modifier = columnModifier) {
            Box(
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth()
            ) {
                when (selectedBottomItem) {
                    FeedBottomNavItem.Home -> {
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

                        LoadingIndicator(
                            visible = uiState.isLoading && hasVideos,
                            modifier = Modifier
                                .align(Alignment.BottomCenter)
                                .padding(bottom = 32.dp)
                                .navigationBarsPadding(),
                        )
                    }

                    FeedBottomNavItem.Profile -> {
                        ProfileScreen(
                            modifier = Modifier.fillMaxSize(),
                            state = profileUiState,
                            onMenuClick = { coroutineScope.launch { drawerState.open() } }
                        )
                    }

                    else -> {
                        FeaturePlaceholder(label = selectedBottomItem.contentDescription)
                    }
                }
            }

            FeedBottomNavigation(
                selectedItem = selectedBottomItem,
                onItemSelected = { selectedBottomItem = it },
            )
        }
    }
}

@Composable
private fun FeaturePlaceholder(label: String) {
    Box(
        modifier = Modifier
            .fillMaxSize()
            .statusBarsPadding()
            .padding(horizontal = 24.dp),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            Icon(
                imageVector = Icons.Outlined.Info,
                contentDescription = null,
                tint = Color.Black.copy(alpha = 0.7f),
                modifier = Modifier.size(40.dp)
            )
            Text(
                text = "$label em breve",
                style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Medium),
                color = Color.Black
            )
            Text(
                text = "Estamos trabalhando para liberar esta funcionalidade.",
                style = MaterialTheme.typography.bodyMedium,
                color = Color.Black.copy(alpha = 0.7f),
                textAlign = TextAlign.Center
            )
        }
    }
}

private suspend fun loadProfileUiState(
    video: FeedVideo,
    allVideos: List<FeedVideo>,
    service: NextApiService,
): ProfileUiState {
    val user = video.user
    val profile = user?.profile
    val fallbackName = profile?.displayName?.takeIf { !it.isNullOrBlank() }
        ?: user?.name?.takeIf { !it.isNullOrBlank() }
        ?: "Perfil"
    val fallbackAvatar = profile?.avatarUrl ?: user?.image
    val fallbackBio = video.description?.takeIf { !it.isNullOrBlank() } ?: "Perfil em atualização."

    val detail = profile?.id?.let { id ->
        runCatching { service.fetchProfileDetails(id, profile.role) }.getOrNull()
    }
    val followerCount = user?.id?.let { id ->
        runCatching { service.fetchFollowStats(id)?.followerCount }.getOrNull()
    } ?: 0

    val resolvedName = detail?.displayName?.takeIf { !it.isNullOrBlank() } ?: fallbackName
    val resolvedAvatar = detail?.avatarUrl ?: fallbackAvatar
    val resolvedBio = detail?.bio?.takeIf { !it.isNullOrBlank() } ?: fallbackBio
    val highlights = buildHighlights(detail)
    val roleDescription = buildRoleDescription(detail)
    val username = buildHandle(resolvedName, user?.id)
    val profileVideos = allVideos
        .filter { it.user?.id == user?.id }
        .map(::toProfileVideo)

    return ProfileUiState(
        name = resolvedName,
        username = username,
        roleDescription = roleDescription,
        followers = followerCount,
        following = 0,
        bio = resolvedBio,
        avatarUrl = resolvedAvatar,
        highlights = highlights,
        videos = profileVideos,
        isLoading = false,
        error = null,
    )
}

private fun toProfileVideo(video: FeedVideo): ProfileVideo {
    val title = video.title?.takeIf { !it.isNullOrBlank() } ?: "Vídeo"
    return ProfileVideo(
        id = video.id,
        thumbnailUrl = video.thumbnailUrl,
        title = title,
    )
}

private fun buildHandle(name: String?, fallback: String?): String {
    val source = name?.takeIf { it.isNotBlank() }
        ?: fallback?.takeIf { it.isNotBlank() }
        ?: return ""
    val normalized = Normalizer.normalize(source.lowercase(Locale.ROOT), Normalizer.Form.NFD)
        .replace("\\p{InCombiningDiacriticalMarks}+".toRegex(), "")
        .replace("[^a-z0-9]+".toRegex(), ".")
        .trim('.')
    if (normalized.isBlank()) {
        return ""
    }
    return "@" + normalized.take(24)
}

private fun buildRoleDescription(detail: ProfileDetail?): String {
    if (detail == null) return ""
    val parts = mutableListOf<String>()
    detail.posicao?.takeIf { it.isNotBlank() }?.let { parts += it }
    calculateAge(detail.nascimento)?.let { parts += "$it anos" }
    detail.altura?.takeIf { it.isNotBlank() }?.let { parts += it }
    val city = detail.cidade?.takeIf { it.isNotBlank() }
    val state = detail.uf?.takeIf { it.isNotBlank() }
    if (city != null || state != null) {
        parts += listOfNotNull(city, state).joinToString("/")
    }
    return parts.joinToString(" • ")
}

private fun buildHighlights(detail: ProfileDetail?): List<String> {
    if (detail == null) return emptyList()
    val highlights = mutableListOf<String>()
    detail.perna?.takeIf { it.isNotBlank() }?.let { highlights += "Perna dominante: $it" }
    detail.peso?.takeIf { it.isNotBlank() }?.let { highlights += "Peso: $it" }
    detail.favoriteClub?.clube?.takeIf { !it.isNullOrBlank() }?.let { highlights += "Clube: $it" }
    val locationParts = listOfNotNull(
        detail.cidade?.takeIf { it.isNotBlank() },
        detail.uf?.takeIf { it.isNotBlank() },
        detail.pais?.takeIf { it.isNotBlank() },
    )
    if (locationParts.isNotEmpty()) {
        highlights += "Localidade: ${locationParts.joinToString("/")}"
    }
    detail.telefone?.takeIf { it.isNotBlank() }?.let { highlights += "Telefone: $it" }
    detail.whatsapp?.takeIf { it.isNotBlank() }?.let { highlights += "WhatsApp: $it" }
    detail.site?.takeIf { it.isNotBlank() }?.let { highlights += "Site: $it" }
    return highlights
}

private fun calculateAge(rawBirthDate: String?): Int? {
    val (day, month, year) = parseDateParts(rawBirthDate) ?: return null
    val today = Calendar.getInstance()
    val birth = Calendar.getInstance().apply {
        set(Calendar.YEAR, year)
        set(Calendar.MONTH, month - 1)
        set(Calendar.DAY_OF_MONTH, day)
    }
    var age = today.get(Calendar.YEAR) - birth.get(Calendar.YEAR)
    if (today.get(Calendar.DAY_OF_YEAR) < birth.get(Calendar.DAY_OF_YEAR)) {
        age -= 1
    }
    return age.takeIf { it >= 0 }
}

private fun parseDateParts(raw: String?): Triple<Int, Int, Int>? {
    val value = raw?.trim()?.takeIf { it.isNotEmpty() } ?: return null
    val tokens = value.split("/", "-", "\\").map { it.trim() }.filter { it.isNotEmpty() }
    if (tokens.size != 3) return null
    val first = tokens[0]
    val second = tokens[1]
    val third = tokens[2]
    val isYearFirst = first.length == 4
    val day = if (isYearFirst) third.toIntOrNull() else first.toIntOrNull()
    val month = second.toIntOrNull()
    val year = if (isYearFirst) first.toIntOrNull() else third.toIntOrNull()
    if (day == null || month == null || year == null) return null
    if (month !in 1..12 || day !in 1..31) return null
    return Triple(day, month, year)
}

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
            playWhenReady = isActive
        }
    }
    val mutedState by rememberUpdatedState(isMuted)
    val isActiveState by rememberUpdatedState(isActive)

    DisposableEffect(exoPlayer, video.id) {
        val listener = object : Player.Listener {
            override fun onPlaybackStateChanged(playbackState: Int) {
                if (playbackState == Player.STATE_READY && isActiveState) {
                    exoPlayer.playWhenReady = true
                    exoPlayer.play()
                }
            }
        }
        exoPlayer.addListener(listener)
        exoPlayer.setMediaItem(MediaItem.fromUri(video.videoUrl))
        exoPlayer.prepare()
        if (isActiveState) {
            exoPlayer.playWhenReady = true
            exoPlayer.play()
        }
        onDispose {
            exoPlayer.removeListener(listener)
            exoPlayer.release()
        }
    }

    LaunchedEffect(isActive, exoPlayer) {
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
            exoPlayer.seekToDefaultPosition()
        }
    }

    LaunchedEffect(mutedState, exoPlayer) {
        exoPlayer.volume = if (mutedState) 0f else 1f
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
                .padding(end = 12.dp, bottom = 20.dp)
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
            modifier = Modifier.size(40.dp),
            shape = CircleShape,
            color = Color.Black.copy(alpha = 0.45f)
        ) {
            IconButton(onClick = onMenuClick, modifier = Modifier.fillMaxSize()) {
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
        modifier = modifier.size(40.dp),
        shape = CircleShape,
        color = Color.Black.copy(alpha = 0.45f)
    ) {
        Box(modifier = Modifier.fillMaxSize()) {
            IconButton(onClick = onClick, modifier = Modifier.matchParentSize()) {
                Box(
                    modifier = Modifier.size(24.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Icon(
                        painter = painterResource(id = R.drawable.ic_bell_body_header),
                        contentDescription = "Notificações",
                        tint = Color.White,
                        modifier = Modifier.fillMaxSize()
                    )
                    Icon(
                        painter = painterResource(id = R.drawable.ic_bell_bell_header),
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier
                            .align(Alignment.TopCenter)
                            .padding(top = 3.dp)
                            .fillMaxWidth(0.6f)
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
        horizontalAlignment = Alignment.End
    ) {
        val avatarUrl = video.user?.profile?.avatarUrl ?: video.user?.image
        Column(
            verticalArrangement = Arrangement.spacedBy(8.dp),
            horizontalAlignment = Alignment.End
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
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(6.dp)
    ) {
        Surface(
            shape = CircleShape,
            color = Color.Black.copy(alpha = 0.45f),
            modifier = Modifier.size(32.dp)
        ) {
            IconButton(
                onClick = onClick,
                modifier = Modifier.fillMaxSize()
            ) {
                Icon(
                    painter = painterResource(id = icon),
                    contentDescription = label,
                    tint = Color.White,
                    modifier = Modifier.size(16.dp)
                )
            }
        }
        Text(
            text = label,
            color = Color.White,
            style = MaterialTheme.typography.labelSmall,
            maxLines = 1,
            overflow = TextOverflow.Ellipsis,
            textAlign = TextAlign.End
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
        color = Color.Black.copy(alpha = 0.45f),
        modifier = Modifier.size(32.dp)
    ) {
        IconButton(onClick = onToggleSound, modifier = Modifier.fillMaxSize()) {
            val icon = if (isMuted) R.drawable.ic_volume_off else R.drawable.ic_volume_on
            Icon(
                painter = painterResource(id = icon),
                contentDescription = if (isMuted) "Ativar som" else "Desativar som",
                tint = Color.White,
                modifier = Modifier.size(16.dp)
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
