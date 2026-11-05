# Notes — профиль Yandex OAuth · backend

## Модель `accounts`

| Колонка | Назначение |
|---------|------------|
| `provider_name` | Снимок **display name из Yandex** при последнем входе (историческое имя поля). |
| `profile_name` | Пользовательское имя (override); если NULL — в API `display_name` = `provider_name`. |
| `avatar_url` | URL аватара Yandex; обновляется при входе, не меняется PATCH /me. |

## Yandex Login API

При `fetch_identity`: `default_email`, имя (`real_name` / `display_name` / ФИО), `default_avatar_id` →  
`https://avatars.yandex.net/get-yapic/{id}/islands-200`.

## HTTP

- `GET /api/v1/me` → `UserProfile` (+ optional `avatar_url`).
- `PATCH /api/v1/me` body `{ "display_name" }` → 200 или 422 `invalid_display_name`.
- `POST /api/v1/sessions/reset` → 204, новый guest cookie (cart story 10).

## Этап

Логично в **07.4+** (auth HTTP); миграция `0003_account_avatar`.
