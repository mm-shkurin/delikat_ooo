import { describe, expect, it } from 'vitest'
import {
  buildCreateFormData,
  buildPatchBody,
  draftFromProduct,
  emptyEditorDraft,
  validateEditorDraft,
} from './staffCatalogForm'

const baseOk = {
  ...emptyEditorDraft(),
  id: 'rib',
  name: 'Рибай',
  categoryId: 'beef',
  weightLabel: '~350 г',
  price: '1450',
  popularity: '90',
}

describe('staffCatalogForm', () => {
  it('requires image on create and valid slug', () => {
    const bad = validateEditorDraft({ ...baseOk, id: 'Rib' }, { mode: 'create', hasImage: false, keepImage: false })
    expect(bad.ok).toBe(false)
    expect(bad.fieldErrors.id).toBeTruthy()
    expect(bad.fieldErrors.image).toBeTruthy()

    const ok = validateEditorDraft(baseOk, { mode: 'create', hasImage: true, keepImage: false })
    expect(ok.ok).toBe(true)
    expect(ok.values?.priceRub).toBe(1450)
  })

  it('requires compare_at > price for SALE', () => {
    const draft = { ...baseOk, badge: 'SALE', compareAt: '1000' }
    const result = validateEditorDraft(draft, { mode: 'edit', hasImage: false, keepImage: true })
    expect(result.ok).toBe(false)
    expect(result.fieldErrors.compareAt).toBeTruthy()
  })

  it('builds multipart create and patch with null clears', () => {
    const values = validateEditorDraft(
      { ...baseOk, badge: 'NEW', marbleGrade: '', description: '' },
      { mode: 'create', hasImage: true, keepImage: false },
    ).values
    const file = new File(['x'], 'a.jpg', { type: 'image/jpeg' })
    const form = buildCreateFormData(/** @type {NonNullable<typeof values>} */ (values), file)
    expect(form.get('id')).toBe('rib')
    expect(form.get('badge')).toBe('NEW')
    expect(form.get('image')).toBeTruthy()

    const original = draftFromProduct({
      id: 'rib',
      name: 'Рибай',
      categoryId: 'beef',
      categoryTitle: 'Говядина',
      weightLabel: '~350 г',
      price: 1450,
      was: null,
      discountPercent: null,
      popularity: 90,
      properties: [],
      badge: 'NEW',
      marbleGrade: 'x',
      imageUrl: '/api/v1/media/products/rib',
      description: 'old',
      hidden: false,
      createdAt: '2026-01-01T00:00:00Z',
    })
    const cleared = validateEditorDraft(
      { ...original, badge: '', marbleGrade: '', description: '' },
      { mode: 'edit', hasImage: false, keepImage: true },
    ).values
    const patch = buildPatchBody(/** @type {NonNullable<typeof cleared>} */ (cleared), {
      id: 'rib',
      name: 'Рибай',
      categoryId: 'beef',
      categoryTitle: 'Говядина',
      weightLabel: '~350 г',
      price: 1450,
      was: null,
      discountPercent: null,
      popularity: 90,
      properties: [],
      badge: 'NEW',
      marbleGrade: 'x',
      imageUrl: '/x',
      description: 'old',
      hidden: false,
      createdAt: '2026-01-01T00:00:00Z',
    })
    expect(patch.badge).toBeNull()
    expect(patch.marble_grade_label).toBeNull()
    expect(patch.description).toBeNull()
  })
})
