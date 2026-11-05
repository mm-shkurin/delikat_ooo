---
name: interview
description: >-
  Интерактивное интервью → interview.md для истории Деликат. Scope, страницы,
  контент, поведение, ограничения бренда. Use when creating story context or
  /interview.
disable-model-invocation: true
---

# /interview

Собрать контекст истории и записать `interview.md` — вход для `/story-spec`.

## Usage

```
/interview 1
/interview "Каталог: фильтр по виду мяса"
/interview
```

## Workflow

### Phase 1: Context (silent)

Сначала резолвить целевую историю (Phase 2), затем читать scoped:

1. `ProductSpecification/stories.md`
2. `ProductSpecification/BriefProductDescription.md`
3. Существующая спека истории (если есть)
4. Именованный прецедент — только конкретный `interview.md` / `decisions/*` другой истории, не sweep всех
5. Текущее состояние затронутых страниц: `site/index.html`, `site/catalog.html`, связанные css/js
6. `design/tokens.json`
7. Уже существующий `interview.md` / `tests` этой истории

Нет acceptance-suite — сказать явно; опираться на `site/` + story folders.

### Phase 2: Story selection

По имени/номеру из `stories.md`, или список.  
Если `interview.md` уже есть — спросить: перезаписать или пропустить.

### Phase 3: Interview

Формат раундов: `.cursor/templates/spec/interview-format.md`.

### Phase 4: Generate

Собрать ответы в `ProductSpecification/stories/NN-slug/interview.md`.  
Папку создать только если нет ни в `stories/`, ни в `stories/done/`.

### Phase 5: Confirm

Показать файл → «полно? правки?» → путь → следующий шаг `/story-spec` или `/continue`.

## Rules

- Не пропускать интервью и не выдумывать факты
- Сначала показать найденное, потом вопросы
- 1–3 вопроса за раунд; нерелевантные раунды skip
- Сохранять формулировки пользователя (`DECISION:`, `ACTION:`)
- Рукописный тон, без дублей из других interview.md
