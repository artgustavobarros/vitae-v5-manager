import { cn } from 'cn'

import {
  alternarCaixaDano,
  alternarFome,
  alternarMancha,
  caixasDano,
  ehMancha,
  MAX_FOME,
  TOTAL_HUMANIDADE,
  type Dano,
  type TrilhaHumanidade,
} from '#/domain/trilhas'

import { Bolinha, GlifoDano } from './marcadores'

const NOMES_DANO = { vazio: 'sem dano', superficial: 'dano superficial', agravado: 'dano agravado' }

/** Linha de Vitalidade ou Força de Vontade. Sem onChange, fica só para leitura. */
export function TrilhaDano({
  rotulo,
  dano,
  max,
  onChange,
}: {
  rotulo: string
  dano: Dano
  max: number
  onChange?: (dano: Dano) => void
}) {
  const caixas = caixasDano(dano, max)
  const restante = caixas.filter((c) => c === 'vazio').length

  return (
    <div className="flex h-12 items-center justify-between gap-2">
      <span className="text-sm text-muted-foreground tabular-nums">
        {rotulo} {restante}/{max}
      </span>
      <div role="group" aria-label={rotulo} className="flex">
        {caixas.map((estado, i) => (
          <button
            key={i}
            type="button"
            disabled={!onChange}
            aria-label={`${rotulo}, caixa ${i + 1}: ${NOMES_DANO[estado]}`}
            onClick={() => onChange?.(alternarCaixaDano(dano, max, i))}
            className="grid h-12 w-10 place-items-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default"
          >
            <GlifoDano estado={estado} />
          </button>
        ))}
      </div>
    </div>
  )
}

export function TrilhaFome({ fome, onChange }: { fome: number; onChange?: (fome: number) => void }) {
  return (
    <div className="flex h-12 items-center justify-between gap-4">
      <span className="text-sm text-muted-foreground">Fome</span>
      <div className="flex items-center gap-2">
        <span className="text-2xl font-semibold text-fome tabular-nums" aria-hidden>
          {fome}
        </span>
        <div role="group" aria-label={`Fome ${fome} de ${MAX_FOME}`} className="flex">
          {Array.from({ length: MAX_FOME }, (_, i) => (
            <button
              key={i}
              type="button"
              disabled={!onChange}
              aria-label={`Fome ${i + 1}`}
              aria-pressed={i < fome}
              onClick={() => onChange?.(alternarFome(fome, i))}
              className="grid h-12 w-10 place-items-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default"
            >
              <Bolinha cheia={i < fome} cor="vinho" grande />
            </button>
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
}: {
  trilha: TrilhaHumanidade
  onChange?: (trilha: TrilhaHumanidade) => void
}) {
  const manchas = trilha.manchas === 1 ? '1 Mancha' : `${trilha.manchas} Manchas`

  return (
    <div>
      <div role="group" aria-label={`Humanidade ${trilha.humanidade}, ${manchas}`} className="flex gap-1 pt-2">
        {Array.from({ length: TOTAL_HUMANIDADE }, (_, i) => {
          const humano = i < trilha.humanidade
          const mancha = ehMancha(trilha, i)
          return (
            <button
              key={i}
              type="button"
              disabled={!onChange || humano}
              aria-label={humano ? `Humanidade ${i + 1}` : mancha ? 'Remover Mancha' : 'Marcar Mancha'}
              onClick={() => onChange?.(alternarMancha(trilha, i))}
              className="relative flex h-12 flex-1 items-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default"
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
            </button>
          )
        })}
      </div>
      <div className="-mt-2 flex justify-between text-xs text-muted-foreground">
        <span>Humanidade {trilha.humanidade}</span>
        <span>{trilha.manchas > 0 ? manchas : 'Sem Manchas'}</span>
      </div>
    </div>
  )
}
