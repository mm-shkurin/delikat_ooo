# Backend — Деликат

Hexagonal layout (как `adaptive-tutor`): **Yandex OAuth**, JWT, Postgres, Redis.

## Layout

```
backend/
  domain/account/ | domain/catalog/ | domain/cart/
  usecase/account/     # sign_in, session, profile
  usecase/catalog/     # list categories/products, get product
  usecase/cart/        # cart, fulfillment, checkout
  adapters/
    oauth/             # yandex + fake (local PUBLIC_BASE_URL only)
    cache/             # redis oauth state + revocations
    db/                # accounts, catalog, cart, orders
    http/              # auth, catalog, cart, orders
    security/          # JWT
  application/
```

## Setup

```bash
cd infra && copy .env.example .env && docker compose up -d --build
# или только БД для локального uvicorn:
cd infra && docker compose up -d postgres redis
cd ../backend
python -m venv .venv && .venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
# Замените JWT_* на свои секреты. Плейсхолдеры из .env.example процесс не примет.
# OAUTH_PROVIDER=fake допустим только при локальном PUBLIC_BASE_URL.
alembic upgrade head
uvicorn application.main:app --reload --port 8000
```

| `OAUTH_PROVIDER` | Поведение |
|------------------|-----------|
| `fake` | Локальный вход без Yandex (code `demo` в fake flow); default в `infra/.env.example` |
| `yandex` | Реальный OAuth; нужны `YANDEX_CLIENT_ID` / `YANDEX_CLIENT_SECRET` |

**Prod / gateway:** в `infra/.env` выставьте `OAUTH_PROVIDER=yandex`, `PUBLIC_BASE_URL` на публичный origin API (`http://127.0.0.1:8080` при gateway или `https://…`), и тот же host/port в `YANDEX_REDIRECT_URI` (`…/api/v1/auth/oauth/yandex/callback`). `OAUTH_FRONTEND_CALLBACK_URL` — URL SPA после callback (Vite `:5173/auth/callback` или prod frontend). Gateway порт: `GATEWAY_HOST_PORT` (default `8080`).

Auth paths: `GET /api/v1/auth/oauth/yandex/start` → callback → `POST /api/v1/auth/oauth/exchange` → `GET /api/v1/me`. Refresh: `POST /api/v1/auth/refresh`.

Guest cookie: `delikat_session` middleware (story 07.5).

Catalog (story 09):

```text
GET /api/v1/catalog/categories
GET /api/v1/catalog/products?category_id=&sort=&limit=&offset=
GET /api/v1/catalog/products/{product_id}
```

После миграций: `alembic upgrade head` (таблицы `catalog_*`, seed 16 SKU из fixtures).

Cart / orders (story 10):

```text
GET/PUT /api/v1/cart/*
POST/PATCH/DELETE /api/v1/cart/items*
POST /api/v1/orders  (+ Idempotency-Key)
```

Cookie `delikat_session` обязателен для `GET /cart` (middleware выдаёт cookie на других GET).

Спека API: `ProductSpecification/api-specs/store_api.yaml`.

## Ветки и коммиты

Как в корневом [CONTRIBUTING.md](../CONTRIBUTING.md): префиксные ветки, Conventional
Commits, слияние в `main`. PR не используются — ревью = сообщение коммита + CI.
