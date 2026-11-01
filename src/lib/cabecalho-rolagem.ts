/** Filtra oscilações de 8 px e o rebote do navegador, mantendo os primeiros 56 px sempre visíveis. */
export function criarControleCabecalho(posicaoInicial = 0) {
  let anterior = Math.max(0, posicaoInicial)
  let origem = anterior
  let sentido = 0
  let oculto = false

  return (posicao: number, maximo = Infinity): boolean => {
    const atual = Math.min(Math.max(0, posicao), Math.max(0, maximo))
    const delta = atual - anterior
    if (atual <= 56) {
      oculto = false
      origem = atual
      sentido = 0
    } else if (delta !== 0) {
      const proximoSentido = Math.sign(delta)
      if (proximoSentido !== sentido) {
        origem = anterior
        sentido = proximoSentido
      }
      if (Math.abs(atual - origem) >= 8) oculto = sentido > 0
    }
    anterior = atual
    return oculto
  }
}
