# Витрина = тот же каталог (hide/badges)

## Brief Description

Покупатель на `/catalog` видит тот же Postgres-каталог, что правит staff: скрытые SKU не попадают на витрину и в detail; правки имени, цены, was, badge и фото видны после refresh. Cart add на hidden — HTTP 404 `product_not_found` (как unknown).

## Flow

1. Staff hide/edit SKU в `/admin/catalog` (**13**) — данные в том же Postgres.
2. Покупатель открывает / обновляет `/catalog` — `GET /catalog/products` только `hidden=false`.
3. Фильтры (категория, цена, свойства, sort) применяются к live-набору; пусто — текущий empty-state каталога.
4. Карточка показывает имя, цену, was (`compare_at`), badge NEW|SALE|TOP, image как в ответе API (без новых полей).
5. Open / deep-link / refresh detail на id: live → detail; hidden или missing → HTTP 404 `product_not_found`, панель **«товар не найден»**, без призрачной карточки из list.
6. Уже открытая панель со старым live detail после hide **без** нового GET — OUT (нет poll/focus/SSE); следующий open/deep-link/refresh detail даёт «товар не найден».
7. `POST /cart/items` с hidden id → HTTP 404 `product_not_found` (как unknown); UI — тот же cart failureText, что для missing SKU.
8. Admin UI, `site/`, buyer-sort enum и layout mobile — без изменений в этой истории.

## Acceptance Criteria

- `GET /catalog/products` не возвращает `hidden=true`; `total_count` считает только live.
- `GET /catalog/products/{id}` для hidden → **404** + code `product_not_found` (идентично missing).
- `POST /cart/items` на hidden → **404** + `product_not_found` (без отдельного hide-кода); UI = существующий `failureText(product_not_found)` как для unknown SKU.
- После refresh `/catalog`: правки staff (name, `price_rub`, `compare_at_price_rub`/was, badge, `image_url`) видны на карточке/панели.
- Open / deep-link / refresh detail на hidden id → панель с точным текстом **«товар не найден»**; в grid нет карточки hidden SKU (нет призрака из list).
- Уже открытая панель после hide без нового GET — **не** обновляется сама (OUT: poll, focus-revalidate, SSE).
- Фильтры витрины только по live; empty-state без копирайта про «скрыто».
- Buyer response / OpenAPI store: **нет** поля `hidden`; описание buyer GET — live only (обязательное уточнение YAML).
- Front: только на 404/`product_not_found` панель показывает **«товар не найден»**; network/5xx и прочий failed — оставить текущий текст (**«Не удалось открыть карточку.»**); cart UI = существующий `failureText(product_not_found)`, строку BY_CODE под панель не подгоняем.
- Badge UI и was — как в **08**/**09**; без редизайна TOP и без новых полей карточки.
- Buyer sort остаётся `pop` / `sale_first` / price из **09** (не staff SALE→NEW→TOP).
- Smoke: cashier staff catalog write → 403; `/admin/catalog` с фильтром `hidden`|`all` после hide всё ещё показывает SKU; вкладки ACL **12** видны по роли (cashier без Каталог).

## Validation Rules

| Field / State | Rule |
|---------------|------|
| list visibility | only `hidden=false` |
| total_count | count of live matching filters |
| detail hidden | HTTP 404, code `product_not_found` (= missing) |
| cart add hidden | HTTP 404, code `product_not_found` (= unknown) |
| panel copy | exact «товар не найден» only on 404/`product_not_found`; other failures keep «Не удалось открыть карточку.» |
| open panel stale after hide | OUT — no auto invalidate |
| buyer DTO | no `hidden` field |
| empty filters | existing catalog empty-state copy |
| sort | unchanged buyer enum (**09**) |

## Screen States

- `/catalog`: grid live SKUs | empty (filters) | loading/error как в **08**.
- Product panel: live detail | **«товар не найден»** after open/deep-link/refresh on hidden/missing; no ghost card in grid.
- No new admin or `site/` screens.

## Core Requirements

- Один каталог Postgres = SoT; витрина читает buyer GET, не staff API.
- Hex: list/detail (+ cart product resolve) уважают `hidden`.
- Frontend: panel 404 copy; без poll/focus/SSE invalidate; без layout-истории.
- Out: SSE/poll/focus-revalidate/optimistic UI/cache Tier 3; auto-purge cart lines after hide; categories **17**; orders **15**; stats **16**.
