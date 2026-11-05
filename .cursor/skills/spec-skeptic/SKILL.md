---
name: spec-skeptic
description: >-
  Свежий скептик для спеки Деликат. Mode sources — до написания спеки.
  Mode spec — до закрытия story-spec. Use on /spec-skeptic or before marking
  spec done.
disable-model-invocation: true
---

# /spec-skeptic

ORCHESTRATOR. Один скептик со свежим контекстом — он не писал спеку.

## Invocation

```
/spec-skeptic <story>              # auto: нет спеки → sources, иначе spec
/spec-skeptic <story> sources
/spec-skeptic <story> spec
```

`<story>` — номер или папка под `ProductSpecification/stories/`.

## Steps

1. **Resolve** папку и mode. `sources` нужен `interview.md`. `spec` нужны story + notes.
2. **Spawn** один агент со свежим контекстом. Промпт:
   > Story folder: `<folder>`. Mode: `<mode>`.
   > Follow `.cursor/agents/spec-skeptic.md` exactly. Return only the report
   > shaped like `.cursor/templates/spec/spec-skeptic-report.md`.
   Не передавать черновик и аргументацию автора. На re-run — передать previous findings.
   Если отдельный agent type недоступен — generalPurpose с тем же промптом, read-only.
3. **Report** пользователю: verdict, HIGH → MED, `questions_to_user`. LOW — счётчик.
   Не отмазывать finding в отчёте; несогласие — после отчёта, решает человек.
4. **Route:**
   - `start` / `accept` → можно писать / закрывать спеку (`accept` с `not_verified` → как `revise`)
   - `revise-sources` / `revise` → правки по выбору пользователя, потом re-run
   - `block` → не драфтить и не закрывать шаг

Этот скилл **не** редактирует спеку сам.
