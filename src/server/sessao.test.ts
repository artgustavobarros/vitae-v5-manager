import { createMiddleware, executeMiddleware } from '@tanstack/react-start'
import { isRedirect, redirect } from '@tanstack/react-router'
import { APIError } from 'better-auth/api'
import { afterEach, describe, expect, it, vi } from 'vitest'

// A consulta opcional roda sem transporte HTTP; a cadeia de middleware permanece real.
vi.mock('@tanstack/react-start', async (original) => ({
  ...await original<typeof import('@tanstack/react-start')>(),
  createServerFn: () => ({ handler: (handler: () => unknown) => handler }),
}))
vi.mock('@tanstack/react-start/server', () => ({ getRequestHeaders: () => new Headers() }))
vi.mock('#/lib/auth', () => ({ auth: { api: { getSession: vi.fn() } } }))

import { auth } from '#/lib/auth'
import { buscarUsuario, exigirNarrador, exigirUsuario } from './sessao'

const agora = new Date('2026-11-14T12:00:00Z')
const sessao = {
  session: { id: 'sessao', userId: 'pessoa', token: 'token-de-teste', expiresAt: new Date('2026-11-15T12:00:00Z'),
    createdAt: agora, updatedAt: agora, ipAddress: null, userAgent: null },
  user: { id: 'pessoa', name: 'Ana', email: 'ana@teste.invalid', emailVerified: true, image: null,
    papel: 'jogador', createdAt: agora, updatedAt: agora },
}
const opcoes = { method: 'GET' as const, data: undefined, serverFnMeta: { id: 'teste' } }

// A cadeia real do Start exige o contexto de uma requisição, mesmo sem transporte HTTP.
const executar: typeof executeMiddleware = (...args) =>
  Reflect.get(globalThis, Symbol.for('tanstack-start:start-storage-context')).run(
    { startOptions: {} },
    () => executeMiddleware(...args),
  )

function falhaDeSessao() {
  return new APIError('INTERNAL_SERVER_ERROR', { code: 'FAILED_TO_GET_SESSION', message: 'Failed to get session' })
}

afterEach(() => { vi.resetAllMocks(); vi.unstubAllGlobals() })

describe('Recuperação de sessão', () => {
  it('permite abrir o login quando Better Auth falha ao consultar a sessão', async () => {
    vi.mocked(auth.api.getSession).mockRejectedValue(falhaDeSessao())
    expect(await buscarUsuario()).toBeNull()
  })

  it('mantém a consulta anônima opcional sem redirecionar', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null)
    expect(await buscarUsuario()).toBeNull()
  })

  it('não esconde erros inesperados como ausência de sessão', async () => {
    const erro = new Error('Falha inesperada na aplicação')
    vi.mocked(auth.api.getSession).mockRejectedValue(erro)
    await expect(buscarUsuario()).rejects.toBe(erro)
  })

  it('não esconde outros erros da API de autenticação', async () => {
    const erro = new APIError('INTERNAL_SERVER_ERROR', { code: 'OUTRO_ERRO', message: 'Erro inesperado' })
    vi.mocked(auth.api.getSession).mockRejectedValue(erro)
    await expect(buscarUsuario()).rejects.toBe(erro)
  })

  it('trata a sessão removida durante a renovação como ausência de sessão', async () => {
    vi.mocked(auth.api.getSession).mockRejectedValue(new APIError('UNAUTHORIZED', {
      code: 'FAILED_TO_GET_SESSION', message: 'Failed to get session',
    }))
    expect(await buscarUsuario()).toBeNull()
  })

  it.each([exigirUsuario, exigirNarrador])('redireciona a chamada protegida sem executar a ação', async (middleware) => {
    vi.mocked(auth.api.getSession).mockResolvedValue(null)
    const acao = vi.fn()
    const endpoint = createMiddleware({ type: 'function' }).server(async ({ next }) => { acao(); return next() })
    const resultado = await executar([middleware, endpoint], 'server', opcoes)
    expect(isRedirect(resultado.error)).toBe(true)
    if (isRedirect(resultado.error)) expect(resultado.error.options.to).toBe('/entrar')
    expect(acao).not.toHaveBeenCalled()
  })

  it('redireciona também quando a leitura da sessão falha durante uma ação', async () => {
    vi.mocked(auth.api.getSession).mockRejectedValue(falhaDeSessao())
    const resultado = await executar([exigirUsuario], 'server', opcoes)
    expect(isRedirect(resultado.error)).toBe(true)
    if (isRedirect(resultado.error)) expect(resultado.error.options.to).toBe('/entrar')
  })

  it('não reconhece sessão legada de Jogador como acesso interno', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(sessao)
    expect(await buscarUsuario()).toBeNull()
    const resultado = await executar([exigirUsuario], 'server', opcoes)
    expect(isRedirect(resultado.error)).toBe(true)
    expect(resultado.context.usuario).toBeUndefined()
  })

  it('continua negando ao Jogador uma ação exclusiva do Narrador', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue(sessao)
    const resultado = await executar([exigirNarrador], 'server', opcoes)
    expect(isRedirect(resultado.error)).toBe(true)
  })

  it('preserva o contexto e permite a ação quando o usuário é Narrador', async () => {
    vi.mocked(auth.api.getSession).mockResolvedValue({ ...sessao, user: { ...sessao.user, papel: 'narrador' } })
    const acao = vi.fn()
    const endpoint = createMiddleware({ type: 'function' }).middleware([exigirNarrador]).server(async ({ next, context }) => {
      acao(context.usuario)
      return next()
    })
    const resultado = await executar([endpoint], 'server', opcoes)
    expect(resultado.error).toBeUndefined()
    expect(acao).toHaveBeenCalledWith({ id: 'pessoa', nome: 'Ana', email: 'ana@teste.invalid', imagem: null, papel: 'narrador' })
  })

  it.each(['to', 'href'] as const)('leva o navegador ao login mesmo se o chamador captura o erro (%s)', async (campo) => {
    const replace = vi.fn()
    vi.stubGlobal('window', { location: { replace } })
    const endpoint = createMiddleware({ type: 'function' }).client(async () => { throw redirect({ [campo]: '/entrar' }) })
    const resultado = await executar([exigirUsuario, endpoint], 'client', opcoes)
    expect(replace).toHaveBeenCalledWith('/entrar')
    expect(isRedirect(resultado.error)).toBe(true)
  })

  it('não transforma erro de permissão em redirecionamento ao login', async () => {
    const replace = vi.fn()
    vi.stubGlobal('window', { location: { replace } })
    const erro = new Error('Acesso negado')
    const endpoint = createMiddleware({ type: 'function' }).client(async () => { throw erro })
    const resultado = await executar([exigirUsuario, endpoint], 'client', opcoes)
    expect(resultado.error).toBe(erro)
    expect(replace).not.toHaveBeenCalled()
  })
})
