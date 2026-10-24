/**
 * O Catálogo inteiro, montado a partir dos arquivos de cada lote.
 * Nada aqui vem do banco: o Catálogo vive no código (`docs/fatia-4-catalogo.md`).
 */

import { CERIMONIAS } from './cerimonias'
import { TIPOS_COTERIE, VANTAGENS_COTERIE } from './coterie'
import { FORMULAS } from './formulas'
import { PODERES_ANIMALISMO } from './poderes/animalismo'
import { PODERES_AUSPICIOS } from './poderes/auspicios'
import { PODERES_CELERIDADE } from './poderes/celeridade'
import { PODERES_DOMINACAO } from './poderes/dominacao'
import { PODERES_FEITICARIA_DE_SANGUE } from './poderes/feiticaria-de-sangue'
import { PODERES_FORTITUDE } from './poderes/fortitude'
import { PODERES_OBLIVIO } from './poderes/oblivio'
import { PODERES_OFUSCACAO } from './poderes/ofuscacao'
import { PODERES_POTENCIA } from './poderes/potencia'
import { PODERES_PRESENCA } from './poderes/presenca'
import { PODERES_PROTEANISMO } from './poderes/proteanismo'
import { RITUAIS } from './rituais'
import type { ItemCatalogo, Poder, Ritual, TipoCoterie, Vantagem } from './tipos'
import { VANTAGENS } from './vantagens'

export const PODERES: readonly Poder[] = [
  ...PODERES_ANIMALISMO,
  ...PODERES_AUSPICIOS,
  ...PODERES_CELERIDADE,
  ...PODERES_DOMINACAO,
  ...PODERES_FEITICARIA_DE_SANGUE,
  ...PODERES_FORTITUDE,
  ...PODERES_OBLIVIO,
  ...PODERES_OFUSCACAO,
  ...PODERES_POTENCIA,
  ...PODERES_PRESENCA,
  ...PODERES_PROTEANISMO,
]

/** Rituais, Cerimônias e Fórmulas. */
export const RITUAIS_TODOS: readonly Ritual[] = [...RITUAIS, ...CERIMONIAS, ...FORMULAS]

export const VANTAGENS_PERSONAGEM: readonly Vantagem[] = VANTAGENS
export { TIPOS_COTERIE, VANTAGENS_COTERIE }

/** Grupos de Antecedentes que uma Coterie pode comprar com o fundo comum (Corebook p. 196). */
export const GRUPOS_ANTECEDENTES_COTERIE = new Set([
  'Aliados',
  'Contatos',
  'Fama',
  'Influência',
  'Refúgio',
  'Rebanho',
  'Máscara',
  'Mawla',
  'Recursos',
  'Lacaios',
  'Status',
])

/** Vantagens disponíveis para seleção na Coterie: Antecedentes compartilhados + exclusivas da Coterie. */
export const VANTAGENS_COTERIE_DISPONIVEIS: readonly Vantagem[] = [
  ...VANTAGENS_PERSONAGEM.filter((v) => GRUPOS_ANTECEDENTES_COTERIE.has(v.grupo)),
  ...VANTAGENS_COTERIE,
]

export const CATALOGO: readonly ItemCatalogo[] = [
  ...PODERES,
  ...RITUAIS_TODOS,
  ...VANTAGENS_PERSONAGEM,
  ...VANTAGENS_COTERIE,
  ...TIPOS_COTERIE,
]

const PORID = new Map<string, ItemCatalogo>(CATALOGO.map((item) => [item.id, item]))

/** null quando o id saiu do Catálogo: a Ficha mostra "Item removido do Catálogo". */
export function itemCatalogo(id: string): ItemCatalogo | null {
  return PORID.get(id) ?? null
}

export function poder(id: string): Poder | null {
  const item = itemCatalogo(id)
  return item?.tipo === 'poder' ? item : null
}

export function ritual(id: string): Ritual | null {
  const item = itemCatalogo(id)
  return item?.tipo === 'ritual' || item?.tipo === 'cerimonia' || item?.tipo === 'formula' ? item : null
}

export function vantagem(id: string): Vantagem | null {
  const item = itemCatalogo(id)
  return item?.tipo === 'vantagem' || item?.tipo === 'defeito' ? item : null
}

export function tipoCoterie(id: string): TipoCoterie | null {
  const item = itemCatalogo(id)
  return item?.tipo === 'tipo-coterie' ? item : null
}

/** "Compelir (Compel)" quando o nome difere do original. */
export function nomeComOriginal(item: { nome: string; nomeOriginal?: string }): string {
  return item.nomeOriginal && item.nomeOriginal !== item.nome ? `${item.nome} (${item.nomeOriginal})` : item.nome
}

export type * from './tipos'
