import { createServerFn } from '@tanstack/react-start'
import { asc, eq } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '#/db'
import { paradaCompartilhada, personagem, preferenciaParadas } from '#/db/schema'
import {
  encontrarParadasRepetidas,
  listarParadas,
  ordenarParadas,
  PARADAS_PADRAO,
  paradaPersonalizadaSchema,
  podeGerenciarParada,
  reordenarParadas,
} from '#/domain/paradas'
import { carregar } from '#/server/carregar-personagem'
import { barramento } from '#/server/eventos'
import { exigirUsuario } from '#/server/sessao'

export const carregarParadas = createServerFn({ method: 'GET' })
  .middleware([exigirUsuario])
  .validator(z.object({ personagemId: z.string().uuid().optional() }))
  .handler(async ({ data, context }) => {
    const [personagens, compartilhadas, preferencias] = await Promise.all([
      db.select({ id: personagem.id, nome: personagem.nome, status: personagem.status })
        .from(personagem)
        .where(context.usuario.papel === 'narrador' ? undefined : eq(personagem.donoId, context.usuario.id))
        .orderBy(asc(personagem.nome)),
      db.select().from(paradaCompartilhada).orderBy(asc(paradaCompartilhada.criadoEm), asc(paradaCompartilhada.id)),
      db.select().from(preferenciaParadas).where(eq(preferenciaParadas.usuarioId, context.usuario.id)),
    ])
    const gerenciaveis = compartilhadas.filter((p) => podeGerenciarParada(context.usuario, p.criadoPorId)).map((p) => p.id)
    const id = data.personagemId ?? personagens.find((p) => p.status === 'ativo')?.id ?? personagens[0]?.id
    if (!id) return { personagens, compartilhadas, gerenciaveis, selecionado: null }
    if (!personagens.some((p) => p.id === id)) throw new Error('Acesso negado')

    const p = await carregar(context.usuario, id, ['editar', 'marcar', 'ler'])
    return {
      personagens,
      compartilhadas,
      gerenciaveis,
      selecionado: {
        id: p.id,
        nome: p.nome,
        status: p.status,
        atributos: p.ficha.atributos,
        habilidades: p.ficha.habilidades,
        paradas: listarParadas(p.ficha, compartilhadas, preferencias[0]?.ordem),
      },
    }
  })

export const salvarParadaCompartilhada = createServerFn({ method: 'POST' })
  .middleware([exigirUsuario])
  .validator(z.object({ parada: paradaPersonalizadaSchema }))
  .handler(async ({ data, context }) => {
    const repetidas = await db.transaction(async (tx) => {
      const [existente] = await tx.select().from(paradaCompartilhada).where(eq(paradaCompartilhada.id, data.parada.id)).for('update')
      if (existente && !podeGerenciarParada(context.usuario, existente.criadoPorId)) throw new Error('Acesso negado')
      const compartilhadas = await tx.select().from(paradaCompartilhada)
      const repetidas = encontrarParadasRepetidas(compartilhadas, data.parada).map((p) => p.nome)
      if (existente) {
        await tx.update(paradaCompartilhada).set(data.parada).where(eq(paradaCompartilhada.id, existente.id))
      } else {
        await tx.insert(paradaCompartilhada).values({ ...data.parada, criadoPorId: context.usuario.id })
      }
      return repetidas
    })
    barramento.emitir({ tipo: 'mudanca', escopo: 'paradas' })
    return { ok: true, repetidas }
  })

export const excluirParadaCompartilhada = createServerFn({ method: 'POST' })
  .middleware([exigirUsuario])
  .validator(z.object({ paradaId: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    await db.transaction(async (tx) => {
      const [p] = await tx.select().from(paradaCompartilhada).where(eq(paradaCompartilhada.id, data.paradaId)).for('update')
      if (!p) throw new Error('Parada não encontrada')
      if (!podeGerenciarParada(context.usuario, p.criadoPorId)) throw new Error('Acesso negado')
      await tx.delete(paradaCompartilhada).where(eq(paradaCompartilhada.id, p.id))
    })
    barramento.emitir({ tipo: 'mudanca', escopo: 'paradas' })
    return { ok: true }
  })

export const reordenarParadasUsuario = createServerFn({ method: 'POST' })
  .middleware([exigirUsuario])
  .validator(z.object({
    origemId: z.string().min(1).max(100),
    destinoId: z.string().min(1).max(100),
  }))
  .handler(async ({ data, context }) => {
    await db.transaction(async (tx) => {
      await tx.insert(preferenciaParadas).values({ usuarioId: context.usuario.id }).onConflictDoNothing()
      const [preferencia] = await tx.select().from(preferenciaParadas)
        .where(eq(preferenciaParadas.usuarioId, context.usuario.id)).for('update')
      const compartilhadas = await tx.select().from(paradaCompartilhada)
      const paradas = ordenarParadas([...PARADAS_PADRAO, ...compartilhadas], preferencia.ordem)
      const ordem = reordenarParadas(paradas, data.origemId, data.destinoId)
      await tx.update(preferenciaParadas).set({ ordem }).where(eq(preferenciaParadas.usuarioId, context.usuario.id))
    })
    barramento.emitir({ tipo: 'mudanca', escopo: 'paradas', paraUsuarioId: context.usuario.id })
    return { ok: true }
  })
