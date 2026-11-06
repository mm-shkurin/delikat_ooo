# ProductSpecification — Деликат

Процесс: AdaptiveTutor-style **две полосы** + спека как точка встречи.

## Цикл

```
/story → /interview → /story-spec → /spec-skeptic → /test-spec
      → /frontend-delivery  (frontend/; mock — site/)
      → /backend-delivery   (backend/, api-spec)
      → /refactor           # отдельный коммит
      → /clear-session
```

Рамка: `.cursor/skills/delivery-loop/SKILL.md`.  
Guidelines: `.cursor/guidelines/coding-rules.md`.

## Скиллы

| Команда | Зачем |
|---------|--------|
| `/delivery-loop` | общий цикл, quality gates |
| `/test-spec` | BDD Tier 1–3 → `stories/NN/tests/` до кода |
| `/frontend-delivery` | React в `frontend/`; референс `site/` |
| `/backend-delivery [07\|07.N\|09]` | hex в `backend/`; этапы **07.1→07.5** |
| `/refactor` | post-green, отдельный коммит |
| `/story` | строка в Backlog |
| `/interview` | `interview.md` |
| `/story-spec` | спека + notes |
| `/api-spec` | `store_api.yaml`, `endpoints.md` |
| `/spec-skeptic` | проверка спеки |
| `/continue` | один work unit |
| `/handoff`, `/clear-session` | сессия |

## Файлы истории

```
ProductSpecification/stories/NN-slug/
  interview.md
  NN_Name.md          # после story-spec
  NN_Name_Notes.md
  progress.md
  endpoints.md        # для API-историй
  tests/              # после /test-spec (01_API, 02_UI, …)
```

## Wave 1 (параллельно)

См. **`PARALLEL-WAVE-1.md`**.

| История | Полоса |
|---------|--------|
| **08** | фронт: лендинг + catalog GET |
| **07** | бэк: каркас + SMS |
| **09** | бэк: каталог и фильтры |

## Wave 3+ (кабинет)

План: [`WAVE-3-ADMIN.md`](./WAVE-3-ADMIN.md).

| Wave | Истории | Полоса |
|------|---------|--------|
| mock | **11** | `site/admin/` референс (done) |
| **3** | **12** shell/roles → **13** catalog write → **14** sync витрины | React + hex |
| **4** | **15** orders staff | React + hex |
| **5** | **16** stats/money (owner) | React + hex |

## API

- `ProductSpecification/api-specs/store_api.yaml` — полный контракт; Wave 1 реализует подмножество

## UI

| Path | Role |
|------|------|
| `site/` | Reference mockup only |
| `frontend/` | Production React app |

Architecture: root `CLAUDE.md`.
