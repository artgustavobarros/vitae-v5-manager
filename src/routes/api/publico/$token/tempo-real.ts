import { createFileRoute } from '@tanstack/react-router'

import { abrirTempoRealPublico } from '#/server/tempo-real-publico'

export const Route = createFileRoute('/api/publico/$token/tempo-real')({
  server: { handlers: { GET: ({ request, params }) => abrirTempoRealPublico(request, params.token) } },
})
