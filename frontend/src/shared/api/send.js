import { isSessionExpired } from '../session/authorizedRequest'
import { authorizedRequest } from '../session/authorizedRequest'
import { request } from './httpClient'
import { failureText } from './failureText'

export async function send(path, options = {}) {
  try {
    const run = options.bearer ? authorizedRequest : request
    return await run(path, options)
  } catch (error) {
    if (isSessionExpired(error)) throw error
    throw new Error(failureText(error), { cause: error })
  }
}
