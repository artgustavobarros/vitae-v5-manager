export type Papel = 'narrador' | 'jogador'

export function normalizarEmail(email: string): string {
  return email.trim().toLowerCase()
}

/**
 * Decide com qual papel uma pessoa entra no site.
 * Retorna null quando ela não pode entrar: não é o Narrador e não tem Convite para a Crônica.
 */
export function decidirPapel(params: {
  email: string
  narradorEmail: string
  temConvite: boolean
}): Papel | null {
  const narrador = normalizarEmail(params.narradorEmail)
  if (narrador && normalizarEmail(params.email) === narrador) return 'narrador'
  if (params.temConvite) return 'jogador'
  return null
}
