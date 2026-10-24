export type Papel = 'narrador' | 'jogador'

export function normalizarEmail(email: string): string {
  return email.trim().toLowerCase()
}

/**
 * Decide com qual papel uma pessoa cria conta no site.
 * Retorna null quando ela não pode: não é o Narrador e não tem Convite para a Crônica válido.
 * Fora do dev, o Narrador só cria conta pelo Google: por senha, bastaria saber o e-mail dele.
 */
export function decidirPapel(params: {
  email: string
  narradorEmail: string
  temConvite: boolean
  metodo?: 'google' | 'senha'
  dev?: boolean
}): Papel | null {
  const narrador = normalizarEmail(params.narradorEmail)
  const ehNarrador = narrador !== '' && normalizarEmail(params.email) === narrador
  if (ehNarrador && (params.metodo !== 'senha' || params.dev)) return 'narrador'
  if (params.temConvite) return 'jogador'
  return null
}
