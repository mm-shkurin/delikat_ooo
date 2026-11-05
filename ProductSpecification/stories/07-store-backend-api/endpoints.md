# 07 Store Backend API — Endpoints (account / platform)

Story **07** реализует строки ниже с пометкой **07**. Каталог (**09**) и cart (**10**) — соседние stories; здесь для навигации по полному контракту.

| Method | Path | Story | Description |
|--------|------|-------|-------------|
| GET | /api/v1/auth/oauth/yandex/start | 07 | Redirect на Yandex (или fake); Set-Cookie `signin_browser` |
| GET | /api/v1/auth/oauth/yandex/callback | 07 | Callback → redirect на frontend с handoff code |
| POST | /api/v1/auth/oauth/exchange | 07 | Handoff → JWT pair |
| POST | /api/v1/auth/refresh | 07 | Новый access по refresh |
| POST | /api/v1/auth/logout | 07 | Отзыв refresh |
| GET | /api/v1/me | 07 | Профиль (Bearer) |
| PATCH | /api/v1/me | 07 | `display_name` (Bearer) |
| POST | /api/v1/sessions | 07 | Явное создание guest session, 201 + `session_id` |
| POST | /api/v1/sessions/reset | 07 | Новый guest cookie, 204 |
| GET | /api/v1/catalog/categories | 09 | Категории |
| GET | /api/v1/catalog/products | 09 | Товары + фильтры |
| GET | /api/v1/catalog/products/{product_id} | 09 | Карточка |
| GET | /api/v1/cart | 10 | Корзина |
| PUT | /api/v1/cart/fulfillment | 10 | Delivery/pickup |
| POST | /api/v1/cart/items | 10 | Добавить строку |
| PATCH | /api/v1/cart/items/{line_id} | 10 | Quantity |
| DELETE | /api/v1/cart/items/{line_id} | 10 | Удалить строку |
| POST | /api/v1/orders | 10 | Оформить заказ |

## Notes

- Каталог публичный, без Bearer.
- Cart/order — cookie `delikat_session`; Bearer опционален для привязки (Wave 2+).
- Схема: `ProductSpecification/api-specs/store_api.yaml`.
