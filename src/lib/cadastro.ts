/** Cookie que leva o token do Convite para a Crônica até o cadastro, inclusive na volta do Google. */
export const COOKIE_CONVITE = 'umbra_convite'

/**
 * O better-auth exige e-mail em toda conta. Quem cria conta por nome de usuário e senha
 * recebe um e-mail sintético nesse domínio não roteável (.invalid), que nunca aparece na interface.
 */
export const DOMINIO_EMAIL_SINTETICO = 'jogador.umbra.invalid'
