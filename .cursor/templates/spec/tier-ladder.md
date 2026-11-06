# Tier ladder (Деликат)

Every scenario in `stories/NN-*/tests/*.md` carries a `Tier:` line.

## Consequence of failure

| Tier | Meaning | Implement? |
|------|---------|------------|
| **1** | Critical path / money / auth / data loss / wrong order | Yes — first |
| **2** | Important edge that still ships in this story | Yes — after Tier 1 green |
| **3** | Nice / rare / expensive — record only | **No code** — move to `tests/tier3/` |

## Caps (story-wide after consolidation by hand)

- Tier 1 ≤ **10** scenarios
- Tier 1 + Tier 2 ≤ **25**
- Overflow → Tier 3 with one-line degradation reason

## Marker

Under each `### N. Title` heading, exactly one line:

```text
Tier: 1
```

or during drafting:

```text
Tier: ?
```

Resolve all `?` before `/backend-delivery` or `/frontend-delivery` implement. Leftover `?` blocks coding.
