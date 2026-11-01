import { config } from 'dotenv'
import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import * as schema from '../src/db/schema.ts'
import { inserirModelosIniciaisBestiario } from '../src/server/bestiario-inicial-db.ts'

config({ path: ['.env.local', '.env'], quiet: true })
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL ausente')

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
try {
  const resultado = await inserirModelosIniciaisBestiario(drizzle(pool, { schema }))
  console.log(`Antagonistas: ${resultado.inseridos} Modelos inseridos; ${resultado.preservados} preservados.`)
} finally {
  await pool.end()
}
