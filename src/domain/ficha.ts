/**
 * Ficha do Personagem: identidade, Atributos, Habilidades, Disciplinas com poderes,
 * Rituais, Cerimônias e Fórmulas, Vantagens e Defeitos, Potência do Sangue, Humanidade
 * e as trilhas do dia a dia. O nome fica numa coluna própria da tabela `personagem`.
 * Itens do Catálogo ficam por id (`src/domain/catalogo/`); um id que saiu do Catálogo não é apagado.
 */

import { z } from 'zod'

import { MAX_FOME, TOTAL_HUMANIDADE, type Dano } from './trilhas'

export const CLAS = [
  { id: 'banu-haqim', nome: 'Banu Haqim', nomeOriginal: 'Banu Haqim' },
  { id: 'brujah', nome: 'Brujah', nomeOriginal: 'Brujah' },
  { id: 'gangrel', nome: 'Gangrel', nomeOriginal: 'Gangrel' },
  { id: 'hecata', nome: 'Hecata', nomeOriginal: 'Hecata' },
  { id: 'lasombra', nome: 'Lasombra', nomeOriginal: 'Lasombra' },
  { id: 'malkaviano', nome: 'Malkaviano', nomeOriginal: 'Malkavian' },
  { id: 'ministerio', nome: 'Ministério', nomeOriginal: 'The Ministry' },
  { id: 'nosferatu', nome: 'Nosferatu', nomeOriginal: 'Nosferatu' },
  { id: 'ravnos', nome: 'Ravnos', nomeOriginal: 'Ravnos' },
  { id: 'salubri', nome: 'Salubri', nomeOriginal: 'Salubri' },
  { id: 'toreador', nome: 'Toreador', nomeOriginal: 'Toreador' },
  { id: 'tremere', nome: 'Tremere', nomeOriginal: 'Tremere' },
  { id: 'tzimisce', nome: 'Tzimisce', nomeOriginal: 'Tzimisce' },
  { id: 'ventrue', nome: 'Ventrue', nomeOriginal: 'Ventrue' },
  { id: 'caitiff', nome: 'Caitiff', nomeOriginal: 'Caitiff' },
  { id: 'sangue-ralo', nome: 'Sangue-Ralo', nomeOriginal: 'Thin-blood' },
] as const

export const SEITAS = [
  { id: 'camarilla', nome: 'Camarilla', nomeOriginal: 'Camarilla' },
  { id: 'saba', nome: 'Sabá', nomeOriginal: 'Sabbat' },
  { id: 'anarquistas', nome: 'Anarquistas', nomeOriginal: 'Anarch' },
] as const

export type Grupo = 'fisico' | 'social' | 'mental'

/** Títulos dos grupos na Ficha: "Físicos" para Atributos, "Físicas" para Habilidades. */
export const GRUPOS = [
  { id: 'fisico', atributos: 'Físicos', habilidades: 'Físicas' },
  { id: 'social', atributos: 'Sociais', habilidades: 'Sociais' },
  { id: 'mental', atributos: 'Mentais', habilidades: 'Mentais' },
] as const satisfies readonly { id: Grupo; atributos: string; habilidades: string }[]

export const ATRIBUTOS = [
  { id: 'forca', nome: 'Força', grupo: 'fisico' },
  { id: 'destreza', nome: 'Destreza', grupo: 'fisico' },
  { id: 'vigor', nome: 'Vigor', grupo: 'fisico' },
  { id: 'carisma', nome: 'Carisma', grupo: 'social' },
  { id: 'manipulacao', nome: 'Manipulação', grupo: 'social' },
  { id: 'autocontrole', nome: 'Autocontrole', grupo: 'social' },
  { id: 'inteligencia', nome: 'Inteligência', grupo: 'mental' },
  { id: 'raciocinio', nome: 'Raciocínio', grupo: 'mental' },
  { id: 'determinacao', nome: 'Determinação', grupo: 'mental' },
] as const satisfies readonly { id: string; nome: string; grupo: Grupo }[]

export const HABILIDADES = [
  { id: 'armas-brancas', nome: 'Armas Brancas', grupo: 'fisico' },
  { id: 'armas-de-fogo', nome: 'Armas de Fogo', grupo: 'fisico' },
  { id: 'atletismo', nome: 'Atletismo', grupo: 'fisico' },
  { id: 'briga', nome: 'Briga', grupo: 'fisico' },
  { id: 'conducao', nome: 'Condução', grupo: 'fisico' },
  { id: 'furtividade', nome: 'Furtividade', grupo: 'fisico' },
  { id: 'ladroagem', nome: 'Ladroagem', grupo: 'fisico' },
  { id: 'oficios', nome: 'Ofícios', grupo: 'fisico' },
  { id: 'sobrevivencia', nome: 'Sobrevivência', grupo: 'fisico' },
  { id: 'etiqueta', nome: 'Etiqueta', grupo: 'social' },
  { id: 'etiqueta-com-animais', nome: 'Etiqueta com Animais', grupo: 'social' },
  { id: 'intimidacao', nome: 'Intimidação', grupo: 'social' },
  { id: 'lideranca', nome: 'Liderança', grupo: 'social' },
  { id: 'manha', nome: 'Manha', grupo: 'social' },
  { id: 'performance', nome: 'Performance', grupo: 'social' },
  { id: 'persuasao', nome: 'Persuasão', grupo: 'social' },
  { id: 'sagacidade', nome: 'Sagacidade', grupo: 'social' },
  { id: 'subterfugio', nome: 'Subterfúgio', grupo: 'social' },
  { id: 'ciencia', nome: 'Ciência', grupo: 'mental' },
  { id: 'erudicao', nome: 'Erudição', grupo: 'mental' },
  { id: 'financas', nome: 'Finanças', grupo: 'mental' },
  { id: 'investigacao', nome: 'Investigação', grupo: 'mental' },
  { id: 'medicina', nome: 'Medicina', grupo: 'mental' },
  { id: 'ocultismo', nome: 'Ocultismo', grupo: 'mental' },
  { id: 'percepcao', nome: 'Percepção', grupo: 'mental' },
  { id: 'politica', nome: 'Política', grupo: 'mental' },
  { id: 'tecnologia', nome: 'Tecnologia', grupo: 'mental' },
] as const satisfies readonly { id: string; nome: string; grupo: Grupo }[]

export const DISCIPLINAS = [
  { id: 'alquimia-de-sangue-ralo', nome: 'Alquimia de Sangue-Ralo', nomeOriginal: 'Thin-blood Alchemy' },
  { id: 'animalismo', nome: 'Animalismo', nomeOriginal: 'Animalism' },
  { id: 'auspicios', nome: 'Auspícios', nomeOriginal: 'Auspex' },
  { id: 'celeridade', nome: 'Celeridade', nomeOriginal: 'Celerity' },
  { id: 'dominacao', nome: 'Dominação', nomeOriginal: 'Dominate' },
  { id: 'feiticaria-de-sangue', nome: 'Feitiçaria de Sangue', nomeOriginal: 'Blood Sorcery' },
  { id: 'fortitude', nome: 'Fortitude', nomeOriginal: 'Fortitude' },
  { id: 'oblivio', nome: 'Oblívio', nomeOriginal: 'Oblivion' },
  { id: 'ofuscacao', nome: 'Ofuscação', nomeOriginal: 'Obfuscate' },
  { id: 'potencia', nome: 'Potência', nomeOriginal: 'Potence' },
  { id: 'presenca', nome: 'Presença', nomeOriginal: 'Presence' },
  { id: 'proteanismo', nome: 'Proteanismo', nomeOriginal: 'Protean' },
] as const

export type Cla = (typeof CLAS)[number]['id']
export type Seita = (typeof SEITAS)[number]['id']
export type Atributo = (typeof ATRIBUTOS)[number]['id']
export type Habilidade = (typeof HABILIDADES)[number]['id']
export type Disciplina = (typeof DISCIPLINAS)[number]['id']

/** Limites da ficha, não regras de criação do V5. */
export const FAIXAS = {
  atributo: { min: 1, max: 5 },
  habilidade: { min: 0, max: 5 },
  disciplina: { min: 1, max: 5 },
  humanidade: { min: 0, max: TOTAL_HUMANIDADE },
  potenciaSangue: { min: 0, max: 10 },
  geracao: { min: 4, max: 16 },
} as const

function ids<T extends readonly { id: string }[]>(lista: T) {
  return lista.map((item) => item.id) as unknown as [T[number]['id'], ...T[number]['id'][]]
}

function faixa({ min, max }: { min: number; max: number }) {
  return z.int().min(min).max(max)
}

const danoSchema = z.object({ superficial: z.int().min(0), agravado: z.int().min(0) })

/** Vantagem ou Defeito escolhido do Catálogo, com o nível e uma nota livre (ex.: quem é o Contato). */
export const escolhaVantagemSchema = z.object({
  id: z.string().min(1),
  nivel: z.int().min(1).max(5),
  nota: z.string().max(200).optional(),
})

export type EscolhaVantagem = z.infer<typeof escolhaVantagemSchema>

const idsCatalogo = z
  .array(z.string().min(1))
  .refine((ids) => new Set(ids).size === ids.length, { message: 'Item repetido' })
  .default([])

export const conviccaoSchema = z.object({
  conviccao: z.string().default(''),
  pedraDeToque: z.string().default(''),
})

export type Conviccao = z.infer<typeof conviccaoSchema>

export const fichaSchema = z.object({
  conceito: z.string().default(''),
  cla: z.enum(ids(CLAS)).nullable(),
  geracao: faixa(FAIXAS.geracao).nullable(),
  seita: z.enum(ids(SEITAS)).nullable(),
  senhor: z.string().default(''),
  tipoPredador: z.string().nullable().default(null),
  ambicao: z.string().default(''),
  desejo: z.string().default(''),
  conviccoes: z.array(conviccaoSchema).default([]),
  aparencia: z.string().default(''),
  historia: z.string().default(''),
  atributos: z.record(z.enum(ids(ATRIBUTOS)), faixa(FAIXAS.atributo)),
  habilidades: z.record(
    z.enum(ids(HABILIDADES)),
    z.object({ valor: faixa(FAIXAS.habilidade), especializacoes: z.array(z.string()) }),
  ),
  disciplinas: z
    .array(z.object({ disciplina: z.enum(ids(DISCIPLINAS)), nivel: faixa(FAIXAS.disciplina) }))
    .refine((lista) => new Set(lista.map((d) => d.disciplina)).size === lista.length, {
      message: 'Disciplina repetida',
    }),
  /** Poderes de Disciplina, por id do Catálogo. */
  poderes: idsCatalogo,
  /** Rituais de Feitiçaria de Sangue. */
  rituais: idsCatalogo,
  /** Cerimônias de Oblívio. */
  cerimonias: idsCatalogo,
  /** Fórmulas de Alquimia de Sangue-Ralo. */
  formulas: idsCatalogo,
  vantagens: z.array(escolhaVantagemSchema).default([]),
  defeitos: z.array(escolhaVantagemSchema).default([]),
  potenciaSangue: faixa(FAIXAS.potenciaSangue),
  humanidade: faixa(FAIXAS.humanidade),
  manchas: z.int().min(0).max(TOTAL_HUMANIDADE),
  fome: z.int().min(0).max(MAX_FOME),
  danoVitalidade: danoSchema,
  danoVontade: danoSchema,
  criacao: z.record(z.string(), z.any()).optional(),
})

export type Ficha = z.infer<typeof fichaSchema>

/** O que o Jogador marca sozinho com a Ficha bloqueada. */
export const marcasSchema = fichaSchema.pick({
  danoVitalidade: true,
  danoVontade: true,
  fome: true,
  manchas: true,
})

export type Marcas = z.infer<typeof marcasSchema>

export function marcasDe({ danoVitalidade, danoVontade, fome, manchas }: Ficha): Marcas {
  return { danoVitalidade, danoVontade, fome, manchas }
}

/** Regra do V5 aplicada na criação: Sangue-Ralo é da 14ª Geração em diante; os demais clãs, até a 13ª. */
const ULTIMA_GERACAO_PLENA = 13

const TODAS_GERACOES = Array.from(
  { length: FAIXAS.geracao.max - FAIXAS.geracao.min + 1 },
  (_, i) => FAIXAS.geracao.min + i,
)

export function geracoesPermitidas(cla: Cla | null): number[] {
  if (cla === null) return TODAS_GERACOES
  return cla === 'sangue-ralo'
    ? TODAS_GERACOES.filter((g) => g > ULTIMA_GERACAO_PLENA)
    : TODAS_GERACOES.filter((g) => g <= ULTIMA_GERACAO_PLENA)
}

export function clasPermitidos(geracao: number | null): Cla[] {
  const ids = CLAS.map((c) => c.id)
  if (geracao === null) return ids
  return geracao > ULTIMA_GERACAO_PLENA ? ['sangue-ralo'] : ids.filter((c) => c !== 'sangue-ralo')
}

type ClaGeracao = Pick<Ficha, 'cla' | 'geracao'>

export function claGeracaoCombinam({ cla, geracao }: ClaGeracao): boolean {
  return cla === null || geracao === null || geracoesPermitidas(cla).includes(geracao)
}

/** Trocar o Clã apaga a Geração quando as duas deixam de combinar. */
export function escolherCla(atual: ClaGeracao, cla: Cla | null): ClaGeracao {
  return { cla, geracao: claGeracaoCombinam({ cla, geracao: atual.geracao }) ? atual.geracao : null }
}

/** Trocar a Geração apaga o Clã quando os dois deixam de combinar. */
export function escolherGeracao(atual: ClaGeracao, geracao: number | null): ClaGeracao {
  return { cla: claGeracaoCombinam({ cla: atual.cla, geracao }) ? atual.cla : null, geracao }
}

/** Valores com que o Rascunho nasce: os do Neófito. */
export function fichaNeofito(): Ficha {
  return {
    conceito: '',
    cla: null,
    geracao: null,
    seita: null,
    senhor: '',
    tipoPredador: null,
    ambicao: '',
    desejo: '',
    conviccoes: [],
    aparencia: '',
    historia: '',
    atributos: Object.fromEntries(ATRIBUTOS.map((a) => [a.id, 1])) as Ficha['atributos'],
    habilidades: Object.fromEntries(
      HABILIDADES.map((h) => [h.id, { valor: 0, especializacoes: [] as string[] }]),
    ) as Ficha['habilidades'],
    disciplinas: [],
    poderes: [],
    rituais: [],
    cerimonias: [],
    formulas: [],
    vantagens: [],
    defeitos: [],
    potenciaSangue: 1,
    humanidade: 7,
    manchas: 0,
    fome: 1,
    danoVitalidade: { superficial: 0, agravado: 0 },
    danoVontade: { superficial: 0, agravado: 0 },
  }
}

/** Valor Derivado: Vitalidade = Vigor + 3. */
export function vitalidadeMax(ficha: Ficha): number {
  return ficha.atributos.vigor + 3
}

/** Valor Derivado: Força de Vontade = Autocontrole + Determinação. */
export function vontadeMax(ficha: Ficha): number {
  return ficha.atributos.autocontrole + ficha.atributos.determinacao
}

/** Dano que passa do máximo é cortado, começando pelo superficial. */
function cortarDano(dano: Dano, max: number): Dano {
  const agravado = Math.min(dano.agravado, max)
  const superficial = Math.min(dano.superficial, max - agravado)
  return { superficial, agravado }
}

/** Aplicada ao salvar: o dano cabe nos Valores Derivados e as Manchas, acima da Humanidade. */
export function normalizarFicha(ficha: Ficha): Ficha {
  return {
    ...ficha,
    danoVitalidade: cortarDano(ficha.danoVitalidade, vitalidadeMax(ficha)),
    danoVontade: cortarDano(ficha.danoVontade, vontadeMax(ficha)),
    manchas: Math.min(ficha.manchas, TOTAL_HUMANIDADE - ficha.humanidade),
  }
}
