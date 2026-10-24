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

export const REGRA_NOME_USUARIO = 'Use de 3 a 30 letras sem acento, números, ponto ou sublinhado.'

/** Nome de usuário com que o Jogador entra; retorna a mensagem de erro, ou null se valer. */
export function validarNomeUsuario(nome: string): string | null {
  return /^[a-zA-Z0-9._]{3,30}$/.test(nome) ? null : REGRA_NOME_USUARIO
}
