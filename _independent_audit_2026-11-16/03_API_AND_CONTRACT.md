# API & contract audit

## Inventory

| Spec | Paths | Роль |
|------|-------|------|
| `store_api.yaml` | 16 HTTP | buyer/guest: sessions, catalog, cart, auth, orders |
| `admin_api.yaml` | 14 HTTP | staff me/members/catalog/categories/orders/stats/money + media |
| `store_api.yaml` `x-websocket` | `/api/v1/catalog/live` | **не** в `paths` |

Контракт-чекер (`scripts/check_api_contract.py`) читает **оба** YAML под `paths`.

## Живой прогон 2026-11-16

```
Фронтенд: 30 путей. Контракт: 30.
Вне контракта: 1.
  /api/v1/catalog/live
```

**P0/P1 гейт:** CI/`CONTRIBUTING` требуют зелёный `check_api_contract.py`, сейчас он красный.

### Почему

- Story 17 намеренно кладёт WS в `x-websocket` (не OpenAPI `paths`) — см. `17/endpoints.md`.
- `frontend/.../paths.js` всё равно экспортирует `live: `${V1}/catalog/live``.
- Carryover 17 упоминает обход через `CATALOG_LIVE_PATH` в `useCatalogLive.js`, но path всё равно в `paths.js` → чекер видит.

### Варианты фикса (не делались)

1. Убрать `live` из `paths.js`, оставить только константу вне чекера.
2. Научить чекер читать `x-websocket`.
3. Добавить path в baseline (хуже — скрывает gap).

## Auth narrative в контракте vs код

| Источник | Утверждение |
|----------|-------------|
| `backend/README.md` | Staff: «**Bearer JWT** + роль» |
| `frontend/README.md` + `authorizedRequest.js` | Cookie-only, **No Bearer header from JS** |
| `backend/adapters/http/deps.py` | Cookie **или** Bearer (оба) |

Факт кода: dual-accept. Документация бэка устарела относительно SPA-модели.

## Coverage vs delivered stories

| Story | Контракт |
|-------|----------|
| 07 auth/sessions | store ✓ |
| 09 catalog GET | store ✓ |
| 10 cart/orders | store ✓ |
| 12 roster/me | admin ✓ |
| 13 catalog write + media | admin ✓ |
| 14 hide semantics | поведение store GET (не отдельный path) ✓ |
| 15 staff orders | admin ✓ |
| 16 stats/money | admin ✓ |
| 17 categories + live | admin HTTP ✓; WS только `x-websocket` ⚠ |

## json-contracts / examples

- `json-contracts.md` содержит staff orders примеры — хорошо.
- Mock-api profile кормится `examples/` — проверить, что staff fixtures не ожидаются mock-api (staff = hex only). Не блокирует, но важно для онбординга.

## Legacy schemas still in store_api / json-contracts (P0 docs)

Параллельный docs-audit подтвердил:

- В `json-contracts.md` / компонентах `store_api.yaml` остаются SMS verify / `PhoneVerify` / JSON `TokenPair.access_token`.
- Живые paths — только OAuth (`/auth/oauth/yandex/*`, exchange/refresh с cookie).
- `admin_api.yaml` security scheme = `bearerAuth`; cookie session для SPA не отражена.

Это сильнее, чем «устарел Brief»: **контрактные примеры учат неправильной auth-модели**.

## Вывод

HTTP path coverage staff+store ≈ delivered scope. Сломано: **WS live vs checker**, **SMS/TokenPair leftovers**, **Bearer-only admin security docs** vs cookie SPA.
