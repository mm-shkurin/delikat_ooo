# Store API v1 — все ручки

Полные JSON-примеры: [json-contracts.md](./json-contracts.md)

| Method | Path | Request body | Response body |
|--------|------|--------------|-----------------|
| POST | `/api/v1/sessions` | — | `SessionCreated` |
| POST | `/api/v1/sessions/reset` | — | — (`204`, новый cookie) |
| GET | `/api/v1/catalog/categories` | — | `CategoryList` |
| GET | `/api/v1/catalog/products` | query | `ProductListResponse` (live only, **14**) |
| GET | `/api/v1/catalog/products/{product_id}` | — | `ProductDetail` (hidden → 404, **14**) |
| GET | `/api/v1/cart` | — | `Cart` |
| PUT | `/api/v1/cart/fulfillment` | `CartFulfillmentUpdate` | `Cart` |
| POST | `/api/v1/cart/items` | `AddCartItemRequest` | `Cart` |
| PATCH | `/api/v1/cart/items/{line_id}` | `{ quantity }` | `Cart` |
| DELETE | `/api/v1/cart/items/{line_id}` | — | `Cart` |
| GET | `/api/v1/auth/oauth/yandex/start` | — | redirect |
| GET | `/api/v1/auth/oauth/yandex/callback` | query | redirect |
| POST | `/api/v1/auth/oauth/exchange` | `{ code }` | `TokenPair` |
| POST | `/api/v1/auth/refresh` | `{ refresh_token }` | `TokenPair` |
| GET | `/api/v1/me` | — | `UserProfile` |
| PATCH | `/api/v1/me` | `{ display_name }` | `UserProfile` |
| POST | `/api/v1/auth/logout` | optional refresh | — (`204`) |
| POST | `/api/v1/orders` | optional note + header Idempotency-Key | `OrderCreated` |

Auth: catalog — публичный; cart/order — cookie; `/me`, logout, PATCH `/me` — Bearer.
