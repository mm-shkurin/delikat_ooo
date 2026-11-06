import { useEffect, useRef } from 'react'

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Focus trap while a dialog layer is open; restore previous focus on close.
 * @param {string | null} layer
 */
export function useDialogFocus(layer) {
  const previousFocus = useRef(/** @type {Element | null} */ (null))

  useEffect(() => {
    if (!layer) {
      const prior = previousFocus.current
      if (prior instanceof HTMLElement) prior.focus()
      previousFocus.current = null
      return
    }

    previousFocus.current = document.activeElement

    const frame = window.requestAnimationFrame(() => {
      const dialog = document.querySelector('[role="dialog"]')
      if (!(dialog instanceof HTMLElement)) return
      const target = dialog.querySelector(FOCUSABLE)
      if (target instanceof HTMLElement) target.focus()
    })

    const onKeyDown = (event) => {
      if (event.key !== 'Tab') return
      const dialog = document.querySelector('[role="dialog"]')
      if (!(dialog instanceof HTMLElement)) return
      const focusables = [...dialog.querySelectorAll(FOCUSABLE)].filter(
        (node) => node instanceof HTMLElement,
      )
      if (focusables.length === 0) {
        event.preventDefault()
        return
      }
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement
      if (event.shiftKey) {
        if (active === first || !dialog.contains(active)) {
          event.preventDefault()
          last.focus()
        }
      } else if (active === last || !dialog.contains(active)) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      window.cancelAnimationFrame(frame)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [layer])
}
