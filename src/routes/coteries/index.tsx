import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'

import { BarraApp } from '#/components/barra-app'
import { FiltroCoterie } from '#/components/filtro-coterie'
import { PainelCard } from '#/components/painel-card'
import { carregarTelaCoteries } from '#/server/paineis'

const searchSchema = z.object({
  coterie: z.string().optional(),
})

export const Route = createFileRoute('/coteries/')({
  validateSearch: searchSchema,
  beforeLoad: ({ context }) => {
    if (!context.usuario) throw redirect({ to: '/entrar' })
    return { usuario: context.usuario }
  },
  loader: async () => carregarTelaCoteries(),
  component: TelaCoteriesJogador,
})

function TelaCoteriesJogador() {
  const { coteries, membros } = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()

  const coterieSelecionada = search.coterie ?? null

  const membrosFiltrados = coterieSelecionada
    ? membros.filter((m) => m.coterieIds.includes(coterieSelecionada))
    : membros

  return (
    <main className="mx-auto min-h-dvh max-w-[1440px] px-4 min-[1472px]:px-0">
      <BarraApp />
      <div className="flex flex-col gap-6 pt-2 pb-12">
        <div className="flex flex-col gap-1">
          <h1 className="font-serif text-display text-balance">Coteries</h1>
          <p className="text-sm text-muted-foreground">
            Membros que compartilham ao menos uma Coterie com seus Personagens.
          </p>
        </div>

        <FiltroCoterie
          coteries={coteries}
          selecionada={coterieSelecionada}
          onSelecionar={(id) =>
            navigate({
              search: (antigo) => ({ ...antigo, coterie: id ?? undefined }),
            })
          }
        />

        {coteries.length === 0 ? (
          <p className="py-8 text-sm text-muted-foreground">
            Você ainda não faz parte de nenhuma Coterie. Quando o Narrador convidar seu Personagem, o convite aparecerá no início da página.
          </p>
        ) : membrosFiltrados.length === 0 ? (
          <p className="py-8 text-sm text-muted-foreground">
            Nenhum membro encontrado nesta Coterie.
          </p>
        ) : (
          <div className="flex flex-col gap-3">
            {membrosFiltrados.map((m) => (
              <PainelCard
                key={m.id}
                item={{
                  id: m.id,
                  nome: m.nome,
                  jogador: m.jogador,
                  coteries: m.coteriesEmComum,
                  ehMeu: m.ehMeu,
                  compartilhaCondicao: m.compartilhaCondicao,
                  condicao: m.condicao,
                }}
                editavel={m.ehMeu}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
