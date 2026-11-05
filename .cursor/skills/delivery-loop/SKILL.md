---
name: delivery-loop
description: >-
  Рабочий цикл Деликат — две полосы (backend/frontend), спека и OpenAPI как точка
  встречи, site/ и backend/ на одном дереве. Use at session start or «что дальше».
disable-model-invocation: true
---

# /delivery-loop

Как доставляются истории в **Деликат**. Полосы: `/backend-delivery` и `/frontend-delivery`.
Prod UI — `frontend/` (React). Референс — `site/`. Backend — hex `backend/` (adaptive-tutor).

## Режим доставки

```
/story → /interview → /story-spec (+ /api-spec для API) → /spec-skeptic
      → реализация (backend/ и/или frontend/)
      → check в браузере / pytest
      → docker compose up -d --build (infra/) если dev через Docker
      → progress.md + stories.md
```

Между кусками: `/clear-session` → New Chat → `/continue`.

Полный TDD AdaptiveTutor (red/green по слоям) — **не** по умолчанию.

## Роли

**Человек** — границы истории, бренд, финальный контент, порядок «готово».

**Сессия** — ведёт историю до учёта; останавливается на интервью и принятой спеке.

Две сессии могут идти параллельно: `backend/` и `site/` не пересекаются; коммит **путями**.

## Wave 1 (Деликат)

Параллельно: **08** (фронт, catalog GET) + **07/09** (бэк, auth + catalog).  
План: `ProductSpecification/PARALLEL-WAVE-1.md`.

## Точка встречи

`ProductSpecification/api-specs/store_api.yaml` — фронт по mock до **09**; бэк правит YAML вместе с кодом.

## Коммит

```
git commit -m "..." -- site backend ProductSpecification
```

## Проверка фронта

```bash
cd site && python -m http.server 8767
```

Desktop + mobile ширина; Playwright MCP — по AC.

## Как читать сессию

Старт: этот файл → `/frontend-delivery` или `/backend-delivery 07` (или `07.2`, `09`).  
«Что дальше» → `ProductSpecification/stories.md` + `progress.md` истории.  
Конец куска → `/clear-session`.
