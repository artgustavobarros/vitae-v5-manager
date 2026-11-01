# Segurança e publicação

## Credenciais do banco

O serviço `migrar` aplica migrations, criptografa tokens Google existentes e prepara o papel `vitae_app`. Só esse serviço recebe a credencial administrativa. O app inicia depois que ele termina e recebe uma senha diferente, com permissões de leitura e escrita nas tabelas da aplicação. O app não pode criar papéis, alterar tabelas ou acessar o schema de migrations.

Antes do primeiro deploy desta configuração:

1. Gere uma senha com `openssl rand -hex 32`.
2. Cadastre o resultado no GitHub Actions como `APP_DATABASE_PASSWORD`. Ela deve ser diferente de `POSTGRES_PASSWORD`.
3. Preserve o valor atual de `BETTER_AUTH_SECRET`: ele também protege tokens OAuth armazenados. Trocar essa chave sem uma migração de chaves impede a leitura dos tokens existentes.

O serviço usa o banco e o volume existentes. Não remova o volume para trocar credenciais. A preparação do papel e a criptografia podem ser executadas novamente sem apagar dados ou criptografar tokens duas vezes. Tokens já criptografados são validados antes de continuar; uma chave incompatível interrompe a publicação.

`encryptOAuthTokens` protege access tokens e refresh tokens. O ID token segue o armazenamento padrão do Better Auth. Backups do banco ainda precisam de criptografia e controle de acesso na infraestrutura.

## Requisições e navegador

- Limite de corpo HTTP de 1 MiB, medido nos bytes recebidos, inclusive sem `Content-Length` confiável.
- Limites por minuto: 600 requisições HTTP por IP, 300 chamadas autenticadas por conta e 30 consultas/preparações de Convite por IP. O Better Auth mantém seus limites próprios de autenticação.
- Até cinco conexões SSE simultâneas por conta. Cancelamento, remoção da conta e sessão encerrada liberam as vagas.
- Textos curtos até 500 caracteres; História, Aparência, descrições e notas até 20.000; listas até 100 itens, com limites específicos para nomes e identificadores. Metadados arbitrários de criação são descartados.
- CSP com nonce aleatório por resposta para scripts, bloqueio de enquadramento, `nosniff`, `Referrer-Policy: no-referrer`, restrição de permissões do navegador e HTML sem cache. Estilos inline continuam permitidos porque o CSS inicial, Radix e drag and drop dependem deles.
- HSTS de um ano no domínio HTTPS, sem impor políticas aos demais subdomínios.

Os limites em memória atendem a única réplica atual. Ao adicionar réplicas, migre os contadores para um armazenamento compartilhado. Reiniciar o processo reinicia os contadores de requisições.

O app confia somente em `X-Real-IP`, sobrescrito pelo Traefik. Sua porta não pode ser publicada diretamente. Se outro proxy for colocado na frente do Traefik, confirme a configuração de IPs confiáveis antes de alterar os headers aceitos.

## Firewall da VPS

Firewall decide quais conexões chegam à máquina. O repositório não configura o firewall real da Hostinger ou do Linux.

- `80/tcp`: redirecionamento para HTTPS e validação de certificados, conforme o Traefik existente.
- `443/tcp`: acesso ao site.
- SSH: manter somente a porta realmente usada e, quando possível, limitar a IPs administrativos ou VPN. Confirmar o caminho usado pelo Docker Manager antes de bloquear acessos.
- PostgreSQL e a porta interna do app: sem publicação para a internet. O Compose de produção não publica essas portas; o banco local fica em `127.0.0.1:5434`.

Confira IPv4 e IPv6. Regras do Docker podem permitir tráfego para portas publicadas apesar de regras comuns do UFW; valide também o firewall da provedora e o caminho de filtragem do Docker. Não altere a política de SSH sem manter uma sessão de recuperação disponível.

## Permissões da VPS

Permissões definem o que uma conta ou processo pode fazer depois de obter acesso.

- Administração: conta nominal, chave SSH e `sudo` quando necessário; conferir como a provedora administra a máquina antes de desabilitar métodos de acesso.
- Docker: acesso ao socket e ao grupo `docker` equivale a controle administrativo da máquina. O app não recebe esse socket.
- App: executa como `node`, sem capabilities adicionais e sem elevação de privilégios. A credencial administrativa do banco fica no serviço separado de migrations.
- Segredos e backups: acesso apenas aos responsáveis pela publicação e recuperação. Arquivos locais de ambiente com segredos não entram no Git ou no contexto da imagem.

Esses controles de host e backups exigem inspeção da VPS. Alterar os arquivos do projeto não comprova que eles estão aplicados na máquina.

## Verificações

O CI executa testes, tipos, lint, build, smoke de produção e `pnpm audit --audit-level moderate`. Os overrides em `pnpm-workspace.yaml` corrigem dependências transitivas das ferramentas; devem ser removidos quando essas ferramentas adotarem versões corrigidas.

O teste `scripts/preparar-banco.test.ts` usa um banco e um papel temporários para comprovar permissões e migração de tokens, removendo somente os recursos que criou. Ele exige uma credencial de desenvolvimento/CI com permissão para criar banco e papel.
