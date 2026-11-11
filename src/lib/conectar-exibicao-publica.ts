import type { EventoReal } from '#/domain/eventos'
import type { AvisoRelogio } from '#/domain/relogios'

export function conectarExibicaoPublica(token: string, acoes: {
  atualizar: () => void
  avisar: (avisos: AvisoRelogio[]) => void
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
    if (dados.tipo === 'efeitos-relogio') acoes.avisar(dados.avisos)
  }
  return () => fonte.close()
}
