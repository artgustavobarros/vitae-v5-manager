/**
 * Decide o que a tela de edição carrega. As opções de criação da Crônica começam em paralelo
 * com a Ficha, mas a Ficha decide primeiro: inexistente ou sem acesso de edição redireciona mesmo que
 * as opções falhem ou demorem.
 */
export type CarregamentoEdicao<P, O> =
  | { tipo: 'inexistente' }
  | { tipo: 'semEdicao' }
  | { tipo: 'editar'; personagem: P; opcoesCronica: O }

export async function carregarEdicao<P extends { acesso: string }, O>(
  buscarFicha: () => Promise<P | null>,
  obterOpcoesCronica: () => Promise<O>,
): Promise<CarregamentoEdicao<P, O>> {
  const opcoes = obterOpcoesCronica()
  // Se um redirecionamento vencer, a falha das opções não pode virar rejeição não tratada.
  opcoes.catch(() => {})
  const personagem = await buscarFicha().catch(() => null)
  if (!personagem) return { tipo: 'inexistente' }
  if (personagem.acesso !== 'editar') return { tipo: 'semEdicao' }
  return { tipo: 'editar', personagem, opcoesCronica: await opcoes }
}
