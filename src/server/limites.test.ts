import { afterEach, describe, expect, it, vi } from 'vitest'

import { criarLimitador, criarLimiteConexoes } from './limites'

afterEach(() => vi.useRealTimers())

describe('limites de requisições por identidade', () => {
  it('separa pessoas e libera novamente após a janela', () => {
    vi.useFakeTimers()
    const consumir = criarLimitador(2, 60_000)
    expect(consumir('j1')).toBe(0)
    expect(consumir('j1')).toBe(0)
    expect(consumir('j1')).toBe(60)
    expect(consumir('j2')).toBe(0)
    vi.advanceTimersByTime(60_000)
    expect(consumir('j1')).toBe(0)
  })

  it('não cresce sem limite nem expulsa bloqueios ativos para admitir novas identidades', () => {
    vi.useFakeTimers()
    const consumir = criarLimitador(1, 60_000, 2)
    expect(consumir('a')).toBe(0)
    expect(consumir('b')).toBe(0)
    expect(consumir('c')).toBe(60)
    expect(consumir('a')).toBe(60)
    vi.advanceTimersByTime(60_000)
    expect(consumir('c')).toBe(0)
  })

  it('limita conexões simultâneas e permite liberar cada vaga uma única vez', () => {
    const reservar = criarLimiteConexoes(2)
    const liberar = reservar('j1')!
    const liberarSegunda = reservar('j1')!
    expect(reservar('j1')).toBeNull()
    expect(reservar('j2')).toBeTypeOf('function')
    liberar()
    liberar()
    expect(reservar('j1')).toBeTypeOf('function')
    expect(reservar('j1')).toBeNull()
    liberarSegunda()
  })
})
