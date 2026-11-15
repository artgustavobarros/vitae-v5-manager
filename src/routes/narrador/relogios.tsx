import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/narrador/relogios')({
  beforeLoad: () => {
    throw redirect({ to: '/relogios', replace: true })
  },
})
