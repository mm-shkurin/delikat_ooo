# Carryover — Story 07 auth

From: 2026-11-01 Yandex OAuth pivot (post SMS delivery phases).

- **Auth:** Yandex OAuth hex port (not SMS). `OAUTH_PROVIDER=fake` for local; `yandex` + Yandex app credentials for prod.
- **Infra:** `redis` in `infra/docker-compose.yml`; `REDIS_URL` required in `backend/.env`.
- **Frontend:** `/auth/callback`, `startYandexLogin()` → proxied `/api/v1/auth/oauth/yandex/start`; session tokens unchanged shape (`access_token`, `refresh_token`, `expires_in_sec`).
- **Profile:** Yandex → `avatar_url` + `provider_display_name`; пользователь меняет только `display_name` (`PATCH /me`). Notes: [07_ProfileYandex_Notes.md](./07_ProfileYandex_Notes.md), front: [08_ProfileAuth_Notes.md](../08-store-api-frontend/08_ProfileAuth_Notes.md).
- **Clear guest session:** `POST /api/v1/sessions/reset` + client `clearShopSession()` для старта Wave 2.
- **Do not regress:** guest `delikat_session` middleware (07.5) stays on all anonymous responses.
- **Spec:** `07_BackendAuthSms.md`, interview, endpoints, progress — синхронизированы с OAuth (2026-11-02).
- **Open:** нет для backend loop 07/09/10 (spec-skeptic accept; pytest + catalog HTTP 400; smoke auth/cart/orders :8000).
- **Infra (2026-11-02):** `infra/` по образцу adaptive-tutor — hex `backend` на `:8000`, `mock-api` только profile `:8002`. Redis на хосте часто `REDIS_HOST_PORT=6391` (6379/6380 заняты). Документация: `infra/.env.example` + `backend/README.md` (OAUTH_PROVIDER / gateway :8080 / PUBLIC_BASE_URL).
- **Resume:** Wave 3 вне OpenAPI или visual parity — не backend 07.

