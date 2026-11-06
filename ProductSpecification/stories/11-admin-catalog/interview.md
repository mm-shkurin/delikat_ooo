# Interview — 11 Сотрудник ведёт каталог и заказы

**Статус:** mock-done (`site/`). Prod не через story-spec **11** — см. `WAVE-3-ADMIN.md` (**12–16**).  
**Волна:** mock reference. Ветка `feature/11-admin-catalog-mock`.

Опора: каталог CRUD + вкладка заказов в мокапе. Публичный каталог **09** остаётся read-only.

## Scope

**IN:**

- Сотрудник открывает кабинет с **ролью** на входе; набор вкладок зависит от роли.
- Каталог: список, создание, правка, скрытие, плашки **NEW** / **SALE** (владелец, менеджер).
- Заказы: список, поиск, смена статуса (все роли).
- Статистика / Деньги: только владелец.
- Поля SKU совпадают с `ProductSummary` (+ описание из `ProductDetail`).
- Правки каталога и статусы заказов живут в браузере и переживают перезагрузку.

**OUT:** оплата, PDF/email, CMS лендинга, `frontend/`, `backend/`, правки `store_api.yaml`, связь заказов с живым hex API, настоящий IAM.

## Pages / Surfaces

- `site/admin/index.html` — вход (пароль + роль), вкладки по ACL, форма товара в `<dialog>`.
- Вкладки: Каталог, Заказы, Статистика, Деньги (видимость по роли).
- В шапку витрины ссылку «Админ» не ставим.
- Из кабинета — «На витрину» (`../catalog.html`).
- Карта решений: `decisions.md`. Прогресс: `progress.md`. Carryover: `carryover.md`.

## Content & Assets

- Стартовый каталог — 16 SKU из `site/js/catalog.js`, поля как в OpenAPI.
- Плашки: только **NEW** / **SALE**.
- Демо-заказы — несколько штук (`OrderCreated` + buyer contacts + `created_at`); статусы staff-расширение.
- Картинки — `site/assets/products/` и `site/assets/hero/hero-meat.png`.
- Стили/логика: `site/css/admin.css`, `site/js/admin-catalog.js`.

## Key Decisions

- `DECISION:` админка только в `site/`, без API и без React в этой волне.
- `DECISION:` один URL `site/admin/index.html`, две вкладки, форма товара поверх списка каталога.
- `DECISION:` плашки NEW/SALE — переключатели в строке списка и радио в форме. Повторный клик снимает плашку. Одновременно одна плашка.
- `DECISION:` скрытие — флаг `hidden`. Витрина `catalog.js` флаг и admin-storage не читает.
- `DECISION:` жёсткого удаления SKU нет.
- `DECISION:` `id` (slug) при создании; на правке не меняется. `^[a-z][a-z0-9-]{0,31}$`.
- `DECISION:` `price_rub` — 1…99999 (не пол 500 ₽ фильтра витрины).
- `DECISION:` демо-вход: пароль `staff`, `sessionStorage` `delikat-admin-ok` + роль `delikat-admin-role`.
- `DECISION:` роли мокапа:
  - **владелец** (`owner`) — Каталог, Заказы, Статистика, Деньги;
  - **менеджер** (`manager`) — Каталог + Заказы (редактирование / добавление / скрытие товаров);
  - **кассир / мясник** (`cashier`) — только Заказы.
- `DECISION:` роль выбирается на экране входа; в шапке показывается chip роли. Смена роли — через выход и новый вход.
- `DECISION:` каталог в `localStorage` `delikat-admin-catalog`; заказы в `delikat-admin-orders`.
- `DECISION:` статусы заказов в мокапе: `accepted` | `packing` | `ready` | `done` | `cancelled`. OpenAPI v1 сейчас только `accepted` — расширение для story-spec позже.
- `DECISION:` вкладка Заказы — просмотр и смена статуса, без создания заказа из кабинета.
- `DECISION:` Статистика и Деньги считаются из заказов мокапа (без отменённых); приходы — заказы + демо-строки; без API и эквайринга.
- `DECISION:` лента приходов — визуальный референс «история операций» (зелёные суммы +, группировка по дням), не интеграция со Сбером.
- `DECISION:` выручка / топы / приходы — вкладка **Деньги**; круговые «кто/что» — вкладка **Статистика**.

## Behavior & Rules

- Неверный пароль — ошибка под полем.
- «Выйти» снимает session и роль; каталог и заказы в storage остаются.
- Запрещённые вкладки скрыты; прямой вызов `setTab` уходит на первую разрешённую.
- Пустой поиск каталога / заказов — «Ничего не найдено» / «Заказов нет».
- Новый SKU — в начало списка.
- Узкая ширина (~390px): карточки SKU, заказы столбиком.
- Без `fetch`.

## Already Implemented (REUSE)

- `site/css/tokens.css`, Manrope / Oswald.
- Категории и свойства витрины; seed ids из api-specs README.
- Мокап: `site/admin/index.html`, `site/css/admin.css`, `site/js/admin-catalog.js`.

## NOT Yet Implemented (Gaps)

- Story-spec, OpenAPI admin/write + list orders, hex, React.
- Витрина не подхватывает правки из admin `localStorage`.

## Out of Scope

- Оплата, PDF, CMS главной, ссылка из публичного меню, общий `site/data/` JSON.

## Integrations

- Нет.

## Check Notes

- `cd site` → `python -m http.server 8767` → `http://127.0.0.1:8767/admin/` (`staff` + роль).
- Владелец — 4 вкладки; менеджер — Каталог+Заказы; кассир/мясник — только Заказы.
- Каталог: NEW/SALE → reload → плашка на месте.
- Заказы: смена статуса → reload → статус на месте.
- Desktop + ~390px.
- Витрина без ссылки на кабинет.
