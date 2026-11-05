# Audit Log

## Iteration 1 — Score: 2.0 / 3.0 — 2026-11-05 — no commit (not a git repository)

### Fixed Issues:
- None in this iteration. The score is the first zero-bias audit.

### Outstanding Blockers:
- No git history and no `.gitignore` in `frontend/`. `dist/` and `.env` are on disk.
- No ESLint, Prettier, or CI. `npm run ci` does not lint.
- `useStoreChrome` is one large function and `shared/` imports feature modules.
- Access and refresh tokens are stored in `localStorage`. Cart and checkout requests do not send the bearer token.
- Checkout mints a new `Idempotency-Key` on every click.
- `loadMore` can append a stale page. A failed product card has no close button.
- `formatShownCount` mishandles 21/22. Logged-in hero copy says «Вы в макете». Catalog errors tell the visitor to start Docker.
- Dialogs do not trap focus. Add-to-cart is not a keyboard control. Path builders do not encode ids.
- Tests cover mappers only. README still mentions MSW and `use*Screen.js`. No changelog.
