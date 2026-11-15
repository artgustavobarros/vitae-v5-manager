import { createServerFn } from '@tanstack/react-start'
import { and, asc, eq } from 'drizzle-orm'

import { db } from '#/db'
import { personagem, user } from '#/db/schema'
import type { Papel } from '#/domain/acesso'
import { condicaoDe } from '#/domain/condicao'
import { nomeJogador } from '#/domain/permissoes-ficha'
import { exigirNarrador } from './sessao'

// Colunas de cada Personagem listado no Painel do Narrador (Jogadores ativos e PdNs fixados).
const colunasPersonagemNoPainel = {
  id: personagem.id,
  nome: personagem.nome,
  status: personagem.status,
  tipo: personagem.tipo,
  donoId: personagem.donoId,
  jogadorNome: personagem.jogadorNome,
  nomeDono: user.name,
  papelDono: user.papel,
  ficha: personagem.ficha,
  ressonanciaAtual: personagem.ressonanciaAtual,
  compulsaoAtiva: personagem.compulsaoAtiva,
}

export const carregarPainelNarrador = createServerFn({ method: 'GET' })
  .middleware([exigirNarrador])
  .handler(async () => {
    const [ativos, pdns] = await Promise.all([
      db
        .select(colunasPersonagemNoPainel)
        .from(personagem)
        .innerJoin(user, eq(personagem.donoId, user.id))
        .where(and(eq(personagem.status, 'ativo'), eq(personagem.tipo, 'jogador')))
        .orderBy(asc(personagem.nome)),
      db
        .select(colunasPersonagemNoPainel)
        .from(personagem)
        .innerJoin(user, eq(personagem.donoId, user.id))
        .where(and(eq(personagem.status, 'ativo'), eq(personagem.fixado, true), eq(personagem.tipo, 'nao_jogador')))
        .orderBy(asc(personagem.nome)),
    ])

    function mapear(p: (typeof ativos)[number]) {
      return {
        id: p.id,
        nome: p.nome,
        jogador: nomeJogador({ papelDono: p.papelDono as Papel, nomeDono: p.nomeDono, jogadorNome: p.jogadorNome }),
        condicao: condicaoDe(p.ficha),
        humanidade: p.ficha.humanidade,
        manchas: p.ficha.manchas,
        ressonanciaAtual: p.ressonanciaAtual,
        compulsaoAtiva: p.compulsaoAtiva,
      }
    }

    return {
      personagensAtivos: ativos.map(mapear),
      pdnsFixados: pdns.map(mapear),
    }
  })
