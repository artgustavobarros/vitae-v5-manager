import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowUpRight, RotateCcw } from 'lucide-react'
import { useState, type ReactNode } from 'react'

import { Talisma, type FormatoTalisma } from '#/components/experimentos/talisma'
import { MarcaVitae } from '#/components/marca-vitae'
import { Button } from '#/components/ui/button'
import { Card, CardContent } from '#/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/ui/tabs'
import { alterarValorRelogio, type Relogio } from '#/domain/relogios'
import { alternarCaixaDano, caixasDano, type Dano } from '#/domain/trilhas'

const layouts: { id: FormatoTalisma; nome: string; descricao: string }[] = [
  { id: 'cortejo', nome: 'Cortejo', descricao: 'Uma sequência de talismãs suspensos. Quem está em foco desce e ocupa mais espaço.' },
  { id: 'altar', nome: 'Altar', descricao: 'Um talismã central domina a cena. Os demais acompanham nas laterais.' },
  { id: 'original', nome: 'Original', descricao: 'Tiras lado a lado com nomes e anotações laterais.' },
]

function Composicao({ formato, children }: { formato: FormatoTalisma; children: ReactNode[] }) {
  if (formato === 'original') return <div className="grid gap-8 md:grid-cols-3">{children}</div>
  if (formato === 'cortejo') return <div className="relative">
    <svg viewBox="0 0 1200 40" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 top-0 hidden h-8 w-full text-muted-foreground md:block" aria-hidden="true">
      <path d="M0 4Q600 12 1200 4" fill="none" stroke="currentColor" strokeWidth="2" />
    </svg>
    {/* 3 colunas iguais + 2 intervalos de 32px preenchem o quadro; no celular, a ordem vira lista. */}
    <ol className="grid items-start gap-8 md:grid-cols-3">
      {children.map((child, indice) => <li key={indice} className={indice === 0 ? 'md:pt-16' : 'md:pt-4'}>
        <div className="mx-auto mb-2 w-fit text-sm tabular-nums text-muted-foreground">Posição {indice + 1}</div>
        {child}
      </li>)}
    </ol>
  </div>
  return <div className="grid items-center gap-8 md:grid-cols-4">
    {/* 1 + 2 + 1 colunas, com três intervalos de 32px; o principal mantém a primeira posição no celular. */}
    <div className="md:col-span-2 md:col-start-2 md:row-start-1">{children[0]}</div>
    <div className="md:col-start-1 md:row-start-1">{children[1]}</div>
    <div className="md:col-start-4 md:row-start-1">{children[2]}</div>
  </div>
}

const relogiosIniciais: Relogio[] = [
  { id: 'cerco', nome: 'O cerco se fecha', tipo: 'Ameaça', descricao: 'As sirenes estão cada vez mais próximas do refúgio.',
    total: 6, atual: 3, perigo: 'aumenta', visivel: true, efeitos: [] },
  { id: 'ritual', nome: 'Quebrar o ritual', tipo: 'Objetivo', descricao: 'Interromper o círculo antes do último cântico.',
    total: 4, atual: 1, perigo: 'diminui', visivel: true, efeitos: [] },
  { id: 'amanhecer', nome: 'Até o amanhecer', tipo: 'Prazo', descricao: 'O horizonte começa a perder a cor da noite.',
    total: 6, atual: 5, perigo: 'aumenta', visivel: true, efeitos: [] },
]

const participantesIniciais = [
  { id: 'helena', nome: 'Helena', descricao: 'Personagem · Vitalidade', max: 6, dano: { superficial: 2, agravado: 1 }, oculto: false },
  { id: 'guarda', nome: 'Guarda da Torre', descricao: 'Inimigo · Vitalidade', max: 5, dano: { superficial: 2, agravado: 0 }, oculto: false },
  { id: 'acorrentado', nome: 'Acorrentado', descricao: 'Inimigo · Vitalidade', max: 7, dano: { superficial: 1, agravado: 1 }, oculto: true },
]

export const Route = createFileRoute('/experimentos/talismas')({
  validateSearch: (search: Record<string, unknown>) => {
    const layout: FormatoTalisma = search.layout === 'altar' ? 'altar' : search.layout === 'original' ? 'original' : 'cortejo'
    const modo = search.modo === 'combate' ? 'combate' : search.modo === 'relogios' ? 'relogios' : layout === 'altar' ? 'relogios' : 'combate'
    return { layout, modo }
  },
  head: () => ({ meta: [{ title: 'Talismãs — Estudo visual · Vitae' }, { name: 'robots', content: 'noindex, nofollow' }] }),
  component: ExperimentoTalismas,
})

function ExperimentoTalismas() {
  const { layout, modo } = Route.useSearch()
  const navigate = Route.useNavigate()
  const [relogios, setRelogios] = useState(relogiosIniciais)
  const [participantes, setParticipantes] = useState(participantesIniciais)
  const [publico, setPublico] = useState(false)
  const direcao = layouts.find((item) => item.id === layout)!

  function moverRelogio(id: string, delta: number) {
    setRelogios((atuais) => atuais.map((relogio) => relogio.id === id
      ? { ...relogio, atual: alterarValorRelogio(relogio, relogio.atual + delta).atual }
      : relogio))
  }

  function alterarDano(id: string, calcular: (dano: Dano, max: number) => Dano) {
    setParticipantes((atuais) => atuais.map((participante) => participante.id === id
      ? { ...participante, dano: calcular(participante.dano, participante.max) }
      : participante))
  }

  function reiniciar() {
    setRelogios(relogiosIniciais)
    setParticipantes(participantesIniciais)
  }

  return <main className="container-app mx-auto min-h-dvh pb-8">
    <header className="flex flex-wrap items-center justify-between gap-4 py-4">
      <MarcaVitae />
      <p className="text-sm text-muted-foreground">Estudo visual · Dados de exemplo</p>
      <Button variant="ghost" asChild className="h-11">
        <a href="https://github.com/corashallit/cain" target="_blank" rel="noopener noreferrer">Referência CAIN <ArrowUpRight className="size-4" /></a>
      </Button>
    </header>

    <div className="flex flex-wrap items-start justify-between gap-4 pb-4">
      <div className="space-y-2">
        <h1 className="font-serif text-2xl">Mesa de Talismãs</h1>
        <p className="max-w-xl text-sm text-muted-foreground">Marque o papel para rasgá-lo. Nada aqui altera sua Crônica.</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" className="h-11" aria-pressed={publico} onClick={() => setPublico((valor) => !valor)}>
          {publico ? 'Visão pública' : 'Visão do Narrador'}
        </Button>
        {!publico && <Button variant="ghost" className="h-11" onClick={reiniciar}><RotateCcw className="size-4" />Reiniciar exemplo</Button>}
      </div>
    </div>

    <nav aria-label="Layouts de talismãs" className="flex flex-wrap gap-2 pb-3">
      {layouts.map((item) => <Button key={item.id} variant={layout === item.id ? 'secondary' : 'ghost'} asChild className="h-11 px-5">
        <Link to="/experimentos/talismas" search={{ layout: item.id, modo: item.id === 'altar' ? 'relogios' : 'combate' }}
          aria-current={layout === item.id ? 'page' : undefined}>{item.nome}</Link>
      </Button>)}
    </nav>

    <Tabs value={modo} onValueChange={(value) => void navigate({ search: { layout, modo: value === 'combate' ? 'combate' : 'relogios' }, replace: true })} className="gap-4">
      <TabsList variant="line" className="h-12 gap-4 p-0">
        <TabsTrigger value="relogios" className="h-11 px-2">Relógios</TabsTrigger>
        <TabsTrigger value="combate" className="h-11 px-2">Combate</TabsTrigger>
      </TabsList>

      <TabsContent value="relogios" className="space-y-4">
        <Card className="gap-6 rounded-none border-0 py-6">
          <div className="space-y-2 px-6"><h2 className="font-serif text-2xl">{direcao.nome}</h2><p className="text-sm text-muted-foreground">{direcao.descricao}</p></div>
          <CardContent className="px-6">
          <Composicao formato={layout}>
          {relogios.map((relogio, indice) => <Talisma key={relogio.id} nome={relogio.nome} formato={layout}
            escala={layout !== 'original' && indice === 0 ? 'destaque' : 'normal'}
            destaque={layout === 'altar' && indice === 0 ? 'Relógio principal' : undefined}
            descricao={relogio.descricao} tipo="relogio" caixas={caixasDano({ superficial: relogio.atual, agravado: 0 }, relogio.total)}
            onMarcar={publico ? undefined : () => moverRelogio(relogio.id, 1)}
            onDesfazer={publico ? undefined : () => moverRelogio(relogio.id, -1)} />)}
          </Composicao>
          </CardContent>
        </Card>
        <p className="text-sm text-muted-foreground" role="status">{publico ? 'Somente leitura. As marcações do exemplo são preservadas ao trocar de visão.' : 'Clique no papel para riscar. Botão direito ou − desfaz uma etapa.'}</p>
      </TabsContent>

      <TabsContent value="combate" className="space-y-6">
        <div className="flex flex-wrap justify-between gap-3 text-sm">
          <p>Rodada 3 · Agindo: Helena</p>
          <p className="text-muted-foreground">/ superficial · X agravado</p>
        </div>
        <Card className="gap-6 rounded-none border-0 py-6">
          <div className="space-y-2 px-6"><h2 className="font-serif text-2xl">{direcao.nome}</h2><p className="text-sm text-muted-foreground">{direcao.descricao}</p></div>
          <CardContent className="px-6">
          <Composicao formato={layout}>
          {participantes.map((participante, indice) => <Talisma key={participante.id} nome={participante.nome}
            formato={layout} escala={layout !== 'original' && indice === 0 ? 'destaque' : 'normal'}
            descricao={participante.descricao} tipo="vitalidade" caixas={caixasDano(participante.dano, participante.max)}
            oculto={publico && participante.oculto} destaque={indice === 0 ? 'Agindo agora' : indice === 1 ? 'Próximo a agir' : undefined}
            onMarcar={publico ? undefined : (posicao) => alterarDano(participante.id, (dano, max) => alternarCaixaDano(dano, max, posicao))} />)}
          </Composicao>
          </CardContent>
        </Card>
        <p className="text-sm text-muted-foreground" role="status">{publico ? 'Somente leitura. A Vitalidade do Acorrentado está oculta.' : 'Cada posição do papel alterna: vazio, superficial, agravado, vazio.'}</p>
      </TabsContent>
    </Tabs>

    <footer className="py-6 text-sm text-muted-foreground">
      Inspirado no Talisman Board de Cora Shallit. Desenhos próprios; sem artes dos livros de CAIN.
      <span className="block pt-2">Experimento local, sem salvamento ou sincronização entre janelas.</span>
    </footer>
  </main>
}
