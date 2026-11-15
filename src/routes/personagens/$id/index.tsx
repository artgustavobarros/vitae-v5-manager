import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { toast } from 'sonner'

import { BarraApp } from '#/components/barra-app'
import { ControlesFichaPersonagem } from '#/components/controles-ficha-personagem'
import { FichaPersonagem } from '#/components/ficha/ficha'
import type { AcaoTela } from '#/components/navegacao'
import { Button } from '#/components/ui/button'
import { alternarFixarPdn, buscarFicha } from '#/server/personagens'

export const Route = createFileRoute('/personagens/$id/')({
  beforeLoad: ({ context }) => {
    if (!context.usuario) throw redirect({ to: '/entrar' })
    return { usuario: context.usuario }
  },
  loader: async ({ params }) => {
    try {
      return await buscarFicha({ data: { id: params.id } })
    } catch {
      throw redirect({ to: '/' })
    }
  },
  component: TelaFicha,
})

function TelaFicha() {
  const { usuario } = Route.useRouteContext()
  const personagem = Route.useLoaderData()
  const router = useRouter()

  const ehPdnAtivo = usuario.papel === 'narrador' && personagem.pdn && personagem.status === 'ativo'

  async function alternarFixacao() {
    try {
      await alternarFixarPdn({
        data: { id: personagem.id, fixado: !personagem.fixado },
      })
      toast.success(personagem.fixado ? 'PdN desafixado do Painel' : 'PdN fixado no Painel')
      router.invalidate()
    } catch {
      toast.error('Não foi possível alterar a fixação do PdN.')
    }
  }

  const acoes: AcaoTela[] = [{
    rotulo: 'Paradas',
    link: { to: '/paradas' },
  }]
  return (
    <FichaPersonagem
      // Trocar de Personagem reinicia a tela; atualizações remotas preservam as marcas pendentes.
      key={personagem.id}
      {...personagem}
      papelUsuario={usuario.papel}
      barra={
        <div className="flex flex-col">
          <BarraApp acoes={acoes} />
          {usuario.papel === 'narrador' && (
            <div className="flex justify-end gap-2 pt-1">
              <ControlesFichaPersonagem
                id={personagem.id}
                nome={personagem.nome}
                ativo={personagem.status === 'ativo'}
                rascunho={personagem.status === 'rascunho'}
                onAlterado={() => router.invalidate()}
                onExcluido={() => router.navigate({ to: '/narrador/personagens' })}
              />
              {ehPdnAtivo && (
                <Button
                  variant={personagem.fixado ? 'secondary' : 'outline'}
                  size="sm"
                  onClick={alternarFixacao}
                >
                  {personagem.fixado ? 'Desafixar do Painel' : 'Fixar no Painel'}
                </Button>
              )}
            </div>
          )}
        </div>
      }
    />
  )
}
