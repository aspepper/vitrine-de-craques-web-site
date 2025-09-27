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

curl -sS -H 'X-Figma-Token: figd_W_exi3tkL5S1Cn6mLn-XEfDkgeBICmgttw3NfPXc' 'https://api.figma.com/v1/files/6XEeSvXW0gl4gvxkovsiuz' > docs/figma.json
python3 split_figma_pages.py docs/figma.json docs/figma_pages

## Atualização da Base de Dados

npx prisma format
npx prisma generate

npx prisma migrate reset
npx prisma migrate deploy
npx prisma db seed

npx prisma migrate diff --from-schema-datamodel=prisma/schema.prisma --to-url="postgresql://neondb_owner:npg_r9PtvAIGRh3g@ep-dry-bar-a8fyzj2o-pooler.eastus2.azure.neon.tech/neondb?sslmode=require&channel_binding=require" --script > ./prisma/migrations/migration.sql

npx prisma migrate dev --name ./prisma/migrations/migration.sql

npm run db:push
npm run db:seed


npm test -- --run
npm install
npm run lint
npm run build

## Congelando uma release com tag

git tag -a v1.2.0 -m "Release ..."
git push origin v1.2.0

