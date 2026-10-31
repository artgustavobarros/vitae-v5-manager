import { describe, expect, it } from 'vitest'
import { separarDificuldadeGeral } from './dificuldade-antagonista'
import { MODELOS_INICIAIS_BESTIARIO } from './bestiario-modelos-iniciais'

describe('Dificuldade Geral nos cards de Antagonistas', () => {
  it.each([
    ['Trilha de Caim. Dificuldade geral: 4/3.', { forte: 4, normal: 3 }, 'Trilha de Caim.'],
    ['Dificuldade geral: 3/2. Cão carniçal.', { forte: 3, normal: 2 }, 'Cão carniçal.'],
    ['Dificuldade geral: 2', { forte: 2, normal: null }, ''],
    ['Dificuldade geral: 0/0. Preservar zero.', { forte: 0, normal: 0 }, 'Preservar zero.'],
    ['DIFICULDADE GERAL: 6 / 4.\nUma nota.\n\nOutra nota.', { forte: 6, normal: 4 }, 'Uma nota.\n\nOutra nota.'],
  ])('separa %s sem perder o restante das notas', (notas, dificuldade, notasRestantes) => {
    expect(separarDificuldadeGeral(notas)).toEqual({ dificuldade, notas: notasRestantes })
  })

  it.each(['Sem dificuldade publicada.', '', 'Dificuldade geral: -1.', 'Dificuldade geral: 4/', 'Dificuldade geral: 3,5.'])('não inventa dificuldade nem altera notas sem um valor completo: %s', notas => {
    expect(separarDificuldadeGeral(notas)).toEqual({ dificuldade: null, notas })
  })

  it('apresenta os valores publicados dos 18 Modelos e mantém os dados originais editáveis', () => {
    const originais = structuredClone(MODELOS_INICIAIS_BESTIARIO)
    const fichas = MODELOS_INICIAIS_BESTIARIO.map(m => ({ nome: m.nome, ...separarDificuldadeGeral(m.notas) }))
    expect(fichas.filter(m => m.dificuldade)).toHaveLength(18)
    expect(fichas.find(m => m.nome === 'Batedor da Trilha de Caim')).toMatchObject({ dificuldade: { forte: 4, normal: 3 }, notas: 'Trilha de Caim.' })
    expect(fichas.find(m => m.nome === 'Sabujo de Sangue')?.dificuldade).toEqual({ forte: 3, normal: 2 })
    expect(fichas.find(m => m.nome === 'Servo Arruinado da Trilha do Poder e da Voz Interior')?.dificuldade).toEqual({ forte: 2, normal: null })
    expect(MODELOS_INICIAIS_BESTIARIO).toEqual(originais)
  })
})
