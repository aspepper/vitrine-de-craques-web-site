#!/usr/bin/env zsh
set -euo pipefail

# -----------------------------------------------------
# build-release.zsh
# Gera artefatos release (APK e/ou AAB) com logs e hashes.
# Inspirado no estilo do run_android.zsh do projeto.
# -----------------------------------------------------

# ----------------------------
# Configurações padrão
# ----------------------------
MODULE="${MODULE:-app}"                    # módulo Android (geralmente 'app')
VARIANT="${VARIANT:-release}"              # release | <flavor>Release
GRADLEW="${GRADLEW:-./gradlew}"            # caminho para o gradlew
LOG_DIR="${LOG_DIR:-./logs}"               # pasta dos logs
DIST_DIR="${DIST_DIR:-./dist}"             # pasta destino dos artefatos
BUILD_APK="${BUILD_APK:-1}"                # 1 => gera APK (assembleRelease)
BUILD_AAB="${BUILD_AAB:-1}"                # 1 => gera AAB (bundleRelease)
CLEAN_FIRST="${CLEAN_FIRST:-1}"            # 1 => roda clean
SIGNING_REPORT="${SIGNING_REPORT:-0}"      # 1 => roda signingReport
PRINT_CERT_INFO="${PRINT_CERT_INFO:-0}"    # 1 => tenta imprimir informações do cert (requer keytool + keystore)

# Opcional: variáveis para imprimir cert (p.ex. Upload Key no Play)
# Exija store file/senhas apenas quando PRINT_CERT_INFO=1
VC_STORE_FILE="${VC_STORE_FILE:-}"
VC_STORE_PASSWORD="${VC_STORE_PASSWORD:-}"

# Timestamp único para este build
STAMP="$(date +"%Y%m%d-%H%M%S")"
BUILD_LOG="${LOG_DIR}/build-${VARIANT}-${STAMP}.log"

mkdir -p "${LOG_DIR}" "${DIST_DIR}"

# ----------------------------
# Ajuda/flags
# ----------------------------
usage() {
  cat <<'EOF'
Uso:
  [VARIÁVEIS] ./build-release.zsh [--apk-only|--aab-only|--no-clean] [--variant <Variant>] [--module <mod>] [--signing-report] [--print-cert]

Exemplos:
  ./build-release.zsh
  VARIANT=release ./build-release.zsh
  MODULE=app VARIANT=prodRelease ./build-release.zsh --aab-only
  LOG_DIR=./logs DIST_DIR=./dist ./build-release.zsh --apk-only --signing-report

Opções:
  --apk-only        Gera apenas APK (assemble<Variant>).
  --aab-only        Gera apenas AAB (bundle<Variant>).
  --no-clean        Não executa o gradle clean antes.
  --variant <Var>   Define a variante (ex.: release, prodRelease).
  --module <Mod>    Define o módulo (default: app).
  --signing-report  Executa ./gradlew signingReport ao final.
  --print-cert      Tenta imprimir dados do certificado da keystore (requer keytool + VC_STORE_*).

Variáveis úteis:
  MODULE, VARIANT, GRADLEW, LOG_DIR, DIST_DIR, BUILD_APK, BUILD_AAB, CLEAN_FIRST, SIGNING_REPORT, PRINT_CERT_INFO,
  VC_STORE_FILE, VC_STORE_PASSWORD
EOF
}

APK_ONLY=0
AAB_ONLY=0

# ----------------------------
# Parse de flags
# ----------------------------
while [[ $# -gt 0 ]]; do
  case "$1" in
    --apk-only)        APK_ONLY=1 ;;
    --aab-only)        AAB_ONLY=1 ;;
    --no-clean)        CLEAN_FIRST=0 ;;
    --variant)         shift; VARIANT="${1:-$VARIANT}" ;;
    --module)          shift; MODULE="${1:-$MODULE}" ;;
    --signing-report)  SIGNING_REPORT=1 ;;
    --print-cert)      PRINT_CERT_INFO=1 ;;
    -h|--help)         usage; exit 0 ;;
    *) echo "[ERRO] Opção desconhecida: $1"; usage; exit 1 ;;
  esac
  shift
done

if [[ "$APK_ONLY" -eq 1 && "$AAB_ONLY" -eq 1 ]]; then
  echo "[ERRO] Use --apk-only ou --aab-only, não ambos."
  exit 1
fi

if [[ "$APK_ONLY" -eq 1 ]]; then
  BUILD_APK=1
  BUILD_AAB=0
elif [[ "$AAB_ONLY" -eq 1 ]]; then
  BUILD_APK=0
  BUILD_AAB=1
fi

# ----------------------------
# Funções auxiliares
# ----------------------------
die() { echo "[ERRO] $*" >&2; exit 1; }
log() { echo "[INFO] $*"; }

ensure_tools() {
  [[ -x "$GRADLEW" ]] || die "gradlew não encontrado/exec. ($GRADLEW)"
  command -v grep >/dev/null 2>&1 || die "grep não encontrado."
  command -v sed  >/dev/null 2>&1 || die "sed não encontrado."
  command -v awk  >/dev/null 2>&1 || die "awk não encontrado."
}

variant_pascal() {
  # release -> Release | prodRelease -> ProdRelease
  local v="$1"
  echo "${v:0:1:u}${v:1}" | sed -E 's/([a-z])([A-Z])/-\1\2/g' | sed 's/-//g'
}

# Copia artefatos encontrados para DIST_DIR e gera hash
copy_and_hash() {
  local src="$1"
  local dst_name="$2"
  local base="$(basename "$src")"
  local ext="${base##*.}"
  local dst="${DIST_DIR}/${dst_name}.${ext}"
  cp -f "$src" "$dst"

  # SHA-256 (shasum em macOS, sha256sum em Linux)
  if command -v shasum >/dev/null 2>&1; then
    shasum -a 256 "$dst" | tee -a "$BUILD_LOG"
  elif command -v sha256sum >/dev/null 2>&1; then
    sha256sum "$dst" | tee -a "$BUILD_LOG"
  else
    openssl dgst -sha256 "$dst" | tee -a "$BUILD_LOG" || true
  fi
  echo "$dst"
}

print_cert_info() {
  [[ "$PRINT_CERT_INFO" -eq 1 ]] || return 0
  command -v keytool >/dev/null 2>&1 || { echo "[WARN] keytool não encontrado. Pulando --print-cert."; return 0; }
  [[ -n "${VC_STORE_FILE:-}" && -n "${VC_STORE_PASSWORD:-}" ]] || { echo "[WARN] VC_STORE_FILE/VC_STORE_PASSWORD não definidos."; return 0; }

  echo "[INFO] Certificado da keystore (alias pode ser solicitado):"
  keytool -list -v -storetype PKCS12 -keystore "$VC_STORE_FILE" -storepass "$VC_STORE_PASSWORD" || true
}

# ----------------------------
# Execução
# ----------------------------
ensure_tools

log "Módulo: ${MODULE} | Variante: ${VARIANT}"
log "Logs: ${BUILD_LOG}"
echo "--------------------------------------------" | tee "$BUILD_LOG"

if [[ "$CLEAN_FIRST" -eq 1 ]]; then
  log "Limpando build (clean)..."
  "$GRADLEW" --console=plain clean |& tee -a "$BUILD_LOG"
fi

VARIANT_PASCAL="$(variant_pascal "$VARIANT")"

ARTIFACTS_FOUND=0

if [[ "$BUILD_APK" -eq 1 ]]; then
  log "Gerando APK: :${MODULE}:assemble${VARIANT_PASCAL}"
  "$GRADLEW" --console=plain ":${MODULE}:assemble${VARIANT_PASCAL}" |& tee -a "$BUILD_LOG"

  apk_dir="${MODULE}/build/outputs/apk/${VARIANT}"
  if [[ -d "$apk_dir" ]]; then
    apk_path="$(find "$apk_dir" -type f -name '*.apk' | sort | tail -n1 || true)"
    if [[ -n "$apk_path" ]]; then
      log "APK gerado: $apk_path"
      dst=$(copy_and_hash "$apk_path" "app-${VARIANT}-${STAMP}")
      echo "[OK] APK copiado para: $dst" | tee -a "$BUILD_LOG"
      ARTIFACTS_FOUND=1
    else
      echo "[WARN] Nenhum APK encontrado em $apk_dir" | tee -a "$BUILD_LOG"
    fi
  else
    echo "[WARN] Diretório não encontrado: $apk_dir" | tee -a "$BUILD_LOG"
  fi
fi

if [[ "$BUILD_AAB" -eq 1 ]]; then
  log "Gerando AAB: :${MODULE}:bundle${VARIANT_PASCAL}"
  "$GRADLEW" --console=plain ":${MODULE}:bundle${VARIANT_PASCAL}" |& tee -a "$BUILD_LOG"

  aab_dir="${MODULE}/build/outputs/bundle/${VARIANT}"
  if [[ -d "$aab_dir" ]]; then
    aab_path="$(find "$aab_dir" -type f -name '*.aab' | sort | tail -n1 || true)"
    if [[ -n "$aab_path" ]]; then
      log "AAB gerado: $aab_path"
      dst=$(copy_and_hash "$aab_path" "app-bundle-${VARIANT}-${STAMP}")
      echo "[OK] AAB copiado para: $dst" | tee -a "$BUILD_LOG"
      ARTIFACTS_FOUND=1
    else
      echo "[WARN] Nenhum AAB encontrado em $aab_dir" | tee -a "$BUILD_LOG"
    fi
  else
    echo "[WARN] Diretório não encontrado: $aab_dir" | tee -a "$BUILD_LOG"
  fi
fi

if [[ "$SIGNING_REPORT" -eq 1 ]]; then
  log "Executando signingReport..."
  "$GRADLEW" --console=plain ":${MODULE}:signingReport" |& tee -a "$BUILD_LOG" || true
fi

print_cert_info |& tee -a "$BUILD_LOG" || true

if [[ "$ARTIFACTS_FOUND" -eq 0 ]]; then
  die "Nenhum artefato release foi encontrado. Verifique erros acima e a variante selecionada."
fi

echo "--------------------------------------------" | tee -a "$BUILD_LOG"
echo "[OK] Build release finalizado. Log em: ${BUILD_LOG}"
echo "[OK] Artefatos em: ${DIST_DIR}"
