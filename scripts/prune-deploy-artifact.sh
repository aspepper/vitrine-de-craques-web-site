#!/usr/bin/env bash
set -euo pipefail

TARGET_DIR="${1:-deploy}"

if [ ! -d "$TARGET_DIR" ]; then
  echo "❌ Target directory '$TARGET_DIR' does not exist." >&2
  exit 0
fi

echo "=== 🚀 INICIANDO OTIMIZAÇÃO AGRESSIVA DO ARTEFATO ==="
echo "📂 Diretório alvo: $TARGET_DIR"
echo ""

# Tamanho inicial
TAMANHO_INICIAL=$(du -sm "$TARGET_DIR" | cut -f1)
echo "📏 Tamanho inicial: ${TAMANHO_INICIAL}MB"
echo ""

# ============================================================================
# 1. REMOVER PASTAS DO REPOSITÓRIO
# ============================================================================
echo "🗑️  [1/10] Removendo pastas de desenvolvimento..."
rm -rf \
  "$TARGET_DIR/docs" \
  "$TARGET_DIR/logs" \
  "$TARGET_DIR/Vitrine-De-Craques-App" \
  "$TARGET_DIR/Vitrine-De-Craques-App-iOS" \
  "$TARGET_DIR/.git" \
  "$TARGET_DIR/.github" \
  "$TARGET_DIR/.husky" \
  "$TARGET_DIR/.vscode" \
  "$TARGET_DIR/.idea" \
  "$TARGET_DIR/.next/cache" \
  2>/dev/null || true

# ============================================================================
# 2. OTIMIZAÇÃO CRÍTICA DO SHARP (@img)
# ============================================================================
echo "📐 [2/10] Otimizando Sharp (maior culpado:  33MB → ~10MB)..."

# Remove TODOS os binários Sharp exceto Linux x64
SHARP_MODULES="$TARGET_DIR/node_modules/@img"
if [ -d "$SHARP_MODULES" ]; then
  # Lista TODOS os subdiretórios de @img
  for dir in "$SHARP_MODULES"/*; do
    if [ -d "$dir" ]; then
      dirname=$(basename "$dir")
      # Mantém apenas os binários Linux x64 necessários
      if [[ "$dirname" != "sharp-linux-x64" && "$dirname" != "sharp-libvips-linux-x64" ]]; then
        echo "  🔸 Removendo: @img/$dirname"
        rm -rf "$dir"
      fi
    fi
  done
fi

# Remove arquivos desnecessários do sharp principal
SHARP_DIR="$TARGET_DIR/node_modules/sharp"
if [ -d "$SHARP_DIR" ]; then
  rm -rf "$SHARP_DIR/vendor" \
         "$SHARP_DIR/src" \
         "$SHARP_DIR/docs" \
         "$SHARP_DIR/test" \
         2>/dev/null || true
fi

# ============================================================================
# 3. OTIMIZAÇÃO DO PRISMA
# ============================================================================
echo "🔧 [3/10] Otimizando Prisma..."

# Remove engines de outros bancos
PRISMA_CLIENT="$TARGET_DIR/node_modules/.prisma/client"
if [ -d "$PRISMA_CLIENT" ]; then
  # Mantém APENAS libquery_engine para Debian OpenSSL 3.0.x
  find "$PRISMA_CLIENT" -type f -name "libquery_engine*" \
    !  -name "*debian-openssl-3.0.x*" \
    -exec echo "  🔸 Removendo: {}" \; \
    -exec rm -f {} \; 2>/dev/null || true
fi

# Remove schema engines (não usados em runtime)
PRISMA_ENGINES="$TARGET_DIR/node_modules/@prisma/engines"
if [ -d "$PRISMA_ENGINES" ]; then
  rm -rf "$PRISMA_ENGINES"/schema-engine-* \
         "$PRISMA_ENGINES"/prisma-fmt-* \
         2>/dev/null || true
fi

# ============================================================================
# 4. AWS SDK (mantido por padrão para evitar falhas em runtime)
# ============================================================================
echo "☁️  [4/10] AWS SDK mantido por padrão..."
if [ "${PRUNE_AWS_SDK:-false}" = "true" ]; then
  AWS_SDK="$TARGET_DIR/node_modules/@aws-sdk"
  if [ -d "$AWS_SDK" ]; then
    AWS_COUNT=$(find "$AWS_SDK" -maxdepth 1 -type d | wc -l)
    echo "  📦 Encontrados $AWS_COUNT pacotes AWS SDK"

    for dir in "$AWS_SDK"/*; do
      if [ -d "$dir" ]; then
        dirname=$(basename "$dir")
        if [[ "$dirname" != "client-s3" && "$dirname" != "@aws-sdk" ]]; then
          if [[ ! "$dirname" =~ ^(smithy|types|util|middleware|signature) ]]; then
            echo "  🔸 Removendo:  @aws-sdk/$dirname"
            rm -rf "$dir"
          fi
        fi
      fi
    done
  fi
fi

# ============================================================================
# 5. REMOVER TESTES E DOCUMENTAÇÃO DE NODE_MODULES
# ============================================================================
echo "📚 [5/10] Removendo testes e documentação..."
if [ -d "$TARGET_DIR/node_modules" ]; then
  find "$TARGET_DIR/node_modules" -type d \( \
    -name "__tests__" -o \
    -name "test" -o \
    -name "tests" -o \
    -name "*.test" -o \
    -name "examples" -o \
    -name "example" -o \
    -name "docs" -o \
    -name "documentation" -o \
    -name "coverage" -o \
    -name ".github" -o \
    -name "man" \
  \) -exec rm -rf {} + 2>/dev/null || true
  
  find "$TARGET_DIR/node_modules" -type f \( \
    -name "README*" -o \
    -name "CHANGELOG*" -o \
    -name "HISTORY*" -o \
    -name "LICENSE*" -o \
    -name "CONTRIBUTING*" -o \
    -name "*.md" -o \
    -name ".npmignore" -o \
    -name ".gitignore" -o \
    -name ".eslintrc*" -o \
    -name ".prettierrc*" -o \
    -name "tsconfig.json" \
  \) -delete 2>/dev/null || true
fi

# ============================================================================
# 6. REMOVER SOURCE MAPS E TYPESCRIPT
# ============================================================================
echo "🗺️  [6/10] Removendo source maps e TypeScript..."
if [ -d "$TARGET_DIR/node_modules" ]; then
  find "$TARGET_DIR/node_modules" -type f \( \
    -name "*.map" -o \
    -name "*.d.ts.map" \
  \) -delete 2>/dev/null || true
  
  # Remove arquivos . d.ts (não necessários em runtime)
  find "$TARGET_DIR/node_modules" -name "*.d.ts" -delete 2>/dev/null || true
fi

# ============================================================================
# 7. REMOVER BINÁRIOS DESNECESSÁRIOS
# ============================================================================
echo "⚙️  [7/10] Removendo binários desnecessários..."
if [ -d "$TARGET_DIR/node_modules/.bin" ]; then
  # Remove todos os binários (Next.js standalone não precisa deles)
  rm -rf "$TARGET_DIR/node_modules/.bin" 2>/dev/null || true
fi

# ============================================================================
# 8. REMOVER DEV DEPENDENCIES RESIDUAIS
# ============================================================================
echo "🧹 [8/10] Removendo devDependencies residuais..."
DEV_PACKAGES=(
  "eslint*"
  "prettier*"
  "typescript"
  "@types/*"
  "vitest*"
  "playwright*"
  "@vitejs/*"
  "husky*"
  "lint-staged*"
)

for pattern in "${DEV_PACKAGES[@]}"; do
  find "$TARGET_DIR/node_modules" -maxdepth 1 -type d -name "$pattern" \
    -exec rm -rf {} + 2>/dev/null || true
done

# ============================================================================
# 9. OTIMIZAÇÃO DE NEXT.JS
# ============================================================================
echo "⚡ [9/10] Otimizando Next.js..."
NEXT_DIR="$TARGET_DIR/node_modules/next"
if [ -d "$NEXT_DIR" ]; then
  # Remove arquivos WASM não usados
  find "$NEXT_DIR" -name "*.wasm" -delete 2>/dev/null || true
  
  # Remove source maps do Next.js
  find "$NEXT_DIR" -name "*.map" -delete 2>/dev/null || true
fi

# ============================================================================
# 10. LIMPEZA FINAL
# ============================================================================
echo "🧽 [10/10] Limpeza final..."

# Remove package-lock.json (não necessário em runtime)
rm -f "$TARGET_DIR/package-lock.json" 2>/dev/null || true

# Remove diretórios vazios
find "$TARGET_DIR" -type d -empty -delete 2>/dev/null || true

# Tamanho final
TAMANHO_FINAL=$(du -sm "$TARGET_DIR" | cut -f1)
REDUCAO=$((TAMANHO_INICIAL - TAMANHO_FINAL))

echo ""
echo "=== ✅ OTIMIZAÇÃO CONCLUÍDA ==="
echo ""
echo "📊 Resumo:"
echo "   Tamanho inicial: ${TAMANHO_INICIAL}MB"
echo "   Tamanho final:    ${TAMANHO_FINAL}MB"
echo "   Redução:         ${REDUCAO}MB"
echo ""

# Verifica se atingiu a meta
if [ "$TAMANHO_FINAL" -le 100 ]; then
  echo "✅ META ATINGIDA!  Artefato com ${TAMANHO_FINAL}MB (< 100MB)"
else
  echo "⚠️  Meta não atingida. Artefato com ${TAMANHO_FINAL}MB (meta: < 100MB)"
  echo ""
  echo "🔍 Top 10 maiores pastas:"
  du -sm "$TARGET_DIR/node_modules"/* 2>/dev/null | sort -rn | head -10 || true
fi

echo "Prune aplicado com sucesso"
