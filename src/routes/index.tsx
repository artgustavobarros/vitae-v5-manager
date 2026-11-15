import { createFileRoute, redirect } from '@tanstack/react-router'

import { BarraApp } from '#/components/barra-app'
import { PainelCard } from '#/components/painel-card'
import { carregarPainelNarrador } from '#/server/paineis'

export const Route = createFileRoute('/')({
  beforeLoad: ({ context }) => {
    if (!context.usuario) throw redirect({ to: '/entrar' })
    return { usuario: context.usuario }
  },
  loader: () => carregarPainelNarrador(),
  component: Inicio,
})

function Inicio() {
  const dados = Route.useLoaderData()
  const { personagensAtivos, pdnsFixados } = dados

  return (
    <main className="mx-auto min-h-dvh max-w-[1440px] px-4 min-[1472px]:px-0">
      <BarraApp />
      <div className="flex flex-col gap-6 pt-2 pb-12">
        <div className="flex flex-col gap-1">
          <h1 className="font-serif text-display text-balance">Painel</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhamento em tempo real dos Personagens e PdNs da Crônica.
          </p>
        </div>

        <section className="flex flex-col gap-3">
          <h2 className="font-serif text-2xl">Personagens Ativos</h2>
          {personagensAtivos.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhum Personagem Ativo na Crônica ainda.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {personagensAtivos.map((p) => (
                <PainelCard
                  key={p.id}
                  item={{
                    id: p.id,
                    nome: p.nome,
                    jogador: p.jogador,
                    condicao: p.condicao,
                    humanidade: p.humanidade,
                    manchas: p.manchas,
                  }}
                  editavel
                />
              ))}
            </div>
          )}
        </section>

        {pdnsFixados.length > 0 && (
          <section className="flex flex-col gap-3 border-t pt-4">
            <h2 className="font-serif text-2xl">PdNs Fixados</h2>
            <div className="flex flex-col gap-3">
              {pdnsFixados.map((p) => (
                <PainelCard
                  key={p.id}
                  item={{
                    id: p.id,
                    nome: p.nome,
                    jogador: 'PdN',
                    condicao: p.condicao,
                    humanidade: p.humanidade,
                    manchas: p.manchas,
                  }}
                  editavel
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
