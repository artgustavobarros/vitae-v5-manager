import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { createIsomorphicFn } from '@tanstack/react-start'
import { getRequestHeader } from '@tanstack/react-start/server'
import { routeTree } from './routeTree.gen'

const nonceDaRequisicao = createIsomorphicFn()
  .server(() => getRequestHeader('x-vitae-csp-nonce'))
  .client(() => undefined)

export function getRouter() {
  const router = createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    ssr: { nonce: nonceDaRequisicao() },
  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
