import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { z } from 'zod'

import { BarraApp } from '#/components/barra-app'
import { ConvitesCoteriePendentes } from '#/components/convites-coterie-pendentes'
import { FiltroCoterie } from '#/components/filtro-coterie'
import { PainelCard } from '#/components/painel-card'
import { listarConvitesCoterieDoJogador } from '#/server/coteries'
import { carregarPainelNarrador } from '#/server/paineis'

const searchSchema = z.object({
  coterie: z.string().optional(),
})

export const Route = createFileRoute('/')({
  validateSearch: searchSchema,
  beforeLoad: ({ context }) => {
    if (!context.usuario) throw redirect({ to: '/entrar' })
    return { usuario: context.usuario }
  },
  loader: async ({ context }) => {
    if (context.usuario.papel === 'narrador') {
      const painel = await carregarPainelNarrador()
      return { papel: 'narrador' as const, painel, convitesCoterie: [] }
    }

    const convitesCoterie = await listarConvitesCoterieDoJogador()
    return { papel: 'jogador' as const, painel: null, convitesCoterie }
  },
  component: Inicio,
})

function Inicio() {
  const { usuario } = Route.useRouteContext()
  const dados = Route.useLoaderData()
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const router = useRouter()

  if (dados.papel === 'narrador' && dados.painel) {
    const { coteries, personagensAtivos, pdnsFixados } = dados.painel
    const coterieSelecionada = search.coterie ?? null

    const ativosFiltrados = coterieSelecionada
      ? personagensAtivos.filter((p) => p.coterieIds.includes(coterieSelecionada))
      : personagensAtivos

    const pdnsFiltrados = coterieSelecionada
      ? pdnsFixados.filter((p) => p.coterieIds.includes(coterieSelecionada))
      : pdnsFixados

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

          <FiltroCoterie
            coteries={coteries}
            selecionada={coterieSelecionada}
            onSelecionar={(id) => navigate({ search: { coterie: id ?? undefined } })}
          />

          <section className="flex flex-col gap-3">
            <h2 className="font-serif text-2xl">Personagens Ativos</h2>
            {ativosFiltrados.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                {coterieSelecionada
                  ? 'Nenhum Personagem Ativo nesta Coterie.'
                  : 'Nenhum Personagem Ativo na Crônica ainda.'}
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {ativosFiltrados.map((p) => (
                  <PainelCard
                    key={p.id}
                    item={{
                      id: p.id,
                      nome: p.nome,
                      jogador: p.jogador,
                      coteries: p.coteries,
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

          {pdnsFiltrados.length > 0 && (
            <section className="flex flex-col gap-3 border-t pt-4">
              <h2 className="font-serif text-2xl">PdNs Fixados</h2>
              <div className="flex flex-col gap-3">
                {pdnsFiltrados.map((p) => (
                  <PainelCard
                    key={p.id}
                    item={{
                      id: p.id,
                      nome: p.nome,
                      jogador: 'PdN',
                      coteries: p.coteries,
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

  // Visão do Jogador
  const { convitesCoterie } = dados

  return (
    <main className="mx-auto min-h-dvh max-w-[1440px] px-4 min-[1472px]:px-0">
      <BarraApp />
      <div className="pt-2">
        <h1 className="font-serif text-display text-balance">Olá, {usuario.nome}</h1>
        <div className="mt-8 flex flex-col gap-8 pb-12">
          {convitesCoterie.length > 0 && (
            <section aria-labelledby="esperando-voce" className="flex flex-col gap-4">
              <h2 id="esperando-voce" className="font-serif text-2xl">
                Esperando você
              </h2>
              <ConvitesCoteriePendentes itens={convitesCoterie} onRespondido={() => router.invalidate()} />
            </section>
          )}

          <section className="flex flex-col gap-4">
            <h2 className="font-serif text-2xl">Personagens</h2>
            <p className="text-sm text-muted-foreground">
              O Narrador gerencia os Personagens e as Fichas da Crônica.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
