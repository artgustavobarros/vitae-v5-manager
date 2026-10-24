import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '#/components/ui/button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '#/components/ui/card'
import { responderAtribuicao } from '#/server/personagens'

/** "Esperando você": Rascunhos que o Narrador atribuiu ao Jogador, com Ver Ficha, Recusar e Aceitar. */
export function PersonagensAtribuidos({
  itens,
  onRespondido,
}: {
  itens: { id: string; nome: string }[]
  onRespondido: () => void
}) {
  if (itens.length === 0) return null

  return (
    <section aria-labelledby="esperando-voce" className="flex flex-col gap-4">
      <h2 id="esperando-voce" className="font-serif text-2xl">
        Esperando você
      </h2>
      {itens.map((p) => (
        <CartaoAtribuido key={p.id} {...p} onRespondido={onRespondido} />
      ))}
    </section>
  )
}

function CartaoAtribuido({ id, nome, onRespondido }: { id: string; nome: string; onRespondido: () => void }) {
  const [respondendo, setRespondendo] = useState(false)
  const rotulo = nome || 'Personagem sem nome'

  async function responder(aceitar: boolean) {
    setRespondendo(true)
    try {
      await responderAtribuicao({ data: { id, aceitar } })
      toast.success(aceitar ? `${rotulo} agora é seu Rascunho.` : `Você recusou ${rotulo}.`)
      onRespondido()
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : 'Não deu para responder. Tente de novo.')
      setRespondendo(false)
    }
  }

  return (
    <Card className="gap-4 py-4">
      <CardHeader className="px-4">
        <CardTitle className="text-base">{rotulo}</CardTitle>
        <CardDescription>O Narrador atribuiu este Personagem a você.</CardDescription>
      </CardHeader>
      <CardFooter className="flex-wrap gap-2 px-4">
        <Button asChild variant="ghost" size="sm" className="-ml-3 mr-auto">
          <Link to="/personagens/$id" params={{ id }}>
            Ver Ficha
          </Link>
        </Button>
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
