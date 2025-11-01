package com.vitrinedecraques.app.ui.upload

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
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
import androidx.compose.material.icons.outlined.Info
import androidx.compose.material.icons.outlined.PlayArrow
import androidx.compose.material3.Button
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Slider
import androidx.compose.material3.SliderDefaults
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.DisposableEffect
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.collectAsState
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.media3.common.MediaItem
import androidx.media3.common.Player
import androidx.media3.exoplayer.ExoPlayer
import androidx.media3.ui.PlayerView
import com.vitrinedecraques.app.R
import com.vitrinedecraques.app.ui.theme.BrandRed

@Composable
fun UploadVideoScreen(
    modifier: Modifier = Modifier,
    onMenuClick: () -> Unit,
    viewModel: UploadVideoViewModel = viewModel(),
) {
    val state by viewModel.uiState.collectAsState()
    val context = LocalContext.current
    val scrollState = rememberScrollState()
    val pickVideoLauncher = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri: Uri? ->
        viewModel.onSelectVideo(uri)
    }

    val player = remember(state.videoUri) {
        state.videoUri?.let { uri ->
            ExoPlayer.Builder(context).build().apply {
                repeatMode = Player.REPEAT_MODE_ONE
                volume = 1f
                playWhenReady = true
                setMediaItem(MediaItem.fromUri(uri))
                prepare()
            }
        }
    }

    DisposableEffect(player) {
        onDispose {
            player?.release()
        }
    }

    LaunchedEffect(player, state.clipStartSeconds) {
        player?.seekTo((state.clipStartSeconds * 1000).toLong().coerceAtLeast(0))
        if (player != null && !player.isPlaying) {
            player.playWhenReady = true
            player.play()
        }
    }

    Column(
        modifier = modifier
            .fillMaxSize()
            .background(Color.White),
    ) {
        UploadTopBar(onMenuClick = onMenuClick)

        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(scrollState)
                .padding(horizontal = 20.dp, vertical = 16.dp),
            verticalArrangement = Arrangement.spacedBy(20.dp),
        ) {
            VideoPickerCard(
                state = state,
                onSelectVideo = { pickVideoLauncher.launch("video/*") },
                onClearVideo = viewModel::clearVideo,
                player = player,
            )

            ClipSelectionCard(
                state = state,
                onClipChanged = viewModel::updateClipStart,
            )

            OrientationWarning(state = state)

            VideoDetailsForm(
                state = state,
                onTitleChange = viewModel::updateTitle,
                onDescriptionChange = viewModel::updateDescription,
            )

            PreparationInfo()

            FeedbackSection(state = state)

            SubmitSection(
                state = state,
                onSubmit = viewModel::submit,
            )
        }
    }
}

@Composable
private fun UploadTopBar(
    onMenuClick: () -> Unit,
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 20.dp, vertical = 16.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween,
    ) {
        IconButton(onClick = onMenuClick) {
            Icon(
                painter = painterResource(id = R.drawable.ic_menu),
                contentDescription = "Abrir menu",
                tint = Color.Black,
            )
        }

        Text(
            text = "Upload",
            style = MaterialTheme.typography.titleLarge.copy(fontWeight = FontWeight.SemiBold),
            color = Color.Black,
        )

        Icon(
            imageVector = Icons.Outlined.PlayArrow,
            contentDescription = null,
            tint = Color.Transparent,
            modifier = Modifier.size(24.dp),
        )
    }
}

@Composable
private fun VideoPickerCard(
    state: UploadVideoUiState,
    onSelectVideo: () -> Unit,
    onClearVideo: () -> Unit,
    player: ExoPlayer?,
) {
    Column(
        verticalArrangement = Arrangement.spacedBy(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.fillMaxWidth(),
    ) {
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .aspectRatio(9f / 16f)
                .clip(RoundedCornerShape(28.dp))
                .background(Color(0xFFF4F4F5))
                .border(
                    width = 1.dp,
                    color = if (state.videoUri != null) Color.Transparent else Color(0xFFD9DCE3),
                    shape = RoundedCornerShape(28.dp),
                )
                .clickable(enabled = !state.isSubmitting) { onSelectVideo() },
            contentAlignment = Alignment.Center,
        ) {
            when {
                state.isVideoLoading -> {
                    CircularProgressIndicator(color = BrandRed)
                }

                state.videoUri != null && player != null -> {
                    AndroidPlayer(player = player)
                }

                else -> {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier.padding(horizontal = 24.dp),
                    ) {
                        Surface(
                            color = Color.White,
                            shape = CircleShape,
                            tonalElevation = 1.dp,
                            shadowElevation = 2.dp,
                        ) {
                            Text(
                                text = "Toque para selecionar",
                                modifier = Modifier
                                    .padding(horizontal = 16.dp, vertical = 10.dp),
                                style = MaterialTheme.typography.labelMedium.copy(fontWeight = FontWeight.SemiBold),
                                color = Color(0xFF1F2937),
                            )
                        }
                        Text(
                            text = "Escolha um vídeo vertical de até 10 segundos.",
                            style = MaterialTheme.typography.bodySmall,
                            color = Color(0xFF6B7280),
                            textAlign = TextAlign.Center,
                        )
                    }
                }
            }
        }

        Row(
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Button(
                onClick = onSelectVideo,
                enabled = !state.isSubmitting,
                shape = RoundedCornerShape(999.dp),
            ) {
                Text(text = if (state.videoUri == null) "Escolher vídeo" else "Selecionar outro vídeo")
            }
            if (state.videoUri != null) {
                OutlinedButton(
                    onClick = onClearVideo,
                    enabled = !state.isSubmitting,
                    shape = RoundedCornerShape(999.dp),
                ) {
                    Text(text = "Remover")
                }
            }
        }

        state.videoDisplayName?.takeIf { it.isNotBlank() }?.let { name ->
            Text(
                text = name,
                style = MaterialTheme.typography.bodySmall,
                color = Color(0xFF4B5563),
            )
        }
    }
}

@Composable
private fun AndroidPlayer(player: ExoPlayer) {
    val context = LocalContext.current
    AndroidViewContainer(player = player, modifier = Modifier.fillMaxSize())
}

@Composable
private fun AndroidViewContainer(player: ExoPlayer, modifier: Modifier = Modifier) {
    androidx.compose.ui.viewinterop.AndroidView(
        modifier = modifier,
        factory = { context ->
            PlayerView(context).apply {
                useController = true
                this.player = player
            }
        },
        update = { view ->
            view.player = player
        },
    )
}

@Composable
private fun ClipSelectionCard(
    state: UploadVideoUiState,
    onClipChanged: (Float) -> Unit,
) {
    if (state.videoUri == null || state.videoDurationSeconds <= 0f) {
        return
    }
    val clipDuration = state.clipDuration()
    val clipEnd = state.clipEnd().coerceAtMost(state.videoDurationSeconds)
    val maxClipStart = state.maxClipStart()
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(24.dp))
            .background(Color.White)
            .border(1.dp, Color(0xFFE2E8F0), RoundedCornerShape(24.dp))
            .padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        Text(
            text = "Seleção do trecho",
            style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.SemiBold),
            color = Color(0xFF1F2937),
        )
        Text(
            text = "Enviaremos o trecho de ${formatSeconds(state.clipStartSeconds)} até ${formatSeconds(clipEnd)} (${clipDuration.coerceAtMost(state.videoDurationSeconds).formatSecondsText()}).",
            style = MaterialTheme.typography.bodySmall,
            color = Color(0xFF475569),
        )
        Slider(
            value = state.clipStartSeconds,
            onValueChange = onClipChanged,
            valueRange = 0f..maxClipStart,
            enabled = maxClipStart > 0f && !state.isSubmitting,
            colors = SliderDefaults.colors(activeTrackColor = BrandRed, inactiveTrackColor = Color(0xFFE2E8F0)),
        )
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
        ) {
            Text(
                text = "Início ${formatSeconds(state.clipStartSeconds)}",
                style = MaterialTheme.typography.labelSmall,
                color = Color(0xFF475569),
            )
            Text(
                text = "Fim ${formatSeconds(clipEnd)}",
                style = MaterialTheme.typography.labelSmall,
                color = Color(0xFF475569),
            )
            Text(
                text = "Duração detectada ${state.videoDurationSeconds.formatSecondsText()}",
                style = MaterialTheme.typography.labelSmall,
                color = Color(0xFF475569),
            )
        }
        if (maxClipStart <= 0f) {
            Text(
                text = "Seu vídeo já tem ${state.videoDurationSeconds.formatSecondsText()} segundos. Usaremos o conteúdo integral caso seja menor que 10 segundos.",
                style = MaterialTheme.typography.bodySmall,
                color = Color(0xFF6B7280),
            )
        }
    }
}

@Composable
private fun OrientationWarning(state: UploadVideoUiState) {
    if (!state.orientationWarning) {
        return
    }
    ElevatedCard(
        colors = androidx.compose.material3.CardDefaults.elevatedCardColors(
            containerColor = Color(0xFFFFFBEB),
        ),
        modifier = Modifier.fillMaxWidth(),
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Icon(
                imageVector = Icons.Outlined.Info,
                contentDescription = null,
                tint = Color(0xFFB45309),
            )
            Text(
                text = "O vídeo selecionado parece estar na horizontal. Recomendamos enviar um vídeo vertical para ocupar toda a tela.",
                style = MaterialTheme.typography.bodySmall,
                color = Color(0xFF92400E),
            )
        }
    }
}

@Composable
private fun VideoDetailsForm(
    state: UploadVideoUiState,
    onTitleChange: (String) -> Unit,
    onDescriptionChange: (String) -> Unit,
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(24.dp))
            .background(Color.White)
            .border(1.dp, Color(0xFFE2E8F0), RoundedCornerShape(24.dp))
            .padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        Text(
            text = "Detalhes do vídeo",
            style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.SemiBold),
            color = Color(0xFF1F2937),
        )
        OutlinedTextField(
            value = state.title,
            onValueChange = onTitleChange,
            label = { Text("Título") },
            placeholder = { Text("Conte rapidamente sobre o momento do vídeo") },
            modifier = Modifier.fillMaxWidth(),
            enabled = !state.isSubmitting,
            singleLine = true,
        )
        OutlinedTextField(
            value = state.description,
            onValueChange = onDescriptionChange,
            label = { Text("Descrição") },
            placeholder = { Text("Detalhe a jogada, contexto do treino ou evento. Links e menções são bem-vindos.") },
            modifier = Modifier.fillMaxWidth(),
            enabled = !state.isSubmitting,
            minLines = 4,
        )
    }
}

@Composable
private fun PreparationInfo() {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(24.dp))
            .background(Color.White)
            .border(1.dp, Color(0xFFE2E8F0), RoundedCornerShape(24.dp))
            .padding(20.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Text(
            text = "Preparação para redes sociais",
            style = MaterialTheme.typography.titleSmall.copy(fontWeight = FontWeight.SemiBold),
            color = Color(0xFF1F2937),
        )
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text("• O vídeo será otimizado para 720x1280 e streaming adaptativo.", style = MaterialTheme.typography.bodySmall, color = Color(0xFF475569))
            Text("• Entrega via protocolo HLS com fallback automático para MPEG-DASH.", style = MaterialTheme.typography.bodySmall, color = Color(0xFF475569))
            Text("• Qualidade ajustada para visualização em dispositivos móveis e web.", style = MaterialTheme.typography.bodySmall, color = Color(0xFF475569))
        }
    }
}

@Composable
private fun FeedbackSection(state: UploadVideoUiState) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        state.errorMessage?.let { message ->
            Text(
                text = message,
                color = Color(0xFFB91C1C),
                style = MaterialTheme.typography.bodyMedium,
            )
        }
        state.successMessage?.let { message ->
            Text(
                text = message,
                color = Color(0xFF047857),
                style = MaterialTheme.typography.bodyMedium,
            )
        }
    }
}

@Composable
private fun SubmitSection(
    state: UploadVideoUiState,
    onSubmit: () -> Unit,
) {
    Column(
        modifier = Modifier.fillMaxWidth(),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Button(
            onClick = onSubmit,
            enabled = state.canSubmit(),
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp),
            shape = RoundedCornerShape(999.dp),
        ) {
            if (state.isSubmitting) {
                CircularProgressIndicator(
                    modifier = Modifier.size(20.dp),
                    color = Color.White,
                    strokeWidth = 2.dp,
                )
            } else {
                Text(text = "Salvar e publicar", fontWeight = FontWeight.SemiBold)
            }
        }
        Text(
            text = "Ao publicar você concorda com os termos de uso e autoriza o processamento do vídeo para streaming adaptativo.",
            style = MaterialTheme.typography.bodySmall,
            color = Color(0xFF6B7280),
        )
    }
}

private fun Float.formatSecondsText(): String {
    val totalSeconds = this.coerceAtLeast(0f)
    return if (totalSeconds >= 60f) {
        val minutes = (totalSeconds / 60f).toInt()
        val seconds = (totalSeconds % 60f).toInt()
        "%d:%02d".format(minutes, seconds)
    } else {
        "${totalSeconds.toInt()}s"
    }
}

private fun formatSeconds(value: Float): String {
    val minutes = value.toInt() / 60
    val seconds = (value % 60).toInt().coerceAtLeast(0)
    return "%d:%02d".format(minutes, seconds)
}
