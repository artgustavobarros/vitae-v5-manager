import { REGRA_NOME_USUARIO } from '#/domain/convite'

const SEM_CONVITE = 'Não foi possível criar a conta. Para entrar na Crônica, peça ao Narrador um Convite para a Crônica.'

const MENSAGENS: Record<string, string> = {
  sem_convite: SEM_CONVITE,
  unable_to_create_user: SEM_CONVITE,
  failed_to_create_user: SEM_CONVITE,
  signup_disabled: SEM_CONVITE,
  account_not_linked:
    'Já existe uma conta com esse e-mail criada de outro jeito. Entre pelo método que você usou da primeira vez.',
  invalid_username_or_password: 'Nome de usuário ou senha errados.',
  invalid_email_or_password: 'E-mail ou senha errados.',
  username_is_already_taken: 'Esse nome de usuário já existe. Escolha outro.',
  invalid_username: REGRA_NOME_USUARIO,
  username_too_short: REGRA_NOME_USUARIO,
  username_too_long: REGRA_NOME_USUARIO,
  password_too_short: 'A senha precisa de pelo menos 8 caracteres.',
  password_too_long: 'A senha é longa demais.',
  invalid_password: 'A senha atual está errada.',
  account_already_linked_to_different_user: 'Essa conta Google já está ligada a outra conta da Crônica.',
  unable_to_link_account: 'Não deu para conectar ao Google. Tente de novo.',
  access_denied: 'A conexão com o Google foi cancelada.',
}

/** Erro do better-auth (código ou mensagem) em PT-BR. */
export function mensagemErroAuth(erro: { code?: string; message?: string } | string): string {
  const codigo = typeof erro === 'string' ? erro : (erro.code ?? erro.message ?? 'desconhecido')
  return MENSAGENS[codigo.toLowerCase()] ?? `Não deu certo (erro: ${codigo}).`
}
