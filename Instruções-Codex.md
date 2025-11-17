Quero que você corrija o problema de autoplay do feed de vídeos no projeto **Vitrine-De-Craques**.

### 1. O que está acontecendo hoje

1. O app Android (Kotlin / Compose), pasta `Vitrine-De-Craques-App`, abre, faz login e entra na tela de feed.
2. O primeiro vídeo aparece em tela cheia, com thumbnail, mas:

   * **não entra em autoplay**;
3. Quando eu rolo para o próximo vídeo:

   * a área de vídeo fica **preta** (nem autoplay, nem thumbnail visível).
4. Já existe um log `Vitrine-De-Craques-App/logs/run-debug-20251116-213945.log` desta execução.

### 2. O que eu já verifiquei no código

Abra o arquivo:

* `Vitrine-De-Craques-App/app/src/main/java/com/vitrinedecraques/app/ui/feed/FeedScreen.kt`

Situação atual observada:

1. O `FeedVideoCard` ainda contém **três pontos diferentes** que chamam `play()`:

   * no `Player.Listener`:

   ```kotlin
   val listener = object : Player.Listener {
       override fun onPlaybackStateChanged(playbackState: Int) {
           if (playbackState == Player.STATE_READY && isActiveState && playbackErrorState == null) {
               exoPlayer.volume = if (mutedState) 0f else 1f
               exoPlayer.playWhenReady = true
               exoPlayer.play()
           }
       }
       ...
   }
   ```

   * em `LaunchedEffect(isActive, playbackError, exoPlayer)`:

   ```kotlin
   LaunchedEffect(isActive, playbackError, exoPlayer) {
       if (!isActive || playbackError != null) {
           exoPlayer.playWhenReady = false
           if (exoPlayer.playbackState != Player.STATE_IDLE) {
               exoPlayer.pause()
           }
           return@LaunchedEffect
       }

       if (exoPlayer.playbackState == Player.STATE_IDLE) {
           exoPlayer.prepare()
       }
       exoPlayer.volume = if (mutedState) 0f else 1f
       exoPlayer.playWhenReady = true
       exoPlayer.play()
   }
   ```

   * e em `LaunchedEffect(exoPlayer, video.id)` com `snapshotFlow`:

   ```kotlin
   LaunchedEffect(exoPlayer, video.id) {
       snapshotFlow {
           Triple(exoPlayer.playbackState, isActiveState, playbackErrorState)
       }.collect { (state, active, error) ->
           if (state == Player.STATE_READY && active && error == null) {
               exoPlayer.volume = if (mutedState) 0f else 1f
               exoPlayer.playWhenReady = true
               exoPlayer.play()
           }
       }
   }
   ```

2. **Não existe** constante `FEED_VIDEO_TAG` nem `Log.i(...)` dentro de `FeedVideoCard`.
   Ou seja, a instrumentação que você mencionou na sua última resposta **não está no código** que está dentro do zip.

3. O pager está assim:

   ```kotlin
   val currentPage = pagerState.currentPage
   val currentPageOffsetFraction = pagerState.currentPageOffsetFraction

   VerticalPager(
       state = pagerState,
       modifier = Modifier.fillMaxSize(),
       beyondViewportPageCount = 1,
       key = { index -> uiState.videos[index].id },
   ) { page ->
       val video = uiState.videos[page]
       val isActivePage = page == currentPage &&
           abs(currentPageOffsetFraction) < 0.1f

       FeedVideoCard(
           video = video,
           isActive = isActivePage,
           onMenuClick = { ... }
       )
   }
   ```

4. A hierarquia visual dentro do `FeedVideoCard` está:

   * `AsyncImage` (thumbnail),
   * `AndroidView` com `PlayerView`,
   * `VideoOverlay`.

   Ou seja, o vídeo deveria aparecer por cima do thumbnail quando o player começar a renderizar.

### 3. O que eu preciso que você faça agora

#### 3.1. Sincronizar o código com o que você prometeu

Primeiro, alinhe o código com o que você declarou no seu último resumo:

> “Added the FEED_VIDEO_TAG constant and instrumented FeedVideoCard end-to-end (...). Simplified the autoplay orchestration so inactive cards only pause/prepare while the active card waits for Player.STATE_READY inside the logged snapshotFlow collector before forcing play(), ensuring a single authoritative path triggers autoplay once the player is ready.”

**Hoje isso NÃO está verdadeiro no código.**

Então:

1. Crie a constante:

   ```kotlin
   private const val FEED_VIDEO_TAG = "FeedVideoCard"
   ```

2. Adicione logs **de verdade** em `FeedVideoCard`, incluindo:

   * na entrada do composable:

   ```kotlin
   Log.i(FEED_VIDEO_TAG, "Compose videoId=${video.id} isActive=$isActive url=${video.videoUrl}")
   ```

   * depois de `exoPlayer.prepare()` em `LaunchedEffect(video.id, video.videoUrl, exoPlayer)`,

   * em `LaunchedEffect(isActive, playbackError, exoPlayer)`,

   * dentro do `snapshotFlow`,

   * dentro de `onPlaybackStateChanged`,

   * dentro de `onPlayerError`.

3. Remova a multiplicidade de caminhos para autoplay e deixe **somente UM caminho autoritativo** para chamar `exoPlayer.play()`:

   * Sugestão (que eu quero que você implemente):

     * `LaunchedEffect(isActive, playbackError, exoPlayer)`:

       * só pausa o player quando `isActive == false` ou `playbackError != null`;
       * prepara o player se ele estiver em `STATE_IDLE` e o card for ativo;
       * **não chama `play()` aqui**.

     * `Player.Listener.onPlaybackStateChanged`:

       * não força `play` sozinho, apenas loga o estado.

     * `LaunchedEffect(exoPlayer, video.id)` + `snapshotFlow`:

       * esse deve ser o **único lugar** que faz:

       ```kotlin
       if (state == Player.STATE_READY && active && error == null) {
           exoPlayer.volume = if (mutedState) 0f else 1f
           exoPlayer.playWhenReady = true
           exoPlayer.play()
       }
       ```

   Em outras palavras:
   **tire o `play()` de `LaunchedEffect(isActive, ...)` e do `onPlaybackStateChanged`**, e deixe só no `snapshotFlow`, conforme a descrição que você mesmo escreveu.

#### 3.2. Garantir que o `isActive` está correto

1. Logue também:

   * em `FeedScreen` (antes do `VerticalPager`):

   ```kotlin
   Log.i("FeedScreen", "pagerState.currentPage=$currentPage offset=$currentPageOffsetFraction videos=${uiState.videos.size}")
   ```

   * e em cada página:

   ```kotlin
   Log.i("FeedScreen", "page=$page isActivePage=$isActivePage videoId=${video.id}")
   ```

2. Quero que você verifique, via código + logs, que:

   * ao abrir a tela, com pelo menos 1 vídeo,
   * a página `0` está recebendo `isActive=true`,
   * e que, ao rolar para a página seguinte, ela passa a ser a ativa (e a anterior fica `isActive=false`).

Se isso não estiver acontecendo, corrija o cálculo de `isActivePage`.

#### 3.3. Corrigir o problema da tela preta no próximo vídeo

Com os logs que você vai adicionar, analise especificamente:

* o que acontece quando:

  * o usuário passa do vídeo 0 para o vídeo 1,
  * o player do vídeo 1 é criado (`remember(video.id)`),
  * e ele entra ou não em `STATE_READY`.

Quero que você:

1. Confirme se `video.videoUrl` do segundo card não está vazio e possui uma URL válida.
   (Se estiver em branco no segundo item, logue isso e corrija no fluxo de dados do feed.)

2. Confirme que o `AndroidView` está com `player = exoPlayer` sempre que o composable é atualizado:

   ```kotlin
   update = { view ->
       if (view.player !== exoPlayer) {
           view.player = exoPlayer
       }
   }
   ```

3. Verifique se em algum ponto você está chamando `exoPlayer.stop()` ou `exoPlayer.release()` do card anterior de forma que afete o card seguinte indevidamente.

   * Cada `FeedVideoCard` está usando `remember(video.id)` para criar seu próprio `ExoPlayer`, o que é bom.
   * Porém, se um `DisposableEffect` estiver sendo disparado cedo demais (por exemplo, por algum bug na key ou no pager), o player do card visível pode estar sendo liberado antes da hora.

4. Ajuste o que for necessário para que:

   * ao entrar no card 0 (primeiro vídeo), ele dê autoplay,
   * ao rolar para o card 1, o card 0 pare e o card 1:

     * prepare o media item,
     * chegue em `STATE_READY`,
     * e o `snapshotFlow` chame `play()`.

### 4. Critério de aceite

Considere a tarefa concluída somente quando:

1. O código no zip passar a conter:

   * a constante `FEED_VIDEO_TAG`,
   * logs `Log.i(...)` em `FeedVideoCard`,
   * apenas um caminho autoritativo chamando `play()` (no `snapshotFlow`).

2. Um novo log `run-debug-*.log` mostrar, na sequência de abrir o feed:

   * `FeedScreen: page=0 isActivePage=true videoId=...`
   * `FeedVideoCard: Compose videoId=... isActive=true url=...`
   * `FeedVideoCard: snapshotFlow ... state=STATE_READY active=true error=null ...`
   * e logo em seguida algum log indicando que `playWhenReady=true` e o vídeo está tocando.

3. Ao rolar para o próximo vídeo:

   * o card anterior é pausado,
   * o card novo entra em autoplay,
   * **nenhum card mostra só tela preta**.
