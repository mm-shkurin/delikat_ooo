# Decisions — 11 Кабинет (mock wave)

Источник формулировок: `interview.md`. Ниже — сжатая карта для story-spec.

## Delivery mode

| ID | Decision |
|----|----------|
| D1 | Только `site/` мокап; без API, React, hex в этой волне |
| D2 | Один URL `site/admin/index.html` |
| D3 | Без ссылки «Админ» в публичном header витрины |

## Roles

| Role | Key | Tabs |
|------|-----|------|
| Владелец | `owner` | Каталог, Заказы, Статистика, Деньги |
| Менеджер | `manager` | Каталог, Заказы |
| Кассир / мясник | `cashier` | Заказы |

| ID | Decision |
|----|----------|
| R1 | Роль на экране входа; chip в шапке |
| R2 | `sessionStorage`: `delikat-admin-ok`, `delikat-admin-role` |
| R3 | Смена роли = выход + новый вход |
| R4 | Запрещённые вкладки скрыты |
| R5 | Демо-пароль `staff` (не prod IAM) |

## Catalog

| ID | Decision |
|----|----------|
| C1 | Поля как OpenAPI `ProductSummary` (+ опц. description) |
| C2 | Плашки только **NEW** / **SALE** (toggle в списке + radio в форме) |
| C3 | Скрытие = `hidden` (soft); hard delete нет |
| C4 | `id` slug при create; на edit readonly; `^[a-z][a-z0-9-]{0,31}$` |
| C5 | `price_rub` 1…99999 (не пол 500 ₽ фильтра витрины) |
| C6 | Persist: `localStorage` `delikat-admin-catalog` |
| C7 | Витрина `catalog.js` admin-storage не читает |

## Orders

| ID | Decision |
|----|----------|
| O1 | Просмотр + смена статуса; создание заказа из кабинета нет |
| O2 | Статусы мокапа: `accepted` \| `packing` \| `ready` \| `done` \| `cancelled` |
| O3 | Persist: `localStorage` `delikat-admin-orders` |
| O4 | OpenAPI v1 сейчас только `accepted` — расширить в story-spec |

## Stats / Money

| ID | Decision |
|----|----------|
| S1 | **Статистика** = круговые «кто / что» (+ KPI заказов/покупателей) |
| S2 | **Деньги** = выручка, топы, лента приходов |
| S3 | Считается из заказов без `cancelled` + демо-строки приходов |
| S4 | Приходы — UI-референс «история банка», не Сбер API |

## Next (not decided here)

- Отдельный `admin_api.yaml` vs расширение `store_api.yaml` → interview **12**
- Prod auth / роли на бэке → **12**
- Единый seed витрины и кабинета → **14**
- Prod split: **12–16**, см. `ProductSpecification/WAVE-3-ADMIN.md`
