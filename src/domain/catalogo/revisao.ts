/**
 * Página de revisão de tradução (`/catalogo/revisao`): junta o Catálogo e os textos da
 * consulta rápida numa fila só. "Aprovado" tira da fila; "sugerido" fica marcado até a
 * sugestão entrar no código.
 */

import { DISCIPLINAS } from '../ficha'
import { casaBusca } from './busca'
import { CATALOGO } from './index'
import {
  CONSULTA_ATRIBUTOS,
  CONSULTA_CLAS,
  CONSULTA_DISCIPLINAS,
  CONSULTA_DOMINIO,
  CONSULTA_HABILIDADES,
  type TipoConsulta,
} from './regras-consulta'
import { CONSULTA_TERMOS } from './termos'
import type { Confianca, Fonte, ItemCatalogo, ItemConsultaRegra, TipoItem } from './tipos'

export type CategoriaRevisao = TipoItem | 'consulta'

export const ROTULO_CATEGORIA: Record<CategoriaRevisao, string> = {
  poder: 'Poder',
  ritual: 'Ritual',
  cerimonia: 'Cerimônia',
  formula: 'Fórmula',
  vantagem: 'Vantagem',
  defeito: 'Defeito',
  'tipo-coterie': 'Tipo de Coterie',
  consulta: 'Consulta rápida',
}

export type ItemRevisao = {
  /** O id gravado em `revisao_traducao.item_id`. */
  id: string
  categoria: CategoriaRevisao
  /** Ex.: "Poder · Dominação", "Vantagem · Coterie", "Consulta rápida · Atributo". */
  rotulo: string
  nivel: string | null
  fonte: Fonte | null
  nomeOriginal: string | null
  nome: string
  descricao: string
  confianca: Confianca
}

export type StatusRevisao = 'pendente' | 'sugerido' | 'aprovado'

export type Revisao = { itemId: string; status: 'aprovado' | 'sugerido'; criadoEm: Date }

const ROTULO_CONSULTA: Record<TipoConsulta, string> = {
  atributo: 'Atributo',
  habilidade: 'Habilidade',
  cla: 'Clã',
  disciplina: 'Disciplina',
  dominio: 'Domínio',
  termo: 'Termo',
}

const CONSULTAS: [TipoConsulta, Record<string, ItemConsultaRegra>][] = [
  ['atributo', CONSULTA_ATRIBUTOS],
  ['habilidade', CONSULTA_HABILIDADES],
  ['cla', CONSULTA_CLAS],
  ['disciplina', CONSULTA_DISCIPLINAS],
  ['dominio', CONSULTA_DOMINIO],
  ['termo', CONSULTA_TERMOS],
]

/** Id na revisão de um texto da consulta rápida; prefixado para não colidir com o Catálogo. */
export function idConsulta(tipo: TipoConsulta, id: string): string {
  return `consulta-${tipo}-${id}`
}

function nivelDe(item: ItemCatalogo): string | null {
  if ('nivel' in item) return String(item.nivel)
  if ('niveis' in item) return item.niveis.join(', ')
  return null
}

function rotuloDe(item: ItemCatalogo): string {
  const categoria = ROTULO_CATEGORIA[item.tipo]
  if (item.tipo === 'poder') {
    return `${categoria} · ${DISCIPLINAS.find((d) => d.id === item.disciplina)?.nome ?? item.disciplina}`
  }
  if (item.tipo === 'vantagem' || item.tipo === 'defeito') {
    return `${categoria} · ${item.escopo === 'coterie' ? 'Coterie' : item.grupo}`
  }
  return categoria
}

export function itensRevisao(
  catalogo: readonly ItemCatalogo[] = CATALOGO,
  consultas: [TipoConsulta, Record<string, ItemConsultaRegra>][] = CONSULTAS,
): ItemRevisao[] {
  const doCatalogo = catalogo.map(
    (item): ItemRevisao => ({
      id: item.id,
      categoria: item.tipo,
      rotulo: rotuloDe(item),
      nivel: nivelDe(item),
      fonte: item.fonte,
      nomeOriginal: item.nomeOriginal,
      nome: item.nome,
      descricao: item.descricao,
      confianca: item.confianca,
    }),
  )
  const daConsulta = consultas.flatMap(([tipo, mapa]) =>
    Object.values(mapa).map(
      (item): ItemRevisao => ({
        id: idConsulta(tipo, item.id),
        categoria: 'consulta',
        rotulo: `${ROTULO_CATEGORIA.consulta} · ${ROTULO_CONSULTA[tipo]}`,
        nivel: null,
        fonte: item.fonte ?? null,
        nomeOriginal: item.nomeOriginal ?? null,
        nome: item.titulo,
        descricao: item.descricao,
        confianca: item.confianca ?? 'certo',
      }),
    ),
  )
  return [...doCatalogo, ...daConsulta]
}

/** A revisão mais recente do item manda. */
export function statusDe(revisoes: readonly Revisao[], itemId: string): StatusRevisao {
  let ultima: Revisao | null = null
  for (const r of revisoes) {
    if (r.itemId === itemId && (!ultima || r.criadoEm >= ultima.criadoEm)) ultima = r
  }
  return ultima?.status ?? 'pendente'
}

export type FiltroRevisao = {
  confianca: Confianca
  categoria: CategoriaRevisao | null
  busca: string
}

/** A fila da página: sem os aprovados, filtrada por confiança, categoria e busca (nome, original ou id). */
export function filaRevisao(
  itens: readonly ItemRevisao[],
  revisoes: readonly Revisao[],
  filtro: FiltroRevisao,
): (ItemRevisao & { status: StatusRevisao })[] {
  return itens
    .map((item) => ({ ...item, status: statusDe(revisoes, item.id) }))
    .filter(
      (item) =>
        item.status !== 'aprovado' &&
        item.confianca === filtro.confianca &&
        (filtro.categoria === null || item.categoria === filtro.categoria) &&
        casaBusca(filtro.busca, [item.nome, item.nomeOriginal ?? undefined, item.id]),
    )
}

/** Itens que ainda não foram aprovados nem receberam sugestão; vai no link do menu do Narrador. */
export function contarPendentes(itens: readonly ItemRevisao[], revisoes: readonly Revisao[]): number {
  return itens.filter((item) => statusDe(revisoes, item.id) === 'pendente').length
}
