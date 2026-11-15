import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/narrador/combate')({
  beforeLoad: () => {
    throw redirect({ to: '/combate', replace: true })
  },
})
