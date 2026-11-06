# Sprint-check — 2026-11-06 — full

- **Date:** 2026-11-06
- **Branch:** `main`
- **HEAD:** `f2ee778`
- **Scope:** full (consistency + smells only)
- **Project overrides:** Stage 0 ignores GitVerse/git; Stage B skips **Git-docs** and **Testing** (not in scope for this project). JWT-in-localStorage accepted interim for Stage A scoring.

## Stage 0 — gate

| Check | Result |
|---|---|
| Deployed links open / app works | **PASS** — `http://127.0.0.1:5173/` 200, `/catalog` 200, `http://127.0.0.1:8000/health` `{"status":"ok"}`, gateway `:8080` 200, categories 200 |
| GitVerse / artifact remotes | **SKIPPED** (project policy; `artifact_remote` empty in `probes/config.json`) |
| Release branch / git hygiene | **SKIPPED** (project policy) |
| Demo ↔ code | **PASS** (local Docker stack: frontend + hex backend healthy; containers rebuilt this run) |

Gate: **PASS** under project overrides (live stand only).

## Stage A — auditor scores

| Layer | Final (confirmed) | Notes |
|---|---|---|
| backend | **2.5 / 3.0** | Held after confirmation |
| frontend | **2.5 / 3.0** | Held after confirmation |

Logs: `backend/AUDIT_LOG.md`, `frontend/AUDIT_LOG.md`.

## Stage B — graded criteria (this project)

| Criterion | Weight | back | front | Notes |
|---|---|---|---|---|
| Git-репозиторий, README, Wiki | 0–1 | SKIPPED | SKIPPED | Project policy |
| Консистентность / арх. стиль | 0–1 | **0** | **0** | Regression probe FAILs |
| Code smells / security | 0–1 | **0** | **0** | Regression probe FAILs |
| Тест-кейсы | 0–2 | SKIPPED | SKIPPED | Project policy |

**Rounded technical (graded subset only):** consistency avg 0 + smells avg 0 → **0 / 2** graded points. Do not invent a 0–5 total while git-docs/testing are out of scope.

### Consistency (mechanical)

| ID | layer | status | evidence |
|---|---|---|---|
| ARCH-SIZE@back | back | FAIL | `backend/adapters/db/cart_store.py` 211 lines (limit 200) |
| ARCH-PATH-HACK@back | back | FAIL | `backend/alembic/env.py:7-8` `sys.path.insert` |
| ARCH-BOUNDARY-3@back | back | FAIL* | `Depends(require_shop_session)` — **false positive** (guest cookie id ≠ DB `AsyncSession`; regex `Depends([^)]*session`) |
| ARCH-SIZE@front | front | FAIL | `StoreOverlays.jsx` 255, `useStoreChrome.js` 288 |
| ARCH-SIZE-STYLE@front | front | FAIL | `catalog.css` 493, `landing.css` 434 |
| ARCH-STATE-LIB@front | front | FAIL | no zustand/RQ/… declared |
| ARCH-STATE-SPREAD@front | front | FAIL | many `useState` in chrome/catalog hooks |
| ARCH-SCOPED-STYLES@front | front | FAIL | page CSS imports outside entry |
| ARCH-DESIGN-TOKENS@front | front | FAIL | hex literals in `catalog.css` |
| ARCH-ENV-ACCESS@front | front | FAIL | bare `document`/`window` in chrome/focus |

\*Treat as probe-config bug for appeal evidence; still counted FAIL by engine.

### Consistency (judgment)

| Item | back | front |
|---|---|---|
| Peer chaining | PASS | PASS |
| Composition root | PASS | PASS |
| File naming / cohesion | FAIL (`models.py` multi-aggregate) | FAIL (loose `useCatalogPage`, fat `StoreOverlays`) |
| Error mapping | PASS | FAIL (mixed `failureText` / `error.message`) |
| Render scope / domain vs UI | n/a | FAIL |

### Smells / security (mechanical)

| ID | layer | status | evidence |
|---|---|---|---|
| SMELL-URL@back | back | FAIL | default Yandex OAuth URLs in `settings.py` |
| SMELL-ENDPOINT-LITERAL@back | back | FAIL | router prefixes in `main.py` |
| SMELL-LONG-FUNC@back | back | FAIL | `save_order`, `create_app`, migrations, … |
| SMELL-DUPLICATION@back | back | FAIL | store/import/migration blocks |
| SEC-INJECTION@back | back | FAIL | parameterized `text()` in alembic helper (likely FP) |
| SEC-EVAL@back | back | FAIL | Redis Lua `eval` in `redis_oauth.py` (intended) |
| SEC-FETCHER@back | back | FAIL | no markdown fetcher deny list (N/A stack) |
| SMELL-ENDPOINT-LITERAL@front | front | FAIL | `shared/api/backend/paths.js` `/api/v1` |
| SMELL-LONG-FUNC@front | front | FAIL | page/hooks/components over 30 lines |
| SMELL-DUPLICATION@front | front | FAIL | cartView/orderView block |
| SEC-WEB-STORAGE@front | front | PASS† | engine PASS; JWT still in `localStorage` (interim) |

†Probe did not flag current `authSession.js` pattern; judgment still notes XSS-readable tokens as interim debt.

### Smells (judgment)

- back FAIL: `save_order` owns validate+persist; wire DTOs in usecase (`serialize_cart`, `ProfileService.view`); catalog filter in Python.
- front FAIL: `StoreOverlays` multi-sheet container; chrome still fat composer; missing AbortSignal on chrome mutations.

## Regression watch

Every non-PASS with `regression: true` (source known to graders):

- ARCH-SIZE@back, ARCH-PATH-HACK@back, ARCH-BOUNDARY-3@back
- ARCH-SIZE@front, ARCH-STATE-LIB@front, ARCH-STATE-SPREAD@front, ARCH-SCOPED-STYLES@front, ARCH-DESIGN-TOKENS@front, ARCH-ENV-ACCESS@front
- SMELL-URL@back, SMELL-ENDPOINT-LITERAL@back|front
- SEC-FETCHER@back (stack N/A)

## New findings

- SMELL-LONG-FUNC / SMELL-DUPLICATION (both layers)
- SEC-EVAL Redis Lua; SEC-INJECTION alembic helper
- Judgment: models.py cohesion; CatalogPage re-render scope; RU labels in logic modules

## Delta

No prior `_project_audit/sprint-check-*-full.md` — first full report for this scope.

## Needs a task

1. Tighten `forbidden_imports` delivery regex so guest `require_shop_session` is not ARCH-BOUNDARY-3 (probe FP).
2. Split `cart_store.py` / push catalog filters to SQL / lock cart RMW.
3. Frontend: state library decision + document; shrink CSS/chrome files; design tokens; AbortSignal on chrome fetches.
4. httpOnly auth cookies (replace JWT localStorage) — cross-layer.
5. Optional: alembic packaging without `sys.path.insert`.

## Docker

`docker compose up -d --build` for frontend (and backend image) completed successfully during this run.
