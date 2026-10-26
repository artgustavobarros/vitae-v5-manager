# Vitae V5 Manager

Umbra, gerenciador de fichas de Vampiro: A Máscara 5ª Edição. Aplicação TanStack Start com PostgreSQL e Drizzle.

## Desenvolvimento local

```bash
pnpm install
cp .env.example .env.local
docker compose up -d postgres
pnpm db:migrate
pnpm dev
```

O app local usa `http://localhost:3005`; o PostgreSQL do Compose local fica na porta `5434`.

## Produção na Hostinger

O `docker-compose.prod.yml` executa o app e o PostgreSQL no VPS. O app não publica porta: o Traefik já instalado no Docker Manager roteia o domínio para a porta interna `3000` e termina HTTPS. O compose usa o mesmo padrão do projeto `vampire`, em que o Traefik do host acessa os containers pela rede Docker.

O nome do repositório e do pacote é `vitae-v5-manager`. O identificador da stack existente no Hostinger Docker Manager continua `v5-manager` para que o deploy atualize os containers no lugar e preserve o banco persistido.

### Primeira configuração

1. Aponte o DNS do domínio para o IP do VPS e adicione o domínio ao Traefik com entrypoint `websecure` e certresolver `letsencrypt`.
2. No repositório GitHub, configure estes secrets em **Settings → Secrets and variables → Actions**:

   - `HOSTINGER_API_KEY`: chave da API da Hostinger.
   - `HOSTINGER_VM_ID`: ID da máquina virtual.
   - `APP_HOST`: domínio sem protocolo, por exemplo `umbra.exemplo.com`.
   - `POSTGRES_PASSWORD`: senha só com letras e números; gere com `openssl rand -hex 32`.
   - `BETTER_AUTH_SECRET`: segredo Better Auth; gere com `openssl rand -base64 32`.
   - `NARRADOR_EMAIL`: e-mail do Narrador.
   - `GOOGLE_CLIENT_ID` e `GOOGLE_CLIENT_SECRET`: opcionais, para login Google.

3. Faça push para `main` ou execute manualmente **Actions → Deploy → Run workflow**.

O workflow usa `hostinger/deploy-on-vps@v2` para enviar o `docker-compose.prod.yml`. O container aplica as migrations Drizzle antes de iniciar o servidor. O volume `pgdata` mantém os dados do PostgreSQL entre deploys.

### Hostinger MCP

As configurações do servidor MCP Hostinger estão em `.mcp.json`, `.codex/config.toml` e `.agents/mcp_config.json`, seguindo a configuração do projeto `vampire`. Elas registram o endpoint oficial (`https://mcp.hostinger.com`), sem armazenar chaves ou tokens locais. A autenticação/conexão MCP é feita pelo cliente que carregar a configuração.

### Operação

Para iniciar ou atualizar manualmente no VPS:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Para acompanhar logs:

```bash
docker compose -f docker-compose.prod.yml logs -f app
```

Não rode `docker compose down -v` em produção: isso remove o volume do banco.
