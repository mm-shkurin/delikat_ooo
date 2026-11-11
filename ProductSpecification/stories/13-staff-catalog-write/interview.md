# Interview — 13 Staff: CRUD каталога (NEW/SALE/TOP, hide)

**Статус:** подтверждено (раунды 1–5).  
**Волна:** Wave 3. Референс UI: `site/admin/` catalog tab (story **11**).  
**Зависит от:** **12** (shell + ACL + staff auth), **09** (catalog GET / seed).

## Scope

**IN:**

- Живой список SKU во вкладке **Каталог** (`/admin/catalog`): поиск, фильтр live / hidden / all.
- Create / edit товара; soft-hide; плашки **NEW | SALE | TOP** — для **owner** и **manager**.
- Cashier вкладку Каталог не видит; прямой write API → **403**.
- Контракт write в **`admin_api.yaml`**: пути `/api/v1/staff/catalog/...`.
- Поля как OpenAPI `ProductSummary` (+ optional description); категории — выбор существующих из GET **09** (без create category).
- Картинки: upload в кабинете → хранение в **Postgres** (байты + content-type) → отдача URL с backend; в карточке канонический `image_url`.
- React live tab вместо shell-заглушки; hex write usecase + HTTP.

**OUT:**

- Sync витрины / фильтр `hidden` на buyer GET → **14**.
- Заказы staff → **15**; Stats/Money → **16**.
- Hard delete SKU; create/edit/сортировка категорий → **17**.
- Object storage (MinIO/S3), nginx-раздача ассетов каталога.
- Правки мокапа `site/` под `fetch` (`site/` остаётся статическим референсом).
- Публичная ссылка «Админ»; эквайринг, PDF, CMS лендинга.

## Pages / Surfaces

- `frontend/` — `/admin/catalog`: список, toolbar, dialog формы (как мок 11).
- Backend — staff catalog write (+ отдача image blob URL).
- OpenAPI — расширение `ProductSpecification/api-specs/admin_api.yaml`.
- Референс: `site/admin/index.html`, `site/js/admin-catalog.js`, `site/css/admin.css` (без `fetch`).

## Content & Assets

- Стартовый каталог = seed Postgres из **09** / examples OpenAPI; staff write меняет те же строки.
- Плашки из кабинета: **NEW | SALE | TOP** (в моке 11 только NEW/SALE — prod шире).
- Фото: upload файла; не основной путь «чужой URL»; не MinIO.

## Key Decisions

- `DECISION:` IN — live list + create/edit + soft-hide + NEW/SALE/TOP; owner/manager; cashier без вкладки / 403 на write.
- `DECISION:` write API только `/api/v1/staff/catalog/...` в `admin_api.yaml` (не PATCH публичных `/catalog/products` в store).
- `DECISION:` staff-список видит `hidden`; buyer GET в 13 не меняем → **14**.
- `DECISION:` поля = `ProductSummary` + optional description; плашки **NEW | SALE | TOP**; одновременно одна; повторный клик/снятие — как в моке (toggle).
- `DECISION:` картинки в **Postgres** (байты + content-type), раздача через backend URL; **anonymous GET** (без Bearer) для `<img>`; без MinIO/S3/nginx-костылей.
- `DECISION:` один каталог в Postgres (seed **09**); отдельного admin-seed и client `localStorage` для prod нет.
- `DECISION:` список: поиск по `name` и `id`; фильтр live|hidden|all; **без** toolbar-фильтра категории; toggles badge/hide в строке **и** в dialog.
- `DECISION:` порядок списка стабильный после reload: **SALE → NEW → TOP → без плашки**; внутри группы `created_at` desc, tie-break `id` asc; `created_at` immutable on edit.
- `DECISION:` create — upload фото обязателен; edit — keep текущего `image_url` или replace upload; очистка без URL → ошибка у поля.
- `DECISION:` при SALE в строке: зачёркнутая `compare_at`, актуальная цена, `%` скидки = round((compare_at − price) / compare_at × 100); `compare_at` > price обязателен.
- `DECISION:` `id` slug только при create, на edit immutable; `^[a-z][a-z0-9-]{0,31}$`; `price_rub` 1…99999; hard delete нет.
- `DECISION:` manager = owner по правам catalog write.
- `DECISION:` категории — только select существующих (GET categories **09**); create category OUT.
- `DECISION:` `site/` — статический мокап-референс; в 13 не переводим на API.
- `DECISION:` при необходимости поля для staff/list (`hidden` и т.п.) — в admin contract; store GET buyer без hide-фильтра до **14**.

## Behavior & Rules

- Неверный/пустой ввод — ошибки у полей (slug, цена, обязательные ProductSummary).
- Пустой поиск / пустой фильтр — «Ничего не найдено» (как мок).
- Hide — флаг `hidden`; «Вернуть» снимает; в staff-списке скрытые видны (фильтр).
- Badge toggle в строке и в форме согласованы.
- Upload: после сохранения превью/картинка видны в строке и в форме.
- Узкая ширина (~390px): карточки SKU / dialog читаемы (как мок).
- ACL вкладок из **12** не ломаем.

## Already Implemented (REUSE)

- React `/admin` shell, gate, ACL tabs, Employees — story **12**.
- Catalog GET + seed + Product/`badge` — story **09**.
- UI-референс catalog tab — `site/admin/` (story **11**).
- `admin_api.yaml` skeleton (staff me + roster) — расширяем, не заводим второй файл.

## NOT Yet Implemented (Gaps)

- Staff catalog list/create/patch (+ hide, badge) в OpenAPI / hex / React.
- Поле `hidden` в домене/БД.
- Upload изображения → Postgres → serving URL.
- Замена `CatalogShell` на live panel.
- Buyer hide / витрина parity → **14**.

## Out of Scope

- Storefront sync (**14**), orders (**15**), stats/money (**16**).
- MinIO/S3, create categories, hard delete, fetch в `site/`.

## Integrations

- Staff Bearer JWT + role из **12**.
- Хранение/раздача image через тот же backend (Postgres), без внешнего object storage.

## Check Notes

- Owner/manager: create SKU → reload → виден в списке.
- Hide в staff-списке (фильтр hidden); badge NEW/SALE/TOP ставятся и снимаются.
- Cashier: вкладки Каталог нет; write API → 403.
- Upload фото отображается в строке и в форме.
- Категории — только из существующего списка.
- Desktop + ~390px.
- Витрина в 13 может ещё показывать скрытый SKU — ок, чинится в **14**.
