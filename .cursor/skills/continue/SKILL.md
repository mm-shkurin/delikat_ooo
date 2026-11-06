---
name: continue
description: >-
  Продолжить историю Деликат: progress.md, один work unit, обновить stories.md.
  Use when resuming or /continue.
disable-model-invocation: true
---

# /continue

## Workflow

1. **Identify** — номер / имя / пусто → `stories.md` или последний `progress.md`.
2. **Promote** — Backlog → In Progress при первом шаге.
3. **Read** `progress.md` (создать по `.cursor/templates/workflow/progress-format.md` если нет).
4. **Execute ONE work unit** — первый `[~]` или `[ ]`.
5. **Update** progress + колонки в `stories.md`.
6. **Commit** путями.
7. **Stop** — один чекбокс за вызов.

## Dispatch

| Checkbox | Skill / действие |
|----------|------------------|
| `interview` | `/interview` |
| `story-spec` | `/story-spec` |
| `api-spec` | `/api-spec` |
| `spec-skeptic` | `/spec-skeptic` (mode `spec`) |
| `test-spec` | `/test-spec` — до implement |
| `implement` (front) | `/frontend-delivery` → `frontend/` (gate: Tier 1 UI) |
| `implement` (back) | `/backend-delivery` (gate: Tier 1 API; 07 → этап 07.N) |
| `07.1` … `07.5` | `/backend-delivery 07.N` — один чекбокс в progress |
| `refactor` | `/refactor` — отдельный коммит после green |
| `check` | browser / pytest по AC / Tier 1 |
| `contract tests` | `python scripts/check_api_contract.py` + pytest |
| `progress + stories.md update` | закрыть историю |

## Report

Шаг `[x]`, следующий `[ ]`, одна фраза для пользователя.  
`Дальше: /continue` · при необходимости `/clear-session`.
