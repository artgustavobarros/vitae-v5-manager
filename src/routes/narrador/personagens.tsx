import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'

import { BarraApp } from '#/components/barra-app'
import { BotaoNovoPersonagem } from '#/components/botao-novo-personagem'
import { ListaPersonagens } from '#/components/lista-personagens'
import { listarTodosPersonagens } from '#/server/personagens'

export const Route = createFileRoute('/narrador/personagens')({
  beforeLoad: ({ context }) => {
    if (context.usuario?.papel !== 'narrador') throw redirect({ to: '/' })
  },
  loader: () => listarTodosPersonagens(),
  component: Personagens,
})

function Personagens() {
  const personagens = Route.useLoaderData()
  const router = useRouter()

  return (
    <main className="mx-auto min-h-dvh max-w-[1440px] px-4 min-[1472px]:px-0">
      <BarraApp />
      <div className="flex flex-col gap-4 pt-2 pb-12">
        <h1 className="font-serif text-display text-balance">Personagens</h1>
        <div>
          <BotaoNovoPersonagem rotulo="Novo PdN" />
        </div>
        {personagens.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhum Personagem na Crônica ainda.</p>
        ) : (
          <ListaPersonagens
            itens={personagens.map((p) => ({
              ...p,
              detalhe:
                p.jogador ??
                (p.atribuidoA
                  ? `Atribuído a ${p.atribuidoA} · esperando resposta`
                  : p.pdn
                    ? 'PdN'
                    : 'Rascunho do Narrador'),
            }))}
            onApagado={() => router.invalidate()}
          />
        )}
      </div>
    </main>
  )
}
