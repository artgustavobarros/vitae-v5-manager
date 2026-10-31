import { z } from 'zod'
import type { ModeloAntagonista } from './bestiario'
import { DISCIPLINAS, type Disciplina } from './ficha'
import { PODERES, RITUAIS_TODOS, itemCatalogo } from './catalogo'
import { requisitosItem } from './catalogo/requisitos'
import type { Poder, Ritual } from './catalogo/tipos'

export const TIPOS_RITUAIS = ['ritual', 'cerimonia', 'formula'] as const
export type TipoRitualAntagonista = typeof TIPOS_RITUAIS[number]
export const CAMPO_SOBRENATURAL = { poder: 'poderes', ritual: 'rituais', cerimonia: 'cerimonias', formula: 'formulas' } as const
export const DISCIPLINA_RITUAL = { ritual: 'feiticaria-de-sangue', cerimonia: 'oblivio', formula: 'alquimia-de-sangue-ralo' } as const
export const ROTULO_RITUAL = { ritual: 'Rituais', cerimonia: 'Cerimônias', formula: 'Fórmulas' } as const
const idsDisciplinas = DISCIPLINAS.map(d => d.id)
const baseRecursos = z.object({
  disciplinas: z.partialRecord(z.enum(idsDisciplinas), z.int().min(1).max(5)),
  livres: z.int().min(0).max(1).default(0),
  poderes: z.array(z.string()).default([]),
  rituais: z.array(z.string()).default([]),
  cerimonias: z.array(z.string()).default([]),
  formulas: z.array(z.string()).default([]),
  confirmacoes: z.array(z.string()).default([]),
})
export type RecursosSobrenaturais = z.infer<typeof baseRecursos>
export type QuantidadesRituais = Partial<Record<TipoRitualAntagonista, number>>
const normalizar = (nome: string) => nome.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim()
const disciplinaPorNome = new Map(DISCIPLINAS.flatMap(d => [[normalizar(d.nome), d.id], [d.id, d.id]] as const))

export function obterPerfilSobrenatural(modelo: Pick<ModeloAntagonista, 'fichaCompleta' | 'especiais'>) {
  const disciplinas: RecursosSobrenaturais['disciplinas'] = {}
  for (const [nome, nivel] of Object.entries(modelo.fichaCompleta?.disciplinas ?? {})) {
    const id = disciplinaPorNome.get(normalizar(nome))
    if (id) disciplinas[id] = nivel
  }
  for (const especial of modelo.especiais) {
    const partes = /^(.*?)\s+([1-5])$/.exec(especial.nome.trim())
    const id = partes && disciplinaPorNome.get(normalizar(partes[1]))
    if (id) disciplinas[id] = Math.max(disciplinas[id] ?? 0, Number(partes![2]))
  }
  const livres = modelo.especiais.some(e => e.nome === 'Poder de Disciplina à escolha') ? 1 : 0
  const fixos = PODERES.filter(p => p.nivel <= (disciplinas[p.disciplina] ?? 0)
    && modelo.especiais.some(e => normalizar(e.nome) === normalizar(p.nome))).map(p => p.id)
  const quantidades: QuantidadesRituais = {}
  const cerimonias = modelo.especiais.find(e => e.nome === 'Cerimônias de Oblívio')
  if (cerimonias && /(?:quatro|4) cerim[oô]nias/i.test(cerimonias.descricao)) quantidades.cerimonia = 4
  return { disciplinas, livres, fixos, quantidades }
}

function motivosItem(selecao: RecursosSobrenaturais, item: Poder | Ritual): string[] {
  const motivos: string[] = []
  const disciplina = item.tipo === 'poder' ? item.disciplina : DISCIPLINA_RITUAL[item.tipo]
  const nivel = selecao.disciplinas[disciplina] ?? (item.tipo === 'poder' && selecao.livres ? 1 : 0)
  if (item.nivel > nivel) motivos.push('Acima do nível da Disciplina')
  if (item.tipo === 'poder' && item.amalgama && (selecao.disciplinas[item.amalgama.disciplina] ?? 0) < item.amalgama.nivel) {
    motivos.push('Amálgama: falta a outra Disciplina no nível exigido')
  }
  const requisitos = requisitosItem(item.id)
  const escolhidos = new Set([...selecao.poderes, ...selecao.rituais, ...selecao.cerimonias, ...selecao.formulas].filter(id => id !== item.id))
  for (const grupo of requisitos.itens ?? []) {
    if (!grupo.some(id => escolhidos.has(id))) motivos.push(`Exige ${grupo.map(id => itemCatalogo(id)?.nome ?? id).join(' ou ')}`)
  }
  if (requisitos.condicao && !selecao.confirmacoes.includes(item.id)) motivos.push(`Condição adicional não confirmada: ${requisitos.condicao}`)
  if (item.preRequisito && !requisitos.itens && !requisitos.condicao) motivos.push('Requisitos ainda não estruturados no Catálogo')
  return motivos
}

export function opcoesSobrenaturais(selecao: RecursosSobrenaturais, tipo: Poder['tipo'] | Ritual['tipo'], disciplina?: Disciplina) {
  const catalogo = tipo === 'poder' ? PODERES : RITUAIS_TODOS
  const escolhidos = new Set(selecao[CAMPO_SOBRENATURAL[tipo]])
  return catalogo.filter(item => item.tipo === tipo && (item.tipo !== 'poder' || !disciplina || item.disciplina === disciplina))
    .filter(item => !escolhidos.has(item.id))
    .map(item => ({ item, motivos: motivosItem(selecao, item) }))
}

export function validarRecursosSobrenaturais(entrada: RecursosSobrenaturais): RecursosSobrenaturais {
  const selecao = baseRecursos.parse(entrada)
  for (const tipo of ['poder', ...TIPOS_RITUAIS] as const) {
    const ids = selecao[CAMPO_SOBRENATURAL[tipo]]
    if (new Set(ids).size !== ids.length) throw new Error('Um mesmo poder ou Ritual não pode aparecer duas vezes.')
    for (const id of ids) {
      const item = itemCatalogo(id)
      if (!item || item.tipo !== tipo) throw new Error(`Item inválido: ${id}`)
      const motivos = motivosItem(selecao, item)
      if (motivos.length) throw new Error(`${item.nome}: ${motivos.join('; ')}`)
    }
  }
  let livresUsados = 0
  for (const disciplina of DISCIPLINAS) {
    const poderes = selecao.poderes.map(id => itemCatalogo(id) as Poder).filter(p => p.disciplina === disciplina.id).sort((a,b) => a.nivel-b.nivel)
    const nivel = selecao.disciplinas[disciplina.id] ?? 0
    if (poderes.length > nivel) {
      const extras = poderes.slice(nivel)
      if (extras.some(p => p.nivel !== 1)) throw new Error('O poder livre deve ser de nível 1.')
      livresUsados += extras.length
    }
    for (let i = 0; i < Math.min(nivel, poderes.length); i++) {
      if (poderes[i].nivel > i + 1) throw new Error(`${disciplina.nome}: cada ponto permite um poder de seu nível ou inferior.`)
    }
  }
  if (livresUsados > selecao.livres) throw new Error('Quantidade de poderes acima do permitido pelas Disciplinas.')
  return selecao
}

export const recursosSobrenaturaisSchema = baseRecursos.superRefine((selecao, ctx) => {
  try { validarRecursosSobrenaturais(selecao) } catch (erro) {
    ctx.addIssue({ code: 'custom', message: erro instanceof Error ? erro.message : 'Seleção sobrenatural inválida.' })
  }
})

export function validarSelecaoParaModelo(modelo: ModeloAntagonista, recursos: RecursosSobrenaturais) {
  const perfil = obterPerfilSobrenatural(modelo)
  const validos = validarRecursosSobrenaturais(recursos)
  for (const d of DISCIPLINAS) if ((perfil.disciplinas[d.id] ?? 0) !== (validos.disciplinas[d.id] ?? 0)) throw new Error('Os níveis de Disciplina devem acompanhar o Modelo.')
  if (perfil.livres !== validos.livres) throw new Error('A quantidade de poderes livres deve acompanhar o Modelo.')
  const total = Object.entries(perfil.disciplinas).reduce((s, [id, n]) => s + (id === 'alquimia-de-sangue-ralo' ? 0 : n), perfil.livres)
  if (validos.poderes.length !== total) throw new Error(`Escolha ${total} poderes para este Inimigo.`)
  const escolhidos = new Set(validos.poderes)
  if (perfil.fixos.some(id => !escolhidos.has(id))) throw new Error('Mantenha os poderes já indicados no Modelo.')
  return validos
}

export function trocarPoder(selecao: RecursosSobrenaturais, anterior: string, novo: string) {
  const copia = structuredClone(selecao)
  const index = copia.poderes.indexOf(anterior)
  if (index >= 0) copia.poderes.splice(index, 1, ...(novo ? [novo] : []))
  else if (novo) copia.poderes.push(novo)
  let mudou = true
  while (mudou) {
    mudou = false
    for (const campo of Object.values(CAMPO_SOBRENATURAL)) {
      const validos = copia[campo].filter(id => {
        const item = itemCatalogo(id)
        return item && ['poder','ritual','cerimonia','formula'].includes(item.tipo) && motivosItem(copia, item as Poder | Ritual).length === 0
      })
      if (validos.length !== copia[campo].length) { copia[campo] = validos; mudou = true }
    }
  }
  return copia
}

export function sortearRecursosSobrenaturais(
  modelo: ModeloAntagonista,
  opcoes: { quantidades?: QuantidadesRituais; confirmacoes?: string[] } = {},
  aleatorio: () => number = Math.random,
): RecursosSobrenaturais {
  const perfil = obterPerfilSobrenatural(modelo)
  const quantidades = { ...perfil.quantidades, ...opcoes.quantidades }
  const fixos = new Set(perfil.fixos)
  for (const quantidade of Object.values(quantidades)) if (!Number.isInteger(quantidade) || quantidade < 0 || quantidade > 100) throw new Error('Quantidade de Rituais inválida.')
  const escolher = <T,>(lista: T[]) => lista[Math.min(lista.length - 1, Math.floor(aleatorio() * lista.length))]
  for (let tentativa = 0; tentativa < 100; tentativa++) {
    const selecao: RecursosSobrenaturais = { disciplinas: { ...perfil.disciplinas }, livres: perfil.livres, poderes: [], rituais: [], cerimonias: [], formulas: [], confirmacoes: [...(opcoes.confirmacoes ?? [])] }
    let falhou = false
    for (let nivel = 1; nivel <= 5 && !falhou; nivel++) {
      for (const disciplina of DISCIPLINAS) {
        if (disciplina.id === 'alquimia-de-sangue-ralo' || (perfil.disciplinas[disciplina.id] ?? 0) < nivel) continue
        const disponiveis = opcoesSobrenaturais(selecao, 'poder', disciplina.id).filter(o => o.item.nivel <= nivel && !o.motivos.length)
        const escolhidos = new Set(selecao.poderes)
        const fixo = perfil.fixos.find(id => !escolhidos.has(id) && (itemCatalogo(id) as Poder).disciplina === disciplina.id && (itemCatalogo(id) as Poder).nivel <= nivel)
        const candidato = fixo ? disponiveis.find(o => o.item.id === fixo) : escolher(disponiveis.filter(o => !fixos.has(o.item.id)))
        if (!candidato) { falhou = true; break }
        selecao.poderes.push(candidato.item.id)
      }
    }
    for (let n = 0; n < perfil.livres && !falhou; n++) {
      const candidato = escolher(opcoesSobrenaturais(selecao, 'poder').filter(o => o.item.nivel === 1 && !o.motivos.length))
      if (!candidato) { falhou = true; break }
      selecao.poderes.push(candidato.item.id)
    }
    for (const tipo of TIPOS_RITUAIS) {
      for (let n = 0; n < (quantidades[tipo] ?? 0) && !falhou; n++) {
        const candidato = escolher(opcoesSobrenaturais(selecao, tipo).filter(o => !o.motivos.length))
        if (!candidato) { falhou = true; break }
        selecao[CAMPO_SOBRENATURAL[tipo]].push(candidato.item.id)
      }
    }
    if (!falhou) {
      validarSelecaoParaModelo(modelo, selecao)
      return selecao
    }
  }
  throw new Error('Não foi possível preencher a seleção com estes requisitos. Reduza a quantidade de Rituais ou escolha os poderes e confirme as condições adicionais.')
}
