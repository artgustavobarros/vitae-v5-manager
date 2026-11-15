import { createRoot, type Root } from 'react-dom/client'
import { createMemoryHistory, createRootRoute, createRoute, createRouter, Outlet, RouterProvider } from '@tanstack/react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

vi.mock('#/server/conta', () => ({ buscarConta: vi.fn() }))
vi.mock('#/components/barra-app', () => ({ BarraApp: () => null }))
vi.mock('#/lib/auth-client', () => ({ authClient: { signIn: { social: vi.fn() } } }))

import { authClient } from '#/lib/auth-client'
import { Route as Entrar } from '#/routes/entrar'
import { Route as Conta } from '#/routes/conta'
import '#/styles.css'

let root: Root | undefined
let recipiente: HTMLDivElement | undefined

async function montar(caminho: string) {
  const raiz = createRootRoute({ component: Outlet })
  const entrar = createRoute({ getParentRoute: () => raiz, path: '/entrar', component: Entrar.options.component })
  const conta = createRoute({
    getParentRoute: () => raiz, path: '/conta', component: Conta.options.component,
    loader: () => ({ nome: 'Ana da Silva' }),
  })
  const router = createRouter({
    routeTree: raiz.addChildren([entrar, conta]),
    history: createMemoryHistory({ initialEntries: [caminho] }),
  })
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

describe('Telas de acesso pelo Google', () => {
  it('oferece somente Google na entrada, inclusive em desenvolvimento', async () => {
    await montar('/entrar')
    await expect.element(page.getByRole('button', { name: 'Entrar com Google' })).toBeVisible()
    expect(document.querySelectorAll('input')).toHaveLength(0)
    expect(document.querySelectorAll('form')).toHaveLength(0)
    expect(document.body.textContent).not.toContain('Área exclusiva do Narrador.')
    expect(document.body.textContent).not.toContain('Jogadores acompanham pelo link público da mesa.')
  })

  it('mostra erro da autorização e libera uma nova tentativa na entrada', async () => {
    vi.mocked(authClient.signIn.social).mockResolvedValue({
      data: null, error: { code: 'ACCESS_DENIED', message: 'access_denied', status: 403, statusText: 'Forbidden' },
    })
    await montar('/entrar')
    await page.getByRole('button', { name: 'Entrar com Google' }).click()
    await expect.element(page.getByRole('alert')).toHaveTextContent('A conexão com o Google foi cancelada.')
    await expect.element(page.getByRole('button', { name: 'Entrar com Google' })).toBeEnabled()
    expect(authClient.signIn.social).toHaveBeenCalledWith({ provider: 'google', callbackURL: '/', errorCallbackURL: '/entrar' })
  })

  it('mantém o nome editável sem oferecer senha ou desconexão do Google', async () => {
    await montar('/conta')
    await expect.element(page.getByRole('textbox', { name: 'Nome na Crônica' })).toHaveValue('Ana da Silva')
    expect(document.querySelector('input[type="password"]')).toBeNull()
    expect(document.body.textContent).not.toContain('Desconectar')
    expect(document.body.textContent).not.toContain('Nome de usuário')
  })
})
