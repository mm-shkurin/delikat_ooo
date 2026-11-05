# Story 07 — Бэкенд: каркас и вход (Yandex OAuth)

Delivery: **`/backend-delivery 07`** или **`/backend-delivery 07.N`**. Runbooks: `.cursor/skills/backend-delivery/SKILL.md`.  
Спека этапов: [07_BackendAuthSms.md](./07_BackendAuthSms.md#этапы) (имя файла историческое; содержание — OAuth).

## Spec
- [x] interview
- [x] story-spec (этапы 07.1 … 07.5)
- [x] api-spec                    # auth subset в store_api.yaml (OAuth paths)
- [x] spec-skeptic              # 2026-11-02 re-run: `accept`

## Back (backend/) — один чекбокс = один `/backend-delivery 07.N`

- [x] **07.1** — каркас application (uvicorn, Postgres, Redis, Alembic init, CORS)
- [x] **07.2** — domain + ports + OAuth SignIn, fake provider, pytest (**без** HTTP)
- [x] **07.3** — JWT + refresh + DB repos + session/logout usecase
- [x] **07.4** — HTTP OAuth + `/me` + sessions reset
- [x] **07.5** — guest cookie `delikat_session`

## Close
- [x] все этапы 07.1 … 07.5
- [x] progress + stories.md update
- [x] pytest `backend/usecase/tests` (14 passed, local venv)
- [x] smoke HTTP `:8000` — fake OAuth → `/me`
