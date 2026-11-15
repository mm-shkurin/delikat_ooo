# 15 Staff orders — API Endpoints

Контракт кабинета: [`admin_api.yaml`](../../api-specs/admin_api.yaml).  
Оформление: [`POST /api/v1/orders`](../../api-specs/store_api.yaml). Ответ чека не получает `buyer_name` и `buyer_email`.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/v1/staff/orders` | owner, manager, cashier | Все заказы, новые сверху |
| PATCH | `/api/v1/staff/orders/{order_id}` | owner, manager, cashier | Тело `{ "status" }` |

Не staff → **403**. Без токена → **401**.

## Список

Без query и без страниц. Тело `{ "items": [ StaffOrder ] }`.

Порядок: `created_at` убывает, затем `order_id` как строка UUID `8-4-4-4-12` в нижнем регистре возрастает.

`StaffOrder`: `order_id`, `status`, `allowed_next`, `total_rub`, `created_at`, `buyer_name`, `buyer_email` (null если нет), `customer_note` (null если нет), `fulfillment`, `lines`. Телефона нет. Других полей нет.

`allowed_next`: шаг вперёд, если есть, затем `cancelled`, если можно. У `done` и `cancelled` пусто.

`lines` — снимок витринного заказа, по возрастанию id вставки.

Статус: `accepted` | `packing` | `ready` | `done` | `cancelled`.

## Переходы

| Из | Куда |
|----|------|
| accepted | packing, cancelled |
| packing | ready, cancelled |
| ready | done, cancelled |
| done | — |
| cancelled | — |

Тот же статус — **200** и та же карточка. Запрещённый другой — **409** `invalid_status_transition`, «Этот статус отсюда не поставить.»

Пустое тело, нет `status`, неизвестный статус, тело не объект — **400** `validation_error`, «Некорректный статус.»  
Не-UUID в path — **400** `validation_error`, «Некорректный номер заказа.»  
Нет заказа — **404** `order_not_found`, «Заказ не найден.»  
Лишние поля тела игнорируются. Версии нет.

## Снимок на POST /orders

Cookie shop-сессии обязательна. Authorization необязателен.

| Вход | Снимок | HTTP |
|------|--------|------|
| нет Bearer | «Гость», почта null, status `accepted` | 201 |
| верный Bearer | trim `display_name` витрины, пустое → «Гость»; email аккаунта | 201 |
| неверный или просроченный Bearer | строка не создаётся и не меняется | 401 |

Повтор своего ключа в той же сессии — **201** и текущая строка, снимок и `message` не меняются. Другая сессия — **409** `idempotency_conflict`.
