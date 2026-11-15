import { describe, expect, it } from 'vitest'
import {
  CATEGORY_COPY,
  deleteQuestion,
  dragEnabled,
  idsAfterDrop,
  movedIds,
  validateCategoryDraft,
} from './staffCategoryForm'

describe('staffCategoryForm', () => {
  it('rejects a bad id, all, a taken id, and a long title before the request', () => {
    expect(validateCategoryDraft({ id: 'Beef', title: 'Говядина', creating: true, knownIds: [] }).id).toBe(
      CATEGORY_COPY.badId,
    )
    expect(validateCategoryDraft({ id: 'all', title: 'Все', creating: true, knownIds: [] }).id).toBe(
      CATEGORY_COPY.reserved,
    )
    expect(validateCategoryDraft({ id: 'beef', title: 'Ещё', creating: true, knownIds: ['beef'] }).id).toBe(
      CATEGORY_COPY.taken,
    )
    expect(validateCategoryDraft({ id: 'lamb', title: 'я'.repeat(121), creating: true, knownIds: [] }).title).toBe(
      CATEGORY_COPY.longTitle,
    )
    expect(validateCategoryDraft({ id: 'lamb', title: '  ', creating: true, knownIds: [] }).title).toBe(
      CATEGORY_COPY.emptyTitle,
    )
  })

  it('keeps the id fixed while renaming', () => {
    const errors = validateCategoryDraft({ id: 'beef', title: 'Новое', creating: false, knownIds: ['beef'] })
    expect(errors).toEqual({})
  })

  it('does not move the first row up or the last row down', () => {
    expect(movedIds(['a', 'b'], 0, 'up')).toBeNull()
    expect(movedIds(['a', 'b'], 1, 'down')).toBeNull()
    expect(movedIds(['a', 'b', 'c'], 1, 'up')).toEqual(['b', 'a', 'c'])
  })

  it('asks to delete with the same count and enables drag only above 420', () => {
    expect(deleteQuestion('Соусы', 2)).toBe('Удалить категорию «Соусы» и 2 товаров?')
    expect(dragEnabled(420)).toBe(false)
    expect(dragEnabled(421)).toBe(true)
    expect(idsAfterDrop(['a', 'b', 'c'], 'c', 'a')).toEqual(['c', 'a', 'b'])
  })
})
