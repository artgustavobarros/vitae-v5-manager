import { readFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { sql } from 'drizzle-orm'
import { db } from '#/db'
import { modeloAntagonista } from '#/db/schema'
import { criarModeloAntagonistaPadrao } from '#/domain/bestiario'
import { listarModelosBestiarioNoBanco, salvarModeloBestiarioNoBanco } from './revisao-bestiario-db'

it('migra categorias antigas para tipos e etiquetas preservando fichas e decisões', async () => {
  const reverter = new Error('Reverter os dados de teste')
  try {
    await db.transaction(async tx => {
      await tx.delete(modeloAntagonista)
      const casos = [
        { id: randomUUID(), nome: 'Bispo', antiga: 'Vampiro · Sabá', categoria: 'Vampiro', antes: ['Veterano'], etiquetas: ['Veterano', 'Sabá'] },
        { id: '953a9534-2483-4ee7-b5d6-4578a672ee2b', nome: 'Guarda da porta', antiga: 'Ataque', categoria: 'Carniçal', antes: [], etiquetas: ['Ataque'] },
        { id: randomUUID(), nome: 'Carniçal', antiga: 'Geral', categoria: 'Carniçal', antes: [], etiquetas: ['Geral'] },
        { id: randomUUID(), nome: 'Vigilante', antiga: 'Segurança', categoria: 'Outros', antes: [], etiquetas: ['Segurança'] },
        { id: '19e21a6a-0f97-5b30-ba54-6f48aed6f8b5', nome: 'Sabujo de Sangue', antiga: 'Carniçal', categoria: 'Carniçal', antes: ['Sabá'], etiquetas: ['Sabá'] },
        { id: randomUUID(), nome: 'Xerife', antiga: 'Vampiro', categoria: 'Vampiro', antes: ['Camarilla'], etiquetas: ['Camarilla'] },
      ]
      for (const c of casos) await tx.execute(sql`INSERT INTO modelo_antagonista (id,nome,categoria,etiquetas,vitalidade,vontade,notas,status_revisao,nota_revisao,incluido) VALUES (${c.id},${c.nome},${c.antiga},${JSON.stringify(c.antes)}::jsonb,7,5,'Conferido pelo Narrador','aprovado','Manter ajustes',true)`)
      const migracao = readFileSync('drizzle/0020_etiquetas_antagonistas.sql', 'utf8').split('--> statement-breakpoint').slice(2).join(';')
      if (migracao.trim()) await tx.execute(sql.raw(migracao))
      const modelos = await listarModelosBestiarioNoBanco(tx)
      for (const c of casos) {
        expect(modelos.find(m => m.id === c.id)).toMatchObject({ nome: c.nome, categoria: c.categoria, etiquetas: c.etiquetas, vitalidade: 7, vontade: 5, notas: 'Conferido pelo Narrador' })
      }
      const linhas = await tx.select().from(modeloAntagonista)
      expect(linhas.every(m => m.statusRevisao === 'aprovado' && m.notaRevisao === 'Manter ajustes' && m.incluido)).toBe(true)
      throw reverter
    })
  } catch (erro) { if (erro !== reverter) throw erro }
})

describe('Etiquetas persistidas no Modelo', () => {
  it('salva, lista e edita etiquetas sem alterar o tipo', async () => {
    const reverter = new Error('Reverter os dados de teste')
    try {
      await db.transaction(async tx => {
        await tx.delete(modeloAntagonista)
        const modelo = await salvarModeloBestiarioNoBanco({ ...criarModeloAntagonistaPadrao(), nome: 'Carniçal de teste', categoria: 'Carniçal', etiquetas: ['Sabá', 'Ataque'] }, tx)
        await salvarModeloBestiarioNoBanco({ ...modelo, etiquetas: ['Ataque', '  Veterano  ', 'veterano'] }, tx)
        expect((await listarModelosBestiarioNoBanco(tx)).find(m => m.id === modelo.id)).toMatchObject({ categoria: 'Carniçal', etiquetas: ['Ataque', 'Veterano'] })
        throw reverter
      })
    } catch (erro) { if (erro !== reverter) throw erro }
  })
})
