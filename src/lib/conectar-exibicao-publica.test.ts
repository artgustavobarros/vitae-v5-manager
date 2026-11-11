import { afterEach, describe, expect, it, vi } from 'vitest'

import { conectarExibicaoPublica } from './conectar-exibicao-publica'

class FonteTeste extends EventTarget {
  static ultima: FonteTeste
  onopen: (() => void) | null = null
  onmessage: ((evento: { data: string }) => void) | null = null
  onerror: (() => void) | null = null
  fechada = false
  constructor(public url: string) { super(); FonteTeste.ultima = this }
  close() { this.fechada = true }
}
afterEach(() => vi.unstubAllGlobals())

describe('Conexão da exibição pública', () => {
  it('atualiza ao conectar, encaminha avisos e fecha ao revogar sem depender de login', () => {
    vi.stubGlobal('EventSource', FonteTeste)
    const atualizar = vi.fn(), avisar = vi.fn(), revogar = vi.fn(), conexao = vi.fn()
    const limpar = conectarExibicaoPublica('link-teste', { atualizar, avisar, revogar, conexao })
    const fonte = FonteTeste.ultima
    expect(fonte.url).toBe('/api/publico/link-teste/tempo-real')
    fonte.onopen?.()
    expect(atualizar).toHaveBeenCalledTimes(1)
    fonte.onmessage?.({ data: JSON.stringify({ tipo: 'efeitos-relogio', avisos: [{ id: 'aviso' }] }) })
    expect(avisar).toHaveBeenCalledWith([{ id: 'aviso' }])
    fonte.onmessage?.({ data: JSON.stringify({ tipo: 'mudanca', escopo: 'combate' }) })
    expect(atualizar).toHaveBeenCalledTimes(2)
    fonte.dispatchEvent(new Event('revogado'))
    expect(revogar).toHaveBeenCalledOnce()
    expect(fonte.fechada).toBe(true)
    limpar()
  })

  it('reconsulta o link ao falhar e reconcilia o estado ao reconectar', () => {
    vi.stubGlobal('EventSource', FonteTeste)
    const atualizar = vi.fn(), conexao = vi.fn()
    const limpar = conectarExibicaoPublica('token', { atualizar, avisar: vi.fn(), revogar: vi.fn(), conexao })
    FonteTeste.ultima.onerror?.()
    expect(conexao).toHaveBeenLastCalledWith(false)
    expect(atualizar).toHaveBeenCalledOnce()
    FonteTeste.ultima.onopen?.()
    expect(conexao).toHaveBeenLastCalledWith(true)
    expect(atualizar).toHaveBeenCalledTimes(2)
    limpar()
    expect(FonteTeste.ultima.fechada).toBe(true)
  })
})
