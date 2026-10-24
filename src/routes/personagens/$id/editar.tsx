import { createFileRoute, redirect, useNavigate, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { z } from 'zod'

import { AtribuirPersonagem, AvisoAtribuicao } from '#/components/atribuir-personagem'
import { BarraApp } from '#/components/barra-app'
import { FormularioFicha, type ValoresFormulario } from '#/components/ficha/formulario'
import { ETAPAS, WizardCriacao } from '#/components/ficha/wizard'
import { listarJogadores } from '#/server/conta'
import { buscarFicha, concluir, salvarFicha } from '#/server/personagens'

// Rascunho: wizard em etapas. Ficha concluída: formulário inteiro numa página.
// Os dois são provisórios, sem regras do V5, até a criação guiada (fatia 5).
export const Route = createFileRoute('/personagens/$id/editar')({
  validateSearch: z.object({ etapa: z.int().min(1).max(ETAPAS.length).optional().catch(undefined) }),
  beforeLoad: ({ context }) => {
    if (!context.usuario) throw redirect({ to: '/entrar' })
  },
  loader: async ({ params }) => {
    const personagem = await buscarFicha({ data: { id: params.id } }).catch(() => null)
    if (!personagem) throw redirect({ to: '/' })
    if (personagem.acesso !== 'editar') throw redirect({ to: '/personagens/$id', params })
    // Rascunho do Narrador: ele pode atribuí-lo a um Jogador na Revisão.
    const jogadores = personagem.podeAtribuir ? await listarJogadores() : []
    return { personagem, jogadores }
  },
  component: EditarFicha,
})

function erroDoServidor(erro: unknown) {
  toast.error(erro instanceof Error ? erro.message : 'Não foi possível salvar a Ficha.')
}

function EditarFicha() {
  const { personagem, jogadores } = Route.useLoaderData()
  const { etapa = 1 } = Route.useSearch()
  const navigate = useNavigate()
  const router = useRouter()
  const [salvando, setSalvando] = useState(false)
  const id = personagem.id
  const rascunho = personagem.status === 'rascunho'
  const inicial = { nome: personagem.nome, ficha: personagem.ficha }

  async function salvar(valores: ValoresFormulario): Promise<boolean> {
    setSalvando(true)
    try {
      await salvarFicha({ data: { id, ...valores } })
      // Recarrega o título com o nome salvo; o estado do wizard continua montado.
      await router.invalidate()
      return true
    } catch (erro) {
      erroDoServidor(erro)
      return false
    } finally {
      setSalvando(false)
    }
  }

  async function salvarEConcluir(valores: ValoresFormulario) {
    if (!(await salvar(valores))) return
    setSalvando(true)
    try {
      await concluir({ data: { id } })
      await navigate({ to: '/personagens/$id', params: { id } })
    } catch (erro) {
      erroDoServidor(erro)
      setSalvando(false)
    }
  }

  return (
    <main className="mx-auto min-h-dvh max-w-3xl">
      <BarraApp
        acoes={rascunho ? [] : [{ rotulo: 'Voltar para a Ficha', link: { to: '/personagens/$id', params: { id } } }]}
      />
      <div className="px-4 pt-2">
        <h1 className="font-serif text-display text-balance">{personagem.nome || 'Novo Personagem'}</h1>
        <p className="mt-1 mb-8 text-sm text-muted-foreground">
          {rascunho ? 'Rascunho' : 'Editando a Ficha'} · provisório, sem as regras de criação do V5
        </p>
        {personagem.podeCancelarAtribuicao && personagem.atribuidoA && (
          <AvisoAtribuicao id={id} jogador={personagem.atribuidoA.nome} onCancelado={() => router.invalidate()} />
        )}
        {personagem.abreNoWizard ? (
          <WizardCriacao
            inicial={inicial}
            etapa={etapa}
            salvando={salvando}
            onIrPara={(destino) => navigate({ to: '.', search: { etapa: destino } })}
            onSalvar={salvar}
            onConcluir={salvarEConcluir}
            concluirBloqueado={!personagem.podeConcluir}
            regrasCriacao={personagem.regrasCriacao}
            extraRevisao={
              personagem.podeAtribuir && (
                <AtribuirPersonagem
                  id={id}
                  jogadores={jogadores}
                  onAtribuido={async (jogador) => {
                    toast.success(`Atribuído a ${jogador}. Agora é esperar a resposta.`)
                    await navigate({ to: '/narrador/personagens' })
                  }}
                />
              )
            }
          />
        ) : (
          <div className="pb-12">
            <FormularioFicha
              inicial={inicial}
              salvando={salvando}
              onSalvar={async (valores) => {
                if (await salvar(valores)) await navigate({ to: '/personagens/$id', params: { id } })
              }}
            />
          </div>
        )}
      </div>
    </main>
  )
}
