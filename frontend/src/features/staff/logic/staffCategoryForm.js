import { httpErrorIn } from '../../../shared/api/httpResponse'

const ID_RE = /^[a-z][a-z0-9-]{0,31}$/

export const CATEGORY_COPY = {
  badId: 'Некорректный код категории.',
  emptyTitle: 'Введите название.',
  longTitle: 'Название не длиннее 120 символов.',
  taken: 'Такая категория уже есть.',
  reserved: 'Код all занят кнопкой «Все».',
  missing: 'Категория не найдена.',
  failed: 'Не получилось. Попробуйте ещё раз.',
  emptyList: 'Категорий нет',
}

/** @param {string} title @param {number} count */
export function deleteQuestion(title, count) {
  return `Удалить категорию «${title}» и ${count} товаров?`
}

/**
 * @param {{ id: string, title: string, creating: boolean, knownIds: string[] }} draft
 * @returns {Record<string, string>}
 */
export function validateCategoryDraft(draft) {
  /** @type {Record<string, string>} */
  const errors = {}
  const title = draft.title.trim()
  if (draft.creating) {
    const id = draft.id.trim()
    if (id === 'all') errors.id = CATEGORY_COPY.reserved
    else if (!ID_RE.test(id)) errors.id = CATEGORY_COPY.badId
    else if (draft.knownIds.includes(id)) errors.id = CATEGORY_COPY.taken
  }
  if (!title) errors.title = CATEGORY_COPY.emptyTitle
  else if (title.length > 120) errors.title = CATEGORY_COPY.longTitle
  return errors
}

/**
 * @param {string[]} ids
 * @param {number} index
 * @param {'up' | 'down'} direction
 * @returns {string[] | null}
 */
export function movedIds(ids, index, direction) {
  const target = direction === 'up' ? index - 1 : index + 1
  if (target < 0 || target >= ids.length) return null
  const next = ids.slice()
  const [row] = next.splice(index, 1)
  next.splice(target, 0, row)
  return next
}

/**
 * @param {string[]} ids
 * @param {string} dragId
 * @param {string} targetId
 * @returns {string[] | null}
 */
export function idsAfterDrop(ids, dragId, targetId) {
  if (!dragId || dragId === targetId) return null
  const next = ids.filter((id) => id !== dragId)
  const at = next.indexOf(targetId)
  if (at < 0) return null
  next.splice(at, 0, dragId)
  return next
}

/** @param {number} width */
export function dragEnabled(width) {
  return width > 420
}

/** @param {unknown} error */
export function categoryFailure(error) {
  const http = httpErrorIn(error)
  const message = http?.message ?? ''
  if (http?.status === 404 || http?.errorCode === 'category_not_found') {
    return { banner: CATEGORY_COPY.missing, close: true, fields: {} }
  }
  if (message === CATEGORY_COPY.badId || message === CATEGORY_COPY.taken || message === CATEGORY_COPY.reserved) {
    return { banner: null, close: false, fields: { id: message } }
  }
  if (message === CATEGORY_COPY.emptyTitle || message === CATEGORY_COPY.longTitle) {
    return { banner: null, close: false, fields: { title: message } }
  }
  return { banner: CATEGORY_COPY.failed, close: false, fields: {} }
}
