import { createHmac } from 'node:crypto'
import { betterAuth } from 'better-auth'
import { memoryAdapter } from 'better-auth/adapters/memory'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'

let auth: typeof import('./auth').auth

beforeAll(async () => {
  vi.stubEnv('BETTER_AUTH_URL', 'http://localhost:3005')
  vi.stubEnv('BETTER_AUTH_SECRET', 'segredo-exclusivo-de-teste-com-mais-de-32-caracteres')
  vi.stubEnv('GOOGLE_CLIENT_ID', 'teste.apps.googleusercontent.com')
  vi.stubEnv('GOOGLE_CLIENT_SECRET', 'segredo-google-de-teste')
  auth = (await import('./auth')).auth
})

afterAll(() => vi.unstubAllEnvs())

async function comSessaoAntiga(provedor: 'google' | 'credential') {
  const agora = new Date()
  const banco = {
    user: [{
      id: 'pessoa-legada', name: 'Pessoa legada', email: 'legado@teste.invalid',
      emailVerified: true, image: null, papel: 'jogador', createdAt: agora, updatedAt: agora,
    }],
    account: [{
      id: 'conta-legada', userId: 'pessoa-legada', accountId: 'pessoa-legada', providerId: provedor,
      accessToken: null, refreshToken: null, idToken: null, accessTokenExpiresAt: null,
      refreshTokenExpiresAt: null, scope: null, password: null, createdAt: agora, updatedAt: agora,
    }],
    session: [{
      id: 'sessao-legada', userId: 'pessoa-legada', token: 'token-de-teste',
      expiresAt: new Date(agora.getTime() + 86_400_000), createdAt: agora, updatedAt: agora,
      ipAddress: null, userAgent: null,
    }],
  }
  const instancia = betterAuth({ ...auth.options, database: memoryAdapter(banco) })
  const contexto = await instancia.$context
  const assinatura = createHmac('sha256', contexto.secret).update('token-de-teste').digest('base64')
  const headers = new Headers({
    cookie: `${contexto.authCookies.sessionToken.name}=${encodeURIComponent(`token-de-teste.${assinatura}`)}`,
  })
  return { instancia, headers, banco }
}

function enviar(caminho: string, body: Record<string, unknown>) {
  return auth.handler(new Request(`http://localhost:3005/api/auth${caminho}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'http://localhost:3005' },
    body: JSON.stringify(body),
  }))
}

describe('Acesso exclusivo pelo Google', () => {
  it('recusa e revoga uma sessão anterior sem vínculo Google', async () => {
    const { instancia, headers, banco } = await comSessaoAntiga('credential')
    expect(await instancia.api.getSession({ headers })).toBeNull()
    expect(banco.session).toHaveLength(0)
    expect(banco.user).toHaveLength(1)
    expect(banco.account).toHaveLength(1)
  })

  it('preserva uma sessão anterior com vínculo Google', async () => {
    const { instancia, headers, banco } = await comSessaoAntiga('google')
    expect(await instancia.api.getSession({ headers })).toMatchObject({ user: { id: 'pessoa-legada' } })
    expect(banco.session).toHaveLength(1)
  })

  it('mantém anônima uma requisição sem sessão', async () => {
    const { instancia } = await comSessaoAntiga('google')
    expect(await instancia.api.getSession({ headers: new Headers() })).toBeNull()
  })

  it.each([
    '/sign-up/email', '/sign-in/email', '/sign-in/username',
    '/change-password', '/request-password-reset', '/reset-password', '/unlink-account',
  ])('não expõe o endpoint %s, mesmo chamado diretamente', async (caminho) => {
    const resposta = await enviar(caminho, {
      name: 'Pessoa de teste', email: 'nao-cadastrada@teste.invalid', username: 'nao-cadastrada',
      password: 'senha-de-teste', currentPassword: 'senha-de-teste', newPassword: 'outra-senha-de-teste',
      token: 'token-invalido', accountId: 'google-de-teste',
    })
    expect(resposta.status).toBe(404)
  })

  it('inicia a autorização Google e mantém o retorno para a aplicação', async () => {
    const resposta = await enviar('/sign-in/social', {
      provider: 'google', callbackURL: '/', errorCallbackURL: '/entrar',
    })
    expect(resposta.status).toBe(200)
    const destino = new URL((await resposta.json()).url)
    expect(destino.hostname).toBe('accounts.google.com')
    expect(destino.searchParams.get('redirect_uri')).toBe('http://localhost:3005/api/auth/callback/google')
    expect(destino.searchParams.get('client_id')).toBe('teste.apps.googleusercontent.com')
  })
})
