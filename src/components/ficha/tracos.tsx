import { cn } from 'cn'

import { TermoRegra } from '#/components/consulta-regra'
import { itensSoltos } from '#/domain/catalogo/escolhas'
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
import { ListaPoderes, ListaSoltos } from './catalogo'
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
    tracos: atributosDoGrupo(g.id).map((a) => ({
      id: a.id,
      tipo: 'atributo' as const,
      nome: a.nome,
      valor: ficha.atributos[a.id],
    })),
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
        return {
          id: h.id,
          tipo: 'habilidade' as const,
          nome: h.nome,
          valor,
          detalhe: especializacoes.join(', ') || undefined,
        }
      }),
  })).filter((g) => g.tracos.length > 0)
}

/** Disciplinas só para leitura: nome, pontos e, embaixo, os poderes e Rituais. */
export function ListaDisciplinas({ ficha, className }: { ficha: Ficha; className?: string }) {
  if (ficha.disciplinas.length === 0 && itensSoltos(ficha).length === 0) {
    return <p className="text-sm text-muted-foreground">Nenhuma Disciplina.</p>
  }
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <ul>
        {ficha.disciplinas.map((d) => {
          const nome = nomeDisciplina(d.disciplina)
          return (
            <li key={d.disciplina} className="border-b">
              <div className="flex h-11 items-center justify-between text-base">
                <TermoRegra tipo="disciplina" id={d.disciplina}>
                  {nome}
                </TermoRegra>
                <Pontos valor={d.nivel} rotulo={nome} />
              </div>
              <ListaPoderes ficha={ficha} disciplina={d.disciplina} />
            </li>
          )
        })}
      </ul>
      <ListaSoltos ficha={ficha} />
    </div>
  )
}
