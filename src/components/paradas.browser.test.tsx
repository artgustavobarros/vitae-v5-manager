import { createRoot, type Root } from 'react-dom/client'
import { createMemoryHistory, createRootRoute, createRoute, createRouter, Outlet, RouterProvider } from '@tanstack/react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

const servidor = vi.hoisted(() => {
  const personalizada = { id: '123e4567-e89b-42d3-a456-426614174000', nome: 'Interrogar com calma', atributo: 'manipulacao', habilidade: 'intimidacao' }
  const paradas = [
    { id: 'padrao-atirar', nome: 'Atirar com precisão', atributo: 'autocontrole', habilidade: 'armas-de-fogo',
      atributoNome: 'Autocontrole', habilidadeNome: 'Armas de Fogo', grupo: 'fisico', personalizada: false },
    { ...personalizada, atributoNome: 'Manipulação', habilidadeNome: 'Intimidação', grupo: 'social', personalizada: true },
  ]
  return {
    dados: { paradas, compartilhadas: [personalizada], gerenciaveis: [personalizada.id] },
    salvar: vi.fn(async () => ({ ok: true, repetidas: [] })),
  }
})

vi.mock('#/components/barra-app', () => ({ BarraApp: () => null }))
vi.mock('#/server/paradas', () => ({
  carregarParadas: async () => servidor.dados, salvarParadaCompartilhada: servidor.salvar,
  excluirParadaCompartilhada: vi.fn(), reordenarParadasUsuario: vi.fn(),
}))

import { Route as Paradas } from '#/routes/paradas'
import '#/styles.css'

let root: Root | undefined
let recipiente: HTMLDivElement | undefined

async function montar() {
  const raiz = createRootRoute({ component: Outlet, beforeLoad: () => ({ usuario: { papel: 'narrador' } }) })
  const rota = createRoute({ getParentRoute: () => raiz, path: '/paradas', component: Paradas.options.component,
    loader: () => servidor.dados })
  const router = createRouter({ routeTree: raiz.addChildren([rota]), history: createMemoryHistory({ initialEntries: ['/paradas'] }) })
  await router.load()
  recipiente = document.createElement('div')
  document.body.append(recipiente)
  root = createRoot(recipiente)
  root.render(<RouterProvider router={router} />)
}

afterEach(() => { root?.unmount(); recipiente?.remove(); vi.clearAllMocks() })

describe('Paradas como referência independente de Fichas', () => {
  it('exibe a composição sem valores e combina busca com a flag da Habilidade', async () => {
    await montar()
    await expect.element(page.getByRole('heading', { name: 'Atirar com precisão' })).toBeVisible()
    expect(document.querySelector('[aria-label="Personagem das Paradas"]')).toBeNull()
    expect(document.body.textContent).not.toMatch(/Abrir Ficha|dados base|\d+ dados/)
    expect(document.body.textContent).toContain('Autocontrole + Armas de Fogo')
    await page.getByRole('textbox', { name: 'Buscar Paradas' }).fill('intimidacao')
    await expect.element(page.getByRole('heading', { name: 'Interrogar com calma' })).toBeVisible()
    await expect.element(page.getByRole('heading', { name: 'Atirar com precisão' })).not.toBeInTheDocument()
    await page.getByRole('radio', { name: /Físicas/ }).click()
    await expect.element(page.getByText('Nenhuma Parada encontrada', { exact: false })).toBeVisible()
  })

  it('permite cadastrar uma Parada sem criar ou escolher Personagem', async () => {
    await montar()
    await page.getByRole('button', { name: 'Nova Parada', exact: true }).click()
    await page.getByRole('textbox', { name: 'Nome da ação' }).fill('Impressionar a corte')
    await page.getByRole('button', { name: 'Salvar Parada', exact: true }).click()
    expect(servidor.salvar).toHaveBeenCalledWith({ data: { parada: {
      id: expect.any(String), nome: 'Impressionar a corte', atributo: 'carisma', habilidade: 'intimidacao',
    } } })
  })
})
