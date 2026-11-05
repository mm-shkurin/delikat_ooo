# Interview — 10 Корзина и заказы по API

**Статус:** закрыто для story-spec (Wave 2).  
**Зависит:** **07** session/auth, **08–09** catalog, **03–05** UX, **04** fulfillment на обеих страницах.

## Scope

**IN:**

**Backend:** cart/*, fulfillment, `POST /orders` + Idempotency-Key, 409 codes per YAML.

**Frontend:**

- Server cart; address sheet on `address_required`
- Единый fulfillment index + catalog
- Checkout UX после «Оформить»:
  1. **Обработка** — loading/disabled state
  2. **Успех** — экран/слой «чек» (шаблон): order_id, строки, итого, адрес/режим (дизайн уточним позже; v1 — простой шаблон)
  3. **Ошибка** — показать `message` из API, вернуть в корзину

**OUT:** оплата, PDF, email, история заказов в ЛК.

## Key Decisions

- `DECISION:` checkout вызывает `POST /orders` (не demo stop)
- `DECISION:` успех — UI «чек» placeholder (brand tokens), детальный visual TBD позже
- `DECISION:` guest cookie + optional Bearer after login
- `DECISION:` idempotency UUID на клиенте
- `DECISION:` fulfillment `delivery|pickup` + `street_line` rules из YAML

## Behavior & Rules

- Processing state блокирует повторный submit
- После success — корзина пустая на сервере; UI reflects GET /cart

## Already Implemented (REUSE)

- Local cart flow 03–05; OpenAPI cart/order

## NOT Yet Implemented (Gaps)

- Full stack Wave 2

## Check Notes

- Happy path → receipt template visible
- Idempotency no duplicate
- 409 address_required → sheet

## Out of Scope

- Payment capture
