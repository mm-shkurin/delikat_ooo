# Technology Profile — Деликат

Как adaptive-tutor / textery / absolute555.

tech-profile:
  backend: python-fastapi-hexagonal
  frontend: react-vite
  css: plain-css
  browser-testing: selenium-or-playwright-tbd

## Backend

| Concern | Technology |
|---------|------------|
| Language | Python 3.12 |
| HTTP | FastAPI (только в `adapters`) |
| Architecture | domain → usecase → adapters → application |
| Persistence | PostgreSQL |
| Migrations | Alembic (`backend/adapters/db` или аналог) |
| Unit tests | pytest в `backend/usecase/tests` |
| Run | `uvicorn application.main:app --reload` (из `backend/`) |

**Запрещено:** монолит `backend/app/*.py` с handlers + ORM в одном слое (прототип удалён).

## Frontend

| Concern | Technology |
|---------|------------|
| Language | JavaScript или TypeScript (как в textery — TS предпочтителен) |
| Framework | React 19 |
| Router | react-router-dom |
| Build | Vite |
| Tests | Vitest (+ jsdom) |
| Dev | `cd frontend && npm run dev` |
| API | `features/*/api/*` + `shared/api` (paths, guards, httpClient), `credentials: 'include'` |

## UI reference (не prod)

| Path | Purpose |
|------|---------|
| `site/` | Pixel/flow reference; `python -m http.server 8767` |
| `design/tokens.json` | Brand tokens → CSS variables |

## OpenAPI

`ProductSpecification/api-specs/store_api.yaml` — точка встречи полос.

## Wave 1 focus

| Полоса | Deliverable |
|--------|-------------|
| Frontend **08** | `frontend/`: Landing + Catalog screens, catalog API client, mock MSW или live API |
| Backend **07** | Hex: Yandex OAuth account + JWT + guest session |
| Backend **09** | Hex: catalog list/filter usecases + DB adapter + seed (done) |
