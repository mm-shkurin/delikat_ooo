/** True when fetch was aborted, including errors wrapped by `send` (`cause`). */
export function isAbortError(error) {
  let step = error
  for (let depth = 0; step && depth < 5; depth += 1) {
    if (step.name === 'AbortError') return true
    step = step.cause
  }
  return false
}
