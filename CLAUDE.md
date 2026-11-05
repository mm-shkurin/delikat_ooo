# CLAUDE.md — Деликат

Clean Architecture (как **adaptive-tutor**, **textery**, **absolute555**). Команды и стек — `ProductSpecification/technology.md`.

## Architecture

```
application → adapters → usecase → domain
```

Всё бэкенд-код только под `backend/`.

| Module | Role | Depends on |
|--------|------|------------|
| `backend/domain` | Entities, value objects, domain errors | — |
| `backend/usecase` | Application services, **ports** | domain |
| `backend/adapters` | HTTP, DB repos, SMS, JWT wiring | usecase |
| `backend/application` | FastAPI app, DI, lifespan | adapters |
| `acceptance/` | HTTP + browser black-box (когда появится) | — |

Зависимости **только внутрь**. Usecase не импортирует FastAPI/SQLAlchemy.

## Frontend (prod)

| Path | Role |
|------|------|
| `frontend/` | Vite + React + react-router (features, shared/api, vitest) |
| `site/` | **Статический референс-мокап** (HTML/CSS/vanilla). Не prod. Перенос в `frontend/` по `/frontend-delivery`. |

Клиент API: `frontend/src/shared/api/` — пути и тела по `ProductSpecification/api-specs/*.yaml`.

## Delivery

- `/delivery-loop` — две полосы
- `/backend-delivery` — hex + test-spec/usecase tests
- `/frontend-delivery` — mockup → React screen + API client

Контракт: `ProductSpecification/api-specs/store_api.yaml`.

## Reference repos (read-only)

- `../adaptive-tutor` — этalon hex backend + React frontend
- `../textery`, `../absolute555` — полноценный frontend (TS/React, features/*)
