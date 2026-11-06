import { useEffect, useRef } from 'react'

const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Focus first control when a dialog layer opens; restore previous focus on close.
 * Escape close is handled elsewhere — this is a minimal trap entry/exit.
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
      const target = dialog?.querySelector(FOCUSABLE)
      if (target instanceof HTMLElement) target.focus()
    })
    return () => window.cancelAnimationFrame(frame)
  }, [layer])
}
