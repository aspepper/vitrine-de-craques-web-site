#!/usr/bin/env bash
set -euo pipefail

TARGET_DIR="${1:-deploy}"

if [ ! -d "$TARGET_DIR" ]; then
  echo "Target directory '$TARGET_DIR' does not exist.  Nothing to prune." >&2
  exit 0
fi

echo "=== INICIANDO OTIMIZAÇÃO DO ARTEFATO ==="

# ============================================================================
# 1. REMOVER PASTAS DO REPOSITÓRIO QUE NÃO DEVEM IR PARA O ARTEFATO
# ============================================================================
echo "Removendo pastas de desenvolvimento e documentação..."
rm -rf "$TARGET_DIR/docs" \
       "$TARGET_DIR/logs" \
       "$TARGET_DIR/Vitrine-De-Craques-App" \
       "$TARGET_DIR/Vitrine-De-Craques-App-iOS" \
       "$TARGET_DIR/. git" \
       "$TARGET_DIR/. github" \
       "$TARGET_DIR/. husky" \
       "$TARGET_DIR/. vscode" \
       "$TARGET_DIR/. idea" \
       "$TARGET_DIR/. next/cache"

# ============================================================================
# 2. OTIMIZAÇÃO DO PRISMA
# ============================================================================
# Prisma runtime ships query engines for multiple databases.  We only need PostgreSQL
echo "Otimizando Prisma runtime..."
PRISMA_RUNTIME="$TARGET_DIR/node_modules/@prisma/client/runtime"
if [ -d "$PRISMA_RUNTIME" ]; then
  while IFS= read -r pattern; do
    find "$PRISMA_RUNTIME" -maxdepth 1 -type f -name "$pattern" -print -delete 2>/dev/null || true
  done <<'PATTERNS'
query_engine_bg. cockroachdb.*
query_engine_bg.mysql.*
query_engine_bg. sqlite.*
query_engine_bg. sqlserver.*
query_compiler_bg.cockroachdb.*
query_compiler_bg.mysql.*
query_compiler_bg.sqlite.*
query_compiler_bg.sqlserver.*
PATTERNS
fi

PRISMA_ENGINES="$TARGET_DIR/node_modules/@prisma/engines"
if [ -d "$PRISMA_ENGINES" ]; then
  echo "Removendo Prisma schema engines (não necessários em runtime)..."
  find "$PRISMA_ENGINES" -maxdepth 1 -type d -name 'schema-engine-*' -exec rm -rf {} + 2>/dev/null || true
  find "$PRISMA_ENGINES" -maxdepth 1 -type f -name 'schema-engine-*' -delete 2>/dev/null || true
fi

PRISMA_CLIENT_BINARIES="$TARGET_DIR/node_modules/. prisma/client"
if [ -d "$PRISMA_CLIENT_BINARIES" ]; then
  echo "Mantendo apenas Prisma query engines para Debian/Linux..."
  find "$PRISMA_CLIENT_BINARIES" -maxdepth 1 -type f -name 'libquery_engine*' \
    !  -name 'libquery_engine-debian-openssl-3.0.x. so. node' \
    ! -name 'libquery_engine-debian-openssl-1.1.x.so.node' \
    ! -name 'libquery_engine-linux-musl-openssl-3.0.x. so.node' -print -delete 2>/dev/null || true
fi

# ============================================================================
# 3. OTIMIZAÇÃO DO SHARP (PROCESSAMENTO DE IMAGENS)
# ============================================================================
echo "Otimizando Sharp binaries..."
IMG_DIR="$TARGET_DIR/node_modules/@img"
if [ -d "$IMG_DIR" ]; then
  rm -rf "$IMG_DIR"/sharp-libvips-linuxmusl-x64 \
         "$IMG_DIR"/sharp-linuxmusl-x64 \
         "$IMG_DIR"/sharp-darwin* \
         "$IMG_DIR"/sharp-win32* 2>/dev/null || true
fi

# ============================================================================
# 4. REMOVER DEVDEPENDENCIES
# ============================================================================
if [ -d "$TARGET_DIR/node_modules" ] && [ -f "$TARGET_DIR/package.json" ]; then
  echo "Removendo devDependencies do artefato..."
  node <<'NODE' "$TARGET_DIR/package.json"
const path = require('path');
const fs = require('fs');

const pkgPath = process.argv[1];
const pkg = require(pkgPath);
const base = path.dirname(pkgPath);
const devDeps = Object.keys(pkg.devDependencies || {});

for (const dep of devDeps) {
  const target = path.join(base, 'node_modules', ... dep.split('/'));
  try {
    fs.rmSync(target, { recursive: true, force: true });
  } catch (e) {
    // Ignora se não existir
  }
}
NODE
fi

# ============================================================================
# 5. REMOVER ARQUIVOS DE TESTE E DOCUMENTAÇÃO
# ============================================================================
echo "Removendo testes e documentação de node_modules..."
if [ -d "$TARGET_DIR/node_modules" ]; then
  # Remover pastas de teste
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
    -name ". github" \
  \) -exec rm -rf {} + 2>/dev/null || true
  
  # Remover arquivos de documentação
  find "$TARGET_DIR/node_modules" -type f \( \
    -name "README*" -o \
    -name "CHANGELOG*" -o \
    -name "HISTORY*" -o \
    -name "LICENSE*" -o \
    -name "CONTRIBUTING*" -o \
    -name "*. md" -o \
    -name "*.markdown" -o \
    -name ". npmignore" -o \
    -name ". gitignore" -o \
    -name ". eslintrc*" -o \
    -name ". prettierrc*" -o \
    -name "tsconfig. json" -o \
    -name "jest.config*" -o \
    -name "vitest.config*" \
  \) -delete 2>/dev/null || true
fi

# ============================================================================
# 6. REMOVER SOURCE MAPS E ARQUIVOS TYPESCRIPT
# ============================================================================
echo "Removendo source maps e arquivos TypeScript..."
if [ -d "$TARGET_DIR/node_modules" ]; then
  find "$TARGET_DIR/node_modules" -type f \( \
    -name "*. map" -o \
    -name "*. d.ts. map" -o \
    -name "*.ts" \
  \) ! -name "*. d.ts" -delete 2>/dev/null || true
fi

# ============================================================================
# 7. REMOVER ARQUIVOS BINÁRIOS DESNECESSÁRIOS
# ============================================================================
echo "Removendo binários não utilizados..."
if [ -d "$TARGET_DIR/node_modules" ]; then
  # Remove binários do Next.js que não são necessários
  find "$TARGET_DIR/node_modules/. next" -name "*.wasm" -delete 2>/dev/null || true
  
  # Remove binários de desenvolvimento
  find "$TARGET_DIR/node_modules/.bin" -type f !  -name "prisma" -delete 2>/dev/null || true
fi

# ============================================================================
# 8. REMOVER AWS SDK DESNECESSÁRIO (se não usar S3)
# ============================================================================
# Se você usa apenas Azure Storage, pode descomentar isso:
# echo "Removendo AWS SDK completo (mantendo apenas S3 client)..."
# find "$TARGET_DIR/node_modules/@aws-sdk" -maxdepth 1 -type d !  -name "client-s3" -exec rm -rf {} + 2>/dev/null || true

# ============================================================================
# 9. LIMPEZA FINAL
# ============================================================================
echo "Removendo diretórios vazios..."
find "$TARGET_DIR/node_modules" -type d -empty -delete 2>/dev/null || true
find "$TARGET_DIR" -type d -empty -delete 2>/dev/null || true

echo "=== OTIMIZAÇÃO CONCLUÍDA ==="
echo ""
echo "📊 Tamanho final do artefato:"
du -sh "$TARGET_DIR"
echo ""
echo "📦 Principais componentes:"
du -sh "$TARGET_DIR/node_modules" 2>/dev/null || echo "node_modules:  N/A"
du -sh "$TARGET_DIR/. next" 2>/dev/null || echo ". next: N/A"
du -sh "$TARGET_DIR/public" 2>/dev/null || echo "public: N/A"