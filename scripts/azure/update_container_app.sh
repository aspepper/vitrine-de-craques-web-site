#!/usr/bin/env bash
set -euo pipefail

: "${AZURE_RESOURCE_GROUP:?Defina AZURE_RESOURCE_GROUP}"
: "${AZURE_CONTAINER_APP_NAME:?Defina AZURE_CONTAINER_APP_NAME}"
: "${GHCR_IMAGE:?Defina GHCR_IMAGE (ex: ghcr.io/org/repo:sha)}"

az containerapp update \
  --name "$AZURE_CONTAINER_APP_NAME" \
  --resource-group "$AZURE_RESOURCE_GROUP" \
  --image "$GHCR_IMAGE"

if [[ -n "${ENV_VARS:-}" ]]; then
  az containerapp update \
    --name "$AZURE_CONTAINER_APP_NAME" \
    --resource-group "$AZURE_RESOURCE_GROUP" \
    --set-env-vars $ENV_VARS
fi
