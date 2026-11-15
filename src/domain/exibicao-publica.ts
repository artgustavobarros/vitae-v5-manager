import { filtrarCombateParaJogador, type Combate, type CombateVisivel, type InfoVisibilidadeJogador } from './combate'
import type { EventoReal } from './eventos'
import type { RelogioSalvo } from './relogios'

export type RelogioPublico = Pick<RelogioSalvo, 'id' | 'nome' | 'total' | 'atual' | 'visivel' | 'revisao'>

/** A mesa não é um Jogador: não herda propriedade nem acesso por Coterie. */
export function filtrarCombatePublico(
  combate: Combate,
  condicoesPersonagens: InfoVisibilidadeJogador['condicoesPersonagens'] = {},
): CombateVisivel {
  const publico = filtrarCombateParaJogador(combate, {
    jogadorId: '', meusPersonagemIds: [], coterieIdsDoJogador: [], coteriesPorPersonagem: {}, condicoesPersonagens,
  })
  return {
    ...publico,
    participantes: publico.participantes.map(({ especiais: _especiais, ...participante }) => participante),
  }
}

export function filtrarRelogiosPublicos(relogios: RelogioSalvo[]): RelogioPublico[] {
  return relogios.filter((relogio) => relogio.visivel).map((relogio) => ({
    id: relogio.id,
    nome: relogio.tituloPublico?.trim() || relogio.nome,
    total: relogio.total,
    atual: relogio.atual,
    visivel: relogio.visivel,
    revisao: relogio.revisao,
  }))
}

export function filtrarEventoPublico(evento: EventoReal, relogiosVisiveis: string[]): EventoReal | null {
  if ('apenasNarrador' in evento && evento.apenasNarrador) return null
  if ('paraUsuarioId' in evento && evento.paraUsuarioId) return null
  if (evento.tipo === 'mudanca') {
    if (evento.escopo === 'combate' || evento.escopo === 'personagem') return { tipo: 'mudanca', escopo: 'combate' }
    if (evento.escopo === 'relogios') return { tipo: 'mudanca', escopo: 'relogios' }
  }
  if (evento.tipo === 'efeitos-relogio') {
    const avisos = evento.avisos.filter((aviso) => relogiosVisiveis.includes(aviso.relogioId))
    if (avisos.length > 0) return { tipo: 'efeitos-relogio', apenasNarrador: false, avisos }
  }
  return null
}
