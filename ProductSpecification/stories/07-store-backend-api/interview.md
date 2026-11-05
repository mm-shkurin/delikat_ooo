# Interview — 07 Бэкенд: каркас и вход (Yandex OAuth)

**Статус:** закрыто для story-spec и реализации.  
**Волна:** Wave 1 backend.

## Delivery (этапы)

| Этап | Фокус |
|------|--------|
| [07.1](./07_BackendAuthSms.md#этапы) | application, Postgres, Redis, Alembic init, CORS |
| [07.2](./07_BackendAuthSms.md#этапы) | domain, ports, OAuth SignIn, fake provider, pytest |
| [07.3](./07_BackendAuthSms.md#этапы) | JWT, refresh, Redis revocations, DB `accounts` |
| [07.4](./07_BackendAuthSms.md#этапы) | HTTP OAuth + `/me` + sessions reset |
| [07.5](./07_BackendAuthSms.md#этапы) | guest cookie `delikat_session` |

DoD: [07_BackendAuthSms.md](./07_BackendAuthSms.md#этапы). Чеклисты: [progress.md](./progress.md).

## Scope

**IN:**

- Hex layout (`backend/README.md`, adaptive-tutor)
- CORS: Vite `5173` + ref mock `8767`, credentials
- Yandex OAuth (+ `OAUTH_PROVIDER=fake` для dev)
- JWT access/refresh; `GET/PATCH /api/v1/me`
- Guest `delikat_session` middleware; `POST /api/v1/sessions/reset`
- JSON errors `{ code, message }`

**OUT Wave 1:**

- catalog (**09**), cart/orders (**10**)
- production-only vendor lock-in без port `OAuthProvider`
- SMS / phone OTP (заменено OAuth pivot)

## Decisions

- **Auth provider:** Yandex OAuth hex port; fake для CI/local.
- **Profile:** `display_name` редактируется пользователем; avatar/provider name из Yandex при входе.
- **Guest session:** cookie на анонимных ответах; merge с cart — story 10.
- **Rate limit** на OAuth start — Tier 2, не блокер Wave 1.

## HTTP (subset 07)

| Method | Path |
|--------|------|
| GET | `/api/v1/auth/oauth/yandex/start` |
| GET | `/api/v1/auth/oauth/yandex/callback` |
| POST | `/api/v1/auth/oauth/exchange` |
| POST | `/api/v1/auth/refresh` |
| POST | `/api/v1/auth/logout` |
| GET/PATCH | `/api/v1/me` |
| POST | `/api/v1/sessions/reset` |

Полная таблица store API: [endpoints.md](./endpoints.md), YAML — `store_api.yaml`.
