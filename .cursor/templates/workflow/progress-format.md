# progress.md — Delikat

```markdown
# Story NN — [Name]

## Spec
- [ ] interview
- [ ] story-spec
- [ ] api-spec          # если есть HTTP-контракт
- [ ] spec-skeptic
- [ ] test-spec         # /test-spec → stories/NN/tests/ (Tier 1–3)

## Front (frontend/)
- [ ] implement         # только после test-spec Tier 1 (UI)
- [ ] refactor          # /refactor — отдельный коммит; или [x] n/a
- [ ] check

## Back (backend/)
- [ ] implement         # только после test-spec Tier 1 (API)
- [ ] refactor
- [ ] contract tests    # когда есть HTTP paths

## Close
- [ ] progress + stories.md update
```

Markers: `[ ]` · `[~]` · `[x]` · `[S]` skipped.

Один чекбокс = один `/continue`.

Mock-only волна (только `site/`): Spec = interview (+ decisions); Front implement в `site/` без test-spec; test-spec обязателен перед переносом в `frontend/` / hex.
