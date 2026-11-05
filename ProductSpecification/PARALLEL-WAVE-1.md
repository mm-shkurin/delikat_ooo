# Wave 1 — параллельные полосы (исправлено)

**Статус (2026-11-02):** hex **07 + 09** в `backend/`; compose `infra/` — hex backend на `:8000` (паттерн adaptive-tutor). Mock cart — `docker compose --profile mock-api`.

## Принципы

1. **`site/`** — только референс-мокап (не подключать prod API).
2. **`frontend/`** — полноценное приложение (React/Vite), как textery / absolute555 / adaptive-tutor.
3. **`backend/`** — **гексагон**, как adaptive-tutor (`domain → usecase → adapters → application`). Без монолитного «макета API».

## Фронт — история **08**

- Bootstrap `frontend/` (Vite + React + router) если ещё нет.
- Features:
  - `features/landing/` ← `site/index.html` + `home.js`
  - `features/catalog/` ← `site/catalog.html` + `catalog.js`
- `shared/api/backend/catalogApi.js`, `paths.js`, `bodyGuards.js` — по `store_api.yaml`.
- `shared/session/` — задел под auth (Wave 2 wire).
- Catalog: categories, filters, sort, **«Показать ещё»**, product panel; fulfillment delivery/pickup на landing **и** catalog (shared store).
- До live API: **MSW** или openapi-mock; не править `site/` для API.

## Бэк — истории **07** + **09**

### 07 Account / platform (этапы 07.1 … 07.5)

См. [07_BackendAuthSms.md](./stories/07-store-backend-api/07_BackendAuthSms.md#этапы).

1. **07.1** — application + Postgres/Alembic + CORS  
2. **07.2** — domain, ports, OTP usecases, dev SMS, pytest fakes (**без** JWT/HTTP)  
3. **07.3** — JWT, refresh store, DB repos, logout usecase  
4. **07.4** — HTTP auth + `/me`  
5. **07.5** — guest `delikat_session` middleware  

Tests: **usecase** pytest с fakes на 07.2/07.3; curl/httpx на 07.4.

### 09 Catalog

- `usecase/catalog`: list categories/products, get product; фильтры как в OpenAPI.
- `adapters/db`: Product/Category repos, Alembic seed 16 SKU.
- HTTP adapter: GET catalog/* only.

**Порядок:** domain/usecase ports → adapter HTTP → adapter db. Не «всё в main.py».

## Стык

```
frontend catalogApi  ←→  adapters/http catalog routes  ←→  usecase/catalog
```

YAML — истина; фронт не ждёт бэк (mock).

## Не делать в Wave 1

- Cart/order handlers (10)
- Прод-реализацию в `site/js`
- Monolith `backend/app`
