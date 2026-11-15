import type { EventoReal } from '#/domain/eventos'

export function conectarExibicaoPublica(token: string, acoes: {
  atualizar: () => void
  revogar: () => void
  conexao: (conectado: boolean) => void
}) {
  const fonte = new EventSource(`/api/publico/${encodeURIComponent(token)}/tempo-real`)
  fonte.onopen = () => { acoes.conexao(true); acoes.atualizar() }
  fonte.onerror = () => { acoes.conexao(false); acoes.atualizar() }
  fonte.addEventListener('revogado', () => { fonte.close(); acoes.revogar() })
  fonte.onmessage = (evento) => {
    const dados: EventoReal = JSON.parse(evento.data)
    if (dados.tipo === 'mudanca') acoes.atualizar()
  }
  return () => fonte.close()
}
