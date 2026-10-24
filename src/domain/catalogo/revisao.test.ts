import { describe, expect, it } from 'vitest'

import { contarPendentes, filaRevisao, idConsulta, itensRevisao, statusDe, type Revisao } from './revisao'
import type { ItemCatalogo } from './tipos'

const CATALOGO: ItemCatalogo[] = [
  {
    id: 'dominacao-1-compelir',
    tipo: 'poder',
    disciplina: 'dominacao',
    nivel: 1,
    nome: 'Compelir',
    nomeOriginal: 'Compel',
    descricao: 'x',
    custo: 'Grátis',
    fonte: { livro: 'Corebook', pagina: 256 },
    confianca: 'duvida',
  },
  {
    id: 'vantagem-recursos',
    tipo: 'vantagem',
    escopo: 'personagem',
    grupo: 'Recursos',
    niveis: [1, 2, 3],
    repetivel: false,
    nome: 'Recursos',
    nomeOriginal: 'Resources',
    descricao: 'y',
    fonte: { livro: 'Corebook', pagina: null },
    confianca: 'certo',
  },
]

const CONSULTAS = [['atributo', { forca: { id: 'forca', titulo: 'Força', descricao: 'z' } }]] as Parameters<
  typeof itensRevisao
>[1]

const itens = itensRevisao(CATALOGO, CONSULTAS)

const em = (min: number) => new Date(2026, 9, 24, 12, min)

describe('itensRevisao', () => {
  it('junta Catálogo e consulta rápida, com o texto da consulta como "certo"', () => {
    expect(itens.map((i) => [i.id, i.rotulo, i.nivel, i.confianca])).toEqual([
      ['dominacao-1-compelir', 'Poder · Dominação', '1', 'duvida'],
      ['vantagem-recursos', 'Vantagem · Recursos', '1, 2, 3', 'certo'],
      [idConsulta('atributo', 'forca'), 'Consulta rápida · Atributo', null, 'certo'],
    ])
  })
})

describe('statusDe', () => {
  it('é pendente sem revisão e segue a mais recente', () => {
    const revisoes: Revisao[] = [
      { itemId: 'a', status: 'sugerido', criadoEm: em(1) },
      { itemId: 'a', status: 'aprovado', criadoEm: em(2) },
    ]
    expect(statusDe(revisoes, 'b')).toBe('pendente')
    expect(statusDe(revisoes, 'a')).toBe('aprovado')
    expect(statusDe([...revisoes].reverse(), 'a')).toBe('aprovado')
  })

  it('considera aplicada a sugestão quando o texto já está no código', () => {
    const revisoes: Revisao[] = [
      { itemId: 'dominacao-1-compelir', status: 'sugerido', sugestaoNome: 'Obrigar', criadoEm: em(1) },
    ]
    expect(filaRevisao(itens, revisoes, { confianca: 'duvida', categoria: null, busca: '' })).toHaveLength(1)
    const atualizado = [{ ...itens[0], nome: 'Obrigar', confianca: 'certo' as const }, ...itens.slice(1)]
    expect(contarPendentes(atualizado, revisoes)).toBe(2)
    expect(filaRevisao(atualizado, revisoes, { confianca: 'certo', categoria: null, busca: '' })).toHaveLength(2)
  })
})

describe('filaRevisao', () => {
  const filtro = { confianca: 'duvida', categoria: null, busca: '' } as const

  it('filtra por confiança e tira os aprovados', () => {
    expect(filaRevisao(itens, [], filtro).map((i) => i.id)).toEqual(['dominacao-1-compelir'])
    const aprovado: Revisao[] = [{ itemId: 'dominacao-1-compelir', status: 'aprovado', criadoEm: em(1) }]
    expect(filaRevisao(itens, aprovado, filtro)).toEqual([])
  })

  it('mantém o sugerido na fila, marcado', () => {
    const sugerido: Revisao[] = [{ itemId: 'dominacao-1-compelir', status: 'sugerido', criadoEm: em(1) }]
    expect(filaRevisao(itens, sugerido, filtro)[0].status).toBe('sugerido')
  })

  it('filtra por categoria e busca pelo nome original sem acento', () => {
    const certo = { confianca: 'certo', categoria: 'consulta', busca: 'FORCA' } as const
    expect(filaRevisao(itens, [], certo).map((i) => i.nome)).toEqual(['Força'])
    expect(filaRevisao(itens, [], { ...filtro, busca: 'compel' })).toHaveLength(1)
  })
})

describe('contarPendentes', () => {
  it('conta o que não foi aprovado nem sugerido', () => {
    const revisoes: Revisao[] = [
      { itemId: 'dominacao-1-compelir', status: 'sugerido', criadoEm: em(1) },
      { itemId: 'vantagem-recursos', status: 'aprovado', criadoEm: em(1) },
    ]
    expect(contarPendentes(itens, revisoes)).toBe(1)
  })
})
