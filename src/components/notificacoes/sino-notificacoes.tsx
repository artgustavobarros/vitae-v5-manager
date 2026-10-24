import { Link, type LinkOptions } from '@tanstack/react-router'
import { Bell } from 'lucide-react'
import { useState, type ReactNode } from 'react'

import { Button } from '#/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '#/components/ui/popover'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '#/components/ui/sheet'
import { tempoRelativo } from '#/lib/tempo-relativo'
import { useMediaQuery } from '#/lib/use-media-query'

export type Notificacao = {
  id: string
  texto: string
  quando: Date
  lida: boolean
  /** O que mudou: a Ficha, a Coterie. */
  destino?: LinkOptions
}

/**
 * Sino da barra do topo com o número de não lidas.
 * Abre uma folha que sobe de baixo no celular e um popover no computador.
 */
export function SinoNotificacoes({
  notificacoes,
  onMarcarLidas,
  rodape,
}: {
  notificacoes: Notificacao[]
  onMarcarLidas: () => void
  rodape?: ReactNode
}) {
  const [aberto, setAberto] = useState(false)
  const computador = useMediaQuery('(min-width: 768px)')
  const naoLidas = notificacoes.filter((n) => !n.lida).length

  const gatilho = (
    <Button
      variant="ghost"
      size="icon-lg"
      className="relative size-12"
      aria-label={naoLidas > 0 ? `Notificações, ${naoLidas} não lidas` : 'Notificações'}
    >
      <Bell className="size-5" />
      {naoLidas > 0 && (
        <span
          aria-hidden
          className="absolute top-2 right-2 grid size-4 place-items-center rounded-full bg-vinho text-xs font-semibold text-primary-foreground tabular-nums"
        >
          {Math.min(naoLidas, 9)}
        </span>
      )}
    </Button>
  )

  const lista = (
    <ListaNotificacoes notificacoes={notificacoes} onEscolher={() => setAberto(false)} />
  )
  const marcar = (
    <Button variant="ghost" size="sm" disabled={naoLidas === 0} onClick={onMarcarLidas}>
      Marcar como lidas
    </Button>
  )

  if (computador) {
    return (
      <Popover open={aberto} onOpenChange={setAberto}>
        <PopoverTrigger asChild>{gatilho}</PopoverTrigger>
        <PopoverContent align="end" className="w-80 p-0">
          <div className="flex h-12 items-center justify-between border-b pr-2 pl-4">
            <h2 className="text-sm font-semibold">Notificações</h2>
            {marcar}
          </div>
          <div className="max-h-96 overflow-y-auto px-4">{lista}</div>
          {rodape && <div className="border-t p-2">{rodape}</div>}
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Sheet open={aberto} onOpenChange={setAberto}>
      <SheetTrigger asChild>{gatilho}</SheetTrigger>
      <SheetContent side="bottom" className="max-h-dvh gap-0 rounded-t-xl">
        <SheetHeader className="flex-row items-center justify-between border-b py-2 pr-12">
          <SheetTitle className="text-base">Notificações</SheetTitle>
          <SheetDescription className="sr-only">Avisos da Crônica para você</SheetDescription>
          {marcar}
        </SheetHeader>
        <div className="max-h-96 overflow-y-auto px-4">{lista}</div>
        {rodape && <div className="border-t p-4">{rodape}</div>}
      </SheetContent>
    </Sheet>
  )
}

function ListaNotificacoes({
  notificacoes,
  onEscolher,
}: {
  notificacoes: Notificacao[]
  onEscolher: () => void
}) {
  if (notificacoes.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">Nenhuma notificação ainda.</p>
  }

  return (
    <ul className="divide-y">
      {notificacoes.map((n) => {
        const conteudo = (
          <>
            <span
              aria-hidden
              className={n.lida ? 'mt-2 size-2 shrink-0' : 'mt-2 size-2 shrink-0 rounded-full bg-vinho'}
            />
            <span className="min-w-0">
              <span className={n.lida ? 'block text-sm text-muted-foreground' : 'block text-sm'}>
                {n.lida ? n.texto : <strong className="font-semibold">{n.texto}</strong>}
              </span>
              <span className="block text-xs text-muted-foreground">
                {tempoRelativo(n.quando)}
                {!n.lida && <span className="sr-only"> · não lida</span>}
              </span>
            </span>
          </>
        )
        const classe =
          'flex min-h-14 gap-4 py-2 outline-none focus-visible:ring-2 focus-visible:ring-ring'
        return (
          <li key={n.id}>
            {n.destino ? (
              <Link {...n.destino} onClick={onEscolher} className={classe}>
                {conteudo}
              </Link>
            ) : (
              <div className={classe}>{conteudo}</div>
            )}
          </li>
        )
      })}
    </ul>
  )
}
