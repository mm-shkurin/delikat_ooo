# Wave 3+ — Кабинет сотрудника (stories / tiers / waves)

**Референс UI:** `site/admin/` (mock story **11**, закрыт).  
**Prod:** `frontend/` + hex `backend/` + OpenAPI.  
**Процесс:** `/interview` → `/story-spec` → `/spec-skeptic` → `/test-spec` → delivery → `/refactor`.

Монолит «вся админка» в одной истории не тянем: после quality gates каждая story = один вертикальный срез с Tier 1 ≤ 10.

---

## Карта волн

| Wave | Цель | Stories | Параллель |
|------|------|---------|-----------|
| **3** | Staff может войти и править каталог; витрина видит правки | **12**, **13**, **14** | Back 12→13; Front 12→13; **14** после 13 back |
| **4** | Staff ведёт статусы заказов | **15** | Front + Back после 12 |
| **5** | Владелец смотрит статистику и деньги | **16** | После 15 (данные заказов) |

**11** не входит в Wave 3 delivery как код: это **mock-done** и источник AC/макета для 12–16.

```
11 mock (site/) ──AC──► 12 shell/roles ──► 13 catalog write ──► 14 storefront sync
                              │
                              └──► 15 orders staff ──► 16 stats/money
```

---

## Stories

| # | Название | Wave | Front | Back | Зависит от | Mock surface |
|---|----------|------|-------|------|------------|--------------|
| **11** | Мокап кабинета (референс) | mock | `site/` only | · | — | весь `admin/` |
| **12** | Staff: вход, роль, каркас вкладок | 3 | React admin shell | staff session + role claim | 07 auth patterns | gate + tabs ACL |
| **13** | Staff: CRUD каталога (+ NEW/SALE, hide) | 3 | вкладка Каталог | write catalog API | **12**, 09 read | catalog tab + dialog |
| **14** | Витрина читает тот же каталог (hide/badges) | 3 | catalog feature | GET уже есть / донастроить | **13** | — (parity с витриной) |
| **15** | Staff: список заказов и статусы | 4 | вкладка Заказы | list + patch status | **12**, 10 orders | orders tab |
| **16** | Владелец: Статистика и Деньги | 5 | вкладки Stats/Money | aggregate read API | **15** | stats + money tabs |

Папки: `ProductSpecification/stories/NN-slug/` — заводить при `/story` + `/interview` (не раньше старта волны).

---

## Tier-guidance (для `/test-spec` каждой story)

Следовать `.cursor/templates/spec/tier-ladder.md`. Ниже — **черновик приоритета**, не готовые сценарии.

### 12 — Shell / roles

| Tier | Фокус |
|------|--------|
| **1** | Успешный вход staff; вкладки строго по роли (owner / manager / cashier); запретная вкладка недоступна |
| **2** | Неверный пароль/токен; выход сбрасывает сессию; deep-link на запретный tab → redirect |
| **3** | Копирайт ошибок, chip анимации, смена роли без полного logout UX |

### 13 — Catalog write

| Tier | Фокус |
|------|--------|
| **1** | Create / edit / soft-hide; manager+owner могут, cashier — 403; поля как `ProductSummary`; id slug immutable on edit |
| **2** | NEW/SALE взаимоисключение; валидация price/id; список после create вверху; empty search |
| **3** | Редкие validation edges, mobile-only layout asserts |

### 14 — Storefront sync

| Tier | Фокус |
|------|--------|
| **1** | Скрытый SKU не на витрине; правка цены/имени видна покупателю после refresh |
| **2** | Плашка NEW/SALE на карточке витрины; seed = admin source of truth |
| **3** | Кеш/стейл-тайминги, optimistic UI |

### 15 — Orders staff

| Tier | Фокус |
|------|--------|
| **1** | Список заказов; смена статуса по разрешённому переходам; все три роли видят заказы |
| **2** | Поиск; `cancelled` исключается из выручки позже; OpenAPI статусы `packing\|ready\|done\|cancelled` |
| **3** | Создание заказа из кабинета (OUT в mock — остаётся Tier 3 / out) |

### 16 — Stats / Money

| Tier | Фокус |
|------|--------|
| **1** | Owner видит вкладки; cashier/manager — нет; KPI/donut из не-cancelled заказов |
| **2** | Топы; лента приходов (без эквайринга) |
| **3** | Экспорт, Сбер, PDF |

---

## OpenAPI (точка встречи)

Решение на `/api-spec` story **12** (зафиксировать в interview 12):

- **Вариант A (предпочтительный старт):** расширить `store_api.yaml` тегами `staff` / `admin` + role-scoped security.
- **Вариант B:** отдельный `admin_api.yaml`, если staff-поверхность раздуется.

Минимум по волнам:

| Wave | Контракт |
|------|----------|
| 3 | `POST/GET staff session` (или reuse JWT + `role`), catalog `POST/PATCH` (+ `hidden`, `badge`), GET products учитывает hide для buyer |
| 4 | `GET /staff/orders`, `PATCH .../status` |
| 5 | `GET /staff/stats`, `GET /staff/money` (или один aggregate) |

Демо-пароль `staff` из мокапа — **не** prod; Wave 3 auth = реальный staff identity (Yandex/OTP/invite — решить в interview **12**).

---

## Порядок сессий (чеклист)

### Сейчас (после mock 11)

1. Закрыть ветку mock / merge по договорённости.
2. `/story 12` → interview (auth + shell) → … не смешивать с catalog write.
3. Параллельно можно черновить OpenAPI staff skeleton в api-spec **12**.

### Wave 3 delivery

```
12 interview → story-spec → test-spec → back+front shell
13 interview → story-spec → test-spec → back write + front catalog tab
14 interview (короткий) → test-spec → sync GET + React catalog
```

### Wave 4 / 5

Только после зелёного Wave 3 (или явного waiver на **14**, если витрина временно на старом seed).

---

## Что не делать

- Не писать один story-spec «на весь кабинет 11» для prod — дробить на 12–16.
- Не тащить Stats/Money в Wave 3 «заодно».
- Не подключать `fetch` в `site/js/admin-catalog.js` — мокап остаётся референсом.
- Не ставить «Админ» в публичный nav (D3).

---

## Связанные файлы

- Mock: `stories/11-admin-catalog/` (`interview.md`, `decisions.md`)
- Backlog: `stories.md`
- Delivery: `.cursor/skills/delivery-loop/SKILL.md`
