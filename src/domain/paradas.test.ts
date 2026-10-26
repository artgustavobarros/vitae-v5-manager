import { describe, expect, it } from 'vitest'

import { fichaNeofito } from './ficha'
import {
  listarParadas,
  encontrarParadasRepetidas,
  ordenarParadas,
  podeGerenciarParada,
  filtrarParadas,
  reordenarParadas,
  PARADAS_PADRAO,
  paradaPersonalizadaSchema,
  type ParadaPersonalizada,
} from './paradas'

const personalizada: ParadaPersonalizada = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  nome: 'Interrogar com calma', atributo: 'manipulacao', habilidade: 'intimidacao',
}

describe('Paradas do Personagem', () => {
  it('avisa o título de uma combinação padrão repetida, mesmo com outro nome', () => {
    expect(encontrarParadasRepetidas([], { ...personalizada, nome: 'Ameaçar', atributo: 'carisma' }).map((p) => p.nome))
      .toEqual(['Intimidar pela presença'])
  })

  it('encontra todas as combinações compartilhadas repetidas e ignora o card em edição', () => {
    const outra = { ...personalizada, id: '223e4567-e89b-12d3-a456-426614174000', nome: 'Pressionar' }
    expect(encontrarParadasRepetidas([personalizada, outra], personalizada).map((p) => p.nome))
      .toEqual(['Intimidar com ameaças', 'Pressionar'])
    expect(encontrarParadasRepetidas([personalizada], { ...personalizada, atributo: 'vigor' })).toEqual([])
  })

  it('usa a mesma definição compartilhada e calcula os valores de cada Ficha', () => {
    const primeira = fichaNeofito()
    primeira.atributos.manipulacao = 4
    primeira.habilidades.intimidacao.valor = 2
    expect(listarParadas(primeira, [personalizada]).find((p) => p.id === personalizada.id)?.total).toBe(6)
    expect(listarParadas(fichaNeofito(), [personalizada]).find((p) => p.id === personalizada.id)?.total).toBe(1)
  })

  it('aplica ordens pessoais independentes ao mesmo catálogo, sem alterar as definições', () => {
    const catalogo = [...PARADAS_PADRAO, personalizada]
    expect(ordenarParadas(catalogo, [personalizada.id])[0].nome).toBe('Interrogar com calma')
    expect(ordenarParadas(catalogo, ['padrao-atirar'])[0].nome).toBe('Atirar com precisão')
    expect(catalogo[0].nome).toBe('Intimidar pela presença')
  })

  it.each([
    { usuario: { id: 'ana', papel: 'jogador' as const }, criador: 'ana', permitido: true },
    { usuario: { id: 'ana', papel: 'jogador' as const }, criador: 'bruno', permitido: false },
    { usuario: { id: 'ana', papel: 'jogador' as const }, criador: null, permitido: false },
    { usuario: { id: 'mestre', papel: 'narrador' as const }, criador: 'bruno', permitido: true },
    { usuario: { id: 'mestre', papel: 'narrador' as const }, criador: null, permitido: true },
  ])('permite gerenciar a Parada apenas ao autor ou Narrador: $usuario.id / $criador', ({ usuario, criador, permitido }) => {
    expect(podeGerenciarParada(usuario, criador)).toBe(permitido)
  })

  it('restaura a ordem salva, ignora ids removidos e duplicados e mantém Paradas novas', () => {
    const paradas = listarParadas(fichaNeofito(), [personalizada], [personalizada.id, 'removida', 'padrao-atirar', personalizada.id])
    expect(paradas.slice(0, 3).map((p) => p.id)).toEqual([personalizada.id, 'padrao-atirar', 'padrao-intimidar-presenca'])
    expect(paradas).toHaveLength(18)
    expect(paradas[0].personalizada).toBe(true)
    expect(new Set(paradas.map((p) => p.id)).size).toBe(18)
  })

  it('move uma Parada entre posições sem mudar os dados ou perder as demais', () => {
    const paradas = listarParadas(fichaNeofito(), [])
    const ids = reordenarParadas(paradas, 'padrao-convencer', 'padrao-intimidar-presenca')
    expect(ids.slice(0, 3)).toEqual(['padrao-convencer', 'padrao-intimidar-presenca', 'padrao-intimidar-ameacas'])
    expect(ids).toHaveLength(17)
    expect(paradas[0].id).toBe('padrao-intimidar-presenca')
    const restauradas = listarParadas(fichaNeofito(), [], ids)
    expect(reordenarParadas(restauradas, 'padrao-convencer', 'padrao-intimidar-ameacas').slice(0, 3))
      .toEqual(['padrao-intimidar-presenca', 'padrao-intimidar-ameacas', 'padrao-convencer'])
  })

  it('reordena os ids visíveis sem excluir Paradas ocultas pelo filtro', () => {
    const paradas = listarParadas(fichaNeofito(), [])
    const ids = reordenarParadas(paradas, 'padrao-atirar', 'padrao-furtividade')
    const restauradas = listarParadas(fichaNeofito(), [], ids)
    expect(filtrarParadas(restauradas, 'fisico').slice(0, 2).map((p) => p.id))
      .toEqual(['padrao-atirar', 'padrao-furtividade'])
    expect(filtrarParadas(restauradas, 'social').map((p) => p.id))
      .toEqual(['padrao-intimidar-presenca', 'padrao-intimidar-ameacas', 'padrao-convencer', 'padrao-enganar', 'padrao-ler-intencoes', 'padrao-socializar'])
    expect(restauradas).toHaveLength(17)
  })

  it('recusa origem ou destino inexistentes e aceita soltar no mesmo lugar', () => {
    const paradas = listarParadas(fichaNeofito(), [])
    expect(() => reordenarParadas(paradas, 'inexistente', 'padrao-atirar')).toThrow('não encontrada')
    expect(() => reordenarParadas(paradas, 'padrao-atirar', 'inexistente')).toThrow('não encontrada')
    expect(reordenarParadas(paradas, 'padrao-atirar', 'padrao-atirar')).toEqual(paradas.map((p) => p.id))
  })

  it('classifica pelo grupo da Habilidade mesmo quando o Atributo é de outro grupo', () => {
    const paradas = listarParadas(fichaNeofito(), [{ ...personalizada, atributo: 'forca' }])
    expect(paradas.find((p) => p.id === 'padrao-atirar')?.grupo).toBe('fisico')
    expect(paradas.find((p) => p.id === personalizada.id)?.grupo).toBe('social')
  })

  it('combina filtros de tipo e busca sem acentos, incluindo Personalizadas', () => {
    const paradas = listarParadas(fichaNeofito(), [personalizada])
    expect(filtrarParadas(paradas, 'fisico', 'AUTOCONTROLE').map((p) => p.nome)).toEqual(['Atirar com precisão'])
    expect(filtrarParadas(paradas, 'social', 'intimidacao')).toHaveLength(3)
    expect(filtrarParadas(paradas, 'mental', 'intimidacao')).toEqual([])
    expect(filtrarParadas(paradas, 'todos', '  ')).toHaveLength(18)
  })

  it('calcula Atributo + Habilidade e acompanha mudanças na Ficha', () => {
    const ficha = fichaNeofito()
    ficha.atributos.manipulacao = 3
    ficha.habilidades.intimidacao.valor = 2
    const primeira = listarParadas(ficha, [personalizada]).find((p) => p.id === personalizada.id)!
    expect(primeira).toMatchObject({ atributoValor: 3, habilidadeValor: 2, total: 5, personalizada: true })
    ficha.atributos.manipulacao = 4
    expect(listarParadas(ficha, [personalizada]).find((p) => p.id === personalizada.id)?.total).toBe(6)
  })

  it('mantém as sugestões padrão e calcula Habilidade zero sem penalidade inventada', () => {
    const paradas = listarParadas(fichaNeofito(), [])
    expect(paradas.length).toBeGreaterThan(0)
    expect(paradas.every((p) => p.total === 1 && !p.personalizada)).toBe(true)
    expect(paradas.filter((p) => p.habilidade === 'intimidacao').map((p) => p.atributo))
      .toEqual(expect.arrayContaining(['carisma', 'manipulacao']))
    expect(new Set(PARADAS_PADRAO.map((p) => p.id)).size).toBe(PARADAS_PADRAO.length)
  })

  it.each([
    { ...personalizada, nome: '  ' },
    { ...personalizada, nome: 'a'.repeat(81) },
    { ...personalizada, atributo: 'vitalidade' },
    { ...personalizada, habilidade: 'fome' },
    { ...personalizada, id: 'padrao-intimidar' },
  ])('recusa uma definição inválida: %j', (entrada) => {
    expect(paradaPersonalizadaSchema.safeParse(entrada).success).toBe(false)
  })
})
