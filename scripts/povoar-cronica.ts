// Leva os Modelos do Bestiário e os Pré-Combates próprios da crônica para qualquer ambiente.
// Idempotente: nada é sobrescrito; o que já existe com o mesmo nome é preservado.
// As referências entre Pré-Combate e Modelo são resolvidas pelo NOME, porque cada
// ambiente gera os próprios uuids.
import { readFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { Client } from 'pg'

type ModeloCronica = {
  nome: string
  categoria: string
  notas: string
  nota_revisao: string
  status_revisao: string
  incluido: boolean
  vitalidade: number
  vontade: number
  parada_fisico: number
  parada_social: number
  parada_mental: number
  paradas_excepcionais: unknown
  especiais: unknown
  etiquetas: unknown
  ficha_completa: unknown
}

type InimigoCronica = { nome: string; modelo: string | null; recursosSobrenaturais: unknown }
type PreCombateCronica = { nome: string; inimigos: InimigoCronica[] }
type DadosCronica = { modelos: ModeloCronica[]; preCombates: PreCombateCronica[] }

export function lerDadosCronica(caminho: string): DadosCronica {
  return JSON.parse(readFileSync(caminho, 'utf8')) as DadosCronica
}

/** Insere só os Modelos ausentes, comparando pelo nome. */
export async function povoarModelos(banco: Client, modelos: ModeloCronica[]) {
  let inseridos = 0
  for (const modelo of modelos) {
    const { rowCount } = await banco.query(
      `INSERT INTO modelo_antagonista (
         nome, categoria, notas, nota_revisao, status_revisao, incluido,
         vitalidade, vontade, parada_fisico, parada_social, parada_mental,
         paradas_excepcionais, especiais, etiquetas, ficha_completa
       )
       SELECT $1, $2, $3, $4, $5::status_revisao_bestiario, $6, $7, $8, $9, $10, $11,
              $12::jsonb, $13::jsonb, $14::jsonb, $15::jsonb
       WHERE NOT EXISTS (SELECT 1 FROM modelo_antagonista WHERE nome = $1)`,
      [
        modelo.nome, modelo.categoria, modelo.notas, modelo.nota_revisao, modelo.status_revisao,
        modelo.incluido, modelo.vitalidade, modelo.vontade,
        modelo.parada_fisico, modelo.parada_social, modelo.parada_mental,
        JSON.stringify(modelo.paradas_excepcionais ?? []),
        JSON.stringify(modelo.especiais ?? []),
        JSON.stringify(modelo.etiquetas ?? []),
        modelo.ficha_completa == null ? null : JSON.stringify(modelo.ficha_completa),
      ],
    )
    if (rowCount) inseridos += 1
  }
  return { inseridos, preservados: modelos.length - inseridos }
}

/** Insere só os Pré-Combates ausentes, apontando para os Modelos pelo nome. */
export async function povoarPreCombates(banco: Client, preCombates: PreCombateCronica[]) {
  const { rows } = await banco.query<{ id: string; nome: string }>('SELECT id, nome FROM modelo_antagonista')
  const idPorNome = new Map(rows.map((linha) => [linha.nome, linha.id]))

  let inseridos = 0
  const semModelo: string[] = []
  for (const preCombate of preCombates) {
    const inimigos = preCombate.inimigos.map((inimigo) => {
      const modeloId = inimigo.modelo ? idPorNome.get(inimigo.modelo) : undefined
      if (!modeloId) semModelo.push(`${preCombate.nome} → ${inimigo.modelo ?? inimigo.nome}`)
      return {
        id: randomUUID(),
        modeloId,
        nome: inimigo.nome,
        ...(inimigo.recursosSobrenaturais ? { recursosSobrenaturais: inimigo.recursosSobrenaturais } : {}),
      }
    })
    if (inimigos.some((inimigo) => !inimigo.modeloId)) continue

    const { rowCount } = await banco.query(
      `INSERT INTO pre_combate (nome, inimigos)
       SELECT $1, $2::jsonb
       WHERE NOT EXISTS (SELECT 1 FROM pre_combate WHERE nome = $1)`,
      [preCombate.nome, JSON.stringify(inimigos)],
    )
    if (rowCount) inseridos += 1
  }
  return { inseridos, ignorados: preCombates.length - inseridos, semModelo }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL ausente')
  const dados = lerDadosCronica(resolve(dirname(fileURLToPath(import.meta.url)), 'dados/cronica.json'))
  const banco = new Client({ connectionString: process.env.DATABASE_URL })
  await banco.connect()
  try {
    const modelos = await povoarModelos(banco, dados.modelos)
    console.log(`Bestiário da crônica: ${modelos.inseridos} inseridos; ${modelos.preservados} já existiam.`)
    const preCombates = await povoarPreCombates(banco, dados.preCombates)
    console.log(`Pré-Combates: ${preCombates.inseridos} inseridos; ${preCombates.ignorados} já existiam ou sem Modelo.`)
    for (const pendencia of new Set(preCombates.semModelo)) {
      console.warn(`Aviso: Modelo ausente no banco, Pré-Combate pulado — ${pendencia}`)
    }
  } finally {
    await banco.end()
  }
}
