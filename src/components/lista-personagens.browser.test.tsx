import { createRoot, type Root } from 'react-dom/client'
import { createMemoryHistory, createRootRoute, createRouter, RouterProvider } from '@tanstack/react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

const servidor = vi.hoisted(() => ({
  definirAtividadePersonagem: vi.fn(),
  definirTipoPersonagem: vi.fn(),
  apagarRascunho: vi.fn(),
  apagarPersonagem: vi.fn(),
  toast: { error: vi.fn(), success: vi.fn() },
}))

vi.mock('#/server/personagens', () => ({
  apagarRascunho: servidor.apagarRascunho,
  apagarPersonagem: servidor.apagarPersonagem,
  definirAtividadePersonagem: servidor.definirAtividadePersonagem,
  definirTipoPersonagem: servidor.definirTipoPersonagem,
}))
vi.mock('sonner', () => ({ toast: servidor.toast }))

import { ListaPersonagens } from './lista-personagens'
import '#/styles.css'

let root: Root | undefined
let recipiente: HTMLDivElement | undefined

async function montar() {
  const raiz = createRootRoute({
    component: () => (
      <ListaPersonagens
        itens={[{
          id: '00000000-0000-4000-8000-000000000001', nome: 'Helena', status: 'ativo',
          ativo: true, tipo: 'jogador', podeApagar: false,
        }]}
        gerenciavel
        onAlterado={() => {}}
        onApagado={() => {}}
      />
    ),
  })
  const router = createRouter({ routeTree: raiz, history: createMemoryHistory({ initialEntries: ['/'] }) })
  await router.load()
  recipiente = document.createElement('div')
  document.body.append(recipiente)
  root = createRoot(recipiente)
  root.render(<RouterProvider router={router} />)
}

afterEach(() => {
  root?.unmount()
  recipiente?.remove()
  vi.resetAllMocks()
})

describe('Gestão dos Personagens pelo Narrador', () => {
  it('alterna atividade e tipo pelas badges, sem abrir diálogo', async () => {
    await montar()
    const atividade = page.getByRole('button', { name: 'Desativar Helena' })
    const tipo = page.getByRole('button', { name: 'Marcar Helena como Não Jogador' })
    await expect.element(atividade).toHaveTextContent('Ativo')
    await expect.element(tipo).toHaveTextContent('Jogador')
    await atividade.click()
    await tipo.click()
    expect(servidor.definirAtividadePersonagem).toHaveBeenCalledWith({
      data: { id: '00000000-0000-4000-8000-000000000001', ativo: false },
    })
    expect(servidor.definirTipoPersonagem).toHaveBeenCalledWith({
      data: { id: '00000000-0000-4000-8000-000000000001', tipo: 'nao_jogador' },
    })
    expect(document.querySelector('[role="alertdialog"]')).toBeNull()
    await expect.element(page.getByRole('link', { name: 'Editar Helena' })).toHaveAttribute(
      'href', '/personagens/00000000-0000-4000-8000-000000000001/editar',
    )
    expect(document.querySelector('.lucide-chevron-right')).toBeNull()
    const excluir = page.getByRole('button', { name: 'Excluir Helena' })
    await expect.element(excluir).toHaveAttribute('aria-disabled', 'true')
    document.querySelector<HTMLButtonElement>('button[aria-label="Excluir Helena"]')?.click()
    expect(servidor.toast.error).toHaveBeenCalledWith('Só Rascunhos podem ser excluídos. Desative o Personagem primeiro.')
  })
})
