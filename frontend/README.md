# Деликат — frontend (prod)

React + Vite. Референс UI: `../site/`. Контракт API: `../ProductSpecification/api-specs/store_api.yaml`.

## Setup

```bash
cd frontend
cp .env.example .env
npm install
```

Картинки отдаёт Docker: `infra/docker-compose.yml` монтирует `site/assets` в `frontend/public/assets`. Локально без Docker скопируйте или сделайте junction `public/assets` → `../site/assets`.

## Dev

```bash
npm run dev
```

- App: http://127.0.0.1:5173/
- Запросы на `/api/v1/*` проксируются на `VITE_API_PROXY_TARGET` (по умолчанию `http://127.0.0.1:8000`).
- `VITE_API_BASE_URL` оставьте пустым, чтобы cookie и origin совпадали с Vite (как adaptive-tutor).

API — hex backend на `VITE_API_PROXY_TARGET`. Контракт: `ProductSpecification/api-specs/store_api.yaml`.

## Структура (по фичам)

```
src/features/<feature>/
  *Page.jsx
  useCatalogPage.js и другие хуки экрана
  api/          # вызовы store API этой фичи
  logic/        # *View.js — wire → UI, vitest
src/shared/api/backend/
  paths.js      # CI ↔ store_api.yaml
  bodyGuards.js
```

## Checks

```bash
npm test
npm run ci
python ../scripts/check_api_contract.py
```

Selenium (каталог, фон): `cd ../acceptance && pip install -r requirements.txt && pytest -m frontend`
