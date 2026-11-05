# Journey — SMS → Yandex OAuth pivot

### 2026-11-01 — Auth model replaced (adaptive-tutor port)
- Type: decision
- Note: Phone/SMS OTP removed from `backend/` and `store_api.yaml`. Auth is **Yandex OAuth** (same flow as adaptive-tutor/textery): `GET /api/v1/auth/oauth/yandex/start` → callback → `POST /api/v1/auth/oauth/exchange`, plus `/auth/refresh`, `/auth/logout`, `GET /me` with `email` + `display_name`. Redis for oauth state + JWT revocations; Postgres `accounts` (migration `0002_yandex_accounts`).

### 2026-11-01 — Local dev without Yandex
- Type: quirk
- Note: Set `OAUTH_PROVIDER=fake` in `backend/.env` (adaptive-tutor pattern). Tests force `fake` + `DATABASE_URL=…delikat…:5434/delikat`. Copy `JWT_*` / `YANDEX_*` from `../adaptive-tutor/backend/.env` for real OAuth; do not commit secrets.

### 2026-11-01 — Spec drift after pivot
- Type: surprise
- Note: `progress.md` still titles story «SMS» and marks 07.1–07.5 `[x]`, but implementation no longer matches `07_BackendAuthSms.md` / interview SMS decisions. `api-spec` checkbox still `[ ]` though YAML auth paths were rewritten. Next pass: align story-spec + interview + frontend delivery with OAuth.

### 2026-11-01 — Postgres / Alembic on shared machine
- Type: mistake
- Note: Merging adaptive-tutor `.env` can point `DATABASE_URL` at wrong DB and leave `alembic_version` on foreign revision (`0005`). Use delikat DB on host `:5434`; `alembic upgrade head` through `0002_yandex_accounts`. Helper: `backend/scripts/fix_alembic_version.py` (dev only).

### 2026-11-02 — Profile fields + guest session reset HTTP
- Type: decision
- Note: `accounts.avatar_url`; Yandex `default_avatar_id` → avatars.yandex.net URL; `profile_name` override for `display_name`. `ProfileService.rename`, `POST /api/v1/sessions/reset` in hex app. Docker compose `backend` service = mock-api (catalog only) until hex wired into compose — profile/PATCH need local uvicorn hex or future compose service.
