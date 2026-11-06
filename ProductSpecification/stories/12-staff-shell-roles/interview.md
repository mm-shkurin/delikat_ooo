# Interview — 12 Staff: вход, роль, каркас вкладок

**Статус:** подтверждено.  
**Волна:** Wave 3. Референс UI: `site/admin/` (story **11**).  
**Зависит от:** 07 (Yandex OAuth + JWT), mock ACL из 11.

## Scope

**IN:**

- Staff входит через **Yandex OAuth**; роль только с бэка (allowlist / staff roster), без выбора роли на gate.
- React-кабинет `/admin`: шапка, chip роли, logout, «На витрину»; без пункта «Админ» в публичном nav.
- Каркас вкладок с ACL как в мокапе + новая вкладка **Сотрудники**.
- Содержимое вкладок Каталог / Заказы / Статистика / Деньги — **сразу UI из мокапа** (визуальный каркас); write/данные живые — в **13–16**.
- Вкладка **Сотрудники** (owner + manager): подвкладки **Список** | **Назначить**; поиск/invite по email; одна роль на человека; снятие доступа.
- Контракт: отдельный **`admin_api.yaml`** (не раздувать `store_api.yaml` в этой истории).

**OUT:**

- Живой CRUD каталога (**13**), sync витрины (**14**), смена статусов заказов (**15**), расчёт Stats/Money (**16**).
- Эквайринг, PDF, CMS лендинга, публичная ссылка «Админ».
- Выбор роли radio на gate (только mock **11**).
- Несколько ролей/флагов на одного человека.

## Pages / Surfaces

- `frontend/` — маршрут `/admin` (gate → app shell).
- Вкладки: Каталог, Заказы, Статистика, Деньги, **Сотрудники** (видимость по роли).
- **Сотрудники** → подвкладки: «Список» | «Назначить» (форма почты).
- Референс вёрстки: `site/admin/index.html`, `site/css/admin.css` (не `fetch` в site-мокапе).

## Content & Assets

- Бренд/токены как витрина (Manrope / Oswald, `design/tokens` / `tokens.css`).
- Тексты панелей каталога/заказов/stats/money — из мокапа; данные могут быть пустыми/заглушкой до 13–16.
- Chip роли в шапке — из claim/API, не из client-side picker.

## Key Decisions

- `DECISION:` Auth staff = тот же **Yandex OAuth**, что у покупателя; доступ в кабинет только если у аккаунта есть staff-роль (не `none`).
- `DECISION:` Роль **только с бэка**; на UI нет выбора роли при входе.
- `DECISION:` Роли: `owner` | `manager` | `cashier` (кассир / мясник) | снятие = `none` / «Убрать из staff».
- `DECISION:` ACL вкладок (база из mock 11) + Сотрудники:
  - **owner** — Каталог, Заказы, Статистика, Деньги, Сотрудники;
  - **manager** — Каталог, Заказы, Сотрудники;
  - **cashier** — только Заказы.
- `DECISION:` Вкладка Сотрудники: **owner + manager**. Manager назначает/меняет/убирает только **cashier**; строки `owner`/`manager` для manager — **read-only** (без select/«Убрать»).
- `DECISION:` Через UI «Назначить» / смену роли **нельзя** выдать `owner`. Дополнительные owner — только bootstrap/ops (seed/env), не кабинет.
- `DECISION:` Owner в UI назначает/меняет/убирает только `manager` и `cashier`. Роль `owner` через кабинет не назначается и **никем не снимается/не демоутится** (в т.ч. другим owner).
- `DECISION:` Правило «последнего owner» — защита bootstrap/ops и инвариантов бэка; через кабинет remove/demote owner недоступен, поэтому last-owner ошибка в UI-пути не нужна (остаётся на API ops при попытке снять единственного owner вне UI).
- `DECISION:` Добавление staff по **email**, гибрид:
  1. ищем среди уже зарегистрированных (Yandex / профиль с email);
  2. если нет — создаём запись «ожидает вход»; роль активируется при первом OAuth, когда email совпал.
- `DECISION:` Одна роль на человека; в UI — select + сохранить; кнопка «Убрать из staff».
- `DECISION:` Подвкладки Сотрудники: **Список** | **Назначить** (форма почты).
- `DECISION:` OpenAPI — отдельный **`ProductSpecification/api-specs/admin_api.yaml`** (вариант B).
- `DECISION:` Маршрут кабинета `/admin`; в публичный nav витрины ссылку не ставим (D3 из 11).
- `DECISION:` В 12 панели Каталог/Заказы/Stats/Money — UI из мокапа без обязательного live write API.

## Behavior & Rules

- Не-staff после OAuth / прямой заход на `/admin` — отказ (gate/ошибка), в кабинет не пускаем.
- Запретные вкладки скрыты; deep-link / ручной tab → первая разрешённая.
- «Выйти» — logout staff-сессии (как store auth logout + очистка клиентского состояния кабинета).
- Назначить: email → find registered | pending invite; выбор роли с учётом ACL назначяющего; сохранить.
- Список: имя/email/роль/статус (`active` | `pending`); смена роли; убрать из staff.
- Manager не видит/не может выбрать роли выше cashier при назначении.
- Пустой список / ничего не найдено по email — понятное пустое состояние.
- Узкая ширина (~390px): shell и список staff читаемы.

## Already Implemented (REUSE)

- Mock ACL и UI: `site/admin/` (story 11).
- Buyer auth: Yandex OAuth + JWT (`store_api` / backend 07); у `Me` уже есть `email`.
- React app + router (`frontend/` stories 08/10).
- Design tokens / шрифты витрины.

## NOT Yet Implemented (Gaps)

- Staff roster + role claims на бэке; allowlist/pending-by-email.
- `admin_api.yaml` + hex endpoints (session/me staff, list/assign/remove).
- React `/admin` shell, ACL tabs, Сотрудники List/Assign.
- Привязка «ожидает вход» → активация при OAuth callback по email.
- Живые данные вкладок 13–16.

## Out of Scope

- Catalog write, orders status patch, stats aggregates, эквайринг, PDF.
- Правки публичного каталога / seed sync (**14**).
- Изменение мокапа `site/js/admin-catalog.js` под `fetch` (референс остаётся статическим).

## Integrations

- Yandex OAuth (существующий buyer flow) + staff role resolution после exchange/callback.
- Email из профиля аккаунта (Yandex) для матчинга pending.

## Check Notes

- Staff owner: после Yandex видит все вкладки вкл. Сотрудники; chip = владелец.
- Manager: Каталог + Заказы + Сотрудники; нет Stats/Money; в Назначить только cashier.
- Cashier: только Заказы; `/admin` без Сотрудников.
- Не-staff: в кабинет не входит.
- Список | Назначить: find by email, pending, смена роли, «Убрать» только для manager/cashier по ACL; строки `owner` в кабинете без remove/demote.
- Deep-link на запретный tab → redirect.
- Desktop + ~390px; публичный nav без «Админ».
