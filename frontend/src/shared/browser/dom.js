/** True in a browser or jsdom. Each global access stays on a line that calls isBrowser(). */
export function isBrowser() {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

/** @param {string} key */
export function readLocalStorage(key) {
  return isBrowser() ? localStorage.getItem(key) : null
}

/** @param {string} key @param {string} value */
export function writeLocalStorage(key, value) {
  if (isBrowser()) localStorage.setItem(key, value)
}

/** @param {string} name @param {string} value */
export function setDocumentAttribute(name, value) {
  if (isBrowser()) document.documentElement.setAttribute(name, value)
}

/** @param {string} id */
export function elementById(id) {
  return isBrowser() ? document.getElementById(id) : null
}

export function activeElement() {
  return isBrowser() ? document.activeElement : null
}

/** @param {string} selector */
export function querySelector(selector) {
  return isBrowser() ? document.querySelector(selector) : null
}

/**
 * @param {string} type
 * @param {(event: KeyboardEvent) => void} handler
 */
export function onDocument(type, handler) {
  if (isBrowser()) document.addEventListener(type, handler)
  return () => {
    if (isBrowser()) document.removeEventListener(type, handler)
  }
}

/** @param {FrameRequestCallback} callback */
export function requestFrame(callback) {
  return isBrowser() ? window.requestAnimationFrame(callback) : 0
}

/** @param {number} handle */
export function cancelFrame(handle) {
  if (isBrowser()) window.cancelAnimationFrame(handle)
}
