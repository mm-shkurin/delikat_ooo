# Interview — 03 Покупатель открывает карточку и кладёт в корзину

**Статус:** закрыто для story-spec.  
**Волна:** Wave 2 API — `POST /cart/items` (**10**); Wave 1 local state сохраняется.

## Scope

**IN:** overlay `#product` (visual + sheet), вес (кнопки), qty ≥ 1, «В корзину» из panel и «+ В корзину» с grid; fav ♡/♥ local.

**OUT:** смена цены по весу; остатки; избранное на сервере.

## Pages / Surfaces

- `#product` dialog + `#shade`
- Quick add: `data-add` stopPropagation от `data-open`

## Key Decisions

- `DECISION:` цена одна на SKU; вес влияет только на note/label строки корзины
- `DECISION:` cart line key = `productId|weightLabel`
- `DECISION:` tryAdd без address → address layer (04), pending queue
- `DECISION:` после успешного add → open cart (05)
- `DECISION:` fav — не persist

## Behavior & Rules

- Escape / shade / close сбрасывает productId
- Panel shows badge, marble, was price like grid
- Qty stepper min 1 in panel

## Already Implemented (REUSE)

- openProduct, renderProduct, tryAdd, addProduct

## NOT Yet Implemented (Gaps)

- story-spec; 409 address_required from API (10)

## Out of Scope

- Catalog filters (02), checkout (05)

## Check Notes

- Quick add vs open card
- Add with weight+qty from panel
