import { Accessibility, defaultPreset } from '@dnd-kit/dom'
import { DragDropProvider, type DragEndEvent, type DragOverEvent } from '@dnd-kit/react'
import { isSortable, useSortable } from '@dnd-kit/react/sortable'
import { useRouter } from '@tanstack/react-router'
import { cn } from 'cn'
import { GripVertical, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import { Card } from '#/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '#/components/ui/popover'
import { reordenarParadas, type ParadaCalculada, type ParadaPersonalizada } from '#/domain/paradas'
import { reordenarParadasUsuario } from '#/server/paradas'

const rotulosTipo = { fisico: 'Física', social: 'Social', mental: 'Mental' }
const plugins = [
  ...defaultPreset.plugins.filter((plugin) => plugin !== Accessibility),
  Accessibility.configure({
    screenReaderInstructions: { draggable: 'Pressione Espaço para selecionar a Parada. Use as setas para mover, Espaço para soltar e Escape para cancelar.' },
    announcements: {
      dragstart: () => 'Parada selecionada para reordenar.',
      dragover: ({ operation }: DragOverEvent) => isSortable(operation.source) ? `Posição ${operation.source.index + 1}.` : undefined,
      dragend: ({ canceled }: DragEndEvent) => canceled ? 'Reordenação cancelada.' : 'Parada reposicionada.',
    },
  }),
]

type Props = {
  paradas: ParadaCalculada[]
  gerenciaveis: readonly string[]
  podeReordenar: boolean
  onEditar?: (parada: ParadaPersonalizada) => void
  onExcluir?: (parada: ParadaPersonalizada) => void
}

export function GridParadas({ paradas, gerenciaveis, podeReordenar, onEditar, onExcluir }: Props) {
  const router = useRouter()
  // Mantém o arraste estável se o SSE atualizar os dados enquanto o cartão estiver sendo movido.
  const [locais, setLocais] = useState<ParadaCalculada[] | null>(null)
  const [salvando, setSalvando] = useState(false)
  const exibidas = locais ?? paradas
  const editavel = podeReordenar

  async function salvarOrdem(origemId: string, destinoId: string) {
    const ordem = reordenarParadas(exibidas, origemId, destinoId)
    const porId = new Map(exibidas.map((p) => [p.id, p]))
    setLocais(ordem.map((id) => porId.get(id)!))
    setSalvando(true)
    try {
      await reordenarParadasUsuario({ data: { origemId, destinoId } })
      await router.invalidate()
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : 'Não foi possível salvar a ordem das Paradas.')
      await router.invalidate()
    } finally {
      setSalvando(false)
      setLocais(null)
    }
  }

  return (
    <DragDropProvider plugins={plugins}
      onDragStart={() => setLocais(exibidas)}
      onDragEnd={(event) => {
        const { source } = event.operation
        if (event.canceled || !isSortable(source) || source.initialIndex === source.index) {
          setLocais(null)
          return
        }
        const origem = exibidas[source.initialIndex]
        const destino = exibidas[source.index]
        if (!origem || !destino) { setLocais(null); return }
        return salvarOrdem(origem.id, destino.id)
      }}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-label="Paradas em grid" aria-busy={salvando}>
        {exibidas.map((parada, indice) => (
          <CartaoParada key={parada.id} parada={parada} indice={indice} editavel={editavel} salvando={salvando} podeGerenciar={gerenciaveis.includes(parada.id)}
            onEditar={onEditar} onExcluir={onExcluir} />
        ))}
      </div>
    </DragDropProvider>
  )
}

function CartaoParada({ parada: p, indice, editavel, salvando, podeGerenciar, onEditar, onExcluir }: {
  parada: ParadaCalculada
  indice: number
  editavel: boolean
  salvando: boolean
  podeGerenciar: boolean
  onEditar?: Props['onEditar']
  onExcluir?: Props['onExcluir']
}) {
  const { ref, handleRef, isDragging } = useSortable({ id: p.id, index: indice, disabled: !editavel || salvando })
  return (
    <Card ref={editavel ? ref : undefined} data-parada-id={p.id} className={cn('gap-2 p-3', isDragging && 'border-primary opacity-70')}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-start gap-1">
          {editavel && (
            <Button ref={handleRef} disabled={salvando} type="button" variant="ghost" size="icon" className="size-6 shrink-0 touch-none cursor-grab text-muted-foreground active:cursor-grabbing"
              aria-label={`Reordenar ${p.nome}`} aria-roledescription="Parada reordenável"
              title="Arraste para reordenar. Pelo teclado: Espaço, setas e Espaço para soltar.">
              <GripVertical className="size-4" />
            </Button>
          )}
          <h3 className="min-w-0 text-sm font-semibold">{p.nome}</h3>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Badge variant="outline" className="shrink-0 text-xs">{rotulosTipo[p.grupo]}</Badge>
          {p.personalizada && podeGerenciar && editavel && onEditar && onExcluir && (
            <Popover>
              <PopoverTrigger asChild>
                <Button type="button" variant="ghost" size="icon" disabled={salvando} className="size-6" aria-label={`Opções de ${p.nome}`}><MoreHorizontal className="size-4" /></Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 space-y-2 p-3" align="end">
                <p className="text-sm font-medium">{p.nome}</p>
                <Button type="button" variant="ghost" className="w-full justify-start" onClick={() => onEditar(p)}><Pencil className="size-4" /> Editar Parada</Button>
                <Button type="button" variant="ghost" className="w-full justify-start text-destructive" onClick={() => onExcluir(p)}><Trash2 className="size-4" /> Remover Parada</Button>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-1">
        <p className="text-xs text-muted-foreground">
          {p.atributoNome} <span className="tabular-nums text-foreground">{p.atributoValor}</span>
          {' + '}{p.habilidadeNome} <span className="tabular-nums text-foreground">{p.habilidadeValor}</span>
        </p>
        <p className="shrink-0 text-xl font-semibold tabular-nums" aria-label={`${p.total} dados base`}>{p.total}<span className="ml-1 text-xs font-normal text-muted-foreground">dados</span></p>
      </div>
    </Card>
  )
}
