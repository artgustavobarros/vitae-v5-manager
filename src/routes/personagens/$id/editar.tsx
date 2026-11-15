import { createFileRoute, redirect, useNavigate, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'

import { BarraApp } from '#/components/barra-app'
import { BotaoExcluirPersonagem, SeletorAtividadePersonagem } from '#/components/controles-ficha-personagem'
import { FormularioFicha, type ValoresFormulario } from '#/components/ficha/formulario'
import { carregarEdicao } from '#/lib/carregar-edicao'
import { buscarFicha, salvarFicha } from '#/server/personagens'
import type { Ficha } from '#/domain/ficha'

export const Route = createFileRoute('/personagens/$id/editar')({
  beforeLoad: ({ context }) => {
    if (!context.usuario) throw redirect({ to: '/entrar' })
  },
  loader: async ({ params }) => {
    const carregamento = await carregarEdicao(
      () => buscarFicha({ data: { id: params.id } }),
    )
    if (carregamento.tipo === 'inexistente') throw redirect({ to: '/' })
    if (carregamento.tipo === 'semEdicao') throw redirect({ to: '/personagens/$id', params })
    return { personagem: carregamento.personagem }
  },
  component: EditarFicha,
})

function erroDoServidor(erro: unknown) {
  toast.error(erro instanceof Error ? erro.message : 'Não foi possível salvar a Ficha.')
}

function EditarFicha() {
  const { personagem } = Route.useLoaderData()
  const navigate = useNavigate()
  const router = useRouter()
  const [salvando, setSalvando] = useState(false)
  const id = personagem.id
  const rascunho = personagem.status === 'rascunho'
  const inicial = { nome: personagem.nome, jogadorNome: personagem.jogadorNome, ficha: personagem.ficha }

  async function salvar(valores: ValoresFormulario): Promise<Ficha | false> {
    setSalvando(true)
    try {
      const ficha = await salvarFicha({ data: { id, ...valores } })
      await router.invalidate()
      return ficha
    } catch (erro) {
      erroDoServidor(erro)
      return false
    } finally {
      setSalvando(false)
    }
  }

  return (
    <main className="mx-auto min-h-dvh max-w-[1440px] px-4 min-[1472px]:px-0">
      <BarraApp acoes={[{ rotulo: 'Voltar para a Ficha', link: { to: '/personagens/$id', params: { id } } }]} />
      <div className="pt-2">
        <div className="flex items-center justify-between gap-4">
          <h1 className="font-serif text-display text-balance">{personagem.nome || 'Novo Personagem'}</h1>
          <SeletorAtividadePersonagem
            id={id}
            ativo={!rascunho}
            onAlterado={() => router.invalidate()}
            className="w-40 shrink-0"
          />
        </div>
        <p className="mt-1 mb-8 text-sm text-muted-foreground">Editando a Ficha</p>
        <div className="pb-12">
          <FormularioFicha
            inicial={inicial}
            salvando={salvando}
            podeAlterarCla={personagem.podeAlterarCla}
            onSalvar={async (valores) => {
              if (await salvar(valores)) await navigate({ to: '/personagens/$id', params: { id } })
            }}
            acoes={
              <BotaoExcluirPersonagem
                id={id}
                nome={personagem.nome}
                rascunho={rascunho}
                comTexto
                onExcluido={() => navigate({ to: '/narrador/personagens' })}
              />
            }
          />
        </div>
      </div>
    </main>
  )
}
