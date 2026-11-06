import { useEffect, useRef } from 'react'
import { activeElement, cancelFrame, onDocument, querySelector, requestFrame } from '../../shared/browser/dom'

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function openDialog() {
  const dialog = querySelector('[role="dialog"]')
  return dialog instanceof HTMLElement ? dialog : null
}

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
      return undefined
    }

    previousFocus.current = activeElement()

    const frame = requestFrame(() => {
      const dialog = openDialog()
      if (!dialog) return
      const target = dialog.querySelector(FOCUSABLE)
      if (target instanceof HTMLElement) target.focus()
    })

    const stopKeys = onDocument('keydown', (event) => {
      if (event.key !== 'Tab') return
      const dialog = openDialog()
      if (!dialog) return
      const focusables = [...dialog.querySelectorAll(FOCUSABLE)].filter((node) => node instanceof HTMLElement)
      if (focusables.length === 0) {
        event.preventDefault()
        return
      }
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = activeElement()
      if (event.shiftKey) {
        if (active === first || !dialog.contains(active)) {
          event.preventDefault()
          last.focus()
        }
      } else if (active === last || !dialog.contains(active)) {
        event.preventDefault()
        first.focus()
      }
    })

    return () => {
      cancelFrame(frame)
      stopKeys()
    }
  }, [layer])
}
