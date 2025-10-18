package com.vitrinedecraques.app.ui.auth

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.ArrowBack
import androidx.compose.material.icons.outlined.Badge
import androidx.compose.material.icons.outlined.Building
import androidx.compose.material.icons.outlined.Newspaper
import androidx.compose.material.icons.outlined.People
import androidx.compose.material.icons.outlined.SportsSoccer
import androidx.compose.material.icons.outlined.SupervisorAccount
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CenterAlignedTopAppBar
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.foundation.shape.RoundedCornerShape
import com.vitrinedecraques.app.ui.theme.BrandGreen

private data class ProfileOption(
    val slug: String,
    val title: String,
    val description: String,
    val icon: androidx.compose.ui.graphics.vector.ImageVector,
)

@Composable
fun ProfileSelectionScreen(
    modifier: Modifier = Modifier,
    baseUrl: String,
    onBack: () -> Unit,
) {
    val context = LocalContext.current
    val options = remember {
        listOf(
            ProfileOption(
                slug = "responsavel",
                title = "Pai ou Responsável",
                description = "Cadastre a Conta Familiar para o atleta menor de 18 anos.",
                icon = Icons.Outlined.SupervisorAccount,
            ),
            ProfileOption(
                slug = "atleta-18",
                title = "Atleta 18+",
                description = "Cadastro para atleta maior de idade.",
                icon = Icons.Outlined.SportsSoccer,
            ),
            ProfileOption(
                slug = "imprensa-jornalistablogueiro",
                title = "Imprensa",
                description = "Jornalistas/Blogueiros com conteúdo editorial.",
                icon = Icons.Outlined.Newspaper,
            ),
            ProfileOption(
                slug = "clube",
                title = "Clube/Entidade",
                description = "Perfis oficiais de clubes/entidades desportivas.",
                icon = Icons.Outlined.Building,
            ),
            ProfileOption(
                slug = "de-agentes-licenciados",
                title = "Agente Licenciado",
                description = "Cadastro para intermediários licenciados pela CBF.",
                icon = Icons.Outlined.Badge,
            ),
            ProfileOption(
                slug = "torcedor",
                title = "Torcedor",
                description = "Para torcedores e fã clubes.",
                icon = Icons.Outlined.People,
            ),
        )
    }

    Scaffold(
        modifier = modifier,
        containerColor = Color(0xFFF3F5F4),
        topBar = {
            CenterAlignedTopAppBar(
                title = {
                    Text(
                        text = "Escolha seu perfil",
                        style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.Bold)
                    )
                },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(
                            imageVector = Icons.AutoMirrored.Outlined.ArrowBack,
                            contentDescription = "Voltar",
                            tint = BrandGreen
                        )
                    }
                },
                colors = TopAppBarDefaults.centerAlignedTopAppBarColors(
                    containerColor = Color.Transparent,
                    titleContentColor = Color(0xFF101820)
                )
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .padding(innerPadding)
                .padding(horizontal = 24.dp, vertical = 16.dp)
                .fillMaxSize(),
            verticalArrangement = Arrangement.spacedBy(24.dp)
        ) {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(
                    text = "Crie sua conta — Selecione seu perfil",
                    style = MaterialTheme.typography.headlineSmall.copy(fontWeight = FontWeight.Bold),
                    color = Color(0xFF101820)
                )
                Text(
                    text = "Escolha abaixo para continuar o cadastro na plataforma.",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color(0xFF475569)
                )
            }

            LazyVerticalGrid(
                columns = GridCells.Adaptive(minSize = 160.dp),
                verticalArrangement = Arrangement.spacedBy(20.dp),
                horizontalArrangement = Arrangement.spacedBy(20.dp),
                contentPadding = PaddingValues(bottom = 32.dp)
            ) {
                items(options) { option ->
                    ProfileCard(
                        option = option,
                        onClick = {
                            val uri = Uri.parse("${baseUrl.trimEnd('/')}/cadastro/${option.slug}")
                            val intent = Intent(Intent.ACTION_VIEW, uri)
                            context.startActivity(intent)
                        }
                    )
                }
            }
        }
    }
}

@Composable
private fun ProfileCard(
    option: ProfileOption,
    onClick: () -> Unit,
) {
    Card(
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 6.dp),
        shape = RoundedCornerShape(24.dp),
        modifier = Modifier
            .fillMaxWidth()
            .heightIn(min = 220.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Box(
                modifier = Modifier
                    .heightIn(min = 48.dp)
                    .fillMaxWidth(),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = option.icon,
                    contentDescription = null,
                    tint = BrandGreen,
                    modifier = Modifier.heightIn(min = 48.dp)
                )
            }
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                Text(
                    text = option.title,
                    style = MaterialTheme.typography.titleMedium.copy(fontWeight = FontWeight.SemiBold),
                    color = Color(0xFF101820)
                )
                Text(
                    text = option.description,
                    style = MaterialTheme.typography.bodySmall,
                    color = Color(0xFF475569)
                )
            }
            Button(
                onClick = onClick,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(text = "Continuar")
            }
        }
    }
}
