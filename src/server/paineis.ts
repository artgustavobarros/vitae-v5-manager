import { createServerFn } from '@tanstack/react-start'
import { and, asc, eq, inArray } from 'drizzle-orm'

import { db } from '#/db'
import { coterie, membroCoterie, personagem, user } from '#/db/schema'
import type { Papel } from '#/domain/acesso'
import { condicaoDe, podeVerCondicao, type Condicao } from '#/domain/condicao'
import { ehPdN, nomeJogador } from '#/domain/permissoes-ficha'
import { exigirNarrador, exigirUsuario } from './sessao'

export const carregarPainelNarrador = createServerFn({ method: 'GET' })
  .middleware([exigirNarrador])
  .handler(async () => {
    const [todasCoteries, associacoes, ativos, pdns] = await Promise.all([
      db.select({ id: coterie.id, nome: coterie.nome }).from(coterie).orderBy(asc(coterie.nome)),
      db
        .select({
          personagemId: membroCoterie.personagemId,
          coterieId: coterie.id,
          nomeCoterie: coterie.nome,
        })
        .from(membroCoterie)
        .innerJoin(coterie, eq(membroCoterie.coterieId, coterie.id)),
      db
        .select({
          id: personagem.id,
          nome: personagem.nome,
          status: personagem.status,
          donoId: personagem.donoId,
          nomeDono: user.name,
          papelDono: user.papel,
          ficha: personagem.ficha,
          ressonanciaAtual: personagem.ressonanciaAtual,
          compulsaoAtiva: personagem.compulsaoAtiva,
        })
        .from(personagem)
        .innerJoin(user, eq(personagem.donoId, user.id))
        .where(and(eq(personagem.status, 'ativo'), eq(user.papel, 'jogador')))
        .orderBy(asc(personagem.nome)),
      db
        .select({
          id: personagem.id,
          nome: personagem.nome,
          status: personagem.status,
          donoId: personagem.donoId,
          nomeDono: user.name,
          papelDono: user.papel,
          ficha: personagem.ficha,
          ressonanciaAtual: personagem.ressonanciaAtual,
          compulsaoAtiva: personagem.compulsaoAtiva,
        })
        .from(personagem)
        .innerJoin(user, eq(personagem.donoId, user.id))
        .where(and(eq(personagem.fixado, true), eq(user.papel, 'narrador')))
        .orderBy(asc(personagem.nome)),
    ])

    const coteriesPorPersonagem = new Map<string, { id: string; nome: string }[]>()
    for (const a of associacoes) {
      const lista = coteriesPorPersonagem.get(a.personagemId) ?? []
      lista.push({ id: a.coterieId, nome: a.nomeCoterie })
      coteriesPorPersonagem.set(a.personagemId, lista)
    }

    function mapear(p: (typeof ativos)[number]) {
      const cots = coteriesPorPersonagem.get(p.id) ?? []
      return {
        id: p.id,
        nome: p.nome,
        jogador: nomeJogador({ papelDono: p.papelDono as Papel, nomeDono: p.nomeDono }),
        coteries: cots.map((c) => c.nome),
        coterieIds: cots.map((c) => c.id),
        condicao: condicaoDe(p.ficha),
        humanidade: p.ficha.humanidade,
        manchas: p.ficha.manchas,
        ressonanciaAtual: p.ressonanciaAtual,
        compulsaoAtiva: p.compulsaoAtiva,
      }
    }

    return {
      coteries: todasCoteries,
      personagensAtivos: ativos.map(mapear),
      pdnsFixados: pdns.map(mapear),
    }
  })

export const carregarTelaCoteries = createServerFn({ method: 'GET' })
  .middleware([exigirUsuario])
  .handler(async ({ context }) => {
    const { usuario } = context

    // Coteries em que o jogador participa
    const coteriesDoUsuario = await db
      .selectDistinct({
        id: coterie.id,
        nome: coterie.nome,
      })
      .from(coterie)
      .innerJoin(membroCoterie, eq(coterie.id, membroCoterie.coterieId))
      .innerJoin(personagem, eq(membroCoterie.personagemId, personagem.id))
      .where(eq(personagem.donoId, usuario.id))
      .orderBy(asc(coterie.nome))

    const coterieIds = coteriesDoUsuario.map((c) => c.id)
    if (coterieIds.length === 0) {
      return {
        coteries: [],
        membros: [],
      }
    }

    // Todos os membros que participam de ao menos uma dessas Coteries
    const linhas = await db
      .selectDistinct({
        id: personagem.id,
        nome: personagem.nome,
        status: personagem.status,
        donoId: personagem.donoId,
        nomeDono: user.name,
        papelDono: user.papel,
        ficha: personagem.ficha,
        compartilhaCondicao: personagem.compartilhaCondicao,
        coterieId: coterie.id,
        nomeCoterie: coterie.nome,
      })
      .from(membroCoterie)
      .innerJoin(coterie, eq(membroCoterie.coterieId, coterie.id))
      .innerJoin(personagem, eq(membroCoterie.personagemId, personagem.id))
      .innerJoin(user, eq(personagem.donoId, user.id))
      .where(inArray(membroCoterie.coterieId, coterieIds))
      .orderBy(asc(personagem.nome))

    // Agrupar por personagem
    const mapaPersonagens = new Map<
      string,
      {
        id: string
        nome: string
        donoId: string
        jogador: string | null
        pdn: boolean
        ehMeu: boolean
        compartilhaCondicao: boolean
        coteriesEmComum: string[]
        coterieIds: string[]
        condicao: Condicao | null
      }
    >()

    for (const l of linhas) {
      const existente = mapaPersonagens.get(l.id)
      if (existente) {
        if (!existente.coterieIds.includes(l.coterieId)) {
          existente.coterieIds.push(l.coterieId)
          existente.coteriesEmComum.push(l.nomeCoterie)
        }
      } else {
        const papelDono = l.papelDono as Papel
        mapaPersonagens.set(l.id, {
          id: l.id,
          nome: l.nome,
          donoId: l.donoId,
          jogador: nomeJogador({ papelDono, nomeDono: l.nomeDono }),
          pdn: ehPdN({ papelDono, status: l.status }),
          ehMeu: l.donoId === usuario.id,
          compartilhaCondicao: l.compartilhaCondicao,
          coteriesEmComum: [l.nomeCoterie],
          coterieIds: [l.coterieId],
          condicao: podeVerCondicao(usuario, l) ? condicaoDe(l.ficha) : null,
        })
      }
    }

    const membros = Array.from(mapaPersonagens.values()).sort((a, b) => {
      // Meus personagens primeiro; depois ordem alfabética
      if (a.ehMeu && !b.ehMeu) return -1
      if (!a.ehMeu && b.ehMeu) return 1
      return a.nome.localeCompare(b.nome)
    })

    return {
      coteries: coteriesDoUsuario,
      membros,
    }
  })
