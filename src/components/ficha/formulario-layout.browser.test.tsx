import { createRoot, type Root } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'

import { fichaNeofito } from '#/domain/ficha'
import { CamposAtributos, CamposHabilidades, useEdicaoFicha } from './formulario'
import '#/styles.css'

let root: Root | undefined
let recipiente: HTMLDivElement | undefined

function CamposParaTeste() {
  const edicao = useEdicaoFicha({ nome: 'Helena', ficha: fichaNeofito() })

  return (
    <>
      <section>
        <h2>Atributos</h2>
        <CamposAtributos edicao={edicao} />
      </section>
      <section>
        <h2>Habilidades</h2>
        <CamposHabilidades edicao={edicao} />
      </section>
    </>
  )
}

function gradeDaSecao(titulo: string): HTMLElement {
  const secao = [...document.querySelectorAll('section')].find(
    (item) => item.querySelector('h2')?.textContent === titulo,
  )
  const primeiroGrupo = secao?.querySelector('h3')?.parentElement
  const grade = primeiroGrupo?.parentElement

  if (!grade) throw new Error(`Grade de ${titulo} não encontrada`)
  return grade
}

afterEach(() => {
  root?.unmount()
  recipiente?.remove()
})

describe('Layout dos campos da Ficha', () => {
  it('mostra os grupos em uma coluna no celular e três no desktop', async () => {
    recipiente = document.createElement('div')
    document.body.append(recipiente)
    root = createRoot(recipiente)
    root.render(<CamposParaTeste />)

    await expect.element(page.getByRole('heading', { name: 'Atributos' })).toBeVisible()

    const colunasEsperadas = window.innerWidth >= 768 ? 3 : 1
    for (const titulo of ['Atributos', 'Habilidades']) {
      const grade = gradeDaSecao(titulo)
      const estilo = getComputedStyle(grade)
      expect(estilo.display, `${titulo} deve usar grid`).toBe('grid')
      expect(estilo.gridTemplateColumns.split(' '), `${titulo} deve ter ${colunasEsperadas} coluna(s)`).toHaveLength(
        colunasEsperadas,
      )
    }
  })
})
