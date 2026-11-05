# Spec-Skeptic Report

Весь ответ — этот документ. Без прозы снаружи.

## Verdict

| Mode | Allowed |
|------|---------|
| `sources` | `start` · `revise-sources` · `block` |
| `spec` | `accept` · `revise` · `block` |

## Ambiguity smells

1. Subjective modifiers without threshold (`красиво`, `быстро`, `нормально`)
2. Open lists (`и т.д.`, `при необходимости`)
3. Ambiguous pronouns
4. Quantity without unit/bound
5. Passive voice hiding who/when
6. Undefined brand/product term
7. Unresolved `TBD` / `TODO` in a file about to be done
8. Happy path without empty / refuse / mobile case

## Return

```yaml
mode: sources | spec
verdict: start | revise-sources | accept | revise | block
findings:
  - severity: HIGH | MED | LOW
    where: <file:section>
    problem: <missing / invented / two-way>
    source: <which source, or "none">
    fix: <edit or question>
coverage:                 # spec mode only
  - item: <source requirement>
    status: met | unmet | not_verified
    evidence: <section or why unchecked>
questions_to_user: []
```
