import { useState } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, describe, expect, it } from 'vitest'
import { page } from 'vitest/browser'

import { CardRelogio } from './card-relogio'
import { FormularioRelogio } from './formulario-relogio'
import { filtrarRelogiosPublicos } from '#/domain/exibicao-publica'
import type { ConfiguracaoRelogio, RelogioSalvo } from '#/domain/relogios'
import '#/styles.css'

const relogio: RelogioSalvo = {
  id: '00000000-0000-4000-8000-000000000001', nome: 'Cerco da Segunda Inquisição',
  tituloPublico: 'Movimento nas ruas', tipo: 'Ameaça', descricao: 'Segredo do Narrador',
  total: 6, atual: 0, perigo: 'aumenta', visivel: true, revisao: 1, ultimaTendencia: null,
  efeitos: [{ id: '00000000-0000-4000-8000-000000000002', titulo: 'Alerta', etapa: 4,
    condicao: 'a_partir_de', textoAtivacao: 'Alarme!', textoDesativacao: 'Silêncio.' }],
}

let root: Root | undefined
let recipiente: HTMLDivElement | undefined

function montar(elemento: React.ReactNode) {
  recipiente = document.createElement('div')
  recipiente.className = 'mx-auto w-full max-w-sm p-4'
  document.body.append(recipiente)
  root = createRoot(recipiente)
  root.render(elemento)
}

afterEach(() => { root?.unmount(); recipiente?.remove() })

function RelogioInterativo() {
  const [dados, setDados] = useState(relogio)
  return <CardRelogio relogio={dados} narrador
    onMover={(delta) => setDados({ ...dados, atual: dados.atual + delta })} />
}

function FormularioInterativo() {
  const [dados, setDados] = useState<ConfiguracaoRelogio>(relogio)
  const [salvo, setSalvo] = useState<ConfiguracaoRelogio | null>(null)
  return salvo ? <CardRelogio relogio={{ ...relogio, ...salvo, revisao: 2 }} narrador={false} />
    : <FormularioRelogio dados={dados} onChange={setDados} novo ocupado={false}
        onSalvar={async (valor) => { setSalvo(valor) }} onFechar={() => {}} />
}

describe('Relógios simplificados', () => {
  it('aumenta e diminui uma etapa e respeita zero e o total', async () => {
    montar(<RelogioInterativo />)
    const aumentar = page.getByRole('button', { name: 'Aumentar Cerco da Segunda Inquisição' })
    const diminuir = page.getByRole('button', { name: 'Diminuir Cerco da Segunda Inquisição' })
    const etapas = page.getByRole('meter')
    await expect.element(diminuir).toBeDisabled()
    await aumentar.click()
    await expect.element(etapas).toHaveAttribute('value', '1')
    await diminuir.click()
    await expect.element(etapas).toHaveAttribute('value', '0')
    for (let i = 0; i < 6; i++) await aumentar.click()
    await expect.element(aumentar).toBeDisabled()
    await expect.element(etapas).toHaveAttribute('value', '6')
  })

  it('exibe o título público e o relógio sem botões nem dados internos', async () => {
    montar(<CardRelogio relogio={filtrarRelogiosPublicos([relogio])[0]} narrador={false} />)
    await expect.element(page.getByRole('heading', { name: 'Movimento nas ruas' })).toBeVisible()
    expect(recipiente?.querySelector('button')).toBeNull()
    expect(recipiente?.textContent).not.toMatch(/Inquisição|Segredo|Efeitos|perigo/)
    expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(window.innerWidth)
  })

  it('salva título público e novas etapas mesmo com efeitos antigos fora do novo limite', async () => {
    montar(<FormularioInterativo />)
    await page.getByRole('textbox', { name: 'Título público (opcional)', exact: true }).fill('Sirenes distantes')
    await page.getByRole('spinbutton', { name: 'Total de etapas' }).fill('3')
    await page.getByRole('button', { name: 'Salvar Relógio' }).click()
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument()
    await expect.element(page.getByRole('heading', { name: 'Sirenes distantes' })).toBeVisible()
    await expect.element(page.getByRole('meter')).toHaveAttribute('max', '3')
  })
})
