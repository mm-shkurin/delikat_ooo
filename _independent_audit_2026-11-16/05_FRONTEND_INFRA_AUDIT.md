# Frontend & infra audit

## Frontend architecture

```
app/ (chrome composition)
features/ (landing, catalog, auth, checkout, staff)
widgets/storeChrome/
shared/ (api, session, ui, hooks)
styles/tokens-*.css
```

После sprint-check 2026-11-15 front:

- HttpOnly cookies: SPA держит только `expiresAtMs` — **подтверждено** `authorizedRequest.js` + README.
- Stage A frontend **2.5 / 3.0** (held); до 3.0 мешают features↔widgets coupling и thin RTL.
- Stage B front: consistency **1**; smells **0** (LONG-FUNC / DUPLICATION); git history FAILs.

## Hotspots (>170 LOC)

| ~LOC | File |
|-----:|------|
| 194 | `features/staff/components/CatalogEditorFields.jsx` |
| 192 | `app/storeChrome/useCartMutations.js` |
| 191 | `features/staff/useAdminPage.js` |
| 185 | `shared/api/backend/bodyGuards.js` |
| 171 | `features/staff/useCatalogPanel.js` / `useCatalogFeed.js` |

CSS нарезан на `tokens-*-{b}.css` — ARCH-SIZE-STYLE закрыт механически, но много файлов-осколков.

## Tests

- ~28 vitest файлов — в основном logic/guards, мало RTL компонентов (кроме `OrderCard`).
- Acceptance: **2** теста (`catalog_page_renders`, `checkout_story10`) — staff `/admin/*` не покрыт black-box.

## `site/` vs `frontend/`

- `site/` = референс + admin mock (story 11).
- Prod staff в React; мокап не должен получать fetch (WAVE-3 правило).
- Visual parity audit optional (carryover 08) — всё ещё открыт как nice.

## Auth UX note

OAuth return path historically used `sessionStorage` key `delikat.authReturn` (summary 12) — это **не JWT**, а return URL; не путать с закрытым SEC-WEB-STORAGE.

## Infra / Docker

| Тема | Статус |
|------|--------|
| Compose services | postgres, redis, backend, frontend, site, gateway; mock-api profile |
| Live smoke (sprint-check) | `:5173`, `:8000/health` PASS |
| `docker compose up -d --build` | **ломается на OneDrive** (`invalid file request`) — повторяется в carryover 12–17 |
| Workaround | temp context вне OneDrive / `docker cp` + restart / volume mount без rebuild |
| Env | `infra/.env` gitignored; placeholders JWT refused (хорошо) |

**Операционный риск:** команда думает, что «restart = актуально», а image layers могут отставать от Dockerfile/deps.

## Dirty workspace (срез аудита)

- `M frontend/src/app/ErrorBoundary.jsx`
- Untracked: `_project_audit/probes-*.json`

Не оценивалось как дефект продукта; шум для следующего коммита.

## Вывод

Frontend prod-годен для текущего scope. Слабые места: contract fail на live path, CSRF policy, OneDrive bake, тонкий staff E2E, residual God-hooks.
