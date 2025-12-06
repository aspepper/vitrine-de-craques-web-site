# Instruções para ajustar o GitHub Actions workflow para deploy no Azure App Service

Este documento resume as particularidades que você deve ajustar no workflow do GitHub Actions (ou no processo de CI) para garantir um deploy correto no Azure App Service (Web App) para esta aplicação Next.js que usa Prisma e output: "standalone".

Resumo rápido
- Build: executar npm ci, npx prisma generate e next build.
- Artefato: usar o build standalone (.next/standalone) e instalar dependências de produção dentro do diretório standalone antes de empacotar.
- Pruning: rodar scripts/prune-deploy-artifact.sh no diretório final que será enviado ao App Service para reduzir artefato (remoção de engines extras do Prisma e arquivos desnecessários).
- Deploy: criar um ZIP com o conteúdo pronto (server.js + node_modules + package.json + prisma) e usar azure/webapps-deploy para fazer o zip-deploy.
- App Service settings: definir NODE version coerente, variáveis de ambiente (DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET, APPLICATIONINSIGHTS_CONNECTION_STRING, etc) e ativar Always On.

Detalhes passo-a-passo (o que o workflow deve fazer)
1) Checkout e Node
  - actions/checkout@v4
  - actions/setup-node@v4 com a versão de Node adequada (veja .nvmrc / package.json). Ex.: node-version: 18.x

2) Instalar dependências e gerar cliente Prisma
  - npm ci
  - npx prisma generate

3) Build Next.js (standalone)
  - npm run build  # deve executar next build e gerar .next/standalone

4) Preparar artefato standalone para deploy
  - Copiar o conteúdo do .next/standalone para um diretório temporário de deploy (ex.: deploy/)
    - mkdir deploy
    - cp -R .next/standalone/* deploy/
  - Instalar dependências de produção dentro do deploy
    - npm ci --omit=dev --prefix deploy
    - Alternativa: (cd deploy && npm ci --production)

  Observação: o output standalone gera um package.json dentro de .next/standalone; precisamos das node_modules de produção para que o servidor funcione no App Service.

5) Prune (importante para manter o pacote leve)
  - Rodar o script de pruning fornecido no repositório para remover engines Prisma que não serão usados e arquivos desnecessários:
    - bash scripts/prune-deploy-artifact.sh deploy
  - Verifique se você NÃO removeu o engine do Prisma necessário para Linux/Openssl compatível com App Service (o next.config.mjs já tenta incluir os caminhos corretos). Após o prune, verifique que em deploy/node_modules/.prisma/client/ existam os binários que o app precisa.

6) Criar ZIP e publicar
  - zip -r deploy.zip deploy/*
  - Usar action azure/webapps-deploy@v2 (ou versão atual) com o parâmetro package: deploy.zip para fazer o deploy no Web App criado.

Exemplo (esqueleto) de passos relevantes do workflow
- name: Install dependencies
  run: npm ci

- name: Generate Prisma client
  run: npx prisma generate

- name: Build Next.js
  run: npm run build

- name: Prepare deploy artifact
  run: |
    mkdir deploy
    cp -R .next/standalone/* deploy/
    npm ci --omit=dev --prefix deploy

- name: Prune artifact
  run: bash scripts/prune-deploy-artifact.sh deploy

- name: Zip artifact
  run: zip -r deploy.zip deploy/*

- name: Deploy to Azure Web App
  uses: azure/webapps-deploy@v2
  with:
    app-name: ${{ secrets.AZURE_WEBAPP_NAME }}
    slot-name: 'production'
    publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
    package: deploy.zip

Particularidades de configuração do App Service (no Portal)
- Runtime stack / Node version: selecione Node.js 18.x (ou a versão especificada em .nvmrc/package.json engines). Se possível, alinhe com .nvmrc.
- Startup Command: Se o package.json no artefato (deploy/package.json) tiver um script "start" que aponte para server.js, o App Service irá usar npm start. Caso queira garantir, defina o Startup Command explicitamente para: node server.js  
  Observação: quando você zip-deploya o conteúdo de .next/standalone para a raiz, o server (server.js) normalmente estará na raiz do site (site/wwwroot/server.js). Ajuste conforme o layout do ZIP.
- App settings (Configuration > Application settings):
  - NODE_ENV=production
  - DATABASE_URL=<sua string de conexão Postgres>
  - NEXTAUTH_URL=https://<seu-app>.azurewebsites.net
  - NEXTAUTH_SECRET=<seu-segredo>
  - APPLICATIONINSIGHTS_CONNECTION_STRING (se usar AppInsights)
  - Qualquer outra variável sensível usada no .env.example
- Always On: habilite (importante para manter conexões Prisma persistentes e evitar timeouts/cold starts). Always On não está disponível no plano F1 (Free). Use um plano pago para ambiente de produção ou testes mais estáveis.

Recomendações e gotchas
- Conexões de banco e Prisma
  - Habilite Always On para reutilização de conexões e reduzir problemas de muitas conexões abertas. Sem Always On e com escalonamento automático, você pode ter conexões efêmeras demais.
  - Se planejar usar escalonamento serverless ou Azure Functions, considere usar Prisma Data Proxy ou um banco com pooling (Neon, Supabase com pgbouncer).

- Arquivos do Prisma e engines
  - next.config.mjs já inclui instruções para incluir os binários do Prisma no bundle. Garanta que o processo de build não os remova antes do deploy. O scripts/prune-deploy-artifact.sh foi adicionado também para remover apenas binários desnecessários; revise os arquivos resultantes.

- Tamanho do pacote
  - O App Service tem limites práticos; mantenha o deploy enxuto. O passo de prune é essencial se você notar artefatos muito grandes.

- HTTPS e cookies
  - NEXTAUTH_URL deve usar https, por exemplo https://meu-app.azurewebsites.net, para cookies seguros.

- Start command vs package.json
  - Se preferir, deixe o package.json de .next/standalone com o script start correto e deixe o App Service usar npm start; caso contrário, defina o Startup Command explicitamente.

Testes pós-deploy (validação rápida)
- Acesse: https://<seu-app>.azurewebsites.net/api/db-check  (o repo inclui app/api/db-check/route.ts que tenta conectar ao DB) — este endpoint pode ajudar a validar se a app consegue conectar ao banco.
- Verifique logs em Log Stream (App Service) para ver erros do Node ou do Prisma.

Notas finais
- Este projeto foi escrito para rodar como uma aplicação Node no servidor (serverful). A receita acima produz um artefato standalone adequado para o Azure App Service. Se quiser, eu posso gerar um workflow GitHub Actions completo (yaml) com esses passos, pronto para você ajustar secrets e publicar — mas você disse que não precisa do workflow agora.
