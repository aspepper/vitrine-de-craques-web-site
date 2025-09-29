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

### Aviso sobre FFmpeg na build

Durante o `npm run build` pode aparecer o aviso `FFmpeg installer package not available. Falling back to system ffmpeg binary.`.
Ele indica que o pacote opcional `@ffmpeg-installer/ffmpeg` não forneceu um binário para a plataforma atual e que a aplicação
vai tentar usar o binário do FFmpeg disponível no sistema operacional. Caso você veja esse aviso:

- Verifique se o FFmpeg está instalado e acessível no seu `PATH` (por exemplo, executando `ffmpeg -version`). Em sistemas baseados em Debian/Ubuntu você pode instalá-lo com `sudo apt-get install ffmpeg`; no macOS utilize `brew install ffmpeg` e, no Windows, `choco install ffmpeg` ou baixe o executável em <https://ffmpeg.org/download.html>.
- Como alternativa, defina a variável de ambiente `FFMPEG_PATH` apontando para o caminho completo do binário FFmpeg que deve ser utilizado. Por exemplo, em uma shell Unix/Linux você pode adicionar `export FFMPEG_PATH=/usr/bin/ffmpeg` ao seu `.env` ou ao arquivo de inicialização da shell.

O aviso não interrompe o build, mas o upload de vídeos só funcionará se o binário estiver acessível.

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


