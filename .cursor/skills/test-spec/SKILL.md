---
name: test-spec
description: >-
  BDD test specs for a Delikat story (API/UI/Security) with Tier 1–3.
  Use when /test-spec or before implement after story-spec.
disable-model-invocation: true
---

# /test-spec

Generate executable intent **before** code. Slim Delikat port of Automatica test-spec
(no hazard agents / consolidation bots — human-scale tiers).

## Usage

```
/test-spec 11
/test-spec admin-catalog
```

## Workflow

### 1. Context

Read: `ProductSpecification/stories.md`, target `stories/NN-*/`  
(`interview.md`, story `*.md`, `endpoints.md` if any), `BriefProductDescription.md`,  
`ProductSpecification/api-specs/store_api.yaml` sections this story touches.

If no story-spec yet — stop and run `/story-spec` first (mock-only waves may defer
test-spec until after interview+mock; then run test-spec before React/hex implement).

### 2. Author

Create `ProductSpecification/stories/NN-*/tests/` using  
`.cursor/templates/spec/test-spec-format.md`:

- Backend-heavy → `01_API_Tests.md` (+ `05_Security` if auth/roles)
- Frontend-heavy → `02_UI_Tests.md` (+ security if ACL UI)
- Both lanes → both files

Stamp `Tier: ?` on every scenario while drafting.

### 3. Tier

Read `.cursor/templates/spec/tier-ladder.md`. Resolve every `?`:

- Tier 1 = must-ship critical path (cap 10)
- Tier 2 = remaining must-implement edges (cap T1+T2 ≤ 25)
- Tier 3 → `tests/tier3/` only

`grep` for leftover `Tier: ?` — none allowed.

### 4. Progress

Add / check `[x] test-spec` in `progress.md` (Front and/or Back section as applicable).  
Do **not** start implement until Tier 1 scenarios exist for that lane.

### 5. Report

Path, file list, counts T1/T2/T3, next: `/backend-delivery` or `/frontend-delivery`.

## Rules

- No framework names in Gherkin steps.
- Do not implement tests or production code in this skill — specs only.
- Prefer fewer sharp scenarios over a laundry list.
