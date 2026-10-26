import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { readdir } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { get } from 'node:http'
import { resolve } from 'node:path'

const porta = await obterPortaLivre()
const origem = `http://127.0.0.1:${porta}`
const servidor = spawn(process.execPath, ['.output/server/index.mjs'], {
  env: {
    ...process.env,
    NODE_ENV: 'production',
    PORT: String(porta),
    HOST: '127.0.0.1',
    BETTER_AUTH_SECRET: randomBytes(48).toString('base64url'),
    BETTER_AUTH_URL: origem,
    BETTER_AUTH_TRUSTED_ORIGINS: origem,
  },
  stdio: 'ignore',
})

try {
  await aguardarServidor(servidor, origem)

  const pagina = await fetch(`${origem}/entrar`)
  assert.equal(pagina.status, 200, 'a página pública deve responder com sucesso')
  const html = await pagina.text()
  const estilosInline = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)]
  assert(
    estilosInline.some(([, css]) => css.includes('.container-app')),
    'o CSS da aplicação deve estar no HTML inicial',
  )
  assert.doesNotMatch(html, /<link\b[^>]*rel="stylesheet"/, 'a página não deve depender de uma requisição CSS bloqueante')

  const arquivosAssets = await readdir(resolve('.output/public/assets'))
  const arquivoCss = arquivosAssets.find((arquivo) => arquivo.endsWith('.css'))
  assert(arquivoCss, 'o build deve manter o CSS versionado para navegação e cache')
  const assetCss = await verificarAsset(`${origem}/assets/${arquivoCss}`)
  assert.equal(assetCss.status, 200, 'o CSS versionado deve responder com sucesso')
  assert.match(assetCss.cacheControl, /public.*max-age=31536000.*immutable/)
  assert.equal(assetCss.contentEncoding, 'br', 'o CSS deve ser servido com Brotli')

  const preloadFonte = html.match(/<link\b(?=[^>]*rel="preload")(?=[^>]*as="font")[^>]*>/)?.[0]
  assert(preloadFonte, 'a fonte principal deve ter preload')
  const caminhoFonte = preloadFonte.match(/\bhref="([^"]+)"/)?.[1]
  assert(caminhoFonte, 'o preload da fonte deve apontar para um asset')

  const assetFonte = await verificarAsset(`${origem}${caminhoFonte}`)
  assert.equal(assetFonte.status, 200, 'o asset versionado deve responder com sucesso')
  assert.match(assetFonte.cacheControl, /public.*max-age=31536000.*immutable/)

  const preloadScript = html.match(/<link\b(?=[^>]*rel="modulepreload")[^>]*>/)?.[0]
  assert(preloadScript, 'o HTML deve apontar para o bundle JavaScript da rota')
  const caminhoScript = preloadScript.match(/\bhref="([^"]+\.js)"/)?.[1]
  assert(caminhoScript, 'o preload do bundle deve apontar para um asset JavaScript')
  const assetScript = await verificarAsset(`${origem}${caminhoScript}`)
  assert.equal(assetScript.status, 200, 'o bundle versionado deve responder com sucesso')
  assert.match(assetScript.cacheControl, /public.*max-age=31536000.*immutable/)
  assert.equal(assetScript.contentEncoding, 'br', 'o servidor deve comprimir o bundle com Brotli')

  const assetScriptGzip = await verificarAsset(`${origem}${caminhoScript}`, 'gzip')
  assert.equal(assetScriptGzip.status, 200, 'o bundle deve responder também para clientes sem Brotli')
  assert.equal(assetScriptGzip.contentEncoding, 'gzip', 'o servidor deve oferecer gzip como fallback')

  console.log('Smoke de produção passou: CSS inline, preload da fonte, assets com Brotli/cache e gzip fallback.')
} finally {
  servidor.kill('SIGTERM')
}

function obterPortaLivre(): Promise<number> {
  return new Promise((resolve, reject) => {
    const socket = createServer()
    socket.once('error', reject)
    socket.listen(0, '127.0.0.1', () => {
      const endereco = socket.address()
      if (!endereco || typeof endereco === 'string') {
        socket.close()
        reject(new Error('Não foi possível alocar uma porta local'))
        return
      }
      socket.close((erro) => (erro ? reject(erro) : resolve(endereco.port)))
    })
  })
}

async function aguardarServidor(processo: ReturnType<typeof spawn>, url: string) {
  const limite = Date.now() + 15_000
  while (Date.now() < limite) {
    if (processo.exitCode !== null) throw new Error('O servidor de produção encerrou antes de responder')
    try {
      const resposta = await fetch(`${url}/entrar`, { signal: AbortSignal.timeout(1_000) })
      if (resposta.status === 200) return
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 150))
    }
  }
  throw new Error('O servidor de produção não ficou pronto em 15 segundos')
}

function verificarAsset(url: string, encoding = 'br'): Promise<{
  status: number
  cacheControl: string
  contentEncoding: string
}> {
  return new Promise((resolve, reject) => {
    get(url, { headers: { 'accept-encoding': encoding } }, (resposta) => {
      resposta.resume()
      resposta.once('end', () =>
        resolve({
          status: resposta.statusCode ?? 0,
          cacheControl: resposta.headers['cache-control'] ?? '',
          contentEncoding: resposta.headers['content-encoding'] ?? '',
        }),
      )
    }).once('error', reject)
  })
}
