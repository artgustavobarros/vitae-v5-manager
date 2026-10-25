import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/narrador/sorteios')({
  beforeLoad: () => {
    throw redirect({ to: '/narrador/rolagens' })
  },
})
