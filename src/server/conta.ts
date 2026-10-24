import { randomInt } from 'node:crypto'

import { createServerFn } from '@tanstack/react-start'
import { asc, eq } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '#/db'
import { account, personagem, session, user } from '#/db/schema'
import { podeRemoverJogador } from '#/domain/convite'
import { auth } from '#/lib/auth'
import { buscarCredencial, idsComSenha } from '#/server/credencial'
import { exigirNarrador, exigirUsuario } from '#/server/sessao'

/** Dados da página de configurações; `temSenha` é false para conta só Google. */
export const buscarConta = createServerFn({ method: 'GET' })
  .middleware([exigirUsuario])
  .handler(async ({ context }) => {
    const [dados] = await db
      .select({ nome: user.name, nomeUsuario: user.displayUsername, usuarioNormalizado: user.username })
      .from(user)
      .where(eq(user.id, context.usuario.id))
    const senha = await buscarCredencial(context.usuario.id)
    return {
      nome: dados.nome,
      nomeUsuario: dados.nomeUsuario ?? dados.usuarioNormalizado,
      temSenha: senha !== undefined,
    }
  })

export const listarJogadores = createServerFn({ method: 'GET' })
  .middleware([exigirNarrador])
  .handler(async () => {
    const jogadores = await db
      .select({ id: user.id, nome: user.name, nomeUsuario: user.displayUsername })
      .from(user)
      .where(eq(user.papel, 'jogador'))
      .orderBy(asc(user.name))
    const comSenha = await idsComSenha()
    return jogadores.map((j) => ({ ...j, temSenha: comSenha.has(j.id) }))
  })

// Sem 0/O e 1/l/I, para ditar a senha na mesa sem confusão.
const ALFABETO = 'abcdefghjkmnpqrstuvwxyz23456789'

/** O Narrador gera uma senha nova para um Jogador que esqueceu a dele; as sessões abertas caem. */
export const gerarSenhaNova = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .validator(z.object({ userId: z.string().min(1) }))
  .handler(async ({ data }) => {
    const jogador = await db.query.user.findFirst({ where: eq(user.id, data.userId) })
    const credencial = await buscarCredencial(data.userId)
    if (jogador?.papel !== 'jogador' || !credencial) throw new Error('Esse Jogador entra pelo Google, sem senha.')
    const senha = Array.from({ length: 12 }, () => ALFABETO[randomInt(ALFABETO.length)]).join('')
    const contexto = await auth.$context
    await db
      .update(account)
      .set({ password: await contexto.password.hash(senha) })
      .where(eq(account.id, credencial.id))
    await db.delete(session).where(eq(session.userId, data.userId))
    return { senha }
  })

/** Remove o Jogador da Crônica: os Personagens dele passam para o Narrador e a conta é apagada. */
export const removerJogador = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .validator(z.object({ userId: z.string().min(1) }))
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
