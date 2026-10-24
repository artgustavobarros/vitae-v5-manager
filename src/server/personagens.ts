import { createServerFn } from '@tanstack/react-start'
import { and, asc, eq } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'
import { z } from 'zod'

import { db } from '#/db'
import { personagem, user } from '#/db/schema'
import { claGeracaoCombinam, fichaNeofito, fichaSchema, marcasSchema, normalizarFicha } from '#/domain/ficha'
import {
  podeApagar,
  podeAtribuir,
  podeCancelarAtribuicao,
  podeConcluir,
  podeResponderAtribuicao,
} from '#/domain/permissoes-ficha'
import { carregar } from '#/server/carregar-personagem'
import { exigirNarrador, exigirUsuario } from '#/server/sessao'

const comId = z.object({ id: z.uuid() })

const atribuido = alias(user, 'atribuido')

export const listarMeusPersonagens = createServerFn({ method: 'GET' })
  .middleware([exigirUsuario])
  .handler(({ context }) =>
    db
      .select({ id: personagem.id, nome: personagem.nome, status: personagem.status })
      .from(personagem)
      .where(eq(personagem.donoId, context.usuario.id))
      .orderBy(asc(personagem.criadoEm)),
  )

/** Rascunhos que o Narrador atribuiu ao Jogador e esperam resposta. */
export const listarAtribuidosAMim = createServerFn({ method: 'GET' })
  .middleware([exigirUsuario])
  .handler(({ context }) =>
    db
      .select({ id: personagem.id, nome: personagem.nome })
      .from(personagem)
      .where(and(eq(personagem.atribuidoA, context.usuario.id), eq(personagem.status, 'rascunho')))
      .orderBy(asc(personagem.criadoEm)),
  )

export const listarTodosPersonagens = createServerFn({ method: 'GET' })
  .middleware([exigirNarrador])
  .handler(async () => {
    const linhas = await db
      .select({
        id: personagem.id,
        nome: personagem.nome,
        status: personagem.status,
        dono: user.name,
        papelDono: user.papel,
        atribuidoA: atribuido.name,
      })
      .from(personagem)
      .innerJoin(user, eq(personagem.donoId, user.id))
      .leftJoin(atribuido, eq(personagem.atribuidoA, atribuido.id))
      .orderBy(asc(user.name), asc(personagem.criadoEm))
    return linhas.map(({ papelDono, dono, ...p }) => ({
      ...p,
      // PdN: Personagem cujo dono é o Narrador.
      jogador: papelDono === 'narrador' ? null : dono,
    }))
  })

export const buscarFicha = createServerFn({ method: 'GET' })
  .middleware([exigirUsuario])
  .validator(comId)
  .handler(async ({ data, context }) => {
    const p = await carregar(context.usuario, data.id, ['editar', 'marcar', 'ler'])
    const [jogador] = p.atribuidoA
      ? await db.select({ id: user.id, nome: user.name }).from(user).where(eq(user.id, p.atribuidoA))
      : []
    return {
      id: p.id,
      nome: p.nome,
      status: p.status,
      ficha: p.ficha,
      acesso: p.acesso,
      /** Jogador que ainda vai aceitar ou recusar este Rascunho. */
      atribuidoA: jogador ?? null,
    }
  })

export const criarRascunho = createServerFn({ method: 'POST' })
  .middleware([exigirUsuario])
  .handler(async ({ context }) => {
    const [p] = await db
      .insert(personagem)
      .values({ donoId: context.usuario.id, ficha: fichaNeofito() })
      .returning({ id: personagem.id })
    return p
  })

export const salvarFicha = createServerFn({ method: 'POST' })
  .middleware([exigirUsuario])
  .validator(z.object({ id: z.uuid(), nome: z.string().trim().max(120), ficha: fichaSchema }))
  .handler(({ data, context }) =>
    db.transaction(async (tx) => {
      const p = await carregar(context.usuario, data.id, ['editar'], tx)
      // Na criação, o Jogador segue a regra de Clã e Geração; o Narrador edita sem validação.
      if (p.status === 'rascunho' && context.usuario.papel === 'jogador' && !claGeracaoCombinam(data.ficha)) {
        throw new Error('Sangue-Ralo é da 14ª à 16ª Geração; os demais clãs, até a 13ª.')
      }
      await tx
        .update(personagem)
        .set({ nome: data.nome, ficha: normalizarFicha(data.ficha) })
        .where(eq(personagem.id, data.id))
    }),
  )

/** Salva uma marca no toque e devolve as marcas como ficaram depois do corte. */
export const marcar = createServerFn({ method: 'POST' })
  .middleware([exigirUsuario])
  .validator(z.object({ id: z.uuid(), marcas: marcasSchema }))
  .handler(({ data, context }) =>
    db.transaction(async (tx) => {
      const p = await carregar(context.usuario, data.id, ['editar', 'marcar'], tx)
      const ficha = normalizarFicha({ ...p.ficha, ...data.marcas })
      await tx.update(personagem).set({ ficha }).where(eq(personagem.id, data.id))
      const { danoVitalidade, danoVontade, fome, manchas } = ficha
      return { danoVitalidade, danoVontade, fome, manchas }
    }),
  )

export const concluir = createServerFn({ method: 'POST' })
  .middleware([exigirUsuario])
  .validator(comId)
  .handler(({ data, context }) =>
    db.transaction(async (tx) => {
      const p = await carregar(context.usuario, data.id, ['editar'], tx)
      if (p.atribuidoA) throw new Error('Cancele a atribuição antes de concluir')
      if (!podeConcluir(context.usuario, p)) throw new Error('Dê um nome ao Personagem antes de concluir')
      await tx.update(personagem).set({ status: 'ativo' }).where(eq(personagem.id, data.id))
    }),
  )

export const apagarRascunho = createServerFn({ method: 'POST' })
  .middleware([exigirUsuario])
  .validator(comId)
  .handler(({ data, context }) =>
    db.transaction(async (tx) => {
      const p = await carregar(context.usuario, data.id, ['editar'], tx)
      if (!podeApagar(context.usuario, p)) throw new Error('Só Rascunhos podem ser apagados')
      await tx.delete(personagem).where(eq(personagem.id, data.id))
    }),
  )

export const atribuir = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .validator(z.object({ id: z.uuid(), jogadorId: z.string().min(1) }))
  .handler(({ data, context }) =>
    db.transaction(async (tx) => {
      const p = await carregar(context.usuario, data.id, ['editar'], tx)
      if (!podeAtribuir(context.usuario, p)) throw new Error('Só um Rascunho seu, ainda sem atribuição, pode ser atribuído')
      const [alvo] = await tx.select({ papel: user.papel }).from(user).where(eq(user.id, data.jogadorId))
      if (alvo?.papel !== 'jogador') throw new Error('Escolha um Jogador da Crônica')
      await tx.update(personagem).set({ atribuidoA: data.jogadorId }).where(eq(personagem.id, data.id))
    }),
  )

export const cancelarAtribuicao = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .validator(comId)
  .handler(({ data, context }) =>
    db.transaction(async (tx) => {
      const p = await carregar(context.usuario, data.id, ['editar'], tx)
      if (!podeCancelarAtribuicao(context.usuario, p)) throw new Error('Este Rascunho não está atribuído')
      await tx.update(personagem).set({ atribuidoA: null }).where(eq(personagem.id, data.id))
    }),
  )

/** Aceitar: o Rascunho passa a ser do Jogador. Recusar: volta a ser só do Narrador. */
export const responderAtribuicao = createServerFn({ method: 'POST' })
  .middleware([exigirUsuario])
  .validator(z.object({ id: z.uuid(), aceitar: z.boolean() }))
  .handler(({ data, context }) =>
    db.transaction(async (tx) => {
      const p = await carregar(context.usuario, data.id, ['ler'], tx)
      if (!podeResponderAtribuicao(context.usuario, p)) throw new Error('Este Personagem não está atribuído a você')
      await tx
        .update(personagem)
        .set(data.aceitar ? { donoId: context.usuario.id, atribuidoA: null } : { atribuidoA: null })
        .where(eq(personagem.id, data.id))
    }),
  )
