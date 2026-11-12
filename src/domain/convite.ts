import type { Papel } from './acesso'

/**
 * Convite para a Crônica: um link só, que o Narrador compartilha com a mesa.
 * Quem tem o link cria conta como Jogador. Gerar um link novo substitui o anterior.
 */

export type EstadoConvite = 'valido' | 'substituido' | 'inexistente'

export function estadoConvite(convite: { substituidoEm: Date | null } | undefined): EstadoConvite {
  if (!convite) return 'inexistente'
  return convite.substituidoEm ? 'substituido' : 'valido'
}

/** Remover um Jogador da Crônica: os Personagens dele passam para o Narrador. */
export function podeRemoverJogador(usuario: { papel: Papel }, alvo: { papel: Papel }): boolean {
  return usuario.papel === 'narrador' && alvo.papel === 'jogador'
}
