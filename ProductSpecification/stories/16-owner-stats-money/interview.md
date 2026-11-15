# Interview — 16 Владелец: Статистика и Деньги

**Статус:** подтверждено для сборки спек (AFK из источников; без нового раунда).  
**Волна:** Wave 5. После **15**.  
**Зависит от:** **12** (shell, ACL owner-only tabs), **15** (заказы со статусами и снимком покупателя).  
Живого acceptance на агрегаты нет. Опора: панели «Статистика» / «Деньги» в `site/admin`, tier 16 в `WAVE-3-ADMIN.md`, решения **11** S1 S2 S4, carryover **15** (выручка без `cancelled`). **S3 superseded:** демо-строки приходов мокапа в prod не берём (без эквайринга); считаем только из заказов ≠ `cancelled`.

## Scope

**IN:**

- Вкладки **Статистика** (`/admin/stats`) и **Деньги** (`/admin/money`). Только **owner**. Manager и cashier вкладок не видят (ACL **12**); API им **403**.
- KPI и графики из заказов со статусом ≠ `cancelled`.
- Статистика: KPI «Заказов», «Покупателей»; donut «Кто заказывает» (доля выручки по `buyer_name`); donut «Что берут» (доля выручки по `product_name` строк).
- Деньги: KPI «Выручка», «Средний чек», «Приходы», «Операций»; столбцы выручки по дням; топ позиций по штукам; лента приходов, по одной строке на живой заказ.

**OUT:**

- Эквайринг, Сбер API, SBP/касса как отдельный источник, PDF, экспорт.
- Демо-строки приходов из мокапа (`pay-cash-1`, `pay-sbp-1`, `pay-card-1`) — не переносим (**S3 superseded**).
- Создание/правка заказов, пересчёт в реальном времени при PATCH статуса на другой вкладке, сокет/poll/SSE.
- Вкладки для manager/cashier. `site/` мокап и `localStorage`.
- Телефон покупателя (в prod снимка нет).

Из мокапа **не копируем:** fake bank extras, `buyer_phone`, пересчёт панелей при каждом PATCH заказов без нового захода на вкладку.

## Pages / Surfaces

- `frontend/` — заменить `StatsShell` / `MoneyShell` на живые панели; маршруты `/admin/stats`, `/admin/money`.
- `GET /api/v1/staff/stats` и `GET /api/v1/staff/money` в `admin_api.yaml`.
- На 390px KPI в две колонки, графики одной колонкой — как `site/css/admin.css`.

## Content & Assets

Подписи панелей и chart-lead — как в мокапе:

| Поверхность | Текст |
|-------------|--------|
| donut buyers | заголовок «Кто заказывает», lead «Доля выручки по покупателям» |
| donut products | «Что берут», «Доля выручки по товарам» |
| bars days | «Выручка по дням», «Сумма принятых заказов (без отменённых)» — «принятых» здесь = все статусы ≠ `cancelled` |
| bars qty | «Топ позиций», «Сколько штук заказали» |
| pay block | kicker «Счёт магазина», заголовок «Приходы», «Доступно» у баланса |

Суммы — целые рубли, `ru-RU`, хвост « ₽». Пустой график/лента — «Нет данных». KPI при нуле живых заказов: `0` / `0 ₽`.

Палитра donut/bars — порядок как в мокапе: `#8b1a1a`, `#0a0a0a`, `#c41e3a`, `#5c5c5c`, `#2a9b6a`, `#5c1010`, `#9f1239`, `#3a3a3a` (это `--hero`, `--text`/`--solid`, `--accent`, muted, `--success` и соседние красные; новых brand-токенов и hero-блока нет).

## Key Decisions

- `DECISION:` Вкладки stats/money только у **owner**. Manager/cashier: вкладки скрыты (ACL **12**); deep-link `/admin/stats` или `/admin/money` → первая разрешённая вкладка. `GET` без Bearer → **401**. Не-staff или staff не-owner → **403** `forbidden`. Тексты ворот: «Войдите через Яндекс ID — роль подтянется с сервера.» и «У этого аккаунта нет доступа в кабинет. Нужна роль сотрудника.»
- `DECISION:` Живой заказ = статус ≠ `cancelled`. `accepted` | `packing` | `ready` | `done` входят. Отменённые не входят ни в KPI, ни в графики, ни в ленту. Окно = **all-time**, без фильтра дат и без пагинации (как список **15**).
- `DECISION:` **S3 superseded.** Демо-приходы мокапа OUT. Без эквайринга `inflow_rub` всегда равен `revenue_rub`, `operation_count` — числу живых заказов. KPI «Приходы» и «Операций» оставляем ради паритета раскладки мокапа.
- `DECISION:` Два GET без query и без страниц. Открытие вкладки — один GET этой вкладки. Повторный GET только при новом заходе на вкладку (размонт/монт). Сокета, poll, SSE нет. Успешный PATCH статуса на «Заказах» панели stats/money сам не пересчитывает.
- `DECISION:` `GET /api/v1/staff/stats` тело: `{ "order_count", "buyer_count", "buyer_slices": [ { "label", "value_rub" } ], "product_slices": [ { "label", "value_rub" } ] }`. Срезы отсортированы по `value_rub` убыв., затем `label` возр. (locale `ru`) — tie-break строже мока. Клиент рисует не больше **8** первых срезов; хвост без «Остальное»; центр donut = сумма **показанных** срезов. Сервер массив не режет.
- `DECISION:` Уникальный покупатель и ключ среза «кто»: trim `buyer_name`; пустое → «Гость». Мок-ключ `buyer_phone` не переносим (снимка телефона нет после **15**). `buyer_count` = число уникальных таких ключей среди живых заказов.
- `DECISION:` Срез «что» и топ по штукам: ключ = trim `product_name`; пустое после trim → «Без названия»; значение среза = сумма `line_total_rub`, топа = сумма `quantity`. Строки всех живых заказов.
- `DECISION:` `GET /api/v1/staff/money` тело: `{ "revenue_rub", "avg_check_rub", "inflow_rub", "operation_count", "revenue_by_day": [ { "day", "label", "value_rub" } ], "top_by_qty": [ { "label", "quantity" } ], "inflows": [ { "id", "at", "title", "subtitle", "amount_rub", "channel" } ] }`.
- `DECISION:` `revenue_rub` = сумма `total_rub` живых. `avg_check_rub` = `0` если живых нет, иначе округление half away from 0 до целого (как `Math.round`), не banker's. `inflows` — ровно по одному элементу на живой заказ: `id` = `"pay-" + order_id` (канонический UUID lower `8-4-4-4-12`), `at` = `created_at`, `title` = «Оплата заказа», `subtitle` = `{buyer_key} · № {первые 8 символов того же lower UUID}`, buyer_key тот же, что в stats («Гость», не мок «Покупатель»), `amount_rub` = `total_rub`. Канал ответа: если `fulfillment.mode == "pickup"` → `channel` «Наличные / карта в точке», иначе «Онлайн-оплата» (в JSON не пишем enum `pickup`). Порядок ленты: `at` убыв., затем `id` возр. `inflow_rub` = сумма `amount_rub`. `operation_count` = длина `inflows`.
- `DECISION:` Один TZ для бакетов и заголовков ленты: **Asia/Omsk**. `revenue_by_day`: только дни с `value_rub > 0` (sparse, как мок); `day` = `YYYY-MM-DD` в Omsk; `label` = `ru-RU` `day: numeric`, `month: short` для этой даты. Сортировка по `day` возр. Заголовки ленты «Сегодня» / «Вчера» / `day numeric` + `month long` сравнивают календарный день `at` в Omsk с «сегодня» в Omsk — не пояс браузера. Время строки — `hour: 2-digit`, `minute: 2-digit` в Omsk.
- `DECISION:` `top_by_qty`: убыв. по `quantity`, затем `label` возр. Клиент показывает не больше **8**. Сервер не режет массив.
- `DECISION:` Баланс «Доступно» = `inflow_rub`. Иконка канала (осознанный fix мока): «Наличные / карта в точке» → «₽», «Онлайн-оплата» → «↓». Ветки «СБП»/«СБ» нет.
- `DECISION:` Ворота **12** без изменений. Нет токена / протухший me / 403 не-staff — вкладка не смонтирована. На уже открытой вкладке 401 → «Сессия истекла. Войдите заново.»; 403 → «У этого аккаунта нет доступа в кабинет. Нужна роль сотрудника.»; сеть/5xx → «Не получилось. Попробуйте ещё раз.»
- `DECISION:` До успешного GET на панели нет KPI-карточек, нет «Нет данных», нет цифр-заглушек — только состояние загрузки (как список **15** до первого 200: без счётчика и без пустого текста). После успеха с нулём живых — KPI нули; donut, bars и лента показывают «Нет данных» (лента тоже — отличие от мока, где feed оставался пустым).

## Behavior & Rules

- Owner открывает stats → GET stats → KPI + два donut.
- Owner открывает money → GET money → KPI + bars + лента.
- Пустые срезы / дни / топ / лента → «Нет данных».
- Manager/cashier на URL stats/money не остаются — redirect ACL.

## Already Implemented (REUSE)

- ACL вкладок owner-only: `staffAcl.js` (**12**).
- Каркасы `StatsShell` / `MoneyShell` (**12**).
- Заказы со статусом и снимком (**15**).
- Вёрстка/копирайт панелей: `site/admin/index.html`, `site/js/admin-catalog.js`, `site/css/admin.css`.
- Решения S1–S4 (**11**).

## NOT Yet Implemented (Gaps)

- Живые GET aggregates на бэке.
- React-панели вместо каркаса.
- OpenAPI paths stats/money.

## Out of Scope

- Эквайринг, Сбер, PDF, экспорт (Tier 3 WAVE).
- Fake bank seed.
- Realtime sync со вкладкой Заказы.
- Изменение ACL **12**.

## Integrations

Нет. Приходы = проекция заказов, не банк.

## Check Notes

- Owner: `/admin/stats` и `/admin/money` с цифрами из не-cancelled.
- Manager/cashier: вкладок нет; deep-link уводит; API 403.
- Один cancelled-only магазин → нули и «Нет данных».
- Desktop + ~390px.
- Палитра графиков без новых brand-токенов / без hero-блока на вкладке.
