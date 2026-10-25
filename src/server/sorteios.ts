import { createServerFn } from '@tanstack/react-start'
import { eq } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '#/db'
import {
  personagem,
  user,
  type CompulsaoAtivaPersonagem,
  type RessonanciaAtualPersonagem,
} from '#/db/schema'
import type { Cla } from '#/domain/ficha'
import { notificacoesEventos } from '#/domain/notificacoes'
import {
  ehSangueFraco,
  sortearCompulsao,
  sortearDiscrasia,
  sortearRessonancia,
  type TipoRessonancia,
} from '#/domain/sorteios'
import { enviarNotificacao } from '#/server/enviar-notificacao'
import { barramento } from '#/server/eventos'
import { exigirNarrador } from '#/server/sessao'

export const sortearRessonanciaServer = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .handler(async () => {
    return sortearRessonancia()
  })

export const sortearDiscrasiaServer = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .validator(
    z.object({
      tipoRessonancia: z.enum(['colerico', 'melancolico', 'fleumatico', 'sanguineo']).optional(),
    }),
  )
  .handler(async ({ data }: { data: { tipoRessonancia?: TipoRessonancia } }) => {
    return sortearDiscrasia(data.tipoRessonancia)
  })

export const sortearCompulsaoServer = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .validator(
    z.object({
      tipo: z.enum(['geral', 'cla']),
      claId: z.string().optional(),
    }),
  )
  .handler(async ({ data }: { data: { tipo: 'geral' | 'cla'; claId?: string } }) => {
    return sortearCompulsao(data.tipo, data.claId as Cla | undefined)
  })

export const aplicarRessonanciaPersonagemServer = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .validator(
    z.object({
      personagemId: z.string().uuid(),
      ressonancia: z.object({
        tipo: z.string(),
        intensidade: z.string(),
        discrasia: z
          .object({
            nome: z.string(),
            descricao: z.string(),
          })
          .optional()
          .nullable(),
        manifestacaoSangueFraco: z
          .object({
            disciplinaId: z.string().optional(),
            disciplinaNome: z.string(),
            nivel: z.number(),
            poderes: z.array(
              z.object({
                id: z.string().optional(),
                nome: z.string(),
                nivel: z.number(),
                descricao: z.string(),
              }),
            ),
          })
          .optional()
          .nullable(),
      }),
    }),
  )
  .handler(async ({ data }: { data: { personagemId: string; ressonancia: RessonanciaAtualPersonagem } }) => {
    const [p] = await db
      .select({
        id: personagem.id,
        nome: personagem.nome,
        donoId: personagem.donoId,
        papelDono: user.papel,
        ficha: personagem.ficha,
      })
      .from(personagem)
      .innerJoin(user, eq(personagem.donoId, user.id))
      .where(eq(personagem.id, data.personagemId))

    if (!p) throw new Error('Personagem não encontrado')

    const ressonancia = {
      ...data.ressonancia,
      manifestacaoSangueFraco: ehSangueFraco(p.ficha.cla)
        ? data.ressonancia.manifestacaoSangueFraco
        : null,
    }

    await db
      .update(personagem)
      .set({ ressonanciaAtual: ressonancia })
      .where(eq(personagem.id, data.personagemId))

    if (p.papelDono === 'jogador') {
      const evento = notificacoesEventos.ressonanciaAplicada(
        p.nome,
        `${data.ressonancia.tipo} (${data.ressonancia.intensidade})`,
        p.id,
      )
      await enviarNotificacao({
        usuarioId: p.donoId,
        texto: evento.texto,
        destino: evento.destino,
      })
    }

    barramento.emitir({ tipo: 'mudanca', escopo: 'personagem', id: data.personagemId })
    barramento.emitir({ tipo: 'mudanca', escopo: 'painel' })

    return { ok: true }
  })

export const encerrarRessonanciaPersonagemServer = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .validator(z.object({ personagemId: z.string().uuid() }))
  .handler(async ({ data }: { data: { personagemId: string } }) => {
    await db
      .update(personagem)
      .set({ ressonanciaAtual: null })
      .where(eq(personagem.id, data.personagemId))

    barramento.emitir({ tipo: 'mudanca', escopo: 'personagem', id: data.personagemId })
    barramento.emitir({ tipo: 'mudanca', escopo: 'painel' })

    return { ok: true }
  })

export const aplicarCompulsaoPersonagemServer = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .validator(
    z.object({
      personagemId: z.string().uuid(),
      compulsao: z.object({
        tipo: z.enum(['geral', 'cla']),
        nome: z.string(),
        descricao: z.string(),
      }),
    }),
  )
  .handler(async ({ data }: { data: { personagemId: string; compulsao: CompulsaoAtivaPersonagem } }) => {
    const [p] = await db
      .select({
        id: personagem.id,
        nome: personagem.nome,
        donoId: personagem.donoId,
        papelDono: user.papel,
      })
      .from(personagem)
      .innerJoin(user, eq(personagem.donoId, user.id))
      .where(eq(personagem.id, data.personagemId))

    if (!p) throw new Error('Personagem não encontrado')

    await db
      .update(personagem)
      .set({ compulsaoAtiva: data.compulsao })
      .where(eq(personagem.id, data.personagemId))

    if (p.papelDono === 'jogador') {
      const evento = notificacoesEventos.compulsaoAplicada(p.nome, data.compulsao.nome, p.id)
      await enviarNotificacao({
        usuarioId: p.donoId,
        texto: evento.texto,
        destino: evento.destino,
      })
    }

    barramento.emitir({ tipo: 'mudanca', escopo: 'personagem', id: data.personagemId })
    barramento.emitir({ tipo: 'mudanca', escopo: 'painel' })

    return { ok: true }
  })

export const encerrarCompulsaoPersonagemServer = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .validator(z.object({ personagemId: z.string().uuid() }))
  .handler(async ({ data }: { data: { personagemId: string } }) => {
    await db
      .update(personagem)
      .set({ compulsaoAtiva: null })
      .where(eq(personagem.id, data.personagemId))

    barramento.emitir({ tipo: 'mudanca', escopo: 'personagem', id: data.personagemId })
    barramento.emitir({ tipo: 'mudanca', escopo: 'painel' })

    return { ok: true }
  })

export const listarPersonagensParaSorteio = createServerFn({ method: 'GET' })
  .middleware([exigirNarrador])
  .handler(async () => {
    const linhas = await db
      .select({
        id: personagem.id,
        nome: personagem.nome,
        ficha: personagem.ficha,
        ressonanciaAtual: personagem.ressonanciaAtual,
        compulsaoAtiva: personagem.compulsaoAtiva,
        donoNome: user.name,
        donoPapel: user.papel,
      })
      .from(personagem)
      .innerJoin(user, eq(personagem.donoId, user.id))
      .where(eq(personagem.status, 'ativo'))

    return linhas.map((l) => ({
      id: l.id,
      nome: l.nome,
      cla: l.ficha.cla,
      ressonanciaAtual: l.ressonanciaAtual,
      compulsaoAtiva: l.compulsaoAtiva,
      donoNome: l.donoNome,
      ehPdn: l.donoPapel === 'narrador',
    }))
  })
