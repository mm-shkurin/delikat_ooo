---
name: story
description: >-
  Добавить историю в Backlog таблицы ProductSpecification/stories.md. Не пишет
  спеку — только строку. Use when adding/backlogging a story or /story.
disable-model-invocation: true
---

# /story

Добавляет строку в **Backlog**. Спеку пишет `/story-spec` (или `/continue`).

## Usage

```
/story "Покупатель видит состав умной упаковки"
/story
```

Голый номер — не имя; спросить, что имелось в виду.

## Workflow

### 1. Read map

Все три таблицы в `ProductSpecification/stories.md`.

### 2. Duplicate check

Совпадение имени (case-insensitive, без пунктуации) → сообщить строку и таблицу, стоп.

### 3. Quality gate — pain / opportunity

История = боль или возможность для пользователя.

- **Tech story** — названо решение («добавить localStorage»), а не исход. Переформулировать вокруг ценности. Чисто внутренняя уборка → не story (задача вне этой карты).
- **Part-story** — фрагмент чужого пути без самостоятельной ценности. Слить в историю с цельным исходом.

Показать паттерн → предложить формулировку → добавить только подтверждённое.

### 4. Size check

Одна история = один исход. Сигналы oversized:

- два исхода в имени («и»)
- umbrella «управлять X»
- несколько ролей/экранов с разными flow

Предложить split; добавить только подтверждённые имена. Каждый фрагмент снова через part-story + duplicate.

### 5. Add rows

- Номер = max `#` по всем таблицам + 1, zero-pad (`01`)
- Строка в Backlog: колонки Spec/Site/Check = `·`
- Больше ничего не создавать (ни папки, ни файлов)

### 6. Report

Номер, имя, коллизии. Дальше: `/continue N` или `/interview N`.

## Constraints

- Пишет **только** `stories.md`, только append в Backlog
- Не переименовывать существующие строки
- Формат колонок как у соседних рядов
