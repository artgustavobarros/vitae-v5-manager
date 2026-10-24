import { useRef, useState, type ReactNode } from 'react'
import { toast } from 'sonner'

import { Badge } from '#/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { marcasDe, vitalidadeMax, vontadeMax, type Ficha, type Marcas } from '#/domain/ficha'
import type { AcessoFicha, StatusPersonagem } from '#/domain/permissoes-ficha'
import { marcar } from '#/server/personagens'

import { ListaTracos } from './atributos'
import { CabecalhoFicha } from './cabecalho-ficha'
import { HorizonteHumanidade, TrilhaDano, TrilhaFome } from './estado'
import { gruposAtributos, gruposHabilidades, ListaDisciplinas, nomeCla, nomeSeita, rotuloGeracao } from './tracos'

/** Linha do topo: "Clã · 12ª Geração · Potência do Sangue N", sem as partes vazias. */
function descricao(ficha: Ficha): string {
  const geracao = ficha.geracao === null ? '' : rotuloGeracao(ficha.geracao)
  return [nomeCla(ficha), geracao, `Potência do Sangue ${ficha.potenciaSangue}`].filter(Boolean).join(' · ')
}

/**
 * Tela da Ficha. Dano, Fome e Manchas são salvos no toque:
 * a marca aparece na hora e volta se o servidor recusar.
 */
export function FichaPersonagem({
  id,
  nome,
  status,
  ficha,
  acesso,
  barra,
}: {
  id: string
  nome: string
  status: StatusPersonagem
  ficha: Ficha
  acesso: AcessoFicha
  barra: ReactNode
}) {
  const [marcas, setMarcas] = useState(() => marcasDe(ficha))
  // Só a resposta do toque mais recente vale; as anteriores chegam desatualizadas.
  const ultimoToque = useRef(0)
  const podeMarcar = acesso === 'marcar' || acesso === 'editar'

  async function salvar(novas: Marcas) {
    const anteriores = marcas
    const toque = ++ultimoToque.current
    setMarcas(novas)
    try {
      const salvas = await marcar({ data: { id, marcas: novas } })
      if (toque === ultimoToque.current) setMarcas(salvas)
    } catch {
      if (toque === ultimoToque.current) setMarcas(anteriores)
      toast.error('Não deu para salvar a marca. Tente de novo.')
    }
  }

  const aoMarcar = <T,>(aplicar: (valor: T) => Marcas) =>
    podeMarcar ? (valor: T) => salvar(aplicar(valor)) : undefined

  const fichaAtual = { ...ficha, ...marcas }
  const campos = [
    { rotulo: 'Seita', valor: nomeSeita(ficha) },
    { rotulo: 'Senhor', valor: ficha.senhor },
    { rotulo: 'Ambição', valor: ficha.ambicao },
    { rotulo: 'Desejo', valor: ficha.desejo },
  ]

  return (
    <main className="min-h-dvh pb-12">
      <CabecalhoFicha
        barra={barra}
        nome={nome || 'Sem nome'}
        descricao={descricao(ficha)}
        fome={marcas.fome}
        selo={
          status === 'rascunho' && (
            <Badge variant="outline">{acesso === 'ler' ? 'Rascunho · só leitura' : 'Rascunho'}</Badge>
          )
        }
        horizonte={
          <HorizonteHumanidade
            trilha={{ humanidade: ficha.humanidade, manchas: marcas.manchas }}
            onChange={aoMarcar((t: { manchas: number }) => ({ ...marcas, manchas: t.manchas }))}
          />
        }
      >
        <TrilhaDano
          rotulo="Vitalidade"
          dano={marcas.danoVitalidade}
          max={vitalidadeMax(fichaAtual)}
          onChange={aoMarcar((dano: Marcas['danoVitalidade']) => ({ ...marcas, danoVitalidade: dano }))}
        />
        <TrilhaDano
          rotulo="Força de Vontade"
          dano={marcas.danoVontade}
          max={vontadeMax(fichaAtual)}
          onChange={aoMarcar((dano: Marcas['danoVontade']) => ({ ...marcas, danoVontade: dano }))}
        />
        <TrilhaFome fome={marcas.fome} onChange={aoMarcar((fome: number) => ({ ...marcas, fome }))} />
      </CabecalhoFicha>

      <div className="mx-auto max-w-3xl px-4">
        <Tabs defaultValue="atributos" className="mt-4">
          <TabsList variant="line" className="w-full justify-start gap-4 rounded-none border-b p-0">
            <TabsTrigger value="atributos" className="flex-none px-0 after:bg-vinho">Atributos</TabsTrigger>
            <TabsTrigger value="habilidades" className="flex-none px-0 after:bg-vinho">Habilidades</TabsTrigger>
            <TabsTrigger value="disciplinas" className="flex-none px-0 after:bg-vinho">Disciplinas</TabsTrigger>
            <TabsTrigger value="personagem" className="flex-none px-0 after:bg-vinho">Personagem</TabsTrigger>
          </TabsList>
          <TabsContent value="atributos">
            <ListaTracos grupos={gruposAtributos(ficha)} />
          </TabsContent>
          <TabsContent value="habilidades">
            <ListaTracos grupos={gruposHabilidades(ficha)} />
          </TabsContent>
          <TabsContent value="disciplinas" className="mt-4">
            <ListaDisciplinas ficha={ficha} />
          </TabsContent>
          <TabsContent value="personagem">
            <dl className="mt-4">
              {campos.map((c) => (
                <div key={c.rotulo} className="border-b py-2">
                  <dt className="text-sm text-muted-foreground">{c.rotulo}</dt>
                  <dd className="text-base">{c.valor || '—'}</dd>
                </div>
              ))}
            </dl>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
