import { createElement, type HTMLAttributes } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import type { Relogio } from '#/domain/relogios'
import { FormularioRelogio } from './formulario-relogio'

// O portal do Dialog não monta no servidor; o restante do formulário é real.
vi.mock('#/components/ui/dialog', async (importOriginal) => ({
  ...await importOriginal<typeof import('#/components/ui/dialog')>(),
  DialogContent: ({ children, className }: HTMLAttributes<HTMLDivElement>) => createElement('div', { className }, children),
}))

const dados: Relogio = {
  id: '00000000-0000-4000-8000-000000000001',
  nome: 'Insônia', tipo: 'Ameaça', descricao: '', total: 6, atual: 0, perigo: 'aumenta', visivel: true,
  efeitos: [1, 2, 3].map((numero) => ({
    id: `efeito-${numero}`, titulo: `Condição ${numero}`, condicao: 'a_partir_de', etapa: numero,
    textoAtivacao: `Ativação ${numero}`, textoDesativacao: `Desativação ${numero}`,
  })),
}

function renderizar(relogio = dados) {
  return renderToStaticMarkup(createElement(FormularioRelogio, {
    dados: relogio, novo: true, ocupado: false, onChange: () => {}, onSalvar: async () => {}, onFechar: () => {},
  }))
}

describe('Formulário do Relógio', () => {
  it('oferece título, título público opcional, etapas e visibilidade sem configurações extras', () => {
    const html = renderizar()
    expect(html).toContain('Título público (opcional)')
    expect(html).toContain('Total de etapas')
    expect(html).toContain('Etapa inicial')
    expect(html).toContain('Visível para o público')
    expect(html).not.toMatch(/Tipo de evento|Descrição|perigo|Adicionar efeito|role="tab"/)
  })

  it('permite criar um Relógio sem efeitos', () => {
    const html = renderizar({ ...dados, efeitos: [] })
    expect(html).toContain('Título')
    expect(html).not.toContain('role="tab"')
    expect(html).toContain('Salvar Relógio')
  })

  it('permite editar o título público existente', () => {
    const html = renderizar({ ...dados, tituloPublico: 'A noite avança' })
    expect(html).toContain('value="A noite avança"')
  })
})
