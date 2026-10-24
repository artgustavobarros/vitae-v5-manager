import { createServerFn } from '@tanstack/react-start'
import { and, asc, count, eq } from 'drizzle-orm'
import { z } from 'zod'

import { db } from '#/db'
import {
  conviteCoterie,
  coterie,
  membroCoterie,
  personagem,
  user,
} from '#/db/schema'
import type { Papel } from '#/domain/acesso'
import {
  coterieSchema,
  podeApagarCoterie,
  podeConvidarParaCoterie,
  podeEditarCoterie,
  podeExpulsarMembro,
  podeResponderConviteCoterie,
  podeSairDaCoterie,
  podeVerCoterie,
} from '#/domain/coterie'
import { vitalidadeMax, vontadeMax } from '#/domain/ficha'
import { notificacoesEventos } from '#/domain/notificacoes'
import { ehPdN } from '#/domain/permissoes-ficha'
import { barramento } from './eventos'
import { enviarNotificacao, notificarNarradores } from './enviar-notificacao'
import { exigirNarrador, exigirUsuario } from './sessao'

const comId = z.object({ id: z.string().uuid() })

export const listarMinhasCoteries = createServerFn({ method: 'GET' })
  .middleware([exigirUsuario])
  .handler(async ({ context }) => {
    const { usuario } = context

    if (usuario.papel === 'narrador') {
      const coteries = await db
        .select({
          id: coterie.id,
          nome: coterie.nome,
          conceito: coterie.conceito,
          ehPadrao: coterie.ehPadrao,
          caca: coterie.caca,
          abrigo: coterie.abrigo,
          porte: coterie.porte,
        })
        .from(coterie)
        .orderBy(asc(coterie.nome))

      const membrosContagem = await db
        .select({
          coterieId: membroCoterie.coterieId,
          total: count(membroCoterie.personagemId),
        })
        .from(membroCoterie)
        .groupBy(membroCoterie.coterieId)

      const convitesContagem = await db
        .select({
          coterieId: conviteCoterie.coterieId,
          total: count(conviteCoterie.id),
        })
        .from(conviteCoterie)
        .groupBy(conviteCoterie.coterieId)

      const mapaMembros = new Map(membrosContagem.map((m) => [m.coterieId, m.total]))
      const mapaConvites = new Map(convitesContagem.map((c) => [c.coterieId, c.total]))

      return coteries.map((c) => ({
        ...c,
        totalMembros: mapaMembros.get(c.id) ?? 0,
        totalConvites: mapaConvites.get(c.id) ?? 0,
      }))
    }

    // Para jogador: coteries que têm ao menos um personagem dele
    const coteriesDoJogador = await db
      .selectDistinct({
        id: coterie.id,
        nome: coterie.nome,
        conceito: coterie.conceito,
        ehPadrao: coterie.ehPadrao,
        caca: coterie.caca,
        abrigo: coterie.abrigo,
        porte: coterie.porte,
      })
      .from(coterie)
      .innerJoin(membroCoterie, eq(coterie.id, membroCoterie.coterieId))
      .innerJoin(personagem, eq(membroCoterie.personagemId, personagem.id))
      .where(eq(personagem.donoId, usuario.id))
      .orderBy(asc(coterie.nome))

    const membrosContagem = await db
      .select({
        coterieId: membroCoterie.coterieId,
        total: count(membroCoterie.personagemId),
      })
      .from(membroCoterie)
      .groupBy(membroCoterie.coterieId)

    const mapaMembros = new Map(membrosContagem.map((m) => [m.coterieId, m.total]))

    return coteriesDoJogador.map((c) => ({
      ...c,
      totalMembros: mapaMembros.get(c.id) ?? 0,
      totalConvites: 0,
    }))
  })

export const buscarCoterie = createServerFn({ method: 'GET' })
  .middleware([exigirUsuario])
  .validator(comId)
  .handler(async ({ data, context }) => {
    const { usuario } = context

    const [cot] = await db
      .select()
      .from(coterie)
      .where(eq(coterie.id, data.id))

    if (!cot) throw new Error('Coterie não encontrada')

    // Checar se o usuário tem personagem nesta coterie
    const membrosIds = await db
      .select({
        personagemId: membroCoterie.personagemId,
        donoId: personagem.donoId,
      })
      .from(membroCoterie)
      .innerJoin(personagem, eq(membroCoterie.personagemId, personagem.id))
      .where(eq(membroCoterie.coterieId, cot.id))

    const temPersonagemNaCoterie = membrosIds.some((m) => m.donoId === usuario.id)

    if (!podeVerCoterie(usuario, { temPersonagemNaCoterie })) {
      throw new Error('Acesso negado')
    }

    // Carregar detalhes dos membros
    const membrosDetalhados = await db
      .select({
        id: personagem.id,
        nome: personagem.nome,
        status: personagem.status,
        donoId: personagem.donoId,
        nomeDono: user.name,
        papelDono: user.papel,
        ficha: personagem.ficha,
        compartilhaCondicao: personagem.compartilhaCondicao,
      })
      .from(membroCoterie)
      .innerJoin(personagem, eq(membroCoterie.personagemId, personagem.id))
      .innerJoin(user, eq(personagem.donoId, user.id))
      .where(eq(membroCoterie.coterieId, cot.id))
      .orderBy(asc(personagem.nome))

    const membros = membrosDetalhados.map((m) => {
      const ehDono = m.donoId === usuario.id
      const pdn = ehPdN({ papelDono: m.papelDono as Papel, status: m.status })
      const podeVerCondicao = usuario.papel === 'narrador' || ehDono || m.compartilhaCondicao

      const condicao = podeVerCondicao
        ? {
            danoVitalidade: m.ficha.danoVitalidade,
            danoVontade: m.ficha.danoVontade,
            fome: m.ficha.fome,
            maxVit: vitalidadeMax(m.ficha),
            maxVont: vontadeMax(m.ficha),
          }
        : null

      return {
        id: m.id,
        nome: m.nome,
        donoId: m.donoId,
        jogador: pdn ? null : m.nomeDono,
        pdn,
        ehMeu: ehDono,
        compartilhaCondicao: m.compartilhaCondicao,
        condicao,
      }
    })

    // Se Narrador, buscar convites pendentes e candidatos a convite / PdNs
    let convitesPendentes: { id: string; personagemId: string; nomePersonagem: string; nomeJogador: string }[] = []
    let candidatosConvite: { id: string; nome: string; jogador: string }[] = []
    let pdnsDisponiveis: { id: string; nome: string }[] = []

    if (usuario.papel === 'narrador') {
      const convites = await db
        .select({
          id: conviteCoterie.id,
          personagemId: conviteCoterie.personagemId,
          nomePersonagem: personagem.nome,
          nomeJogador: user.name,
        })
        .from(conviteCoterie)
        .innerJoin(personagem, eq(conviteCoterie.personagemId, personagem.id))
        .innerJoin(user, eq(personagem.donoId, user.id))
        .where(eq(conviteCoterie.coterieId, cot.id))
        .orderBy(asc(personagem.nome))

      convitesPendentes = convites

      const idsMembros = new Set(membros.map((m) => m.id))
      const idsConvidados = new Set(convites.map((c) => c.personagemId))

      const todosPersonagens = await db
        .select({
          id: personagem.id,
          nome: personagem.nome,
          status: personagem.status,
          papelDono: user.papel,
          nomeDono: user.name,
        })
        .from(personagem)
        .innerJoin(user, eq(personagem.donoId, user.id))
        .where(eq(personagem.status, 'ativo'))
        .orderBy(asc(personagem.nome))

      for (const p of todosPersonagens) {
        if (idsMembros.has(p.id)) continue
        if (p.papelDono === 'narrador') {
          pdnsDisponiveis.push({ id: p.id, nome: p.nome })
        } else if (!idsConvidados.has(p.id)) {
          candidatosConvite.push({ id: p.id, nome: p.nome, jogador: p.nomeDono })
        }
      }
    }

    return {
      coterie: cot,
      membros,
      convitesPendentes,
      candidatosConvite,
      pdnsDisponiveis,
    }
  })

export const criarCoterie = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .validator(coterieSchema)
  .handler(async ({ data, context }) => {
    if (!podeEditarCoterie(context.usuario)) throw new Error('Acesso negado')

    const [nova] = await db
      .insert(coterie)
      .values({
        nome: data.nome,
        conceito: data.conceito,
        caca: data.caca,
        abrigo: data.abrigo,
        porte: data.porte,
      })
      .returning()

    barramento.emitir({ tipo: 'mudanca', escopo: 'coterie', id: nova.id })
    return nova
  })

export const editarCoterie = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .validator(z.object({ id: z.string().uuid(), dados: coterieSchema }))
  .handler(async ({ data, context }) => {
    if (!podeEditarCoterie(context.usuario)) throw new Error('Acesso negado')

    const [atualizada] = await db
      .update(coterie)
      .set({
        nome: data.dados.nome,
        conceito: data.dados.conceito,
        caca: data.dados.caca,
        abrigo: data.dados.abrigo,
        porte: data.dados.porte,
      })
      .where(eq(coterie.id, data.id))
      .returning()

    barramento.emitir({ tipo: 'mudanca', escopo: 'coterie', id: data.id })
    barramento.emitir({ tipo: 'mudanca', escopo: 'painel' })
    return atualizada
  })

export const apagarCoterie = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .validator(comId)
  .handler(async ({ data, context }) => {
    const [cot] = await db.select().from(coterie).where(eq(coterie.id, data.id))
    if (!cot) throw new Error('Coterie não encontrada')
    if (!podeApagarCoterie(context.usuario, cot)) {
      throw new Error('A Coterie Padrão não pode ser apagada')
    }

    // Buscar membros para notificar donos
    const membros = await db
      .select({
        personagemId: personagem.id,
        donoId: personagem.donoId,
        papelDono: user.papel,
      })
      .from(membroCoterie)
      .innerJoin(personagem, eq(membroCoterie.personagemId, personagem.id))
      .innerJoin(user, eq(personagem.donoId, user.id))
      .where(eq(membroCoterie.coterieId, cot.id))

    await db.delete(coterie).where(eq(coterie.id, data.id))

    // Notificar cada jogador afetado
    for (const m of membros) {
      if (m.papelDono === 'jogador') {
        const notif = notificacoesEventos.coterieApagada(cot.nome, m.personagemId)
        await enviarNotificacao({
          usuarioId: m.donoId,
          texto: notif.texto,
          destino: notif.destino,
        })
      }
    }

    barramento.emitir({ tipo: 'mudanca', escopo: 'coterie' })
    barramento.emitir({ tipo: 'mudanca', escopo: 'painel' })
    return { ok: true }
  })

export const convidarParaCoterie = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .validator(z.object({ coterieId: z.string().uuid(), personagemId: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const [cot] = await db.select().from(coterie).where(eq(coterie.id, data.coterieId))
    if (!cot) throw new Error('Coterie não encontrada')

    const [p] = await db
      .select({
        id: personagem.id,
        nome: personagem.nome,
        status: personagem.status,
        donoId: personagem.donoId,
        papelDono: user.papel,
      })
      .from(personagem)
      .innerJoin(user, eq(personagem.donoId, user.id))
      .where(eq(personagem.id, data.personagemId))

    if (!p) throw new Error('Personagem não encontrado')

    const [ehMembro] = await db
      .select()
      .from(membroCoterie)
      .where(and(eq(membroCoterie.coterieId, data.coterieId), eq(membroCoterie.personagemId, data.personagemId)))

    const [temConvite] = await db
      .select()
      .from(conviteCoterie)
      .where(and(eq(conviteCoterie.coterieId, data.coterieId), eq(conviteCoterie.personagemId, data.personagemId)))

    if (
      !podeConvidarParaCoterie(context.usuario, {
        status: p.status,
        papelDono: p.papelDono as Papel,
        ehMembro: !!ehMembro,
        temConvitePendente: !!temConvite,
      })
    ) {
      throw new Error('Não é possível convidar este Personagem')
    }

    const [novoConvite] = await db
      .insert(conviteCoterie)
      .values({
        coterieId: data.coterieId,
        personagemId: data.personagemId,
      })
      .returning()

    const notif = notificacoesEventos.conviteCoterie(p.nome, cot.nome)
    await enviarNotificacao({
      usuarioId: p.donoId,
      texto: notif.texto,
      destino: notif.destino,
    })

    barramento.emitir({ tipo: 'mudanca', escopo: 'coterie', id: data.coterieId })
    return novoConvite
  })

export const cancelarConviteCoterie = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .validator(z.object({ conviteId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const [removido] = await db
      .delete(conviteCoterie)
      .where(eq(conviteCoterie.id, data.conviteId))
      .returning()

    if (removido) {
      barramento.emitir({ tipo: 'mudanca', escopo: 'coterie', id: removido.coterieId })
    }
    return { ok: true }
  })

export const responderConviteCoterie = createServerFn({ method: 'POST' })
  .middleware([exigirUsuario])
  .validator(z.object({ conviteId: z.string().uuid(), aceitar: z.boolean() }))
  .handler(async ({ data, context }) => {
    const [c] = await db
      .select({
        id: conviteCoterie.id,
        coterieId: conviteCoterie.coterieId,
        personagemId: conviteCoterie.personagemId,
        nomeCoterie: coterie.nome,
        nomePersonagem: personagem.nome,
        donoPersonagemId: personagem.donoId,
      })
      .from(conviteCoterie)
      .innerJoin(coterie, eq(conviteCoterie.coterieId, coterie.id))
      .innerJoin(personagem, eq(conviteCoterie.personagemId, personagem.id))
      .where(eq(conviteCoterie.id, data.conviteId))

    if (!c) throw new Error('Convite não encontrado')

    if (!podeResponderConviteCoterie(context.usuario, { donoPersonagemId: c.donoPersonagemId })) {
      throw new Error('Acesso negado')
    }

    await db.delete(conviteCoterie).where(eq(conviteCoterie.id, data.conviteId))

    if (data.aceitar) {
      await db
        .insert(membroCoterie)
        .values({
          coterieId: c.coterieId,
          personagemId: c.personagemId,
        })
        .onConflictDoNothing()

      const notif = notificacoesEventos.conviteCoterieAceito(c.nomePersonagem, c.nomeCoterie, c.coterieId)
      await notificarNarradores({ texto: notif.texto, destino: notif.destino })
    } else {
      const notif = notificacoesEventos.conviteCoterieRecusado(
        context.usuario.nome,
        c.nomePersonagem,
        c.nomeCoterie,
        c.coterieId,
      )
      await notificarNarradores({ texto: notif.texto, destino: notif.destino })
    }

    barramento.emitir({ tipo: 'mudanca', escopo: 'coterie', id: c.coterieId })
    barramento.emitir({ tipo: 'mudanca', escopo: 'painel' })
    return { ok: true }
  })

export const adicionarPdnCoterie = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .validator(z.object({ coterieId: z.string().uuid(), personagemId: z.string().uuid() }))
  .handler(async ({ data }) => {
    await db
      .insert(membroCoterie)
      .values({
        coterieId: data.coterieId,
        personagemId: data.personagemId,
      })
      .onConflictDoNothing()

    barramento.emitir({ tipo: 'mudanca', escopo: 'coterie', id: data.coterieId })
    barramento.emitir({ tipo: 'mudanca', escopo: 'painel' })
    return { ok: true }
  })

export const expulsarMembro = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .validator(z.object({ coterieId: z.string().uuid(), personagemId: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    if (!podeExpulsarMembro(context.usuario)) throw new Error('Acesso negado')

    const [cot] = await db.select().from(coterie).where(eq(coterie.id, data.coterieId))
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

    await db
      .delete(membroCoterie)
      .where(and(eq(membroCoterie.coterieId, data.coterieId), eq(membroCoterie.personagemId, data.personagemId)))

    if (p && cot && p.papelDono === 'jogador') {
      const notif = notificacoesEventos.removidoCoterie(p.nome, cot.nome, p.id)
      await enviarNotificacao({
        usuarioId: p.donoId,
        texto: notif.texto,
        destino: notif.destino,
      })
    }

    barramento.emitir({ tipo: 'mudanca', escopo: 'coterie', id: data.coterieId })
    barramento.emitir({ tipo: 'mudanca', escopo: 'painel' })
    return { ok: true }
  })

export const sairDaCoterie = createServerFn({ method: 'POST' })
  .middleware([exigirUsuario])
  .validator(z.object({ coterieId: z.string().uuid(), personagemId: z.string().uuid() }))
  .handler(async ({ data, context }) => {
    const [cot] = await db.select().from(coterie).where(eq(coterie.id, data.coterieId))
    const [p] = await db.select().from(personagem).where(eq(personagem.id, data.personagemId))

    if (!p || !cot) throw new Error('Não encontrado')

    if (!podeSairDaCoterie(context.usuario, { donoId: p.donoId })) {
      throw new Error('Acesso negado')
    }

    await db
      .delete(membroCoterie)
      .where(and(eq(membroCoterie.coterieId, data.coterieId), eq(membroCoterie.personagemId, data.personagemId)))

    const notif = notificacoesEventos.personagemSaiuCoterie(p.nome, cot.nome, cot.id)
    await notificarNarradores({ texto: notif.texto, destino: notif.destino })

    barramento.emitir({ tipo: 'mudanca', escopo: 'coterie', id: data.coterieId })
    barramento.emitir({ tipo: 'mudanca', escopo: 'painel' })
    return { ok: true }
  })

export const listarConvitesCoterieDoJogador = createServerFn({ method: 'GET' })
  .middleware([exigirUsuario])
  .handler(async ({ context }) => {
    if (context.usuario.papel !== 'jogador') return []

    return db
      .select({
        conviteId: conviteCoterie.id,
        coterieId: coterie.id,
        nomeCoterie: coterie.nome,
        personagemId: personagem.id,
        nomePersonagem: personagem.nome,
      })
      .from(conviteCoterie)
      .innerJoin(coterie, eq(conviteCoterie.coterieId, coterie.id))
      .innerJoin(personagem, eq(conviteCoterie.personagemId, personagem.id))
      .where(eq(personagem.donoId, context.usuario.id))
      .orderBy(asc(coterie.nome))
  })
