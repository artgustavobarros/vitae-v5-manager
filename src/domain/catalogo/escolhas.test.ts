import { describe, expect, it } from 'vitest'

import { fichaNeofito, type Ficha } from '../ficha'
import {
  escolhasInvalidas,
  itensSoltos,
  motivosPoder,
  opcoesPoderes,
  opcoesRituais,
  opcoesVantagens,
  pontos,
  situacaoItem,
  temVagaDePoder,
} from './escolhas'
import type { ItemCatalogo, Poder, Ritual, Vantagem } from './tipos'

const base = { descricao: 'x', fonte: { livro: 'Corebook', pagina: 1 }, confianca: 'certo', custo: 'Grátis' } as const

function poder(id: string, nivel: Poder['nivel'], extra: Partial<Poder> = {}): Poder {
  return { ...base, id, tipo: 'poder', disciplina: 'dominacao', nivel, nome: id, nomeOriginal: id, ...extra }
}

function ritual(id: string, tipo: Ritual['tipo'], nivel: Ritual['nivel']): Ritual {
  return { ...base, id, tipo, nivel, nome: id, nomeOriginal: id }
}

function vantagem(id: string, extra: Partial<Vantagem> = {}): Vantagem {
  const { custo: _, ...semCusto } = base
  return {
    ...semCusto,
    id,
    tipo: 'vantagem',
    escopo: 'personagem',
    grupo: 'g',
    niveis: [1, 2, 3],
    repetivel: false,
    nome: id,
    nomeOriginal: id,
    ...extra,
  }
}

const compelir = poder('dominacao-1-compelir', 1)
const mesmerizar = poder('dominacao-2-mesmerizar', 2)
const esquecer = poder('dominacao-1-esquecer', 1)
const terminal = poder('dominacao-3-terminal', 3)
const amalgama = poder('dominacao-2-amalgama', 2, { amalgama: { disciplina: 'auspicios', nivel: 1 } })
const PODERES = [compelir, mesmerizar, esquecer, terminal, amalgama]

const sangue1 = ritual('ritual-1-a', 'ritual', 1)
const sangue3 = ritual('ritual-3-b', 'ritual', 3)
const cerimonia = ritual('cerimonia-1-c', 'cerimonia', 1)
const RITUAIS = [sangue1, sangue3, cerimonia]

const contatos = vantagem('vantagem-contatos', { repetivel: true })
const recursos = vantagem('vantagem-recursos')
const inimigo = vantagem('defeito-inimigo', { tipo: 'defeito', niveis: [1, 2] })
const VANTAGENS = [contatos, recursos, inimigo]

const CATALOGO: ItemCatalogo[] = [...PODERES, ...RITUAIS, ...VANTAGENS]
const buscar = (id: string) => CATALOGO.find((i) => i.id === id) ?? null

function ficha(extra: Partial<Ficha>): Ficha {
  return { ...fichaNeofito(), ...extra }
}

const dominacao2 = ficha({ disciplinas: [{ disciplina: 'dominacao', nivel: 2 }] })

describe('poderes para o Jogador', () => {
  it('só oferece poderes de nível menor ou igual ao da Disciplina', () => {
    const ids = opcoesPoderes(dominacao2, 'dominacao', 'jogador', PODERES, buscar).map((o) => o.item.id)
    expect(ids).toEqual([compelir.id, mesmerizar.id, esquecer.id, amalgama.id])
  })

  it('não oferece o que já está na Ficha', () => {
    const f = { ...dominacao2, poderes: [compelir.id] }
    const ids = opcoesPoderes(f, 'dominacao', 'jogador', PODERES, buscar).map((o) => o.item.id)
    expect(ids).not.toContain(compelir.id)
  })

  it('bloqueia quando a Disciplina já tem tantos poderes quanto o nível', () => {
    const f = { ...dominacao2, poderes: [compelir.id, esquecer.id] }
    expect(temVagaDePoder(f, 'dominacao', buscar)).toBe(false)
    expect(motivosPoder(f, mesmerizar, buscar)).toEqual(['limite'])
    expect(opcoesPoderes(f, 'dominacao', 'jogador', PODERES, buscar).every((o) => o.bloqueado)).toBe(true)
  })

  it('poder removido do Catálogo não ocupa vaga', () => {
    const f = { ...dominacao2, poderes: [compelir.id, 'dominacao-1-sumiu'] }
    expect(temVagaDePoder(f, 'dominacao', buscar)).toBe(true)
  })

  it('bloqueia o amálgama sem a outra Disciplina no nível exigido', () => {
    const opcao = opcoesPoderes(dominacao2, 'dominacao', 'jogador', PODERES, buscar).find(
      (o) => o.item.id === amalgama.id,
    )
    expect(opcao).toMatchObject({ motivos: ['amalgama'], bloqueado: true })

    const comAuspicios = ficha({
      disciplinas: [
        { disciplina: 'dominacao', nivel: 2 },
        { disciplina: 'auspicios', nivel: 1 },
      ],
    })
    expect(motivosPoder(comAuspicios, amalgama, buscar)).toEqual([])
  })
})

describe('poderes para o Narrador', () => {
  it('vê todos, com aviso, sem bloqueio', () => {
    const opcoes = opcoesPoderes(dominacao2, 'dominacao', 'narrador', PODERES, buscar)
    expect(opcoes).toHaveLength(PODERES.length)
    expect(opcoes.find((o) => o.item.id === terminal.id)).toMatchObject({ motivos: ['nivel'], bloqueado: false })
  })
})

describe('Rituais, Cerimônias e Fórmulas', () => {
  const sangue2 = ficha({ disciplinas: [{ disciplina: 'feiticaria-de-sangue', nivel: 2 }] })

  it('o Jogador só vê os do nível da Disciplina certa, sem teto de quantidade', () => {
    expect(opcoesRituais(sangue2, 'ritual', 'jogador', RITUAIS).map((o) => o.item.id)).toEqual([sangue1.id])
    expect(opcoesRituais(sangue2, 'cerimonia', 'jogador', RITUAIS)).toEqual([])
  })

  it('o Narrador vê todos com aviso', () => {
    const opcoes = opcoesRituais(sangue2, 'ritual', 'narrador', RITUAIS)
    expect(opcoes.map((o) => o.motivos)).toEqual([[], ['nivel']])
  })
})

describe('situacaoItem', () => {
  it('marca poderes e Rituais acima do nível sem apagar', () => {
    const f = ficha({
      disciplinas: [
        { disciplina: 'dominacao', nivel: 1 },
        { disciplina: 'feiticaria-de-sangue', nivel: 1 },
      ],
    })
    expect(situacaoItem(f, compelir.id, buscar)).toBe('ok')
    expect(situacaoItem(f, mesmerizar.id, buscar)).toBe('acima-do-nivel')
    expect(situacaoItem(f, sangue3.id, buscar)).toBe('acima-do-nivel')
  })

  it('id que saiu do Catálogo é "removido"', () => {
    expect(situacaoItem(dominacao2, 'dominacao-9-sumiu', buscar)).toBe('removido')
  })
})

describe('itensSoltos', () => {
  it('junta removidos do Catálogo e itens de Disciplina que saiu da Ficha', () => {
    const f = ficha({
      disciplinas: [{ disciplina: 'dominacao', nivel: 1 }],
      poderes: [compelir.id, 'dominacao-1-sumiu'],
      rituais: [sangue1.id],
    })
    expect(itensSoltos(f, buscar)).toEqual(['dominacao-1-sumiu', sangue1.id])
  })
})

describe('Vantagens e Defeitos', () => {
  it('não repetível sai do seletor depois de escolhida; repetível fica', () => {
    const escolhidas = [
      { id: contatos.id, nivel: 1 },
      { id: recursos.id, nivel: 2 },
    ]
    expect(opcoesVantagens(escolhidas, 'vantagem', VANTAGENS).map((v) => v.id)).toEqual([contatos.id])
    expect(opcoesVantagens([], 'defeito', VANTAGENS).map((v) => v.id)).toEqual([inimigo.id])
  })

  it('soma os pontos', () => {
    expect(pontos([{ id: 'a', nivel: 2 }, { id: 'b', nivel: 3 }])).toBe(5)
  })
})

describe('escolhasInvalidas (servidor, para o Jogador)', () => {
  it('aceita escolhas dentro das regras', () => {
    const depois = { ...dominacao2, poderes: [compelir.id], vantagens: [{ id: recursos.id, nivel: 2 }] }
    expect(escolhasInvalidas(dominacao2, depois, buscar)).toEqual([])
  })

  it('recusa poder novo acima do nível, amálgama sem a outra Disciplina e id desconhecido', () => {
    const depois = { ...dominacao2, poderes: [terminal.id, amalgama.id, 'inventado'] }
    expect(escolhasInvalidas(dominacao2, depois, buscar)).toEqual([terminal.id, amalgama.id, 'inventado'])
  })

  it('não recusa o que já estava na Ficha, mesmo acima do nível', () => {
    const antes = { ...dominacao2, poderes: [terminal.id] }
    expect(escolhasInvalidas(antes, { ...antes }, buscar)).toEqual([])
  })

  it('recusa Ritual no campo errado ou acima do nível', () => {
    const f = ficha({ disciplinas: [{ disciplina: 'feiticaria-de-sangue', nivel: 1 }] })
    expect(escolhasInvalidas(f, { ...f, rituais: [sangue3.id] }, buscar)).toEqual([sangue3.id])
    expect(escolhasInvalidas(f, { ...f, cerimonias: [sangue1.id] }, buscar)).toEqual([sangue1.id])
  })

  it('recusa nível que o item não permite e não repetível em dobro', () => {
    expect(escolhasInvalidas(dominacao2, { ...dominacao2, defeitos: [{ id: inimigo.id, nivel: 3 }] }, buscar)).toEqual([
      inimigo.id,
    ])
    const dobro = [
      { id: recursos.id, nivel: 1 },
      { id: recursos.id, nivel: 2 },
    ]
    expect(escolhasInvalidas(dominacao2, { ...dominacao2, vantagens: dobro }, buscar)).toHaveLength(2)
  })
})
