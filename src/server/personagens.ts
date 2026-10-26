import { createServerFn } from '@tanstack/react-start'
import { and, asc, eq } from 'drizzle-orm'
import { alias } from 'drizzle-orm/pg-core'
import { z } from 'zod'

import { db } from '#/db'
import { coterie, membroCoterie, personagem, user } from '#/db/schema'
import type { Papel } from '#/domain/acesso'
import { podeAlternarCompartilharCondicao } from '#/domain/condicao'
import { escolhasInvalidas } from '#/domain/catalogo/escolhas'
import { claGeracaoCombinam, fichaNeofito, fichaSchema, marcasDe, marcasSchema, normalizarFicha } from '#/domain/ficha'
import { detectarMudancasCondicao, notificacoesEventos } from '#/domain/notificacoes'
import {
  aplicarRespostaAtribuicao,
  ehPdN,
  exigeRegrasCriacao,
  motivoNaoConcluir,
  nomeJogador,
  permissoesPersonagem,
  podeApagar,
  podeAtribuir,
  podeCancelarAtribuicao,
  podeResponderAtribuicao,
  type MotivoNaoConcluir,
} from '#/domain/permissoes-ficha'
import { carregar, ehPdNNoBanco } from '#/server/carregar-personagem'
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
        jogador: nomeJogador({ papelDono: p.papelDono as Papel, nomeDono: p.dono }),
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
    const [[jogador], pdn, coteriesDoPersonagem] = await Promise.all([
      p.atribuidoA
        ? db.select({ id: user.id, nome: user.name }).from(user).where(eq(user.id, p.atribuidoA))
        : Promise.resolve([]),
      ehPdNNoBanco(p),
      db
        .select({ id: coterie.id, nome: coterie.nome })
        .from(membroCoterie)
        .innerJoin(coterie, eq(membroCoterie.coterieId, coterie.id))
        .where(eq(membroCoterie.personagemId, p.id))
        .orderBy(asc(coterie.nome)),
    ])

    return {
      id: p.id,
      nome: p.nome,
      status: p.status,
      ficha: p.ficha,
      compartilhaCondicao: p.compartilhaCondicao,
      fixado: p.fixado,
      ressonanciaAtual: p.ressonanciaAtual,
      compulsaoAtiva: p.compulsaoAtiva,
      pdn,
      /** Quem decide se a Condição aparece para a Coterie: o Jogador dono, ou o Narrador num PdN. */
      podeCompartilharCondicao:
        p.acesso !== 'ler' && podeAlternarCompartilharCondicao(context.usuario, { donoId: p.donoId, pdn }),
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
    const p = await db.transaction(async (tx) => {
      const p = await carregar(context.usuario, data.id, ['editar'], tx)
      if (exigeRegrasCriacao(context.usuario, p) && !claGeracaoCombinam(data.ficha)) {
        throw new Error('Sangue-Ralo é da 14ª à 16ª Geração; os demais clãs, até a 13ª.')
      }
      if (exigeRegrasCriacao(context.usuario, p) && escolhasInvalidas(p.ficha, data.ficha).length > 0) {
        throw new Error('Há escolhas do Catálogo fora das regras do V5.')
      }
      await tx
        .update(personagem)
        .set({ nome: data.nome, ficha: normalizarFicha(data.ficha) })
        .where(eq(personagem.id, data.id))
      return p
    })

    // Depois do commit. Se o Narrador editou a Ficha de um Jogador ativo
    if (context.usuario.papel === 'narrador' && p.donoId !== context.usuario.id && p.status === 'ativo') {
      const notif = notificacoesEventos.narradorEditouFicha(data.nome, p.id)
      await enviarNotificacao({ usuarioId: p.donoId, texto: notif.texto, destino: notif.destino })
    }

    barramento.emitir({ tipo: 'mudanca', escopo: 'personagem', id: data.id })
    barramento.emitir({ tipo: 'mudanca', escopo: 'painel' })
  })

/** Salva uma marca no toque e devolve as marcas como ficaram depois do corte. Trilhas omitidas ficam como estão. */
export const marcar = createServerFn({ method: 'POST' })
  .middleware([exigirUsuario])
  .validator(z.object({ id: z.string().uuid(), marcas: marcasSchema.partial() }))
  .handler(async ({ data, context }) => {
    // A Ficha de antes vem da leitura sob lock, para a comparação da Condição não usar dado velho.
    const { p, ficha } = await db.transaction(async (tx) => {
      const p = await carregar(context.usuario, data.id, ['editar', 'marcar'], tx)
      const ficha = normalizarFicha({ ...p.ficha, ...data.marcas })
      await tx.update(personagem).set({ ficha }).where(eq(personagem.id, data.id))
      return { p, ficha }
    })

    // Depois do commit: o Narrador fica sabendo das mudanças de Condição que um Jogador marcou.
    if (context.usuario.papel === 'jogador') {
      for (const mudanca of detectarMudancasCondicao(p.ficha, ficha)) {
        const notif = notificacoesEventos.mudancaCondicao(mudanca, p.nome, p.id)
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
    const p = await db.transaction(async (tx) => {
      const p = await carregar(context.usuario, data.id, ['editar'], tx)
      const motivo = motivoNaoConcluir(context.usuario, p)
      if (motivo) throw new Error(MENSAGENS_NAO_CONCLUIR[motivo])
      await tx.update(personagem).set({ status: 'ativo' }).where(eq(personagem.id, data.id))
      return p
    })

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
    await db.transaction(async (tx) => {
      const p = await carregar(context.usuario, data.id, ['editar'], tx)
      if (!podeApagar(context.usuario, p)) throw new Error('Só Rascunhos podem ser apagados')
      await tx.delete(personagem).where(eq(personagem.id, data.id))
    })
    barramento.emitir({ tipo: 'mudanca', escopo: 'personagem', id: data.id })
  })

export const atribuir = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .validator(z.object({ id: z.string().uuid(), jogadorId: z.string().min(1) }))
  .handler(async ({ data, context }) => {
    const p = await db.transaction(async (tx) => {
      const p = await carregar(context.usuario, data.id, ['editar'], tx)
      if (!podeAtribuir(context.usuario, p)) throw new Error('Só um Rascunho seu, ainda sem atribuição, pode ser atribuído')
      const [alvo] = await tx.select({ papel: user.papel }).from(user).where(eq(user.id, data.jogadorId))
      if (!alvo || !podeAtribuir(context.usuario, p, { papel: alvo.papel as Papel })) {
        throw new Error('Escolha um Jogador da Crônica')
      }
      await tx.update(personagem).set({ atribuidoA: data.jogadorId }).where(eq(personagem.id, data.id))
      return p
    })

    const notif = notificacoesEventos.atribuicao(p.nome)
    await enviarNotificacao({ usuarioId: data.jogadorId, texto: notif.texto, destino: notif.destino })

    barramento.emitir({ tipo: 'mudanca', escopo: 'personagem', id: data.id })
  })

export const cancelarAtribuicao = createServerFn({ method: 'POST' })
  .middleware([exigirNarrador])
  .validator(comId)
  .handler(async ({ data, context }) => {
    await db.transaction(async (tx) => {
      const p = await carregar(context.usuario, data.id, ['editar'], tx)
      if (!podeCancelarAtribuicao(context.usuario, p)) throw new Error('Este Rascunho não está atribuído')
      await tx.update(personagem).set({ atribuidoA: null }).where(eq(personagem.id, data.id))
    })
    barramento.emitir({ tipo: 'mudanca', escopo: 'personagem', id: data.id })
  })

/** Aceitar: o Rascunho passa a ser do Jogador. Recusar: volta a ser só do Narrador. */
export const responderAtribuicao = createServerFn({ method: 'POST' })
  .middleware([exigirUsuario])
  .validator(z.object({ id: z.string().uuid(), aceitar: z.boolean() }))
  .handler(async ({ data, context }) => {
    const p = await db.transaction(async (tx) => {
      const p = await carregar(context.usuario, data.id, ['ler'], tx)
      if (!podeResponderAtribuicao(context.usuario, p)) throw new Error('Este Personagem não está atribuído a você')
      await tx
        .update(personagem)
        .set(aplicarRespostaAtribuicao(context.usuario, data.aceitar))
        .where(eq(personagem.id, data.id))
      return p
    })

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
    const pdn = await ehPdNNoBanco(p)
    if (!podeAlternarCompartilharCondicao(context.usuario, { donoId: p.donoId, pdn })) {
      throw new Error('Só o Jogador decide se compartilha a Condição do próprio Personagem')
    }

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
