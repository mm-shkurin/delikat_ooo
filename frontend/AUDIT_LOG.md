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

## Iteration 2 — Score: 2.0 / 3.0 — 2026-11-05 — c872018

### Fixed Issues:
- Checkout keeps one idempotency key until the order is accepted. Plural labels, product-card close, and the catalog error copy were corrected in the first fix pass.
- After this score: the OAuth callback exchanges a code once, product loads abort the previous request, load-more failures keep the grid, the address sheet shows the error, and the login copy points at Yandex ID.

### Outstanding Blockers:
- `useStoreChrome` is still one large function and `shared/` still imports feature modules.
- Access and refresh tokens remain in `localStorage`.
- No ESLint config. Tests are still mapper-level. Dialog focus is not trapped.
- Frontend history is one initial commit plus fixes. Author email in git config contains a comma.
