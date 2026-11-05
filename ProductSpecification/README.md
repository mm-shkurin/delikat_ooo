# ProductSpecification — Деликат

Процесс: AdaptiveTutor-style **две полосы** + спека как точка встречи.

## Цикл

```
/story → /interview → /story-spec → /spec-skeptic
      → /frontend-delivery  (site/)
      → /backend-delivery   (backend/, api-spec)
      → /clear-session
```

Рамка: `.cursor/skills/delivery-loop/SKILL.md`.

## Скиллы

| Команда | Зачем |
|---------|--------|
| `/delivery-loop` | общий цикл, две полосы |
| `/frontend-delivery` | UI в `site/` |
| `/backend-delivery [07\|07.N\|09]` | hex в `backend/`; story **07** — этапы **07.1→07.5** (см. skill) |
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
```

## Wave 1 (параллельно)

См. **`PARALLEL-WAVE-1.md`**.

| История | Полоса |
|---------|--------|
| **08** | фронт: лендинг + catalog GET |
| **07** | бэк: каркас + SMS |
| **09** | бэк: каталог и фильтры |

## API

- `ProductSpecification/api-specs/store_api.yaml` — полный контракт; Wave 1 реализует подмножество

## UI

| Path | Role |
|------|------|
| `site/` | Reference mockup only |
| `frontend/` | Production React app |

Architecture: root `CLAUDE.md`.
