---
name: delivery-loop
description: >-
  Рабочий цикл Деликат — две полосы, test-spec + refactor, site/ и backend/
  на одном дереве. Use at session start or «что дальше».
disable-model-invocation: true
---

# /delivery-loop

Как доставляются истории в **Деликат**. Полосы: `/backend-delivery` и `/frontend-delivery`.
Prod UI — `frontend/` (React). Референс — `site/`. Backend — hex `backend/`.

Качество кода — **ворота**, не «потом»: guidelines + test-spec (Tier 1) + отдельный refactor-коммит.

## Режим доставки

```
/story → /interview → /story-spec (+ /api-spec для API) → /spec-skeptic
      → /test-spec          # Tier 1–3 в stories/NN/tests/
      → реализация (backend/ и/или frontend/)  # только после Tier 1 для полосы
      → Verify (pytest / vitest / contract / browser)
      → /refactor           # отдельный коммит; n/a только если файлы в лимитах
      → docker compose up -d --build (infra/) если dev через Docker
      → progress.md + stories.md
```

Между кусками: `/clear-session` → New Chat → `/continue`.

Полный AdaptiveTutor red/green по слоям — **не** обязателен; usecase-тесты с fakes и Vitest logic — да.

## Quality gates (обязательно)

| Gate | Артефакт / действие |
|------|---------------------|
| Coding rules | `.cursor/guidelines/coding-rules.md` + `coding-detail.md` / `frontend-rules.md` — **прочитать до кода** |
| Test-spec | `/test-spec` → `stories/NN/tests/` с разрешёнными Tier; implement только Tier 1 (+2) |
| Size | файлы ≲ 200 строк; hooks/экраны — см. frontend-rules |
| Refactor | `/refactor` отдельным коммитом после green |
| Sprint | `/sprint-check` перед сдачей волны (не замена refactor) |

Mock-only волны (как admin в `site/`): interview → mock → stop; **test-spec** перед переносом в `frontend/` / hex.

## Роли

**Человек** — границы истории, бренд, финальный контент, порядок «готово».

**Сессия** — ведёт историю до учёта; останавливается на интервью, принятой спеке и test-spec.

Две сессии могут идти параллельно: `backend/` и `frontend/`/`site/` не пересекаются; коммит **путями**.

## Wave 1–2 (закрыты) / Wave 3+

Параллельный план Wave 1: `ProductSpecification/PARALLEL-WAVE-1.md`.  
Кабинет: `ProductSpecification/WAVE-3-ADMIN.md` — mock **11** done; prod старт **12**.

## Точка встречи

`ProductSpecification/api-specs/store_api.yaml` — фронт по mock/YAML; бэк правит YAML вместе с кодом.

## Коммит

```
git commit -m "feat(NN): ..." -- frontend backend ProductSpecification
git commit -m "refactor(NN): ..." -- frontend backend   # отдельно после /refactor
```

Не смешивать feature и refactor в одном коммите.

## Проверка мокапа

```bash
cd site && python -m http.server 8767
```

Desktop + mobile; Playwright MCP — по AC.

## Как читать сессию

Старт: этот файл → `/test-spec` если спека готова → `/frontend-delivery` или `/backend-delivery`.  
«Что дальше» → `stories.md` + `progress.md`.  
Конец куска → `/clear-session`.
