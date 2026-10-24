import { cn } from 'cn'

import { alternarPontos, type CaixaDano } from '#/domain/trilhas'

/** Glifos da ficha oficial: caixa vazia, "/" superficial e "X" agravado, com o mesmo traço. */
export function GlifoDano({ estado }: { estado: CaixaDano }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={cn(
        'size-6 rounded-sm border-2',
        estado === 'vazio' && 'border-marcador',
        estado === 'superficial' && 'border-foreground text-foreground',
        estado === 'agravado' && 'border-vinho text-vinho',
      )}
    >
      {estado !== 'vazio' && (
        <line x1="2" y1="22" x2="22" y2="2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      )}
      {estado === 'agravado' && (
        <line x1="2" y1="2" x2="22" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      )}
    </svg>
  )
}

/** Bolinha de ponto da ficha oficial. */
export function Bolinha({
  cheia,
  cor = 'tinta',
  grande = false,
}: {
  cheia: boolean
  cor?: 'tinta' | 'vinho'
  /** Bolinha maior para trilhas tocáveis, como a Fome. */
  grande?: boolean
}) {
  return (
    <span
      aria-hidden
      className={cn(
        'block rounded-full',
        grande ? 'size-5 border-2' : 'size-3 border',
        !cheia && 'border-marcador',
        cheia && cor === 'tinta' && 'border-foreground bg-foreground',
        cheia && cor === 'vinho' && 'border-vinho bg-vinho',
      )}
    />
  )
}

/** Linha de pontos só para leitura, como Atributos e Habilidades. */
export function Pontos({ valor, max = 5, rotulo }: { valor: number; max?: number; rotulo: string }) {
  return (
    <span role="img" aria-label={`${rotulo}: ${valor} de ${max}`} className="flex gap-2">
      {Array.from({ length: max }, (_, i) => (
        <Bolinha key={i} cheia={i < valor} />
      ))}
    </span>
  )
}

/** Linha de pontos tocável para o formulário manual: tocar leva o valor até a bolinha. */
export function SeletorPontos({
  valor,
  min = 0,
  max = 5,
  rotulo,
  onChange,
  className,
}: {
  valor: number
  min?: number
  max?: number
  rotulo: string
  onChange: (valor: number) => void
  /** Ex.: `grid grid-cols-5` para quebrar trilhas de 10 em duas linhas no celular. */
  className?: string
}) {
  return (
    <div role="group" aria-label={`${rotulo}: ${valor} de ${max}`} className={cn('flex', className)}>
      {Array.from({ length: max }, (_, i) => (
        <button
          key={i}
          type="button"
          aria-label={`${rotulo} ${i + 1}`}
          aria-pressed={i < valor}
          onClick={() => onChange(alternarPontos(valor, i, min))}
          className="grid h-12 w-10 place-items-center rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Bolinha cheia={i < valor} grande />
        </button>
      ))}
    </div>
  )
}
