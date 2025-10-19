#!/usr/bin/env zsh
set -euo pipefail

# ----------------------------
# Configurações padrão (edite conforme seu projeto)
# ----------------------------
MODULE="${MODULE:-app}"                          # nome do módulo (geralmente 'app')
VARIANT="${VARIANT:-debug}"                      # debug | release | <flavor>Debug | <flavor>Release
APP_ID="${APP_ID:-com.vitrinedecraques.app}"     # applicationId/namespace padrão
MAIN_ACTIVITY="${MAIN_ACTIVITY:-}"               # vazio => auto-resolver a atividade LAUNCHER
ADB_BIN="${ADB_BIN:-adb}"
GRADLEW="${GRADLEW:-./gradlew}"
LOG_DIR="${LOG_DIR:-./logs}"
LOG_LEVEL_FILTER="${LOG_LEVEL_FILTER:-}"         # "package:mine" => --pid <pid> do APP_ID
WAIT_FOR_DEVICE="${WAIT_FOR_DEVICE:-1}"          # aguardar dispositivo (1=yes, 0=no)

# Ex.: export ANDROID_SERIAL="emulator-5554" para escolher um device específico
ANDROID_SERIAL="${ANDROID_SERIAL:-}"

# Timestamp único para este run (usado nos dois logs)
STAMP="$(date +"%Y%m%d-%H%M%S")"
BUILD_LOG="${LOG_DIR}/build-${VARIANT}-${STAMP}.log"
RUNTIME_LOG="${LOG_DIR}/run-${VARIANT}-${STAMP}.log"
RUNTIME_SYS_LOG="${LOG_DIR}/run-sys-${VARIANT}-${STAMP}.log"

mkdir -p "$LOG_DIR"

Clear

# ----------------------------
# Ajuda/flags
# ----------------------------
usage() {
  cat <<'EOF'
Uso:
  [VARIÁVEIS] ./run_android.zsh [--install-only|--build-only|--no-run] [--filter "<filtro>"]

Exemplos:
  ./run_android.zsh
  MODULE=app VARIANT=release ./run_android.zsh
  APP_ID=com.exemplo.app ./run_android.zsh --filter "package:mine"   # filtra logs só do processo do APP_ID
  ./run_android.zsh --filter "*:S MyTag:D"                           # formato nativo do logcat

Opções:
  --install-only   Apenas instala o APK (não builda).
  --build-only     Apenas builda (não instala/roda).
  --no-run         Não abre o app após instalar.
  --filter STR     Filtro do logcat. Aceita:
                   - formato ADB: "<tag>:D *:S", etc.
                   - "package:<pkg>" ou "package:mine" para usar --pid do processo.

Logs:
  Build   -> ${LOG_DIR}/build-<variant>-<stamp>.log
  Runtime -> ${LOG_DIR}/run-<variant>-<stamp>.log  (app)
  Runtime -> ${LOG_DIR}/run-sys-<variant>-<stamp>.log (eventos do sistema)
EOF
}

INSTALL_ONLY=0
BUILD_ONLY=0
NO_RUN=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --install-only) INSTALL_ONLY=1 ;;
    --build-only)   BUILD_ONLY=1 ;;
    --no-run)       NO_RUN=1 ;;
    --filter)       shift; LOG_LEVEL_FILTER="${1:-$LOG_LEVEL_FILTER}" ;;
    -h|--help)      usage; exit 0 ;;
    *) echo "Opção desconhecida: $1"; usage; exit 1 ;;
  esac
  shift
done

# ----------------------------
# Funções auxiliares
# ----------------------------
die() { echo "[ERRO] $*" >&2; exit 1; }
log() { echo "[INFO] $*"; }

ensure_tools() {
  command -v "$ADB_BIN" >/dev/null 2>&1 || die "adb não encontrado no PATH."
  [[ -x "$GRADLEW" ]] || die "gradlew não encontrado/exec. ($GRADLEW)"
}

pick_device() {
  if [[ -n "${ANDROID_SERIAL}" ]]; then
    log "ANDROID_SERIAL definido: $ANDROID_SERIAL"
    return
  fi
  local lines count first
  lines=$($ADB_BIN devices | awk 'NR>1 && $2=="device"{print $1}')
  count=$(echo "$lines" | grep -c '.*' || true)
  [[ -n "$lines" && "$count" -gt 0 ]] || die "Nenhum dispositivo/emulador com status 'device' conectado."
  first=$(echo "$lines" | head -n1 | tr -d '\r\n')
  export ANDROID_SERIAL="$first"
  log "Selecionado automaticamente o primeiro device: $ANDROID_SERIAL"
}

wait_for_device_if_needed() {
  if [[ "$WAIT_FOR_DEVICE" -eq 1 ]]; then
    log "Aguardando dispositivo ficar pronto..."
    $ADB_BIN wait-for-device
  fi
}

# Converte 'debug' -> 'Debug', 'release' -> 'Release', 'freeDebug' -> 'FreeDebug'
variant_pascal() {
  local v="${1:-debug}"
  printf "%s%s" "${v[1,1]:u}" "${v[2,-1]}"
}

gradle_sync_and_build() {
  local VARIANT_PASCAL; VARIANT_PASCAL="$(variant_pascal "$VARIANT")"
  local assembleTask=":${MODULE}:assemble${VARIANT_PASCAL}"
  log "Resolvendo dependências (refresh) e buildando: $assembleTask"
  "$GRADLEW" --console=plain --refresh-dependencies "$assembleTask" |& tee -a "$BUILD_LOG"
}

# Instala usando Gradle task; fallback via adb -r
install_apk() {
  local VARIANT_PASCAL; VARIANT_PASCAL="$(variant_pascal "$VARIANT")"
  local installTask=":${MODULE}:install${VARIANT_PASCAL}"
  log "Instalando APK via Gradle task: $installTask"
  if ! "$GRADLEW" --console=plain "$installTask" |& tee -a "$BUILD_LOG"; then
    echo "[WARN] Falha na task install*. Tentando via adb (fallback)..." | tee -a "$BUILD_LOG"
    local apk
    apk=$(find "$PWD/${MODULE}/build/outputs/apk/${VARIANT}" -type f -name "*.apk" | head -n1 || true)
    [[ -n "$apk" ]] || die "APK não encontrado para variante '${VARIANT}'. Rode o assemble primeiro."
    $ADB_BIN install -r "$apk" |& tee -a "$BUILD_LOG"
  fi
}

resolve_launcher_component() {
  $ADB_BIN shell cmd package resolve-activity --brief "$APP_ID" 2>/dev/null | tail -n1 | tr -d '\r'
}

launch_app() {
  [[ -n "$APP_ID" ]] || die "APP_ID não definido."
  local component resolved
  if [[ -z "$MAIN_ACTIVITY" ]]; then
    log "Resolvendo atividade LAUNCHER de ${APP_ID}..."
    resolved="$(resolve_launcher_component || true)"
    if [[ -n "$resolved" && "$resolved" != "no activity found" ]]; then
      component="$resolved"
      log "Atividade detectada: $component"
    else
      echo "[WARN] Não foi possível resolver via cmd package. Tentando iniciar com monkey..." | tee -a "$BUILD_LOG"
      if $ADB_BIN shell monkey -p "$APP_ID" -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1; then
        log "App iniciado via monkey."
        return
      else
        die "Falha ao iniciar o app com monkey."
      fi
    fi
  else
    component="${APP_ID}/${MAIN_ACTIVITY#.}"
  fi

  log "Abrindo atividade: $component"
  if ! $ADB_BIN shell am start -n "$component" >/dev/null 2>&1; then
    echo "[WARN] Falha ao iniciar via 'am start -n'. Tentando fallback com monkey..." | tee -a "$BUILD_LOG"
    $ADB_BIN shell monkey -p "$APP_ID" -c android.intent.category.LAUNCHER 1 >/dev/null 2>&1 || \
      die "Falha ao iniciar o app (am/monkey)."
  fi
}

# Resolve PID do pacote com retries
resolve_pid_for_package() {
  local pkg="$1"
  local tries="${2:-30}"
  local sleep_s="0.3"
  local pid=""
  for ((i=1; i<=tries; i++)); do
    pid="$($ADB_BIN shell pidof -s "$pkg" 2>/dev/null | tr -d '\r')"
    if [[ -z "$pid" ]]; then
      pid="$($ADB_BIN shell 'ps -A | grep -w '"$pkg"' | awk "{print \$2}"' 2>/dev/null | tr -d '\r')"
    fi
    if [[ -n "$pid" ]]; then
      echo "$pid"
      return 0
    fi
    sleep "$sleep_s"
  done
  return 1
}

# Dump único de eventos do sistema (para capturar o start inicial e possíveis crashes)
append_system_events_snapshot() {
  $ADB_BIN logcat -d -v time -b all | \
    grep -E "$APP_ID|ActivityManager|ActivityTaskManager|AndroidRuntime" || true
}

# Inicia logcat:
# - Se LOG_LEVEL_FILTER começar com "package:", usa --pid <pid> do pacote (mine => APP_ID) e ainda anexa um snapshot de eventos do sistema.
# - Senão, usa filtro literal (formato do logcat).
start_logcat() {
  echo "[INFO] Limpando logcat..." | tee -a "$BUILD_LOG"
  $ADB_BIN logcat -c 2>/dev/null || true

  local filter="$LOG_LEVEL_FILTER"
  local mode="raw"
  local pid=""
  local pkg="$APP_ID"

  echo "[INFO] Gravando logcat em: $RUNTIME_LOG" | tee -a "$BUILD_LOG"

  # Tenta usar UID (pega todos os processos do app)
  local app_uid="$($ADB_BIN shell dumpsys package "$pkg" | sed -n 's/.*userId=\([0-9]\+\).*/\1/p' | tr -d '\r')"
  if [[ -n "$app_uid" ]]; then
    echo "[INFO] Usando filtro por UID=$app_uid (mais estável que PID)" | tee -a "$BUILD_LOG"
    $ADB_BIN logcat --uid "$app_uid" -v time '*:I' 2>/dev/null | tee -a "$RUNTIME_LOG" &
    wait
    return
  fi

  # Fallback: resolver PID e anexar
  echo "[INFO] Resolvendo PID para pacote '${pkg}'..." | tee -a "$BUILD_LOG"
  if ! pid="$(resolve_pid_for_package "$pkg" 60)"; then
    echo "[ERRO] Não consegui resolver PID para ${pkg}. Abra a Activity e tente novamente." | tee -a "$BUILD_LOG"
    exit 1
  fi

  # Snapshot de eventos do sistema para contexto (não bloqueia execução principal)
  ($ADB_BIN logcat -d -v time -b all 2>/dev/null | grep -E "$pkg|ActivityManager|ActivityTaskManager|AndroidRuntime" > "$RUNTIME_SYS_LOG" 2>/dev/null || true) &

  while true; do
    echo "[INFO] Conectando logcat com --pid=$pid ..." | tee -a "$BUILD_LOG"
    $ADB_BIN logcat --pid "$pid" -v time '*:I' 2>/dev/null | tee -a "$RUNTIME_LOG" &
    logcat_pid=$!

    # Mantém enquanto /proc/<pid> existir
    while $ADB_BIN shell "ls -d /proc/$pid >/dev/null 2>&1"; do
      sleep 0.5
    done
    echo "[WARN] Processo $pid finalizou. Procurando novo PID..." | tee -a "$BUILD_LOG"
    kill "$logcat_pid" 2>/dev/null || true

    # Reanexar em novo PID
    if pid="$(resolve_pid_for_package "$pkg" 120)"; then
      echo "[INFO] Novo PID: $pid" | tee -a "$BUILD_LOG"
      continue
    else
      echo "[ERRO] Não encontrei novo PID. Encerrando logcat." | tee -a "$BUILD_LOG"
      break
    fi
  done
}

# ----------------------------
# Execução
# ----------------------------
ensure_tools
pick_device
wait_for_device_if_needed

# Build + install com log de build
local VARIANT_PASCAL; VARIANT_PASCAL="$(variant_pascal "$VARIANT")" || true
echo "[INFO] Iniciando build (variant=${VARIANT}, task=:${MODULE}:assemble${VARIANT_PASCAL})" | tee -a "$BUILD_LOG"
gradle_sync_and_build
if [[ "$INSTALL_ONLY" -eq 1 && "$BUILD_ONLY" -eq 1 ]]; then
  : # nada
elif [[ "$INSTALL_ONLY" -eq 1 ]]; then
  install_apk
elif [[ "$BUILD_ONLY" -eq 1 ]]; then
  : # já buildou
else
  install_apk
fi

# Abrir app (a não ser que --no-run)
if [[ "$NO_RUN" -eq 0 ]]; then
  launch_app
fi

# Iniciar logcat (após abrir o app)
start_logcat

echo "[OK] Tudo pronto. Logs:"
echo "  - Build log : $BUILD_LOG"
echo "  - Runtime   : $RUNTIME_LOG"
echo "  - Runtime   : $RUNTIME_SYS_LOG (eventos do sistema - snapshot inicial)"
echo "Pressione Ctrl+C para parar o logcat quando quiser."
wait
