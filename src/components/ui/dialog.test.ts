import { describe, expect, it, vi } from 'vitest'
import type { ReactElement } from 'react'
import { DialogContent } from './dialog'

interface ContentProps {
  onPointerDownOutside: (e: { preventDefault: () => void }) => void
  onInteractOutside: (e: { preventDefault: () => void }) => void
}

describe('DialogContent', () => {
  it('impede fechamento no click fora por padrão (onPointerDownOutside e onInteractOutside)', () => {
    let pointerPrevented = false
    const mockPointerEvent = {
      preventDefault: () => {
        pointerPrevented = true
      },
    }

    let interactPrevented = false
    const mockInteractEvent = {
      preventDefault: () => {
        interactPrevented = true
      },
    }

    const customPointerDownOutside = vi.fn()
    const customInteractOutside = vi.fn()

    const vdom = DialogContent({
      onPointerDownOutside: customPointerDownOutside,
      onInteractOutside: customInteractOutside,
      children: null,
    })

    // vdom é DialogPortal -> children tem [DialogOverlay, DialogPrimitive.Content]
    const content = (vdom.props as { children: ReactElement<ContentProps>[] }).children[1]

    content.props.onPointerDownOutside(mockPointerEvent)
    expect(customPointerDownOutside).toHaveBeenCalledWith(mockPointerEvent)
    expect(pointerPrevented).toBe(true)

    content.props.onInteractOutside(mockInteractEvent)
    expect(customInteractOutside).toHaveBeenCalledWith(mockInteractEvent)
    expect(interactPrevented).toBe(true)
  })

  it('permite fechar no click fora se closeOnOutsideClick for true', () => {
    let pointerPrevented = false
    const mockPointerEvent = {
      preventDefault: () => {
        pointerPrevented = true
      },
    }

    const vdom = DialogContent({
      closeOnOutsideClick: true,
      children: null,
    })

    const content = (vdom.props as { children: ReactElement<ContentProps>[] }).children[1]

    content.props.onPointerDownOutside(mockPointerEvent)
    expect(pointerPrevented).toBe(false)
  })

  it.each(['onPointerDownOutside', 'onInteractOutside'] as const)(
    'preserva a decisão de %s quando o fechamento externo está liberado',
    (nome) => {
      let impedido = false
      const evento = { preventDefault: () => { impedido = true } }
      const vdom = DialogContent({
        closeOnOutsideClick: true,
        [nome]: (recebido: Pick<Event, 'preventDefault'>) => recebido.preventDefault(),
        children: null,
      })
      const content = (vdom.props as { children: ReactElement<ContentProps>[] }).children[1]

      content.props[nome](evento)

      expect(impedido).toBe(true)
    },
  )
})
