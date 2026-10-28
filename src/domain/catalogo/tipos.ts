/**
 * Formato dos itens do Catálogo (fatia 4, `docs/fatia-4-catalogo.md`).
 *
 * Ids em kebab-case, estáveis: nunca mudam depois de publicados, mesmo que o nome
 * traduzido mude. Prefixo pelo tipo, para serem únicos no Catálogo inteiro:
 * - poder: `<disciplina>-<nivel>-<nome>` (ex.: `dominacao-1-compelir`);
 * - Ritual, Cerimônia e Fórmula: `ritual-<nivel>-<nome>`, `cerimonia-<nivel>-<nome>`, `formula-<nivel>-<nome>`;
 * - Vantagem e Defeito do Personagem: `vantagem-<nome>`, `defeito-<nome>`;
 * - da Coterie: `coterie-vantagem-<nome>`, `coterie-defeito-<nome>`, `tipo-coterie-<nome>`.
 */

import type { IdadeCriacao } from '../cronica'
import type { Cla, Disciplina, Habilidade } from '../ficha'
import type { Livro } from './livros'

/** certo: nome da edição brasileira ou tradução óbvia; duvida: tradução livre a revisar; ingles: mantido em inglês. */
export type Confianca = 'certo' | 'duvida' | 'ingles'

export type Nivel = 1 | 2 | 3 | 4 | 5

/** Livro e página da edição em inglês; página null quando a wiki não informa. */
export type Fonte = { livro: Livro; pagina: number | null }

type ItemBase = {
  id: string
  /** Nome da edição brasileira; se só existe em inglês, tradução livre. */
  nome: string
  /** Nome na edição em inglês. */
  nomeOriginal: string
  /** Uma ou duas frases escritas pelo projeto. Nunca tradução do texto do livro ou da wiki. */
  descricao: string
  fonte: Fonte
  /** Os dados seguem a errata oficial. */
  errata?: boolean
  confianca: Confianca
  /** Texto livre em PT-BR, ex.: "Só Sangue-Ralo" ou "Exige Auspícios 1: Sentidos Aguçados". */
  preRequisito?: string
}

/** Custo, parada, resistência e duração, como a wiki mostra; texto em PT-BR. */
type Ativavel = {
  /** Ex.: "Um Teste de Despertar", "Grátis". */
  custo: string
  /** Ex.: "Carisma + Dominação". */
  parada?: string
  /** Ex.: "Autocontrole + Determinação". */
  resistencia?: string
  /** Ex.: "Uma cena". */
  duracao?: string
}

/** Disciplinas com poderes. A Alquimia de Sangue-Ralo não tem poderes, só Fórmulas. */
export type DisciplinaComPoderes = Exclude<Disciplina, 'alquimia-de-sangue-ralo'>

export type Poder = ItemBase &
  Ativavel & {
    tipo: 'poder'
    disciplina: DisciplinaComPoderes
    nivel: Nivel
    /** Amálgama: a outra Disciplina e o nível exigido. */
    amalgama?: { disciplina: Disciplina; nivel: Nivel }
  }

/** Ritual (Feitiçaria de Sangue), Cerimônia (Oblívio) e Fórmula (Alquimia de Sangue-Ralo). */
export type Ritual = ItemBase &
  Ativavel & {
    tipo: 'ritual' | 'cerimonia' | 'formula'
    nivel: Nivel
  }

/** Vantagem ou Defeito, do Personagem ou da Coterie. */
export type Vantagem = ItemBase & {
  tipo: 'vantagem' | 'defeito'
  escopo: 'personagem' | 'coterie'
  /** Agrupamento como no livro, em PT-BR (ex.: "Aparência", "Aliados", "Alimentação"). */
  grupo: string
  /** Níveis que o livro permite, em ordem (ex.: [1, 2, 3, 4, 5] ou só [2]). */
  niveis: Nivel[]
  /** Pode aparecer mais de uma vez na mesma Ficha (ex.: dois Contatos). */
  repetivel: boolean
  /** Restrição de Clã fora dos grupos Caitiff e Sangue-Ralo (ex.: Fazendeiro, exceto Ventrue). */
  clas?: { so?: Cla[]; exceto?: Cla[] }
  /** Idade mínima do Personagem (ex.: "Só Ancillae ou mais velhos"). */
  idadeMinima?: IdadeCriacao
  /** Potência do Sangue máxima (ex.: Modo Nuit, 1 ou menos). */
  potenciaSangueMaxima?: number
}

/** Tipo de Coterie: descritivo, não aplica nada. */
export type TipoCoterie = ItemBase & {
  tipo: 'tipo-coterie'
  /** Domínio sugerido, em texto (ex.: "Caça 2, Abrigo 1"). */
  dominio: string
  /** Vantagens sugeridas, em texto. */
  vantagensSugeridas: string
  /** Defeitos sugeridos, em texto. */
  defeitosSugeridos?: string
}

export type EscolhaEspecializacaoPredador = {
  habilidade: Habilidade
  sugestoes: string[]
}

/** Tipo de Predador: caça habitual, aplica bônus e opções na criação (Corebook e Players Guide). */
export type TipoPredador = ItemBase & {
  tipo: 'tipo-predador'
  /** Especializações oferecidas: jogador escolhe uma das habilidades e uma especialização sugerida ou livre */
  opcoesEspecializacao: EscolhaEspecializacaoPredador[]
  /** Disciplinas onde ganha 1 ponto. Se tiver 1, é automática; se 2+, escolhe 1. */
  opcoesDisciplina: Disciplina[]
  /** Modificador de Humanidade (+1, -1 ou indefinido). */
  modificadorHumanidade?: number
  /** Modificador de Potência do Sangue (ex.: +1 Sanguessuga). */
  modificadorPotenciaSangue?: number
  /** Vantagens concedidas automaticamente */
  vantagens: { id: string; nome: string; nivel: Nivel; nota?: string }[]
  /** Defeitos concedidos automaticamente */
  defeitos: { id: string; nome: string; nivel: Nivel; nota?: string }[]
  /** Escolhas adicionais quando o livro dá alternativa de vantagens ou defeitos */
  escolhasTracos?: {
    rotulo: string
    opcoes: { tipo: 'vantagem' | 'defeito'; id: string; nome: string; nivel: Nivel; nota?: string }[]
  }[]
}

export type ItemCatalogo = Poder | Ritual | Vantagem | TipoCoterie | TipoPredador
export type TipoItem = ItemCatalogo['tipo']

/** Termo da consulta rápida de regras (Atributos, Clãs, Domínio, Fome...). */
export type ItemConsultaRegra = {
  id: string
  titulo: string
  subtitulo?: string
  descricao: string
  exemplosEspecializacoes?: string[]
  disciplinas?: string[]
  perdicao?: string
  compulsao?: string
  niveis?: { nivel: number | string; rotulo: string; descricao: string }[]
  /** Linhas de rótulo e valor (ex.: Custo, Parada, Duração de um poder). */
  campos?: { rotulo: string; valor: string }[]
  /** Tabela de referência (ex.: efeitos da Potência do Sangue de 0 a 10). */
  tabela?: { colunas: string[]; linhas: string[][] }
  /** Nome na edição em inglês, para a página de revisão. */
  nomeOriginal?: string
  fonte?: Fonte
  /** Sem valor, a página de revisão trata como 'certo' (texto escrito pelo projeto). */
  confianca?: Confianca
}
