import { describe, expect, it } from 'vitest'

import {
  claGeracaoCombinam,
  clasPermitidos,
  escolherCla,
  escolherGeracao,
  fichaNeofito,
  fichaSchema,
  geracoesPermitidas,
  normalizarFicha,
  vitalidadeMax,
  vontadeMax,
  type Ficha,
} from './ficha'

describe('fichaNeofito', () => {
  const ficha = fichaNeofito()

  it('nasce com Atributos 1 e Habilidades 0', () => {
    expect(ficha.atributos.vigor).toBe(1)
    expect(ficha.atributos.determinacao).toBe(1)
    expect(ficha.habilidades.atletismo).toEqual({ valor: 0, especializacoes: [] })
    expect(ficha.habilidades.ocultismo).toEqual({ valor: 0, especializacoes: [] })
  })

  it('nasce com Humanidade 7, Potência do Sangue 1 e Fome 1', () => {
    expect(ficha).toMatchObject({ humanidade: 7, potenciaSangue: 1, fome: 1, manchas: 0 })
  })

  it('nasce sem Clã, sem Geração, sem Seita, sem Disciplinas e sem dano', () => {
    expect(ficha).toMatchObject({
      cla: null,
      geracao: null,
      seita: null,
      disciplinas: [],
      danoVitalidade: { superficial: 0, agravado: 0 },
      danoVontade: { superficial: 0, agravado: 0 },
    })
  })
})

describe('Valores Derivados', () => {
  const ficha = fichaNeofito()
  ficha.atributos.vigor = 3
  ficha.atributos.autocontrole = 2
  ficha.atributos.determinacao = 4

  it('Vitalidade é Vigor + 3', () => {
    expect(vitalidadeMax(ficha)).toBe(6)
  })

  it('Força de Vontade é Autocontrole + Determinação', () => {
    expect(vontadeMax(ficha)).toBe(6)
  })
})

describe('normalizarFicha', () => {
  function fichaCom(vigor: number, dano: { superficial: number; agravado: number }) {
    const ficha = fichaNeofito()
    ficha.atributos.vigor = vigor
    ficha.danoVitalidade = dano
    return ficha
  }

  it('mantém o dano que cabe na Vitalidade', () => {
    expect(normalizarFicha(fichaCom(3, { superficial: 4, agravado: 2 })).danoVitalidade).toEqual({
      superficial: 4,
      agravado: 2,
    })
  })

  it('quando a Vitalidade cai, corta primeiro o dano superficial', () => {
    // Vigor 1: Vitalidade 4.
    expect(normalizarFicha(fichaCom(1, { superficial: 3, agravado: 2 })).danoVitalidade).toEqual({
      superficial: 2,
      agravado: 2,
    })
  })

  it('só corta agravado depois que o superficial acabou', () => {
    expect(normalizarFicha(fichaCom(1, { superficial: 1, agravado: 5 })).danoVitalidade).toEqual({
      superficial: 0,
      agravado: 4,
    })
  })

  it('corta o dano da Força de Vontade quando ela cai', () => {
    const ficha = fichaNeofito()
    // Autocontrole 1 + Determinação 1: Força de Vontade 2.
    ficha.danoVontade = { superficial: 2, agravado: 1 }
    expect(normalizarFicha(ficha).danoVontade).toEqual({ superficial: 1, agravado: 1 })
  })

  it('limita as Manchas ao espaço acima da Humanidade', () => {
    const ficha = fichaNeofito()
    ficha.humanidade = 9
    ficha.manchas = 3
    expect(normalizarFicha(ficha).manchas).toBe(1)
  })
})

describe('fichaSchema', () => {
  function com(mudar: (ficha: Ficha) => void): unknown {
    const ficha = fichaNeofito()
    mudar(ficha)
    return ficha
  }

  it('aceita a Ficha do Neófito', () => {
    expect(fichaSchema.safeParse(fichaNeofito()).success).toBe(true)
  })

  it('aceita os limites das faixas', () => {
    const ficha = com((f) => {
      f.cla = 'malkaviano'
      f.geracao = 16
      f.atributos.forca = 5
      f.habilidades.briga.valor = 5
      f.disciplinas = [{ disciplina: 'oblivio', nivel: 5 }]
      f.humanidade = 0
      f.potenciaSangue = 10
    })
    expect(fichaSchema.safeParse(ficha).success).toBe(true)
  })

  it.each<[string, (f: Ficha) => void]>([
    ['Atributo 0', (f) => (f.atributos.forca = 0)],
    ['Atributo 6', (f) => (f.atributos.forca = 6)],
    ['Habilidade 6', (f) => (f.habilidades.briga.valor = 6)],
    ['Habilidade negativa', (f) => (f.habilidades.briga.valor = -1)],
    ['Disciplina 0', (f) => (f.disciplinas = [{ disciplina: 'potencia', nivel: 0 }])],
    ['Disciplina 6', (f) => (f.disciplinas = [{ disciplina: 'potencia', nivel: 6 }])],
    ['Humanidade 11', (f) => (f.humanidade = 11)],
    ['Potência do Sangue 11', (f) => (f.potenciaSangue = 11)],
    ['Geração 3', (f) => (f.geracao = 3)],
    ['Geração 17', (f) => (f.geracao = 17)],
    ['Fome 6', (f) => (f.fome = 6)],
    ['valor quebrado', (f) => (f.atributos.vigor = 2.5)],
  ])('rejeita %s', (_, mudar) => {
    expect(fichaSchema.safeParse(com(mudar)).success).toBe(false)
  })

  it('Seita é Camarilla, Sabá ou Anarquistas', () => {
    expect(fichaSchema.safeParse({ ...fichaNeofito(), seita: 'anarquistas' }).success).toBe(true)
    expect(fichaSchema.safeParse({ ...fichaNeofito(), seita: 'Inconnu' }).success).toBe(false)
  })

  it('rejeita Clã e Disciplina fora das listas', () => {
    expect(fichaSchema.safeParse({ ...fichaNeofito(), cla: 'baali' }).success).toBe(false)
    expect(
      fichaSchema.safeParse({ ...fichaNeofito(), disciplinas: [{ disciplina: 'vicissitude', nivel: 1 }] })
        .success,
    ).toBe(false)
  })

  it('rejeita a mesma Disciplina duas vezes', () => {
    const ficha = com((f) => {
      f.disciplinas = [
        { disciplina: 'presenca', nivel: 1 },
        { disciplina: 'presenca', nivel: 2 },
      ]
    })
    expect(fichaSchema.safeParse(ficha).success).toBe(false)
  })

  it('rejeita Ficha sem uma Habilidade', () => {
    const ficha = fichaNeofito()
    const { briga: _, ...semBriga } = ficha.habilidades
    expect(fichaSchema.safeParse({ ...ficha, habilidades: semBriga }).success).toBe(false)
  })
})

describe('Clã e Geração', () => {
  it('Sangue-Ralo só vai da 14ª à 16ª Geração', () => {
    expect(geracoesPermitidas('sangue-ralo')).toEqual([14, 15, 16])
  })

  it('os demais clãs, Caitiff incluído, vão da 4ª à 13ª', () => {
    expect(geracoesPermitidas('caitiff')).toEqual([4, 5, 6, 7, 8, 9, 10, 11, 12, 13])
    expect(geracoesPermitidas('ventrue')).toHaveLength(10)
  })

  it('sem Clã, qualquer Geração da faixa', () => {
    expect(geracoesPermitidas(null)).toHaveLength(13)
  })

  it('da 14ª Geração em diante, só Sangue-Ralo', () => {
    expect(clasPermitidos(14)).toEqual(['sangue-ralo'])
  })

  it('até a 13ª Geração, todos os clãs menos Sangue-Ralo', () => {
    expect(clasPermitidos(13)).not.toContain('sangue-ralo')
    expect(clasPermitidos(13)).toHaveLength(15)
  })

  it('Clã e Geração combinam quando algum dos dois está vazio ou a regra aceita', () => {
    expect(claGeracaoCombinam({ cla: 'sangue-ralo', geracao: 15 })).toBe(true)
    expect(claGeracaoCombinam({ cla: null, geracao: 15 })).toBe(true)
    expect(claGeracaoCombinam({ cla: 'sangue-ralo', geracao: 12 })).toBe(false)
    expect(claGeracaoCombinam({ cla: 'brujah', geracao: 14 })).toBe(false)
  })

  it('escolher um Clã que não combina com a Geração apaga a Geração', () => {
    expect(escolherCla({ cla: null, geracao: 12 }, 'sangue-ralo')).toEqual({ cla: 'sangue-ralo', geracao: null })
    expect(escolherCla({ cla: null, geracao: 12 }, 'toreador')).toEqual({ cla: 'toreador', geracao: 12 })
  })

  it('escolher uma Geração que não combina com o Clã apaga o Clã', () => {
    expect(escolherGeracao({ cla: 'toreador', geracao: null }, 15)).toEqual({ cla: null, geracao: 15 })
    expect(escolherGeracao({ cla: 'sangue-ralo', geracao: null }, 15)).toEqual({ cla: 'sangue-ralo', geracao: 15 })
  })
})
