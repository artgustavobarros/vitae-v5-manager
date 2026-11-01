import { afterEach, describe, expect, it, vi } from 'vitest'

import { protegerHttp, ipDoProxy, LIMITE_CORPO_BYTES } from './seguranca-http'

afterEach(() => vi.unstubAllEnvs())

describe('proteção HTTP antes de processar entradas', () => {
  it('substitui um nonce fornecido pelo visitante e impede scripts inline sem nonce', async () => {
    const request = new Request('https://vitae.test/entrar', { headers: { 'x-vitae-csp-nonce': 'escolhido-pelo-visitante' } })
    const executar = (entrada: Request) => new Response(entrada.headers.get('x-vitae-csp-nonce'))
    const resposta = await protegerHttp(request, executar, true)
    const nonce = await resposta.text()
    const csp = resposta.headers.get('content-security-policy')!
    expect(nonce).not.toBe('escolhido-pelo-visitante')
    expect(csp).toContain(`script-src 'self' 'nonce-${nonce}'`)
    expect(csp.split(';').find((diretiva) => diretiva.trim().startsWith('script-src '))).not.toContain('unsafe-inline')
    expect(csp).toContain("frame-ancestors 'none'")
    expect(csp).toContain("object-src 'none'")
    expect(resposta.headers.get('x-content-type-options')).toBe('nosniff')
    expect(resposta.headers.get('referrer-policy')).toBe('no-referrer')
    const outra = await protegerHttp(request, executar, true)
    expect(await outra.text()).not.toBe(nonce)
  })

  it('preserva redirecionamentos e cookies e desativa cache das respostas privadas', async () => {
    const headers = new Headers({ location: '/entrar' })
    headers.append('set-cookie', 'sessao=1; HttpOnly; Secure; SameSite=Lax')
    headers.append('set-cookie', 'estado=2; HttpOnly; Secure; SameSite=Lax')
    const resposta = await protegerHttp(new Request('https://vitae.test/'), () => new Response(null, {
      status: 307, headers,
    }), true)
    expect(resposta.status).toBe(307)
    expect(resposta.headers.get('location')).toBe('/entrar')
    expect(resposta.headers.get('set-cookie')).toContain('HttpOnly')
    expect(resposta.headers.getSetCookie()).toHaveLength(2)
    expect(resposta.headers.get('cache-control')).toBe('no-store')
  })

  it('ativa HSTS na origem pública HTTPS e permite desenvolvimento local', async () => {
    vi.stubEnv('BETTER_AUTH_URL', 'https://vitae.test')
    const resposta = await protegerHttp(new Request('https://vitae.test/'), () => new Response('ok'), true)
    expect(resposta.headers.get('strict-transport-security')).toBe('max-age=31536000')
    const local = await protegerHttp(new Request('http://localhost/'), () => new Response('ok'), false)
    expect(local.headers.has('strict-transport-security')).toBe(false)
    expect(local.headers.get('content-security-policy')).toContain("'unsafe-eval'")
  })

  it('bloqueia excesso de tráfego antes de executar o handler', async () => {
    const request = new Request('https://vitae.test/', { headers: { 'x-real-ip': '203.0.113.254' } })
    let executadas = 0
    const executar = () => { executadas++; return new Response('ok') }
    for (let i = 0; i < 600; i++) {
      const resposta = await protegerHttp(request, executar, true)
      expect(resposta.status).toBe(200)
    }
    const bloqueada = await protegerHttp(request, executar, true)
    expect(bloqueada.status).toBe(429)
    expect(Number(bloqueada.headers.get('retry-after'))).toBeGreaterThan(0)
    expect(executadas).toBe(600)
    expect(bloqueada.headers.get('cache-control')).toBe('no-store')
  })

  it('rejeita corpos grandes antes de chamar autenticação ou funções do servidor', async () => {
    let chamou = false
    const request = new Request('https://vitae.test/api/auth/sign-up/email', {
      method: 'POST', body: 'a'.repeat(LIMITE_CORPO_BYTES + 1), headers: { 'content-length': '1' },
    })
    const resposta = await protegerHttp(request, () => { chamou = true; return new Response('ok') }, true)
    expect(resposta.status).toBe(413)
    expect(chamou).toBe(false)
    expect(resposta.headers.get('x-content-type-options')).toBe('nosniff')
  })

  it('aceita uma entrada dentro do limite sem alterar seus bytes', async () => {
    const corpo = JSON.stringify({ nome: 'João 🦇' })
    const resposta = await protegerHttp(new Request('https://vitae.test/api/teste', {
      method: 'POST', body: corpo,
    }), async (request) => new Response(await request.text()), true)
    expect(await resposta.text()).toBe(corpo)
  })

  it('aceita a requisição encapsulada pelo runtime Nitro', async () => {
    const original = new Request('https://vitae.test/entrar')
    const encapsulada = new Proxy(original, { get: (alvo, campo) => Reflect.get(alvo, campo, alvo) })
    const resposta = await protegerHttp(encapsulada, (entrada) => new Response(new URL(entrada.url).pathname), true)
    expect(resposta.status).toBe(200)
    expect(await resposta.text()).toBe('/entrar')
  })

  it('preserva o stream e sua função de cancelamento', async () => {
    let cancelou = false
    const stream = new ReadableStream({ cancel() { cancelou = true } })
    const resposta = await protegerHttp(new Request('https://vitae.test/api/tempo-real'), () => new Response(stream, {
      headers: { 'cache-control': 'no-cache, no-transform', 'content-type': 'text/event-stream' },
    }), true)
    expect(resposta.headers.get('cache-control')).toBe('no-store, no-transform')
    await resposta.body!.cancel()
    expect(cancelou).toBe(true)
  })

  it('usa somente o IP único fornecido pelo proxy configurado', () => {
    expect(ipDoProxy(new Headers({ 'x-real-ip': '203.0.113.1', 'x-forwarded-for': '1.2.3.4, 5.6.7.8' }))).toBe('203.0.113.1')
    expect(ipDoProxy(new Headers({ 'x-real-ip': '1.2.3.4, 5.6.7.8' }))).toBe('sem-ip')
    expect(ipDoProxy(new Headers({ 'x-forwarded-for': '1.2.3.4' }))).toBe('sem-ip')
  })
})
