# Interview — 05 Покупатель ведёт корзину до демо-оформления

**Статус:** закрыто для story-spec.

## Scope

**IN:** `#cart` drawer, badge, `#dock`, line qty +/-, remove at 0, total, «Оформить в макете», message stop.

**OUT:** real order, payment, email.

## Pages / Surfaces

- catalog: primary cart + dock
- index: cart with link «Открыть каталог» when empty context

## Key Decisions

- `DECISION:` мокап сейчас — стоп «Макет останавливается здесь.»; целевой UX после **10** — см. interview 10 (не этот AC)
- `DECISION:` checkout disabled if cart empty (catalog)
- `DECISION:` amounts integer RUB, `Intl ru-RU`

## Behavior & Rules

- open from nav, dock, post-add
- Empty copy catalog vs index differs slightly — ok

## Already Implemented (REUSE)

- renderCart, line handlers, checkout click

## NOT Yet Implemented (Gaps)

- story-spec; server cart (10)

## Check Notes

- Dock hidden qty=0
- Total = sum lines
