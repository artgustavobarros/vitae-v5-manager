import { eq, inArray } from 'drizzle-orm'

import { db } from '#/db'
import { combate, personagem } from '#/db/schema'
import type { InfoVisibilidadeJogador } from '#/domain/combate'
import { filtrarCombatePublico, filtrarRelogiosPublicos } from '#/domain/exibicao-publica'
import { vitalidadeMax, vontadeMax } from '#/domain/ficha'
import { validarLinkPublicoNoBanco } from './link-publico-db'
import { listarRelogiosNoBanco } from './relogios-db'

type Banco = Pick<typeof db, 'select'>

export async function carregarExibicaoPublicaNoBanco(token: string, banco: Banco = db) {
  if (!await validarLinkPublicoNoBanco(token, banco)) return { valido: false } as const
  const [[ativo], relogios] = await Promise.all([
    banco.select().from(combate).where(eq(combate.ativo, true)).limit(1),
    listarRelogiosNoBanco('jogador', banco),
  ])
  const ids = ativo?.participantes.flatMap((p) => p.tipo === 'personagem' ? [p.personagemId] : []) ?? []
  const fichas = ids.length > 0 ? await banco.select({ id: personagem.id, ficha: personagem.ficha })
    .from(personagem).where(inArray(personagem.id, ids)) : []
  const condicoes: InfoVisibilidadeJogador['condicoesPersonagens'] = {}
  for (const p of fichas) condicoes[p.id] = {
    compartilhaCondicao: false, vitalidadeMax: vitalidadeMax(p.ficha), vontadeMax: vontadeMax(p.ficha),
    danoVitalidade: p.ficha.danoVitalidade, danoVontade: p.ficha.danoVontade, fome: p.ficha.fome,
  }
  // Revogação durante a consulta também impede a entrega do snapshot.
  if (!await validarLinkPublicoNoBanco(token, banco)) return { valido: false } as const
  return { valido: true, combate: ativo ? filtrarCombatePublico(ativo, condicoes) : null,
    relogios: filtrarRelogiosPublicos(relogios) } as const
}
