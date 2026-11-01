import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import { Client } from 'pg'
import { parseEnvelope, symmetricDecrypt, symmetricEncrypt } from 'better-auth/crypto'

/** Migra também os tokens anteriores à ativação de encryptOAuthTokens, sem criptografar duas vezes. */
export async function criptografarTokensGoogle(banco: Client, segredo: string) {
  if (segredo.length < 32) throw new Error('BETTER_AUTH_SECRET precisa ter pelo menos 32 caracteres.')
  const criptografar = async (token: string | null) => {
    if (!token) return token
    const envelope = parseEnvelope(token)
    if (envelope || (token.length % 2 === 0 && /^[0-9a-f]+$/i.test(token))) {
      // Validar a chave antes de preservar um token que já está criptografado.
      await symmetricDecrypt({ key: segredo, data: envelope?.ciphertext ?? token })
      return token
    }
    return symmetricEncrypt({ key: segredo, data: token })
  }
  await banco.query('BEGIN')
  try {
    const { rows } = await banco.query<{ id: string; access_token: string | null; refresh_token: string | null }>(
      "SELECT id, access_token, refresh_token FROM public.account WHERE provider_id = 'google' FOR UPDATE",
    )
    for (const conta of rows) {
      const access = await criptografar(conta.access_token)
      const refresh = await criptografar(conta.refresh_token)
      if (access !== conta.access_token || refresh !== conta.refresh_token) {
        await banco.query('UPDATE public.account SET access_token = $1, refresh_token = $2 WHERE id = $3', [access, refresh, conta.id])
      }
    }
    await banco.query('COMMIT')
  } catch (erro) {
    await banco.query('ROLLBACK')
    throw erro
  }
}

/** Executado pela conta de migrations; a aplicação recebe somente a credencial limitada. */
export async function prepararAcessoAplicacao(banco: Client, papel: string, senha: string) {
  if (!/^[A-Za-z0-9]{32,}$/.test(senha)) {
    throw new Error('APP_DATABASE_PASSWORD precisa ter pelo menos 32 letras ou números.')
  }
  const role = banco.escapeIdentifier(papel)
  await banco.query('BEGIN')
  try {
    await banco.query("SELECT pg_advisory_xact_lock(hashtext('vitae_acesso_app'))")
    const { rows: [{ nome, administrador }] } = await banco.query<{ nome: string; administrador: string }>(
      'SELECT current_database() AS nome, current_user AS administrador',
    )
    if (papel === administrador) throw new Error('A conta da aplicação precisa ser diferente da conta de migrations.')
    const existe = await banco.query('SELECT 1 FROM pg_roles WHERE rolname = $1', [papel])
    if (existe.rowCount === 0) await banco.query(`CREATE ROLE ${role}`)
    await banco.query(`ALTER ROLE ${role} LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOREPLICATION NOBYPASSRLS PASSWORD ${banco.escapeLiteral(senha)}`)
    await banco.query(`REVOKE ALL ON DATABASE ${banco.escapeIdentifier(nome)} FROM PUBLIC`)
    await banco.query('REVOKE CREATE ON SCHEMA public FROM PUBLIC')
    await banco.query(`GRANT CONNECT ON DATABASE ${banco.escapeIdentifier(nome)} TO ${role}`)
    await banco.query(`GRANT USAGE ON SCHEMA public TO ${role}`)
    await banco.query(`GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO ${role}`)
    await banco.query(`GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO ${role}`)
    await banco.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ${role}`)
    await banco.query(`ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO ${role}`)
    await banco.query('COMMIT')
  } catch (erro) {
    await banco.query('ROLLBACK')
    throw erro
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const banco = new Client({ connectionString: process.env.DATABASE_URL })
  try {
    if (process.env.APP_DATABASE_PASSWORD === new URL(process.env.DATABASE_URL!).password) {
      throw new Error('As credenciais administrativa e da aplicação precisam ter senhas diferentes.')
    }
    await banco.connect()
    await criptografarTokensGoogle(banco, process.env.BETTER_AUTH_SECRET ?? '')
    await prepararAcessoAplicacao(banco, 'vitae_app', process.env.APP_DATABASE_PASSWORD ?? '')
    console.log('Credencial limitada da aplicação preparada.')
  } catch {
    // Erros do driver podem incluir a consulta com a senha; não imprimir o objeto recebido.
    console.error('Falha ao preparar o banco. Confira DATABASE_URL, APP_DATABASE_PASSWORD e BETTER_AUTH_SECRET no serviço de migrations.')
    process.exitCode = 1
  } finally {
    await banco.end()
  }
}
