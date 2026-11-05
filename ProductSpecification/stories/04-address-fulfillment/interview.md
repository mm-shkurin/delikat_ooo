# Interview — 04 Покупатель задаёт адрес и способ получения

**Статус:** закрыто для story-spec.  
**API:** `PUT /cart/fulfillment` в **10**; Wave 1 — local string + index mode.

## Scope

**IN:** form `#address` (street, maxlength 80), chip `#address-chip`; index: delivery/pickup (01); catalog: gate before add.

**OUT:** карты, зоны доставки, валидация улицы API; pickup на catalog page.

## Key Decisions

- `DECISION:` street trim, required; пустой не сохраняется
- `DECISION:` pending add flushed after successful save
- `DECISION:` **delivery/pickup на главной и в каталоге** (одинаковый переключатель; chip синхронен)
- `DECISION:` catalog chip — pickup → «Самовывоз»; delivery → адрес или «Омск»
- `DECISION:` Wave 2 — fulfillment через `PUT /cart/fulfillment` (**10**); Wave 1 мокап — доп. UI в catalog.html в рамках 04/08

## Behavior & Rules

- Chip / mobile address → open address sheet
- paintChrome updates labels

## Already Implemented (REUSE)

- address submit, tryAdd pending

## NOT Yet Implemented (Gaps)

- story-spec; server-side fulfillment

## Out of Scope

- SMS, payment

## Check Notes

- First add blocked until address
- Chip shows saved street
