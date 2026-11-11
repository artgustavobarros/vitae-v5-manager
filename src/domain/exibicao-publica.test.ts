import { describe, expect, it } from 'vitest'

import { definirRevelarCondicao, filtrarCombateParaJogador, iniciarCombate, participantePersonagemSchema, type ParticipanteInimigo } from './combate'
import { filtrarCombatePublico, filtrarEventoPublico, filtrarRelogiosPublicos } from './exibicao-publica'
import type { RelogioSalvo } from './relogios'

const inimigo: ParticipanteInimigo = {
  id: 'inimigo', tipo: 'inimigo', nome: 'Guarda', vitalidadeMax: 5,
  danoVitalidade: { superficial: 2, agravado: 0 }, vontadeMax: 3,
  danoVontade: { superficial: 0, agravado: 0 }, revelarVitalidade: false,
  paradas: { fisico: 4, social: 2, mental: 2, excepcionais: [] },
  especiais: [{ nome: 'Segredo', descricao: 'Poder secreto' }], notas: 'Trairá o príncipe', condicoes: [],
}
const relogio: RelogioSalvo = {
  id: 'relogio', nome: 'Cerco', tipo: 'Ameaça', descricao: 'Guardas chegando', total: 6, atual: 2,
  perigo: 'aumenta', visivel: true, revisao: 1, ultimaTendencia: null,
  efeitos: [
    { id: 'ativo', titulo: 'Alerta', etapa: 2, condicao: 'a_partir_de', textoAtivacao: 'Alarme!', textoDesativacao: 'O alarme parou.' },
    { id: 'futuro', titulo: 'Emboscada secreta', etapa: 5, condicao: 'a_partir_de', textoAtivacao: 'Armadilha!', textoDesativacao: 'Fuga.' },
  ],
}

describe('Exibição pública', () => {
  const personagem = { id: 'pj', tipo: 'personagem' as const, nome: 'Ana',
    personagemId: '123e4567-e89b-12d3-a456-426614174000', ehPdn: false, condicoes: [] }
  const condicao = { compartilhaCondicao: false, vitalidadeMax: 6, vontadeMax: 5,
    danoVitalidade: { superficial: 2, agravado: 1 }, danoVontade: { superficial: 1, agravado: 0 }, fome: 3 }

  it('divulga a Condição autorizada pelo Narrador sem conceder edição ou acesso à Ficha', () => {
    const participante = participantePersonagemSchema.parse({ ...personagem, revelarCondicao: true })
    const publico = filtrarCombatePublico(iniciarCombate([participante]), { [personagem.personagemId]: condicao })
    expect(publico.participantes[0]).toMatchObject({ ehMeu: false, condicaoOculta: false,
      condicao: { vitalidadeMax: 6, vontadeMax: 5, danoVitalidade: { superficial: 2, agravado: 1 },
        danoVontade: { superficial: 1, agravado: 0 }, fome: 3 } })
    expect(publico.participantes[0].condicao).not.toHaveProperty('compartilhaCondicao')
  })

  it('a autorização também permite consultar a Condição sem dividir Coterie', () => {
    const participante = { ...personagem, revelarCondicao: true }
    const visivel = filtrarCombateParaJogador(iniciarCombate([participante]), {
      jogadorId: 'outro', meusPersonagemIds: [], coterieIdsDoJogador: [], coteriesPorPersonagem: {},
      condicoesPersonagens: { [personagem.personagemId]: condicao },
    })
    expect(visivel.participantes[0]).toMatchObject({ ehMeu: false, condicaoOculta: false, condicao: { fome: 3 } })
  })

  it('oculta novamente a Condição no próximo snapshot sem alterar dano nem outros participantes', () => {
    const combate = iniciarCombate([{ ...personagem, revelarCondicao: true }, inimigo])
    const oculto = definirRevelarCondicao(combate, 'pj', false)
    const publico = filtrarCombatePublico(oculto, { [personagem.personagemId]: condicao })
    expect(publico.participantes[0]).toMatchObject({ condicaoOculta: true, estadoSaude: { estado: 'ferido' } })
    expect(publico.participantes[0].condicao).toBeUndefined()
    expect(oculto.participantes[1]).toEqual(inimigo)
    expect(combate.participantes[0]).toHaveProperty('revelarCondicao', true)
  })

  it('salva a escolha explícita sem invertê-la ao repetir a operação', () => {
    const aberto = definirRevelarCondicao(iniciarCombate([personagem]), 'pj', true)
    const repetido = definirRevelarCondicao(aberto, 'pj', true)
    expect(repetido.participantes[0]).toHaveProperty('revelarCondicao', true)
    expect(() => definirRevelarCondicao(aberto, 'inexistente', true)).toThrow('Personagem')
    expect(() => definirRevelarCondicao(iniciarCombate([inimigo]), inimigo.id, true)).toThrow('Personagem')
  })

  it('envia a ordem e o estado de saúde, sem recursos ocultos ou segredos do Inimigo', () => {
    const publico = filtrarCombatePublico(iniciarCombate([inimigo]))
    expect(publico.participantes[0]).toMatchObject({ nome: 'Guarda', vitalidadeOculta: true, estadoSaude: { estado: 'escoriado' } })
    expect(JSON.stringify(publico)).not.toMatch(/Trairá|Segredo|paradas|danoVitalidade|vitalidadeMax|vontadeMax/)
  })

  it('revela somente a Vitalidade autorizada, nunca poderes e notas', () => {
    const publico = filtrarCombatePublico(iniciarCombate([{ ...inimigo, revelarVitalidade: true }]))
    expect(publico.participantes[0]).toMatchObject({ vitalidadeMax: 5, danoVitalidade: { superficial: 2, agravado: 0 } })
    expect(JSON.stringify(publico)).not.toMatch(/Trairá|Segredo|paradas|vontadeMax/)
  })

  it('não concede privilégios de dono nem transforma compartilhamento de Coterie em divulgação pública', () => {
    const publico = filtrarCombatePublico(iniciarCombate([
      { id: 'pj', tipo: 'personagem', nome: 'Ana', personagemId: 'ficha', ehPdn: false, condicoes: ['frenesi'] },
    ]), { ficha: { compartilhaCondicao: true, vitalidadeMax: 6, vontadeMax: 5,
      danoVitalidade: { superficial: 1, agravado: 0 }, danoVontade: { superficial: 0, agravado: 0 }, fome: 3 } })
    expect(publico.participantes[0]).toMatchObject({ nome: 'Ana', ehMeu: false, condicaoOculta: true, condicoes: ['frenesi'] })
    expect(publico.participantes[0].condicao).toBeUndefined()
  })

  it('remove Relógios ocultos e não antecipa efeitos futuros nem textos de desativação', () => {
    const publicos = filtrarRelogiosPublicos([relogio, { ...relogio, id: 'oculto', visivel: false }])
    expect(publicos).toHaveLength(1)
    expect(publicos[0].efeitos).toEqual([{ id: 'ativo', titulo: 'Alerta', etapa: 2, condicao: 'a_partir_de', textoAtivacao: 'Alarme!' }])
    expect(JSON.stringify(publicos)).not.toMatch(/Emboscada|Armadilha|Fuga|alarme parou/)
  })

  it('descarta notificações privadas e sanitiza invalidações', () => {
    expect(filtrarEventoPublico({ tipo: 'mudanca', escopo: 'combate', id: 'privado' }, [])).toEqual({ tipo: 'mudanca', escopo: 'combate' })
    expect(filtrarEventoPublico({ tipo: 'mudanca', escopo: 'personagem', id: 'privado' }, [])).toEqual({ tipo: 'mudanca', escopo: 'combate' })
    expect(filtrarEventoPublico({ tipo: 'mudanca', escopo: 'combate', apenasNarrador: true }, [])).toBeNull()
    expect(filtrarEventoPublico({ tipo: 'notificacao', paraUsuarioId: 'dono', notificacao: { id: 'n', texto: 'Segredo', quando: '', lida: false } }, [])).toBeNull()
  })

  it('transmite avisos somente de Relógios que continuam visíveis', () => {
    const aviso = { id: 'aviso', relogioId: 'relogio', nomeRelogio: 'Cerco', efeitoId: 'ativo', titulo: 'Alerta', texto: 'Alarme!', ativo: true, tendencia: null }
    const evento = { tipo: 'efeitos-relogio', apenasNarrador: false, avisos: [aviso, { ...aviso, relogioId: 'oculto', texto: 'Segredo' }] } as const
    expect(filtrarEventoPublico({ ...evento, avisos: [...evento.avisos] }, ['relogio'])).toEqual({ tipo: 'efeitos-relogio', apenasNarrador: false, avisos: [aviso] })
    expect(filtrarEventoPublico({ ...evento, apenasNarrador: true, avisos: [aviso] }, ['relogio'])).toBeNull()
  })
})
