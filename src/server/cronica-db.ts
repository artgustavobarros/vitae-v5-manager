import { eq } from 'drizzle-orm'

import { db } from '#/db'
import { cronica } from '#/db/schema'
import {
  OPCOES_CRIACAO_CRONICA_PADRAO,
  type OpcoesCriacaoCronica,
} from '#/domain/cronica'

/**
 * Retorna as opções de criação da Crônica configuradas pelo Narrador.
 * Se nenhuma linha existir na tabela `cronica`, cria uma linha inicial com os padrões.
 * Fica fora de cronica.ts para não vazar `pg` para o bundle do cliente.
 */
export async function obterOpcoesCriacaoCronicaDoBanco(): Promise<OpcoesCriacaoCronica> {
  const [existente] = await db.select().from(cronica).limit(1)
  if (existente) {
    return existente.opcoesCriacao
  }

  const [criado] = await db
    .insert(cronica)
    .values({
      nome: 'Crônica',
      opcoesCriacao: OPCOES_CRIACAO_CRONICA_PADRAO,
    })
    .returning()

  return criado.opcoesCriacao
}

/**
 * Atualiza as opções de criação da Crônica no banco.
 */
export async function atualizarOpcoesCriacaoCronicaNoBanco(
  data: OpcoesCriacaoCronica,
): Promise<OpcoesCriacaoCronica> {
  const [existente] = await db.select().from(cronica).limit(1)

  if (!existente) {
    const [criado] = await db
      .insert(cronica)
      .values({
        nome: 'Crônica',
        opcoesCriacao: data,
      })
      .returning()

    return criado.opcoesCriacao
  }

  const [atualizado] = await db
    .update(cronica)
    .set({
      opcoesCriacao: data,
      atualizadoEm: new Date(),
    })
    .where(eq(cronica.id, existente.id))
    .returning()

  return atualizado.opcoesCriacao
}
