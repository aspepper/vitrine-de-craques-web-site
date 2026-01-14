# Deploy no Azure Container Apps (Next.js + Prisma + PostgreSQL + R2)

Este guia descreve como criar e operar uma aplicação Next.js (output standalone) em **Azure Container Apps** com imagem publicada no **GHCR**.

## 1) Pré-requisitos

- Azure CLI instalado e autenticado.
- Permissões para criar Resource Group, Container Apps Environment e Container App.
- GitHub repository com GitHub Actions habilitado.
- Um PAT para GHCR (opcional se o repositório permitir GITHUB_TOKEN para push).

## 2) Variáveis de ambiente e segredos necessários

Defina as variáveis/segredos abaixo no Azure Container Apps:

- `DATABASE_URL` (Neon/PostgreSQL)
- `NEXTAUTH_SECRET` (se NextAuth for usado)
- `NEXTAUTH_URL` (ex: https://seu-dominio.com)
- `R2_ENDPOINT`
- `R2_BUCKET`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- Outros que já existem no `.env.example`

> **Motivo técnico:** os valores precisam estar em variáveis/segredos do Container App para evitar exposição em imagem/CI e permitir rotacionar chaves sem rebuild.

## 3) Criar Resource Group e Environment

```bash
az group create \
  --name <RESOURCE_GROUP> \
  --location <LOCATION>

az containerapp env create \
  --name <CONTAINERAPPS_ENV_NAME> \
  --resource-group <RESOURCE_GROUP> \
  --location <LOCATION>
```

- **DEV**: `minReplicas=0` (scale-to-zero)
- **PROD**: `minReplicas=1`

> **Motivo técnico:** ambiente DEV pode hibernar para economizar custo; PROD mantém pelo menos 1 instância para evitar cold start.

## 4) Criar Container App usando GHCR

Use o script `scripts/azure/create_container_app_dev.sh` (ou adapte para PROD) para:

- Criar o Container App
- Configurar ingress externo na porta 3000
- Configurar secrets e env vars
- Configurar GHCR registry

Exemplo manual (sem script):

```bash
az containerapp create \
  --name <APP_NAME> \
  --resource-group <RESOURCE_GROUP> \
  --environment <CONTAINERAPPS_ENV_NAME> \
  --image ghcr.io/<owner>/<repo>:latest \
  --ingress external \
  --target-port 3000 \
  --min-replicas 0 \
  --max-replicas 1 \
  --registry-server ghcr.io \
  --registry-username <GHCR_USERNAME> \
  --registry-password <GHCR_PAT>
```

> **Motivo técnico:** o Container App precisa conhecer o registry e autenticação para pull da imagem em cada nova revisão.

## 5) Configurar segredos + env vars

```bash
az containerapp secret set \
  --name <APP_NAME> \
  --resource-group <RESOURCE_GROUP> \
  --secrets \
    database-url='<DATABASE_URL>' \
    nextauth-secret='<NEXTAUTH_SECRET>' \
    nextauth-url='<NEXTAUTH_URL>' \
    r2-endpoint='<R2_ENDPOINT>' \
    r2-bucket='<R2_BUCKET>' \
    r2-access-key-id='<R2_ACCESS_KEY_ID>' \
    r2-secret-access-key='<R2_SECRET_ACCESS_KEY>'

az containerapp update \
  --name <APP_NAME> \
  --resource-group <RESOURCE_GROUP> \
  --set-env-vars \
    DATABASE_URL=secretref:database-url \
    NEXTAUTH_SECRET=secretref:nextauth-secret \
    NEXTAUTH_URL=secretref:nextauth-url \
    R2_ENDPOINT=secretref:r2-endpoint \
    R2_BUCKET=secretref:r2-bucket \
    R2_ACCESS_KEY_ID=secretref:r2-access-key-id \
    R2_SECRET_ACCESS_KEY=secretref:r2-secret-access-key
```

> **Motivo técnico:** Container Apps separa secrets de env vars para evitar expor credenciais em texto puro.

## 6) CI/CD via GitHub Actions

O workflow `deploy-aca-ghcr.yml`:

- Valida arquivos essenciais (`package.json`, `prisma/schema.prisma`, `next.config.mjs`)
- Build e push da imagem no GHCR (`latest` + `sha`)
- Atualiza o Container App com a nova imagem

### Segredos necessários no GitHub

Crie os seguintes secrets no repositório:

- `AZURE_CREDENTIALS`: JSON do Service Principal (exemplo abaixo)
- `AZURE_RESOURCE_GROUP`
- `AZURE_CONTAINER_APP_NAME`

Exemplo de `AZURE_CREDENTIALS`:

```json
{
  "clientId": "<APP_ID>",
  "clientSecret": "<PASSWORD>",
  "subscriptionId": "<SUBSCRIPTION_ID>",
  "tenantId": "<TENANT_ID>"
}
```

> **Motivo técnico:** o workflow precisa autenticar no Azure para atualizar o Container App com a nova imagem.

## 7) Ver logs e revisões

```bash
az containerapp logs show \
  --name <APP_NAME> \
  --resource-group <RESOURCE_GROUP>

az containerapp revision list \
  --name <APP_NAME> \
  --resource-group <RESOURCE_GROUP> \
  --output table
```

## 8) Obter FQDN e configurar domínio (opcional)

```bash
az containerapp show \
  --name <APP_NAME> \
  --resource-group <RESOURCE_GROUP> \
  --query properties.configuration.ingress.fqdn \
  --output tsv
```

Depois, aponte o DNS do seu domínio para o FQDN retornado.

## 9) Migrações do Prisma (manual)

O container **não** roda migrations automaticamente. Use o script manual:

```bash
./scripts/prisma/run_migrations.sh
```

> **Motivo técnico:** migrations automáticas em runtime podem causar downtime e lock de schema.
