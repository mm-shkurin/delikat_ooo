# Деликат — frontend (prod)

React + Vite. Референс UI: `../site/`. Контракт API: `../ProductSpecification/api-specs/store_api.yaml`.

## Setup

```bash
cd frontend
cp .env.example .env
npm install
```

Статика с мокапа: junction `public/assets` → `../site/assets` (Windows: `mklink /J public\assets ..\site\assets`). Vite копирует `public/` в `dist` при сборке.

## Dev

```bash
npm run dev
```

- App: http://127.0.0.1:5173/
- Запросы на `/api/v1/*` проксируются на `VITE_API_PROXY_TARGET` (по умолчанию `http://127.0.0.1:8000`).
- `VITE_API_BASE_URL` оставьте пустым, чтобы cookie и origin совпадали с Vite (как adaptive-tutor).

Пока hex-backend не поднят — MSW по [frontend-integration.md](../ProductSpecification/api-specs/frontend-integration.md) или фикстуры из `api-specs/examples/`.

## Структура (по фичам)

```
src/features/<feature>/
  *Page.jsx
  use*Screen.js
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
