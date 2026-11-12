# Interview — 14 Витрина = тот же каталог (hide/badges)

**Статус:** подтверждено (раунды 1–5 + revise clean-panel).  
**Волна:** Wave 3. После **13**.  
**Зависит от:** **13** (staff write + `hidden` + media), **09** (buyer catalog GET), **08** (React `/catalog`), **10** (cart add через catalog).

## Scope

**IN:**

- Публичный `GET /catalog/products` отдаёт только `hidden=false`; `total_count` без скрытых.
- `GET /catalog/products/{id}` для hidden → **404** + `product_not_found` (как missing).
- `POST /cart/items` на hidden → HTTP 404 `product_not_found` (как unknown), без отдельного hide-кода; UI = тот же cart failureText.
- Витрина `/catalog` после refresh показывает правки staff: имя, цена, `compare_at`/was, badge NEW|SALE|TOP, `image_url` (в т.ч. Postgres media).
- Open / deep-link / refresh detail на hidden → панель **«товар не найден»**; в grid нет карточки hidden (нет призрака из list).
- Фильтры витрины (категория, цена, свойства, sort) считают только live SKU; пустой результат — текущий empty-state, без копирайта про «скрыто».
- Buyer/OpenAPI: поле `hidden` покупателю не светим; описание buyer GET — live only; один Postgres-каталог = source of truth.

**OUT:**

- Realtime / SSE / poll / focus-revalidate открытой панели; optimistic UI; тонкая настройка кеша (Tier 3).
- Авто-обновление уже открытой панели после hide без нового GET (stale detail до open/deep-link/refresh — ок).
- Менять buyer-sort на staff-порядок SALE→NEW→TOP (остаются `pop` / `sale_first` / price из **09**).
- Авто-чистка строк корзины, уже лежавших до hide.
- Отдельная mobile/desktop вёрстка под 14 → отдельная история.
- Редизайн плашки TOP / новых полей на карточке.
- Categories CRUD (**17**), orders staff (**15**), stats/money (**16**).
- Правки `site/` и admin UI (**13** уже закрыт).

## Pages / Surfaces

- `frontend/` — `/catalog` (+ панель товара); panel copy на 404; без auto-invalidate.
- Backend — buyer catalog list/detail + cart add path учитывают `hidden`.
- OpenAPI — обязательное уточнение семантики hide (live only) в `store_api.yaml` (без поля `hidden` в buyer schema).
- Admin / `site/` — не трогаем.

## Content & Assets

- Контент карточки = то, что staff уже пишет в **13**; новых полей на витрине нет.
- Плашки NEW|SALE|TOP и was — как сейчас в React; редизайн не делаем.

## Key Decisions

- `DECISION:` IN — buyer list только live; detail hidden → 404 `product_not_found`; cart add hidden → тот же код/UI что unknown; refresh витрины отражает staff-правки (имя/цена/was/badge/image).
- `DECISION:` страницы — только React `/catalog` (+ панель); admin и `site/` вне 14.
- `DECISION:` OUT — SSE/poll/focus-revalidate/optimistic UI/кеш; staff-sort на витрине; авто-purge cart после hide; categories/orders/stats; `site/`.
- `DECISION:` контент карточки без новых полей; только поля из **13**.
- `DECISION:` плашка TOP / badge UI без редизайна.
- `DECISION:` после hide — следующий list fetch без SKU; open/deep-link/refresh detail → панель **«товар не найден»**; уже открытая панель без нового GET — **OUT** (clean code, без poll/SSE).
- `DECISION:` фильтры витрины только по live; empty-state без текста «скрыто».
- `DECISION:` отдельная mobile/desktop вёрстка — OUT из 14; в 14 только данные/sync + panel copy.
- `DECISION:` gaps — hide на buyer GET/detail, cart add, panel copy на 404; без новых экранов.
- `DECISION:` buyer schema не экспонирует `hidden`; OpenAPI live-only обязателен; Postgres = SoT.

## Behavior & Rules

- Hide в кабинете → на витрине SKU исчезает после refresh/следующего list fetch.
- Правка цены/имени/badge/фото в staff → видны покупателю после refresh.
- Неизвестный и hidden id для detail/cart — одинаковый 404 `product_not_found`.
- Сортировки buyer не меняем под staff-порядок списка.
- Stale open panel после hide без re-fetch — допустим до следующего open/refresh.

## Already Implemented (REUSE)

- Hex catalog GET + seed + badge/`compare_at` — **09**.
- React `/catalog` grid/panel, badge + was — **08**.
- Staff CRUD + `hidden` + media URL — **13**.
- Cart add резолвит product через catalog — **10**.

## NOT Yet Implemented (Gaps)

- Buyer list/detail режут `hidden`.
- Cart add на hidden → ProductNotFound / 404 `product_not_found`.
- Panel copy «товар не найден» на 404.
- OpenAPI live-only + тесты sync hide↔витрина.

## Out of Scope

- Realtime, poll, focus-revalidate, SSE, optimistic UI, cache Tier 3.
- Mobile/desktop layout story.
- Cart line auto-cleanup after hide.
- **15**, **16**, **17**, правки admin/`site/`.

## Integrations

- Тот же backend `:8000` / Docker; staff media anonymous GET уже из **13**.
- Vite proxy витрины на buyer catalog API — без нового клиента staff на витрине.

## Check Notes

- Hide в `/admin/catalog` → refresh `/catalog` — SKU нет.
- Правка цены / имени / badge / фото → видны на витрине после refresh.
- Add в корзину скрытого (если id известен) → UI как unknown / `product_not_found`.
- Deep-link / open / refresh detail на hidden → «товар не найден»; grid без карточки.
- Cashier: catalog write 403; admin list hidden/all после hide показывает SKU; ACL tabs **12**.
