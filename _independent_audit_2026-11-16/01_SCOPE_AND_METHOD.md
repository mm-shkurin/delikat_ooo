# Scope & Method

## In scope

| Зона | Что смотрели |
|------|----------------|
| Product docs | `ProductSpecification/**`, `stories.md`, INTERVIEWS, WAVE-3, Brief, technology, PARALLEL |
| API | `store_api.yaml`, `admin_api.yaml`, `scripts/check_api_contract.py`, `paths.js` |
| Backend | hex layers, auth cookies, staff routers, catalog/cart stores, tests shape |
| Frontend | features/staff + storeChrome, auth session, styles, AUDIT_LOG |
| Infra | `infra/docker-compose.yml`, OneDrive bake notes in carryover |
| Quality history | `_project_audit/sprint-check-2026-11-15-*.md`, quality-debt-plan |
| Acceptance | `acceptance/tests` (2 frontend tests) |

## Out of scope

- Правки кода / коммиты / Docker rebuild
- Live browser E2E всего кабинета
- Полный `/sprint-check` Stage A loop (уже есть отчёты 2026-11-15)
- Сравнение пиксель-в-пиксель `site/` ↔ `frontend/`
- Prod Yandex OAuth credentials / секреты в `.env`

## Источники истины (приоритет при конфликте)

1. `ProductSpecification/stories.md` — карта закрытия
2. Story folder: `interview.md` → `NN_*.md` → `endpoints.md` → OpenAPI
3. Код + pytest/vitest
4. Carryover / summaries — исторический контекст (часто устаревает)
5. Brief / PARALLEL / quality-debt — часто **отстают**

## Ограничения этого аудита

- Первые explore на Sonnet 5.5 упали (weekly usage). Повтор: [Docs consistency audit](208df413-32f1-4585-9ab1-1052bc59c306), [Backend security smell audit](6060089d-a30c-4e6a-ac86-947b300a36ab). Frontend+infra Sonnet не переигрывался отдельным агентом — закрыт вручную + sprint-check 2026-11-15.
- Docker `--build` не прогонялся в этой сессии; опора на carryover + sprint-check gate notes.
- Грязное дерево: `M frontend/src/app/ErrorBoundary.jsx` + untracked probe JSON в `_project_audit/` — не разбиралось как баг.
