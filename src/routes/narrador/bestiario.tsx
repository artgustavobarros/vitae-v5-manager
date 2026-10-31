import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/narrador/bestiario')({
  beforeLoad: () => { throw redirect({ to: '/narrador/antagonistas', replace: true }) },
})
