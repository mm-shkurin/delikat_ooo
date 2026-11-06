---
name: frontend-delivery
description: >-
  Фронтовая полоса Деликат — React/Vite в frontend/, test-spec Tier1, refactor.
  Референс site/. Use for /frontend-delivery.
disable-model-invocation: true
---

# /frontend-delivery

Парная полоса: `/backend-delivery`. Эталон UI: **`site/`** (read-only для prod). Prod: **`frontend/`**.

## Режим

```
interview → story-spec → [/api-spec] → /spec-skeptic → /test-spec (02_UI + tiers)
      → mockup parity (site/) если ещё нет
      → React screen + API client
      → vitest / ci / contract
      → /refactor (отдельный коммит)
      → check в браузере + docker rebuild
```

## Перед кодом (gate)

1. Прочитать `.cursor/guidelines/frontend-rules.md` и `coding-rules.md`.
2. `stories/NN/tests/02_UI_Tests.md` существует; Tier 1 разрешён (`Tier: ?` = стоп → `/test-spec`).
3. Реализовать **только** сценарии Tier 1, затем Tier 2; Tier 3 не кодить.

## Мокап

- Дизайн-истина: `site/*.html` + css/js.
- После переноса — правки UI в `frontend/src/features/*`, не в `site/` (кроме sync референса по договорённости).

## Контракт

- `shared/api/backend/` — paths + bodyGuards (гейт CI).
- `features/<feature>/api/` — клиенты; `logic/*View.js` — wire → UI.
- Экраны не импортируют `fetch` напрямую.
- MSW/mock до live hex backend.

## Алгоритм сессии

1. **Resolve** — story / первый Front `[ ]` в `progress.md`.
2. **Gate** — test-spec UI Tier 1 готов; иначе `/test-spec`.
3. **Implement** — scope чекбокса; humble object; size limits.
4. **Verify** — команды ниже; покрыть Tier 1 assert’ами где есть vitest/acceptance.
5. **Refactor** — вызвать `/refactor` (или выполнить его шаги); отдельный коммит.
6. **Docker** — `cd infra && docker compose up -d --build` при работе через Docker.
7. **Update** — `[x]` в progress; stories.md.
8. **Commit** feature paths — **до** refactor-коммита, не вместе.

## Check

- `cd frontend && npm test && npm run ci`
- `python scripts/check_api_contract.py`
- Dev: `npm run dev` (proxy `/api`)
- Сравнение с `site/` на 8767
- **Docker:** `cd infra && docker compose up -d --build` (правило `docker-rebuild-after-dev`)
- Selenium (опционально): `cd acceptance && python -m pytest -m frontend`

Коммиты:

```
git commit -m "feat(NN): ..." -- frontend ProductSpecification
git commit -m "refactor(NN): ..." -- frontend
```

**Не делать:** prod API в `site/js`; implement без test-spec; skip refactor без явного `n/a` в отчёте.
