package com.example.vitrinedecraques.ui

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.interaction.MutableInteractionSource
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Article
import androidx.compose.material.icons.outlined.Badge
import androidx.compose.material.icons.outlined.ChatBubbleOutline
import androidx.compose.material.icons.outlined.Close
import androidx.compose.material.icons.outlined.Explore
import androidx.compose.material.icons.outlined.Flag
import androidx.compose.material.icons.outlined.Groups
import androidx.compose.material.icons.outlined.Info
import androidx.compose.material.icons.outlined.Lock
import androidx.compose.material.icons.outlined.MailOutline
import androidx.compose.material.icons.outlined.Menu
import androidx.compose.material.icons.outlined.NotificationsNone
import androidx.compose.material.icons.outlined.PersonOutline
import androidx.compose.material.icons.outlined.PlayArrow
import androidx.compose.material.icons.outlined.Search
import androidx.compose.material.icons.outlined.Shield
import androidx.compose.material.icons.outlined.Sports
import androidx.compose.material.icons.outlined.SportsEsports
import androidx.compose.material.icons.outlined.SportsSoccer
import androidx.compose.material.icons.outlined.StarOutline
import androidx.compose.material.icons.rounded.Add
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import com.example.vitrinedecraques.ui.theme.BrandDark
import com.example.vitrinedecraques.ui.theme.BrandGreen
import com.example.vitrinedecraques.ui.theme.BrandMidnight
import com.example.vitrinedecraques.ui.theme.BrandRed
import com.example.vitrinedecraques.ui.theme.BrandSand

private enum class AppDestination {
    Splash,
    Home
}

@Composable
fun VitrineDeCraquesApp(
    isUserLoggedIn: Boolean = true
) {
    var destination by rememberSaveable { mutableStateOf(AppDestination.Splash) }
    var showMenu by rememberSaveable { mutableStateOf(false) }

    LaunchedEffect(destination, isUserLoggedIn) {
        if (destination == AppDestination.Splash) {
            delay(1800)
            destination = if (isUserLoggedIn) AppDestination.Home else AppDestination.Home
        }
    }

    Box(modifier = Modifier.fillMaxSize()) {
        when (destination) {
            AppDestination.Splash -> SplashScreen()
            AppDestination.Home -> HomeScreen(
                onMenuClick = { showMenu = true }
            )
        }

        AnimatedVisibility(
            visible = showMenu,
            enter = fadeIn(),
            exit = fadeOut()
        ) {
            MenuOverlay(onDismiss = { showMenu = false })
        }
    }
}

@Composable
private fun SplashScreen(modifier: Modifier = Modifier) {
    Box(
        modifier = modifier
            .fillMaxSize()
            .background(
                brush = Brush.verticalGradient(
                    colors = listOf(BrandSand, Color.White)
                )
            )
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 32.dp, vertical = 48.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Text(
                text = "TICO",
                style = MaterialTheme.typography.headlineLarge.copy(
                    fontWeight = FontWeight.ExtraBold,
                    letterSpacing = 4.sp,
                    color = BrandMidnight
                )
            )

            PlayerCard()

            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Icon(
                    imageVector = Icons.Outlined.SportsSoccer,
                    contentDescription = null,
                    tint = BrandDark,
                    modifier = Modifier.size(48.dp)
                )
                Spacer(modifier = Modifier.height(12.dp))
                Text(
                    text = "VITRINE\nde CRAQUES",
                    style = MaterialTheme.typography.titleMedium.copy(
                        fontWeight = FontWeight.Bold,
                        textAlign = TextAlign.Center,
                        lineHeight = 24.sp
                    ),
                    textAlign = TextAlign.Center
                )
            }
        }
    }
}

@Composable
private fun PlayerCard() {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 8.dp)
            .aspectRatio(3f / 4f),
        colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.9f)),
        shape = RoundedCornerShape(32.dp),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Box(modifier = Modifier.fillMaxSize()) {
            Canvas(modifier = Modifier.fillMaxSize()) {
                drawCircle(
                    color = BrandSand.copy(alpha = 0.6f),
                    radius = size.minDimension / 2.2f,
                    center = Offset(size.width * 0.45f, size.height * 0.45f)
                )
                drawCircle(
                    color = BrandGreen.copy(alpha = 0.15f),
                    radius = size.minDimension / 2.5f,
                    center = Offset(size.width * 0.55f, size.height * 0.55f)
                )
                drawArc(
                    color = BrandRed,
                    startAngle = 200f,
                    sweepAngle = 120f,
                    useCenter = false,
                    style = Stroke(width = 32f, cap = StrokeCap.Round),
                    size = size * 0.65f,
                    topLeft = Offset(size.width * 0.15f, size.height * 0.2f)
                )
                drawCircle(
                    color = BrandMidnight,
                    radius = size.minDimension / 12f,
                    center = Offset(size.width * 0.62f, size.height * 0.68f)
                )
            }

            Column(
                modifier = Modifier
                    .align(Alignment.BottomCenter)
                    .padding(bottom = 24.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "Bem-vindo",
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold)
                )
                Text(
                    text = "à Vitrine de Craques",
                    style = MaterialTheme.typography.bodyMedium,
                    color = BrandMidnight
                )
            }
        }
    }
}

@Composable
private fun HomeScreen(
    modifier: Modifier = Modifier,
    onMenuClick: () -> Unit
) {
    val backgroundGradient = Brush.verticalGradient(
        colors = listOf(Color(0xFF5F9E6E), Color(0xFF1F3D25)),
        startY = 0f,
        endY = Float.POSITIVE_INFINITY
    )

    Scaffold(
        modifier = modifier,
        containerColor = Color.Transparent,
        topBar = { HomeTopBar(onMenuClick = onMenuClick) },
        bottomBar = { HomeBottomBar() }
    ) { innerPadding ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(innerPadding)
        ) {
            Box(
                modifier = Modifier
                    .matchParentSize()
                    .background(backgroundGradient)
            )

            HighlightCard(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 24.dp)
                    .align(Alignment.TopStart)
                    .padding(top = 32.dp)
            )

            VerticalStats(
                modifier = Modifier
                    .align(Alignment.CenterEnd)
                    .padding(end = 16.dp)
            )

            ProfileShortcut(
                modifier = Modifier
                    .align(Alignment.BottomEnd)
                    .padding(end = 24.dp, bottom = 80.dp)
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun HomeTopBar(onMenuClick: () -> Unit) {
    TopAppBar(
        title = {
            Column {
                Text(
                    text = "Olá, Craque!",
                    style = MaterialTheme.typography.labelLarge.copy(color = Color.White)
                )
                Text(
                    text = "Descubra novos talentos",
                    style = MaterialTheme.typography.titleMedium.copy(color = Color.White, fontWeight = FontWeight.SemiBold)
                )
            }
        },
        navigationIcon = {
            IconButton(onClick = onMenuClick) {
                Icon(
                    imageVector = Icons.Outlined.Menu,
                    contentDescription = "Abrir menu",
                    tint = Color.White
                )
            }
        },
        actions = {
            IconButton(onClick = { /* TODO: Notifications */ }) {
                Icon(
                    imageVector = Icons.Outlined.NotificationsNone,
                    contentDescription = "Notificações",
                    tint = Color.White
                )
            }
            IconButton(onClick = { /* TODO: Mensagens */ }) {
                Icon(
                    imageVector = Icons.Outlined.MailOutline,
                    contentDescription = "Mensagens",
                    tint = Color.White
                )
            }
        },
        colors = TopAppBarDefaults.topAppBarColors(
            containerColor = Color.Transparent,
            scrolledContainerColor = Color.Transparent
        )
    )
}

@Composable
private fun HighlightCard(modifier: Modifier = Modifier) {
    Card(
        modifier = modifier,
        colors = CardDefaults.cardColors(containerColor = Color.White.copy(alpha = 0.15f)),
        shape = RoundedCornerShape(32.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp, vertical = 32.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Text(
                text = "Destaque do Dia",
                style = MaterialTheme.typography.labelLarge.copy(color = Color.White)
            )
            Text(
                text = "Lucas Oliveira",
                style = MaterialTheme.typography.headlineSmall.copy(
                    color = Color.White,
                    fontWeight = FontWeight.Bold
                )
            )
            Text(
                text = "Meia ofensivo - 20 anos",
                style = MaterialTheme.typography.bodyMedium.copy(color = Color.White.copy(alpha = 0.9f))
            )
            Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                StatBadge(label = "Velocidade", value = "93")
                StatBadge(label = "Assistências", value = "18")
                StatBadge(label = "Gols", value = "27")
            }
        }
    }
}

@Composable
private fun StatBadge(label: String, value: String) {
    Column(horizontalAlignment = Alignment.CenterHorizontally) {
        Text(
            text = value,
            style = MaterialTheme.typography.titleLarge.copy(
                color = Color.White,
                fontWeight = FontWeight.Bold
            )
        )
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall.copy(color = Color.White.copy(alpha = 0.85f))
        )
    }
}

@Composable
private fun VerticalStats(modifier: Modifier = Modifier) {
    val metrics = listOf(
        Metric(Icons.Outlined.StarOutline, "2.5K"),
        Metric(Icons.Outlined.ChatBubbleOutline, "320"),
        Metric(Icons.Outlined.PlayArrow, "150"),
        Metric(Icons.Outlined.SportsSoccer, "50")
    )
    Column(
        modifier = modifier,
        verticalArrangement = Arrangement.spacedBy(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        metrics.forEach { metric ->
            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                Surface(
                    modifier = Modifier.size(48.dp),
                    shape = CircleShape,
                    color = Color.White.copy(alpha = 0.2f)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(
                            imageVector = metric.icon,
                            contentDescription = null,
                            tint = Color.White
                        )
                    }
                }
                Spacer(modifier = Modifier.height(8.dp))
                Text(
                    text = metric.value,
                    style = MaterialTheme.typography.labelMedium.copy(color = Color.White)
                )
            }
        }
    }
}

private data class Metric(val icon: androidx.compose.ui.graphics.vector.ImageVector, val value: String)

@Composable
private fun ProfileShortcut(modifier: Modifier = Modifier) {
    Surface(
        modifier = modifier,
        shape = CircleShape,
        color = Color.White,
        shadowElevation = 12.dp
    ) {
        Column(
            modifier = Modifier
                .size(88.dp)
                .padding(12.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Surface(
                shape = CircleShape,
                color = BrandRed.copy(alpha = 0.15f),
                modifier = Modifier.size(52.dp)
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Icon(
                        imageVector = Icons.Outlined.PersonOutline,
                        contentDescription = "Perfil",
                        tint = BrandRed
                    )
                }
            }
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = "Seu perfil",
                style = MaterialTheme.typography.labelSmall.copy(color = BrandDark)
            )
        }
    }
}

@Composable
private fun HomeBottomBar() {
    val items = listOf(
        BottomItem(Icons.Outlined.SportsSoccer, "Feed"),
        BottomItem(Icons.Outlined.Search, "Buscar"),
        BottomItem(Icons.Rounded.Add, "Criar"),
        BottomItem(Icons.Outlined.ChatBubbleOutline, "Mensagens"),
        BottomItem(Icons.Outlined.PersonOutline, "Perfil")
    )

    NavigationBar(containerColor = Color.White, tonalElevation = 0.dp) {
        items.forEachIndexed { index, item ->
            NavigationBarItem(
                selected = index == 0,
                onClick = { /* TODO: nav */ },
                icon = {
                    Icon(
                        imageVector = item.icon,
                        contentDescription = item.label,
                        tint = if (index == 0) BrandRed else BrandDark.copy(alpha = 0.6f)
                    )
                },
                label = {
                    Text(
                        text = item.label,
                        color = if (index == 0) BrandRed else BrandDark.copy(alpha = 0.7f)
                    )
                }
            )
        }
    }
}

private data class BottomItem(
    val icon: androidx.compose.ui.graphics.vector.ImageVector,
    val label: String
)

@Composable
private fun MenuOverlay(onDismiss: () -> Unit) {
    Box(modifier = Modifier.fillMaxSize()) {
        Box(
            modifier = Modifier
                .matchParentSize()
                .background(Color.Black.copy(alpha = 0.45f))
                .clickable(
                    interactionSource = remember { MutableInteractionSource() },
                    indication = null,
                    onClick = onDismiss
                )
        )

        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 24.dp, vertical = 48.dp)
                .align(Alignment.Center)
                .clickable(
                    interactionSource = remember { MutableInteractionSource() },
                    indication = null,
                    onClick = { }
                ),
            shape = RoundedCornerShape(32.dp),
            tonalElevation = 6.dp,
            color = Color.White
        ) {
            MenuContent(onClose = onDismiss)
        }
    }
}

@Composable
private fun MenuContent(onClose: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .verticalScroll(rememberScrollState())
            .padding(horizontal = 28.dp, vertical = 32.dp),
        verticalArrangement = Arrangement.spacedBy(20.dp)
    ) {
        Row(
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween,
            modifier = Modifier.fillMaxWidth()
        ) {
            Column {
                Text(
                    text = "Vitrine de Craques",
                    style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold, color = BrandDark)
                )
                Text(
                    text = "Menu principal",
                    style = MaterialTheme.typography.bodySmall.copy(color = BrandDark.copy(alpha = 0.7f))
                )
            }
            IconButton(onClick = onClose) {
                Icon(
                    imageVector = Icons.Outlined.Close,
                    contentDescription = "Fechar menu",
                    tint = BrandDark
                )
            }
        }

        MenuItems()

        Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth()) {
            Row(horizontalArrangement = Arrangement.spacedBy(16.dp)) {
                listOf(
                    Icons.Outlined.SportsSoccer,
                    Icons.Outlined.ChatBubbleOutline,
                    Icons.Outlined.Explore,
                    Icons.Outlined.SportsEsports,
                    Icons.Outlined.StarOutline
                ).forEach { icon ->
                    Surface(
                        modifier = Modifier.size(40.dp),
                        shape = CircleShape,
                        color = BrandRed.copy(alpha = 0.08f)
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Icon(
                                imageVector = icon,
                                contentDescription = null,
                                tint = BrandRed
                            )
                        }
                    }
                }
            }
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = "Vitrine de Craques ®\n2025",
                textAlign = TextAlign.Center,
                style = MaterialTheme.typography.bodySmall.copy(color = BrandDark.copy(alpha = 0.7f))
            )
        }
    }
}

@Composable
private fun MenuItems() {
    val items = listOf(
        MenuItem(Icons.Outlined.Sports, "Atletas"),
        MenuItem(Icons.Outlined.Groups, "Torcida"),
        MenuItem(Icons.Outlined.Badge, "Agentes de Futebol e Olheiros"),
        MenuItem(Icons.Outlined.Shield, "Clubes de Futebol"),
        MenuItem(Icons.Outlined.Article, "Notícias"),
        MenuItem(Icons.Outlined.SportsEsports, "Games"),
        MenuItem(Icons.Outlined.Flag, "Confederações"),
        MenuItem(Icons.Outlined.Info, "Sobre o Vitrine de Craques"),
        MenuItem(Icons.Outlined.Lock, "Privacidade")
    )

    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        items.forEach { item ->
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .border(
                        width = 1.dp,
                        color = BrandRed.copy(alpha = 0.1f),
                        shape = RoundedCornerShape(20.dp)
                    )
                    .padding(horizontal = 16.dp, vertical = 14.dp),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Surface(
                    modifier = Modifier.size(44.dp),
                    shape = CircleShape,
                    color = BrandRed.copy(alpha = 0.08f)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(
                            imageVector = item.icon,
                            contentDescription = item.label,
                            tint = BrandRed
                        )
                    }
                }
                Text(
                    text = item.label,
                    style = MaterialTheme.typography.bodyLarge.copy(
                        color = BrandDark,
                        fontWeight = FontWeight.Medium
                    )
                )
            }
        }
    }
}

private data class MenuItem(
    val icon: androidx.compose.ui.graphics.vector.ImageVector,
    val label: String
)

