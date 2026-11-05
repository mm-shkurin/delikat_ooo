# Interview — 02 Покупатель отбирает товары в каталоге

**Статус:** закрыто для story-spec (эталон `catalog.js`).  
**Связь:** семантика фильтров переносится в **09** (query) и **08** (клиент).

## Scope

**IN:** `catalog.html` — sidebar: категории, slider max price, чекбоксы свойств, sort (pop / price / sale), счётчик «Показано N», grid, empty state, hash `#sale`.

**OUT:** product panel, add to cart (03); API wire (08).

## Pages / Surfaces

- Main: `.layout` aside + `#grid`
- Header chrome как на главной (без delivery/pickup на hero)

## Content & Assets

- 16 SKU в `PRODUCTS`, 7 категорий + «Все» (client-only id `all`)
- Demo цены/фото; slug `id` = seed для API

## Key Decisions

- `DECISION:` slider min 500 max 7000 step 50; label max синхрон с state
- `DECISION:` default checked props: chilled + fresh
- `DECISION:` props filter — OR по выбранным; если **ни один** checkbox не checked → фильтр по props не применяется (все товары по cat/price)
- `DECISION:` sort `sale` — сначала с `was`, затем price; `#sale` на load выставляет sort
- `DECISION:` max 16 items shown = length of seed list (не pagination UI в мокапе); API pagination — **08** (page size TBD in spec, default 16)

## Behavior & Rules

- Category buttons `aria-pressed`
- Sort buttons exclusive
- Grid `aria-busy` false after render
- Empty: «Ничего не нашлось. Снимите часть фильтров.»
- Card click opens product (03) — grid rendering belongs here

## Already Implemented (REUSE)

- `filtered()`, renderCats/renderGrid, handlers

## NOT Yet Implemented (Gaps)

- story-spec; loading skeleton for API (08)

## Out of Scope

- Cart, address, auth

## Check Notes

- Extreme filters → empty
- `#sale` cold load
- Mobile filters + grid
