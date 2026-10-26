import { HeadContent, Link, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { useSyncExternalStore } from 'react'

import { Button } from '#/components/ui/button'
import { Toaster } from '#/components/ui/sonner'
import { useTempoReal } from '#/lib/use-tempo-real'
import { buscarUsuario } from '#/server/sessao'
import appCss from '../styles.css?url'

const SITE_URL = 'https://vitae.artbarros.tech'
const OG_IMAGE_URL = `${SITE_URL}/og-vitae.png`

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
        title: 'Vitae — Fichas e Crônicas',
      },
      { name: 'description', content: 'Fichas e Crônicas de Vampiro: A Máscara 5ª Edição.' },
      { name: 'application-name', content: 'Vitae' },
      { name: 'theme-color', content: '#141215' },
      { property: 'og:site_name', content: 'Vitae' },
      { property: 'og:type', content: 'website' },
      { property: 'og:locale', content: 'pt_BR' },
      { property: 'og:title', content: 'Vitae — Fichas e Crônicas' },
      { property: 'og:description', content: 'Fichas e Crônicas de Vampiro: A Máscara 5ª Edição.' },
      { property: 'og:url', content: SITE_URL },
      { property: 'og:image', content: OG_IMAGE_URL },
      { property: 'og:image:secure_url', content: OG_IMAGE_URL },
      { property: 'og:image:type', content: 'image/png' },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:alt', content: 'Vitæ — convite para uma Crônica de Vampiro: A Máscara' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'Vitae — Fichas e Crônicas' },
      { name: 'twitter:description', content: 'Fichas e Crônicas de Vampiro: A Máscara 5ª Edição.' },
      { name: 'twitter:image', content: OG_IMAGE_URL },
    ],
    links: [
      { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
      { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32.png' },
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
  notFoundComponent: NaoEncontrada,
})

// Endereço que não existe (inclusive /favicon.ico e o .well-known do Chrome DevTools) cai aqui.
function NaoEncontrada() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-[1440px] px-4 min-[1472px]:px-0 flex-col items-start justify-center gap-4">
      <h1 className="font-serif text-display text-balance">Página não encontrada</h1>
      <p className="text-sm text-muted-foreground">Esse endereço não existe no Vitae.</p>
      <Button asChild variant="secondary" size="lg">
        <Link to="/">Voltar para o início</Link>
      </Button>
    </main>
  )
}

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
  const { usuario } = Route.useRouteContext()
  const desktop = useDesktop()
  useTempoReal(Boolean(usuario))

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
