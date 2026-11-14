import { Link } from '@tanstack/react-router'
import { Pencil } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { BotaoExcluirPersonagem } from '#/components/controles-ficha-personagem'
import { Badge } from '#/components/ui/badge'
import { Button } from '#/components/ui/button'
import type { StatusPersonagem, TipoPersonagem } from '#/domain/permissoes-ficha'
import { definirAtividadePersonagem, definirTipoPersonagem } from '#/server/personagens'

const NOMES_STATUS: Record<StatusPersonagem, string> = {
  rascunho: 'Rascunho',
  ativo: 'Ativo',
  arquivado: 'Rascunho',
}

export type ItemPersonagem = {
  id: string
  nome: string
  status: StatusPersonagem
  ativo?: boolean
  tipo?: TipoPersonagem
  /** Linha abaixo do nome, como o Jogador dono na lista do Narrador. */
  detalhe?: string
  /** Calculado pelo domínio (`permissoesPersonagem`). */
  podeApagar: boolean
}

/** Lista de Personagens com status, edição e exclusão de Rascunhos. */
export function ListaPersonagens({
  itens,
  onApagado,
  gerenciavel = false,
  onAlterado,
}: {
  itens: ItemPersonagem[]
  onApagado: () => void
  gerenciavel?: boolean
  onAlterado?: () => void
}) {
  return (
    <ul className="divide-y border-y">
      {itens.map((p) => (
        <li
          key={p.id}
          className="group -mx-2 flex min-h-14 items-center gap-2 rounded-md px-2 transition-colors hover:bg-secondary/40"
        >
          <span className="flex min-w-0 flex-1 flex-wrap items-center gap-2 py-2">
            <Link
              to="/personagens/$id"
              params={{ id: p.id }}
              className="min-w-0 rounded-xs outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="block truncate text-base font-medium transition-colors group-hover:text-vinho">
                {p.nome || 'Sem nome'}
              </span>
              {p.detalhe && <span className="block truncate text-sm text-muted-foreground">{p.detalhe}</span>}
            </Link>
            {gerenciavel && p.tipo ? (
              <BadgesPersonagem personagem={p} onAlterado={onAlterado ?? onApagado} />
            ) : (
              <Badge variant={p.status === 'ativo' ? 'secondary' : 'outline'}>{NOMES_STATUS[p.status]}</Badge>
            )}
          </span>
          {gerenciavel && (
            <span className="flex shrink-0 items-center gap-1">
              <Button asChild variant="ghost" size="icon" title="Editar Personagem">
                <Link to="/personagens/$id/editar" params={{ id: p.id }} aria-label={`Editar ${p.nome || 'Personagem sem nome'}`}>
                  <Pencil aria-hidden />
                </Link>
              </Button>
              <BotaoExcluirPersonagem
                id={p.id}
                nome={p.nome}
                rascunho={p.status === 'rascunho'}
                onExcluido={onApagado}
              />
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}

function BadgesPersonagem({ personagem: p, onAlterado }: { personagem: ItemPersonagem; onAlterado: () => void }) {
  const [ocupado, setOcupado] = useState(false)
  const ativo = p.ativo ?? p.status === 'ativo'

  async function alterar(acao: () => Promise<unknown>) {
    setOcupado(true)
    try {
      await acao()
      onAlterado()
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : 'Não deu para alterar o Personagem.')
    } finally {
      setOcupado(false)
    }
  }

  return (
    <span className="flex shrink-0 items-center gap-1">
      <Badge asChild variant={ativo ? 'secondary' : 'outline'}>
        <Button
          variant="ghost"
          size="sm"
          disabled={ocupado}
          aria-label={`${ativo ? 'Desativar' : 'Ativar'} ${p.nome || 'Personagem sem nome'}`}
          onClick={() => void alterar(() => definirAtividadePersonagem({ data: { id: p.id, ativo: !ativo } }))}
        >
          {ativo ? 'Ativo' : 'Rascunho'}
        </Button>
      </Badge>
      <Badge asChild variant={p.tipo === 'jogador' ? 'default' : 'outline'}>
        <Button
          variant="ghost"
          size="sm"
          disabled={ocupado}
          aria-label={`Marcar ${p.nome || 'Personagem sem nome'} como ${p.tipo === 'jogador' ? 'Não Jogador' : 'Jogador'}`}
          onClick={() => void alterar(() => definirTipoPersonagem({
            data: { id: p.id, tipo: p.tipo === 'jogador' ? 'nao_jogador' : 'jogador' },
          }))}
        >
          {p.tipo === 'jogador' ? 'Jogador' : 'Não Jogador'}
        </Button>
      </Badge>
    </span>
  )
}
