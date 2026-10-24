import { describe, expect, it } from 'vitest'

import { tempoRelativo } from './tempo-relativo'

describe('tempoRelativo', () => {
  const agora = new Date('2026-10-23T21:00:00')
  const antes = (ms: number) => new Date(agora.getTime() - ms)
  const MIN = 60_000

  it('menos de um minuto é "agora"', () => {
    expect(tempoRelativo(antes(20_000), agora)).toBe('agora')
  })

  it('conta minutos, horas e dias', () => {
    expect(tempoRelativo(antes(5 * MIN), agora)).toBe('há 5 minutos')
    expect(tempoRelativo(antes(60 * MIN), agora)).toBe('há 1 hora')
    expect(tempoRelativo(antes(24 * 60 * MIN), agora)).toBe('ontem')
    expect(tempoRelativo(antes(3 * 24 * 60 * MIN), agora)).toBe('há 3 dias')
  })
})
