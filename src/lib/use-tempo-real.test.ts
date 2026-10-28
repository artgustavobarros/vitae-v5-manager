import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { invalidar, limpezas } = vi.hoisted(() => ({
  invalidar: vi.fn(async () => {}),
  limpezas: [] as Array<() => void>,
}))

vi.mock('@tanstack/react-router', () => ({ useRouter: () => ({ invalidate: invalidar }) }))
vi.mock('react', () => ({
  useEffect: (iniciar: () => (() => void) | undefined) => {
    const limpar = iniciar()
    if (limpar) limpezas.push(limpar)
  },
}))

import { useTempoReal } from './use-tempo-real'

class FonteTeste {
  static abertas: FonteTeste[] = []
  onopen: (() => void) | null = null
  onmessage: ((evento: { data: string }) => void) | null = null
  onerror: (() => void) | null = null
  fechada = false

  constructor(_url: string) { FonteTeste.abertas.push(this) }
  close() { this.fechada = true }
}

beforeEach(() => {
  invalidar.mockClear()
  FonteTeste.abertas = []
  vi.stubGlobal('window', {})
  vi.stubGlobal('EventSource', FonteTeste)
})

afterEach(() => {
  for (const limpar of limpezas.splice(0)) limpar()
  vi.unstubAllGlobals()
})

describe('atualização em tempo real', () => {
  it('reconcilia dados ao reconectar mesmo sem receber os eventos perdidos', () => {
    useTempoReal(true)
    const fonte = FonteTeste.abertas[0]
    fonte.onopen?.()
    fonte.onopen?.()
    expect(invalidar).toHaveBeenCalledTimes(2)
  })

  it('não abre conexão sem sessão e fecha a conexão ao sair', () => {
    useTempoReal(false)
    expect(FonteTeste.abertas).toHaveLength(0)
    useTempoReal(true)
    for (const limpar of limpezas.splice(0)) limpar()
    expect(FonteTeste.abertas[0].fechada).toBe(true)
  })
})
