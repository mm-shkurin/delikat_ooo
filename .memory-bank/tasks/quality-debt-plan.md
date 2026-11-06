# Plan — quality debt (before admin panel)

**Goal:** close sprint-check / architecture debt so consistency + smells stop scoring 0, then start admin catalog as a **new** story.

**Out of scope here:** payment, order history, PDF/email, admin CRUD (Wave 3).

**Sources:** `_project_audit/sprint-check-2026-11-06-full.md`, story 08/10 carryover.

**Done when:** `/sprint-check --stage b` (consistency + smells only; git-docs/testing still skipped) shows no *actionable* regression FAIL on items we own; Stage A layers still ≥ 2.5; Docker smoke green.

---

## Phase A — quick wins (½–1 day)

| # | Task | Layer | Done when |
|---|------|-------|-----------|
| A1 | Fix probe FP: `forbidden_imports` regex must not match `Depends(require_shop_session)` | `probes/config.json` | `ARCH-BOUNDARY-3@back` PASS |
| A2 | Document deliberate **no** global state lib (or add zustand/RQ and use it) | `frontend/README` + config | `ARCH-STATE-LIB` PASS or WAIVED with reason |
| A3 | Guarded `window`/`document`/`localStorage` helper; chrome/focus use it | front | `ARCH-ENV-ACCESS` cleaner |
| A4 | Split `cart_store.py` ≤200 lines; extract order persist helpers | back | `ARCH-SIZE@back` PASS |
| A5 | Shrink `useStoreChrome.js` / `StoreOverlays.jsx` ≤200 (split sheets) | front | `ARCH-SIZE@front` PASS |

## Phase B — backend correctness (1–2 days)

| # | Task | Done when |
|---|------|-----------|
| B1 | Push catalog filter/sort/limit/offset into SQL via port | no full-table load in `CatalogService.list_products` |
| B2 | Lock cart RMW (`FOR UPDATE` / version) on add/patch/delete like `save_order` | concurrent updates don’t drop lines |
| B3 | Wire DTOs out of usecase (`serialize_cart`, `ProfileService.view` → HTTP adapters) | usecase returns domain/view models, not JSON dicts |
| B4 | Optional: alembic without `sys.path.insert` (packaging) | `ARCH-PATH-HACK` PASS or documented waiver |

## Phase C — frontend hygiene (1–2 days)

| # | Task | Done when |
|---|------|-----------|
| C1 | Design tokens: hex literals only in `tokens.css`; pages use vars | `ARCH-DESIGN-TOKENS` improved |
| C2 | Scoped styles strategy (entry imports globals; page CSS justified/documented) | fewer `ARCH-SCOPED-STYLES` hits |
| C3 | `AbortSignal` on chrome cart/auth/checkout fetches; cancel on unmount | no orphaned setState after leave |
| C4 | One error path: always `failureText` (AuthSheet / cart / checkout) | no raw `error.message` mix |
| C5 | Memo `ProductGrid` rows + stable callbacks; localize filter input re-renders | judgment render-scope OK |
| C6 | Split CSS files >200 (`catalog.css` / `landing.css`) by section | `ARCH-SIZE-STYLE` improved |

## Phase D — security (cross-layer, 1–2 days)

| # | Task | Done when |
|---|------|-----------|
| D1 | Move access/refresh off `localStorage` → **httpOnly cookies** (or BFF pattern) | `SEC-WEB-STORAGE` real PASS; SPA uses credentials |
| D2 | Align CORS / cookie SameSite / CSRF story for cookie auth | smoke OAuth + refresh still works via Docker |

Do **D** after A–C if timeboxed; admin panel must not start while JWT still in web storage if D is in this plan’s “must”.

## Phase E — verify + handoff

1. `docker compose up -d --build` (frontend + backend).
2. Smoke: `/health`, catalog, add-to-cart, checkout, OAuth fake.
3. `/sprint-check --stage b` (consistency + smells); append delta to `_project_audit/`.
4. `/clear-session` (commit + **push**).
5. Next chat: **admin catalog** (new story) — only after this plan’s must-phases done.

### Must vs nice

| Must before admin | Nice |
|-------------------|------|
| A1–A5, B1–B3, C3–C4, E | B4, C1–C2, C5–C6, D1–D2 |

If calendar is tight: ship **Must**, park D as first admin-adjacent hardening story.

**Status 2026-11-06:** Must **done** (incl. C5). Nice still open → carryover / next hardening. Delta: `_project_audit/sprint-check-2026-11-06-quality-debt-delta.md`. Admin catalog may start.

---

## Order of work (suggested)

```
A1 → A4 → B2 → B1 → B3 → A5 → C3 → C4 → C5
  → (optional C1/C2/C6) → (optional D) → E
```

Parallel OK: backend B* ‖ frontend A5/C* in worktrees (`features/quality-back`, `features/quality-front`).
