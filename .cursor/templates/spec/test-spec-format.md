# Test-spec format (Деликат)

Files under `ProductSpecification/stories/NN-story/tests/`:

| File | When |
|------|------|
| `01_API_Tests.md` | Backend / contract story |
| `02_UI_Tests.md` | Frontend / admin UI story |
| `05_Security_Tests.md` | Auth, roles, IDOR-ish product rules |
| `06_Integration_Tests.md` | External SMS / payment when in scope |

Skip `03_Load` / `04_Infrastructure` unless `ExpectedLoad.md` or ops story exists — note `Load = n/a` in summary.

## Scenario shape

```markdown
### 1. Buyer sees catalog prices

Tier: ?

**Given** the store has published products  
**When** the buyer opens the catalog  
**Then** each card shows name and price in rubles
```

Rules:

- English titles; Gherkin steps; **product language** (no FastAPI/SQL/CSS class names in steps).
- One primary outcome per scenario; related assertions OK if same Given/When.
- Map interview business rules and explicit edge cases into scenarios.
- Prerequisites from story-spec → guard scenarios (missing token, wrong role, empty cart…).
- Money / SMS / mutate-then-retry → at least one re-run / duplicate-safe scenario when the story owns that operation.

## Prerequisite guards

For each prerequisite in the story Validation / Prerequisites table, add API **and** UI scenarios that the blocked actor cannot proceed.

## Security (when auth/roles)

Minimal rows when relevant:

- Wrong role cannot mutate (cashier vs owner)
- Missing / expired session → login or 401
- Cannot act on another user's order (when multi-user exists)

## After authoring

1. Stamp `Tier: ?` on every `###` scenario.
2. Resolve tiers per `tier-ladder.md` (comparative: critical path first).
3. Move Tier 3 bodies to `tests/tier3/<same-filename>.md`.
