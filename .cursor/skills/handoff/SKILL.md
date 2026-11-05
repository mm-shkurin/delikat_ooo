---
name: handoff
description: >-
  Записать journey summary (решения, сюрпризы, quirk'и) для следующей сессии.
  Единственный writer summaries/carryover. Use before /clear-session or when
  something noteworthy happened.
disable-model-invocation: true
---

# /handoff

Сохранить то, что иначе потеряется при New Chat.

## Workflow

1. **Identify** историю (свежий `progress.md` / stories.md).
2. **Window** — обсуждение после последнего work-unit коммита.
3. **Triggers** — `.cursor/templates/workflow/summary-format.md`.
4. **Write or nothing** — append в `summaries/{slug}.md`; дубликаты skip; пусто → «nothing to record».
5. **Carryover** — если сценарий/блок закрыт (`[x]` на implement+check): quirk/invariant → `carryover.md` с `From: …`.
6. **Report** — файлы и entries, или nothing to record.

## Layout

| Artifact | Path |
|----------|------|
| Summary | `ProductSpecification/stories/NN-slug/summaries/{slug}.md` |
| Carryover | `ProductSpecification/stories/NN-slug/carryover.md` |

`/continue` только читает эти файлы.
