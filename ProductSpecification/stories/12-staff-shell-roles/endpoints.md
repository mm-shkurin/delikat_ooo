# 12 Staff shell / roles — API Endpoints

Контракт: [`admin_api.yaml`](../../api-specs/admin_api.yaml)  
OAuth / JWT / logout — без изменений в [`store_api.yaml`](../../api-specs/store_api.yaml) (тот же Bearer).

| Method | Path | Who | Description |
|--------|------|-----|-------------|
| GET | `/api/v1/staff/me` | staff | Текущая staff-роль (chip / gate) |
| GET | `/api/v1/staff/members` | owner, manager | Список roster (`active` \| `pending`) |
| POST | `/api/v1/staff/members` | owner, manager | Назначить по email (registered → active bind; иначе pending) |
| PATCH | `/api/v1/staff/members/{member_id}` | owner, manager | Сменить роль (ACL) |
| DELETE | `/api/v1/staff/members/{member_id}` | owner, manager | Убрать из staff → `none` |

## ACL (сервер)

| Actor | Assign / PATCH role | DELETE target |
|-------|---------------------|---------------|
| owner | `manager` \| `cashier` only | `manager` \| `cashier` |
| manager | `cashier` only | `cashier` only |
| any | never `owner` | never target with role `owner` |

## Bootstrap

Первый / доп. `owner` — seed/env (ops), не этими ручками.

## Errors

`unauthorized` · `forbidden` · `validation_error` · `staff_not_found` · `owner_immutable`
