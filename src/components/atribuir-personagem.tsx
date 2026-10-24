import { useState } from 'react'
import { toast } from 'sonner'

import { Alert, AlertDescription } from '#/components/ui/alert'
import { Button } from '#/components/ui/button'
import { Label } from '#/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '#/components/ui/select'
import { atribuir, cancelarAtribuicao } from '#/server/personagens'

function mensagem(erro: unknown, padrao: string) {
  return erro instanceof Error ? erro.message : padrao
}

/** Topo do wizard do Narrador enquanto o Jogador não responde. */
export function AvisoAtribuicao({
  id,
  jogador,
  onCancelado,
}: {
  id: string
  jogador: string
  onCancelado: () => void
}) {
  const [cancelando, setCancelando] = useState(false)

  return (
    <Alert className="mb-8 border-vinho/45 bg-vinho/15">
      <AlertDescription className="flex flex-col gap-2 text-foreground">
        <span>
          <strong className="font-semibold">Atribuído a {jogador}</strong> · esperando resposta. Você pode continuar
          editando; o Jogador vê a versão atual.
        </span>
        <Button
          variant="secondary"
          size="sm"
          className="self-start"
          disabled={cancelando}
          onClick={async () => {
            setCancelando(true)
            try {
              await cancelarAtribuicao({ data: { id } })
              toast.success('Atribuição cancelada.')
              onCancelado()
            } catch (erro) {
              toast.error(mensagem(erro, 'Não deu para cancelar a atribuição.'))
            } finally {
              setCancelando(false)
            }
          }}
        >
          Cancelar atribuição
        </Button>
      </AlertDescription>
    </Alert>
  )
}

/** Na Revisão do Narrador: entregar o Rascunho a um Jogador em vez de concluir como PdN. */
export function AtribuirPersonagem({
  id,
  jogadores,
  onAtribuido,
}: {
  id: string
  jogadores: { id: string; nome: string }[]
  onAtribuido: (jogador: string) => void
}) {
  const [jogadorId, setJogadorId] = useState('')
  const [enviando, setEnviando] = useState(false)

  return (
    <section className="flex flex-col gap-4 border-t pt-4">
      <h3 className="text-base font-semibold">Atribuir a um Jogador</h3>
      <p className="text-sm text-muted-foreground">
        O Jogador recebe este Rascunho em Meus Personagens e aceita ou recusa. Se aceitar, o Rascunho passa a ser
        dele.
      </p>
      {jogadores.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nenhum Jogador na Crônica ainda.</p>
      ) : (
        <div className="flex items-end gap-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="jogador-atribuido">Jogador</Label>
            <Select value={jogadorId} onValueChange={setJogadorId}>
              <SelectTrigger id="jogador-atribuido" className="w-full">
                <SelectValue placeholder="Escolha um Jogador" />
              </SelectTrigger>
              <SelectContent>
                {jogadores.map((j) => (
                  <SelectItem key={j.id} value={j.id}>
                    {j.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            variant="secondary"
            disabled={!jogadorId || enviando}
            onClick={async () => {
              setEnviando(true)
              try {
                await atribuir({ data: { id, jogadorId } })
                onAtribuido(jogadores.find((j) => j.id === jogadorId)?.nome ?? 'o Jogador')
              } catch (erro) {
                toast.error(mensagem(erro, 'Não deu para atribuir.'))
                setEnviando(false)
              }
            }}
          >
            Atribuir
          </Button>
        </div>
      )}
    </section>
  )
}
