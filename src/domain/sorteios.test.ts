import { describe, expect, it } from 'vitest'

import {
  COMPULSOES_CLANICAS,
  COMPULSOES_GERAIS,
  DISCRASIAS,
  RESSONANCIAS,
  ehSangueFraco,
  sortearCompulsao,
  sortearDiscrasia,
  sortearRessonancia,
  type TipoRessonancia,
} from './sorteios'

describe('Sorteios de Ressonância', () => {
  it('contém os 4 tipos de ressonância do V5 com suas emoções e disciplinas', () => {
    expect(RESSONANCIAS).toHaveLength(4)
    const tipos = RESSONANCIAS.map((r) => r.id)
    expect(tipos).toEqual(['colerico', 'melancolico', 'fleumatico', 'sanguineo'])
  })

  it('sorteia tipo e intensidade usando o rng injetado', () => {
    // rng que resulta no primeiro item e intensidade fugaz
    const resultado = sortearRessonancia(() => 0.1)
    expect(resultado.tipo.id).toBe('colerico')
    expect(resultado.intensidade.id).toBeDefined()
  })

  it('quando intensidade for aguda, inclui automaticamente uma discrasia', () => {
    // rng que seleciona aguda (última intensidade)
    let count = 0
    const rng = () => {
      count++
      // Primeira chamada: tipo (0.0 -> colerico)
      // Segunda chamada: intensidade (0.95 -> aguda)
      // Terceira chamada: discrasia (0.0 -> primeira discrasia)
      return count === 2 ? 0.95 : 0.0
    }
    const resultado = sortearRessonancia(rng)
    expect(resultado.intensidade.id).toBe('aguda')
    expect(resultado.discrasia).toBeDefined()
    expect(resultado.discrasia?.tipoRessonancia).toBe(resultado.tipo.id)
  })

  it('quando intensidade não for aguda, não inclui discrasia', () => {
    let count = 0
    const rng = () => {
      count++
      // Primeira chamada: colerico
      // Segunda chamada: desprezivel (0.0)
      return 0.0
    }
    const resultado = sortearRessonancia(rng)
    expect(resultado.intensidade.id).toBe('desprezivel')
    expect(resultado.discrasia).toBeUndefined()
  })

  it('manifesta disciplina e poder nível 1 para Sangue-Fraco em rolagens normais', () => {
    // dadoD10Forcado = 7 (Fugaz)
    const resultado = sortearRessonancia(Math.random, 7)
    expect(resultado.intensidade.id).toBe('fugaz')
    expect(resultado.manifestacaoSangueFraco).toBeDefined()
    expect(resultado.manifestacaoSangueFraco.nivel).toBe(1)
    expect(resultado.manifestacaoSangueFraco.poderes).toHaveLength(1)
    expect(resultado.manifestacaoSangueFraco.poderes[0].nivel).toBe(1)
    expect(resultado.tipo.disciplinaIds).toContain(resultado.manifestacaoSangueFraco.disciplinaId)
  })

  it('manifesta disciplina nível 2 com 1 poder nível 1 e 1 poder nível 2 em rolagens 9 ou 10 (Intensa/Aguda)', () => {
    // dadoD10Forcado = 9 (Intensa)
    const resultadoIntensa = sortearRessonancia(Math.random, 9)
    expect(resultadoIntensa.intensidade.id).toBe('intensa')
    expect(resultadoIntensa.manifestacaoSangueFraco.nivel).toBe(2)
    expect(resultadoIntensa.manifestacaoSangueFraco.poderes).toHaveLength(2)
    expect(resultadoIntensa.manifestacaoSangueFraco.poderes[0].nivel).toBe(1)
    expect(resultadoIntensa.manifestacaoSangueFraco.poderes[1].nivel).toBe(2)
    expect(resultadoIntensa.tipo.disciplinaIds).toContain(resultadoIntensa.manifestacaoSangueFraco.disciplinaId)

    // dadoD10Forcado = 10 (Aguda)
    const resultadoAguda = sortearRessonancia(Math.random, 10)
    expect(resultadoAguda.intensidade.id).toBe('aguda')
    expect(resultadoAguda.manifestacaoSangueFraco.nivel).toBe(2)
    expect(resultadoAguda.manifestacaoSangueFraco.poderes).toHaveLength(2)
    expect(resultadoAguda.manifestacaoSangueFraco.poderes[0].nivel).toBe(1)
    expect(resultadoAguda.manifestacaoSangueFraco.poderes[1].nivel).toBe(2)
  })
})

describe('Sorteios de Discrasia Avulsa', () => {
  it('possui discrasias cadastradas para todos os 4 tipos de ressonância', () => {
    const tipos: TipoRessonancia[] = ['colerico', 'melancolico', 'fleumatico', 'sanguineo']
    for (const tipo of tipos) {
      const discrasiasDoTipo = DISCRASIAS.filter((d) => d.tipoRessonancia === tipo)
      expect(discrasiasDoTipo.length).toBeGreaterThan(0)
    }
  })

  it('sorteia discrasia avulsa para um tipo específico de ressonância', () => {
    const discrasia = sortearDiscrasia('melancolico', () => 0.0)
    expect(discrasia.tipoRessonancia).toBe('melancolico')
    expect(discrasia.nome).toBeDefined()
    expect(discrasia.descricao).toBeDefined()
  })

  it('sorteia discrasia avulsa entre qualquer tipo quando não especificado', () => {
    const discrasia = sortearDiscrasia(undefined, () => 0.5)
    expect(discrasia).toBeDefined()
    expect(discrasia.nome).toBeDefined()
  })
})

describe('Sorteios de Compulsão', () => {
  it('contém as 4 compulsões gerais do V5 e cobre os clãs', () => {
    expect(COMPULSOES_GERAIS).toHaveLength(4)
    expect(COMPULSOES_CLANICAS.length).toBeGreaterThanOrEqual(14)
    const ids = COMPULSOES_GERAIS.map((c) => c.id)
    expect(ids).toEqual(['fome', 'dominancia', 'dano', 'paranoia'])
  })

  it('sorteia uma compulsão geral', () => {
    const compulsao = sortearCompulsao('geral', undefined, () => 0.0)
    expect(compulsao.tipo).toBe('geral')
    expect(compulsao.nome).toBe('Fome')
    expect(compulsao.descricao).toContain('sangue')
  })

  it('sorteia uma compulsão de clã específico', () => {
    const compulsao = sortearCompulsao('cla', 'ventrue')
    expect(compulsao.tipo).toBe('cla')
    expect(compulsao.claId).toBe('ventrue')
    expect(compulsao.nome).toBe('Comando Régio')
  })

  it('sorteia uma compulsão de clã aleatório se nenhum clã for especificado', () => {
    const compulsao = sortearCompulsao('cla', undefined, () => 0.0)
    expect(compulsao.tipo).toBe('cla')
    expect(compulsao.claId).toBeDefined()
    expect(compulsao.nome).toBeDefined()
  })
})

describe('Regra de Sangue-Fraco (ehSangueFraco)', () => {
  it('retorna true para string "sangue-fraco" e "sangue-ralo"', () => {
    expect(ehSangueFraco('sangue-fraco')).toBe(true)
    expect(ehSangueFraco('sangue-ralo')).toBe(true)
  })

  it('retorna true para objetos com id "sangue-fraco" e "sangue-ralo"', () => {
    expect(ehSangueFraco({ id: 'sangue-fraco' })).toBe(true)
    expect(ehSangueFraco({ id: 'sangue-ralo' })).toBe(true)
  })

  it('retorna false para outros clãs ou formatos inválidos', () => {
    expect(ehSangueFraco('ventrue')).toBe(false)
    expect(ehSangueFraco('brujah')).toBe(false)
    expect(ehSangueFraco('caitiff')).toBe(false)
    expect(ehSangueFraco({ id: 'toreador' })).toBe(false)
    expect(ehSangueFraco(null)).toBe(false)
    expect(ehSangueFraco(undefined)).toBe(false)
    expect(ehSangueFraco('')).toBe(false)
  })
})
