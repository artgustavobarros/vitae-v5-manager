import { randomBytes } from 'node:crypto'
import { isIP } from 'node:net'

import { limitarHttp, respostaLimite } from './limites.ts'

export const LIMITE_CORPO_BYTES = 1024 * 1024
export const CABECALHOS_SEGURANCA = {
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'referrer-policy': 'no-referrer',
  'permissions-policy': 'camera=(), microphone=(), geolocation=()',
}

/** Em produção, o Traefik sobrescreve X-Real-IP e o app não publica sua porta. */
export function ipDoProxy(headers: Headers): string {
  const ip = headers.get('x-real-ip')?.trim() ?? ''
  return isIP(ip) ? ip : 'sem-ip'
}

async function limitarCorpo(request: Request): Promise<Blob | null | undefined> {
  if (!request.body) return undefined
  const declarado = Number(request.headers.get('content-length'))
  if (declarado > LIMITE_CORPO_BYTES) {
    void request.body.cancel()
    return null
  }
  const reader = request.body.getReader()
  const partes: ArrayBuffer[] = []
  let tamanho = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      tamanho += value.byteLength
      if (tamanho > LIMITE_CORPO_BYTES) {
        void reader.cancel()
        return null
      }
      partes.push(Uint8Array.from(value).buffer)
    }
  } finally {
    reader.releaseLock()
  }
  return new Blob(partes)
}

export async function protegerHttp(
  request: Request,
  executar: (request: Request) => Response | Promise<Response>,
  producao: boolean,
): Promise<Response> {
  const nonce = randomBytes(18).toString('base64')
  const espera = limitarHttp(producao ? ipDoProxy(request.headers) : 'local')
  let resposta: Response
  if (espera) {
    resposta = respostaLimite(espera)
  } else {
    const corpo = await limitarCorpo(request)
    if (corpo === null) resposta = new Response('A requisição excede o limite de 1 MiB.', { status: 413 })
    else {
      const headers = new Headers(request.headers)
      headers.set('x-vitae-csp-nonce', nonce)
      // O Nitro encapsula Request em um Proxy; o construtor nativo não consegue clonar esse objeto.
      resposta = await executar(new Request(request.url, {
        method: request.method, headers, body: corpo, signal: request.signal,
      }))
    }
  }
  const headers = new Headers(resposta.headers)
  for (const [nome, valor] of Object.entries(CABECALHOS_SEGURANCA)) headers.set(nome, valor)
  headers.set('content-security-policy', [
    "default-src 'self'",
    producao ? `script-src 'self' 'nonce-${nonce}'` : "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "script-src-attr 'none'",
    // Radix e drag and drop calculam estilos inline; o CSS do build também é embutido.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://*.googleusercontent.com",
    "font-src 'self'",
    producao ? "connect-src 'self'" : "connect-src 'self' ws: wss:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; '))
  headers.set('cache-control', headers.get('cache-control')?.includes('no-transform') ? 'no-store, no-transform' : 'no-store')
  if (producao && process.env.BETTER_AUTH_URL?.startsWith('https://')) {
    headers.set('strict-transport-security', 'max-age=31536000')
  }
  return new Response(resposta.body, { status: resposta.status, statusText: resposta.statusText, headers })
}
