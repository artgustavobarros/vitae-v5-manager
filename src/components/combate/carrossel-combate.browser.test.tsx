import { useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { createMemoryHistory, createRootRoute, createRouter, RouterProvider } from '@tanstack/react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { commands, page, userEvent } from 'vitest/browser'

import { CombatePublico } from '#/components/exibicao-publica/combate-publico'
import { VisaoNarrador } from '#/routes/combate'
import { avancarTurno, removerParticipante, reordenarParticipantes, type Combate } from '#/domain/combate'
import { filtrarCombatePublico } from '#/domain/exibicao-publica'
import { Button } from '#/components/ui/button'
import '#/styles.css'

declare module 'vitest/browser' {
  interface BrowserCommands {
    iniciarArraste(seletor: string): Promise<void>
    moverNaBorda(direcao: 'esquerda' | 'direita'): Promise<void>
    soltarArraste(): Promise<void>
  }
}

// Só as fronteiras de servidor e a navegação autenticada são substituídas; os cards, Embla e Dnd são reais.
vi.mock('#/components/barra-app', () => ({ BarraApp: () => null }))
vi.mock('#/server/bestiario', () => ({ listarModelosBestiario: vi.fn() }))
vi.mock('#/server/personagens', () => ({ marcar: vi.fn() }))
vi.mock('#/server/exibicao-publica', () => ({ consultarLinkPublico: vi.fn(), gerarLinkPublico: vi.fn(), revogarLinkPublico: vi.fn() }))
vi.mock('#/server/combate', () => ({
  adicionarParticipanteCombateServer: vi.fn(), alternarCondicaoParticipanteCombateServer: vi.fn(),
  alternarRevelarVitalidadeCombateServer: vi.fn(), definirRevelarCondicaoCombateServer: vi.fn(),
  aplicarDanoInimigoCombateServer: vi.fn(), atualizarParticipanteInimigoServer: vi.fn(),
  avancarTurnoCombateServer: vi.fn(), carregarCombate: vi.fn(), encerrarCombateServer: vi.fn(),
  iniciarCombateServer: vi.fn(), listarCoteriesParaCombate: vi.fn(), listarPersonagensParaCombate: vi.fn(), removerParticipanteCombateServer: vi.fn(),
  reordenarParticipantesCombateServer: vi.fn(), voltarTurnoCombateServer: vi.fn(),
}))
vi.mock('#/server/pre-combate', () => ({
  listarPreCombates: vi.fn(), salvarPreCombate: vi.fn(), excluirPreCombate: vi.fn(),
}))

import { reordenarParticipantesCombateServer } from '#/server/combate'

const nomes = ['Ana', 'Bia', 'Caio', 'Dora', 'Eva', 'Fábio']
function exemplo(): Combate {
  return { id: 'teste', rodada: 1, turnoAtual: 0, ativo: true,
    participantes: nomes.map((nome) => ({ id: nome, tipo: 'personagem', personagemId: nome, nome, ehPdn: false, condicoes: [] })),
  }
}

let root: Root | undefined
let recipiente: HTMLDivElement
async function montar(visao: 'publico' | 'narrador') {
  function Mesa() {
    const [combate, setCombate] = useState(exemplo)
    vi.mocked(reordenarParticipantesCombateServer).mockImplementation(async ({ data }) => {
      const atualizado = reordenarParticipantes(combate, data.ordemIds)
      setCombate(atualizado)
      return atualizado
    })
    return <>
      <Button onClick={() => setCombate((atual) => removerParticipante(atual, atual.participantes[atual.turnoAtual].id))}>Remover quem age</Button>
      <Button onClick={() => setCombate(avancarTurno)}>Avançar turno de teste</Button>
      <output aria-label="Ordem salva">{combate.participantes.map((p) => p.nome).join(', ')}</output>
      {visao === 'publico' ? <CombatePublico combate={filtrarCombatePublico(combate)} /> : <VisaoNarrador combate={combate} modelos={[]} personagens={[]} preCombates={[]} coteries={[]} />}
    </>
  }
  const router = createRouter({ routeTree: createRootRoute({ component: Mesa }), history: createMemoryHistory({ initialEntries: ['/'] }) })
  await router.load()
  recipiente = document.createElement('div')
  document.body.append(recipiente)
  root = createRoot(recipiente)
  root.render(<RouterProvider router={router} />)
  await expect.element(page.getByRole('region', { name: 'Participantes do Combate' })).toBeVisible()
  await expect.element(page.getByRole('button', { name: 'Próximo participante' })).toBeEnabled()
}

function visivel(nome: string) {
  const faixa = recipiente.querySelector('.carrossel-combate > div:last-child')?.getBoundingClientRect()
  const card = [...recipiente.querySelectorAll('[data-slide-combate]')].find((el) => el.textContent?.includes(nome))?.querySelector('[data-slot="card"]')?.getBoundingClientRect()
  return Boolean(faixa && card && card.left >= faixa.left - 1 && card.right <= faixa.right + 1)
}

async function navegarAteOFim() {
  for (let i = 0; i < 6; i++) {
    const botao = page.getByRole('button', { name: 'Próximo participante' })
    if (botao.element().hasAttribute('disabled')) break
    await botao.click()
  }
  await expect.poll(() => visivel('Fábio'), { timeout: 3000 }).toBe(true)
}

afterEach(async () => {
  await commands.soltarArraste()
  root?.unmount()
  recipiente?.remove()
  vi.clearAllMocks()
})

describe('Regressões do carrossel de Combate em navegador real', () => {
  it.each(['publico', 'narrador'] as const)('acompanha o novo ator no mesmo índice (%s)', async (visao) => {
    await montar(visao)
    await navegarAteOFim()
    expect(visivel('Ana')).toBe(false)
    await page.getByRole('button', { name: 'Remover quem age' }).click()
    await expect.poll(() => visivel('Bia'), { timeout: 3000 }).toBe(true)
  })

  it('permite arrastar o primeiro até depois do último participante inicialmente oculto', async () => {
    await montar('narrador')
    expect(visivel('Fábio')).toBe(false)
    await commands.iniciarArraste('[data-arrastar-participante]')
    await expect.element(page.getByText('Posição na iniciativa')).toBeVisible()
    await commands.moverNaBorda('direita')
    await expect.poll(() => recipiente.querySelector('[data-slide-combate]:last-child')?.textContent, { timeout: 8000 }).toContain('Posição na iniciativa')
    await commands.soltarArraste()
    await expect.element(page.getByRole('status', { name: 'Ordem salva' })).toHaveTextContent('Bia, Caio, Dora, Eva, Fábio, Ana')
  })

  it('permite arrastar o último até antes do primeiro participante inicialmente oculto', async () => {
    await montar('narrador')
    await navegarAteOFim()
    await commands.iniciarArraste('[data-slide-combate]:last-child [data-arrastar-participante]')
    await expect.element(page.getByText('Posição na iniciativa')).toBeVisible()
    await commands.moverNaBorda('esquerda')
    await expect.poll(() => recipiente.querySelector('[data-slide-combate]:first-child')?.textContent, { timeout: 8000 }).toContain('Posição na iniciativa')
    await commands.soltarArraste()
    await expect.element(page.getByRole('status', { name: 'Ordem salva' })).toHaveTextContent('Fábio, Ana, Bia, Caio, Dora, Eva')
  })

  it('cancela o arraste na borda sem salvar outra ordem e volta ao participante atual', async () => {
    await montar('narrador')
    await commands.iniciarArraste('[data-arrastar-participante]')
    await expect.element(page.getByText('Posição na iniciativa')).toBeVisible()
    await commands.moverNaBorda('direita')
    await expect.poll(() => recipiente.querySelector('[data-slide-combate]:last-child')?.textContent, { timeout: 8000 }).toContain('Posição na iniciativa')
    await userEvent.keyboard('{Escape}')
    await commands.soltarArraste()
    await expect.element(page.getByRole('status', { name: 'Ordem salva' })).toHaveTextContent('Ana, Bia, Caio, Dora, Eva, Fábio')
    await expect.poll(() => visivel('Ana'), { timeout: 3000 }).toBe(true)
    expect(reordenarParticipantesCombateServer).not.toHaveBeenCalled()
    // Permanecer na borda após cancelar não pode continuar navegando.
    await new Promise((resolve) => setTimeout(resolve, 800))
    expect(visivel('Ana')).toBe(true)
  })

  it.each(['publico', 'narrador'] as const)('continua acompanhando a troca normal de turno (%s)', async (visao) => {
    await montar(visao)
    await navegarAteOFim()
    await page.getByRole('button', { name: 'Avançar turno de teste' }).click()
    await expect.poll(() => visivel('Bia'), { timeout: 3000 }).toBe(true)
  })
})
