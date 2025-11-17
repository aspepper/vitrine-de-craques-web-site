Quero que você analise e corrija o problema de **autoplay do feed de vídeos** no projeto Vitrine-De-Craques (zip em anexo).

Contexto atual:

* Projeto Android (Kotlin/Compose) em:
  `Vitrine-De-Craques-App/`
* Projeto Next.js (API) em:
  `app/`, com rota `app/api/videos/route.ts`.
* Os últimos logs estão em:
  `Vitrine-De-Craques-App/logs/run-debug-20251116-213945.log`
  `Vitrine-De-Craques-App/logs/build-debug-20251116-213945.log`.

---

## 1. Comportamento atual (problema)

No app Android:

* O login funciona.
* O feed carrega, o **primeiro vídeo aparece em tela cheia**, com thumbnail / frame do vídeo (vide screenshot que anexei).
* Mas **o vídeo não entra em autoplay**.
* Mesmo após alguns segundos, o primeiro cartão continua estático (sem movimento), como se o player estivesse em `STATE_READY` com `playWhenReady = false`.

Importante:
Depois dos seus ajustes anteriores:

* O `ApiBaseUrlResolver` já está assíncrono (`suspend` + DataStore + cache).
* As chamadas a `/api/videos` foram atualizadas para usar esse resolver.
* O backend Next.js foi ajustado para não retornar mais 404 (proxy e reescrita de URLs).
* Nos logs (`run-debug-20251116-213945.log`) **não aparecem mais erros de `HttpDataSource$InvalidResponseCodeException`** para o vídeo.

Ou seja: **os vídeos estão acessíveis, não estão mais dando 404, mas não entram em play automático**.

---

## 2. O que os logs mostram hoje

No arquivo `run-debug-20251116-213945.log`:

* Vejo inicialização e release de instâncias de ExoPlayer:

  * `ExoPlayerImpl: Init ...`
  * `ExoPlayerImpl: Release ...`
* Vejo logs de:

  * `NextApiService` fazendo `GET /api/videos?skip=0&take=6` com a URL resolvida.
  * `HttpClientProvider` atualizando/consultando cookies.
* **Não** vejo:

  * Logs de `FeedVideoCard`.
  * Logs de erro de playback (`InvalidResponseCode`, `PlaybackException`, etc.).
  * Logs de `STATE_READY` específicos do nosso código.

Isso reforça a hipótese de que:

* O player está inicializado,
* O vídeo provavelmente chega a `STATE_READY`,
* Mas a lógica que deveria chamar `exoPlayer.play()` quando `isActive == true` **não está disparando do jeito correto**.

---

## 3. Arquivos chave que você deve focar

No projeto Android:

* `Vitrine-De-Craques-App/app/src/main/java/com/vitrinedecraques/app/ui/feed/FeedScreen.kt`

  * `@Composable fun FeedScreen(...)`
  * `@Composable private fun FeedVideoCard(...)`
* `Vitrine-De-Craques-App/app/src/main/java/com/vitrinedecraques/app/data/network/ApiBaseUrlResolver.kt`

  * (já refeito, aqui é só contexto)
* `Vitrine-De-Craques-App/app/src/main/java/com/vitrinedecraques/app/data/NextApiService.kt`

  * método que faz `GET /api/videos`

No Next.js (só para contexto, se precisar):

* `app/api/videos/route.ts`

**Não é mais necessário retrabalhar o resolver nem a API.
Agora o foco é 100% no fluxo de autoplay dentro do `FeedVideoCard`.**

---

## 4. O que eu quero que você faça AGORA

Quero que você:

1. **Instrumente o `FeedVideoCard` com logs detalhados.**
2. Rode mentalmente (análise de código + leitura dos logs existentes) o fluxo de estados.
3. Ajuste a lógica para garantir que o vídeo **entre em autoplay** quando o cartão estiver ativo.

### 4.1. Instrumentar `FeedVideoCard` para debug

No arquivo `FeedScreen.kt`, dentro de `@Composable private fun FeedVideoCard(...)`:

1. Adicione um `TAG` local:

```kotlin
private const val FEED_VIDEO_TAG = "FeedVideoCard"
```

2. Dentro do `FeedVideoCard`, adicione logs em pontos estratégicos:

* Ao entrar no composable:

```kotlin
Log.i(
    FEED_VIDEO_TAG,
    "Compose FeedVideoCard videoId=${video.id} isActive=$isActive videoUrl=${video.videoUrl}"
)
```

* Dentro de `LaunchedEffect(video.id, video.videoUrl, exoPlayer)`:

  * Antes de `setMediaItem` / `prepare`:

```kotlin
Log.i(
    FEED_VIDEO_TAG,
    "LaunchedEffect(video) videoId=${video.id} url=${video.videoUrl} playbackState=${exoPlayer.playbackState}"
)
```

* Após `exoPlayer.prepare()`:

```kotlin
Log.i(
    FEED_VIDEO_TAG,
    "After prepare videoId=${video.id} state=${exoPlayer.playbackState} playWhenReady=${exoPlayer.playWhenReady}"
)
```

* Dentro de `LaunchedEffect(isActive, playbackError, exoPlayer)`:

```kotlin
Log.i(
    FEED_VIDEO_TAG,
    "LaunchedEffect(isActive) videoId=${video.id} isActive=$isActive playbackError=$playbackError state=${exoPlayer.playbackState} playWhenReady=${exoPlayer.playWhenReady}"
)
```

* Dentro do `snapshotFlow { Triple(exoPlayer.playbackState, isActiveState, playbackErrorState) }`:

```kotlin
snapshotFlow {
    Triple(exoPlayer.playbackState, isActiveState, playbackErrorState)
}.collect { (state, active, error) ->
    Log.i(
        FEED_VIDEO_TAG,
        "snapshotFlow videoId=${video.id} state=$state isActive=$active playbackError=$error playWhenReady=${exoPlayer.playWhenReady}"
    )
    if (state == Player.STATE_READY && active && error == null) {
        ...
    }
}
```

* No listener do player (`Player.Listener`) ao receber `onPlaybackStateChanged`:

```kotlin
override fun onPlaybackStateChanged(playbackState: Int) {
    Log.i(
        FEED_VIDEO_TAG,
        "onPlaybackStateChanged videoId=${video.id} state=$playbackState isActive=$isActiveState playWhenReady=${exoPlayer.playWhenReady}"
    )
    ...
}
```

3. Gere um novo log `run-debug-*.log` executando o app até a tela de feed com pelo menos 1 vídeo.

---

### 4.2. Corrigir a lógica de autoplay

Depois de instrumentar, quero que você analise o fluxo de estados e corrija o que for necessário com estas metas:

**Meta 1 — cartão inicial:**

* Quando a `FeedScreen` é aberta:

  * `pagerState.currentPage == 0`
  * `abs(currentPageOffsetFraction) < 0.1f`
  * Então o primeiro `FeedVideoCard` deve receber `isActive = true`.

Confirme com log se isso está realmente acontecendo.

**Meta 2 — player pronto:**

* Quando o `ExoPlayer` entra em `Player.STATE_READY` para o vídeo da página ativa,
* E `isActive == true`,
* E `playbackError == null`,
* Devemos obrigatoriamente chamar:

```kotlin
exoPlayer.volume = if (mutedState) 0f else 1f
exoPlayer.playWhenReady = true
exoPlayer.play()
```

Você pode decidir se isso acontece:

* dentro de `LaunchedEffect(isActive, playbackError, exoPlayer)`, **OU**
* dentro do `snapshotFlow {}` de `playbackState/isActiveState/playbackErrorState`.

O importante é que haja um único caminho claro que:

1. Veja o trio `(STATE_READY, active=true, error=null)`;
2. Faça o `play()`.

**Se hoje a lógica estiver se “auto-sabotando”** (por exemplo:

* um `LaunchedEffect` desliga o `playWhenReady` logo depois de outro ligar,
* ou `isActiveState` nunca está true na hora que o player fica READY,
* ou o `snapshotFlow` não é chamado para a primeira página),

quero que você simplifique.

Por exemplo, uma abordagem aceitável:

```kotlin
LaunchedEffect(exoPlayer, video.id, isActiveState) {
    snapshotFlow {
        Triple(exoPlayer.playbackState, isActiveState, playbackErrorState)
    }.collect { (state, active, error) ->
        Log.i(FEED_VIDEO_TAG, "snapshotFlow videoId=${video.id} state=$state active=$active error=$error playWhenReady=${exoPlayer.playWhenReady}")
        if (state == Player.STATE_READY && active && error == null) {
            exoPlayer.volume = if (mutedState) 0f else 1f
            exoPlayer.playWhenReady = true
            exoPlayer.play()
        }
    }
}
```

E, em paralelo, manter um `LaunchedEffect(isActive, playbackError)` bem simples apenas para pausar quando o card ficar inativo:

```kotlin
LaunchedEffect(isActive, playbackError, exoPlayer) {
    if (!isActive || playbackError != null) {
        exoPlayer.playWhenReady = false
        if (exoPlayer.playbackState != Player.STATE_IDLE) {
            exoPlayer.pause()
        }
    }
}
```

---

### 4.3. Critério de aceite

Considere o problema resolvido quando:

1. Ao abrir o app, logar e cair na `FeedScreen`, o primeiro vídeo:

   * aparece em tela cheia,

   * entra em autoplay **sem toque do usuário**,

   * e os logs mostram algo como:

   * `Compose FeedVideoCard videoId=... isActive=true`

   * `onPlaybackStateChanged ... state=STATE_READY ...`

   * `snapshotFlow ... state=STATE_READY active=true error=null ...`

   * seguido de um `playWhenReady=true` e `play()`.

2. Ao rolar para o próximo vídeo:

   * o vídeo anterior é pausado,
   * o próximo vídeo entra em autoplay automaticamente,
   * sem erros de rede e sem necessidade de toque manual.

---

**Resumindo:**

* **Não** mexa mais no `ApiBaseUrlResolver` nem na API Next.js (isso já está ok).
* Foque 100% em:

  * instrumentar `FeedVideoCard` com logs,
  * entender o fluxo `(isActive, STATE_READY, playbackError)`,
  * e ajustar a lógica de `LaunchedEffect`/`snapshotFlow` para garantir que, quando o cartão está ativo e o player está pronto, o vídeo sempre dê `play()` automaticamente.

