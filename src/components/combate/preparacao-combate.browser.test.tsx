import { createRoot, type Root } from 'react-dom/client'
import { createMemoryHistory, createRootRoute, createRouter, RouterProvider } from '@tanstack/react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { page, userEvent } from 'vitest/browser'

import { VisaoNarrador } from '#/routes/combate'
import { criarModeloAntagonistaPadrao } from '#/domain/bestiario'
import { criarInimigoDeModelo } from '#/domain/combate'
import type { EstadoCombateNarrador, PersonagemCombateOpcao } from '#/server/combate'
import { preCombateSchema } from '#/domain/pre-combate'
import '#/styles.css'

vi.mock('#/components/barra-app', () => ({ BarraApp: () => null }))
vi.mock('#/server/bestiario', () => ({ listarModelosBestiario: vi.fn() }))
vi.mock('#/server/personagens', () => ({ marcar: vi.fn() }))
vi.mock('#/server/exibicao-publica', () => ({ consultarLinkPublico: vi.fn(), gerarLinkPublico: vi.fn(), revogarLinkPublico: vi.fn() }))
vi.mock('#/server/combate', () => ({
  adicionarParticipanteCombateServer: vi.fn(), alternarCondicaoParticipanteCombateServer: vi.fn(),
  alternarRevelarVitalidadeCombateServer: vi.fn(), definirRevelarCondicaoCombateServer: vi.fn(),
  aplicarDanoInimigoCombateServer: vi.fn(), atualizarParticipanteInimigoServer: vi.fn(),
  avancarTurnoCombateServer: vi.fn(), carregarCombate: vi.fn(), encerrarCombateServer: vi.fn(),
  iniciarCombateServer: vi.fn(), listarCoteriesParaCombate: vi.fn(), listarPersonagensParaCombate: vi.fn(),
  removerParticipanteCombateServer: vi.fn(), reordenarParticipantesCombateServer: vi.fn(), voltarTurnoCombateServer: vi.fn(),
}))
vi.mock('#/server/pre-combate', () => ({ listarPreCombates: vi.fn(), salvarPreCombate: vi.fn(), excluirPreCombate: vi.fn() }))

import { adicionarParticipanteCombateServer, atualizarParticipanteInimigoServer, iniciarCombateServer } from '#/server/combate'
import { salvarPreCombate } from '#/server/pre-combate'

const modelo = { ...criarModeloAntagonistaPadrao(), id: '123e4567-e89b-42d3-a456-426614174000', nome: 'Segurança', categoria: 'Mortal' as const }
const personagens: PersonagemCombateOpcao[] = [
  { id: 'ana', nome: 'Ana', ehPdN: false, ehPdn: false, jogadorNome: 'Alice', donoNome: 'Alice', cla: 'Brujah', status: 'ativo', atribuidoA: null },
  { id: 'bia', nome: 'Bia', ehPdN: false, ehPdn: false, jogadorNome: 'Bruna', donoNome: 'Bruna', cla: 'Toreador', status: 'ativo', atribuidoA: null },
]
const preCombate = {
  id: '123e4567-e89b-42d3-a456-426614174001', nome: 'Emboscada',
  inimigos: [{ id: 'guarda-salvo', modeloId: modelo.id, nome: 'Guarda da porta' }],
}

let root: Root | undefined
let recipiente: HTMLDivElement | undefined
async function montar(combate: EstadoCombateNarrador | null = null) {
  const router = createRouter({
    routeTree: createRootRoute({ component: () => <VisaoNarrador combate={combate} modelos={[modelo]}
      personagens={personagens} preCombates={[preCombate]} coteries={[{ id: 'coterie', nome: 'Noturnos', personagemIds: ['ana', 'bia'] }]} /> }),
    history: createMemoryHistory({ initialEntries: ['/'] }),
  })
  await router.load()
  recipiente = document.createElement('div')
  document.body.append(recipiente)
  root = createRoot(recipiente)
  root.render(<RouterProvider router={router} />)
}

async function escolher(rotulo: string, opcao: string) {
  await page.getByRole('combobox', { name: rotulo, exact: true }).fill(opcao)
  await page.getByRole('option', { name: new RegExp(opcao) }).click()
  await userEvent.keyboard('{Escape}')
}

afterEach(() => {
  root?.unmount()
  recipiente?.remove()
  vi.resetAllMocks()
})

describe('Preparação do Combate sem diálogos', () => {
  it('monta uma Coterie e dois Inimigos na página sem confirmação intermediária', async () => {
    await montar()
    await expect.element(page.getByRole('button', { name: 'Iniciar Combate', exact: true })).toBeDisabled()
    await escolher('Chamar Coterie', 'Noturnos')
    await escolher('Adicionar Inimigo', 'Segurança')
    await page.getByRole('button', { name: 'Duplicar Segurança #1' }).click()
    await expect.element(page.getByRole('textbox', { name: 'Nome de Segurança #2' })).toBeVisible()
    expect(document.querySelector('[role="dialog"][aria-modal="true"]')).toBeNull()
    await page.getByRole('button', { name: 'Iniciar Combate', exact: true }).click()
    expect(iniciarCombateServer).toHaveBeenCalledWith({ data: { participantes: [
      expect.objectContaining({ tipo: 'personagem', personagemId: 'ana' }),
      expect.objectContaining({ tipo: 'personagem', personagemId: 'bia' }),
      expect.objectContaining({ tipo: 'inimigo', nome: 'Segurança #1' }),
      expect.objectContaining({ tipo: 'inimigo', nome: 'Segurança #2' }),
    ] } })
  })

  it('carrega um Pré-Combate sem perder os Personagens e sem consumir o grupo salvo', async () => {
    await montar()
    await escolher('Chamar Coterie', 'Noturnos')
    await page.getByRole('button', { name: 'Carregar Emboscada' }).click()
    await page.getByRole('button', { name: 'Iniciar Combate', exact: true }).click()
    expect(iniciarCombateServer).toHaveBeenCalledWith({ data: { participantes: [
      expect.objectContaining({ personagemId: 'ana' }), expect.objectContaining({ personagemId: 'bia' }),
      expect.objectContaining({ nome: 'Guarda da porta', id: expect.not.stringMatching('^guarda-salvo$') }),
    ] } })
    expect(preCombate.inimigos[0]).toEqual({ id: 'guarda-salvo', modeloId: modelo.id, nome: 'Guarda da porta' })
  })

  it('salva a montagem como Pré-Combate com o nome na própria página', async () => {
    vi.mocked(salvarPreCombate).mockImplementation(async ({ data }) => preCombateSchema.parse({ ...data, id: preCombate.id }))
    await montar()
    await escolher('Adicionar Inimigo', 'Segurança')
    await page.getByRole('button', { name: 'Salvar esta lista como Pré-Combate' }).click()
    await page.getByRole('textbox', { name: 'Nome do Pré-Combate', exact: true }).fill('Portaria')
    expect(document.querySelector('[role="dialog"][aria-modal="true"]')).toBeNull()
    await page.getByRole('button', { name: 'Salvar Pré-Combate', exact: true }).click()
    expect(salvarPreCombate).toHaveBeenCalledWith({ data: {
      nome: 'Portaria', inimigos: [expect.objectContaining({ modeloId: modelo.id, nome: 'Segurança #1' })],
    } })
  })

  it('adiciona participantes durante o Combate sem fechar o painel', async () => {
    await montar({ id: 'combate', ativo: true, rodada: 1, turnoAtual: 0,
      participantes: [criarInimigoDeModelo(modelo, { id: 'guarda', nome: 'Segurança #1' })] })
    await page.getByRole('button', { name: 'Participantes', exact: true }).click()
    await escolher('Modelos para adicionar', 'Segurança')
    await page.getByRole('button', { name: 'Adicionar Inimigos', exact: true }).click()
    expect(adicionarParticipanteCombateServer).toHaveBeenCalledWith({ data: { participante:
      expect.objectContaining({ tipo: 'inimigo', nome: 'Segurança #2' }),
    } })
    await expect.element(page.getByRole('combobox', { name: 'Modelos para adicionar' })).toBeVisible()
    expect(document.querySelector('[role="dialog"][aria-modal="true"]')).toBeNull()
  })

  it('edita o Inimigo na página e mantém a confirmação de encerramento', async () => {
    await montar({ id: 'combate', ativo: true, rodada: 1, turnoAtual: 0,
      participantes: [criarInimigoDeModelo(modelo, { id: 'guarda', nome: 'Segurança #1' })] })
    await page.getByRole('button', { name: /Editar este inimigo no combate/ }).click()
    await page.getByRole('textbox', { name: 'Rótulo / Nome no Combate' }).fill('Chefe da portaria')
    expect(document.querySelector('[role="dialog"][aria-modal="true"]')).toBeNull()
    await page.getByRole('button', { name: 'Salvar Alterações' }).click()
    expect(atualizarParticipanteInimigoServer).toHaveBeenCalledWith({ data: {
      participanteId: 'guarda', atualizacao: expect.objectContaining({ nome: 'Chefe da portaria' }),
    } })
    await page.getByRole('button', { name: 'Encerrar', exact: true }).click()
    await expect.element(page.getByRole('alertdialog')).toBeVisible()
  })
})
