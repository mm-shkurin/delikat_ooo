# Staff: вход, роль, каркас вкладок

## Brief Description

Сотрудник входит через Yandex OAuth, получает роль с бэка и работает в React-кабинете `/admin`: вкладки по ACL и вкладка «Сотрудники» (список / назначение по email). Контракт — `admin_api.yaml`.

## Flow

1. Сотрудник открывает `/admin` → вход через тот же Yandex OAuth, что у покупателя.
2. Бэкенд отдаёт staff-роль (`owner` | `manager` | `cashier`); без роли (`none` / не staff) — кабинет закрыт.
3. Shell: шапка (бренд витрины, chip роли, «На витрину», «Выйти»), вкладки строго по ACL.
4. Панели Каталог / Заказы / Статистика / Деньги — UI как в `site/admin/` (каркас; live write не обязателен в 12).
5. Owner/manager → вкладка «Сотрудники»: подвкладки «Список» | «Назначить».
6. «Назначить»: email → найденный аккаунт или pending; роль только из ACL назначающего → сохранить.
7. «Список»: строки имя/email/роль/status; смена роли и «Убрать» только где ACL позволяет.
8. Pending активируется при первом OAuth, если email профиля совпал.
9. «Выйти» — logout как store auth + очистка клиентского состояния `/admin`.

## Acceptance Criteria

- Вход staff только через Yandex OAuth; роли на gate нет.
- Доступ в `/admin` только при роли `owner` | `manager` | `cashier`.
- Chip роли в шапке = роль с API, не client picker.
- ACL вкладок: **owner** — Каталог, Заказы, Статистика, Деньги, Сотрудники; **manager** — Каталог, Заказы, Сотрудники; **cashier** — только Заказы.
- Запретная вкладка скрыта; deep-link → первая разрешённая в порядке ACL роли (слева направо).
- Публичный nav витрины без ссылки «Админ»; из кабинета есть «На витрину».
- «Выйти» завершает staff/store сессию и сбрасывает состояние кабинета на клиенте.
- «Сотрудники»: подвкладки «Список» | «Назначить»; одна роль на человека.
- Строка списка: display name (если есть) + email + role + status `active` | `pending`.
- Назначение по email: поиск среди зарегистрированных **или** pending до первого OAuth по email.
- Через UI нельзя выдать роль `owner` (доп. owner — только bootstrap/ops).
- Owner назначает/меняет/убирает только `manager` и `cashier`.
- Manager назначает/меняет/убирает только `cashier`; строки `owner`/`manager` для него read-only (без select и «Убрать»).
- Роль `owner` через кабинет никем не снимается и не демоутится; строка с ролью `owner` всегда read-only (без select и «Убрать») для всех акторов.
- «Убрать из staff» (где разрешено) → роль `none` (нет доступа в кабинет).
- OpenAPI: `ProductSpecification/api-specs/admin_api.yaml` (отдельно от `store_api.yaml`).
- Shell `/admin` на шрифтах/токенах витрины (Manrope / Oswald + design tokens).
- ~390px: tabs не обрезают labels (wrap); список staff — одна колонка.

## Validation Rules

| Field / State | Rule |
|---------------|------|
| staff role | `owner` \| `manager` \| `cashier`; иначе доступ в `/admin` запрещён |
| assign email | непустой email; registered → bind role; unknown → pending |
| assign/change role (manager) | только `cashier` |
| assign/change role (owner) | только `manager` \| `cashier` (не `owner`) |
| remove (manager) | только target `cashier` |
| remove (owner) | только target `manager` \| `cashier` |
| target role `owner` | всегда read-only в UI (нет select / «Убрать»); remove/demote запрещены |
| forbidden tab | скрыт; deep-link → первая в порядке ACL роли |

## Screen States

- Gate `/admin`: не авторизован / не staff → отказ в кабинет.
- App shell: вкладки по роли; chip; logout.
- Сотрудники / Список: пусто | строки (name, email, role, status) | действия по ACL.
- Сотрудники / Назначить: форма email + роль (опции по ACL); not found → pending; ошибка ACL/валидации.
- Панели каталог/заказы/stats/money: каркас UI мокапа (данные-заглушка допустимы).

## Core Requirements

- Роль и roster только с бэка; фронт не выбирает роль при входе.
- Первый / доп. `owner` — bootstrap seed/env (ops), не UI «Назначить».
- Hex + `admin_api.yaml`: staff session/me, list staff, assign/update/remove by email.
- Pending → active при OAuth, если email аккаунта совпал с invite.
- Live catalog write / orders status / stats aggregates — не AC этой истории (13–16).
