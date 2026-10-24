import { Link } from '@tanstack/react-router'
import { ChevronRight, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '#/components/ui/alert-dialog'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import type { StatusPersonagem } from '#/domain/permissoes-ficha'
import { apagarRascunho } from '#/server/personagens'

const NOMES_STATUS: Record<StatusPersonagem, string> = {
  rascunho: 'Rascunho',
  ativo: 'Ativo',
  arquivado: 'Arquivado',
}

export type ItemPersonagem = {
  id: string
  nome: string
  status: StatusPersonagem
  /** Linha abaixo do nome, como o Jogador dono na lista do Narrador. */
  detalhe?: string
  /** Rascunho do próprio usuário: abre o formulário e pode ser apagado. */
  meuRascunho: boolean
}

/** Lista de Personagens com status; Rascunhos próprios abrem o formulário e têm "Apagar". */
export function ListaPersonagens({
  itens,
  onApagado,
}: {
  itens: ItemPersonagem[]
  onApagado: () => void
}) {
  return (
    <ul className="divide-y border-y">
      {itens.map((p) => (
        <li key={p.id} className="flex items-center gap-2">
          <Link
            to={p.meuRascunho ? '/personagens/$id/editar' : '/personagens/$id'}
            params={{ id: p.id }}
            className="flex min-h-14 flex-1 items-center justify-between gap-2 py-2 outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="min-w-0">
              <span className="block truncate text-base">{p.nome || 'Sem nome'}</span>
              {p.detalhe && <span className="block truncate text-sm text-muted-foreground">{p.detalhe}</span>}
            </span>
            <span className="flex items-center gap-2">
              <Badge variant={p.status === 'ativo' ? 'secondary' : 'outline'}>{NOMES_STATUS[p.status]}</Badge>
              <ChevronRight aria-hidden className="size-4 text-muted-foreground" />
            </span>
          </Link>
          {p.meuRascunho && <ApagarRascunho id={p.id} nome={p.nome} onApagado={onApagado} />}
        </li>
      ))}
    </ul>
  )
}

function ApagarRascunho({ id, nome, onApagado }: { id: string; nome: string; onApagado: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon-lg" aria-label={`Apagar ${nome || 'Rascunho sem nome'}`}>
          <Trash2 className="size-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Apagar {nome || 'este Rascunho'}?</AlertDialogTitle>
          <AlertDialogDescription>O Rascunho some de vez. Não dá para desfazer.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={async () => {
              try {
                await apagarRascunho({ data: { id } })
                onApagado()
              } catch (erro) {
                toast.error(erro instanceof Error ? erro.message : 'Não deu para apagar.')
              }
            }}
          >
            Apagar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
