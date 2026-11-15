# Sprint-check — 2026-11-15 — full

- **Date:** 2026-11-15
- **Branch:** `main`
- **HEAD:** `e438e87`
- **Scope:** full
- **Stage A:** backend **2.5 / 3.0** (confirmed); frontend **2.0 / 3.0** (stopped after 5+ iterations — JWT client persistence ceiling)
- **Scores:** **provisional** — Stage 0 GitVerse gate failed

## Stage 0 — gate

| Check | Result |
|---|---|
| Deployed links open / app works | **PASS** — `http://127.0.0.1:5173/` 200, `/catalog` 200, `http://127.0.0.1:8000/health` `{"status":"ok"}`, gateway `:8080` 200 |
| GitVerse / artifact remotes | **FAIL** — `artifact_remote` empty in `probes/config.json`; only remote is GitHub `origin` |
| Release branch | **PASS** — work on `main` (`release_ref`) |
| Demo ↔ code | **PASS** — local Docker stack healthy at gate time |

**Gate: FAIL** (no GitVerse). Criterion scores below are provisional; fixing GitVerse remotes is the top blocker for a graded Friday.

## Stage A — auditor scores

| Layer | Final | Notes |
|---|---|---|
| backend | **2.5 / 3.0** | Held on confirmation after hardening wave |
| frontend | **2.0 / 3.0** | Never held ≥2.5; JWT still client-readable (`sessionStorage`) |

Logs: `backend/AUDIT_LOG.md`, `frontend/AUDIT_LOG.md`.

## Stage B — scores (provisional)

| Criterion | Weight | back | front | Notes |
|---|---|---|---|---|
| Git-репозиторий, README, Wiki | 0–1 | **0** | **0** | Regression DOC/GIT FAILs |
| Консистентность / арх. стиль | 0–1 | **0** | **0** | Regression ARCH FAILs |
| Code smells / security | 0–1 | **0** | **0** | Regression SMELL/SEC FAILs |
| Тест-кейсы | 0–2 | **0** | **0** | DOC-TESTCASES / TEST-TIMEOUT UNKNOWN |

**Rounded technical:** back 0 + front 0 → **0 / 5** (provisional under failed gate).

### Consistency (mechanical)

| ID | layer | status | evidence |
|---|---|---|---|
| ARCH-SIZE@back | back | **PASS** | was FAIL 2026-11-06 |
| ARCH-BOUNDARY-*@back | back | **PASS** | including guest session Depends |
| ARCH-PATH-HACK@back | back | FAIL | `backend/alembic/env.py:7-8` `sys.path.insert` |
| ARCH-SIZE@front | front | **PASS** | was FAIL (StoreOverlays / useStoreChrome) |
| ARCH-SIZE-STYLE@front | front | **PASS** | CSS split this run |
| ARCH-STATE-LIB@front | front | WAIVED | waiver to 2027-02-05 |
| ARCH-STATE-SPREAD@front | front | WAIVED | waiver to 2027-02-05 |
| ARCH-SCOPED-STYLES@front | front | FAIL | page-level CSS imports |
| ARCH-DESIGN-TOKENS@front | front | FAIL | hex/rgba literals in CSS |
| ARCH-ENV-ACCESS@front | front | FAIL | bare `window` in live/categories |

### Consistency (judgment)

| Item | back | front |
|---|---|---|
| Peer chaining | FAIL (`sign_in` → `StaffService`) | FAIL (staff→catalog/auth) |
| Composition root | PASS | PASS |
| File naming / cohesion | FAIL (`models.py` multi-aggregate) | FAIL (loose `use*` at slice root) |
| Error mapping | FAIL (HTTP status in usecase) | FAIL (raw `error.message` in panels) |
| Render scope / domain vs UI | n/a | FAIL |

### Smells / security (mechanical)

| ID | layer | status | notes |
|---|---|---|---|
| SMELL-URL@back | back | FAIL | Yandex URL defaults in settings |
| SMELL-ENDPOINT-LITERAL@back|front | both | FAIL | router prefixes / paths.js |
| SMELL-LONG-FUNC@* | both | FAIL | many >30-line functions |
| SMELL-DUPLICATION@* | both | FAIL | repeated blocks |
| SEC-INJECTION@back | back | FAIL | alembic `text()` (likely FP) |
| SEC-EVAL@back | back | FAIL | Redis Lua (intended) |
| SEC-FETCHER@back | back | FAIL | N/A stack |
| SEC-WEB-STORAGE@front | front | PASS | engine; JWT still in `sessionStorage` (judgment debt) |

### Smells (judgment)

- back FAIL: `catalog_store` God object; long `apply_patch`; duplicated writer ACL
- front FAIL: panel/admin God-hooks; raw wire in orders/analytics; roster mutation duplication

### Git-docs / testing (mechanical)

| ID | layer | status |
|---|---|---|
| DOC-ARCH@* | both | FAIL |
| DOC-ENV-CLEAN@* | both | FAIL |
| DOC-DECISIONS@back | back | FAIL |
| DOC-TESTCASES@* | both | UNKNOWN |
| GIT-BULK@* | both | FAIL |
| GIT-DIRECT-MAIN@* | both | FAIL |
| TEST-TIMEOUT@back | back | UNKNOWN |

## Regression watch

Non-PASS with `regression: true`:

- DOC-ARCH, DOC-ENV-CLEAN (both)
- ARCH-PATH-HACK@back
- ARCH-SCOPED-STYLES, ARCH-DESIGN-TOKENS, ARCH-ENV-ACCESS@front
- SMELL-URL@back, SMELL-ENDPOINT-LITERAL@back|front
- SEC-FETCHER@back
- GIT-BULK, GIT-DIRECT-MAIN (both)
- TEST-TIMEOUT@back UNKNOWN

## New findings

- SMELL-LONG-FUNC / SMELL-DUPLICATION (both)
- SEC-EVAL Redis Lua; SEC-INJECTION alembic helper
- DOC-DECISIONS@back
- Judgment: peer chaining sign_in→staff; usecase HTTP status; staff panel error mapping

## Delta (vs `sprint-check-2026-11-06-full.md`)

| Change | Detail |
|---|---|
| Fixed | ARCH-SIZE@back, ARCH-SIZE@front, ARCH-SIZE-STYLE@front, ARCH-BOUNDARY-*@back, SEC-WEB-STORAGE still PASS |
| Improved | Stage A backend confirmed 2.5; frontend CSS under size budget; AbortController on staff panels; order list `truncated` |
| Regressed / open | Frontend Stage A 2.5→2.0 this run (stricter JWT stance); GitVerse gate still FAIL |
| Unchanged | ARCH-PATH-HACK, scoped styles, design tokens, env access, URL/endpoint smells |

## Needs a task

1. Push split GitVerse remotes (`artifact_remote`) — Stage 0 blocker for graded score.
2. httpOnly auth cookies — replace client JWT persistence (cross-layer).
3. Alembic packaging without `sys.path.insert`.
4. Invert storeChrome↔features; one staff failure mapper; SQL aggregates for analytics (stop silent 500-row cap).
5. Document architecture in layer READMEs (DOC-ARCH); scrub `.env.example` literals that trip DOC-ENV-CLEAN.

## Docker

`docker compose up -d --build frontend backend` **failed** this run (OneDrive “invalid file request” on build context). Existing containers were **restarted** only; UI may not include the latest frontend image until a successful rebuild.
