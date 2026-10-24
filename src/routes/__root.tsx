import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { useSyncExternalStore } from 'react'

import { Toaster } from '#/components/ui/sonner'
import { buscarUsuario } from '#/server/sessao'
import appCss from '../styles.css?url'

export const Route = createRootRoute({
  beforeLoad: async () => ({ usuario: await buscarUsuario() }),
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Umbra',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

// O gatilho do DevTools cobre o rodapé do wizard no celular; só no desktop.
const DESKTOP = '(min-width: 1024px)'
function useDesktop() {
  return useSyncExternalStore(
    (avisar) => {
      const mq = window.matchMedia(DESKTOP)
      mq.addEventListener('change', avisar)
      return () => mq.removeEventListener('change', avisar)
    },
    () => window.matchMedia(DESKTOP).matches,
    () => false,
  )
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const desktop = useDesktop()
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Toaster position="top-center" />
        {desktop && (
          <TanStackDevtools
            config={{ position: 'middle-right' }}
            plugins={[
              {
                name: 'Tanstack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          />
        )}
        <Scripts />
      </body>
    </html>
  )
}
