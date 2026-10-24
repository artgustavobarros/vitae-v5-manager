import { createServerFn } from '@tanstack/react-start'
import { and, asc, eq } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'
import { z } from 'zod'

import { db } from '#/db'
import { coterie, membroCoterie, personagem, user } from '#/db/schema'
import type { Papel } from '#/domain/acesso'
import { claGeracaoCombinam, fichaNeofito, fichaSchema, marcasDe, marcasSchema, normalizarFicha } from '#/domain/ficha'
import { detectarTransicaoCondicaoCritica, notificacoesEventos } from '#/domain/notificacoes'
import {
  aplicarRespostaAtribuicao,
  ehPdN,
  exigeRegrasCriacao,
  motivoNaoConcluir,
  permissoesPersonagem,
  podeApagar,
  podeAtribuir,
  podeCancelarAtribuicao,
  podeResponderAtribuicao,
  type MotivoNaoConcluir,
} from '#/domain/permissoes-ficha'
import { carregar } from '#/server/carregar-personagem'
import { barramento } from '#/server/eventos'
import { enviarNotificacao, notificarNarradores } from '#/server/enviar-notificacao'
import { exigirNarrador, exigirUsuario } from '#/server/sessao'

const comId = z.object({ id: z.string().uuid() })

const atribuido = alias(user, 'atribuido')

const MENSAGENS_NAO_CONCLUIR: Record<MotivoNaoConcluir, string> = {
  'nao-dono': 'Só o dono do Rascunho pode concluí-lo',
  'nao-rascunho': 'Só Rascunhos podem ser concluídos',
  atribuido: 'Cancele a atribuição antes de concluir',
  'sem-nome': 'Dê um nome ao Personagem antes de concluir',
}

const colunasPermissao = {
  donoId: personagem.donoId,
  status: personagem.status,
  nome: personagem.nome,
  atribuidoA: personagem.atribuidoA,
}

export const listarMeusPersonagens = createServerFn({ method: 'GET' })
  .middleware([exigirUsuario])
  .handler(async ({ context }) => {
    const linhas = await db
      .select({ id: personagem.id, ...colunasPermissao })
      .from(personagem)
      .where(eq(personagem.donoId, context.usuario.id))
      .orderBy(asc(personagem.criadoEm))
    return linhas.map((p) => ({
      id: p.id,
      nome: p.nome,
      status: p.status,
      ...permissoesPersonagem(context.usuario, p),
    }))
  })

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
  .handler(async ({ context }) => {
    const linhas = await db
      .select({
        id: personagem.id,
        ...colunasPermissao,
        dono: user.name,
        papelDono: user.papel,
        nomeAtribuido: atribuido.name,
      })
      .from(personagem)
      .innerJoin(user, eq(personagem.donoId, user.id))
      .leftJoin(atribuido, eq(personagem.atribuidoA, atribuido.id))
      .orderBy(asc(user.name), asc(personagem.criadoEm))
    return linhas.map((p) => {
      const { abreNoWizard, podeApagar } = permissoesPersonagem(context.usuario, p)
      return {
        id: p.id,
        nome: p.nome,
        status: p.status,
        /** Jogador dono; null quando o dono é o Narrador. */
        jogador: p.papelDono === 'narrador' ? null : p.dono,
        pdn: ehPdN({ papelDono: p.papelDono as Papel, status: p.status }),
        atribuidoA: p.nomeAtribuido,
        abreNoWizard,
        podeApagar,
      }
    })
  })

export const buscarFicha = createServerFn({ method: 'GET' })
  .middleware([exigirUsuario])
  .validator(comId)
  .handler(async ({ data, context }) => {
    const p = await carregar(context.usuario, data.id, ['editar', 'marcar', 'ler'])
    const [jogador] = p.atribuidoA
      ? await db.select({ id: user.id, nome: user.name }).from(user).where(eq(user.id, p.atribuidoA))
      : []

    const coteriesDoPersonagem = await db
      .select({
        id: coterie.id,
        nome: coterie.nome,
      })
      .from(membroCoterie)
      .innerJoin(coterie, eq(membroCoterie.coterieId, coterie.id))
      .where(eq(membroCoterie.personagemId, p.id))
      .orderBy(asc(coterie.nome))

    return {
      id: p.id,
      nome: p.nome,
      status: p.status,
      ficha: p.ficha,
      compartilhaCondicao: p.compartilhaCondicao,
      fixado: p.fixado,
      coteries: coteriesDoPersonagem,
      /** Jogador que ainda vai aceitar ou recusar este Rascunho. */
      atribuidoA: jogador ?? null,
      ...permissoesPersonagem(context.usuario, p),
      acesso: p.acesso,
    }
  })

export const criarRascunho = createServerFn({ method: 'POST' })
  .middleware([exigirUsuario])
  .handler(async ({ context }) => {
    const [p] = await db
      .insert(personagem)
      .values({ donoId: context.usuario.id, ficha: fichaNeofito() })
      .returning({ id: personagem.id })

    barramento.emitir({ tipo: 'mudanca', escopo: 'personagem', id: p.id })
    return p
  })

export const salvarFicha = createServerFn({ method: 'POST' })
  .middleware([exigirUsuario])
  .validator(z.object({ id: z.string().uuid(), nome: z.string().trim().max(120), ficha: fichaSchema }))
  .handler(async ({ data, context }) => {
    const p = await carregar(context.usuario, data.id, ['editar'])
    if (exigeRegrasCriacao(context.usuario, p) && !claGeracaoCombinam(data.ficha)) {
      throw new Error('Sangue-Ralo é da 14ª à 16ª Geração; os demais clãs, até a 13ª.')
    }
    await db
      .update(personagem)
      .set({ nome: data.nome, ficha: normalizarFicha(data.ficha) })
      .where(eq(personagem.id, data.id))

    // Se o Narrador editou a Ficha de um Jogador ativo
    if (context.usuario.papel === 'narrador' && p.donoId !== context.usuario.id && p.status === 'ativo') {
      const notif = notificacoesEventos.narradorEditouFicha(data.nome, p.id)
      await enviarNotificacao({ usuarioId: p.donoId, texto: notif.texto, destino: notif.destino })
    }

    barramento.emitir({ tipo: 'mudanca', escopo: 'personagem', id: data.id })
    barramento.emitir({ tipo: 'mudanca', escopo: 'painel' })
  })

/** Salva uma marca no toque e devolve as marcas como ficaram depois do corte. */
export const marcar = createServerFn({ method: 'POST' })
  .middleware([exigirUsuario])
  .validator(z.object({ id: z.string().uuid(), marcas: marcasSchema }))
  .handler(async ({ data, context }) => {
    const p = await carregar(context.usuario, data.id, ['editar', 'marcar'])
    const ficha = normalizarFicha({ ...p.ficha, ...data.marcas })
    await db.update(personagem).set({ ficha }).where(eq(personagem.id, data.id))

    // Disparar notificação de condição crítica se foi um Jogador alterando
    if (context.usuario.papel === 'jogador') {
      const transicao = detectarTransicaoCondicaoCritica(p.ficha, ficha)
      if (transicao) {
        const notif = notificacoesEventos.condicaoCritica(transicao, p.nome, p.id)
        await notificarNarradores({ texto: notif.texto, destino: notif.destino })
      }
    }

    barramento.emitir({ tipo: 'mudanca', escopo: 'personagem', id: data.id })
    barramento.emitir({ tipo: 'mudanca', escopo: 'painel' })
    return marcasDe(ficha)
  })

export const concluir = createServerFn({ method: 'POST' })
  .middleware([exigirUsuario])
  .validator(comId)
  .handler(async ({ data, context }) => {
    const p = await carregar(context.usuario, data.id, ['editar'])
    const motivo = motivoNaoConcluir(context.usuario, p)
    if (motivo) throw new Error(MENSAGENS_NAO_CONCLUIR[motivo])
    await db.update(personagem).set({ status: 'ativo' }).where(eq(personagem.id, data.id))

    // Notificar Narrador se um Jogador concluiu Personagem
    if (context.usuario.papel === 'jogador') {
      const notif = notificacoesEventos.personagemConcluido(context.usuario.nome, p.nome, p.id)
      await notificarNarradores({ texto: notif.texto, destino: notif.destino })
    }

    barramento.emitir({ tipo: 'mudanca', escopo: 'personagem', id: data.id })
    barramento.emitir({ tipo: 'mudanca', escopo: 'painel' })
  })

export const apagarRascunho = createServerFn({ method: 'POST' })
  .middleware([exigirUsuario])
  .validator(comId)
  .handler(async ({ data, context }) => {
    const p = await carregar(context.usuario, data.id, ['editar'])
    if (!podeApagar(context.usuario, p)) throw new Error('Só Rascunhos podem ser apagados')
    await db.delete(personagem).where(eq(personagem.id, data.id))
    barramento.emitir({ tipo: 'mudanca', escopo: 'personagem', id: data.id })
  })

export const atribuir = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .validator(z.object({ id: z.string().uuid(), jogadorId: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    const p = await carregar(context.usuario, data.id, ['editar'])
    if (!podeAtribuir(context.usuario, p)) throw new Error('Só um Rascunho seu, ainda sem atribuição, pode ser atribuído')
    const [alvo] = await db.select({ papel: user.papel }).from(user).where(eq(user.id, data.jogadorId))
    if (!alvo || !podeAtribuir(context.usuario, p, { papel: alvo.papel as Papel })) {
      throw new Error('Escolha um Jogador da Crônica')
    }
    await db.update(personagem).set({ atribuidoA: data.jogadorId }).where(eq(personagem.id, data.id))

    const notif = notificacoesEventos.atribuicao(p.nome)
    await enviarNotificacao({ usuarioId: data.jogadorId, texto: notif.texto, destino: notif.destino })

    barramento.emitir({ tipo: 'mudanca', escopo: 'personagem', id: data.id })
  })

export const cancelarAtribuicao = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .validator(comId)
  .handler(async ({ data, context }) => {
    const p = await carregar(context.usuario, data.id, ['editar'])
    if (!podeCancelarAtribuicao(context.usuario, p)) throw new Error('Este Rascunho não está atribuído')
    await db.update(personagem).set({ atribuidoA: null }).where(eq(personagem.id, data.id))
    barramento.emitir({ tipo: 'mudanca', escopo: 'personagem', id: data.id })
  })

/** Aceitar: o Rascunho passa a ser do Jogador. Recusar: volta a ser só do Narrador. */
export const responderAtribuicao = createServerFn({ method: 'POST' })
  .middleware([exigirUsuario])
  .validator(z.object({ id: z.string().uuid(), aceitar: z.boolean() }))
  .handler(async ({ data, context }) => {
    const p = await carregar(context.usuario, data.id, ['ler'])
    if (!podeResponderAtribuicao(context.usuario, p)) throw new Error('Este Personagem não está atribuído a você')
    await db
      .update(personagem)
      .set(aplicarRespostaAtribuicao(context.usuario, data.aceitar))
      .where(eq(personagem.id, data.id))

    if (data.aceitar) {
      const notif = notificacoesEventos.atribuicaoAceita(context.usuario.nome, p.nome, p.id)
      await notificarNarradores({ texto: notif.texto, destino: notif.destino })
    } else {
      const notif = notificacoesEventos.atribuicaoRecusada(context.usuario.nome, p.nome, p.id)
      await notificarNarradores({ texto: notif.texto, destino: notif.destino })
    }

    barramento.emitir({ tipo: 'mudanca', escopo: 'personagem', id: data.id })
  })

export const alternarCompartilharCondicao = createServerFn({ method: 'POST' })
  .middleware([exigirUsuario])
  .validator(z.object({ id: z.string().uuid(), compartilhar: z.boolean() }))
  .handler(async ({ data, context }) => {
    const p = await carregar(context.usuario, data.id, ['editar', 'marcar'])
    const podeAlterar =
      p.donoId === context.usuario.id ||
      (context.usuario.papel === 'narrador' && p.status !== 'rascunho')

    if (!podeAlterar) throw new Error('Acesso negado')

    await db
      .update(personagem)
      .set({ compartilhaCondicao: data.compartilhar })
      .where(eq(personagem.id, data.id))

    barramento.emitir({ tipo: 'mudanca', escopo: 'painel' })
    barramento.emitir({ tipo: 'mudanca', escopo: 'personagem', id: data.id })
    return { ok: true }
  })

export const alternarFixarPdn = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .validator(z.object({ id: z.string().uuid(), fixado: z.boolean() }))
  .handler(async ({ data, context }) => {
    const p = await carregar(context.usuario, data.id, ['editar'])
    if (p.donoId !== context.usuario.id || p.status === 'rascunho') {
      throw new Error('Apenas PdNs ativos podem ser fixados no Painel')
    }

    await db
      .update(personagem)
      .set({ fixado: data.fixado })
      .where(eq(personagem.id, data.id))

    barramento.emitir({ tipo: 'mudanca', escopo: 'painel' })
    barramento.emitir({ tipo: 'mudanca', escopo: 'personagem', id: data.id })
    return { ok: true }
  })
