import { describe, expect, it } from 'vitest'

import { ATRIBUTOS, CLAS, DISCIPLINAS, HABILIDADES } from '../ficha'
import {
  buscarConsultaRegra,
  consultaDoCatalogo,
  CONSULTA_ATRIBUTOS,
  CONSULTA_CLAS,
  CONSULTA_DISCIPLINAS,
  CONSULTA_HABILIDADES,
} from './regras-consulta'

describe('regras-consulta', () => {
  it('cobre todos os 9 atributos', () => {
    for (const attr of ATRIBUTOS) {
      expect(CONSULTA_ATRIBUTOS[attr.id]).toBeDefined()
      expect(buscarConsultaRegra('atributo', attr.id)?.titulo).toBe(attr.nome)
    }
  })

  it('cobre todas as 27 habilidades com exemplos de especializações', () => {
    for (const hab of HABILIDADES) {
      const item = CONSULTA_HABILIDADES[hab.id]
      expect(item).toBeDefined()
      expect(item.exemplosEspecializacoes?.length).toBeGreaterThan(0)
      expect(buscarConsultaRegra('habilidade', hab.id)?.titulo).toBe(hab.nome)
    }
  })

  it('cobre todos os 16 clãs com disciplinas, perdição e compulsão', () => {
    for (const cla of CLAS) {
      const item = CONSULTA_CLAS[cla.id]
      expect(item).toBeDefined()
      expect(item.disciplinas?.length).toBeGreaterThan(0)
      expect(item.perdicao).toBeDefined()
      expect(item.compulsao).toBeDefined()
    }
  })

  it('cobre todas as 12 disciplinas', () => {
    for (const disc of DISCIPLINAS) {
      expect(CONSULTA_DISCIPLINAS[disc.id]).toBeDefined()
    }
  })

  it('cobre os 3 domínios de coterie (caça, abrigo, porte)', () => {
    expect(buscarConsultaRegra('dominio', 'caca')).toBeDefined()
    expect(buscarConsultaRegra('dominio', 'abrigo')).toBeDefined()
    expect(buscarConsultaRegra('dominio', 'porte')).toBeDefined()
  })
})

describe('consultaDoCatalogo', () => {
  it('monta o cartão do poder com custo, parada, amálgama e fonte', () => {
    const cartao = consultaDoCatalogo({
      id: 'dominacao-1-compelir',
      tipo: 'poder',
      disciplina: 'dominacao',
      nivel: 1,
      nome: 'Compelir',
      nomeOriginal: 'Compel',
      descricao: 'd',
      custo: 'Grátis',
      parada: 'Carisma + Dominação',
      amalgama: { disciplina: 'auspicios', nivel: 2 },
      fonte: { livro: 'Corebook', pagina: 256 },
      errata: true,
      confianca: 'certo',
    })
    expect(cartao.titulo).toBe('Compelir (Compel)')
    expect(cartao.subtitulo).toBe('Dominação · Nível 1')
    expect(cartao.campos).toEqual([
      { rotulo: 'Custo', valor: 'Grátis' },
      { rotulo: 'Parada', valor: 'Carisma + Dominação' },
      { rotulo: 'Amálgama', valor: 'Auspícios 2' },
      { rotulo: 'Fonte', valor: 'Corebook, p. 256 (com errata)' },
    ])
  })

  it('id fora do Catálogo não abre consulta', () => {
    expect(buscarConsultaRegra('catalogo', 'dominacao-9-sumiu')).toBeNull()
  })
})
