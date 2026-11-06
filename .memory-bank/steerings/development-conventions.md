# Development Conventions

Ported from textery (Desktop), adapted for Деликат.

## Methodology

TDD/ATDD + Clean Architecture where the story loop applies. Story progress lives in
`ProductSpecification/stories/*/`. This Memory Bank holds cross-cutting facts, not
per-story checklists.

## Architecture

Clean Architecture, dependencies only inward:

```
backend/domain ← backend/usecase ← backend/adapters ← backend/application
```

Frontend is feature-based (`frontend/src/features/*`, `shared/`, `app/`).
`acceptance/` is black-box. Hex ports live in usecase; adapters implement them.
See root `CLAUDE.md` and `ProductSpecification/technology.md`.

## Git

- Integration branch: `main` (this repo is customer-facing on GitHub:
  `https://github.com/mm-shkurin/delikat_ooo.git`).
- Feature work: branch off `main` with a required prefix —
  `feat/…`, `fix/…`, `chore/…`, `task/…`, or `features/story-NN-…`.
- Land on `main` by merging the feature branch (not a pile of direct commits on
  `main`). Direct commits on `main` that predate this rule stay as history.
- **No pull requests as the review surface.** The commit message is the review
  surface: write *why*, not *what*. CI gates are the automated reviewer.
- Commit messages: Conventional Commits —
  `feat(scope):`, `fix(scope):`, `refactor(scope):`, `test(scope):`,
  `docs(scope):`, `style(scope):`, `chore(scope):`, `build(scope):`.
- Subject in English; body in RU or EN. One commit = one logical change.
  Behaviour change and refactor do not share a commit.
- Behaviour change ships with its test when the layer has a test suite for that path.

## Scope split

- `backend/` + `frontend/` — product delivery loop.
- `infra/` — Docker compose, env examples; rebuild after Dockerfile / lockfile /
  image changes (see `.cursor/rules/docker-rebuild-after-dev.mdc`).
- Shared docs (`ProductSpecification/`, root `README.md`) — coordinate; avoid
  concurrent edits from parallel back/front sessions.

## Parallel sessions: git worktrees

When backend and frontend sessions run at the same time, **do not share one working
tree**. Use `git worktree` so each session has its own directory and branch:

```bash
# frontend sibling, forked from the backend feature tip
git worktree add ../delikat_ooo-front -b features/<slug>-frontend features/<slug>
```

Sync only when one side needs the other's tip:

```bash
git merge features/<the-other-branch>
```

Remove when done: `git worktree remove <path>`.

## Hard limits

- **200 lines per file** (code, tests, styles, configs, scripts) — split by meaning.
- Do not delete tests or add blanket skips/ignores to go green.
- No mock/dummy logic pretending to be a finished feature.
