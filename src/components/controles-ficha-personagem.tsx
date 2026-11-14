import { Link } from '@tanstack/react-router'
import { Pencil, Power, PowerOff, Trash2 } from 'lucide-react'
import { useState } from 'react'
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
import { Button } from '#/components/ui/button'
import { Combobox } from '#/components/combobox'
import { apagarPersonagem, definirAtividadePersonagem } from '#/server/personagens'

const OPCOES_ATIVIDADE = [
  { valor: 'ativo', rotulo: 'Ativo' },
  { valor: 'rascunho', rotulo: 'Rascunho' },
]

/** Seletor Ativo/Rascunho para o topo da tela de edição; mesma troca de atividade dos Controles da Ficha. */
export function SeletorAtividadePersonagem({
  id,
  ativo,
  onAlterado,
  className,
}: {
  id: string
  ativo: boolean
  onAlterado: () => void
  className?: string
}) {
  const [ocupado, setOcupado] = useState(false)

  async function escolher(valorEscolhido: string) {
    const novoAtivo = valorEscolhido === 'ativo'
    if (novoAtivo === ativo) return
    setOcupado(true)
    try {
      await definirAtividadePersonagem({ data: { id, ativo: novoAtivo } })
      toast.success(novoAtivo ? 'Personagem ativado' : 'Personagem virou Rascunho')
      onAlterado()
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : 'Não deu para alterar o Personagem.')
    } finally {
      setOcupado(false)
    }
  }

  return (
    <Combobox
      rotulo="Atividade do Personagem"
      opcoes={OPCOES_ATIVIDADE}
      valor={ativo ? 'ativo' : 'rascunho'}
      onChange={(v) => void escolher(v)}
      disabled={ocupado}
      mostrarDescricao={false}
      className={className}
    />
  )
}

export function ControlesFichaPersonagem({
  id,
  nome,
  ativo,
  rascunho,
  onAlterado,
  onExcluido,
}: {
  id: string
  nome: string
  ativo: boolean
  rascunho: boolean
  onAlterado: () => void
  onExcluido: () => void
}) {
  const [ocupado, setOcupado] = useState(false)
  const nomeExibido = nome || 'Personagem sem nome'

  async function alternarAtividade() {
    setOcupado(true)
    try {
      await definirAtividadePersonagem({ data: { id, ativo: !ativo } })
      toast.success(ativo ? 'Personagem desativado' : 'Personagem ativado')
      onAlterado()
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : 'Não deu para alterar o Personagem.')
    } finally {
      setOcupado(false)
    }
  }

  return (
    <div aria-label="Ações do Personagem" className="flex items-center gap-1">
      <Button asChild variant="outline" size="icon" title="Editar Personagem">
        <Link to="/personagens/$id/editar" params={{ id }} aria-label={`Editar ${nomeExibido}`}>
          <Pencil aria-hidden />
        </Link>
      </Button>
      <Button
        variant={ativo ? 'secondary' : 'outline'}
        size="icon"
        disabled={ocupado}
        title={ativo ? 'Desativar Personagem' : 'Ativar Personagem'}
        aria-label={`${ativo ? 'Desativar' : 'Ativar'} ${nomeExibido}`}
        onClick={() => void alternarAtividade()}
      >
        {ativo ? <PowerOff aria-hidden /> : <Power aria-hidden />}
      </Button>
      <BotaoExcluirPersonagem id={id} nome={nome} rascunho={rascunho} onExcluido={onExcluido} />
    </div>
  )
}

export function BotaoExcluirPersonagem({
  id,
  nome,
  rascunho,
  onExcluido,
  comTexto = false,
}: {
  id: string
  nome: string
  rascunho: boolean
  onExcluido: () => void
  /** Mostra o texto "Excluir Personagem" ao lado do ícone; padrão só o ícone. */
  comTexto?: boolean
}) {
  const [ocupado, setOcupado] = useState(false)
  const [confirmando, setConfirmando] = useState(false)
  const nomeExibido = nome || 'Personagem sem nome'

  async function excluir() {
    setOcupado(true)
    try {
      await apagarPersonagem({ data: { id } })
      toast.success('Personagem excluído')
      onExcluido()
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : 'Não deu para excluir o Personagem.')
      setOcupado(false)
    }
  }

  return (
    <AlertDialog
      open={confirmando}
      onOpenChange={(aberto) => {
        if (aberto && !rascunho) {
          toast.error('Só Rascunhos podem ser excluídos. Desative o Personagem primeiro.')
          return
        }
        setConfirmando(aberto)
      }}
    >
      <AlertDialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size={comTexto ? 'default' : 'icon'}
          disabled={ocupado}
          aria-disabled={!rascunho}
          title="Excluir Personagem"
          aria-label={`Excluir ${nomeExibido}`}
          className="text-destructive hover:bg-destructive/10 hover:text-destructive aria-disabled:cursor-not-allowed aria-disabled:opacity-50"
        >
          <Trash2 aria-hidden />
          {comTexto && 'Excluir Personagem'}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir {nomeExibido}?</AlertDialogTitle>
          <AlertDialogDescription>
            A Ficha e os vínculos deste Personagem serão apagados. Não dá para desfazer.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={() => void excluir()}>
            Excluir Personagem
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
