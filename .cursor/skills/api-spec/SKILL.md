---
name: api-spec
description: >-
  Generate or update OpenAPI for Delikat store API. Use when extending backend
  contract or /api-spec for a story.
disable-model-invocation: true
---

# /api-spec

## Delikat

- Master file: `ProductSpecification/api-specs/store_api.yaml`
- Per-story table: `ProductSpecification/stories/NN-*/endpoints.md`
- MVP mindset: минимум эндпоинтов, snake_case, `/api/v1/`, суммы integer RUB
- Отход от YAML — правка в том же коммите, что и код бэка/фронта

## Workflow

1. Read story folder spec + `01`/`02` interview
2. Update `endpoints.md` then `store_api.yaml`
3. Update `ProductSpecification/api-specs/README.md` mapping if UI fields change

Template reference: AdaptiveTutor `.claude/templates/spec/api-spec-template.md`
