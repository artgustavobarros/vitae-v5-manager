import { Children, createElement, type ComponentType, type ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createMemoryHistory, createRootRoute, createRouter, RouterProvider } from '@tanstack/react-router'
import { describe, expect, it } from 'vitest'

import { CombatePublico } from './combate-publico'
import { VisaoJogador } from '#/components/combate/visao-jogador'
import type { CombateVisivel, EstadoSaude } from '#/domain/combate'

async function renderizar(combate: CombateVisivel | null, ContainerParticipantes?: ComponentType<{ children: ReactNode; indiceAtual?: number }>) {
  const routeTree = createRootRoute({ component: () => ContainerParticipantes
    ? createElement(VisaoJogador, { combate, publico: true, ContainerParticipantes })
    : createElement(CombatePublico, { combate }) })
  const router = createRouter({ routeTree, history: createMemoryHistory({ initialEntries: ['/'] }) })
  await router.load()
  return renderToStaticMarkup(createElement(RouterProvider, { router }))
}

describe('Combate público', () => {
  it('apresenta os participantes ativos no carrossel e mantém incapacitados fora dele', async () => {
    const html = await renderizar({ id: 'combate', rodada: 3, turnoAtual: 0, ativo: true,
      participantes: [
        { id: 'ana', tipo: 'personagem', nome: 'Ana' },
        { id: 'lia', tipo: 'personagem', nome: 'Lia' },
        { id: 'guarda', tipo: 'inimigo', nome: 'Guarda caído', condicoes: ['desacordado'] },
      ],
    })
    expect(html).toContain('aria-roledescription="carrossel"')
    expect(html).toContain('2 participantes')
    expect(html).toMatch(/Participantes do Combate[\s\S]*Ana[\s\S]*Lia[\s\S]*<\/section>[\s\S]*Guarda caído/)
    expect(html).not.toMatch(/Concluir Meu Turno|Remover participante/)
  })

  it('informa à faixa o turno entre participantes ativos, sem contar incapacitados', async () => {
    const html = await renderizar({ id: 'combate', rodada: 3, turnoAtual: 2, ativo: true,
      participantes: [
        { id: 'ana', tipo: 'personagem', nome: 'Ana' },
        { id: 'guarda', tipo: 'inimigo', nome: 'Guarda caído', condicoes: ['desacordado'] },
        { id: 'lia', tipo: 'personagem', nome: 'Lia' },
      ],
    }, ({ children, indiceAtual }) => createElement('section', { 'aria-label': 'Faixa de participantes', 'data-turno': indiceAtual }, children))
    expect(html).toContain('aria-label="Faixa de participantes" data-turno="1"')
  })

  it('permite comparar outra disposição dos cards sem incluir incapacitados na faixa ativa', async () => {
    const html = await renderizar({ id: 'combate', rodada: 1, turnoAtual: 0, ativo: true,
      participantes: [
        { id: 'ana', tipo: 'personagem', nome: 'Ana' },
        { id: 'lia', tipo: 'personagem', nome: 'Lia' },
        { id: 'guarda', tipo: 'inimigo', nome: 'Guarda caído', condicoes: ['desacordado'] },
      ],
    }, ({ children }) => createElement('section', { 'aria-label': 'Faixa de participantes', 'data-total': Children.count(children) }, children))
    expect(html).toContain('aria-label="Faixa de participantes" data-total="2"')
    expect(html).toMatch(/Faixa de participantes[\s\S]*Ana[\s\S]*Lia[\s\S]*<\/section>[\s\S]*Guarda caído/)
  })

  it('mostra as três trilhas autorizadas do Personagem somente para consulta', async () => {
    const html = await renderizar({ id: 'combate', rodada: 1, turnoAtual: 0, ativo: true,
      participantes: [{ id: 'pj', tipo: 'personagem', nome: 'Ana', condicaoOculta: false,
        condicao: { vitalidadeMax: 6, vontadeMax: 5, danoVitalidade: { superficial: 1, agravado: 0 },
          danoVontade: { superficial: 0, agravado: 1 }, fome: 3 } }],
    })
    expect(html).toContain('Vitalidade')
    expect(html).toContain('Força de Vontade')
    expect(html).toContain('Fome')
    expect(html).not.toMatch(/Condição oculta|clique para|Concluir Meu Turno|Remover participante/)
  })

  it.each<EstadoSaude>([
    'saudavel', 'escoriado', 'ferido', 'debilitado', 'torpor', 'morto',
  ])('reflete %s no card sem cicatrizes nem exposição de uma trilha oculta', async (estado) => {
    const html = await renderizar({
      id: 'combate', rodada: 1, turnoAtual: 0, ativo: true,
      participantes: [{ id: 'pj', tipo: 'personagem', nome: 'Ana', condicaoOculta: true,
        estadoSaude: { estado, rotulo: estado, descricao: '', penalidade: '' } }],
    })
    expect(html).toContain(`data-ferimento="${estado}"`)
    expect(html).not.toMatch(/data-cicatriz=|marcas-ferimento/)
    expect(html).toContain('Ana')
    expect(html).toContain('Condição oculta')
    expect(html).not.toContain('Dano na Trilha:')
  })

  it('não inventa ferimentos quando o estado de saúde não foi informado', async () => {
    const html = await renderizar({
      id: 'combate', rodada: 1, turnoAtual: 0, ativo: true,
      participantes: [{ id: 'pj', tipo: 'personagem', nome: 'Ana', condicaoOculta: true }],
    })
    expect(html).not.toMatch(/data-ferimento=|data-cicatriz=/)
  })

  it('mostra Rodada, turno e condições sem qualquer controle de edição', async () => {
    const html = await renderizar({
      id: 'combate', rodada: 3, turnoAtual: 0, ativo: true,
      participantes: [{ id: 'pj', tipo: 'personagem', nome: 'Ana', ehMeu: false,
        condicaoOculta: true, condicoes: ['frenesi'], estadoSaude: { estado: 'ferido', rotulo: 'Ferido', descricao: '', penalidade: '' } }],
    })
    expect(html).toContain('Rodada 3')
    expect(html).toContain('Agindo agora')
    expect(html).toContain('Em Frenesi')
    expect(html).toContain('Condição oculta')
    // Consultar badges e compactar cartões não são ações de edição.
    expect(html).not.toMatch(/<input|Concluir|Editar|Mover para|Remover participante|Remover Condição|Adicionar ou alternar/)
  })

  it('mostra o estado de espera quando não há Combate', async () => {
    const html = await renderizar(null)
    expect(html).toContain('Nenhum Combate ativo')
  })

  it('mantém Inimigos incapacitados fora da ordem ativa e indica quem age em seguida', async () => {
    const html = await renderizar({
      id: 'combate', rodada: 1, turnoAtual: 0, ativo: true,
      participantes: [
        { id: 'pj', tipo: 'personagem', nome: 'Ana' },
        { id: 'caido', tipo: 'inimigo', nome: 'Guarda caído', condicoes: ['desacordado'] },
        { id: 'proximo', tipo: 'inimigo', nome: 'Acorrentado' },
      ],
    })
    expect(html.indexOf('Acorrentado')).toBeLessThan(html.indexOf('Guarda caído'))
    expect(html).toContain('Próximo a agir')
    expect(html).toContain('Fora de Combate')
  })

  it('oferece a mesma apresentação expandida e compacta do Combate, com trilhas de dano visuais', async () => {
    const html = await renderizar({
      id: 'combate', rodada: 3, turnoAtual: 0, ativo: true,
      participantes: [{ id: 'inimigo', tipo: 'inimigo', nome: 'Guarda', vitalidadeOculta: false,
        vitalidadeMax: 5, danoVitalidade: { superficial: 2, agravado: 1 }, condicoes: [] }],
    })
    expect(html).toContain('Minimizar Cards')
    expect(html).toContain('Minimizar card')
    expect(html).toMatch(/disabled=""[^>]*>X<\/button>/)
    expect(html.match(/disabled=""[^>]*>\/<\/button>/g)).toHaveLength(2)
    expect(html).not.toMatch(/Dano superficial:|Dano agravado:|Próximo Turno|Encerrar/)
  })

  it('não habilita marcações nem conclusão de turno mesmo com um indicador de propriedade recebido', async () => {
    const html = await renderizar({
      id: 'combate', rodada: 1, turnoAtual: 0, ativo: true,
      participantes: [{ id: 'pj', tipo: 'personagem', nome: 'Ana', personagemId: 'ficha', ehMeu: true,
        condicao: { vitalidadeMax: 4, vontadeMax: 3, danoVitalidade: { superficial: 0, agravado: 0 },
          danoVontade: { superficial: 0, agravado: 0 }, fome: 2 }, condicoes: ['frenesi'] }],
    })
    expect(html).not.toMatch(/Concluir Meu Turno|Concluir Turno|clique para|Definir Fome|Remover Em Frenesi|Adicionar ou alternar/)
  })
})
