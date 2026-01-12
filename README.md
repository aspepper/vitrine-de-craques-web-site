# Vitrine de Craques - Web

Este é o repositório para o front-end e back-end (via Next.js) do projeto Vitrine de Craques.

## Visão Geral

O projeto é uma plataforma para compartilhamento de vídeos curtos, permitindo que usuários mostrem seus talentos. Ele inclui autenticação de usuários, upload de vídeos, um feed de conteúdo e perfis de usuário, com uma interface fielmente baseada em um design do Figma.

## Tech Stack

-   **Framework:** [Next.js 14](https://nextjs.org/) (com App Router)
-   **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
-   **Estilização:** [Tailwind CSS](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/)
-   **ORM:** [Prisma](https://www.prisma.io/)
-   **Banco de Dados:** PostgreSQL
-   **Autenticação:** [NextAuth.js](https://next-auth.js.org/)
-   **Armazenamento de Arquivos:** Serviço compatível com S3
-   **Testes:** [Vitest](https://vitest.dev/) (Unitários) e [Playwright](https://playwright.dev/) (E2E)
-   **Linting/Formatting:** ESLint, Prettier, Husky

## Setup e Instalação

Consulte o arquivo `out/INSTRUCOES.md` para um guia detalhado de como instalar, configurar e rodar o projeto localmente.

## Auth0: habilitando logins sociais (Google, Facebook, Microsoft e Apple)

Se você quiser centralizar os logins sociais com o Auth0, siga os passos abaixo. Eles habilitam as conexões sociais no Auth0 e deixam pronto para integrar no projeto.

### 1) Criar tenant e aplicação no Auth0

1. Crie um tenant em https://manage.auth0.com/.
2. Em **Applications → Create Application**, escolha **Regular Web App**.
3. Em **Settings**, configure:
   - **Allowed Callback URLs**:
     - `http://localhost:3000/api/auth/callback/auth0`
     - `https://SEU_DOMINIO/api/auth/callback/auth0`
   - **Allowed Logout URLs**:
     - `http://localhost:3000`
     - `https://SEU_DOMINIO`
   - **Allowed Web Origins**:
     - `http://localhost:3000`
     - `https://SEU_DOMINIO`
4. Salve e copie **Client ID**, **Client Secret** e **Domain** (Issuer).

> Observação: se você preferir usar os providers diretos do NextAuth (Google, Facebook, etc.), basta preencher as variáveis `GOOGLE_CLIENT_ID`, `FACEBOOK_CLIENT_ID`, `MICROSOFT_CLIENT_ID` e `APPLE_CLIENT_ID` no `.env.local`. O fluxo abaixo é para quem usa Auth0 como hub de autenticação.

### 2) Ativar conexões sociais no Auth0

No Auth0, vá em **Authentication → Social** e habilite cada conexão.

#### Google
1. No Google Cloud Console, crie um projeto e ative **OAuth consent screen**.
2. Em **APIs & Services → Credentials**, crie **OAuth Client ID (Web)**.
3. Configure o **Authorized redirect URIs**:
   - `https://SEU_DOMINIO_AUTH0/login/callback`
4. Copie **Client ID** e **Client Secret** para a conexão Google no Auth0.

#### Facebook
1. No Meta for Developers, crie um App.
2. Em **Facebook Login → Settings**, adicione o **Valid OAuth Redirect URIs**:
   - `https://SEU_DOMINIO_AUTH0/login/callback`
3. Copie **App ID** e **App Secret** e configure a conexão Facebook no Auth0.

#### Microsoft
1. No Azure Portal, registre um app em **Azure Active Directory → App registrations**.
2. Em **Authentication**, adicione um **Web Redirect URI**:
   - `https://SEU_DOMINIO_AUTH0/login/callback`
3. Crie um **Client Secret** e copie **Application (client) ID** + **Secret**.
4. Configure esses dados na conexão **Microsoft** no Auth0.

#### Apple
1. No Apple Developer, crie um **Service ID** e habilite **Sign in with Apple**.
2. Configure o **Return URL**:
   - `https://SEU_DOMINIO_AUTH0/login/callback`
3. Gere a **Key (.p8)**, copie **Key ID**, **Team ID** e **Service ID**.
4. Informe esses dados na conexão Apple no Auth0.

### 3) Variáveis de ambiente para Auth0 (caso use o provider Auth0)

Adicione no `.env.local`:

```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=uma-chave-secreta-forte

AUTH0_CLIENT_ID=seu_client_id
AUTH0_CLIENT_SECRET=seu_client_secret
AUTH0_ISSUER_BASE_URL=https://SEU_DOMINIO_AUTH0
```

Depois, reinicie o servidor local. Em produção, use `NEXTAUTH_URL` com o domínio real da aplicação.

## Estrutura do Projeto

-   `app/`: Contém todas as rotas, páginas e layouts da aplicação (App Router).
-   `components/`: Componentes React reutilizáveis.
    -   `ui/`: Componentes do shadcn/ui.
-   `lib/`: Funções utilitárias e configurações.
-   `prisma/`: Contém o schema do banco de dados, migrações e seeds.
-   `public/`: Arquivos estáticos.
-   `tests/`: Testes unitários e de ponta-a-ponta.


## Atualizações

- Alinhamento de tokens com UI kit e uso de imagem hero externa otimizada.

## Obter json do Figma

% curl -sS -H 'X-Figma-Token: figd_W_exi3tkL5S1Cn6mLn-XEfDkgeBICmgttw3NfPXc' 'https://api.figma.com/v1/files/6XEeSvXW0gl4gvxkovsiuz' > docs/figma.json
% python3 split_figma_pages.py docs/figma.json docs/figma_pages

## Atualização da Base de Dados

% npx prisma format
% npx prisma generate
% npx prisma generate --schema prisma/schema.prisma
% npx prisma migrate dev --name add-comments-support --create-only --schema prisma/schema.prisma

### Verifica status do migration

% npx prisma migrate status --schema prisma/schema.prisma

### Gerando o Migration

% export DATABASE_URL='postgresql://neondb_owner:npg_r9PtvAIGRh3g@ep-dry-bar-a8fyzj2o-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require'
% export SHADOW_DATABASE_URL='postgresql://neondb_owner:npg_r9PtvAIGRh3g@ep-dry-bar-a8fyzj2o-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require'
% # 2.1. Gere o SQL de init (vazio -> schema.prisma)

### Gerando o migrate das diferenças

% npx prisma migrate dev --name init --create-only --schema prisma/schema.prisma
% cp /tmp/init.sql prisma/migrations/20XXXXXXXXXXXX_init/migration.sql

% npx prisma migrate dev --name add_users_blocked_following_followed  --schema prisma/schema.prisma

### Volta um migration específico

% npx prisma migrate resolve --rolled-back "" --schema prisma/schema.prisma

### Aplica um migration

% npx prisma migrate resolve --applied "" --schema prisma/schema.prisma

### Limpa todos os migrations e zera a base de dados

% npx prisma migrate reset

### Aplica os migrations

% npx prisma migrate deploy

### Prepara para inserir os dados

% npx prisma db seed

% npx prisma migrate diff --from-schema-datamodel=prisma/schema.prisma --to-url="postgresql://neondb_owner:npg_r9PtvAIGRh3g@ep-dry-bar-a8fyzj2o-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require" --script > ./prisma/migrations/migration.sql

% npx prisma migrate dev --name ./prisma/migrations/migration.sql

### Aplica os migrations

% npm run db:push

### Popula a base de dados

% npm run db:seed

% npm test -- --run
% npm install
% npm run lint
% npm run build

### backup

% pg_dump "postgresql://neondb_owner:npg_r9PtvAIGRh3g@ep-dry-bar-a8fyzj2o-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require" > backup_pre_migrate_$(date +%Y%m%d_%H%M%S).sql

### Backup só dos dados:

% STAMP=$(date +'%Y%m%d_%H%M%S')
% OUT="backup_data_${STAMP}.dump"
% pg_dump "postgresql://neondb_owner:npg_r9PtvAIGRh3g@ep-dry-bar-a8fyzj2o-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require" --format=custom --compress=9 --no-owner --no-privileges --data-only --schema=public --exclude-table-data=_prisma_migrations --file "$OUT"

### Restore os dados

-- Production
% pg_restore --dbname="postgresql://neondb_owner:npg_r9PtvAIGRh3g@ep-dry-bar-a8fyzj2o-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require" --data-only --no-owner --no-privileges --disable-triggers --jobs=4 backup_data_20250927_174357.dump

-- Developmento
% pg_restore --dbname="postgresql://neondb_owner:npg_r9PtvAIGRh3g@ep-summer-bush-a8oiqmqm-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require" --data-only --no-owner --no-privileges --disable-triggers --jobs=4 backup_data_20250927_174357.dump

### Dropa todas as tabelas
% psql "postgresql://neondb_owner:npg_r9PtvAIGRh3g@ep-dry-bar-a8fyzj2o-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require" -v ON_ERROR_STOP=1 -c 'DROP SCHEMA public CASCADE; CREATE SCHEMA public;'

psql "postgresql://neondb_owner:npg_r9PtvAIGRh3g@ep-summer-bush-a8oiqmqm-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require" -v ON_ERROR_STOP=1 -c 'DROP SCHEMA public CASCADE; CREATE SCHEMA public;'


## Congelando uma release com tag

% git tag -a v1.2.0 -m "Release ..."
% git push origin v1.2.0


psql "postgresql://neondb_owner:npg_r9PtvAIGRh3g@ep-dry-bar-a8fyzj2o-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require" -c 'SELECT migration_name, finished_at FROM "_prisma_migrations" WHERE finished_at IS NOT NULL ORDER BY finished_at DESC LIMIT 1;'

psql "postgresql://neondb_owner:npg_r9PtvAIGRh3g@ep-summer-bush-a8oiqmqm-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require" -c 'SELECT migration_name, finished_at FROM "_prisma_migrations" WHERE finished_at IS NOT NULL ORDER BY finished_at DESC LIMIT 1;'


### Gerando Keystore P12

keytool -genkeypair -v \
  -alias vitrine \
  -keyalg RSA -keysize 4096 \
  -sigalg SHA256withRSA \
  -validity 36500 \
  -storetype PKCS12 \
  -keystore vitrine-release.p12

Enter keystore password: V17r1n3-d3-cr4qu35@2025 <br />
Re-enter new password: V17r1n3-d3-cr4qu35@2025 <br />
Enter the distinguished name. Provide a single dot (.) to leave a sub-component empty or press ENTER to use the default value in braces. <br />
What is your first and last name? <br />
  [Unknown]:  Alex Pimenta <br />
What is the name of your organizational unit? <br />
  [Unknown]:  Vitrine de Craques <br />
What is the name of your organization? <br />
  [Unknown]:  Vitrine de Craques <br />
What is the name of your City or Locality? <br />
  [Unknown]:  Santos <br />
What is the name of your State or Province? <br />
  [Unknown]:  SP <br />
What is the two-letter country code for this unit? <br />
  [Unknown]:  BR <br />
Is CN=Alex Pimenta, OU=Vitrine de Craques, O=Vitrine de Craques, L=Santos, ST=SP, C=BR correct? <br />
  [no]:  yes <br />

Generating 4,096 bit RSA key pair and self-signed certificate (SHA256withRSA) with a validity of 36,500 days <br />
	for: CN=Alex Pimenta, OU=Vitrine de Craques, O=Vitrine de Craques, L=Santos, ST=SP, C=BR <br />
[Storing vitrine-release.p12] <br />


