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
| http://127.0.0.1:8000/health | Mock Store API |
| http://127.0.0.1:8767/ | Референс `site/` |
| http://127.0.0.1:8080/ | Gateway (frontend + API + `/ref/` → site) |

Подробнее: [infra/README.md](infra/README.md).

### Локально без Docker

**Референс-мокап:** `cd site && python -m http.server 8767` → http://127.0.0.1:8767/

**Prod frontend:** `cd frontend`, `cp .env.example .env`, `npm install`, `npm run dev` (нужен API на :8000 или mock из Docker).

Контракт: `python scripts/check_api_contract.py` (paths.js ↔ `ProductSpecification/api-specs/store_api.yaml`).

- `index.html` — лендинг (hero + умная упаковка)
- `catalog.html` — мясной каталог с карточкой товара

## Структура

```
site/                 # референс-мокап (не prod)
frontend/             # prod React app (Wave 1+)
backend/              # hex backend (Wave 1+)
  index.html
  catalog.html
  css/                # стили
  js/                 # скрипты
  assets/
    logo/             # логотип
    hero/             # hero-фото
    packaging/        # блок упаковки
    products/         # фото товаров
source/               # исходники и черновики
  originals/          # исходные фото/лого из корня
  unused-hero/        # неиспользуемые варианты hero
design/               # токены и заметки по дизайну
ProductSpecification/ # истории, спеки, progress (процесс доставки)
.cursor/skills/       # delivery / interview / spec скиллы проекта
skills/               # вспомогательные скиллы (не часть сайта)
llm/                  # черновик LLM-слоя (не часть сайта)
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
