import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'

import { db } from '#/db'
import { cronica } from '#/db/schema'
import {
  OPCOES_CRIACAO_CRONICA_PADRAO,
  opcoesCriacaoCronicaSchema,
  type OpcoesCriacaoCronica,
} from '#/domain/cronica'

export type { OpcoesCriacaoCronica }
import { exigirNarrador, exigirUsuario } from '#/server/sessao'

/**
 * Retorna as opções de criação da Crônica configuradas pelo Narrador.
 * Se nenhuma linha existir na tabela `cronica`, cria uma linha inicial com os padrões.
 * Disponível para qualquer usuário autenticado (Jogador ou Narrador).
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

export const obterOpcoesCriacaoCronica = createServerFn({ method: 'GET' })
  .middleware([exigirUsuario])
  // @ts-expect-error O plugin de build do TanStack Start injeta serverFn como 2º argumento; passar explicitamente permite execução direta de testes
  .handler(obterOpcoesCriacaoCronicaDoBanco, obterOpcoesCriacaoCronicaDoBanco)

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

export const atualizarOpcoesCriacaoCronica = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .validator(opcoesCriacaoCronicaSchema)
  .handler(
    async ({ data }: { data: OpcoesCriacaoCronica }) => atualizarOpcoesCriacaoCronicaNoBanco(data),
    // @ts-expect-error Injeta 2o argumento serverFn para testes unitarios diretos
    async ({ data }: { data: OpcoesCriacaoCronica }) => atualizarOpcoesCriacaoCronicaNoBanco(data),
  )
