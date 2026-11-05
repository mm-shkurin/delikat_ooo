# Notes — профиль (Yandex OAuth) · frontend

## Источник данных

| Поле | Источник | UI |
|------|----------|-----|
| `avatar_url` | Yandex OAuth при входе | Аватар в nav / sheet входа; **не редактируется** |
| `provider_display_name` | Yandex при каждом входе | Подсказка «как в Yandex» (read-only) |
| `display_name` | PATCH `/api/v1/me` | Имя в интерфейсе; пользователь **может менять** |

## Клиент

- `features/auth/api/authApi.js` — `getMe`, `updateMe`, `logout`, OAuth.
- `features/auth/logic/profileView.js` — mapper snake_case → view.
- `shared/session/clearShopSession.js` — полный сброс перед Wave 2 (JWT + guest cookie + local fulfillment).

## Экран входа

- Не авторизован: «Войти через Yandex».
- Авторизован: аватар, `display_name`, форма переименования, **«Выйти»** — единственная кнопка полного сброса (JWT + guest cookie + корзина). Отдельной «Сбросить сессию магазина» нет.

## Clear session («Выйти»)

1. `POST /api/v1/auth/logout` (если есть Bearer).
2. Очистить `delikat.auth` (localStorage).
3. `POST /api/v1/sessions/reset` — новый `delikat_session`.
4. Очистить `sessionStorage` fulfillment; серверная корзина — через reset session / новый guest cookie.

Bearer-запросы: при **401** клиент один раз делает `POST /auth/refresh` и retry; иначе logout (`authorizedRequest`).

Не хранить аватар/имя только в React state без `GET /me` после callback.
