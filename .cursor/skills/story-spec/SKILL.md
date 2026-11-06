---
name: story-spec
description: >-
  Сгенерировать спеку истории Деликат (NN_StoryName.md + Notes) из interview.md.
  Затем рекомендовать /spec-skeptic. Use when writing the story specification or
  /story-spec.
disable-model-invocation: true
---

# /story-spec

Спека до правок в `site/`. Вход — закрытый `interview.md`.

## Usage

```
/story-spec 1
/story-spec "…"
/story-spec
```

## Workflow

### Phase 1: Context

1. `BriefProductDescription.md`, `stories.md`
2. Папка истории: `stories/NN-slug/` (затем `stories/done/…`)
3. Обязательно `interview.md` — нет → стоп, сначала `/interview`
4. Затронутые файлы в `site/` и `design/tokens.json`
5. Именованный прецедент только по явной ссылке

Опционально до драфта: `/spec-skeptic <story> sources`.

### Phase 2: Draft

Шаблон: `.cursor/templates/spec/story-templates.md`.

Создать:

- `NN_StoryName.md` — ~50 строк, только поведение
- `NN_StoryName_Notes.md` — warnings / suggestions / technical
- `progress.md` если нет (`.cursor/templates/workflow/progress-format.md`)

Имя файлов: номер + PascalCase короткого имени (`01_CatalogFilter.md`).

### Phase 3: Self-check (лёгкий)

Перед показом пользователю:

- Каждый `DECISION:` из interview отражён в AC или Core Requirements либо явно в Notes как out
- Нет TBD в main file
- Suggestions не в main file

### Phase 4: Skeptic

Запустить `/spec-skeptic <story> spec` (fresh context).  
`accept` → можно отметить story-spec в progress.  
`revise` / `block` — не закрывать шаг; править по решению пользователя.

### Phase 5: Report

Пути файлов, ключевые AC, следующий шаг: `/test-spec` → затем `/frontend-delivery` / `/backend-delivery`.

## Rules

- Не выдумывать scope сверх interview
- Main file — только actionable facts
- Расхождение с текущим `site/` — либо gap в Notes, либо AC на изменение
