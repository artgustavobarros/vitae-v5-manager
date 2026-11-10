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
  it('oferece páginas numeradas e monta apenas os campos do efeito selecionado', () => {
    const html = renderizar()
    expect(html.match(/role="tab"/g)).toHaveLength(3)
    expect(html).toContain('Efeito 1')
    expect(html).toContain('Efeito 2')
    expect(html).toContain('Efeito 3')
    expect(html).toContain('id="efeito-1-titulo"')
    expect(html).not.toContain('id="efeito-2-titulo"')
    expect(html).not.toContain('id="efeito-3-titulo"')
  })

  it('permite criar um Relógio sem efeitos', () => {
    const html = renderizar({ ...dados, efeitos: [] })
    expect(html).toContain('Adicionar efeito')
    expect(html).not.toContain('role="tab"')
    expect(html).toContain('Salvar Relógio')
  })

  it('oferece controles acessíveis para percorrer a faixa de efeitos sem enviar o formulário', () => {
    const html = renderizar()
    expect(html).toMatch(/<button[^>]*type="button"[^>]*aria-label="Ver efeitos anteriores"/)
    expect(html).toMatch(/<button[^>]*type="button"[^>]*aria-label="Ver próximos efeitos"/)
  })
})
