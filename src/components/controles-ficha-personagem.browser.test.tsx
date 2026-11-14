import { createRoot, type Root } from 'react-dom/client'
import { createMemoryHistory, createRootRoute, createRouter, RouterProvider } from '@tanstack/react-router'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

const servidor = vi.hoisted(() => ({
  apagarPersonagem: vi.fn(),
  definirAtividadePersonagem: vi.fn(),
  toast: { error: vi.fn(), success: vi.fn() },
}))

vi.mock('#/server/personagens', () => servidor)
vi.mock('sonner', () => ({ toast: servidor.toast }))

import { BotaoExcluirPersonagem, ControlesFichaPersonagem, SeletorAtividadePersonagem } from './controles-ficha-personagem'
import '#/styles.css'

let root: Root | undefined
let recipiente: HTMLDivElement | undefined

async function montar(rascunho = false) {
  const onAlterado = vi.fn()
  const onExcluido = vi.fn()
  const raiz = createRootRoute({
    component: () => (
      <ControlesFichaPersonagem
        id="00000000-0000-4000-8000-000000000001"
        nome="Helena"
        ativo={!rascunho}
        rascunho={rascunho}
        onAlterado={onAlterado}
        onExcluido={onExcluido}
      />
    ),
  })
  const router = createRouter({ routeTree: raiz, history: createMemoryHistory({ initialEntries: ['/'] }) })
  await router.load()
  recipiente = document.createElement('div')
  document.body.append(recipiente)
  root = createRoot(recipiente)
  root.render(<RouterProvider router={router} />)
  return { onAlterado, onExcluido }
}

afterEach(() => {
  root?.unmount()
  recipiente?.remove()
  vi.resetAllMocks()
})

describe('Controles da Ficha para o Narrador', () => {
  it('edita, desativa e explica por que um Personagem Ativo não pode ser excluído', async () => {
    const { onAlterado } = await montar()
    const editar = page.getByRole('link', { name: 'Editar Helena' })
    await expect.element(editar).toHaveAttribute('href', '/personagens/00000000-0000-4000-8000-000000000001/editar')

    await page.getByRole('button', { name: 'Desativar Helena' }).click()
    expect(servidor.definirAtividadePersonagem).toHaveBeenCalledWith({
      data: { id: '00000000-0000-4000-8000-000000000001', ativo: false },
    })
    expect(onAlterado).toHaveBeenCalledOnce()

    document.querySelector<HTMLButtonElement>('button[aria-label="Excluir Helena"]')?.click()
    expect(document.querySelector('[role="alertdialog"]')).toBeNull()
    expect(servidor.toast.error).toHaveBeenCalledWith('Só Rascunhos podem ser excluídos. Desative o Personagem primeiro.')
    expect(servidor.apagarPersonagem).not.toHaveBeenCalled()
  })

  it('confirma antes de excluir um Rascunho', async () => {
    const { onExcluido } = await montar(true)
    await page.getByRole('button', { name: 'Excluir Helena' }).click()
    await expect.element(page.getByRole('alertdialog')).toBeVisible()
    await page.getByRole('button', { name: 'Excluir Personagem' }).click()
    expect(servidor.apagarPersonagem).toHaveBeenCalledWith({
      data: { id: '00000000-0000-4000-8000-000000000001' },
    })
    expect(onExcluido).toHaveBeenCalledOnce()
  })
})

function montarAvulso(elemento: React.ReactElement) {
  recipiente = document.createElement('div')
  document.body.append(recipiente)
  root = createRoot(recipiente)
  root.render(elemento)
}

describe('Seletor de Atividade na edição', () => {
  it('mostra Ativo e troca para Rascunho', async () => {
    const onAlterado = vi.fn()
    montarAvulso(
      <SeletorAtividadePersonagem id="00000000-0000-4000-8000-000000000001" ativo={true} onAlterado={onAlterado} />,
    )

    const seletor = page.getByRole('combobox', { name: 'Atividade do Personagem' })
    await expect.element(seletor).toHaveValue('Ativo')

    await seletor.fill('Rascunho')
    await page.getByRole('option', { name: 'Rascunho' }).click()

    expect(servidor.definirAtividadePersonagem).toHaveBeenCalledWith({
      data: { id: '00000000-0000-4000-8000-000000000001', ativo: false },
    })
    expect(servidor.toast.success).toHaveBeenCalledWith('Personagem virou Rascunho')
    expect(onAlterado).toHaveBeenCalledOnce()
  })

  it('não chama o servidor ao escolher a opção já atual', async () => {
    const onAlterado = vi.fn()
    montarAvulso(
      <SeletorAtividadePersonagem id="00000000-0000-4000-8000-000000000001" ativo={true} onAlterado={onAlterado} />,
    )

    const seletor = page.getByRole('combobox', { name: 'Atividade do Personagem' })
    await seletor.fill('Ativo')
    await page.getByRole('option', { name: 'Ativo' }).click()

    expect(servidor.definirAtividadePersonagem).not.toHaveBeenCalled()
    expect(onAlterado).not.toHaveBeenCalled()
  })
})

describe('Botão Excluir com texto', () => {
  it('mostra o texto ao lado do ícone e usa type=button', async () => {
    const onExcluido = vi.fn()
    montarAvulso(
      <BotaoExcluirPersonagem id="00000000-0000-4000-8000-000000000001" nome="Helena" rascunho onExcluido={onExcluido} comTexto />,
    )

    const botao = page.getByRole('button', { name: 'Excluir Helena' })
    await expect.element(botao).toHaveTextContent('Excluir Personagem')
    expect(document.querySelector('button[aria-label="Excluir Helena"]')).toHaveAttribute('type', 'button')
  })

  it('sem comTexto continua só com o ícone', async () => {
    const onExcluido = vi.fn()
    montarAvulso(
      <BotaoExcluirPersonagem id="00000000-0000-4000-8000-000000000001" nome="Helena" rascunho onExcluido={onExcluido} />,
    )

    const botao = page.getByRole('button', { name: 'Excluir Helena' })
    await expect.element(botao).not.toHaveTextContent('Excluir Personagem')
  })
})
