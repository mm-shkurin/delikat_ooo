# Sprint-check — 2026-11-06 — quality-debt delta (Stage B)

- **Date:** 2026-11-06
- **Branch:** `main`
- **HEAD:** post quality-debt Must merge (+ ENV-ACCESS follow-up)
- **Scope:** Stage B only — consistency + smells (git-docs / testing skipped per project policy)
- **Prior:** `_project_audit/sprint-check-2026-11-06-full.md` (consistency/smells = 0)

## Stage 0 — gate

| Check | Result |
|---|---|
| Live stand | **PASS** — `:5173/` 200, `/catalog` 200, `:8000/health` ok, categories 200, cart fulfill/add/order 200/201, OAuth start 302 |
| Docker | `docker compose up -d --build` (frontend + backend images rebuilt); redis briefly needed reconnect after host-port clash with adaptive-tutor |

## Must items vs probes

| ID | Before | After | Notes |
|---|---|---|---|
| ARCH-BOUNDARY-3@back | FAIL (FP) | **PASS** | Probe regex ignores `require_shop_session` |
| ARCH-SIZE@back | FAIL | **PASS** | `cart_store.py` split → `order_persist.py` |
| ARCH-SIZE@front | FAIL | **PASS** | chrome overlays/hooks split ≤200 |
| ARCH-STATE-LIB@front | FAIL | **WAIVED** | Documented local-only state in `frontend/README.md` |
| ARCH-STATE-SPREAD@front | FAIL | **WAIVED** | Same waiver until 2027-02-05 |
| ARCH-ENV-ACCESS@front | FAIL | **PASS** | `shared/browser/dom.js` + callers |
| ARCH-PATH-HACK@back | FAIL | FAIL | Nice B4 — alembic `sys.path.insert` |
| ARCH-SIZE-STYLE@front | FAIL | FAIL | Nice C6 — large CSS |
| ARCH-SCOPED-STYLES@front | FAIL | FAIL | Nice C2 |
| ARCH-DESIGN-TOKENS@front | FAIL | FAIL | Nice C1 |

## Judgment (Must-owned)

| Item | Verdict |
|---|---|
| Catalog filter in SQL (B1) | PASS — `PostgresCatalogStore.list_products(query)` |
| Cart RMW lock (B2) | PASS — `mutate` + `FOR UPDATE` on add/patch/delete/fulfillment |
| Wire DTOs out of usecase (B3) | PASS — `cart_presenters.serialize_cart`, `UserProfileView` |
| AbortSignal chrome fetches (C3) | PASS |
| failureText only (C4) | PASS |
| ProductGrid memo (C5) | PASS |

## Smells / security

Unchanged regression noise still present (SMELL-URL, ENDPOINT-LITERAL, LONG-FUNC, SEC-EVAL Redis Lua, etc.). **SEC-WEB-STORAGE** still interim JWT-in-localStorage — Nice **D1/D2**, not Must.

## Needs a task (carryover before / with admin)

1. Nice **B4** — alembic packaging without `sys.path.insert` (or document waiver).
2. Nice **C1/C2/C6** — design tokens, scoped styles strategy, split `catalog.css` / `landing.css`.
3. Nice **D1/D2** — httpOnly cookies for access/refresh + CORS/SameSite/CSRF.
4. Admin catalog story — start only after this Must plan (done).

## Docker

Containers rebuilt and smoke-verified after Must merge.
