import assert from 'node:assert/strict'
import { randomBytes } from 'node:crypto'
import { readdir } from 'node:fs/promises'
import { spawn, type ChildProcess } from 'node:child_process'
import { createServer } from 'node:net'
import { get } from 'node:http'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

export type LinkHtml = Record<string, string>

export type RespostaAsset = {
  status: number
  cacheControl: string
  contentEncoding: string
}

const CACHE_IMUTAVEL = /public.*max-age=31536000.*immutable/
const LIMITE_SAIDA_SERVIDOR = 64 * 1024

/** Lê as tags `<link>` do HTML, aceitando aspas simples, duplas ou nenhuma e qualquer ordem de atributos. */
export function extrairLinks(html: string): LinkHtml[] {
  return [...html.matchAll(/<link\b([^>]*)>/gi)].map(([, atributos]) => {
    const link: LinkHtml = {}
    for (const [, nome, duplas, simples, semAspas] of atributos.matchAll(
      /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g,
    )) {
      link[nome.toLowerCase()] = duplas ?? simples ?? semAspas ?? ''
    }
    return link
  })
}

export function temRel(link: LinkHtml, rel: string) {
  return (link.rel ?? '').toLowerCase().split(/\s+/).includes(rel)
}

export function encontrarLink(links: LinkHtml[], rel: string, as?: string) {
  return links.find((link) => temRel(link, rel) && (as === undefined || link.as?.toLowerCase() === as))
}

/** Todo CSS versionado do build; ignora as variantes pré-comprimidas (`.css.br`, `.css.gz`). */
export function selecionarAssetsCss(arquivos: string[]) {
  return arquivos.filter((arquivo) => arquivo.endsWith('.css')).sort()
}

/** Retorna a lista de problemas do asset; vazia quando ele é servido como esperado. */
export function validarAsset(nome: string, resposta: RespostaAsset, encoding?: 'br' | 'gzip') {
  const problemas: string[] = []
  if (resposta.status !== 200) problemas.push(`${nome} respondeu ${resposta.status}, esperado 200`)
  if (!CACHE_IMUTAVEL.test(resposta.cacheControl)) {
    problemas.push(`${nome} deve ter cache público imutável de 1 ano (recebido "${resposta.cacheControl}")`)
  }
  if (encoding && resposta.contentEncoding !== encoding) {
    problemas.push(`${nome} deve ser servido com ${encoding} (recebido "${resposta.contentEncoding || 'sem compressão'}")`)
  }
  return problemas
}

/** Valida o HTML público e devolve os caminhos de assets que precisam de Brotli, gzip e cache. */
export function validarHtml(html: string) {
  const estilosInline = [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)]
  assert(
    estilosInline.some(([, css]) => css.includes('.container-app')),
    'o CSS da aplicação deve estar no HTML inicial',
  )
  const links = extrairLinks(html)
  assert(
    !links.some((link) => temRel(link, 'stylesheet')),
    'a página não deve depender de uma requisição CSS bloqueante',
  )

  const caminhoFonte = encontrarLink(links, 'preload', 'font')?.href
  assert(caminhoFonte, 'a fonte principal deve ter preload apontando para um asset')

  const caminhoScript = encontrarLink(links, 'modulepreload')?.href
  assert(caminhoScript && caminhoScript.endsWith('.js'), 'o HTML deve apontar para o bundle JavaScript da rota')

  return { caminhoFonte, caminhoScript }
}

async function main() {
  const servidor = await iniciarServidor()
  try {
    const pagina = await fetch(`${servidor.origem}/entrar`)
    assert.equal(pagina.status, 200, 'a página pública deve responder com sucesso')
    const { caminhoFonte, caminhoScript } = validarHtml(await pagina.text())

    const arquivosCss = selecionarAssetsCss(await readdir(resolve('.output/public/assets')))
    assert(arquivosCss.length > 0, 'o build deve manter o CSS versionado para navegação e cache')

    const problemas = validarAsset(caminhoFonte, await verificarAsset(`${servidor.origem}${caminhoFonte}`))

    const comprimidos = [caminhoScript, ...arquivosCss.map((arquivo) => `/assets/${arquivo}`)]
    for (const caminho of comprimidos) {
      for (const encoding of ['br', 'gzip'] as const) {
        const resposta = await verificarAsset(`${servidor.origem}${caminho}`, encoding)
        problemas.push(...validarAsset(caminho, resposta, encoding))
      }
    }
    assert.deepEqual(problemas, [], `assets fora do esperado:\n${problemas.join('\n')}`)

    console.log(
      `Smoke de produção passou: CSS inline, preload da fonte, ${arquivosCss.length} CSS e o bundle JS com Brotli/cache e gzip fallback.`,
    )
  } catch (erro) {
    servidor.mostrarSaida()
    throw erro
  } finally {
    servidor.processo.kill('SIGTERM')
  }
}

/** Sobe o servidor de produção; se ele cair antes de responder (ex.: porta tomada), tenta uma vez em outra porta. */
async function iniciarServidor(tentativas = 2) {
  for (let tentativa = 1; ; tentativa++) {
    const porta = await obterPortaLivre()
    const origem = `http://127.0.0.1:${porta}`
    const processo = spawn(process.execPath, ['.output/server/index.mjs'], {
      env: {
        ...process.env,
        NODE_ENV: 'production',
        PORT: String(porta),
        HOST: '127.0.0.1',
        BETTER_AUTH_SECRET: randomBytes(48).toString('base64url'),
        BETTER_AUTH_URL: origem,
        BETTER_AUTH_TRUSTED_ORIGINS: origem,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    })
    let saida = ''
    const guardar = (parte: Buffer) => {
      saida = (saida + parte.toString()).slice(-LIMITE_SAIDA_SERVIDOR)
    }
    processo.stdout?.on('data', guardar)
    processo.stderr?.on('data', guardar)
    const mostrarSaida = () => console.error(`--- saída do servidor (porta ${porta}) ---\n${saida || '(vazia)'}\n---`)

    try {
      await aguardarServidor(processo, origem)
      return { processo, origem, mostrarSaida }
    } catch (erro) {
      const encerrou = processo.exitCode !== null || processo.signalCode !== null
      processo.kill('SIGTERM')
      mostrarSaida()
      if (!encerrou || tentativa >= tentativas) throw erro
      console.error(`Servidor encerrou na tentativa ${tentativa}; tentando outra porta.`)
    }
  }
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

async function aguardarServidor(processo: ChildProcess, url: string) {
  const limite = Date.now() + 15_000
  let ultimoStatus = 'sem resposta'
  while (Date.now() < limite) {
    if (processo.exitCode !== null || processo.signalCode !== null) {
      throw new Error(
        `O servidor de produção encerrou antes de responder (código ${processo.exitCode ?? processo.signalCode})`,
      )
    }
    try {
      const resposta = await fetch(`${url}/entrar`, { signal: AbortSignal.timeout(1_000) })
      if (resposta.status === 200) return
      ultimoStatus = `HTTP ${resposta.status}`
    } catch {
      ultimoStatus = 'sem resposta'
    }
    await new Promise((resolve) => setTimeout(resolve, 150))
  }
  throw new Error(`O servidor de produção não ficou pronto em 15 segundos (último status: ${ultimoStatus})`)
}

function verificarAsset(url: string, encoding: 'br' | 'gzip' = 'br'): Promise<RespostaAsset> {
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

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await main()
}
