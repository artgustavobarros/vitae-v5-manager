import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '#/components/ui/button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '#/components/ui/card'
import { responderConviteCoterie } from '#/server/coteries'

export type ItemConviteCoterie = {
  conviteId: string
  coterieId: string
  nomeCoterie: string
  personagemId: string
  nomePersonagem: string
}

export function ConvitesCoteriePendentes({
  itens,
  onRespondido,
}: {
  itens: ItemConviteCoterie[]
  onRespondido: () => void
}) {
  if (itens.length === 0) return null

  return (
    <div className="flex flex-col gap-4">
      {itens.map((c) => (
        <CartaoConviteCoterie key={c.conviteId} convite={c} onRespondido={onRespondido} />
      ))}
    </div>
  )
}

function CartaoConviteCoterie({
  convite,
  onRespondido,
}: {
  convite: ItemConviteCoterie
  onRespondido: () => void
}) {
  const navigate = useNavigate()
  const [respondendo, setRespondendo] = useState(false)

  async function responder(aceitar: boolean) {
    setRespondendo(true)
    try {
      await responderConviteCoterie({ data: { conviteId: convite.conviteId, aceitar } })
      toast.success(
        aceitar
          ? `${convite.nomePersonagem} agora faz parte de ${convite.nomeCoterie}.`
          : `Você recusou o convite para ${convite.nomeCoterie}.`,
      )
      // Quem aceita já vai conhecer a Coterie; quem recusa continua na home.
      if (aceitar) await navigate({ to: '/coteries/$id', params: { id: convite.coterieId } })
      else onRespondido()
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : 'Não deu para responder. Tente de novo.')
      setRespondendo(false)
    }
  }

  return (
    <Card className="gap-4 py-4">
      <CardHeader className="px-4">
        <CardTitle className="text-base">{convite.nomeCoterie}</CardTitle>
        <CardDescription>
          Convite para <strong className="font-semibold text-foreground">{convite.nomePersonagem}</strong> entrar nesta Coterie.
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-end gap-2 px-4">
        <Button variant="secondary" size="sm" disabled={respondendo} onClick={() => responder(false)}>
          Recusar
        </Button>
        <Button size="sm" disabled={respondendo} onClick={() => responder(true)}>
          Aceitar
        </Button>
      </CardFooter>
    </Card>
  )
}
