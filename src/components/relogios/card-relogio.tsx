import { EyeOff, Minus, Pencil, Plus, Trash2, TrendingDown, TrendingUp } from 'lucide-react'

import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '#/components/ui/card'
import { efeitosAtivos, type RelogioSalvo } from '#/domain/relogios'
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
  const ativos = efeitosAtivos(relogio)
  const piora = relogio.ultimaTendencia === 'piora'
  return (
    <Card className="min-w-0 gap-4">
      <CardHeader className="gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="max-w-full whitespace-normal break-words">{relogio.tipo}</Badge>
          {!relogio.visivel && <Badge variant="outline"><EyeOff /> Só Narrador</Badge>}
        </div>
        <h2 className="break-words font-serif text-2xl">{relogio.nome}</h2>
        {relogio.descricao && <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">{relogio.descricao}</p>}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center gap-3 p-4">
          <meter className="sr-only" aria-label={`Etapas de ${relogio.nome}`} min={0} max={relogio.total} value={relogio.atual}>
            {relogio.atual} de {relogio.total}
          </meter>
          <div key={relogio.revisao} className="relogio-movimento relative size-40 rounded-full"
            data-tendencia={relogio.ultimaTendencia ?? undefined}>
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
          {relogio.ultimaTendencia && (
            <p className={`flex items-center gap-2 text-sm ${piora ? 'text-relogio-perigo' : 'text-relogio-tranquilo'}`}>
              {piora ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
              {piora ? 'Perigo aumentando' : 'Perigo diminuindo'}
            </p>
          )}
          <p className="text-center text-xs text-muted-foreground">
            {relogio.perigo === 'aumenta' ? 'Mais etapas, maior perigo.' : 'Menos etapas, maior perigo.'}
          </p>
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
        <div className="space-y-3 border-t pt-4" aria-live="polite">
          <h3 className="text-sm font-semibold">Efeitos ativos <span className="text-muted-foreground">({ativos.length})</span></h3>
          {ativos.length === 0 && <p className="text-sm text-muted-foreground">Nenhum efeito ativo.</p>}
          {ativos.map((efeito) => (
            <div key={efeito.id} className="space-y-1 border-l-2 border-vinho pl-3">
              <p className="break-words text-sm font-semibold">{efeito.titulo}</p>
              <p className="text-xs text-muted-foreground">{efeito.etapa} {efeito.condicao === 'a_partir_de' ? 'ou mais' : 'ou menos'}</p>
              <p className="whitespace-pre-wrap break-words text-sm">{efeito.textoAtivacao}</p>
            </div>
          ))}
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
