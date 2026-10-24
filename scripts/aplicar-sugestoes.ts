import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import { config } from 'dotenv'
import { Pool } from 'pg'

import { aplicarSugestaoNaFonte, type SugestaoFonte } from '../src/domain/catalogo/aplicar-sugestao-fonte.ts'

config({ path: ['.env.local', '.env'] })
if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL ausente')

const diretorio = join(process.cwd(), 'src/domain/catalogo')
const arquivos = (await readdir(diretorio, { recursive: true }))
  .filter((nome) => nome.endsWith('.ts') && !nome.endsWith('.test.ts'))
  .map((nome) => join(diretorio, nome))
const fontes = new Map(await Promise.all(arquivos.map(async (arquivo) => [arquivo, await readFile(arquivo, 'utf8')] as const)))

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
let sugestoes: SugestaoFonte[]
try {
  const resultado = await pool.query<{
    item_id: string
    sugestao_nome: string | null
    sugestao_descricao: string | null
  }>(`
    SELECT item_id, sugestao_nome, sugestao_descricao
    FROM (
      SELECT DISTINCT ON (item_id) item_id, status, sugestao_nome, sugestao_descricao
      FROM revisao_traducao
      ORDER BY item_id, criado_em DESC, id DESC
    ) AS ultima
    WHERE status = 'sugerido'
  `)
  sugestoes = resultado.rows.map((r) => ({
    itemId: r.item_id,
    sugestaoNome: r.sugestao_nome,
    sugestaoDescricao: r.sugestao_descricao,
  }))
} finally {
  await pool.end()
}

const alterados = new Set<string>()
for (const sugestao of sugestoes) {
  const consulta = sugestao.itemId.startsWith('consulta-')
  const candidatos = arquivos.filter((arquivo) =>
    consulta
      ? arquivo.endsWith(sugestao.itemId.startsWith('consulta-termo-') ? '/termos.ts' : '/regras-consulta.ts')
      : !arquivo.endsWith('/termos.ts') && !arquivo.endsWith('/regras-consulta.ts'),
  )
  const encontrados = candidatos.flatMap((arquivo) => {
    const resultado = aplicarSugestaoNaFonte(fontes.get(arquivo)!, sugestao)
    return resultado === null ? [] : [{ arquivo, resultado }]
  })
  if (encontrados.length !== 1) throw new Error(`Esperado um item para ${sugestao.itemId}; encontrados: ${encontrados.length}`)
  fontes.set(encontrados[0].arquivo, encontrados[0].resultado)
  alterados.add(encontrados[0].arquivo)
}

for (const arquivo of alterados) await writeFile(arquivo, fontes.get(arquivo)!)
console.log(`${sugestoes.length} sugestões aplicadas em ${alterados.size} arquivos. Revise o diff e faça deploy.`)
