import { useNavigate } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '#/components/ui/button'
import { criarRascunho } from '#/server/personagens'

/** Cria um Rascunho com os valores do Neófito e abre o formulário manual. */
export function BotaoNovoPersonagem({ rotulo }: { rotulo: string }) {
  const navigate = useNavigate()
  const [criando, setCriando] = useState(false)

  return (
    <Button
      disabled={criando}
      onClick={async () => {
        setCriando(true)
        try {
          const { id } = await criarRascunho()
          await navigate({ to: '/personagens/$id/editar', params: { id } })
        } catch {
          toast.error('Não deu para criar o Personagem. Tente de novo.')
          setCriando(false)
        }
      }}
    >
      <Plus aria-hidden />
      {rotulo}
    </Button>
  )
}
