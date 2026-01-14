#!/usr/bin/env bash
set -euo pipefail

: "${DATABASE_URL:?Defina DATABASE_URL}"

export DATABASE_URL
npx prisma migrate deploy
