import { Link } from '@tanstack/react-router'
import { cn } from 'cn'

import { caixasDano, type Dano } from '#/domain/trilhas'

export type DadosCardPainel = {
  id: string
  nome: string
  jogador?: string | null
  coteries: string[]
  condicao: {
    danoVitalidade: Dano
    danoVontade: Dano
    fome: number
    maxVit: number
    maxVont: number
  } | null
  humanidade?: number
  manchas?: number
  ehMeu?: boolean
  compartilhaCondicao?: boolean
}

function GlifoDanoMini({ estado }: { estado: 'vazio' | 'superficial' | 'agravado' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={cn(
        'size-4 rounded-xs border',
        estado === 'vazio' && 'border-marcador',
        estado === 'superficial' && 'border-foreground text-foreground',
        estado === 'agravado' && 'border-vinho text-vinho',
      )}
    >
      {estado !== 'vazio' && (
        <line x1="2" y1="22" x2="22" y2="2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      )}
      {estado === 'agravado' && (
        <line x1="2" y1="2" x2="22" y2="22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      )}
    </svg>
  )
}

function BolinhaMini({ cheia }: { cheia: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        'block size-3 rounded-full border',
        !cheia && 'border-marcador',
        cheia && 'border-vinho bg-vinho',
      )}
    />
  )
}

export function PainelCard({ item }: { item: DadosCardPainel }) {
  const caixasVit = item.condicao ? caixasDano(item.condicao.danoVitalidade, item.condicao.maxVit) : []
  const caixasVont = item.condicao ? caixasDano(item.condicao.danoVontade, item.condicao.maxVont) : []

  return (
    <Link
      to="/personagens/$id"
      params={{ id: item.id }}
      className="flex flex-col gap-2 rounded-lg border bg-card p-4 text-card-foreground shadow-xs transition-colors hover:bg-accent/40 outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="font-serif text-xl font-semibold leading-tight text-foreground">
            {item.nome}
            {item.ehMeu && <span className="ml-2 text-xs font-normal text-muted-foreground font-sans">· seu</span>}
          </h2>
          {item.coteries.length > 0 && (
            <p className="mt-0.5 text-xs text-muted-foreground">{item.coteries.join(' · ')}</p>
          )}
        </div>
        {item.jogador && (
          <span className="shrink-0 text-xs font-medium text-muted-foreground">{item.jogador}</span>
        )}
      </div>

      {item.condicao ? (
        <div className="flex flex-col gap-1.5 pt-1 text-xs">
          {/* Vitalidade */}
          <div className="flex items-center gap-2">
            <span className="w-8 font-mono text-muted-foreground">Vit</span>
            <div className="flex flex-wrap items-center gap-1">
              {caixasVit.map((c, i) => (
                <GlifoDanoMini key={i} estado={c} />
              ))}
            </div>
          </div>

          {/* Força de Vontade */}
          <div className="flex items-center gap-2">
            <span className="w-8 font-mono text-muted-foreground">FdV</span>
            <div className="flex flex-wrap items-center gap-1">
              {caixasVont.map((c, i) => (
                <GlifoDanoMini key={i} estado={c} />
              ))}
            </div>
          </div>

          {/* Fome e Humanidade */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t">
            <div className="flex items-center gap-2">
              <span className="w-8 font-mono text-muted-foreground">Fome</span>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <BolinhaMini key={i} cheia={i < item.condicao!.fome} />
                ))}
              </div>
            </div>

            {item.humanidade !== undefined && (
              <span className="text-muted-foreground">
                Hum {item.humanidade}
                {item.manchas !== undefined && item.manchas > 0 && (
                  <span> · {item.manchas} {item.manchas === 1 ? 'Mancha' : 'Manchas'}</span>
                )}
              </span>
            )}

            {item.ehMeu && item.compartilhaCondicao === false && (
              <span className="text-xs text-muted-foreground italic">(não compartilhada)</span>
            )}
          </div>
        </div>
      ) : (
        <div className="pt-2 text-xs text-muted-foreground italic">
          Condição: oculto
        </div>
      )}
    </Link>
  )
}
