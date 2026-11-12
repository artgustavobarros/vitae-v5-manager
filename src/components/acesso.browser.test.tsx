import { createRoot, type Root } from 'react-dom/client'
import { createMemoryHistory, createRootRoute, createRoute, createRouter, Outlet, RouterProvider } from '@tanstack/react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

vi.mock('#/server/convites', () => ({ prepararCadastro: vi.fn(), verConvite: vi.fn() }))
vi.mock('#/server/conta', () => ({ buscarConta: vi.fn() }))
vi.mock('#/components/barra-app', () => ({ BarraApp: () => null }))
vi.mock('#/lib/auth-client', () => ({ authClient: { signIn: { social: vi.fn() } } }))

import { authClient } from '#/lib/auth-client'
import { prepararCadastro } from '#/server/convites'
import { Route as Entrar } from '#/routes/entrar'
import { Route as Convite } from '#/routes/convite/$token'
import { Route as Conta } from '#/routes/conta'
import '#/styles.css'

let root: Root | undefined
let recipiente: HTMLDivElement | undefined

async function montar(caminho: string) {
  const raiz = createRootRoute({ component: Outlet })
  const entrar = createRoute({ getParentRoute: () => raiz, path: '/entrar', component: Entrar.options.component })
  const convite = createRoute({
    getParentRoute: () => raiz, path: '/convite/$token', component: Convite.options.component,
    loader: () => ({ estado: 'valido' as const }),
  })
  const conta = createRoute({
    getParentRoute: () => raiz, path: '/conta', component: Conta.options.component,
    loader: () => ({ nome: 'Ana da Silva' }),
  })
  const router = createRouter({
    routeTree: raiz.addChildren([entrar, convite, conta]),
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

  it('usa o Convite para a Crônica na autorização Google', async () => {
    vi.mocked(prepararCadastro).mockResolvedValue(undefined)
    vi.mocked(authClient.signIn.social).mockImplementation(async () => {
      expect(prepararCadastro).toHaveBeenCalledWith({ data: { token: 'link-da-mesa' } })
      return { data: null, error: { code: 'ACCESS_DENIED', message: 'access_denied', status: 403, statusText: 'Forbidden' } }
    })
    await montar('/convite/link-da-mesa')
    await page.getByRole('button', { name: 'Entrar com Google' }).click()
    expect(document.querySelectorAll('input')).toHaveLength(0)
    await expect.element(page.getByRole('alert')).toHaveTextContent('A conexão com o Google foi cancelada.')
    expect(authClient.signIn.social).toHaveBeenCalledWith({
      provider: 'google', callbackURL: '/', errorCallbackURL: '/convite/link-da-mesa',
    })
  })

  it('não inicia Google se o Convite para a Crônica deixou de valer', async () => {
    vi.mocked(prepararCadastro).mockRejectedValue(new Error('Este link da Crônica não vale mais.'))
    await montar('/convite/link-antigo')
    await page.getByRole('button', { name: 'Entrar com Google' }).click()
    await expect.element(page.getByRole('alert')).toHaveTextContent('Este link da Crônica não vale mais.')
    expect(authClient.signIn.social).not.toHaveBeenCalled()
    await expect.element(page.getByRole('button', { name: 'Entrar com Google' })).toBeEnabled()
  })

  it('mantém o nome editável sem oferecer senha ou desconexão do Google', async () => {
    await montar('/conta')
    await expect.element(page.getByRole('textbox', { name: 'Nome na Crônica' })).toHaveValue('Ana da Silva')
    expect(document.querySelector('input[type="password"]')).toBeNull()
    expect(document.body.textContent).not.toContain('Desconectar')
    expect(document.body.textContent).not.toContain('Nome de usuário')
  })
})
