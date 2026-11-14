import { cn } from 'cn'
import { useState } from 'react'

import { TermoRegra } from '#/components/consulta-regra'
import { Button } from '#/components/ui/button'
import {
  alterarCaixaDanoNaPosicao,
  alternarFome,
  alternarMancha,
  caixasDano,
  ehMancha,
  MAX_FOME,
  reconciliarCaixasDano,
  TOTAL_HUMANIDADE,
  type CaixaDano,
  type Dano,
  type TrilhaHumanidade,
} from '#/domain/trilhas'

import { Bolinha, GlifoDano } from './marcadores'

// Os toques usam o Button do shadcn (ghost), sem fundo no hover: no celular ele ficaria preso após o toque.
const NOMES_DANO = { vazio: 'sem dano', superficial: 'dano superficial', agravado: 'dano agravado' }

/**
 * Mantém o estado posicional das caixas de dano otimisticamente após cliques locais,
 * reconciliando apenas quando as propriedades `dano` ou `max` mudam externamente.
 */
export function useCaixasDano(
  dano: Dano,
  max: number,
  onChange?: (novoDano: Dano) => void,
) {
  const [estado, setEstado] = useState<{
    caixas: CaixaDano[]
    superficialProp: number
    agravadoProp: number
    maxProp: number
  }>(() => ({
    caixas: caixasDano(dano, max),
    superficialProp: dano.superficial,
    agravadoProp: dano.agravado,
    maxProp: max,
  }))

  const propsMudaram =
    estado.superficialProp !== dano.superficial ||
    estado.agravadoProp !== dano.agravado ||
    estado.maxProp !== max

  const caixas = propsMudaram
    ? reconciliarCaixasDano(estado.caixas, dano, max)
    : estado.caixas

  if (propsMudaram) {
    setEstado({
      caixas,
      superficialProp: dano.superficial,
      agravadoProp: dano.agravado,
      maxProp: max,
    })
  }

  function avancarCaixa(indice: number) {
    if (!onChange) return
    const proximo = alterarCaixaDanoNaPosicao(caixas, indice, 'avancar')
    setEstado({
      caixas: proximo.caixas,
      superficialProp: dano.superficial,
      agravadoProp: dano.agravado,
      maxProp: max,
    })
    onChange(proximo.dano)
  }

  function retrocederCaixa(indice: number) {
    if (!onChange) return
    if (caixas[indice] === 'vazio') return
    const proximo = alterarCaixaDanoNaPosicao(caixas, indice, 'retroceder')
    setEstado({
      caixas: proximo.caixas,
      superficialProp: dano.superficial,
      agravadoProp: dano.agravado,
      maxProp: max,
    })
    onChange(proximo.dano)
  }

  return { caixas, avancarCaixa, retrocederCaixa }
}

/** Linha de Vitalidade ou Força de Vontade. Sem onChange, fica só para leitura. */
export function TrilhaDano({
  rotulo,
  dano,
  max,
  onChange,
  termo,
}: {
  rotulo: string
  dano: Dano
  max: number
  onChange?: (dano: Dano) => void
  /** Id do termo da consulta rápida; com ele, o rótulo abre a consulta. */
  termo?: string
}) {
  const { caixas, avancarCaixa, retrocederCaixa } = useCaixasDano(dano, max, onChange)
  const restante = caixas.filter((c) => c === 'vazio').length

  return (
    // Quebra de linha só quando as caixas não cabem ao lado do rótulo (Vitalidade alta, card estreito).
    <div className="flex min-h-12 flex-wrap items-center justify-between gap-x-2">
      <span className="text-sm text-muted-foreground tabular-nums">
        <Rotulo termo={termo}>{rotulo}</Rotulo> {restante}/{max}
      </span>
      <div role="group" aria-label={rotulo} className="flex flex-wrap">
        {caixas.map((estado, i) => (
          <Button
            key={i}
            type="button"
            variant="ghost"
            size="icon"
            disabled={!onChange}
            aria-label={`${rotulo}, caixa ${i + 1}: ${NOMES_DANO[estado]}`}
            onClick={() => avancarCaixa(i)}
            onContextMenu={(e) => {
              if (!onChange) return
              e.preventDefault()
              retrocederCaixa(i)
            }}
            className="h-12 w-10 hover:bg-transparent focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-100 dark:hover:bg-transparent"
          >
            <GlifoDano estado={estado} />
          </Button>
        ))}
      </div>
    </div>
  )
}

export function TrilhaFome({
  fome,
  onChange,
  consulta = false,
}: {
  fome: number
  onChange?: (fome: number) => void
  /** O rótulo abre a consulta rápida. */
  consulta?: boolean
}) {
  return (
    <div className="flex h-12 items-center justify-between gap-4">
      <span className="text-sm text-muted-foreground">
        <Rotulo termo={consulta ? 'fome' : undefined}>Fome</Rotulo>
      </span>
      <div className="flex items-center gap-2">
        <span className="text-2xl font-semibold text-fome tabular-nums" aria-hidden>
          {fome}
        </span>
        <div role="group" aria-label={`Fome ${fome} de ${MAX_FOME}`} className="flex">
          {Array.from({ length: MAX_FOME }, (_, i) => (
            <Button
              key={i}
              type="button"
              variant="ghost"
              size="icon"
              disabled={!onChange}
              aria-label={`Fome ${i + 1}`}
              aria-pressed={i < fome}
              onClick={() => onChange?.(alternarFome(fome, i))}
              className="h-12 w-10 hover:bg-transparent focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-100 dark:hover:bg-transparent"
            >
              <Bolinha cheia={i < fome} cor="vinho" grande />
            </Button>
          ))}
        </div>
      </div>
    </div>
  )
}

/** Horizonte de Humanidade: 10 segmentos; as Manchas ocupam a partir da direita. */
export function HorizonteHumanidade({
  trilha,
  onChange,
  consulta = false,
}: {
  trilha: TrilhaHumanidade
  onChange?: (trilha: TrilhaHumanidade) => void
  /** Humanidade e Manchas abrem a consulta rápida. */
  consulta?: boolean
}) {
  const manchas = trilha.manchas === 1 ? '1 Mancha' : `${trilha.manchas} Manchas`

  return (
    <div>
      <div role="group" aria-label={`Humanidade ${trilha.humanidade}, ${manchas}`} className="flex gap-1 pt-2">
        {Array.from({ length: TOTAL_HUMANIDADE }, (_, i) => {
          const humano = i < trilha.humanidade
          const mancha = ehMancha(trilha, i)
          return (
            <Button
              key={i}
              type="button"
              variant="ghost"
              size="icon"
              disabled={!onChange || humano}
              aria-label={humano ? `Humanidade ${i + 1}` : mancha ? 'Remover Mancha' : 'Marcar Mancha'}
              onClick={() => onChange?.(alternarMancha(trilha, i))}
              className="relative h-12 w-auto flex-1 justify-start rounded-sm px-0 hover:bg-transparent focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-100 dark:hover:bg-transparent"
            >
              <span
                className={cn(
                  'h-1 w-full rounded-full',
                  humano && 'bg-foreground',
                  !humano && 'bg-marcador',
                )}
              />
              {mancha && (
                <svg
                  viewBox="0 0 12 12"
                  aria-hidden
                  className="absolute top-1/2 left-1/2 size-3 -translate-x-1/2 -translate-y-1/2 text-foreground"
                >
                  <line x1="1" y1="11" x2="11" y2="1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              )}
            </Button>
          )
        })}
      </div>
      <div className="-mt-2 flex justify-between text-xs text-muted-foreground">
        <span>
          <Rotulo termo={consulta ? 'humanidade' : undefined} pequeno>Humanidade</Rotulo> {trilha.humanidade}
        </span>
        <Rotulo termo={consulta ? 'manchas' : undefined} pequeno>{trilha.manchas > 0 ? manchas : 'Sem Manchas'}</Rotulo>
      </div>
    </div>
  )
}

/** Rótulo de trilha que abre a consulta rápida quando há termo; sem termo, só texto. */
function Rotulo({ termo, pequeno = false, children }: { termo?: string; pequeno?: boolean; children: string }) {
  if (!termo) return <>{children}</>
  return (
    <TermoRegra tipo="termo" id={termo} className={cn('text-muted-foreground', pequeno ? 'text-xs' : 'text-sm')}>
      {children}
    </TermoRegra>
  )
}
