---
name: frontend-delivery
description: >-
  Фронтовая полоса Деликат — React/Vite в frontend/, референс site/, API по YAML.
  Как adaptive-tutor/textery. Use for /frontend-delivery.
disable-model-invocation: true
---

# /frontend-delivery

Парная полоса: `/backend-delivery`. Эталон UI: **`site/`** (read-only). Prod: **`frontend/`**.

## Режим

```
interview → story-spec → mockup parity (site/) → React screen → API client → vitest → check
```

### Мокап

- Дизайн-истина: `site/index.html`, `site/catalog.html` + css/js.
- После переноса — правки UI в `frontend/src/features/*`, не в `site/` (кроме sync референса по договорённости).

### Контракт

- `shared/api/backend/` — paths + bodyGuards (гейт CI).
- `features/<feature>/api/` — клиенты ручек фичи; `logic/*View.js` — wire → UI.
- Экраны не импортируют `fetch` напрямую (как adaptive-tutor: documents → documentApi).
- MSW/mock до live hex backend.

### Check

- `cd frontend && npm test && npm run ci`
- `python scripts/check_api_contract.py` — paths.js ↔ `store_api.yaml`
- Dev: `npm run dev` (proxy `/api` → `VITE_API_PROXY_TARGET`)
- Сравнение с `site/` на 8767
- **Docker:** после завершения полосы — `cd infra && docker compose up -d --build` (см. правило `docker-rebuild-after-dev`). Иначе :5173 может отдавать старый бандл/зависимости.
- Selenium (опционально): `cd acceptance && python -m pytest -m frontend`

Коммит: `git commit -m "..." -- frontend ProductSpecification`

**Не делать:** prod API в `site/js`.
