import type { DestinoNotificacao } from '#/db/schema'

import { vitalidadeMax, vontadeMax, type Ficha } from './ficha'

export type TipoCondicaoCritica =
  | 'fome_5'
  | 'vitalidade_cheia'
  | 'vitalidade_agravada'
  | 'vontade_cheia'

/**
 * Detecta se houve transição para uma condição crítica.
 * Retorna o tipo de condição se houve transição que ainda não estava presente no estado anterior.
 */
export function detectarTransicaoCondicaoCritica(
  antes: Ficha,
  depois: Ficha,
): TipoCondicaoCritica | null {
  // 1. Fome 5
  if (depois.fome === 5 && antes.fome < 5) {
    return 'fome_5'
  }

  const maxVit = vitalidadeMax(depois)
  const maxVont = vontadeMax(depois)

  // 2. Vitalidade toda em dano agravado
  const agravadoDepois = depois.danoVitalidade.agravado
  const agravadoAntes = antes.danoVitalidade.agravado
  if (agravadoDepois >= maxVit && agravadoAntes < maxVit) {
    return 'vitalidade_agravada'
  }

  // 3. Vitalidade toda preenchida (superficial + agravado)
  const totalVitDepois = depois.danoVitalidade.superficial + depois.danoVitalidade.agravado
  const totalVitAntes = antes.danoVitalidade.superficial + antes.danoVitalidade.agravado
  if (totalVitDepois >= maxVit && totalVitAntes < maxVit) {
    return 'vitalidade_cheia'
  }

  // 4. Força de Vontade toda preenchida
  const totalVontDepois = depois.danoVontade.superficial + depois.danoVontade.agravado
  const totalVontAntes = antes.danoVontade.superficial + antes.danoVontade.agravado
  if (totalVontDepois >= maxVont && totalVontAntes < maxVont) {
    return 'vontade_cheia'
  }

  return null
}

export const notificacoesEventos = {
  // Para o Jogador
  atribuicao: (nomePersonagem: string): { texto: string; destino: DestinoNotificacao } => ({
    texto: `O Narrador atribuiu ${nomePersonagem} a você`,
    destino: { to: '/' },
  }),

  conviteCoterie: (
    nomePersonagem: string,
    nomeCoterie: string,
  ): { texto: string; destino: DestinoNotificacao } => ({
    texto: `Convite para ${nomePersonagem} entrar em ${nomeCoterie}`,
    destino: { to: '/' },
  }),

  removidoCoterie: (
    nomePersonagem: string,
    nomeCoterie: string,
    personagemId: string,
  ): { texto: string; destino: DestinoNotificacao } => ({
    texto: `${nomePersonagem} foi removido de ${nomeCoterie}`,
    destino: { to: '/personagens/$id', params: { id: personagemId } },
  }),

  coterieApagada: (
    nomeCoterie: string,
    personagemId: string,
  ): { texto: string; destino: DestinoNotificacao } => ({
    texto: `A Coterie ${nomeCoterie} foi apagada`,
    destino: { to: '/personagens/$id', params: { id: personagemId } },
  }),

  narradorEditouFicha: (
    nomePersonagem: string,
    personagemId: string,
  ): { texto: string; destino: DestinoNotificacao } => ({
    texto: `O Narrador editou a Ficha de ${nomePersonagem}`,
    destino: { to: '/personagens/$id', params: { id: personagemId } },
  }),

  // Para o Narrador
  novoJogador: (nomeJogador: string): { texto: string; destino: DestinoNotificacao } => ({
    texto: `${nomeJogador} entrou na Crônica`,
    destino: { to: '/narrador/convites' },
  }),

  personagemConcluido: (
    nomeJogador: string,
    nomePersonagem: string,
    personagemId: string,
  ): { texto: string; destino: DestinoNotificacao } => ({
    texto: `${nomeJogador} concluiu ${nomePersonagem}`,
    destino: { to: '/personagens/$id', params: { id: personagemId } },
  }),

  atribuicaoAceita: (
    nomeJogador: string,
    nomePersonagem: string,
    personagemId: string,
  ): { texto: string; destino: DestinoNotificacao } => ({
    texto: `${nomeJogador} aceitou ${nomePersonagem}`,
    destino: { to: '/personagens/$id', params: { id: personagemId } },
  }),

  atribuicaoRecusada: (
    nomeJogador: string,
    nomePersonagem: string,
    personagemId: string,
  ): { texto: string; destino: DestinoNotificacao } => ({
    texto: `${nomeJogador} recusou ${nomePersonagem}`,
    destino: { to: '/personagens/$id', params: { id: personagemId } },
  }),

  conviteCoterieAceito: (
    nomePersonagem: string,
    nomeCoterie: string,
    coterieId: string,
  ): { texto: string; destino: DestinoNotificacao } => ({
    texto: `${nomePersonagem} entrou em ${nomeCoterie}`,
    destino: { to: '/coteries/$id', params: { id: coterieId } },
  }),

  conviteCoterieRecusado: (
    nomeJogador: string,
    nomePersonagem: string,
    nomeCoterie: string,
    coterieId: string,
  ): { texto: string; destino: DestinoNotificacao } => ({
    texto: `${nomeJogador} recusou o convite de ${nomeCoterie} para ${nomePersonagem}`,
    destino: { to: '/coteries/$id', params: { id: coterieId } },
  }),

  personagemSaiuCoterie: (
    nomePersonagem: string,
    nomeCoterie: string,
    coterieId: string,
  ): { texto: string; destino: DestinoNotificacao } => ({
    texto: `${nomePersonagem} saiu de ${nomeCoterie}`,
    destino: { to: '/coteries/$id', params: { id: coterieId } },
  }),

  condicaoCritica: (
    tipo: TipoCondicaoCritica,
    nomePersonagem: string,
    personagemId: string,
  ): { texto: string; destino: DestinoNotificacao } => {
    let detalhe = ''
    switch (tipo) {
      case 'fome_5':
        detalhe = 'chegou a Fome 5'
        break
      case 'vitalidade_agravada':
        detalhe = 'está com a Vitalidade toda em dano agravado'
        break
      case 'vitalidade_cheia':
        detalhe = 'preencheu toda a Vitalidade'
        break
      case 'vontade_cheia':
        detalhe = 'preencheu toda a Força de Vontade'
        break
    }
    return {
      texto: `${nomePersonagem} ${detalhe}`,
      destino: { to: '/personagens/$id', params: { id: personagemId } },
    }
  },
}
