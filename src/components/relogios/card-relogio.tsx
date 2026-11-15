import { EyeOff, Minus, Pencil, Plus, Trash2 } from 'lucide-react'

import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '#/components/ui/card'
import type { RelogioSalvo } from '#/domain/relogios'
import type { RelogioPublico } from '#/domain/exibicao-publica'

type Props = {
  relogio: RelogioSalvo | RelogioPublico
  narrador: boolean
  ocupado?: boolean
  onMover?: (delta: -1 | 1) => void
  onEditar?: () => void
  onRetirar?: () => void
}

export function CardRelogio({ relogio, narrador, ocupado, onMover, onEditar, onRetirar }: Props) {
  const titulo = !narrador && 'tituloPublico' in relogio ? relogio.tituloPublico?.trim() || relogio.nome : relogio.nome
  return (
    <Card className="min-w-0 gap-4">
      <CardHeader className="gap-3">
        {narrador && !relogio.visivel && <Badge variant="outline"><EyeOff /> Só Narrador</Badge>}
        <h2 className="break-words font-serif text-2xl">{titulo}</h2>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center gap-3 p-4">
          <meter className="sr-only" aria-label={`Etapas de ${titulo}`} aria-live="polite" min={0} max={relogio.total} value={relogio.atual}>
            {relogio.atual} de {relogio.total}
          </meter>
          <div className="relative size-56 max-w-full rounded-full">
            <svg viewBox="0 0 96 96" className="size-full -rotate-90" aria-hidden="true">
              {Array.from({ length: relogio.total }, (_, indice) => (
                <circle key={indice} cx="48" cy="48" r="40" pathLength="100" fill="none" strokeWidth="8"
                  stroke="currentColor" strokeDasharray={`${100 / relogio.total - Math.min(1, 20 / relogio.total)} 100`}
                  strokeDashoffset={-indice * 100 / relogio.total}
                  className={indice < relogio.atual ? 'text-vinho' : 'text-muted'} />
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center" aria-hidden="true">
              <span className="text-4xl font-semibold tabular-nums">{relogio.atual}</span>
              <span className="text-sm text-muted-foreground">de {relogio.total} etapas</span>
            </div>
          </div>
          {narrador && (
            <div className="flex gap-4">
              <Button variant="outline" size="icon-lg" aria-label={`Diminuir ${relogio.nome}`}
                aria-disabled={ocupado} className="aria-disabled:opacity-50" disabled={relogio.atual === 0}
                onClick={() => { if (!ocupado) onMover?.(-1) }}><Minus className="size-5" /></Button>
              <Button variant="outline" size="icon-lg" aria-label={`Aumentar ${relogio.nome}`}
                aria-disabled={ocupado} className="aria-disabled:opacity-50" disabled={relogio.atual === relogio.total}
                onClick={() => { if (!ocupado) onMover?.(1) }}><Plus className="size-5" /></Button>
            </div>
          )}
        </div>
      </CardContent>
      {narrador && (
        <CardFooter className="flex-wrap justify-between gap-2 border-t pt-4">
          <Button variant="ghost" disabled={ocupado} onClick={onEditar}><Pencil className="size-4" />Editar</Button>
          <Button variant="ghost" disabled={ocupado} onClick={onRetirar}><Trash2 className="size-4" />Retirar</Button>
        </CardFooter>
      )}
    </Card>
  )
}
