export type Papel = 'narrador' | 'jogador'

export function normalizarEmail(email: string): string {
  return email.trim().toLowerCase()
}

const PARTICULAS = new Set(['da', 'das', 'de', 'do', 'dos', 'e'])

/** Os dois primeiros nomes da conta Google: "Maria da Silva Santos" vira "Maria da Silva". */
export function nomeCurto(nome: string): string {
  const [primeiro, ...resto] = nome.trim().split(/\s+/)
  const partes = [primeiro]
  for (const palavra of resto) {
    partes.push(palavra)
    if (!PARTICULAS.has(palavra.toLowerCase())) break
  }
  return partes.join(' ')
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
