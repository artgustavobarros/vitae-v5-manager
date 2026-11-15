const SOMENTE_NARRADOR = 'Esta área é exclusiva do Narrador. Para acompanhar a mesa, use o link público compartilhado por ele.'

const MENSAGENS: Record<string, string> = {
  somente_narrador: SOMENTE_NARRADOR,
  unable_to_create_user: SOMENTE_NARRADOR,
  failed_to_create_user: SOMENTE_NARRADOR,
  signup_disabled: SOMENTE_NARRADOR,
  account_not_linked:
    'Esta conta ainda não tem Google vinculado. Peça ajuda ao Narrador.',
  account_already_linked_to_different_user: 'Essa conta Google já está ligada a outra conta da Crônica.',
  unable_to_link_account: 'Não deu para conectar ao Google. Tente de novo.',
  access_denied: 'A conexão com o Google foi cancelada.',
}

/** Erro do better-auth (código ou mensagem) em PT-BR. */
export function mensagemErroAuth(erro: { code?: string; message?: string } | string): string {
  const codigo = typeof erro === 'string' ? erro : (erro.code ?? erro.message ?? 'desconhecido')
  return MENSAGENS[codigo.toLowerCase()] ?? `Não deu certo (erro: ${codigo}).`
}
