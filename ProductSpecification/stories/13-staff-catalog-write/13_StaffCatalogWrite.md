# Staff: CRUD каталога (NEW/SALE/TOP, hide)

## Brief Description

Owner/manager правят каталог во вкладке `/admin/catalog`: список, create/edit, soft-hide, плашки NEW|SALE|TOP, upload фото в Postgres. Write API — только `/api/v1/staff/catalog/...` в `admin_api.yaml`. Cashier вкладку не видит; write → 403.

## Flow

1. Staff с ролью owner|manager открывает `/admin/catalog` — live список SKU из того же Postgres, что seed **09**.
2. Toolbar: поиск по имени/id; фильтр visibility `live` | `hidden` | `all` (без фильтра категории).
3. Список отсортирован стабильно (и после reload): SALE → NEW → TOP → без плашки; внутри группы — `created_at` desc, tie-break `id` asc.
4. В строке: цена; при SALE — зачёркнутая `compare_at`, актуальная `price_rub`, процент скидки; toggle badge; soft-hide / «Вернуть»; edit.
5. «Добавить» / edit → dialog: поля ProductSummary + optional description + `hidden`; category — select из GET categories (**09**); slug `id` только при create.
6. Upload файла → Postgres (байты + content-type) → канонический `image_url` (anonymous GET); превью в строке и форме после save.
7. Soft-hide: флаг `hidden` в строке и в dialog; скрытые видны при фильтре `hidden`/`all`.
8. Cashier: вкладки Каталог нет (ACL **12**); staff catalog write → 403.
9. Buyer/store GET и hide-фильтр витрины не меняются (**14**).

## Acceptance Criteria

- Вкладка Каталог live (не shell-заглушка) для owner и manager.
- Список: поиск по `name` и `id`; фильтр live|hidden|all (default `all`); **без** toolbar-фильтра категории и без «Сбросить к витрине»; пусто — «Ничего не найдено».
- Порядок списка (API + UI, после F5 тот же): SALE → NEW → TOP → без badge; внутри группы `created_at` desc, tie-break `id` asc (`created_at` в list DTO).
- `created_at` задаётся при create; на edit immutable (правка не поднимает SKU внутри группы).
- Create / edit / soft-hide / badge — owner и manager; manager = owner по catalog write.
- Cashier не видит вкладку Каталог; write API → 403.
- Write только в `admin_api.yaml` под `/api/v1/staff/catalog/...` (не PATCH публичных `/catalog/products`).
- Editable fields: `id` (create), `name`, `category_id`, `default_weight_label`, `price_rub`, `compare_at_price_rub`, `popularity_score`, `properties`, `badge`, `marble_grade_label`, `image_url` (через upload), optional `description`, `hidden`.
- `id` slug: create only; `^[a-z][a-z0-9-]{0,31}$`; unique; duplicate → ошибка у поля, без overwrite; edit immutable.
- `price_rub` 1…99999; `popularity_score` 0…100; `category_id` из существующих categories.
- Badge: ровно одна из NEW|SALE|TOP или null; toggle строки = то же поле, что в форме; открытие edit показывает текущий badge/`hidden`.
- SALE: обязателен `compare_at_price_rub` > `price_rub`; в строке — зачёркнутая старая цена, новая цена, скидка `%` = round((compare_at − price) / compare_at × 100).
- Soft-hide в строке и в dialog; «Вернуть» снимает; hard delete нет.
- Image: create — upload обязателен; edit — можно оставить текущий `image_url` или заменить upload’ом; очистка без URL → ошибка у поля; Postgres → backend URL; **anonymous GET**; после save превью в строке и форме.
- Staff-список видит hidden; buyer hide / витрина — **14**; categories CRUD — **17**.
- ~390px: одна колонка; actions, badge и dialog не обрезаны (как мок 11).
- ACL вкладок **12** не ломаем.

## Validation Rules

| Field / State | Rule |
|---------------|------|
| role write | owner \| manager; cashier → 403 |
| id (create) | `^[a-z][a-z0-9-]{0,31}$`; unique; duplicate → field error, no overwrite |
| id (edit) | immutable |
| name | required, non-empty |
| category_id | existing id from GET categories |
| default_weight_label | required, non-empty |
| price_rub | integer 1…99999 |
| compare_at_price_rub | null \| integer > price_rub; **required** when badge = SALE |
| popularity_score | integer 0…100 |
| properties | array (ProductProperty); empty allowed |
| marble_grade_label | optional string \| null |
| description | optional string \| null |
| badge | `NEW` \| `SALE` \| `TOP` \| null; at most one |
| hidden | boolean; row toggle + dialog control |
| search | match `name` or `id` (substring, as mock) |
| image_url | create: upload required; edit: keep existing or replace upload; empty/cleared → field error; bytes+ctype; anonymous GET |
| created_at | set on create; immutable on edit |
| list sort | SALE → NEW → TOP → null; within group `created_at` desc, then `id` asc |
| empty search/filter | «Ничего не найдено» |

## Screen States

- `/admin/catalog`: sorted list | empty «Ничего не найдено» | видимая ошибка загрузки (не blank forever).
- Строка SKU: price (+ SALE: was / %); badge pills; hide/restore; edit.
- Dialog create/edit: ProductSummary fields + description + hidden; slug editable only on create; category select; upload; field errors.
- Cashier: вкладки Каталог нет; deep-link по ACL **12**.

## Core Requirements

- Один каталог в Postgres (seed **09**); без admin-seed и client `localStorage`.
- Hex write usecase + HTTP; React live panel вместо CatalogShell.
- OpenAPI: `admin_api.yaml` (list/create/patch + image blob GET); `site/` без fetch.
- MinIO/S3/nginx asset hosting — out.
- Storefront sync → **14**; categories CRUD → **17**.
