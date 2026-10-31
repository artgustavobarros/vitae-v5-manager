import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/narrador/antagonistas_/aprovacao')({
  beforeLoad: () => { throw redirect({ to: '/narrador/antagonistas', replace: true }) },
})
