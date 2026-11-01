import { describe, expect, it } from 'vitest'

import { criarControleCabecalho } from './cabecalho-rolagem'

describe('visibilidade do cabeçalho durante a rolagem', () => {
  it('permanece visível no topo e recolhe ao descer pela página', () => {
    const ocultar = criarControleCabecalho()
    expect([0, 12, 56, 80, 400].map(y => ocultar(y))).toEqual([false, false, false, true, true])
  })

  it('reaparece ao subir e ignora pequenas oscilações na direção', () => {
    const ocultar = criarControleCabecalho()
    expect([400, 397, 393, 392, 395, 400].map(y => ocultar(y))).toEqual([true, true, true, false, false, true])
  })

  it('não confunde o rebote no fim da página com uma subida', () => {
    const ocultar = criarControleCabecalho()
    expect([0, 1000, 1300, 1010, 1000, 999, 992].map(y => ocultar(y, 1000))).toEqual([false, true, true, true, true, true, false])
  })

  it('mantém o cabeçalho visível no rebote acima do início', () => {
    const ocultar = criarControleCabecalho()
    expect([400, 0, -120, -20, 0, 20].map(y => ocultar(y))).toEqual([true, false, false, false, false, false])
  })

  it('considera a posição restaurada ao entrar em uma página longa', () => {
    const ocultar = criarControleCabecalho(2000)
    expect([2000, 2008, 2012, 2004].map(y => ocultar(y))).toEqual([false, true, true, false])
  })
})
