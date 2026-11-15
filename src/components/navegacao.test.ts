import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createMemoryHistory, createRootRoute, createRouter, RouterProvider } from '@tanstack/react-router'
import { expect, it } from 'vitest'

import { NavegacaoInline } from './navegacao'

it('mantém as ferramentas do Narrador sem oferecer Coteries ou configuração da Crônica', async () => {
  const routeTree = createRootRoute({ component: NavegacaoInline })
  const router = createRouter({ routeTree, history: createMemoryHistory({ initialEntries: ['/'] }) })
  await router.load()
  const html = renderToStaticMarkup(createElement(RouterProvider, { router }))
  expect(html).toContain('Paradas')
  expect(html).toContain('Personagens')
  expect(html).toContain('href="/combate"')
  expect(html).toContain('href="/relogios"')
  expect(html).not.toContain('Coteries')
  expect(html).not.toContain('Crônica')
})
