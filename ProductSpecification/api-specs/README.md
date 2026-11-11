# API Specs — Деликат

| File | Назначение |
|------|------------|
| [store_api.yaml](./store_api.yaml) | OpenAPI 3 — витрина (buyer/guest) |
| [admin_api.yaml](./admin_api.yaml) | OpenAPI 3 — staff-кабинет (Bearer + roster); story **12+** |
| [json-contracts.md](./json-contracts.md) | **Примеры JSON** по каждой ручке (читать фронту первым) |
| [frontend-integration.md](./frontend-integration.md) | Base URL, MSW, структура `frontend/src/shared/api` |
| [endpoints.md](./endpoints.md) | Таблица ручек витрины |
| [examples/](./examples/) | Готовые тела для mock |

## Как фронту разрабатывать

1. UI по `site/`; код в `frontend/src/features/*`.
2. Клиенты — `frontend/src/shared/api/backend/*` (paths, guards, *Api).
3. **С бэком:** `frontend/.env` + Vite proxy `/api` → hex-backend (как adaptive-tutor).
4. **Без бэка:** MSW с `examples/` (контракт тот же).
5. CI: `python scripts/check_api_contract.py` — новый path в `paths.js` только вместе с правкой YAML.

## Маппинг мокап → API

| Мокап (`catalog.js`) | API |
|----------------------|-----|
| `CATS` | `GET /catalog/categories` + «Все» на клиенте |
| `PRODUCTS` | `GET /catalog/products?...` |
| `state.maxPrice` | `max_price_rub` |
| `activeProps()` | повтор `property=` |
| sort pop/price/sale | `pop` / `price_asc` / `sale_first` |
| `p.was` | `compare_at_price_rub` |
| корзина local | `GET/POST/PATCH/DELETE /cart/*` |
| checkout | `POST /orders` → `OrderCreated` (+ `lines` для чека) |
| кабинет `/admin` (12) | `GET /staff/me`, `GET/POST/PATCH/DELETE /staff/members` — см. `admin_api.yaml` |
| кабинет Каталог (13) | `GET/POST/PATCH /staff/catalog/products`, `PUT .../image`, `GET /media/products/{id}` — `admin_api.yaml`; categories select → store `GET /catalog/categories` |

## Seed product ids

`rib`, `strip`, `filet`, `toma`, `beef`, `chicken`, `denver`, `tender`, `mince`, `ribs`, `porkloin`, `wagyu`, `wings`, `sauce1`, `sauce2`, `burger`
