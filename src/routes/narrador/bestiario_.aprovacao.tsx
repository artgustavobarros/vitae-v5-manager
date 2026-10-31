import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/narrador/bestiario_/aprovacao')({
  beforeLoad: () => { throw redirect({ to: '/narrador/antagonistas', replace: true }) },
})
