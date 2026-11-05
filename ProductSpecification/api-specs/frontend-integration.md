# Frontend — работа по контракту

## Источники

1. [store_api.yaml](./store_api.yaml) — схемы и коды ошибок  
2. [json-contracts.md](./json-contracts.md) — примеры тел JSON  
3. [examples/](./examples/) — файлы для MSW и vitest guards  

## Слои (как adaptive-tutor)

**Shared — провод и гейт CI:**

```
frontend/src/shared/api/
  httpClient.js, send.js, failureText.js
  backend/paths.js      # все URL — check_api_contract.py
  backend/bodyGuards.js
frontend/src/shared/session/   # Bearer + clearShopSession (Wave 2 reset)
```

**Features — экраны, хуки, API фичи, mappers:**

```
frontend/src/features/
  shell/           AppShell, общая оболочка
  landing/         LandingPage (+ components по мере переноса site/)
  catalog/
    api/catalogApi.js
    logic/productView.js
    useCatalogScreen.js
    CatalogPage.jsx
  cart/
    api/cartApi.js, sessionApi.js
    logic/cartView.js
  auth/
    api/authApi.js       # OAuth, getMe, updateMe, logout
    logic/profileView.js
  checkout/
    api/orderApi.js
    logic/orderView.js
```

Импортировать HTTP только из `features/*/api/*` или `shared/api` — не из компонентов напрямую.

## Dev: proxy (основной путь)

```env
# frontend/.env
VITE_API_PROXY_TARGET=http://127.0.0.1:8000
# VITE_API_BASE_URL=   # пусто — same-origin + proxy /api
```

Vite проксирует `/api` на бэкенд. Cookie `delikat_session` живёт на origin фронта.

Переключение на prod/stage: задать `VITE_API_BASE_URL=https://api.example.com` **или** reverse-proxy `/api` на том же домене.

## Dev: без бэка (MSW)

Handlers по path/method из [json-contracts.md](./json-contracts.md); тела — `examples/*.json`. Контракт не менять.

## Mapper (один слой на feature)

```javascript
// features/catalog/logic/productView.js
export function productSummaryToView(p) {
  return {
    id: p.id,
    name: p.name,
    price: p.price_rub,
    was: p.compare_at_price_rub,
  }
}
```

**Не** переименовывать поля в `*Api.js` — только в `*View`.

## Гейты (как adaptive-tutor)

| Проверка | Команда |
|----------|---------|
| Пути paths.js ↔ YAML | `python scripts/check_api_contract.py` |
| Wire-типы (если появятся `.ts`) | `python scripts/check_contract_types.py` |
| Guards vs examples | `cd frontend && npm test` |

CI: `.github/workflows/rules.yml`.

## Yandex профиль

После OAuth — `GET /me`: `avatar_url` (read-only), `provider_display_name` (read-only), `display_name` (редактируется через `PATCH /me`).

Полный сброс перед server cart (Wave 2): `clearShopSession()` — logout + `POST /sessions/reset` + local storage. См. [08_ProfileAuth_Notes.md](../stories/08-store-api-frontend/08_ProfileAuth_Notes.md).

## Sort UI → query

| UI (`data-sort`) | `sort` query |
|------------------|--------------|
| pop | `pop` |
| price | `price_asc` |
| sale | `sale_first` |
