import { afterEach, describe, expect, it, vi } from 'vitest'

import type { EventoReal } from '#/domain/eventos'
import { abrirTempoRealPublico } from './tempo-real-publico'

afterEach(() => vi.useRealTimers())

function preparar() {
  let valido = true
  let ouvinte: ((evento: EventoReal) => void) | null = null
  let conexoes = 0
  const abortar = new AbortController()
  const deps = {
    validar: async () => valido,
    relogiosVisiveis: async () => ['visivel'],
    escutar: (receber: (evento: EventoReal) => void) => { ouvinte = receber; return () => { ouvinte = null } },
    reservar: () => { conexoes++; return () => { conexoes-- } },
  }
  return {
    deps, abortar,
    revogar: () => { valido = false },
    emitir: (evento: EventoReal) => ouvinte?.(evento),
    conexoes: () => conexoes,
  }
}

describe('SSE público', () => {
  it('nega links inválidos antes de abrir o fluxo', async () => {
    const teste = preparar()
    teste.revogar()
    const resposta = await abrirTempoRealPublico(new Request('http://localhost/'), 'token', teste.deps)
    expect(resposta.status).toBe(404)
    expect(teste.conexoes()).toBe(0)
  })

  it('não envia eventos privados e encerra uma conexão já aberta quando o link é revogado', async () => {
    const teste = preparar()
    const resposta = await abrirTempoRealPublico(new Request('http://localhost/', { signal: teste.abortar.signal }), 'token', teste.deps)
    const leitor = resposta.body!.getReader()
    const decodificar = (valor?: Uint8Array) => new TextDecoder().decode(valor)
    await leitor.read()
    teste.emitir({ tipo: 'mudanca', escopo: 'combate', apenasNarrador: true, id: 'segredo' })
    teste.emitir({ tipo: 'mudanca', escopo: 'combate', id: 'segredo' })
    expect(decodificar((await leitor.read()).value)).toBe('data: {"tipo":"mudanca","escopo":"combate"}\n\n')
    teste.revogar()
    teste.emitir({ tipo: 'mudanca', escopo: 'combate' })
    expect(decodificar((await leitor.read()).value)).toContain('event: revogado')
    expect((await leitor.read()).done).toBe(true)
    expect(teste.conexoes()).toBe(0)
  })

  it('revoga também sem novos eventos e libera a vaga ao desconectar', async () => {
    vi.useFakeTimers()
    const teste = preparar()
    const resposta = await abrirTempoRealPublico(new Request('http://localhost/', { signal: teste.abortar.signal }), 'token', teste.deps)
    const leitor = resposta.body!.getReader()
    await leitor.read()
    teste.revogar()
    await vi.advanceTimersByTimeAsync(20_000)
    expect(new TextDecoder().decode((await leitor.read()).value)).toContain('event: revogado')
    expect(teste.conexoes()).toBe(0)
    const outro = preparar()
    await abrirTempoRealPublico(new Request('http://localhost/', { signal: outro.abortar.signal }), 'token', outro.deps)
    outro.abortar.abort()
    expect(outro.conexoes()).toBe(0)
  })
})
