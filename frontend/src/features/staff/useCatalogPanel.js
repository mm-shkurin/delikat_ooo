import { useEffect, useRef, useState } from 'react'
import { listCategories } from '../catalog/api/catalogApi'
import {
  createStaffCatalogProduct,
  listStaffCatalogProducts,
  patchStaffCatalogProduct,
  putStaffCatalogProductImage,
} from './api/staffCatalogApi'
import {
  buildCreateFormData,
  buildPatchBody,
  draftFromProduct,
  emptyEditorDraft,
  validateEditorDraft,
} from './logic/staffCatalogForm'
import { nextBadgeToggle, staffProductListToView } from './logic/staffCatalogView'

/**
 * Live staff Catalog tab: list / create / patch / image / hide / badge.
 */
export function useCatalogPanel() {
  const [status, setStatus] = useState(/** @type {'loading' | 'ready' | 'error'} */ ('loading'))
  const [errorText, setErrorText] = useState(/** @type {string | null} */ (null))
  const [actionError, setActionError] = useState(/** @type {string | null} */ (null))
  const [products, setProducts] = useState(/** @type {ReturnType<typeof staffProductListToView>} */ ([]))
  const [categories, setCategories] = useState(/** @type {Array<{ id: string, title: string }>} */ ([]))
  const [q, setQ] = useState('')
  const [visibility, setVisibility] = useState(/** @type {'all' | 'live' | 'hidden'} */ ('all'))
  const [editorOpen, setEditorOpen] = useState(false)
  const [editorMode, setEditorMode] = useState(/** @type {'create' | 'edit'} */ ('create'))
  const [draft, setDraft] = useState(emptyEditorDraft)
  const [editing, setEditing] = useState(/** @type {ReturnType<typeof staffProductListToView>[number] | null} */ (null))
  const [imageFile, setImageFile] = useState(/** @type {File | null} */ (null))
  const [fieldErrors, setFieldErrors] = useState(/** @type {Record<string, string>} */ ({}))
  const [saving, setSaving] = useState(false)
  const loadGen = useRef(0)
  const qRef = useRef(q)
  qRef.current = q

  async function reload(signal) {
    const runId = ++loadGen.current
    setStatus('loading')
    setErrorText(null)
    try {
      const [catBody, listBody] = await Promise.all([
        listCategories(signal),
        listStaffCatalogProducts({ q: qRef.current.trim() || undefined, visibility }, signal),
      ])
      if (runId !== loadGen.current) return
      const titles = Object.fromEntries((catBody.items ?? []).map((c) => [c.id, c.title]))
      setCategories((catBody.items ?? []).map((c) => ({ id: c.id, title: c.title })))
      setProducts(staffProductListToView(listBody, titles))
      setStatus('ready')
    } catch (error) {
      if (signal?.aborted || runId !== loadGen.current) return
      setStatus('error')
      setErrorText(error instanceof Error ? error.message : 'Не удалось загрузить каталог')
    }
  }

  useEffect(() => {
    const ac = new AbortController()
    const timer = setTimeout(() => reload(ac.signal), q ? 250 : 0)
    return () => {
      clearTimeout(timer)
      ac.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload on q/visibility
  }, [q, visibility])

  function openCreate() {
    setEditorMode('create')
    setEditing(null)
    setDraft(emptyEditorDraft())
    setImageFile(null)
    setFieldErrors({})
    setActionError(null)
    setEditorOpen(true)
  }

  function openEdit(product) {
    setEditorMode('edit')
    setEditing(product)
    setDraft(draftFromProduct(product))
    setImageFile(null)
    setFieldErrors({})
    setActionError(null)
    setEditorOpen(true)
  }

  function closeEditor() {
    if (saving) return
    setEditorOpen(false)
  }

  async function saveEditor() {
    const checked = validateEditorDraft(draft, {
      mode: editorMode,
      hasImage: Boolean(imageFile),
      keepImage: editorMode === 'edit' && Boolean(editing?.imageUrl),
    })
    setFieldErrors(checked.fieldErrors)
    if (!checked.ok || !checked.values) return false
    setSaving(true)
    setActionError(null)
    try {
      if (editorMode === 'create') {
        await createStaffCatalogProduct(buildCreateFormData(checked.values, /** @type {File} */ (imageFile)))
      } else if (editing) {
        await patchStaffCatalogProduct(editing.id, buildPatchBody(checked.values))
        if (imageFile) await putStaffCatalogProductImage(editing.id, imageFile)
      }
      setEditorOpen(false)
      await reload()
      return true
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Не удалось сохранить')
      return false
    } finally {
      setSaving(false)
    }
  }

  async function setHidden(productId, hidden) {
    setActionError(null)
    try {
      await patchStaffCatalogProduct(productId, { hidden })
      await reload()
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Не удалось изменить показ')
    }
  }

  async function setBadge(product, badge) {
    setActionError(null)
    const next = nextBadgeToggle(product.badge, badge)
    try {
      await patchStaffCatalogProduct(product.id, { badge: next })
      await reload()
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Не удалось сменить плашку')
    }
  }

  return {
    status,
    errorText,
    actionError,
    products,
    categories,
    q,
    setQ,
    visibility,
    setVisibility,
    editorOpen,
    editorMode,
    draft,
    setDraft,
    editing,
    imageFile,
    setImageFile,
    fieldErrors,
    saving,
    openCreate,
    openEdit,
    closeEditor,
    saveEditor,
    setHidden,
    setBadge,
  }
}
