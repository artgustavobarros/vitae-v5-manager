import { createFileRoute, redirect, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'

import { BarraApp } from '#/components/barra-app'
import { Combobox } from '#/components/combobox'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '#/components/ui/card'
import { Label } from '#/components/ui/label'
import { Switch } from '#/components/ui/switch'
import {
  CLAS_PADRAO_CRONICA,
  IDADES_CRIACAO,
  type IdadeCriacao,
  type OpcoesCriacaoCronica,
} from '#/domain/cronica'
import { CLAS } from '#/domain/ficha'
import { atualizarOpcoesCriacaoCronica, obterOpcoesCriacaoCronica } from '#/server/cronica'

export const Route = createFileRoute('/narrador/cronica')({
  beforeLoad: ({ context }) => {
    if (context.usuario?.papel !== 'narrador') throw redirect({ to: '/' })
  },
  loader: async () => {
    const opcoes = await obterOpcoesCriacaoCronica()
    return { opcoes }
  },
  component: ConfiguracaoCronica,
})

const ROTULO_IDADE: Record<IdadeCriacao, string> = {
  neofito: 'Neófito (12ª ou 13ª Geração, Potência 1)',
  neonato: 'Neonato (12ª ou 13ª Geração, Potência 1)',
  ancillae: 'Ancillae (10ª ou 11ª Geração, Potência 2)',
}

function ConfiguracaoCronica() {
  const { opcoes: inicial } = Route.useLoaderData()
  const router = useRouter()
  const [opcoes, setOpcoes] = useState<OpcoesCriacaoCronica>(inicial)
  const [salvando, setSalvando] = useState(false)

  const clasDisponiveis = CLAS.filter((c) => CLAS_PADRAO_CRONICA.includes(c.id))

  function alternarCla(claId: string) {
    const atual = new Set(opcoes.clasPermitidos)
    if (atual.has(claId)) {
      if (atual.size <= 1) {
        toast.error('A Crônica precisa de ao menos um clã permitido.')
        return
      }
      atual.delete(claId)
    } else {
      atual.add(claId)
    }
    setOpcoes({ ...opcoes, clasPermitidos: Array.from(atual) })
  }

  async function salvar() {
    setSalvando(true)
    try {
      await atualizarOpcoesCriacaoCronica({ data: opcoes })
      await router.invalidate()
      toast.success('Opções da Crônica salvas com sucesso.')
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : 'Falha ao salvar opções da Crônica.')
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh max-w-3xl flex-col">
      <BarraApp />

      <main className="flex flex-1 flex-col gap-6 px-4 py-6">
        <div>
          <h1 className="font-serif text-2xl font-semibold">Configuração da Crônica</h1>
          <p className="text-sm text-muted-foreground">
            Defina as regras de criação de personagens para os Jogadores da mesa.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Idade Padrão</CardTitle>
            <CardDescription className="text-xs">
              Define a geração inicial e potência do sangue para novos personagens de jogadores.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Combobox
              opcoes={IDADES_CRIACAO.map((idade) => ({
                valor: idade,
                rotulo: ROTULO_IDADE[idade],
              }))}
              valor={opcoes.idadePadrao}
              onChange={(v) => setOpcoes({ ...opcoes, idadePadrao: v as IdadeCriacao })}
              busca="Buscar idade"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Sangue-Ralo e Caitiff</CardTitle>
            <CardDescription className="text-xs">
              Libere ou restrinja personagens sem clã ou mestiços de 14ª a 16ª geração.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex flex-col">
                <Label htmlFor="caitiff-switch" className="text-sm font-medium">
                  Permitir Caitiff (Sem Clã)
                </Label>
                <span className="text-xs text-muted-foreground">
                  Vampiros que não manifestam fraquezas ou disciplinas de linhagem.
                </span>
              </div>
              <Switch
                id="caitiff-switch"
                checked={opcoes.caitiffPermitido}
                onCheckedChange={(caitiffPermitido) => setOpcoes({ ...opcoes, caitiffPermitido })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <Label htmlFor="sangue-ralo-switch" className="text-sm font-medium">
                  Permitir Sangue-Ralo
                </Label>
                <span className="text-xs text-muted-foreground">
                  Mestiços da 14ª à 16ª geração com regras próprias de méritos e alquimia.
                </span>
              </div>
              <Switch
                id="sangue-ralo-switch"
                checked={opcoes.sangueRaloPermitido}
                onCheckedChange={(sangueRaloPermitido) => setOpcoes({ ...opcoes, sangueRaloPermitido })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">Clãs Permitidos</CardTitle>
            <CardDescription className="text-xs">
              Selecione quais clãs estarão disponíveis para escolha no wizard do Jogador.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {clasDisponiveis.map((cla) => {
              const ativo = opcoes.clasPermitidos.includes(cla.id)
              return (
                <div
                  key={cla.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <Label htmlFor={`cla-${cla.id}`} className="text-sm font-medium cursor-pointer">
                    {cla.nome}
                  </Label>
                  <Switch
                    id={`cla-${cla.id}`}
                    checked={ativo}
                    onCheckedChange={() => alternarCla(cla.id)}
                  />
                </div>
              )
            })}
          </CardContent>
        </Card>

        <div className="flex justify-end pt-2">
          <Button disabled={salvando} onClick={salvar}>
            Salvar Opções
          </Button>
        </div>
      </main>
    </div>
  )
}
