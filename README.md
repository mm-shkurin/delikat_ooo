# Деликат +

Финальный HTML-макет премиального мясного магазина (Омск).

## Запуск

### Docker (рекомендуется)

```powershell
cd infra
copy .env.example .env
docker compose up -d --build
```

| URL | Что |
|-----|-----|
| http://127.0.0.1:5173/ | Prod frontend (Vite) |
| http://127.0.0.1:8000/health | Hex Store API |
| http://127.0.0.1:8767/ | Референс `site/` |
| http://127.0.0.1:8080/ | Gateway (frontend + API + `/ref/` → site) |

Подробнее: [infra/README.md](infra/README.md).

### Локально без Docker

**Референс-мокап:** `cd site && python -m http.server 8767` → http://127.0.0.1:8767/

**Prod frontend:** `cd frontend`, `cp .env.example .env`, `npm install`, `npm run dev` (hex API на :8000).

Контракт: `python scripts/check_api_contract.py` (paths.js ↔ `ProductSpecification/api-specs/store_api.yaml`).

Env: копируй `infra/.env.example` → `infra/.env` (фейковые локальные значения, `OAUTH_PROVIDER=fake`). Реальные Yandex/JWT — только в gitignored `.env`.

## Структура

```
site/                 # референс-мокап (не prod) + assets
frontend/             # prod React (Vite)
backend/              # hex API (auth, catalog, cart, orders)
infra/                # docker compose, mock-api profile
acceptance/           # black-box tests
source/originals/     # исходные фото/лого
design/               # токены и заметки
ProductSpecification/ # истории, спеки, progress
.cursor/skills/       # delivery / interview / spec
```

## Доставка историй

См. `ProductSpecification/README.md`. Коротко: `/interview` → `/story-spec` → `/frontend-delivery` или `/backend-delivery` → `/continue`.

## Ветки и коммиты

Правила ведения — как в textery (см. [CONTRIBUTING.md](CONTRIBUTING.md) и
`.memory-bank/steerings/development-conventions.md`):

- работа в `feat/…`, `fix/…`, `chore/…`, `task/…` или `features/story-NN-…`;
- в `main` — слиянием ветки (не россыпью прямых коммитов);
- Conventional Commits, тема по-английски; один коммит — одно изменение;
- PR как поверхность ревью не используются — «почему» в сообщении коммита, гейты в CI.
