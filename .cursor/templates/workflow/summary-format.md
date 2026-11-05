# Journey Summary Format

Пишет только `/handoff`.

## When to write

- DECISION that future sessions need
- Surprise vs spec / mockup
- Mistake + how it was fixed
- Codebase quirk (path, CSS gotcha, asset naming)
- Brand/invariant that must not regress

## Entry

```markdown
### YYYY-MM-DD — <short label>
- Type: decision | surprise | mistake | quirk | invariant
- Note: <2-5 lines, concrete>
```

Idempotent: не дублировать тот же момент. Max ~8 строк на entry.
Не писать планы «что делать дальше» — для этого `progress.md`.
