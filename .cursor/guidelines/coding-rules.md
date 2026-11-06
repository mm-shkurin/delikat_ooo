# Coding Rules — Core (Деликат)

Detail: `.cursor/guidelines/coding-detail.md`. Frontend: `.cursor/guidelines/frontend-rules.md`.

## Layers (backend)

```
domain ← usecase ← adapters / application
```

| Layer | May import | Must not |
|-------|------------|----------|
| `domain` | stdlib only | FastAPI, SQLAlchemy, HTTP, Redis |
| `usecase` | domain + ports (protocols) | FastAPI, SQLAlchemy, concrete adapters |
| `adapters` | usecase, domain | `application` (except wiring owned by application) |
| `application` | adapters, usecase | business rules |

Dependency direction: **inward only**.

## Limits (grader-aligned)

- Prefer files **≤ ~200 lines**; split when a second responsibility appears.
- Prefer functions **≤ ~30 lines** for orchestration; extract named helpers.
- Stateless API processes; durable state in Postgres / Redis as designed.

## Language

- Code identifiers: English.
- Product docs, interview, story specs: Russian OK.
