import { readFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { expect, it } from 'vitest'
import { sql } from 'drizzle-orm'
import { db } from '#/db'
import { modeloAntagonista } from '#/db/schema'

it('agrupa as criaturas e preserva nomes editados, etiquetas existentes, ficha e aprovação', async () => {
  const reverter = new Error('Reverter os dados de teste')
  try {
    await db.transaction(async tx => {
      await tx.delete(modeloAntagonista)
      const casos = [
        { id: '5897aa61-9526-5b5d-ad4e-83a260d0e006', nome: 'Fada do Narrador', antiga: 'Criatura sobrenatural', antes: ['Veterana'], categoria: 'Outras criaturas', etiquetas: ['Veterana', 'Fada'] },
        { id: '54bc13f5-774f-5a0d-a7c9-16af92bdedc3', nome: 'Mago', antiga: 'Criatura sobrenatural', antes: ['Mago'], categoria: 'Outras criaturas', etiquetas: ['Mago'] },
        { id: '4f269a23-af61-5826-9b94-580b749ca282', nome: 'Espectro', antiga: 'Criatura sobrenatural', antes: [], categoria: 'Outras criaturas', etiquetas: ['Espectro'] },
        { id: '7d29db87-b745-52f1-8ef0-53e52718f6e8', nome: 'Lupino', antiga: 'Lobisomem', antes: [], categoria: 'Outras criaturas', etiquetas: ['Lobisomem'] },
        { id: randomUUID(), nome: 'Lobisomem', antiga: 'Vampiro', antes: ['Lobisomem'], categoria: 'Vampiro', etiquetas: ['Lobisomem'] },
      ]
      for (const c of casos) await tx.execute(sql`INSERT INTO modelo_antagonista (id,nome,categoria,etiquetas,vitalidade,notas,status_revisao,incluido) VALUES (${c.id},${c.nome},${c.antiga},${JSON.stringify(c.antes)}::jsonb,8,'Conferido','aprovado',true)`)
      await tx.execute(sql.raw(readFileSync('drizzle/0021_outras_criaturas.sql', 'utf8')))
      const modelos = await tx.select().from(modeloAntagonista)
      for (const c of casos) expect(modelos.find(m => m.id === c.id)).toMatchObject({ nome: c.nome, categoria: c.categoria, etiquetas: c.etiquetas, vitalidade: 8, notas: 'Conferido', statusRevisao: 'aprovado', incluido: true })
      throw reverter
    })
  } catch (erro) { if (erro !== reverter) throw erro }
})
