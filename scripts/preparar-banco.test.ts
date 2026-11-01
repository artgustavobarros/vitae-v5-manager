import { randomBytes } from 'node:crypto'

import { Client } from 'pg'
import { symmetricDecrypt } from 'better-auth/crypto'
import { expect, it } from 'vitest'

import { criptografarTokensGoogle, prepararAcessoAplicacao } from './preparar-banco.ts'

it('permite operações de dados e nega administração e migrations ao app', async () => {
  const sufixo = randomBytes(8).toString('hex')
  const nome = `teste_seguranca_${sufixo}`
  const papel = `teste_app_${sufixo}`
  const papelIndevido = `teste_indevido_${sufixo}`
  const senha = randomBytes(32).toString('hex')
  const admin = new Client({ connectionString: process.env.DATABASE_URL })
  await admin.connect()
  let criouBanco = false
  let banco: Client | undefined
  let app: Client | undefined
  try {
    await admin.query(`CREATE DATABASE ${admin.escapeIdentifier(nome)}`)
    criouBanco = true
    const url = new URL(process.env.DATABASE_URL!)
    url.pathname = `/${nome}`
    banco = new Client({ connectionString: url.toString() })
    await banco.connect()
    await banco.query('CREATE TABLE public.ficha_teste (id serial PRIMARY KEY, nome text NOT NULL)')
    await banco.query('CREATE SCHEMA drizzle; CREATE TABLE drizzle.migrations_teste (id int)')
    await banco.query('CREATE TABLE public.account (id text PRIMARY KEY, provider_id text, access_token text, refresh_token text, id_token text, password text)')
    await banco.query("INSERT INTO public.account VALUES ('google', 'google', 'ya29.teste', '1//teste', 'id-publico', NULL), ('senha', 'credential', NULL, NULL, NULL, 'hash-existente')")
    const segredo = randomBytes(32).toString('hex')
    await criptografarTokensGoogle(banco, segredo)
    const { rows: [google] } = await banco.query("SELECT * FROM public.account WHERE id = 'google'")
    expect(google.access_token).not.toBe('ya29.teste')
    expect(await symmetricDecrypt({ key: segredo, data: google.access_token })).toBe('ya29.teste')
    expect(await symmetricDecrypt({ key: segredo, data: google.refresh_token })).toBe('1//teste')
    expect(google.id_token).toBe('id-publico')
    await criptografarTokensGoogle(banco, segredo)
    expect((await banco.query("SELECT access_token FROM public.account WHERE id = 'google'")).rows[0].access_token).toBe(google.access_token)
    expect((await banco.query("SELECT password FROM public.account WHERE id = 'senha'")).rows[0].password).toBe('hash-existente')
    await expect(criptografarTokensGoogle(banco, randomBytes(32).toString('hex'))).rejects.toThrow()
    expect((await banco.query("SELECT access_token FROM public.account WHERE id = 'google'")).rows[0].access_token).toBe(google.access_token)
    await prepararAcessoAplicacao(banco, papel, senha)
    // Uma segunda subida deve preservar o papel e os dados existentes.
    await prepararAcessoAplicacao(banco, papel, senha)
    await banco.query('CREATE TABLE public.tabela_futura (id serial PRIMARY KEY)')
    url.username = papel
    url.password = senha
    app = new Client({ connectionString: url.toString() })
    await app.connect()
    await app.query("INSERT INTO public.ficha_teste (nome) VALUES ('Helena')")
    await app.query("UPDATE public.ficha_teste SET nome = 'João'")
    expect((await app.query('SELECT nome FROM public.ficha_teste')).rows).toEqual([{ nome: 'João' }])
    await app.query('INSERT INTO public.tabela_futura DEFAULT VALUES')
    await app.query('DELETE FROM public.ficha_teste')
    for (const sql of [
      'CREATE TABLE public.indevida (id int)',
      'ALTER TABLE public.ficha_teste ADD COLUMN indevida int',
      'DROP TABLE public.ficha_teste',
      'SELECT * FROM drizzle.migrations_teste',
      `ALTER ROLE ${admin.escapeIdentifier(papel)} SUPERUSER`,
      `CREATE ROLE ${admin.escapeIdentifier(papelIndevido)}`,
    ]) {
      await expect(app.query(sql)).rejects.toMatchObject({ code: '42501' })
    }
    const { rows: [permissoes] } = await app.query('SELECT rolsuper, rolcreatedb, rolcreaterole, rolbypassrls FROM pg_roles WHERE rolname = current_user')
    expect(permissoes).toEqual({ rolsuper: false, rolcreatedb: false, rolcreaterole: false, rolbypassrls: false })
  } finally {
    await app?.end()
    await banco?.end()
    if (criouBanco) await admin.query(`DROP DATABASE ${admin.escapeIdentifier(nome)}`)
    await admin.query(`DROP ROLE IF EXISTS ${admin.escapeIdentifier(papelIndevido)}`)
    await admin.query(`DROP ROLE IF EXISTS ${admin.escapeIdentifier(papel)}`)
    await admin.end()
  }
}, 15_000)
