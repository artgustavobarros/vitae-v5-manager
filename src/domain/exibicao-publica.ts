import { calcularEstadoSaude, type Combate, type CombateVisivel, type ParticipanteVisivel } from './combate'
import type { Condicao } from './condicao'
import type { EventoReal } from './eventos'
import type { RelogioSalvo } from './relogios'

export type RelogioPublico = Pick<RelogioSalvo, 'id' | 'nome' | 'total' | 'atual' | 'visivel' | 'revisao'>
export type CondicoesPersonagens = Record<string, Condicao>

/** Só a escolha explícita do Narrador autoriza divulgar os valores. */
export function filtrarCombatePublico(
  combate: Combate,
  condicoesPersonagens: CondicoesPersonagens = {},
): CombateVisivel {
  const participantesVisiveis: ParticipanteVisivel[] = combate.participantes.map((p) => {
    if (p.tipo === 'inimigo') {
      const ehVampiro = p.categoria?.toLowerCase().includes('vampiro') ?? false
      const estadoSaude = calcularEstadoSaude(
        p.vitalidadeMax,
        p.danoVitalidade,
        ehVampiro,
        p.condicoes,
      )
      if (p.revelarVitalidade) {
        return {
          id: p.id,
          tipo: 'inimigo',
          nome: p.nome,
          categoria: p.categoria,
          vitalidadeOculta: false,
          vitalidadeMax: p.vitalidadeMax,
          danoVitalidade: p.danoVitalidade,
          revelarVitalidade: true,
          condicoes: p.condicoes ?? [],
          estadoSaude,
        }
      }
      return {
        id: p.id,
        tipo: 'inimigo',
        nome: p.nome,
        categoria: p.categoria,
        vitalidadeOculta: true,
        revelarVitalidade: false,
        condicoes: p.condicoes ?? [],
        estadoSaude,
      }
    }

    // p.tipo === 'personagem'
    const condicaoInfo = condicoesPersonagens[p.personagemId]
    const estadoSaude = condicaoInfo
      ? calcularEstadoSaude(
          condicaoInfo.vitalidadeMax,
          condicaoInfo.danoVitalidade,
          true,
          p.condicoes,
        )
      : undefined

    if (p.revelarCondicao !== false && condicaoInfo) {
      return {
        id: p.id,
        tipo: 'personagem',
        nome: p.nome,
        ehPdn: p.ehPdN ?? p.ehPdn,
        ehPdN: p.ehPdN ?? p.ehPdn,
        jogadorNome: p.jogadorNome ?? null,
        personagemId: p.personagemId,
        ehMeu: false,
        condicoes: p.condicoes ?? [],
        estadoSaude,
        condicaoOculta: false,
        condicao: {
          vitalidadeMax: condicaoInfo.vitalidadeMax,
          vontadeMax: condicaoInfo.vontadeMax,
          danoVitalidade: condicaoInfo.danoVitalidade,
          danoVontade: condicaoInfo.danoVontade,
          fome: condicaoInfo.fome,
        },
      }
    }

    return {
      id: p.id,
      tipo: 'personagem',
      nome: p.nome,
      ehPdn: p.ehPdN ?? p.ehPdn,
      ehPdN: p.ehPdN ?? p.ehPdn,
      jogadorNome: p.jogadorNome ?? null,
      personagemId: p.personagemId,
      ehMeu: false,
      condicoes: p.condicoes ?? [],
      estadoSaude,
      condicaoOculta: true,
    }
  })

  return {
    id: combate.id,
    rodada: combate.rodada,
    turnoAtual: combate.turnoAtual,
    participantes: participantesVisiveis,
    ativo: combate.ativo,
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

export function filtrarEventoPublico(evento: EventoReal): EventoReal | null {
  if (evento.apenasNarrador) return null
  if (evento.escopo === 'combate' || evento.escopo === 'personagem') return { tipo: 'mudanca', escopo: 'combate' }
  if (evento.escopo === 'relogios') return { tipo: 'mudanca', escopo: 'relogios' }
  return null
}
