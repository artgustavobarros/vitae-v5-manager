const SEM_CONVITE = 'Não foi possível criar a conta. Para entrar na Crônica, peça ao Narrador um Convite para a Crônica.'

const MENSAGENS: Record<string, string> = {
  sem_convite: SEM_CONVITE,
  unable_to_create_user: SEM_CONVITE,
  failed_to_create_user: SEM_CONVITE,
  signup_disabled: SEM_CONVITE,
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
