import { describe, expect, it } from 'vitest'

import {
  criarModeloAntagonistaPadrao,
  paradaExcepcionalSchema,
  validarModeloAntagonista,
  type ModeloAntagonista,
  type ParadaExcepcional,
} from './bestiario'

describe('Bestiário - Modelos de Antagonistas', () => {
  it('cria modelo padrão com valores válidos', () => {
    const padrao = criarModeloAntagonistaPadrao()
    expect(padrao.nome).toBe('')
    expect(padrao.categoria).toBe('Geral')
    expect(padrao.paradaFisico).toBe(1)
    expect(padrao.paradaSocial).toBe(1)
    expect(padrao.paradaMental).toBe(1)
    expect(padrao.vitalidade).toBe(3)
    expect(padrao.vontade).toBe(3)
    expect(padrao.paradasExcepcionais).toEqual([])
    expect(padrao.especiais).toEqual([])
    expect(padrao.notas).toBe('')
  })

  it('valida modelo com paradas excepcionais e especiais', () => {
    const paradasExcepcionais: ParadaExcepcional[] = [
      { nome: 'Armas de Fogo', valor: 7 },
      { nome: 'Prontidão', valor: 6 },
    ]

    const modelo: ModeloAntagonista = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      nome: 'Guarda da Camarilla',
      categoria: 'Segurança',
      paradaFisico: 5,
      paradaSocial: 2,
      paradaMental: 3,
      vitalidade: 6,
      vontade: 4,
      paradasExcepcionais,
      especiais: [
        { nome: 'Potência Sobrenatural', descricao: 'Adiciona 2 de dano em ataques físicos.' },
        { nome: 'Armadura Tática', descricao: 'Reduz 1 ponto de dano superficial sofrido.' },
      ],
      notas: 'Veste colete à prova de balas.',
    }

    const resultado = validarModeloAntagonista(modelo)
    expect(resultado.valido).toBe(true)
    if (resultado.valido) {
      expect(resultado.dados.nome).toBe('Guarda da Camarilla')
      expect(resultado.dados.paradasExcepcionais).toHaveLength(2)
      expect(resultado.dados.especiais).toHaveLength(2)
    }
  })

  it('valida paradaExcepcionalSchema corretamente', () => {
    const valida = paradaExcepcionalSchema.safeParse({ nome: 'Furtividade', valor: 6 })
    expect(valida.success).toBe(true)

    const semNome = paradaExcepcionalSchema.safeParse({ nome: '', valor: 4 })
    expect(semNome.success).toBe(false)

    const valorZero = paradaExcepcionalSchema.safeParse({ nome: 'Briga', valor: 0 })
    expect(valorZero.success).toBe(false)
  })

  it('rejeita modelo sem nome ou com valores negativos', () => {
    const invalido = {
      nome: '',
      paradaFisico: 0,
      paradaSocial: -1,
      paradaMental: 1,
      vitalidade: 0,
      vontade: -2,
      paradasExcepcionais: [],
      especiais: [],
      notas: '',
    }
    const resultado = validarModeloAntagonista(invalido)
    expect(resultado.valido).toBe(false)
  })
})
