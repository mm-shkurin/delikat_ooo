# Store API v1 — JSON-контракты (для фронта)

**Машиночитаемая схема:** [store_api.yaml](./store_api.yaml)  
**Фронт:** типы и клиент только по этим полям (`snake_case`). Позже меняется только **base URL**, не форма JSON.

## Общие правила

| Тема | Правило |
|------|---------|
| Base path | `/api/v1` |
| Content-Type | `application/json; charset=utf-8` |
| Суммы | `integer`, рубли, без копеек |
| Ошибка | `{ "code": "<enum>", "message": "<string>" }` |
| Guest/cart cookie | `delikat_session`, HttpOnly; все cart/order запросы с `credentials: 'include'` |
| Auth (опционально) | `Authorization: Bearer <access_token>` после SMS verify |
| Idempotency | `POST /orders` — заголовок `Idempotency-Key: <uuid>` |

### Dev base URL

```text
VITE_API_BASE=http://127.0.0.1:8000   # когда hex-backend поднят
# до бэка: MSW/mock ответы из ./examples/
```

---

## 1. Сессия

### `POST /api/v1/sessions` → `201`

Опционально; иначе cookie выставится на первом mutating cart.

```json
{
  "session_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
}
```

---

## 2. Каталог (read-only, без cookie)

### `GET /api/v1/catalog/categories` → `200`

```json
{
  "items": [
    { "id": "beef", "title": "Говядина", "sort_order": 1 },
    { "id": "pork", "title": "Свинина", "sort_order": 2 },
    { "id": "poultry", "title": "Птица", "sort_order": 3 },
    { "id": "marble", "title": "Мраморное мясо", "sort_order": 4 },
    { "id": "semi", "title": "Полуфабрикаты", "sort_order": 5 },
    { "id": "sauce", "title": "Специи и соусы", "sort_order": 6 }
  ]
}
```

Клиент добавляет кнопку **«Все»** (`category_id` не отправляется).

### `GET /api/v1/catalog/products` → `200`

Только live SKU (`hidden=false`). Soft-hidden staff (**13**) в `items` / `total_count` не входят (**14**). Поля `hidden` в JSON нет.

Query (все опциональны кроме пагинации):

| Query | Пример | Смысл |
|-------|--------|--------|
| `category_id` | `beef` | Фильтр категории |
| `max_price_rub` | `7000` | Цена ≤ |
| `property` | `chilled` & `property=fresh` | OR: хотя бы одно свойство |
| `sort` | `pop` \| `price_asc` \| `sale_first` | Сортировка |
| `limit` | `16` | Размер страницы (default **16**) |
| `offset` | `0` | Для «Показать ещё» |

```json
{
  "items": [
    {
      "id": "rib",
      "name": "Стейк Рибай",
      "category_id": "marble",
      "default_weight_label": "~350 г",
      "price_rub": 1450,
      "compare_at_price_rub": null,
      "popularity_score": 98,
      "properties": ["chilled", "fresh", "premium"],
      "badge": "NEW",
      "marble_grade_label": "Мраморность 4–5",
      "image_url": "/assets/products/ribeye.jpg"
    },
    {
      "id": "beef",
      "name": "Говядина без кости",
      "category_id": "beef",
      "default_weight_label": "за 1 кг",
      "price_rub": 1290,
      "compare_at_price_rub": 1490,
      "popularity_score": 86,
      "properties": ["chilled", "fresh"],
      "badge": "SALE",
      "marble_grade_label": null,
      "image_url": "/assets/products/beef.jpg"
    }
  ],
  "total_count": 16,
  "limit": 16,
  "offset": 0
}
```

**UI map (мокап → wire):**

| UI | JSON |
|----|------|
| `p.was` | `compare_at_price_rub` |
| `p.pop` | `popularity_score` |
| `p.marble` | `marble_grade_label` |
| `p.weight` | `default_weight_label` |
| `p.img` | `image_url` (префикс `VITE_STATIC_ORIGIN` или `/` от dev-server) |

### `GET /api/v1/catalog/products/{product_id}` → `200`

```json
{
  "id": "rib",
  "name": "Стейк Рибай",
  "category_id": "marble",
  "default_weight_label": "~350 г",
  "price_rub": 1450,
  "compare_at_price_rub": null,
  "popularity_score": 98,
  "properties": ["chilled", "fresh", "premium"],
  "badge": "NEW",
  "marble_grade_label": "Мраморность 4–5",
  "image_url": "/assets/products/ribeye.jpg",
  "weight_options": ["~350 г", "~250 г", "~500 г", "1 кг"],
  "description": null
}
```

### `404` (missing **или** soft-hidden — одинаково, **14**)

```json
{
  "code": "product_not_found",
  "message": "Товар не найден"
}
```

`POST /cart/items` на hidden id → тот же `404` / `product_not_found` (без отдельного hide-кода). Строки корзины, добавленные до hide, API не чистит.

---

## 3. Корзина (cookie обязателен)

### `GET /api/v1/cart` → `200`

Пустая:

```json
{
  "fulfillment": {
    "mode": "delivery",
    "address": { "city": "Омск", "street_line": null }
  },
  "items": [],
  "items_count": 0,
  "total_rub": 0,
  "can_checkout": false
}
```

С товарами:

```json
{
  "fulfillment": {
    "mode": "delivery",
    "address": { "city": "Омск", "street_line": "Ленина 10" }
  },
  "items": [
    {
      "line_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      "product_id": "rib",
      "product_name": "Стейк Рибай",
      "weight_label": "~350 г",
      "quantity": 2,
      "unit_price_rub": 1450,
      "line_total_rub": 2900
    }
  ],
  "items_count": 2,
  "total_rub": 2900,
  "can_checkout": true
}
```

| Поле | Смысл для UI |
|------|----------------|
| `can_checkout` | Кнопка «Оформить» enabled |
| `items_count` | Badge корзины (sum of qty) |
| `fulfillment.mode` | delivery / pickup |
| `fulfillment.address.street_line` | Chip адреса; null → gate |

### `PUT /api/v1/cart/fulfillment` → `200`

Request:

```json
{
  "mode": "delivery",
  "address": {
    "city": "Омск",
    "street_line": "Ленина 10"
  }
}
```

Pickup:

```json
{
  "mode": "pickup",
  "address": { "city": "Омск", "street_line": null }
}
```

Response: тело **`Cart`** (как `GET /cart`).

### `POST /api/v1/cart/items` → `200`

Request:

```json
{
  "product_id": "rib",
  "weight_label": "~350 г",
  "quantity": 1
}
```

`weight_label` можно опустить → сервер подставит `default_weight_label`.

Response: **`Cart`**.

### `409 address_required`

```json
{
  "code": "address_required",
  "message": "Укажите адрес доставки перед добавлением в корзину"
}
```

Фронт: открыть sheet адреса → `PUT fulfillment` → повторить `POST items`.

### `PATCH /api/v1/cart/items/{line_id}` → `200`

```json
{ "quantity": 3 }
```

`quantity` 0 через PATCH **не** поддерживается — используйте `DELETE`.

### `DELETE /api/v1/cart/items/{line_id}` → `200`

Response: **`Cart`**.

---

## 4. Auth

### `POST /api/v1/auth/phone/request` → `202`

Request: `{ "phone_e164": "+73812300000" }`

Response:

```json
{ "retry_after_sec": 60 }
```

### `POST /api/v1/auth/phone/verify` → `200`

Request:

```json
{
  "phone_e164": "+73812300000",
  "sms_code": "1234"
}
```

Response:

```json
{
  "access_token": "eyJ...",
  "refresh_token": "opaque-...",
  "token_type": "Bearer",
  "expires_in_sec": 900
}
```

### `GET /api/v1/me` → `200` (Bearer)

См. [examples/me-profile.json](./examples/me-profile.json).

```json
{
  "user_id": "c0ffee00-0000-4000-8000-000000000001",
  "email": "buyer@yandex.ru",
  "display_name": "Алексей",
  "provider_display_name": "Алексей Иванов",
  "avatar_url": "https://avatars.yandex.net/get-yapic/0/0-0/islands-200"
}
```

### `PATCH /api/v1/me` → `200` (Bearer)

Request:

```json
{ "display_name": "Лёша" }
```

Response — тот же shape, что `GET /me`; `avatar_url` и `provider_display_name` без изменений.

### `POST /api/v1/sessions/reset` → `204`

Без тела. Ответ с новым `Set-Cookie: delikat_session=…`.

### `POST /api/v1/auth/logout` → `204`

---

## 5. Заказ

### `POST /api/v1/orders` → `201`

Headers: `Idempotency-Key: <uuid>`

Body (optional):

```json
{ "customer_note": "Позвонить за 10 минут" }
```

Response (данные для экрана «чек»):

```json
{
  "order_id": "b10e8400-e29b-41d4-a716-446655440000",
  "status": "accepted",
  "total_rub": 2900,
  "message": "Заказ принят. Мы свяжемся для подтверждения доставки.",
  "fulfillment": {
    "mode": "delivery",
    "address": { "city": "Омск", "street_line": "Ленина 10" }
  },
  "lines": [
    {
      "product_id": "rib",
      "product_name": "Стейк Рибай",
      "weight_label": "~350 г",
      "quantity": 2,
      "unit_price_rub": 1450,
      "line_total_rub": 2900
    }
  ]
}
```

**UI checkout (фронт):**

1. Локально «Обработка…» пока ждём ответ.
2. `201` + тело выше → экран успеха / шаблон чека.
3. `409` → показать `message`, вернуть в корзину.

| `409 code` | Когда |
|------------|--------|
| `cart_empty` | Пустая корзина |
| `address_required` | delivery без улицы |
| `cannot_checkout` | `can_checkout` было false |

---

## 6. Типовые сценарии (последовательность JSON)

### Каталог (Wave 1)

1. `GET /catalog/categories`
2. `GET /catalog/products?sort=pop&limit=16&offset=0&max_price_rub=7000&property=chilled&property=fresh`
3. `GET /catalog/products/rib` (по клику на карточку)

### Корзина (Wave 2)

1. `PUT /cart/fulfillment` (mode + address)
2. `POST /cart/items`
3. `GET /cart` (dock badge)
4. `PATCH /cart/items/{line_id}` / `DELETE …`

### Checkout

1. `POST /orders` + Idempotency-Key
2. Render `OrderCreated` (+ `lines`, `fulfillment`)

---

## 7. Mock для разработки без бэка

Готовые тела: [examples/](./examples/) — подключить в MSW по path/method из этого документа.
