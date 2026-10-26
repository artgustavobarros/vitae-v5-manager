import { describe, expect, it } from 'vitest'

import {
  encontrarLink,
  extrairLinks,
  selecionarAssetsCss,
  validarAsset,
  validarHtml,
} from './check-production-assets.ts'

const respostaOk = {
  status: 200,
  cacheControl: 'public, max-age=31536000, immutable',
  contentEncoding: 'br',
}

describe('extrairLinks', () => {
  it('aceita aspas simples, duplas e qualquer ordem de atributos', () => {
    const links = extrairLinks(
      `<link href='/assets/jost.woff2' crossorigin as=font rel='preload' type="font/woff2">` +
        `<link href="/assets/main-abc.js" rel="modulepreload">`,
    )

    expect(encontrarLink(links, 'preload', 'font')?.href).toBe('/assets/jost.woff2')
    expect(encontrarLink(links, 'modulepreload')?.href).toBe('/assets/main-abc.js')
  })

  it('reconhece rel com vários valores', () => {
    const links = extrairLinks('<link rel="preload stylesheet" as="style" href="/a.css" />')

    expect(encontrarLink(links, 'stylesheet')?.href).toBe('/a.css')
  })
})

describe('validarHtml', () => {
  const css = '<style>.container-app{}</style>'

  it('encontra a fonte e o bundle independentemente das aspas', () => {
    const html = `${css}<link as='font' rel='preload' href='/assets/f.woff2'><link href='/assets/r.js' rel='modulepreload'>`

    expect(validarHtml(html)).toEqual({ caminhoFonte: '/assets/f.woff2', caminhoScript: '/assets/r.js' })
  })

  it('rejeita CSS bloqueante com aspas simples', () => {
    const html = `${css}<link href='/a.css' rel='stylesheet'><link rel=preload as=font href=/f.woff2><link rel=modulepreload href=/r.js>`

    expect(() => validarHtml(html)).toThrow(/CSS bloqueante/)
  })

  it('exige preload da fonte', () => {
    expect(() => validarHtml(`${css}<link rel="modulepreload" href="/r.js">`)).toThrow(/preload/)
  })
})

describe('selecionarAssetsCss', () => {
  it('retorna todos os CSS e ignora variantes comprimidas', () => {
    expect(
      selecionarAssetsCss(['styles-b.css', 'main.js', 'styles-a.css', 'styles-a.css.br', 'styles-a.css.gz']),
    ).toEqual(['styles-a.css', 'styles-b.css'])
  })
})

describe('validarAsset', () => {
  it('aceita Brotli com cache imutável', () => {
    expect(validarAsset('/assets/a.css', respostaOk, 'br')).toEqual([])
  })

  it('cobra gzip como fallback do CSS', () => {
    expect(validarAsset('/assets/a.css', { ...respostaOk, contentEncoding: 'gzip' }, 'gzip')).toEqual([])
    expect(validarAsset('/assets/a.css', { ...respostaOk, contentEncoding: '' }, 'gzip')).toEqual([
      '/assets/a.css deve ser servido com gzip (recebido "sem compressão")',
    ])
  })

  it('aponta status, cache e encoding errados', () => {
    const problemas = validarAsset('/assets/a.js', { status: 404, cacheControl: 'no-cache', contentEncoding: 'gzip' }, 'br')

    expect(problemas).toHaveLength(3)
    expect(problemas.join('\n')).toMatch(/404[\s\S]*cache[\s\S]*br/)
  })

  it('ignora encoding quando não foi pedido', () => {
    expect(validarAsset('/assets/f.woff2', { ...respostaOk, contentEncoding: '' })).toEqual([])
  })
})
