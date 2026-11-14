import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createMemoryHistory, createRootRoute, createRouter, RouterProvider } from '@tanstack/react-router'
import { describe, expect, it } from 'vitest'

import { VisaoNarrador } from '#/routes/combate'
import type { EstadoCombateNarrador } from '#/server/combate'

async function renderizar(combate: EstadoCombateNarrador | null) {
  const routeTree = createRootRoute({ component: () => createElement(VisaoNarrador, { combate, modelos: [], personagens: [], preCombates: [], coteries: [] }) })
  const router = createRouter({ routeTree, history: createMemoryHistory({ initialEntries: ['/'] }) })
  await router.load()
  return renderToStaticMarkup(createElement(RouterProvider, { router }))
}

describe('Carrossel do Narrador', () => {
  it('mantém os controles dos participantes ativos e deixa incapacitados depois do carrossel', async () => {
    const html = await renderizar({ id: 'combate', rodada: 3, turnoAtual: 0, ativo: true,
      participantes: [
        { id: 'ana', tipo: 'personagem', personagemId: 'ficha-ana', nome: 'Ana', ehPdn: false, condicoes: [] },
        { id: 'lia', tipo: 'personagem', personagemId: 'ficha-lia', nome: 'Lia', ehPdn: false, condicoes: [] },
        { id: 'guarda', tipo: 'inimigo', nome: 'Guarda caído', condicoes: ['desacordado'],
          vitalidadeMax: 5, vontadeMax: 3, danoVitalidade: { superficial: 0, agravado: 0 },
          danoVontade: { superficial: 0, agravado: 0 }, revelarVitalidade: false,
          paradas: { fisico: 3, social: 2, mental: 2, excepcionais: [] }, especiais: [], notas: '' },
      ],
    })
    expect(html).toContain('aria-roledescription="carrossel"')
    expect(html).toContain('2 participantes')
    expect(html).toMatch(/Participantes do Combate[\s\S]*Ana[\s\S]*Lia[\s\S]*<\/section>[\s\S]*Guarda caído/)
    expect(html).toContain('data-arrastar-participante')
    expect(html).not.toContain('Mover para cima')
    expect(html).not.toContain('Minimizar')
    expect(html).toContain('Remover participante')
    expect(html).toContain('Próximo Turno')
  })

  it('oferece a montagem imediata sem uma faixa de participantes quando não há Combate', async () => {
    const html = await renderizar(null)
    expect(html).toContain('aria-labelledby="titulo-combate-agora"')
    expect(html).toContain('aria-label="Personagens do Combate"')
    expect(html).toMatch(/<button[^>]*disabled=""[^>]*>[\s\S]*?Iniciar Combate<\/button>/)
    expect(html).not.toContain('aria-roledescription="carrossel"')
  })
})
