import { createServerFn } from '@tanstack/react-start'
import { asc, eq } from 'drizzle-orm'
import { z } from 'zod'
import { identificadorSchema } from '#/domain/limites-entrada'

import { db } from '#/db'
import { personagem, user } from '#/db/schema'
import { podeRemoverJogador } from '#/domain/convite'
import { exigirNarrador, exigirUsuario } from '#/server/sessao'

/** Nome exibido na Crônica; a autenticação é gerenciada pela conta Google. */
export const buscarConta = createServerFn({ method: 'GET' })
  .middleware([exigirUsuario])
  .handler(async ({ context }) => {
    const [dados] = await db
      .select({ nome: user.name })
      .from(user)
      .where(eq(user.id, context.usuario.id))
    return dados
  })

export const listarJogadores = createServerFn({ method: 'GET' })
  .middleware([exigirNarrador])
  .handler(async () => {
    const jogadores = await db
      .select({
        id: user.id,
        nome: user.name,
        imagem: user.image,
      })
      .from(user)
      .where(eq(user.papel, 'jogador'))
      .orderBy(asc(user.name))
    return jogadores
  })

/** Remove o Jogador da Crônica: os Personagens dele passam para o Narrador e a conta é apagada. */
export const removerJogador = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .validator(z.object({ userId: identificadorSchema }))
  .handler(({ data, context }) =>
    db.transaction(async (tx) => {
      const [alvo] = await tx.select({ papel: user.papel }).from(user).where(eq(user.id, data.userId))
      if (!alvo || !podeRemoverJogador(context.usuario, { papel: alvo.papel as 'jogador' | 'narrador' })) {
        throw new Error('Só Jogadores podem ser removidos da Crônica')
      }
      await tx.update(personagem).set({ donoId: context.usuario.id }).where(eq(personagem.donoId, data.userId))
      // Atribuições pendentes para ele caem junto (FK com set null), e sessões e credenciais, em cascata.
      await tx.delete(user).where(eq(user.id, data.userId))
    }),
  )
