import {
  ATRIBUTOS,
  CLAS,
  DISCIPLINAS,
  GRUPOS,
  HABILIDADES,
  SEITAS,
  type Disciplina,
  type Ficha,
  type Grupo,
} from '#/domain/ficha'

import type { GrupoTracos } from './atributos'
import { Pontos } from './marcadores'

// Rótulos e agrupamentos que a Ficha, o wizard e o formulário mostram do mesmo jeito.

export const atributosDoGrupo = (grupo: Grupo) => ATRIBUTOS.filter((a) => a.grupo === grupo)
export const habilidadesDoGrupo = (grupo: Grupo) => HABILIDADES.filter((h) => h.grupo === grupo)

export const nomeCla = (ficha: Ficha) => CLAS.find((c) => c.id === ficha.cla)?.nome ?? ''
export const nomeSeita = (ficha: Ficha) => SEITAS.find((s) => s.id === ficha.seita)?.nome ?? ''
export const nomeDisciplina = (id: Disciplina) => DISCIPLINAS.find((d) => d.id === id)?.nome ?? id

/** "12ª Geração". */
export const rotuloGeracao = (geracao: number) => `${geracao}ª Geração`

export function gruposAtributos(ficha: Ficha): GrupoTracos[] {
  return GRUPOS.map((g) => ({
    titulo: g.atributos,
    tracos: atributosDoGrupo(g.id).map((a) => ({ nome: a.nome, valor: ficha.atributos[a.id] })),
  }))
}

/** Com `soComPontos`, como na Revisão, ficam só as Habilidades com pontos e os grupos que sobram. */
export function gruposHabilidades(ficha: Ficha, { soComPontos = false } = {}): GrupoTracos[] {
  return GRUPOS.map((g) => ({
    titulo: g.habilidades,
    tracos: habilidadesDoGrupo(g.id)
      .filter((h) => !soComPontos || ficha.habilidades[h.id].valor > 0)
      .map((h) => {
        const { valor, especializacoes } = ficha.habilidades[h.id]
        return { nome: h.nome, valor, detalhe: especializacoes.join(', ') || undefined }
      }),
  })).filter((g) => g.tracos.length > 0)
}

/** Disciplinas só para leitura: nome e pontos, sem poderes (fatia 2). */
export function ListaDisciplinas({ ficha, className }: { ficha: Ficha; className?: string }) {
  if (ficha.disciplinas.length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhuma Disciplina.</p>
  }
  return (
    <ul className={className}>
      {ficha.disciplinas.map((d) => {
        const nome = nomeDisciplina(d.disciplina)
        return (
          <li key={d.disciplina} className="flex h-11 items-center justify-between border-b text-base">
            <span>{nome}</span>
            <Pontos valor={d.nivel} rotulo={nome} />
          </li>
        )
      })}
    </ul>
  )
}
