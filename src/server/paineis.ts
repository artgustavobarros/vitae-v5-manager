import { createServerFn } from '@tanstack/react-start'
import { and, asc, eq, inArray } from 'drizzle-orm'

import { db } from '#/db'
import { coterie, membroCoterie, personagem, user } from '#/db/schema'
import type { Papel } from '#/domain/acesso'
import { vitalidadeMax, vontadeMax } from '#/domain/ficha'
import { ehPdN } from '#/domain/permissoes-ficha'
import type { Dano } from '#/domain/trilhas'
import { exigirNarrador, exigirUsuario } from './sessao'

export const carregarPainelNarrador = createServerFn({ method: 'GET' })
  .middleware([exigirNarrador])
  .handler(async () => {
    const todasCoteries = await db
      .select({ id: coterie.id, nome: coterie.nome })
      .from(coterie)
      .orderBy(asc(coterie.nome))

    // Membresias
    const associacoes = await db
      .select({
        personagemId: membroCoterie.personagemId,
        coterieId: coterie.id,
        nomeCoterie: coterie.nome,
      })
      .from(membroCoterie)
      .innerJoin(coterie, eq(membroCoterie.coterieId, coterie.id))

    const coteriesPorPersonagem = new Map<string, { id: string; nome: string }[]>()
    for (const a of associacoes) {
      const lista = coteriesPorPersonagem.get(a.personagemId) ?? []
      lista.push({ id: a.coterieId, nome: a.nomeCoterie })
      coteriesPorPersonagem.set(a.personagemId, lista)
    }

    // Personagens ativos de jogadores
    const ativos = await db
      .select({
        id: personagem.id,
        nome: personagem.nome,
        status: personagem.status,
        donoId: personagem.donoId,
        nomeDono: user.name,
        papelDono: user.papel,
        ficha: personagem.ficha,
      })
      .from(personagem)
      .innerJoin(user, eq(personagem.donoId, user.id))
      .where(and(eq(personagem.status, 'ativo'), eq(user.papel, 'jogador')))
      .orderBy(asc(personagem.nome))

    // PdNs fixados
    const pdns = await db
      .select({
        id: personagem.id,
        nome: personagem.nome,
        status: personagem.status,
        donoId: personagem.donoId,
        nomeDono: user.name,
        papelDono: user.papel,
        ficha: personagem.ficha,
      })
      .from(personagem)
      .innerJoin(user, eq(personagem.donoId, user.id))
      .where(and(eq(personagem.fixado, true), eq(user.papel, 'narrador')))
      .orderBy(asc(personagem.nome))

    function mapear(p: (typeof ativos)[number]) {
      const cots = coteriesPorPersonagem.get(p.id) ?? []
      return {
        id: p.id,
        nome: p.nome,
        jogador: p.papelDono === 'narrador' ? null : p.nomeDono,
        coteries: cots.map((c) => c.nome),
        coterieIds: cots.map((c) => c.id),
        vitalidadeMax: vitalidadeMax(p.ficha),
        vontadeMax: vontadeMax(p.ficha),
        danoVitalidade: p.ficha.danoVitalidade,
        danoVontade: p.ficha.danoVontade,
        fome: p.ficha.fome,
        humanidade: p.ficha.humanidade,
        manchas: p.ficha.manchas,
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
        condicao: {
          danoVitalidade: Dano
          danoVontade: Dano
          fome: number
          maxVit: number
          maxVont: number
        } | null
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
        const ehMeu = l.donoId === usuario.id
        const pdn = ehPdN({ papelDono: l.papelDono as Papel, status: l.status })
        const podeVerCondicao = ehMeu || l.compartilhaCondicao

        mapaPersonagens.set(l.id, {
          id: l.id,
          nome: l.nome,
          donoId: l.donoId,
          jogador: pdn ? null : l.nomeDono,
          pdn,
          ehMeu,
          compartilhaCondicao: l.compartilhaCondicao,
          coteriesEmComum: [l.nomeCoterie],
          coterieIds: [l.coterieId],
          condicao: podeVerCondicao
            ? {
                danoVitalidade: l.ficha.danoVitalidade,
                danoVontade: l.ficha.danoVontade,
                fome: l.ficha.fome,
                maxVit: vitalidadeMax(l.ficha),
                maxVont: vontadeMax(l.ficha),
              }
            : null,
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
