import { db } from '#/db'
import { cronica } from '#/db/schema'
import {
  OPCOES_CRIACAO_CRONICA_PADRAO,
  type OpcoesCriacaoCronica,
} from '#/domain/cronica'

/**
 * Preserva a idade de criação legada sem reativar a configuração da Crônica.
 * A leitura não cria nem altera registros.
 */
export async function obterOpcoesCriacaoCronicaDoBanco(): Promise<OpcoesCriacaoCronica> {
  const [existente] = await db.select().from(cronica).limit(1)
  return existente?.opcoesCriacao ?? OPCOES_CRIACAO_CRONICA_PADRAO
}
