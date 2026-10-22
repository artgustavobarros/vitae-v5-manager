import { createFileRoute, notFound } from '@tanstack/react-router'
import { useState } from 'react'

import { BarraApp } from '#/components/barra-app'
import { ListaTracos, type GrupoTracos } from '#/components/ficha/atributos'
import { CabecalhoFicha } from '#/components/ficha/cabecalho-ficha'
import { HorizonteHumanidade, TrilhaDano, TrilhaFome } from '#/components/ficha/estado'
import { Pontos } from '#/components/ficha/marcadores'
import { Alert, AlertDescription } from '#/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'

// Ficha de demonstração para validar o layout antes da fatia 2. Só existe em `pnpm dev`.
export const Route = createFileRoute('/demo/ficha')({
  beforeLoad: () => {
    if (!import.meta.env.DEV) throw notFound()
  },
  component: FichaDemo,
})

const ATRIBUTOS: GrupoTracos[] = [
  { titulo: 'Físicos', tracos: [{ nome: 'Força', valor: 2 }, { nome: 'Destreza', valor: 3 }, { nome: 'Vigor', valor: 3 }] },
  { titulo: 'Sociais', tracos: [{ nome: 'Carisma', valor: 4 }, { nome: 'Manipulação', valor: 2 }, { nome: 'Autocontrole', valor: 2 }] },
  { titulo: 'Mentais', tracos: [{ nome: 'Inteligência', valor: 2 }, { nome: 'Raciocínio', valor: 3 }, { nome: 'Determinação', valor: 3 }] },
]

const HABILIDADES: GrupoTracos[] = [
  { titulo: 'Físicas', tracos: [{ nome: 'Armas Brancas', valor: 1 }, { nome: 'Esportes', valor: 2 }, { nome: 'Furtividade', valor: 2 }] },
  { titulo: 'Sociais', tracos: [{ nome: 'Etiqueta', valor: 3 }, { nome: 'Performance', valor: 3 }, { nome: 'Persuasão', valor: 2 }] },
  { titulo: 'Mentais', tracos: [{ nome: 'Consciência', valor: 2 }, { nome: 'Investigação', valor: 1 }, { nome: 'Política', valor: 1 }] },
]

const DISCIPLINAS = [
  { nome: 'Auspícios', valor: 2, poderes: ['Sentidos Aguçados', 'Premonição'] },
  { nome: 'Presença', valor: 1, poderes: ['Fascínio'] },
  { nome: 'Rapidez', valor: 1, poderes: ['Graça Felina'] },
]

function FichaDemo() {
  const [vitalidade, setVitalidade] = useState({ superficial: 2, agravado: 1 })
  const [vontade, setVontade] = useState({ superficial: 1, agravado: 0 })
  const [fome, setFome] = useState(3)
  const [humanidade, setHumanidade] = useState({ humanidade: 7, manchas: 1 })

  return (
    <main className="min-h-dvh pb-12">
      <CabecalhoFicha
        barra={<BarraApp direita="O Grupo" />}
        nome="Helena Sarmento"
        descricao="Toreador · 12ª Geração · Potência do Sangue 1"
        fome={fome}
        horizonte={<HorizonteHumanidade trilha={humanidade} onChange={setHumanidade} />}
      >
        <TrilhaDano rotulo="Vitalidade" dano={vitalidade} max={6} onChange={setVitalidade} />
        <TrilhaDano rotulo="Força de Vontade" dano={vontade} max={5} onChange={setVontade} />
        <TrilhaFome fome={fome} onChange={setFome} />
      </CabecalhoFicha>

      <div className="mx-auto max-w-3xl px-4">
        <Alert className="mt-4 border-vinho/45 bg-vinho/15">
          <AlertDescription className="text-foreground">
            <span>
              <strong className="font-semibold">Compulsão ativa: Fome</strong> · até o Narrador encerrar
            </span>
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="atributos" className="mt-4">
          <TabsList variant="line" className="w-full justify-start gap-4 rounded-none border-b p-0">
            <TabsTrigger value="atributos" className="flex-none px-0 after:bg-vinho">Atributos</TabsTrigger>
            <TabsTrigger value="habilidades" className="flex-none px-0 after:bg-vinho">Habilidades</TabsTrigger>
            <TabsTrigger value="disciplinas" className="flex-none px-0 after:bg-vinho">Disciplinas</TabsTrigger>
            <TabsTrigger value="notas" className="flex-none px-0 after:bg-vinho">Notas</TabsTrigger>
          </TabsList>
          <TabsContent value="atributos">
            <ListaTracos grupos={ATRIBUTOS} />
          </TabsContent>
          <TabsContent value="habilidades">
            <ListaTracos grupos={HABILIDADES} />
          </TabsContent>
          <TabsContent value="disciplinas">
            {DISCIPLINAS.map((d) => (
              <section key={d.nome}>
                <div className="mt-4 flex items-center justify-between">
                  <h2 className="font-serif text-2xl">{d.nome}</h2>
                  <Pontos valor={d.valor} rotulo={d.nome} />
                </div>
                <ul className="mt-1">
                  {d.poderes.map((p) => (
                    <li key={p} className="flex h-11 items-center border-b text-base">
                      {p}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </TabsContent>
          <TabsContent value="notas">
            <p className="mt-4 text-sm text-muted-foreground">
              Nenhuma Nota ainda. As Notas são suas; o Narrador lê, a menos que você marque como privada.
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
