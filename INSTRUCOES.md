# Instruções de Setup - Vitrine de Craques

Siga os passos abaixo para configurar e rodar o projeto em seu ambiente de desenvolvimento.

## 1. Pré-requisitos

- Node.js (v18 ou superior)
- npm, yarn ou pnpm
- Docker e Docker Compose (para o banco de dados PostgreSQL)

## 2. Instalação

1.  **Descompacte o arquivo** `vitrine-next.zip` em um diretório de sua escolha.
2.  Navegue até a pasta do projeto:
    ```bash
    cd vitrine-de-craques-web-site
    ```
3.  **Instale as dependências:**
    ```bash
    npm install
    ```

## 3. Configuração do Ambiente

1.  **Crie o arquivo de ambiente:**
    Copie o arquivo de exemplo `.env.example` para um novo arquivo chamado `.env`.
    ```bash
    cp .env.example .env
    ```

2.  **Inicie o banco de dados:**
    Use o Docker Compose para iniciar um container PostgreSQL.
    ```bash
    docker-compose up -d
    ```

3.  **Configure as variáveis de ambiente no arquivo `.env`:**
    - `DATABASE_URL`: Já vem pré-configurado para o banco de dados Docker.
    - `NEXTAUTH_SECRET`: Gere uma chave secreta. Você pode usar o comando `openssl rand -base64 32`.
    - `NEXTAUTH_URL`: Deve ser `http://localhost:3000`.
    - Configure as variáveis de armazenamento (`STORAGE_*` ou `R2_*`/`AZURE_STORAGE_*`, dependendo do provedor escolhido).

## 4. Banco de Dados (Prisma)

1.  **Aplique as migrações do Prisma:**
    Utilize o comando abaixo para garantir que todas as migrações versionadas sejam executadas (incluindo a criação da tabela `Follow`, usada para o recurso de seguidores).
    ```bash
    npm run deploy
    ```
2.  **(Opcional) Sincronize o schema diretamente:**
    Para ambientes de desenvolvimento, você ainda pode utilizar o `db:push` se preferir uma abordagem sem histórico de migrações.
    ```bash
    npm run db:push
    ```
3.  **(Opcional) Popule o banco com dados de teste:**
    ```bash
    npm run db:seed
    ```

## 5. Rodando o Servidor de Desenvolvimento

1.  **Inicie o servidor:**
    ```bash
    npm run dev
    ```
2.  Abra seu navegador e acesse [http://localhost:3000](http://localhost:3000).

