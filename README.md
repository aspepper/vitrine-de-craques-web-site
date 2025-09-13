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

curl -sS -H 'X-Figma-Token: figd_wazQO-ahAC38LhoXwJcBYwYuvTT0Jz6NhSPVK8Oz' 'https://api.figma.com/v1/files/6XEeSvXW0gl4gvxkovsiuz' > docs/figma.json
python3 split_figma_pages.py docs/figma.json docs/figma_pages

## Atualização da Base de Dados

npx prisma format
npx prisma generate

npx prisma migrate deploy
npx prisma db seed

npx prisma migrate reset
npm run db:push
npm run db:seed


npm test -- --run
npm install
npm run lint
npm run build

