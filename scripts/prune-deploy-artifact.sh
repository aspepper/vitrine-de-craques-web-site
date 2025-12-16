#!/usr/bin/env bash
set -euo pipefail

TARGET_DIR="${1:-deploy}"

if [ ! -d "$TARGET_DIR" ]; then
  echo "Target directory '$TARGET_DIR' does not exist.  Nothing to prune." >&2
  exit 0
fi

echo "=== INICIANDO OTIMIZAÇÃO AGRESSIVA DO ARTEFATO ==="

# ============================================================================
# 1. REMOVER PASTAS DO REPOSITÓRIO QUE NÃO DEVEM IR PARA O ARTEFATO
# ============================================================================
echo "🗑️  Removendo pastas de desenvolvimento..."
rm -rf "$TARGET_DIR/docs" \
       "$TARGET_DIR/logs" \
       "$TARGET_DIR/Vitrine-De-Craques-App" \
       "$TARGET_DIR/Vitrine-De-Craques-App-iOS" \
       "$TARGET_DIR/. git" \
       "$TARGET_DIR/. github" \
       "$TARGET_DIR/. husky" \
       "$TARGET_DIR/. vscode" \
       "$TARGET_DIR/. idea" \
       "$TARGET_DIR/. next/cache" 2>/dev/null || true

# ============================================================================
# 2. OTIMIZAÇÃO AGRESSIVA DO PRISMA
# ============================================================================
echo "🔧 Otimizando Prisma (mantendo apenas PostgreSQL para Debian)..."

# Remove engines para outros bancos de dados
PRISMA_RUNTIME="$TARGET_DIR/node_modules/@prisma/client/runtime"
if [ -d "$PRISMA_RUNTIME" ]; then
  find "$PRISMA_RUNTIME" -maxdepth 1 -type f \( \
    -name "*cockroachdb*" -o \
    -name "*mysql*" -o \
    -name "*sqlite*" -o \
    -name "*sqlserver*" \
  \) -delete 2>/dev/null || true
fi

# Remove schema engines (não necessários em runtime)
PRISMA_ENGINES="$TARGET_DIR/node_modules/@prisma/engines"
if [ -d "$PRISMA_ENGINES" ]; then
  find "$PRISMA_ENGINES" -maxdepth 1 \( \
    -name "schema-engine-*" -o \
    -name "prisma-fmt-*" -o \
    -name "introspection-engine-*" \
  \) -delete 2>/dev/null || true
fi

# Mantém apenas query engines para Debian/Linux
PRISMA_CLIENT="$TARGET_DIR/node_modules/. prisma/client"
if [ -d "$PRISMA_CLIENT" ]; then
  find "$PRISMA_CLIENT" -maxdepth 1 -type f -name "libquery_engine*" \
    !  -name "*debian-openssl-3.0.x*" \
    ! -name "*debian-openssl-1.1.x*" \
    -delete 2>/dev/null || true
fi

# ============================================================================
# 3. OTIMIZAÇÃO DO SHARP
# ============================================================================
echo "📐 Otimizando Sharp (mantendo apenas Linux x64)..."
SHARP_DIR="$TARGET_DIR/node_modules/sharp"
if [ -d "$SHARP_DIR" ]; then
  # Remove binários para outros sistemas operacionais
  find "$SHARP_DIR" -type d \( \
    -name "*darwin*" -o \
    -name "*win32*" -o \
    -name "*linuxmusl*" \
  \) -exec rm -rf {} + 2>/dev/null || true
fi

# ============================================================================
# 4. REMOVER AWS SDK COMPLETO (mantendo apenas S3)
# ============================================================================
echo "☁️ Otimizando AWS SDK..."
AWS_SDK="$TARGET_DIR/node_modules/@aws-sdk"
if [ -d "$AWS_SDK" ]; then
  # Lista todos os pacotes AWS exceto client-s3
  find "$AWS_SDK" -maxdepth 1 -type d !  -name "@aws-sdk" !  -name "client-s3" \
    -exec rm -rf {} + 2>/dev/null || true
fi

# ============================================================================
# 5. REMOVER TESTES, DOCUMENTAÇÃO E ARQUIVOS DE DESENVOLVIMENTO
# ============================================================================
echo "📚 Removendo testes e documentação..."
if [ -d "$TARGET_DIR/node_modules" ]; then
  # Remover pastas
  find "$TARGET_DIR/node_modules" -type d \( \
    -name "__tests__" -o \
    -name "test" -o \
    -name "tests" -o \
    -name "*. test" -o \
    -name "examples" -o \
    -name "example" -o \
    -name "docs" -o \
    -name "documentation" -o \
    -name "coverage" -o \
    -name ". github" -o \
    -name "man" -o \
    -name "scripts" \
  \) -exec rm -rf {} + 2>/dev/null || true
  
  # Remover arquivos de documentação
  find "$TARGET_DIR/node_modules" -type f \( \
    -name "README*" -o \
    -name "CHANGELOG*" -o \
    -name "HISTORY*" -o \
    -name "LICENSE*" -o \
    -name "CONTRIBUTING*" -o \
    -name "AUTHORS*" -o \
    -name "*. md" -o \
    -name "*.markdown" -o \
    -name ". npmignore" -o \
    -name ". gitignore" -o \
    -name ". git attributes" -o \
    -name ". eslintrc*" -o \
    -name ". prettierrc*" -o \
    -name "tsconfig.json" -o \
    -name "jest.config*" -o \
    -name "vitest.config*" -o \
    -name ". editorconfig" \
  \) -delete 2>/dev/null || true
fi

# ============================================================================
# 6. REMOVER SOURCE MAPS E ARQUIVOS TYPESCRIPT
# ============================================================================
echo "🗺️  Removendo source maps e TypeScript..."
if [ -d "$TARGET_DIR/node_modules" ]; then
  find "$TARGET_DIR/node_modules" -type f \( \
    -name "*.map" -o \
    -name "*. d.ts. map" -o \
    -name "*.ts" \
  \) ! -name "*. d.ts" -delete 2>/dev/null || true
  
  # Remove arquivos . d.ts também (não necessários em runtime)
  find "$TARGET_DIR/node_modules" -name "*.d.ts" -delete 2>/dev/null || true
fi

# ============================================================================
# 7. REMOVER BINÁRIOS DESNECESSÁRIOS
# ============================================================================
echo "⚙️  Removendo binários desnecessários..."
if [ -d "$TARGET_DIR/node_modules/. bin" ]; then
  # Remove todos os binários exceto prisma (se necessário)
  find "$TARGET_DIR/node_modules/.bin" -type f -o -type l \
    ! -name "prisma" -delete 2>/dev/null || true
fi

# ============================================================================
# 8. REMOVER DEPENDÊNCIAS DE DESENVOLVIMENTO DO STANDALONE
# ============================================================================
echo "🧹 Limpando devDependencies residuais..."
if [ -f "$TARGET_DIR/package.json" ]; then
  # Remove pacotes conhecidos de desenvolvimento que podem ter sobrado
  DEV_PACKAGES=(
    "eslint"
    "prettier"
    "typescript"
    "@types"
    "vitest"
    "playwright"
    "@vitejs"
    "husky"
    "lint-staged"
  )
  
  for pkg in "${DEV_PACKAGES[@]}"; do
    find "$TARGET_DIR/node_modules" -maxdepth 1 -type d -name "$pkg*" \
      -exec rm -rf {} + 2>/dev/null || true
  done
fi

# ============================================================================
# 9. REMOVER ARQUIVOS GRANDES DE FONTES E ASSETS
# ============================================================================
echo "🎨 Otimizando assets..."
if [ -d "$TARGET_DIR/node_modules" ]; then
  # Remove fontes não usadas (se houver)
  find "$TARGET_DIR/node_modules" -type f \( \
    -name "*. ttf" -o \
    -name "*.woff" -o \
    -name "*.woff2" -o \
    -name "*.eot" \
  \) -size +100k -delete 2>/dev/null || true
fi

# ============================================================================
# 10. LIMPEZA FINAL
# ============================================================================
echo "🧽 Limpeza final..."
# Remove diretórios vazios
find "$TARGET_DIR" -type d -empty -delete 2>/dev/null || true

# Remove package-lock.json se existir (não necessário em runtime)
rm -f "$TARGET_DIR/package-lock.json"

echo ""
echo "=== ✅ OTIMIZAÇÃO CONCLUÍDA ==="
echo ""
echo "📊 Tamanho final do artefato:"
du -sh "$TARGET_DIR"
echo ""
echo "📦 Principais componentes:"
du -sh "$TARGET_DIR/node_modules" 2>/dev/null || echo "node_modules:  N/A"
du -sh "$TARGET_DIR/. next" 2>/dev/null || echo ". next: N/A"
du -sh "$TARGET_DIR/public" 2>/dev/null || echo "public: N/A"
echo ""
echo "🔍 Top 10 maiores pastas em node_modules:"
du -sh "$TARGET_DIR/node_modules/"* 2>/dev/null | sort -rh | head -10 || echo "N/A"