import type { DestinoNotificacao } from '#/db/schema'

import { vitalidadeMax, vontadeMax, type Ficha } from './ficha'

export type MudancaCondicao =
  | 'fome_4'
  | 'fome_5'
  | 'vitalidade_cheia'
  | 'vitalidade_curada'
  | 'vontade_cheia'
  | 'vontade_curada'

/**
 * Mudanças de Condição que o Narrador acompanha: a Fome chegando a 4 e a 5, e Vitalidade ou Força de Vontade
 * ficando toda preenchida (qualquer dano) ou toda curada. Só conta a transição, não o estado que já estava.
 */
export function detectarMudancasCondicao(antes: Ficha, depois: Ficha): MudancaCondicao[] {
  const mudancas: MudancaCondicao[] = []

  // De 3 direto para 5 avisa só a Fome 5.
  if (depois.fome >= 5 && antes.fome < 5) mudancas.push('fome_5')
  else if (depois.fome >= 4 && antes.fome < 4) mudancas.push('fome_4')

  const trilhas = [
    { nome: 'vitalidade', max: vitalidadeMax(depois), antes: antes.danoVitalidade, depois: depois.danoVitalidade },
    { nome: 'vontade', max: vontadeMax(depois), antes: antes.danoVontade, depois: depois.danoVontade },
  ] as const
  for (const t of trilhas) {
    const totalAntes = t.antes.superficial + t.antes.agravado
    const totalDepois = t.depois.superficial + t.depois.agravado
    if (totalDepois >= t.max && totalAntes < t.max) mudancas.push(`${t.nome}_cheia`)
    else if (totalDepois === 0 && totalAntes > 0) mudancas.push(`${t.nome}_curada`)
  }

  return mudancas
}

const DETALHE_MUDANCA: Record<MudancaCondicao, string> = {
  fome_4: 'chegou a Fome 4',
  fome_5: 'chegou a Fome 5',
  vitalidade_cheia: 'preencheu toda a Vitalidade',
  vitalidade_curada: 'curou toda a Vitalidade',
  vontade_cheia: 'preencheu toda a Força de Vontade',
  vontade_curada: 'recuperou toda a Força de Vontade',
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

  combateIniciado: (nomePersonagem: string): { texto: string; destino: DestinoNotificacao } => ({
    texto: `Combate iniciado com ${nomePersonagem}`,
    destino: { to: '/combate' },
  }),

  ressonanciaAplicada: (
    nomePersonagem: string,
    ressonancia: string,
    personagemId: string,
  ): { texto: string; destino: DestinoNotificacao } => ({
    texto: `Ressonância Atual aplicada a ${nomePersonagem}: ${ressonancia}`,
    destino: { to: '/personagens/$id', params: { id: personagemId } },
  }),

  compulsaoAplicada: (
    nomePersonagem: string,
    compulsao: string,
    personagemId: string,
  ): { texto: string; destino: DestinoNotificacao } => ({
    texto: `Compulsão Ativa aplicada a ${nomePersonagem}: ${compulsao}`,
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

  mudancaCondicao: (
    mudanca: MudancaCondicao,
    nomePersonagem: string,
    personagemId: string,
  ): { texto: string; destino: DestinoNotificacao } => ({
    texto: `${nomePersonagem} ${DETALHE_MUDANCA[mudanca]}`,
    destino: { to: '/personagens/$id', params: { id: personagemId } },
  }),

}
