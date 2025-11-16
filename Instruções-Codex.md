Perfeito, vou montar um texto único pra você simplesmente colar no Codex.

---

**Texto para colar no Codex:**

Quero que você faça ajustes estruturais no projeto Vitrine-De-Craques-App (Kotlin) e nas APIs Next.js (pasta /app/api) para que:

1. O host canônico da API seja resolvido corretamente e sem travar a UI.
2. Os vídeos do feed não retornem mais 404 (ExoPlayer consiga baixar o MediaItem).
3. O autoplay do primeiro vídeo do feed funcione como em um app estilo TikTok/Instagram.

Abaixo estão as tarefas, em ordem. Siga TODAS, passo a passo, editando os arquivos correspondentes no projeto.

---

## 1) Reescrever o ApiBaseUrlResolver sem rede na Main Thread

Arquivo(s) envolvidos:

* `Vitrine-De-Craques-App/app/src/main/java/.../data/ApiBaseUrlResolver.kt` (ou equivalente)
* Qualquer implementação concreta deste resolver.

**Objetivo:**
Remover qualquer chamada de rede síncrona (`/api/health` ou similar) na Main Thread e garantir uma API `suspend` que possa ser chamada em `Dispatchers.IO`.

**O que fazer:**

1. Redesenhe a interface do resolver para algo como:

```kotlin
interface ApiBaseUrlResolver {
    suspend fun resolveBaseUrl(): HttpUrl
    fun cachedBaseUrlOrNull(): HttpUrl?
}
```

2. Na implementação concreta:

   * `resolveBaseUrl()` deve:

     * Verificar se há um valor em cache (em memória) → se sim, devolver direto.
     * Caso contrário:

       * Testar o host canônico (domínio principal do Vitrine) chamando um endpoint leve, por exemplo `/api/health`.
       * Se o health check falhar, tentar o host de fallback (ex.: Azure Static Web Apps).
       * Salvar o resultado em:

         * um atributo em memória (campo privado), e
         * preferências locais (SharedPreferences / DataStore), para uso posterior.
   * Toda chamada de rede deve rodar em `Dispatchers.IO`, por exemplo:

```kotlin
override suspend fun resolveBaseUrl(): HttpUrl = withContext(Dispatchers.IO) {
    // lógica de health check
}
```

* NÃO use mais nenhuma chamada de rede síncrona (`execute()` de OkHttp ou similares) na Main Thread.
  Se houver hoje qualquer lugar que faça `resolveBaseUrl()` de forma não-suspensa, ajuste para chamar a versão `suspend` dentro de uma coroutine.

3. Adicione logs claros no resolver, por exemplo:

```kotlin
Log.d("ApiBaseUrlResolver", "Resolved base URL = $baseUrl (source=$source)")
```

onde `source` indica se veio do cache, do host canônico ou do fallback.

4. Garanta que o host canônico seja resolvido **antes** de carregar o feed (antes da primeira chamada a `/api/videos`), sem causar `NetworkOnMainThreadException` nem travar a UI.

---

## 2) Ajustar o NextApiService para usar o resolver corretamente

Arquivo:

* `Vitrine-De-Craques-App/app/src/main/java/.../data/NextApiService.kt`

**Objetivo:**
Garantir que o `NextApiService` consuma o host resolvido pelo `ApiBaseUrlResolver`, sempre em contexto `suspend/IO`, e logar a URL final de `/api/videos`.

**O que fazer:**

1. Nas funções que chamam a API Next.js (especialmente a que busca o feed, ex.: `fetchVideos` ou equivalente):

   * Certifique-se de que:

```kotlin
val baseUrl = apiBaseUrlResolver.resolveBaseUrl()  // função suspend
```

está sendo chamado dentro de uma função `suspend` e em contexto de coroutine (`viewModelScope.launch(Dispatchers.IO)` ou similar).

2. Quando construir a URL de `/api/videos` (ex.: `GET /api/videos?skip=0&take=6`), adicione logs:

```kotlin
Log.i("NextApiService", "GET /api/videos resolvedUrl=$url skip=$skip take=$take")
```

3. Se houver lógica de fallback de host, **não faça silenciosamente**.
   Caso precise cair para o host de fallback, logue:

```kotlin
Log.w("NextApiService", "Falling back to $fallbackHost for videos API (health check failed)")
```

4. Confirme que o host e o path usados aqui são exatamente os mesmos que a plataforma web usa para montar o feed.

---

## 3) Investigar e corrigir o 404 dos vídeos no ExoPlayer

Arquivo(s):

* `Vitrine-De-Craques-App/app/src/main/java/.../ui/feed/FeedScreen.kt` (função `FeedVideoCard`)
* `Vitrine-De-Craques-App/app/src/main/java/.../data/NextApiService.kt`
* `app/api/videos/route.ts` no projeto Next.js
* Eventuais outras rotas relacionadas a streaming de vídeo (`/api/videos/stream/...` ou similar).

**Problema apontado:**
O log mostra `HttpDataSource$InvalidResponseCodeException: Response code: 404` quando o ExoPlayer tenta baixar o vídeo. Enquanto essa resposta for 404, o autoplay nunca vai funcionar.

**O que fazer:**

1. Em `FeedVideoCard`, antes de `exoPlayer.setMediaItem(mediaItem)`, adicione logs para debug:

```kotlin
Log.i("FeedVideoCard", "video.id=${video.id} url=${video.videoUrl}")
Log.i("FeedVideoCard", "requestHeaders=$requestProperties")
```

onde `requestProperties` é o mapa de headers que você monta para o player (Cookie, Origin, User-Agent, etc.).

2. Verifique a origem de `video.videoUrl`:

   * Se for uma URL **absoluta** para um storage público (R2/S3/CDN), então:

     * Confirme na API `app/api/videos/route.ts` que o campo retornado realmente aponta para um arquivo existente.
     * Ajuste o path, domínio e parâmetros, se necessário, para bater com o local real dos vídeos.
   * Se for uma rota **protegida** do Next.js (por exemplo `/api/videos/stream/:id`):

     * Garanta que o `MediaItem` está recebendo os **mesmos cookies e headers** que a aplicação web usa:

       * Header `Cookie` com o token de sessão correto.
       * Headers `Origin` e `Referer` coerentes com o host Next.js.
       * `User-Agent` compatível, se houver validação disso na API.
     * Confirme que `buildCookieHeaderFor(video.videoUrl)` usa o mesmo domínio/host resolvido pelo `ApiBaseUrlResolver` para não perder os cookies da sessão.

3. Em `app/api/videos/route.ts` (Next.js):

   * Confirme que os objetos `video` retornados para o app têm uma propriedade de URL de vídeo consistente (`videoUrl`, `publicUrl`, etc.).
   * Se o app espera uma URL de streaming mas a API está mandando outra coisa (por exemplo, só o path relativo), ajuste a API para devolver o formato que o app precisa (por exemplo, URL absoluta já pronta).

4. Objetivo desta etapa:
   Após o ajuste, o primeiro vídeo do feed (skip=0, take=6) deve responder 200 (ou 206 Partial Content) quando o ExoPlayer tentar baixar o arquivo, sem mais `InvalidResponseCodeException: 404`.

---

## 4) Consolidar a lógica de autoplay no FeedVideoCard

Arquivos:

* `Vitrine-De-Craques-App/app/src/main/java/.../ui/feed/FeedScreen.kt`
  (função `FeedVideoCard` e onde o pager é declarado)

**Objetivo:**
Com o host resolvido corretamente e o vídeo respondendo 200, garantir que o cartão visível no pager **sempre** dê autoplay, de forma suave.

**Ajustes no pager (FeedScreen):**

1. Ao criar o `PagerState`, basear o count em `uiState.videos.size`:

```kotlin
val pagerState = rememberPagerState(
    initialPage = 0
) { uiState.videos.size.coerceAtLeast(1) }
```

2. Calcular `isActive` considerando também o offset:

```kotlin
val currentPage = pagerState.currentPage
val currentOffset = pagerState.currentPageOffsetFraction

val isActive = page == currentPage && kotlin.math.abs(currentOffset) < 0.1f
```

E passar esse `isActive` para o `FeedVideoCard`.

---

**Ajustes no ExoPlayer dentro de FeedVideoCard:**

1. Configuração do player com foco de áudio:

```kotlin
val context = LocalContext.current

val exoPlayer = remember(video.id) {
    ExoPlayer.Builder(context)
        .setMediaSourceFactory(mediaSourceFactory)
        .build().apply {
            repeatMode = Player.REPEAT_MODE_ONE
            playWhenReady = false

            setAudioAttributes(
                com.google.android.exoplayer2.audio.AudioAttributes.Builder()
                    .setUsage(com.google.android.exoplayer2.C.USAGE_MEDIA)
                    .setContentType(com.google.android.exoplayer2.C.CONTENT_TYPE_MOVIE)
                    .build(),
                /* handleAudioFocus = */ true
            )
            setHandleAudioBecomingNoisy(true)
        }
}
```

2. Efeito para carregar/preparar o vídeo:

```kotlin
LaunchedEffect(video.id, video.videoUrl, exoPlayer) {
    playbackError = null

    if (video.videoUrl.isBlank()) {
        exoPlayer.playWhenReady = false
        playbackError = "Vídeo indisponível."
        return@LaunchedEffect
    }

    val cookieHeader = buildCookieHeaderFor(video.videoUrl)
    val appOriginHttpUrl = appOrigin?.toHttpUrlOrNull()
    val userAgent = "VitrineDeCraquesApp/${BuildConfig.VERSION_NAME} (Android)"

    val requestProperties = mutableMapOf<String, String>().apply {
        put("Accept", "*/*")
        if (!cookieHeader.isNullOrEmpty()) put("Cookie", cookieHeader)
        // Origin, Referer, User-Agent e demais headers necessários
    }

    val mediaItem = MediaItem.Builder()
        .setUri(video.videoUrl)
        .setTag(requestProperties)
        .build()

    exoPlayer.setMediaItem(mediaItem)
    exoPlayer.playWhenReady = false
    exoPlayer.prepare()
}
```

3. Efeito para ligar/desligar play/pause conforme o card ativo:

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
    exoPlayer.volume = if (isMuted) 0f else 1f
    exoPlayer.playWhenReady = true
    exoPlayer.play()
}
```

4. Efeito extra com `snapshotFlow` para garantir autoplay em qualquer ordem de eventos:

```kotlin
val isActiveState by rememberUpdatedState(isActive)
val playbackErrorState by rememberUpdatedState(playbackError)

LaunchedEffect(exoPlayer, video.id) {
    androidx.compose.runtime.snapshotFlow {
        Triple(exoPlayer.playbackState, isActiveState, playbackErrorState)
    }.collect { (state, active, error) ->
        if (state == Player.STATE_READY && active && error == null) {
            exoPlayer.volume = if (isMuted) 0f else 1f
            exoPlayer.playWhenReady = true
            exoPlayer.play()
        }
    }
}
```

5. `AndroidView` com `update` para manter o `player`:

```kotlin
AndroidView(
    modifier = Modifier.fillMaxSize(),
    factory = { ctx ->
        PlayerView(ctx).apply {
            useController = false
            resizeMode = AspectRatioFrameLayout.RESIZE_MODE_ZOOM
            player = exoPlayer
        }
    },
    update = { view ->
        if (view.player !== exoPlayer) {
            view.player = exoPlayer
        }
    }
)
```

6. Liberar o player no `DisposableEffect`:

```kotlin
DisposableEffect(exoPlayer) {
    onDispose {
        exoPlayer.playWhenReady = false
        exoPlayer.stop()
        exoPlayer.release()
    }
}
```

---

**Resumo final para você, Codex:**

1. Primeiro, reescreva o `ApiBaseUrlResolver` para ser totalmente assíncrono (`suspend`, `Dispatchers.IO`) e com cache, sem nenhuma rede na Main Thread.
2. Depois, ajuste o `NextApiService` para usar esse resolver de forma correta e logar as URLs de `/api/videos`.
3. Em seguida, corrija a origem dos 404 dos vídeos (URLs/headers/cookies/API Next.js) até o primeiro vídeo do feed responder 200.
4. Por fim, consolide a lógica de autoplay no `FeedVideoCard` com os `LaunchedEffect` e `snapshotFlow` descritos acima, garantindo que o primeiro cartão do feed toca automaticamente assim que o player entrar em `STATE_READY` e o card estiver ativo.
