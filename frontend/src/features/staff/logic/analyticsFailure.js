import { ordersFailureText } from './ordersFailure'

/** Analytics only needs the shared session/ACL messages from ordersFailure. */
export function analyticsFailureText(error) {
  return ordersFailureText(error)
}
