/**
 * Convite para a Crônica: link de uso único que o Narrador gera para uma pessoa criar conta.
 * Cancelar apaga o convite; usar marca quando e por quem.
 */

export type EstadoConvite = 'valido' | 'usado' | 'inexistente'

export function estadoConvite(convite: { usadoEm: Date | null } | undefined): EstadoConvite {
  if (!convite) return 'inexistente'
  return convite.usadoEm ? 'usado' : 'valido'
}

export const REGRA_NOME_USUARIO = 'Use de 3 a 30 letras sem acento, números, ponto ou sublinhado.'

/** Nome de usuário com que o Jogador entra; retorna a mensagem de erro, ou null se valer. */
export function validarNomeUsuario(nome: string): string | null {
  return /^[a-zA-Z0-9._]{3,30}$/.test(nome) ? null : REGRA_NOME_USUARIO
}

/** Cookie que leva o token do link até o cadastro, inclusive na volta do Google. */
export const COOKIE_CONVITE = 'umbra_convite'

/**
 * O better-auth exige e-mail em toda conta. Quem cria conta por nome de usuário e senha
 * recebe um e-mail sintético nesse domínio não roteável (.invalid), que nunca aparece na interface.
 */
export const DOMINIO_EMAIL_SINTETICO = 'jogador.umbra.invalid'
