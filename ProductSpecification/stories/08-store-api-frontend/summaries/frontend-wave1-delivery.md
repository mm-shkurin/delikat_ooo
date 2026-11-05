# Story 08 — journey summaries

### 2026-11-01 — Docker dev stack
- Type: decision
- Note: `infra/docker-compose.yml` — postgres, mock API (`infra/mock-api`, fixtures mount), Vite frontend, site nginx, gateway. Root `docker-compose.yml` includes infra. Junction `frontend/public/assets` → `site/assets`; в Docker assets bind-mount. После правок — `cd infra && docker compose up -d --build` (правило `.cursor/rules/docker-rebuild-after-dev.mdc`).

### 2026-11-01 — SPA CSS: landing vs catalog
- Type: quirk
- Note: `landing.css` и `catalog.css` оба в бандле; порядок импорта → стили лендинга перебивали каталог (светлый drawer/sheet, стеклянный nav). Fix: `useRouteBodyClass('route-landing'|'route-catalog')`; nav лендинга под `.hero-shell`; overlay лендинга только `body.route-landing`; overlay каталога `body.route-catalog`.

### 2026-11-01 — Frontend 08 scope delivered (untracked in progress)
- Type: surprise
- Note: Реализованы `/`, `/catalog` (API, filters, product panel, shared `useStoreChrome`), 16 products в examples, vitest (`catalogQuery`, mappers). `acceptance/` Selenium (`pytest -m frontend`, опционально `ACCEPTANCE_BASE_URL=http://127.0.0.1:5173`). `progress.md` story 08 ещё не обновлён — чекбоксы устарели.

### 2026-11-01 — Shared store chrome + Wave 1 story close
- Type: decision
- Note: `StoreChromeProvider` на уровне `App`; fulfillment (mode/address) в `sessionStorage` — chip на каталоге совпадает с hero после перехода с `/`. Vitest: `cartView`, `orderView`, fulfillment storage. Acceptance: pickup sync landing→catalog. Stories 01–06 progress отмечены закрытыми на Wave 1 local UX; server cart/checkout — story 10.

### 2026-11-02 — Yandex profile + shop session reset (Wave 2 prep)
- Type: decision
- Note: OpenAPI `UserProfile`: `avatar_url`, `provider_display_name`, editable `display_name` via `PATCH /me`. Front: auth sheet (avatar, rename, logout), `clearShopSession()` + `POST /sessions/reset`. Mock-api на :8000 тоже отдаёт sessions/reset; hex auth (`PATCH /me`, avatar) — `backend/` + alembic `0003_account_avatar`. Notes: `08_ProfileAuth_Notes.md`, `07_ProfileYandex_Notes.md`.

### 2026-11-02 — `/clear-session` skill ≠ `clearShopSession()`
- Type: quirk
- Note: `/clear-session` — agent skill: handoff + попросить New Chat + resume `/continue`. `clearShopSession()` — продуктовый сброс JWT/guest cookie/local fulfillment в UI; не путать при handoff.
