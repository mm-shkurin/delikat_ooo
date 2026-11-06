# Infra — Docker

Стек по образцу **adaptive-tutor** (`postgres` + `redis` + hex **backend**) плюс dev-only **frontend**, **site**, **gateway**.

| Сервис | Назначение | URL (по умолчанию) |
|--------|------------|-------------------|
| **postgres** | Hex backend DB | хост: `POSTGRES_HOST_PORT` через override |
| **redis** | OAuth state, JWT revocations | хост: `REDIS_HOST_PORT` через override |
| **backend** | Hex API (`backend/`), миграции при старте | http://127.0.0.1:8000 |
| **frontend** | Vite + React, proxy `/api` → backend | http://127.0.0.1:5173 |
| **site** | Референс-мокап | http://127.0.0.1:8767 |
| **gateway** | Nginx: `/`, `/api/`, `/ref/` | http://127.0.0.1:8080 |
| **mock-api** | Опциональный legacy mock | profile `mock-api`, порт `MOCK_API_HOST_PORT` (default 8002) |

## Быстрый старт

```powershell
cd infra
copy .env.example .env
copy docker-compose.override.yml.example docker-compose.override.yml
docker compose up -d --build
```

`.env.example` — только фейковые локальные значения (`OAUTH_PROVIDER=fake`). Реальные секреты Yandex не коммитить.

Проверка:

```powershell
curl http://127.0.0.1:8000/health
curl http://127.0.0.1:8000/api/v1/catalog/categories
```

Каталог и корзина в UI: http://127.0.0.1:5173 — hex API (catalog, auth, cart, orders).

## Опциональный mock-api

Hex уже закрывает cart/orders. Mock нужен только для изоляции:

```powershell
docker compose --profile mock-api up -d --build mock-api
# временно: VITE_API_PROXY_TARGET=http://127.0.0.1:8002
```

## Makefile

```powershell
make up
make migrate
make smoke
make psql
```

## Локальный uvicorn (без Docker backend)

Postgres/Redis с override → `backend/.env` с `127.0.0.1:5434` и `6380` (`REDIS_HOST_PORT`); `alembic upgrade head`; `uvicorn application.main:app`.

## Пересборка

После правок `backend/`, `infra/docker/backend.Dockerfile`, fixtures:

```powershell
docker compose up -d --build backend
```
