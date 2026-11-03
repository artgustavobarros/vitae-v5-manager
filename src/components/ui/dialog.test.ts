import { describe, expect, it, vi } from 'vitest'
import type { PointerDownOutsideEvent } from 'radix-ui'
import { DialogContent } from './dialog'

describe('DialogContent', () => {
  it('impede fechamento no click fora por padrão (onPointerDownOutside e onInteractOutside)', () => {
    let pointerPrevented = false
    const mockPointerEvent = {
      preventDefault: () => {
        pointerPrevented = true
      },
    } as unknown as PointerDownOutsideEvent

    let interactPrevented = false
    const mockInteractEvent = {
      preventDefault: () => {
        interactPrevented = true
      },
    } as unknown as CustomEvent

    const customPointerDownOutside = vi.fn()
    const customInteractOutside = vi.fn()

    const vdom = DialogContent({
      onPointerDownOutside: customPointerDownOutside,
      onInteractOutside: customInteractOutside,
      children: null,
    })

    // vdom é DialogPortal -> children tem [DialogOverlay, DialogPrimitive.Content]
    const content = (vdom.props as { children: React.ReactElement[] }).children[1]

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
    } as unknown as PointerDownOutsideEvent

    const vdom = DialogContent({
      closeOnOutsideClick: true,
      children: null,
    })

    const content = (vdom.props as { children: React.ReactElement[] }).children[1]

    content.props.onPointerDownOutside(mockPointerEvent)
    expect(pointerPrevented).toBe(false)
  })
})
