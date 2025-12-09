#!/usr/bin/env bash
set -euo pipefail

TARGET_DIR="${1:-deploy}"

if [ ! -d "$TARGET_DIR" ]; then
  echo "Target directory '$TARGET_DIR' does not exist. Nothing to prune." >&2
  exit 0
fi

# Prisma runtime ships query engines for multiple databases. We only need the PostgreSQL ones
# in production. Removing the unused engines helps keeping the SWA package below the 250MB limit.
PRISMA_RUNTIME="$TARGET_DIR/node_modules/@prisma/client/runtime"
if [ -d "$PRISMA_RUNTIME" ]; then
  echo "Pruning unused Prisma runtime binaries..."
  while IFS= read -r pattern; do
    find "$PRISMA_RUNTIME" -maxdepth 1 -type f -name "$pattern" -print -delete
  done <<'PATTERNS'
query_engine_bg.cockroachdb.*
query_engine_bg.mysql.*
query_engine_bg.sqlite.*
query_engine_bg.sqlserver.*
query_compiler_bg.cockroachdb.*
query_compiler_bg.mysql.*
query_compiler_bg.sqlite.*
query_compiler_bg.sqlserver.*
PATTERNS
fi

PRISMA_ENGINES="$TARGET_DIR/node_modules/@prisma/engines"
if [ -d "$PRISMA_ENGINES" ]; then
  echo "Removing Prisma schema engines not required at runtime..."
  find "$PRISMA_ENGINES" -maxdepth 1 -type d -name 'schema-engine-*' -print -exec rm -rf {} +
  find "$PRISMA_ENGINES" -maxdepth 1 -type f -name 'schema-engine-*' -print -delete
fi

PRISMA_CLIENT_BINARIES="$TARGET_DIR/node_modules/.prisma/client"
if [ -d "$PRISMA_CLIENT_BINARIES" ]; then
  echo "Removing unused Prisma client engines..."
  find "$PRISMA_CLIENT_BINARIES" -maxdepth 1 -type f -name 'libquery_engine*' \
    ! -name 'libquery_engine-debian-openssl-3.0.x.so.node' \
    ! -name 'libquery_engine-debian-openssl-1.1.x.so.node' \
    ! -name 'libquery_engine-linux-musl-openssl-3.0.x.so.node' -print -delete
fi

IMG_DIR="$TARGET_DIR/node_modules/@img"
if [ -d "$IMG_DIR" ]; then
  echo "Cleaning up optional sharp binaries..."
  rm -rf "$IMG_DIR"/sharp-libvips-linuxmusl-x64 "$IMG_DIR"/sharp-linuxmusl-x64 || true
fi

# Remove devDependencies manually. npm prune --omit=dev can re-install packages in
# the standalone bundle, so we explicitly delete anything declared as a
# devDependency to keep the SWA artifact small.
if [ -d "$TARGET_DIR/node_modules" ] && [ -f "$TARGET_DIR/package.json" ]; then
  echo "Removing development dependencies from deploy artifact..."
  node <<'NODE' "$TARGET_DIR/package.json"
const path = require('path');
const fs = require('fs');

const pkgPath = process.argv[1];
const pkg = require(pkgPath);
const base = path.dirname(pkgPath);
const devDeps = Object.keys(pkg.devDependencies || {});

for (const dep of devDeps) {
  const target = path.join(base, 'node_modules', ...dep.split('/'));
  fs.rmSync(target, { recursive: true, force: true });
}
NODE
  find "$TARGET_DIR/node_modules" -type d -empty -delete
fi

# Remove source maps for dependencies to shrink the artifact a bit further.
if [ -d "$TARGET_DIR/node_modules" ]; then
  echo "Deleting dependency source maps..."
  find "$TARGET_DIR/node_modules" -type f \( -name '*.map' -o -name '*.d.ts.map' \) -delete
fi

# Remove build-time caches that are not required at runtime.
if [ -d "$TARGET_DIR/.next/cache" ]; then
  echo "Removing Next.js build cache..."
  rm -rf "$TARGET_DIR/.next/cache"
fi

# Strip version control and editor metadata that can bloat the SWA artifact.
rm -rf "$TARGET_DIR/.git" "$TARGET_DIR/.github" "$TARGET_DIR/.husky" "$TARGET_DIR/.vscode" "$TARGET_DIR/.idea"

# Remove any empty directories left behind by the pruning steps.
find "$TARGET_DIR" -type d -empty -delete

echo "Pruning finished."
