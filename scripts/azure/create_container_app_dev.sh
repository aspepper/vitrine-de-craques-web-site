#!/usr/bin/env bash
set -euo pipefail

: "${AZURE_RESOURCE_GROUP:?Defina AZURE_RESOURCE_GROUP}"
: "${AZURE_LOCATION:?Defina AZURE_LOCATION}"
: "${AZURE_ENVIRONMENT_NAME:?Defina AZURE_ENVIRONMENT_NAME}"
: "${AZURE_CONTAINER_APP_NAME:?Defina AZURE_CONTAINER_APP_NAME}"
: "${GHCR_IMAGE:?Defina GHCR_IMAGE (ex: ghcr.io/org/repo:latest)}"
: "${GHCR_USERNAME:?Defina GHCR_USERNAME}"
: "${GHCR_PASSWORD:?Defina GHCR_PASSWORD}"

: "${DATABASE_URL:?Defina DATABASE_URL}"

MIN_REPLICAS="${MIN_REPLICAS:-0}"
MAX_REPLICAS="${MAX_REPLICAS:-1}"

az group create \
  --name "$AZURE_RESOURCE_GROUP" \
  --location "$AZURE_LOCATION"

az containerapp env create \
  --name "$AZURE_ENVIRONMENT_NAME" \
  --resource-group "$AZURE_RESOURCE_GROUP" \
  --location "$AZURE_LOCATION"

az containerapp create \
  --name "$AZURE_CONTAINER_APP_NAME" \
  --resource-group "$AZURE_RESOURCE_GROUP" \
  --environment "$AZURE_ENVIRONMENT_NAME" \
  --image "$GHCR_IMAGE" \
  --ingress external \
  --target-port 3000 \
  --min-replicas "$MIN_REPLICAS" \
  --max-replicas "$MAX_REPLICAS" \
  --registry-server ghcr.io \
  --registry-username "$GHCR_USERNAME" \
  --registry-password "$GHCR_PASSWORD"

az containerapp secret set \
  --name "$AZURE_CONTAINER_APP_NAME" \
  --resource-group "$AZURE_RESOURCE_GROUP" \
  --secrets \
    database-url="$DATABASE_URL" \
    nextauth-secret="${NEXTAUTH_SECRET:-}" \
    nextauth-url="${NEXTAUTH_URL:-}" \
    r2-endpoint="${R2_ENDPOINT:-}" \
    r2-bucket="${R2_BUCKET:-}" \
    r2-access-key-id="${R2_ACCESS_KEY_ID:-}" \
    r2-secret-access-key="${R2_SECRET_ACCESS_KEY:-}"

az containerapp update \
  --name "$AZURE_CONTAINER_APP_NAME" \
  --resource-group "$AZURE_RESOURCE_GROUP" \
  --set-env-vars \
    DATABASE_URL=secretref:database-url \
    NEXTAUTH_SECRET=secretref:nextauth-secret \
    NEXTAUTH_URL=secretref:nextauth-url \
    R2_ENDPOINT=secretref:r2-endpoint \
    R2_BUCKET=secretref:r2-bucket \
    R2_ACCESS_KEY_ID=secretref:r2-access-key-id \
    R2_SECRET_ACCESS_KEY=secretref:r2-secret-access-key

az containerapp show \
  --name "$AZURE_CONTAINER_APP_NAME" \
  --resource-group "$AZURE_RESOURCE_GROUP" \
  --query properties.configuration.ingress.fqdn \
  --output tsv
