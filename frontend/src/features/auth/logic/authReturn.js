import { isBrowser } from '../../../shared/browser/dom'

const KEY = 'delikat.authReturn'

/** @param {string} path */
export function rememberAuthReturn(path) {
  if (!isBrowser() || !path.startsWith('/')) return
  sessionStorage.setItem(KEY, path)
}

/** @param {string} [fallback] */
export function consumeAuthReturn(fallback = '/catalog') {
  if (!isBrowser()) return fallback
  const path = sessionStorage.getItem(KEY)
  sessionStorage.removeItem(KEY)
  if (typeof path === 'string' && path.startsWith('/') && !path.startsWith('//')) {
    return path
  }
  return fallback
}
