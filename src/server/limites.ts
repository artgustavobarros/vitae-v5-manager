/** Retorna os segundos até uma nova tentativa; zero permite a requisição. */
export function criarLimitador(maximo: number, janelaMs: number, maximoChaves = 10_000) {
  const entradas = new Map<string, { quantidade: number; ate: number }>()
  return (chave: string): number => {
    const agora = Date.now()
    let entrada = entradas.get(chave)
    if (!entrada || entrada.ate <= agora) {
      if (!entrada && entradas.size >= maximoChaves) {
        for (const [id, valor] of entradas) if (valor.ate <= agora) entradas.delete(id)
        if (entradas.size >= maximoChaves) return Math.ceil(janelaMs / 1000)
      }
      entrada = { quantidade: 0, ate: agora + janelaMs }
      entradas.set(chave, entrada)
    }
    if (entrada.quantidade >= maximo) return Math.ceil((entrada.ate - agora) / 1000)
    entrada.quantidade++
    return 0
  }
}

export function respostaLimite(segundos: number) {
  return new Response('Muitas tentativas. Aguarde e tente novamente.', {
    status: 429,
    headers: { 'Retry-After': String(segundos), 'Cache-Control': 'no-store' },
  })
}

export function criarLimiteConexoes(maximo: number) {
  const conexoes = new Map<string, number>()
  return (usuarioId: string): (() => void) | null => {
    const quantidade = conexoes.get(usuarioId) ?? 0
    if (quantidade >= maximo) return null
    conexoes.set(usuarioId, quantidade + 1)
    let liberada = false
    return () => {
      if (liberada) return
      liberada = true
      const restantes = (conexoes.get(usuarioId) ?? 1) - 1
      if (restantes > 0) conexoes.set(usuarioId, restantes)
      else conexoes.delete(usuarioId)
    }
  }
}

// shortcut: contadores por processo; usar armazenamento compartilhado ao subir mais de uma réplica.
export const limitarHttp = criarLimitador(600, 60_000)
export const limitarUsuario = criarLimitador(300, 60_000)
export const limitarConvite = criarLimitador(30, 60_000)
export const reservarConexaoTempoReal = criarLimiteConexoes(5)
