import { createFileRoute, Link } from '@tanstack/react-router'
import { useState } from 'react'

import { TrilhaTatilExpandida, VisaoJogador } from '#/components/combate/visao-jogador'
import { BotaoVisibilidadeCondicao } from '#/components/combate/visibilidade-condicao'
import { CarrosselCombate } from '#/components/combate/carrossel-combate'
import { MarcaVitae } from '#/components/marca-vitae'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { avancarTurno, calcularEstadoSaude, voltarTurno, type Combate } from '#/domain/combate'
import { filtrarCombatePublico } from '#/domain/exibicao-publica'
import type { Dano } from '#/domain/trilhas'

const exemplos: { rotulo: string; dano: Dano }[] = [
  { rotulo: 'Sem dano', dano: { superficial: 0, agravado: 0 } },
  { rotulo: 'Escoriado', dano: { superficial: 1, agravado: 0 } },
  { rotulo: 'Ferido', dano: { superficial: 3, agravado: 0 } },
  { rotulo: 'Debilitado', dano: { superficial: 5, agravado: 1 } },
  { rotulo: 'Torpor', dano: { superficial: 0, agravado: 6 } },
]

export const Route = createFileRoute('/experimentos/ferimentos')({
  validateSearch: (search: Record<string, unknown>): { variant: 'lista' | 'carrossel' } => ({
    variant: search.variant === 'lista' ? 'lista' : 'carrossel',
  }),
  head: () => ({ meta: [{ title: 'Ferimentos no Combate — Prévia · Vitae' }, { name: 'robots', content: 'noindex, nofollow' }] }),
  component: PreviaFerimentos,
})

function PreviaFerimentos() {
  const { variant } = Route.useSearch()
  const [dano, setDano] = useState<Dano>({ superficial: 0, agravado: 0 })
  const [revelarCondicao, setRevelarCondicao] = useState(true)
  const [turno, setTurno] = useState({ rodada: 3, turnoAtual: 0 })
  const saude = calcularEstadoSaude(6, dano, true)
  const entradaCombate: Combate = {
    id: 'exemplo', ...turno, ativo: true,
    participantes: [
      { id: 'helena', tipo: 'personagem', personagemId: 'ficha-helena', nome: 'Helena', ehPdn: false, revelarCondicao, condicoes: [] },
      { id: 'guarda', tipo: 'inimigo', nome: 'Guarda da Torre', categoria: 'Mortal', condicoes: [], vitalidadeMax: 6,
        revelarVitalidade: true, danoVitalidade: { superficial: 1, agravado: 0 }, vontadeMax: 4,
        danoVontade: { superficial: 0, agravado: 0 }, paradas: { fisico: 3, social: 2, mental: 2, excepcionais: [] },
        especiais: [], notas: '' },
      { id: 'lia', tipo: 'personagem', personagemId: 'ficha-lia', nome: 'Lia', ehPdn: false, condicoes: [] },
      { id: 'vitor', tipo: 'personagem', personagemId: 'ficha-vitor', nome: 'Vítor', ehPdn: true, revelarCondicao: true, condicoes: ['agarrado'] },
      { id: 'mirela', tipo: 'personagem', personagemId: 'ficha-mirela', nome: 'Mirela', ehPdn: false, condicoes: [] },
      { id: 'sentinela', tipo: 'inimigo', nome: 'Sentinela', categoria: 'Vampiro', condicoes: [], vitalidadeMax: 8,
        revelarVitalidade: true, danoVitalidade: { superficial: 4, agravado: 0 }, vontadeMax: 5,
        danoVontade: { superficial: 0, agravado: 0 }, paradas: { fisico: 5, social: 2, mental: 3, excepcionais: [] }, especiais: [], notas: '' },
    ],
  }
  const combate = filtrarCombatePublico(entradaCombate, {
    'ficha-helena': { compartilhaCondicao: false, vitalidadeMax: 6, vontadeMax: 5, danoVitalidade: dano,
      danoVontade: { superficial: 1, agravado: 0 }, fome: 3 },
    'ficha-lia': { compartilhaCondicao: false, vitalidadeMax: 6, vontadeMax: 5,
      danoVitalidade: { superficial: 3, agravado: 0 }, danoVontade: { superficial: 0, agravado: 0 }, fome: 2 },
    'ficha-vitor': { compartilhaCondicao: false, vitalidadeMax: 7, vontadeMax: 5,
      danoVitalidade: { superficial: 5, agravado: 2 }, danoVontade: { superficial: 2, agravado: 0 }, fome: 4 },
    'ficha-mirela': { compartilhaCondicao: false, vitalidadeMax: 5, vontadeMax: 4,
      danoVitalidade: { superficial: 1, agravado: 0 }, danoVontade: { superficial: 0, agravado: 0 }, fome: 1 },
  })

  function mudarTurno(direcao: 'anterior' | 'proximo') {
    setTurno((atual) => {
      const entrada = { ...entradaCombate, ...atual }
      const { rodada, turnoAtual } = direcao === 'proximo' ? avancarTurno(entrada) : voltarTurno(entrada)
      return { rodada, turnoAtual }
    })
  }

  return <div className="container-app mx-auto min-h-dvh">
    <header className="flex flex-wrap items-center justify-between gap-3 py-4">
      <MarcaVitae />
      <p className="text-sm text-muted-foreground">Prévia local · Dados fictícios</p>
      <Button asChild variant="ghost" className="h-11"><Link to="/narrador/combate">Combate do Narrador</Link></Button>
    </header>
    <Card className="gap-4 py-4">
      <CardHeader className="px-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="font-serif text-xl">Ferimentos de Helena</CardTitle>
          <nav className="flex gap-2" aria-label="Layout da prévia">
            <Button asChild variant={variant === 'carrossel' ? 'secondary' : 'outline'} className="h-11">
              <Link to="/experimentos/ferimentos" search={{ variant: 'carrossel' }} aria-current={variant === 'carrossel' ? 'page' : undefined}>Carrossel</Link>
            </Button>
            <Button asChild variant={variant === 'lista' ? 'secondary' : 'outline'} className="h-11">
              <Link to="/experimentos/ferimentos" search={{ variant: 'lista' }} aria-current={variant === 'lista' ? 'page' : undefined}>Lista</Link>
            </Button>
          </nav>
        </div>
        <p className="text-sm text-muted-foreground">Teste a aparência dos cards reais. Nada aqui altera ou salva dados na Crônica.</p>
      </CardHeader>
      <CardContent className="space-y-4 px-4">
        <div className="flex flex-wrap gap-2" aria-label="Exemplos de dano">
          {exemplos.map((exemplo) => <Button key={exemplo.rotulo} variant="outline" className="h-11"
            aria-pressed={dano.superficial === exemplo.dano.superficial && dano.agravado === exemplo.dano.agravado}
            onClick={() => setDano(exemplo.dano)}>{exemplo.rotulo}</Button>)}
        </div>
        <TrilhaTatilExpandida rotulo="Vitalidade" max={6} dano={dano} podeEditar onChange={setDano} />
        <BotaoVisibilidadeCondicao revelada={revelarCondicao} onAlterar={async (revelar) => setRevelarCondicao(revelar)} />
        <p className="text-sm text-muted-foreground" role="status">{saude.rotulo} · / superficial · X agravado. Reduzir o dano recompõe a aparência.</p>
      </CardContent>
    </Card>
    <section id="troca-de-turno" aria-label="Simulação de turnos" className="flex scroll-mt-4 flex-wrap items-center justify-between gap-3 py-4">
      <p role="status" className="text-sm">Rodada {turno.rodada} · Turno de {combate.participantes[turno.turnoAtual]?.nome}</p>
      <div className="flex gap-2">
        <Button variant="outline" className="h-11" disabled={turno.rodada === 1 && turno.turnoAtual === 0}
          onClick={() => mudarTurno('anterior')}>Turno anterior</Button>
        <Button className="h-11" onClick={() => mudarTurno('proximo')}>Próximo turno</Button>
      </div>
    </section>
    <VisaoJogador combate={combate} publico ContainerParticipantes={variant === 'carrossel' ? CarrosselCombate : undefined} />
  </div>
}
