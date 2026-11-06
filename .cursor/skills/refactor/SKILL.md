---
name: refactor
description: >-
  Post-green refactor for Delikat: split fat files, smells, no behavior change.
  Use when /refactor or after delivery Verify before Done.
disable-model-invocation: true
---

# /refactor

**Mandatory** after implement is green and **before** marking the story/stage Done —
separate commit from the feature commit (Automatica / AdaptiveTutor discipline).

## When

- `/backend-delivery` or `/frontend-delivery` finished Verify (tests green).
- User says `/refactor` on current branch.

## Read first

- `.cursor/guidelines/coding-rules.md`
- `.cursor/guidelines/coding-detail.md` (back) and/or `frontend-rules.md` (front)
- Diff of the feature commit(s) on this branch vs base

## Do

1. List smells in **touched** files only (unless a dependency blocks the split):
   - file > ~200 lines
   - function > ~30 lines / mixed concerns
   - layer leaks (framework in usecase/domain; fetch in components)
   - duplicated blocks ≥ 3
   - god modules / wire helpers without names
2. Refactor **without** changing observable behavior.
3. Re-run the same Verify commands from the delivery skill (pytest / vitest / contract).
4. **Separate commit** — message like `refactor(NN): split X / extract Y` — never squash into the green feature commit by amending unless user asks.
5. If nothing to fix — say so in one line; still leave a note in the session report (`refactor: n/a — files under limits`).

## Do not

- Add features, rename public API without need, drive-by reformat of untouched trees.
- Skip Verify after structural moves.
