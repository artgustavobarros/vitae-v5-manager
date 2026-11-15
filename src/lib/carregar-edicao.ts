/** Decide o redirecionamento ou a Ficha disponível para edição. */
export type CarregamentoEdicao<P> =
  | { tipo: 'inexistente' }
  | { tipo: 'semEdicao' }
  | { tipo: 'editar'; personagem: P }

export async function carregarEdicao<P extends { acesso: string }>(
  buscarFicha: () => Promise<P | null>,
): Promise<CarregamentoEdicao<P>> {
  const personagem = await buscarFicha().catch(() => null)
  if (!personagem) return { tipo: 'inexistente' }
  if (personagem.acesso !== 'editar') return { tipo: 'semEdicao' }
  return { tipo: 'editar', personagem }
}
