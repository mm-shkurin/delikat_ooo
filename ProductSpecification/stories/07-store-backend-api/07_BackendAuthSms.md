# Бэкенд: каркас и вход (hexagonal, Yandex OAuth)

> Историческое имя файла `07_BackendAuthSms.md`. Реализация — **Yandex OAuth** (pivot 2026-11-01), не SMS. См. [carryover.md](./carryover.md), [07_ProfileYandex_Notes.md](./07_ProfileYandex_Notes.md).

## Brief Description

Гексагональный бэкенд (как adaptive-tutor): domain/usecase для входа через Yandex и JWT, adapters для HTTP/DB/OAuth/Redis. Story **07** — только account/platform. Каталог (**09**) и cart/orders (**10**) — отдельные stories.

## Этапы

Порядок **обязателен** при поэтапной поставке; фактически закрыты одной полосой после pivot.

| # | Этап | Суть | Definition of Done |
|---|------|------|---------------------|
| **07.1** | Каркас application | Hex-скелет + Postgres + Redis | `uvicorn application.main:app`; Alembic init; CORS `5173` + `8767`, credentials; `/health` 200; каталоги **domain / usecase / adapters / application** |
| **07.2** | Domain + ports + OAuth usecase | Вход **без** HTTP | `domain/account`; port `OAuthProvider`, stores; `SignIn` start/callback/exchange с **fake** provider; pytest + fakes |
| **07.3** | JWT + refresh + DB repos | Токены и `accounts` | `TokenIssuer`, refresh/revocation (Redis); `PostgresAccountStore`; Alembic `accounts`; session refresh/logout usecases; pytest |
| **07.4** | HTTP adapter auth | OpenAPI auth subset | OAuth start (Set-Cookie `signin_browser`), callback (redirect на frontend с handoff `code`; query `error` → redirect с ошибкой, без exchange); exchange/refresh/logout; `GET/PATCH /me`; `{ "code", "message" }`; Bearer на `/me`, `/auth/logout` |
| **07.5** | Guest session cookie | Middleware + sessions API | Cookie `delikat_session` (HttpOnly, SameSite=Lax) на анонимных ответах; `POST /sessions` 201 + `session_id`; `POST /sessions/reset` 204; без merge cart (**10**) |

### Зависимости

```
07.1 ──► 07.2 ──► 07.3 ──► 07.4 ──► 07.5
  │
  └──► 09 Catalog (после 07.1; HTTP catalog после 07.4)
```

## Acceptance Criteria (story целиком)

- Структура: `domain/`, `usecase/account/`, `adapters/{http,db,oauth,cache,security}/`, `application/`.
- Usecase **не** импортирует FastAPI/SQLAlchemy.
- `OAUTH_PROVIDER=fake` для локальной разработки; `yandex` + credentials для prod.
- JSON errors `{ code, message }` как в OpenAPI.
- pytest: `usecase/tests/test_oauth_fake.py` (fake OAuth start → callback → exchange → `GET /me`).
- `GET /me`: поля `UserProfile` из OpenAPI (`avatar_url`, `provider_display_name` из провайдера; пользователь меняет только `display_name` через `PATCH /me`).
- CORS Vite + ref mock, credentials.
- Этапы **07.1 … 07.5** отмечены в [progress.md](./progress.md).
- Legacy SMS-схемы в `store_api.yaml` без paths — **вне scope 07** (pivot OAuth); paths auth/me/sessions — scope 07.

## Validation Rules

| Field | Rule |
|-------|------|
| `display_name` (PATCH /me) | 1–120 символов; иначе 422 `invalid_display_name` |
| OAuth handoff `code` | одноразовый; TTL **120 с** (`OAUTH_HANDOFF_TTL_SECONDS`, Redis); state cookie **600 с** (`OAUTH_STATE_TTL_SECONDS`) |
| `signin_browser` | HttpOnly; должен совпадать при exchange; иначе `invalid_request` |

## Core Requirements

- FastAPI только в `adapters/http`.
- Postgres — `accounts`; Redis — OAuth state, refresh revocations.
- Контракт story **07**: auth + `/me` + `/sessions*` paths в `ProductSpecification/api-specs/store_api.yaml` (не обязан чистить orphan SMS components).

## Delivery

| Команда | Действие |
|---------|----------|
| `/backend-delivery 07` | следующий открытый этап 07.N |
| `/backend-delivery 07.N` | один этап |
| `/continue 07` | тот же чекбокс, что backend-delivery |

Runbooks: `.cursor/skills/backend-delivery/SKILL.md` (этапы 07 — ориентир; код = OAuth).

## Reference

- Эталон слоёв: `adaptive-tutor/backend/`
- Профиль: [07_ProfileYandex_Notes.md](./07_ProfileYandex_Notes.md)
- Pivot: [summaries/yandex-oauth-pivot.md](./summaries/yandex-oauth-pivot.md)
