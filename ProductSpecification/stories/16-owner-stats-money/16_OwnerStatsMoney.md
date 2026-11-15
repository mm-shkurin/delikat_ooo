# Владелец: Статистика и Деньги

## Brief Description

Owner на `/admin/stats` и `/admin/money` видит KPI и графики по заказам без отменённых (all-time, Asia/Omsk). Manager и cashier этих вкладок не получают. Эквайринга нет: приходы = проекция живых заказов; демо-extras мокапа нет.

## Flow

1. Owner открывает `/admin/stats` — один `GET /api/v1/staff/stats`, рисует KPI и два donut.
2. Owner открывает `/admin/money` — один `GET /api/v1/staff/money`, рисует KPI, столбцы, ленту приходов.
3. Живые заказы = статус ≠ `cancelled`. Отменённые нигде не входят.
4. Повторный GET только при новом заходе на вкладку. PATCH статуса на «Заказах» панели сам не обновляет.
5. Manager/cashier на URL stats/money уходят на первую разрешённую вкладку; API им 403.

## Acceptance Criteria

- Вкладки «Статистика» и «Деньги» только у owner. ACL **12** не меняется. Deep-link запретных URL → первая разрешённая вкладка.
- Нет токена, протухший `GET /staff/me` и 403 не-staff — ворота **12**, вкладка не смонтирована. Тексты: «Войдите через Яндекс ID — роль подтянется с сервера.» и «У этого аккаунта нет доступа в кабинет. Нужна роль сотрудника.» На открытой вкладке 401 — «Сессия истекла. Войдите заново.»; 403 — вторая фраза; сеть/5xx — «Не получилось. Попробуйте ещё раз.»
- `GET /api/v1/staff/stats` и `GET /api/v1/staff/money` без query и без страниц, all-time. Owner → 200. Без Bearer → 401. Не-staff Bearer и staff не-owner → 403 `forbidden`. Сокета, poll и SSE нет.
- Stats: `order_count` = число живых; `buyer_count` = число уникальных ключей покупателя; `buyer_slices` / `product_slices` = `{ label, value_rub }[]`. Ключ покупателя = trim `buyer_name`, пусто → «Гость» (без phone); `value_rub` покупателя = сумма `total_rub` его живых заказов. Ключ товара = trim `product_name`, пусто → «Без названия»; `value_rub` = сумма `line_total_rub`. Срезы: `value_rub` убыв., `label` возр. (`ru`). Сервер массивы не режет. Клиент ≤8 без «Остальное»; центр donut = сумма показанных.
- Money: `revenue_rub`, `avg_check_rub`, `inflow_rub`, `operation_count`, `revenue_by_day` (`day`, `label`, `value_rub`), `top_by_qty` (`label`, `quantity`), `inflows` (`id`, `at`, `title`, `subtitle`, `amount_rub`, `channel`).
- `revenue_rub` = сумма `total_rub` живых. `avg_check_rub` = 0 если живых нет, иначе half away from 0 (`Math.round`). Без эквайринга `inflow_rub` = `revenue_rub`, `operation_count` = число живых; KPI «Приходы»/«Операций» всё равно показываем.
- `revenue_by_day`: sparse, только `value_rub > 0`; `day` = `YYYY-MM-DD` Asia/Omsk; `label` = `ru-RU` `day: numeric`, `month: short`; сортировка `day` возр. `top_by_qty`: сумма `quantity` по тому же ключу товара; `quantity` убыв., `label` возр.; сервер не режет; клиент ≤8.
- `inflows`: один на живой заказ. `id` = `pay-` + UUID lower `8-4-4-4-12`. `at` = `created_at`. `title` «Оплата заказа». `subtitle` `{buyer_key} · № {8 lower символов}` с тем же buyer_key. `amount_rub` = `total_rub`. Если `fulfillment.mode == "pickup"` → `channel` «Наличные / карта в точке», иначе «Онлайн-оплата». Порядок: `at` убыв., `id` возр. Демо-extras нет.
- Заголовки ленты в Asia/Omsk: «Сегодня» / «Вчера» / `day: numeric` + `month: long`. Время строки: `hour: 2-digit`, `minute: 2-digit` Omsk. Иконки: «Наличные / карта в точке» → «₽», «Онлайн-оплата» → «↓».
- Подписи: «Кто заказывает» / «Доля выручки по покупателям»; «Что берут» / «Доля выручки по товарам»; «Выручка по дням» / «Сумма принятых заказов (без отменённых)» («принятых» = ≠ `cancelled`); «Топ позиций» / «Сколько штук заказали»; pay kicker «Счёт магазина», «Приходы», «Доступно». Суммы целые рубли, `ru-RU`, « ₽».
- До успешного GET — только загрузка, без KPI и без «Нет данных». После успеха пусто — KPI нули; donut, bars и лента «Нет данных». KPI stats: «Заказов», «Покупателей». KPI money: «Выручка», «Средний чек», «Приходы», «Операций». Баланс «Доступно» = `inflow_rub`.
- Палитра: `#8b1a1a`, `#0a0a0a`, `#c41e3a`, `#5c5c5c`, `#2a9b6a`, `#5c1010`, `#9f1239`, `#3a3a3a`. Новых brand-токенов и hero нет. На 390px KPI двумя колонками, графики одной. Заказ из кабинета, эквайринг, PDF и экспорт не входят.

## Validation Rules

| Состояние | Правило |
|-----------|---------|
| живой заказ | статус ≠ `cancelled` |
| avg_check | 0 при нуле живых; иначе Math.round |
| нет Bearer | 401 |
| не-staff / не-owner | 403 |

## Screen States

- Ворота **12**, вкладок нет.
- Вкладка грузится: без KPI и без «Нет данных».
- Успех с данными / успех с пустотой («Нет данных»).
- Ошибка загрузки на панели.

## Core Requirements

- Контракт — `admin_api.yaml`. Источник цифр — те же заказы, что staff list **15**.
- Демо-пароль `staff` и `localStorage` мокапа не используем.
