/**
 * Allow only same-origin root paths or https URLs for <img src>.
 * @param {unknown} url
 * @returns {string | null}
 */
export function safeImageUrl(url) {
  if (typeof url !== 'string') return null
  const value = url.trim()
  if (!value) return null
  if (value.startsWith('/') && !value.startsWith('//')) return value
  try {
    const parsed = new URL(value)
    if (parsed.protocol === 'https:') return value
  } catch {
    return null
  }
  return null
}
