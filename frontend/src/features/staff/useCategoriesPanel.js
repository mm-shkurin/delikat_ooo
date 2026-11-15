import { useEffect, useRef, useState } from 'react'
import {
  createStaffCategory,
  deleteStaffCategory,
  listStaffCategories,
  patchStaffCategory,
  reorderStaffCategories,
} from './api/staffCategoryApi'
import {
  CATEGORY_COPY,
  categoryFailure,
  idsAfterDrop,
  movedIds,
  validateCategoryDraft,
} from './logic/staffCategoryForm'

/** @param {Array<{ id: string, title: string, sort_order: number, product_count: number }>} items */
function toView(items) {
  return items.map((row) => ({
    id: row.id,
    title: row.title,
    sortOrder: row.sort_order,
    productCount: row.product_count,
  }))
}

export function useCategoriesPanel() {
  const [rows, setRows] = useState(/** @type {ReturnType<typeof toView>} */ ([]))
  const [status, setStatus] = useState(/** @type {'loading' | 'ready' | 'error'} */ ('loading'))
  const [banner, setBanner] = useState(/** @type {string | null} */ (null))
  const [editor, setEditor] = useState(/** @type {{ mode: 'create' | 'edit', id: string, title: string } | null} */ (null))
  const [fieldErrors, setFieldErrors] = useState(/** @type {Record<string, string>} */ ({}))
  const [pendingDelete, setPendingDelete] = useState(/** @type {ReturnType<typeof toView>[number] | null} */ (null))
  const [saving, setSaving] = useState(false)
  const [dragId, setDragId] = useState('')
  const reloadGen = useRef(0)

  async function reload(keepBanner, signal) {
    const runId = ++reloadGen.current
    setStatus('loading')
    try {
      const body = await listStaffCategories(signal)
      if (signal?.aborted || runId !== reloadGen.current) return
      setRows(toView(body.items ?? []))
      setStatus('ready')
      if (!keepBanner) setBanner(null)
    } catch (error) {
      if (signal?.aborted || runId !== reloadGen.current || error?.name === 'AbortError') return
      setStatus('error')
      setBanner((current) => (keepBanner && current ? current : CATEGORY_COPY.failed))
    }
  }

  useEffect(() => {
    const ac = new AbortController()
    reload(false, ac.signal)
    return () => ac.abort()
  }, [])

  function openCreate() {
    setEditor({ mode: 'create', id: '', title: '' })
    setFieldErrors({})
  }

  function openEdit(row) {
    setEditor({ mode: 'edit', id: row.id, title: row.title })
    setFieldErrors({})
  }

  async function saveEditor() {
    if (!editor) return
    const errors = validateCategoryDraft({
      id: editor.id,
      title: editor.title,
      creating: editor.mode === 'create',
      knownIds: rows.map((row) => row.id),
    })
    if (Object.keys(errors).length) {
      setFieldErrors(errors)
      return
    }
    setSaving(true)
    try {
      const title = editor.title.trim()
      if (editor.mode === 'create') await createStaffCategory({ id: editor.id.trim(), title })
      else await patchStaffCategory(editor.id, { title })
      setEditor(null)
      setBanner(null)
      await reload(false)
    } catch (error) {
      await showFailure(error)
    } finally {
      setSaving(false)
    }
  }

  async function showFailure(error) {
    const failure = categoryFailure(error)
    setFieldErrors(failure.fields)
    if (failure.banner) setBanner(failure.banner)
    if (failure.close) {
      setEditor(null)
      setPendingDelete(null)
      await reload(true)
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return
    setSaving(true)
    try {
      await deleteStaffCategory(pendingDelete.id)
      setPendingDelete(null)
      setBanner(null)
      await reload(false)
    } catch (error) {
      await showFailure(error)
    } finally {
      setSaving(false)
    }
  }

  async function commit(ids) {
    const previous = rows
    setRows(ids.map((id, index) => {
      const row = previous.find((item) => item.id === id)
      return { ...row, sortOrder: index + 1 }
    }))
    try {
      const body = await reorderStaffCategories(ids)
      setRows(toView(body.items ?? []))
      setBanner(null)
    } catch {
      setRows(previous)
      setBanner(CATEGORY_COPY.failed)
    }
  }

  function move(index, direction) {
    const ids = movedIds(rows.map((row) => row.id), index, direction)
    if (ids) commit(ids)
  }

  function dropOn(targetId) {
    const ids = idsAfterDrop(rows.map((row) => row.id), dragId, targetId)
    setDragId('')
    if (ids) commit(ids)
  }

  return {
    rows,
    status,
    banner,
    editor,
    setEditor,
    fieldErrors,
    pendingDelete,
    setPendingDelete,
    saving,
    dragId,
    setDragId,
    openCreate,
    openEdit,
    saveEditor,
    confirmDelete,
    move,
    dropOn,
  }
}
