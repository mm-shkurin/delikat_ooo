# 10 Cart & Orders — API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/v1/sessions | Явная guest-сессия (опционально) |
| GET | /api/v1/cart | Корзина по cookie `delikat_session` |
| PUT | /api/v1/cart/fulfillment | delivery/pickup + адрес |
| POST | /api/v1/cart/items | Добавить строку |
| PATCH | /api/v1/cart/items/{line_id} | quantity |
| DELETE | /api/v1/cart/items/{line_id} | Удалить строку |
| POST | /api/v1/orders | Checkout; header `Idempotency-Key`; ответ `OrderCreated` с `lines` |

## Notes

- Все mutating cart/order — `credentials: include` (cookie).
- `can_checkout=false` если delivery без `street_line` или пустая корзина.
- `409`: `cart_empty`, `address_required`, `cannot_checkout`.
- Auth SMS — история **07**; здесь только корзина и заказ.
