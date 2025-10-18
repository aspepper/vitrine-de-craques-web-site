package com.vitrinedecraques.app.ui.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.weight
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.ChatBubbleOutline
import androidx.compose.material.icons.outlined.Send
import androidx.compose.material.icons.outlined.Settings
import androidx.compose.material3.Badge
import androidx.compose.material3.BadgedBox
import androidx.compose.material3.Divider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.TabRowDefaults
import androidx.compose.material3.TabRowDefaults.tabIndicatorOffset
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.vitrinedecraques.app.R
import com.vitrinedecraques.app.ui.theme.BrandRed

@Composable
fun ProfileScreen(
    modifier: Modifier = Modifier,
    state: ProfileUiState = remember { ProfileUiState.sample() },
    onMenuClick: () -> Unit = {},
    onSettingsClick: () -> Unit = {},
    onMessagesClick: () -> Unit = {},
    onShareClick: () -> Unit = {}
) {
    var selectedTab by rememberSaveable { mutableStateOf(ProfileTab.Videos) }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(Color.White),
        contentPadding = PaddingValues(bottom = 96.dp)
    ) {
        item {
            Column(modifier = Modifier.fillMaxWidth()) {
                ProfileTopBar(
                    onMenuClick = onMenuClick,
                    onSettingsClick = onSettingsClick,
                    onMessagesClick = onMessagesClick,
                    onShareClick = onShareClick,
                    hasUnreadMessages = state.unreadMessagesCount > 0
                )
                ProfileHeader(state = state)
            }
        }

        item {
            ProfileBio(bio = state.bio)
        }

        item {
            Spacer(modifier = Modifier.height(16.dp))
            ProfileTabRow(selectedTab = selectedTab, onTabSelected = { selectedTab = it })
        }

        when (selectedTab) {
            ProfileTab.Videos -> {
                items(state.videos.chunked(2)) { rowItems ->
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 20.dp, vertical = 12.dp),
                        horizontalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        rowItems.forEach { video ->
                            ProfileVideoCard(
                                video = video,
                                modifier = Modifier.weight(1f)
                            )
                        }
                        if (rowItems.size == 1) {
                            Spacer(modifier = Modifier.weight(1f))
                        }
                    }
                }
            }

            ProfileTab.About -> {
                item {
                    ProfileAboutSection(state = state)
                }
            }
        }
    }
}

@Composable
private fun ProfileTopBar(
    onMenuClick: () -> Unit,
    onSettingsClick: () -> Unit,
    onMessagesClick: () -> Unit,
    onShareClick: () -> Unit,
    hasUnreadMessages: Boolean,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .statusBarsPadding()
            .padding(horizontal = 20.dp, vertical = 16.dp),
        horizontalArrangement = Arrangement.SpaceBetween,
        verticalAlignment = Alignment.CenterVertically
    ) {
        IconButton(onClick = onMenuClick) {
            Icon(
                painter = painterResource(id = R.drawable.ic_menu),
                contentDescription = "Abrir menu",
                tint = Color.Black
            )
        }

        Text(
            text = "Perfil",
            style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.SemiBold),
            color = Color.Black
        )

        Row(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = onSettingsClick) {
                Icon(
                    imageVector = Icons.Outlined.Settings,
                    contentDescription = "Configurações",
                    tint = Color.Black
                )
            }

            BadgedBox(
                badge = {
                    if (hasUnreadMessages) {
                        Badge(
                            modifier = Modifier
                                .size(8.dp),
                            containerColor = BrandRed,
                        )
                    }
                }
            ) {
                IconButton(onClick = onMessagesClick) {
                    Icon(
                        imageVector = Icons.Outlined.ChatBubbleOutline,
                        contentDescription = "Mensagens",
                        tint = Color.Black
                    )
                }
            }

            IconButton(onClick = onShareClick) {
                Icon(
                    imageVector = Icons.Outlined.Send,
                    contentDescription = "Compartilhar perfil",
                    tint = Color.Black
                )
            }
        }
    }
}

@Composable
private fun ProfileHeader(state: ProfileUiState) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .background(Color(0xFFFFF5F7))
            .padding(horizontal = 24.dp, vertical = 28.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(20.dp)
    ) {
        Surface(
            modifier = Modifier.size(120.dp),
            shape = CircleShape,
            color = Color.White
        ) {
            AsyncImage(
                model = state.avatarUrl,
                contentDescription = "Foto de perfil",
                contentScale = ContentScale.Crop,
                modifier = Modifier
                    .fillMaxSize()
                    .clip(CircleShape)
            )
        }

        Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Text(
                text = state.name,
                style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.SemiBold),
                color = Color.Black
            )
            Text(
                text = state.username,
                style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Medium),
                color = BrandRed
            )
            Text(
                text = state.roleDescription,
                style = MaterialTheme.typography.bodyMedium,
                color = BrandRed
            )
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            ProfileStatCard(label = "Seguidores", value = state.followers)
            ProfileStatCard(label = "Seguindo", value = state.following)
        }
    }
}

@Composable
private fun ProfileStatCard(label: String, value: Int) {
    Surface(
        modifier = Modifier.weight(1f),
        shape = RoundedCornerShape(18.dp),
        tonalElevation = 0.dp,
        color = Color.White,
        border = androidx.compose.foundation.BorderStroke(1.dp, Color(0xFFEDC9D2))
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(vertical = 20.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Text(
                text = value.toString(),
                style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.Bold),
                color = Color.Black
            )
            Text(
                text = label,
                style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Medium),
                color = BrandRed
            )
        }
    }
}

@Composable
private fun ProfileBio(bio: String) {
    Text(
        text = bio,
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp, vertical = 20.dp),
        style = MaterialTheme.typography.bodyMedium,
        textAlign = TextAlign.Center,
        color = Color(0xFF1E1E1E)
    )
}

@Composable
private fun ProfileTabRow(selectedTab: ProfileTab, onTabSelected: (ProfileTab) -> Unit) {
    val tabs = ProfileTab.values()
    val selectedIndex = tabs.indexOf(selectedTab)

    TabRow(
        selectedTabIndex = selectedIndex,
        containerColor = Color.White,
        contentColor = BrandRed,
        divider = {
            Divider(color = Color(0xFFE8E8E8))
        },
        indicator = { tabPositions ->
            TabRowDefaults.Indicator(
                modifier = Modifier
                    .tabIndicatorOffset(tabPositions[selectedIndex])
                    .height(3.dp),
                color = BrandRed
            )
        }
    ) {
        tabs.forEachIndexed { index, tab ->
            Tab(
                selected = index == selectedIndex,
                onClick = { onTabSelected(tab) },
                selectedContentColor = BrandRed,
                unselectedContentColor = Color(0xFF1E1E1E),
                text = {
                    Text(
                        text = tab.label,
                        style = MaterialTheme.typography.bodyMedium.copy(fontWeight = FontWeight.Medium)
                    )
                }
            )
        }
    }
}

@Composable
private fun ProfileVideoCard(
    video: ProfileVideo,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier
            .height(176.dp)
            .clip(RoundedCornerShape(20.dp)),
        shape = RoundedCornerShape(20.dp),
        shadowElevation = 4.dp,
        tonalElevation = 0.dp,
        color = Color.White
    ) {
        AsyncImage(
            model = video.thumbnailUrl,
            contentDescription = video.title,
            contentScale = ContentScale.Crop,
            modifier = Modifier.fillMaxSize()
        )
    }
}

@Composable
private fun ProfileAboutSection(state: ProfileUiState) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 24.dp, vertical = 24.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Text(
            text = "Sobre Alex",
            style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold),
            color = Color.Black
        )
        Text(
            text = state.bio,
            style = MaterialTheme.typography.bodyMedium,
            color = Color(0xFF3A3A3A)
        )
        Divider(color = Color(0xFFE8E8E8))
        Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
            state.highlights.forEach { highlight ->
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Box(
                        modifier = Modifier
                            .size(6.dp)
                            .clip(CircleShape)
                            .background(BrandRed)
                    )
                    Text(
                        text = highlight,
                        modifier = Modifier.padding(start = 12.dp),
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color(0xFF1E1E1E)
                    )
                }
            }
        }
    }
}

private enum class ProfileTab(val label: String) {
    Videos("Vídeos"),
    About("Sobre")
}

data class ProfileVideo(
    val id: String,
    val thumbnailUrl: String,
    val title: String,
)

data class ProfileUiState(
    val name: String,
    val username: String,
    val roleDescription: String,
    val followers: Int,
    val following: Int,
    val bio: String,
    val avatarUrl: String,
    val unreadMessagesCount: Int,
    val highlights: List<String>,
    val videos: List<ProfileVideo>,
) {
    companion object {
        fun sample(): ProfileUiState {
            return ProfileUiState(
                name = "Alex Pimenta",
                username = "@alex.pimenta",
                roleDescription = "Atleta | 12 | São Paulo",
                followers = 120,
                following = 85,
                bio = "Aspirante a jogador de futebol, apaixonado pelo esporte. Dedicado a aprimorar minhas habilidades e fazer a diferença em campo.",
                avatarUrl = "https://images.pexels.com/photos/164492/pexels-photo-164492.jpeg?auto=compress&cs=tinysrgb&w=200",
                unreadMessagesCount = 2,
                highlights = listOf(
                    "Posição: Atacante",
                    "Clube atual: Projeto Futuro FC",
                    "Pé dominante: Direito",
                    "Habilidades-chave: velocidade, finalização e visão de jogo"
                ),
                videos = listOf(
                    ProfileVideo(
                        id = "1",
                        thumbnailUrl = "https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg?auto=compress&cs=tinysrgb&w=400",
                        title = "Treino de finalização"
                    ),
                    ProfileVideo(
                        id = "2",
                        thumbnailUrl = "https://images.pexels.com/photos/2744225/pexels-photo-2744225.jpeg?auto=compress&cs=tinysrgb&w=400",
                        title = "Partida amistosa"
                    ),
                    ProfileVideo(
                        id = "3",
                        thumbnailUrl = "https://images.pexels.com/photos/3617335/pexels-photo-3617335.jpeg?auto=compress&cs=tinysrgb&w=400",
                        title = "Treino de agilidade"
                    ),
                    ProfileVideo(
                        id = "4",
                        thumbnailUrl = "https://images.pexels.com/photos/47730/the-ball-stadion-football-the-pitch-47730.jpeg?auto=compress&cs=tinysrgb&w=400",
                        title = "Destaques do campeonato"
                    ),
                )
            )
        }
    }
}
