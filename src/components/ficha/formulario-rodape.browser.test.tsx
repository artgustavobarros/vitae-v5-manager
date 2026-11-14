import { createRoot, type Root } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { page } from 'vitest/browser'

import { Button } from '#/components/ui/button'
import { fichaNeofito } from '#/domain/ficha'
import { FormularioFicha } from './formulario'
import '#/styles.css'

let root: Root | undefined
let recipiente: HTMLDivElement | undefined

afterEach(() => {
  root?.unmount()
  recipiente?.remove()
})

describe('Rodapé do Formulário da Ficha', () => {
  it('mostra Salvar e as ações passadas em lados opostos', async () => {
    const onSalvar = vi.fn()
    recipiente = document.createElement('div')
    document.body.append(recipiente)
    root = createRoot(recipiente)
    root.render(
      <FormularioFicha
        inicial={{ nome: 'Helena', ficha: fichaNeofito() }}
        salvando={false}
        onSalvar={onSalvar}
        acoes={<Button type="button">Excluir Personagem</Button>}
      />,
    )

    const salvar = page.getByRole('button', { name: 'Salvar' })
    const excluir = page.getByRole('button', { name: 'Excluir Personagem' })
    await expect.element(salvar).toBeVisible()
    await expect.element(excluir).toBeVisible()

    const rodape = salvar.element().parentElement
    expect(rodape?.contains(excluir.element())).toBe(true)
    expect(getComputedStyle(rodape!).justifyContent).toBe('space-between')

    await salvar.click()
    expect(onSalvar).toHaveBeenCalledOnce()
  })

  it('sem ações, só mostra Salvar', async () => {
    recipiente = document.createElement('div')
    document.body.append(recipiente)
    root = createRoot(recipiente)
    root.render(<FormularioFicha inicial={{ nome: 'Helena', ficha: fichaNeofito() }} salvando={false} onSalvar={vi.fn()} />)

    await expect.element(page.getByRole('button', { name: 'Salvar' })).toBeVisible()
  })

  it('mostra avisos quando faltam Clã ou Geração e empurra o foco para o campo necessário', async () => {
    recipiente = document.createElement('div')
    document.body.append(recipiente)
    root = createRoot(recipiente)
    root.render(
      <FormularioFicha
        inicial={{ nome: '', ficha: fichaNeofito() }}
        salvando={false}
        podeAlterarCla
        onSalvar={vi.fn()}
      />,
    )

    await expect.element(page.getByText('Escolha o Clã antes de definir as Disciplinas.')).toBeVisible()
    await expect.element(page.getByText('Escolha a Geração antes de definir a Potência do Sangue.')).toBeVisible()

    const botoesCla = page.getByRole('button', { name: 'Escolher Clã' })
    await botoesCla.first().click()
    expect(document.activeElement?.id).toBe('cla')

    const botaoGeracao = page.getByRole('button', { name: 'Escolher Geração' })
    await botaoGeracao.click()
    expect(document.activeElement?.id).toBe('geracao')
  })

  it('libera Disciplinas e Potência do Sangue quando Clã e Geração estão preenchidos', async () => {
    recipiente = document.createElement('div')
    document.body.append(recipiente)
    root = createRoot(recipiente)
    root.render(
      <FormularioFicha
        inicial={{ nome: 'Helena', ficha: { ...fichaNeofito(), cla: 'brujah', geracao: 12 } }}
        salvando={false}
        podeAlterarCla
        onSalvar={vi.fn()}
      />,
    )

    await expect.element(page.getByRole('button', { name: 'Adicionar Disciplina' })).toBeVisible()
    await expect.element(page.getByRole('group', { name: /Potência do Sangue/ })).toBeVisible()
  })
})

