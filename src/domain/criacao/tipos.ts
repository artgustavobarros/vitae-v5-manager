import type { Atributo, Disciplina, Habilidade } from '../ficha'
import type { TipoPredador } from '../catalogo/tipos'

export type PerfilHabilidade = 'especialista' | 'equilibrado' | 'generalista'

export type OrigemEspecializacao = 'gratis' | 'livre' | 'predador'

export type Especializacao = {
  habilidade: Habilidade
  especializacao: string
  origem?: OrigemEspecializacao
}

export type ConviccaoComPedra = {
  conviccao: string
  pedraDeToque: string
}

export type OrigemVantagem = 'pessoal' | 'predador'

export type EscolhaVantagemCriacao = {
  id: string
  nivel: number
  origem?: OrigemVantagem
  nota?: string
}

export type TracoPredadorEscolhido = {
  id: string
  nivel: number
  tipo?: 'vantagem' | 'defeito'
  nota?: string
}

export type EscolhasPredador = {
  disciplina: Disciplina
  especializacao: {
    habilidade: Habilidade
    especializacao: string
  }
  tracoEscolhido?: TracoPredadorEscolhido
  poder?: string
}

export type DisciplinaCriacao = {
  id: Disciplina
  nivel: number
  poderes: string[]
}

export type DadosCriacao = {
  atributos: Record<Atributo, number>
  perfilHabilidade: PerfilHabilidade
  habilidades: Record<Habilidade, number>
  especializacoes: Especializacao[]
  disciplinas: DisciplinaCriacao[]
  vantagens: EscolhaVantagemCriacao[]
  predador: TipoPredador | null
  conviccoes: ConviccaoComPedra[]
}

export type SlotInfo = {
  esperado: number
  atual: number
}

export type ResultadoValidacaoAtributos = {
  valido: boolean
  erros: string[]
  slots: Record<1 | 2 | 3 | 4, SlotInfo>
}

export type ResultadoValidacaoHabilidades = {
  valido: boolean
  erros: string[]
  slots: Record<number, SlotInfo>
}

export type ResultadoValidacaoDisciplinas = {
  valido: boolean
  erros: string[]
}

export type ResultadoValidacaoVantagens = {
  valido: boolean
  erros: string[]
  pontosVantagens: number
  pontosDefeitos: number
}

export type ResultadoValidacaoConviccoes = {
  valido: boolean
  erros: string[]
}

export type ResultadoValidacaoCriacao = {
  valido: boolean
  erros: string[]
  avisos: string[]
  detalhes: {
    atributos: ResultadoValidacaoAtributos
    habilidades: ResultadoValidacaoHabilidades
    disciplinas: ResultadoValidacaoDisciplinas
    vantagensDefeitos: ResultadoValidacaoVantagens
    conviccoes: ResultadoValidacaoConviccoes
  }
}
