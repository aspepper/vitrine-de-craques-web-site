#!/usr/bin/env bash
set -euo pipefail
FILE_KEY="${1:-}"; TOKEN="${2:-}"
test -n "$FILE_KEY" && test -n "$TOKEN" || { echo "Uso: $0 <FIGMA_FILE_KEY> <FIGMA_PAT>"; exit 1; }
mkdir -p docs
curl -sS -H "X-Figma-Token: ${TOKEN}" "https://api.figma.com/v1/files/${FILE_KEY}" > docs/figma.json
echo "Gerado: docs/figma.json"
