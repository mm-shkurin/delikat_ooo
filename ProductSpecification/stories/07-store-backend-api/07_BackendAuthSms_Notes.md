# Notes — 07 Hex auth

> **Deprecated (2026-11-02):** ниже SMS/OTP — до pivot; источник правды — [07_BackendAuthSms.md](./07_BackendAuthSms.md) (Yandex OAuth).

## Warnings

### Technical
- Эталон слоёв: `../adaptive-tutor/backend/usecase/account`, `backend/adapters`, `backend/application`.
- Прототип `backend/app` (монолит) **не** повторять.

## OAuth (актуально)

- JWT TTL: `ACCESS_TOKEN_EXPIRE_MINUTES`, `REFRESH_TOKEN_EXPIRE_DAYS` в env.
- Handoff/state TTL: `OAUTH_HANDOFF_TTL_SECONDS` (120), `OAUTH_STATE_TTL_SECONDS` (600).
- Трекинг: [progress.md](./progress.md), этапы — [07_BackendAuthSms.md](./07_BackendAuthSms.md#этапы).
