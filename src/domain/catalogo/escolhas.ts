/**
 * Regras de escolha do Catálogo na Ficha (fatia 4):
 * - poder: nível ≤ Disciplina, quantidade ≤ nível da Disciplina, amálgama exige a outra Disciplina;
 * - Ritual, Cerimônia e Fórmula: só a regra do nível, sem teto de quantidade;
 * - Vantagem e Defeito: só os níveis do item; não repetível sai do seletor depois de escolhido.
 * O Jogador fica preso às regras; o Narrador vê tudo, com aviso e sem bloqueio.
 */

import type { Papel } from '../acesso'
import { IDADES_CRIACAO, type IdadeCriacao } from '../cronica'
import type { Cla, Disciplina, EscolhaVantagem, Ficha } from '../ficha'
import { itemCatalogo, PODERES, RITUAIS_TODOS, VANTAGENS_PERSONAGEM } from './index'
import type { DisciplinaComPoderes, ItemCatalogo, Poder, Ritual, Vantagem } from './tipos'

export type Buscar = (id: string) => ItemCatalogo | null

export type TipoRitual = Ritual['tipo']

/** Cada tipo de Ritual sobe com uma Disciplina. */
export const DISCIPLINA_DO_RITUAL = {
  ritual: 'feiticaria-de-sangue',
  cerimonia: 'oblivio',
  formula: 'alquimia-de-sangue-ralo',
} as const satisfies Record<TipoRitual, Disciplina>

/** Onde cada tipo de Ritual fica na Ficha. */
export const CAMPO_DO_RITUAL = {
  ritual: 'rituais',
  cerimonia: 'cerimonias',
  formula: 'formulas',
} as const satisfies Record<TipoRitual, keyof Ficha>

const RITUAL_DA_DISCIPLINA: Partial<Record<Disciplina, TipoRitual>> = Object.fromEntries(
  Object.entries(DISCIPLINA_DO_RITUAL).map(([tipo, disciplina]) => [disciplina, tipo]),
)

export function tipoRitualDa(disciplina: Disciplina): TipoRitual | null {
  return RITUAL_DA_DISCIPLINA[disciplina] ?? null
}

export function temPoderes(disciplina: Disciplina): disciplina is DisciplinaComPoderes {
  return disciplina !== 'alquimia-de-sangue-ralo'
}

/** nivel: acima do nível da Disciplina; limite: a Disciplina já tem tantos poderes quanto o nível; amalgama: falta a outra Disciplina. */
export type Motivo = 'nivel' | 'limite' | 'amalgama'

export type Opcao<T> = {
  item: T
  /** Regras que a escolha quebra; para o Narrador, viram aviso. */
  motivos: Motivo[]
  /** Só o Jogador é bloqueado. */
  bloqueado: boolean
}

export const TEXTO_MOTIVO: Record<Motivo, string> = {
  nivel: 'Acima do nível da Disciplina',
  limite: 'A Disciplina já tem todos os poderes do nível',
  amalgama: 'Amálgama: falta a outra Disciplina no nível exigido',
}

export function nivelDisciplina(ficha: Pick<Ficha, 'disciplinas'>, disciplina: Disciplina): number {
  return ficha.disciplinas.find((d) => d.disciplina === disciplina)?.nivel ?? 0
}

/** Poderes da Ficha que contam para a Disciplina (os removidos do Catálogo não contam). */
export function poderesDaDisciplina(
  ficha: Pick<Ficha, 'poderes'>,
  disciplina: DisciplinaComPoderes,
  buscar: Buscar = itemCatalogo,
): string[] {
  return ficha.poderes.filter((id) => {
    const item = buscar(id)
    return item?.tipo === 'poder' && item.disciplina === disciplina
  })
}

/** O que impede escolher o poder agora, contando os poderes já escolhidos menos ele mesmo. */
export function motivosPoder(
  ficha: Pick<Ficha, 'disciplinas' | 'poderes'>,
  poder: Poder,
  buscar: Buscar = itemCatalogo,
): Motivo[] {
  const nivel = nivelDisciplina(ficha, poder.disciplina)
  const outros = poderesDaDisciplina(ficha, poder.disciplina, buscar).filter((id) => id !== poder.id)
  const motivos: Motivo[] = []
  if (poder.nivel > nivel) motivos.push('nivel')
  if (outros.length >= nivel) motivos.push('limite')
  if (poder.amalgama && nivelDisciplina(ficha, poder.amalgama.disciplina) < poder.amalgama.nivel) {
    motivos.push('amalgama')
  }
  return motivos
}

/** O seletor de poderes de uma Disciplina, sem os já escolhidos. O Jogador nem vê os de nível acima. */
export function opcoesPoderes(
  ficha: Pick<Ficha, 'disciplinas' | 'poderes'>,
  disciplina: DisciplinaComPoderes,
  papel: Papel,
  catalogo: readonly Poder[] = PODERES,
  buscar: Buscar = itemCatalogo,
): Opcao<Poder>[] {
  return catalogo
    .filter((p) => p.disciplina === disciplina && !ficha.poderes.includes(p.id))
    .map((item) => {
      const motivos = motivosPoder(ficha, item, buscar)
      return { item, motivos, bloqueado: papel === 'jogador' && motivos.length > 0 }
    })
    .filter((o) => papel === 'narrador' || !o.motivos.includes('nivel'))
}

/** O Jogador só adiciona poder enquanto a Disciplina tem vaga. */
export function temVagaDePoder(
  ficha: Pick<Ficha, 'disciplinas' | 'poderes'>,
  disciplina: DisciplinaComPoderes,
  buscar: Buscar = itemCatalogo,
): boolean {
  return poderesDaDisciplina(ficha, disciplina, buscar).length < nivelDisciplina(ficha, disciplina)
}

export function motivosRitual(ficha: Pick<Ficha, 'disciplinas'>, ritual: Ritual): Motivo[] {
  return ritual.nivel > nivelDisciplina(ficha, DISCIPLINA_DO_RITUAL[ritual.tipo]) ? ['nivel'] : []
}

/** O seletor de Rituais, Cerimônias ou Fórmulas, sem os já escolhidos. O Jogador só vê os do seu nível. */
export function opcoesRituais(
  ficha: Ficha,
  tipo: TipoRitual,
  papel: Papel,
  catalogo: readonly Ritual[] = RITUAIS_TODOS,
): Opcao<Ritual>[] {
  const escolhidos = ficha[CAMPO_DO_RITUAL[tipo]]
  return catalogo
    .filter((r) => r.tipo === tipo && !escolhidos.includes(r.id))
    .map((item) => ({ item, motivos: motivosRitual(ficha, item), bloqueado: false }))
    .filter((o) => papel === 'narrador' || o.motivos.length === 0)
}

/** Como a Ficha mostra um poder ou Ritual escolhido: removido e acima do nível ficam em vermelho. */
export type Situacao = 'ok' | 'acima-do-nivel' | 'removido'

export function situacaoItem(
  ficha: Pick<Ficha, 'disciplinas'>,
  id: string,
  buscar: Buscar = itemCatalogo,
): Situacao {
  const item = buscar(id)
  if (!item) return 'removido'
  if (item.tipo === 'poder') return item.nivel > nivelDisciplina(ficha, item.disciplina) ? 'acima-do-nivel' : 'ok'
  if (item.tipo === 'ritual' || item.tipo === 'cerimonia' || item.tipo === 'formula') {
    return motivosRitual(ficha, item).length > 0 ? 'acima-do-nivel' : 'ok'
  }
  return 'ok'
}

/**
 * Poderes, Rituais, Cerimônias e Fórmulas que não cabem embaixo de nenhuma Disciplina da Ficha:
 * saíram do Catálogo ou a Disciplina foi tirada. A Ficha mostra à parte, em vermelho, sem apagar.
 */
export function itensSoltos(ficha: Ficha, buscar: Buscar = itemCatalogo): string[] {
  const tem = (d: Disciplina) => ficha.disciplinas.some((x) => x.disciplina === d)
  const poderes = ficha.poderes.filter((id) => {
    const item = buscar(id)
    return item?.tipo !== 'poder' || !tem(item.disciplina)
  })
  const rituais = (Object.keys(CAMPO_DO_RITUAL) as TipoRitual[]).flatMap((tipo) =>
    tem(DISCIPLINA_DO_RITUAL[tipo]) ? [] : ficha[CAMPO_DO_RITUAL[tipo]],
  )
  return [...poderes, ...rituais]
}

/** Tira o id de qualquer lista de poderes ou Rituais da Ficha. */
export function semItem(ficha: Ficha, id: string): Partial<Ficha> {
  return {
    poderes: ficha.poderes.filter((x) => x !== id),
    rituais: ficha.rituais.filter((x) => x !== id),
    cerimonias: ficha.cerimonias.filter((x) => x !== id),
    formulas: ficha.formulas.filter((x) => x !== id),
  }
}

/** Grupos de Vantagens e Defeitos que só existem para um Clã. */
const GRUPO_DO_CLA: Record<string, Cla> = {
  'Sangue-Ralo': 'sangue-ralo',
  Caitiff: 'caitiff',
}

/** Só para carniçais, que a v1 não cria. */
const GRUPOS_SEM_PERSONAGEM = new Set(['Carniçal'])

/** O que se sabe do Personagem para filtrar Vantagens e Defeitos. */
export type ContextoVantagens = {
  cla?: Cla | null
  potenciaSangue?: number
  /** Idade da criação, da Crônica; sem ela (fora do wizard do Jogador), a idade não filtra. */
  idade?: IdadeCriacao
  /** Wizard do Jogador: o Sangue-Ralo vê só os de Sangue-Ralo. */
  regrasCriacao?: boolean
}

/**
 * Regras do livro, valem sempre que o dado existe: grupo de outro Clã some, `clas` restringe,
 * Potência do Sangue limita, Carniçal não aparece. Idade só limita na criação do Jogador.
 * Regra da criação (só com `regrasCriacao`): o Sangue-Ralo vê só os de Sangue-Ralo; depois, com XP
 * (fora da v1), compra as demais.
 */
function motivoIndisponibilidade(v: Vantagem, contexto: ContextoVantagens): string | undefined {
  const { cla = null, potenciaSangue, idade, regrasCriacao = false } = contexto
  if (GRUPOS_SEM_PERSONAGEM.has(v.grupo)) return 'Só Carniçal, fora da v1'
  const { so, exceto } = v.clas ?? {}
  if (so && (!cla || !so.includes(cla))) return v.preRequisito ?? 'Exige outro Clã'
  if (cla && exceto?.includes(cla)) return v.preRequisito ?? 'Não permitido para este Clã'
  if (regrasCriacao && idade && v.idadeMinima && IDADES_CRIACAO.indexOf(idade) < IDADES_CRIACAO.indexOf(v.idadeMinima)) {
    return v.preRequisito ?? 'Idade inferior à exigida na criação'
  }
  if (potenciaSangue !== undefined && v.potenciaSangueMaxima !== undefined && potenciaSangue > v.potenciaSangueMaxima) {
    return `Potência do Sangue ${v.potenciaSangueMaxima} ou menos`
  }
  if (regrasCriacao && cla === 'sangue-ralo' && !ehDeSangueRalo(v)) {
    return 'Na criação, Sangue-Ralo só escolhe Méritos e Defeitos de Sangue-Ralo'
  }
  if (v.grupo in GRUPO_DO_CLA && GRUPO_DO_CLA[v.grupo] !== cla) return `Só ${v.grupo}`
  return undefined
}

export function ehDeSangueRalo(item: ItemCatalogo | null): boolean {
  return (item?.tipo === 'vantagem' || item?.tipo === 'defeito') && item.grupo === 'Sangue-Ralo'
}

/** Seletor de Vantagens ou Defeitos: tira os não repetíveis já escolhidos e os que o Personagem não pode ter. */
export function opcoesVantagens(
  escolhidas: readonly EscolhaVantagem[],
  tipo: Vantagem['tipo'],
  catalogo: readonly Vantagem[] = VANTAGENS_PERSONAGEM,
  contexto: ContextoVantagens = {},
): Vantagem[] {
  const ids = new Set(escolhidas.map((e) => e.id))
  return catalogo.filter((v) => v.tipo === tipo && (v.repetivel || !ids.has(v.id)) && !motivoIndisponibilidade(v, contexto))
}

/**
 * Aviso no seletor, sem o que o filtro de `opcoesVantagens` já garantiu: "Só <Clã>", e a idade
 * ou a Potência do Sangue quando o contexto as conhece. Nesses itens, o pré-requisito é só a restrição.
 */
export function avisoVantagem(v: Vantagem, contexto: ContextoVantagens = {}): string | undefined {
  if (v.clas && contexto.cla) return undefined
  if (v.idadeMinima && contexto.regrasCriacao && contexto.idade) return undefined
  if (v.potenciaSangueMaxima !== undefined && contexto.potenciaSangue !== undefined) return undefined
  if (!v.preRequisito || !(v.grupo in GRUPO_DO_CLA)) return v.preRequisito
  const resto = v.preRequisito.replace(new RegExp(`^Só ${v.grupo}(; )?`), '')
  return resto ? resto[0].toUpperCase() + resto.slice(1) : undefined
}

export type PerdaVantagem = { id: string; nome: string; motivo: string }

/** Retira escolhas que perderam os requisitos conhecidos; itens fora do Catálogo são preservados. */
export function removerVantagensIndisponiveis(
  ficha: Ficha,
  contexto: ContextoVantagens,
  buscar: Buscar = itemCatalogo,
): { ficha: Ficha; perdas: PerdaVantagem[] } {
  const perdas: PerdaVantagem[] = []
  const manter = (escolha: EscolhaVantagem) => {
    const item = buscar(escolha.id)
    if (item?.tipo !== 'vantagem' && item?.tipo !== 'defeito') return true
    const motivo = motivoIndisponibilidade(item, contexto)
    if (!motivo) return true
    perdas.push({ id: item.id, nome: item.nome, motivo })
    return false
  }
  return {
    ficha: { ...ficha, vantagens: ficha.vantagens.filter(manter), defeitos: ficha.defeitos.filter(manter) },
    perdas,
  }
}

/** Soma dos níveis, para os contadores "x / 7" e "x / 2" (só informativos até a fatia 5). */
export function pontos(escolhidas: readonly EscolhaVantagem[]): number {
  return escolhidas.reduce((soma, e) => soma + e.nivel, 0)
}

export const PONTOS_CRIACAO = { vantagens: 7, defeitos: 2 } as const

/** Sangue-Ralo: até 3 Méritos de Sangue-Ralo e a mesma quantidade de Defeitos de Sangue-Ralo. */
export const MAXIMO_MERITOS_SANGUE_RALO = 3

export type Contador = { atual: number; total: number }

/**
 * Contadores da criação. Padrão: pontos, "x / 7" e "x / 2". Sangue-Ralo: quantidade de itens
 * de Sangue-Ralo, "x / 3" Méritos e Defeitos espelhando os Méritos, como `validarVantagensDefeitosCriacao`.
 */
export function contadoresVantagens(
  ficha: Pick<Ficha, 'cla' | 'vantagens' | 'defeitos'>,
  buscar: Buscar = itemCatalogo,
): { vantagens: Contador; defeitos: Contador } {
  if (ficha.cla !== 'sangue-ralo') {
    return {
      vantagens: { atual: pontos(ficha.vantagens), total: PONTOS_CRIACAO.vantagens },
      defeitos: { atual: pontos(ficha.defeitos), total: PONTOS_CRIACAO.defeitos },
    }
  }
  const deSangueRalo = (escolhidas: readonly EscolhaVantagem[]) =>
    escolhidas.filter((e) => {
      const item = buscar(e.id)
      return (item?.tipo === 'vantagem' || item?.tipo === 'defeito') && ehDeSangueRalo(item)
    }).length
  const meritos = deSangueRalo(ficha.vantagens)
  return {
    vantagens: { atual: meritos, total: MAXIMO_MERITOS_SANGUE_RALO },
    defeitos: { atual: deSangueRalo(ficha.defeitos), total: meritos },
  }
}

/**
 * Para o Jogador, o servidor confere só o que entrou agora: poderes e Rituais que já estavam
 * na Ficha continuam lá mesmo acima do nível (ficam em vermelho). Devolve os ids que quebram regra.
 */
export function escolhasInvalidas(
  antes: Ficha,
  depois: Ficha,
  buscar: Buscar = itemCatalogo,
  contexto: ContextoVantagens = { cla: depois.cla, potenciaSangue: depois.potenciaSangue },
): string[] {
  const novos = (campo: 'poderes' | 'rituais' | 'cerimonias' | 'formulas') =>
    depois[campo].filter((id) => !antes[campo].includes(id))

  const invalidos: string[] = []
  for (const id of novos('poderes')) {
    const item = buscar(id)
    if (item?.tipo !== 'poder' || motivosPoder(depois, item, buscar).length > 0) invalidos.push(id)
  }
  for (const campo of ['rituais', 'cerimonias', 'formulas'] as const) {
    for (const id of novos(campo)) {
      const item = buscar(id)
      const tipoCerto = item && CAMPO_DO_RITUAL[item.tipo as TipoRitual] === campo
      if (!tipoCerto || motivosRitual(depois, item as Ritual).length > 0) invalidos.push(id)
    }
  }
  for (const campo of ['vantagens', 'defeitos'] as const) {
    const tipo = campo === 'vantagens' ? 'vantagem' : 'defeito'
    for (const escolha of depois[campo]) {
      const item = buscar(escolha.id)
      const repetida = depois[campo].filter((e) => e.id === escolha.id).length > 1
      const repetivel = (item?.tipo === 'vantagem' || item?.tipo === 'defeito') && item.repetivel
      const repeticaoNova =
        repetida &&
        !repetivel &&
        depois[campo].filter((e) => e.id === escolha.id).length >
          antes[campo].filter((e) => e.id === escolha.id).length
      if (antes[campo].some((e) => e.id === escolha.id && e.nivel === escolha.nivel) && !repeticaoNova) continue
      const valida =
        item?.tipo === tipo &&
        item.escopo === 'personagem' &&
        !motivoIndisponibilidade(item, contexto) &&
        (item.niveis as number[]).includes(escolha.nivel) &&
        (item.repetivel || !repetida)
      if (!valida) invalidos.push(escolha.id)
    }
  }
  return invalidos
}
