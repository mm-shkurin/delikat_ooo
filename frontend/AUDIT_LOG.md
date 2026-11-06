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

## Iteration 3 — Score: 2.0 / 3.0 — 2026-11-05 — edc41b2

### Fixed Issues:
- Checkout no longer drops the idempotency key before the cart reload. Bootstrap applies the server cart before the local fulfillment PUT. `setMode` restores the previous mode on failure. Dead `AppShell` was removed. Unit tests run in CI.

### Outstanding Blockers:
- Tokens stay in `localStorage`. `useStoreChrome` is still one hook that imports features.
- No ESLint. Tests are still pure functions.

## Iteration 4 — Score: 2.0 / 3.0 — 2026-11-05 — edc41b2

### Fixed Issues:
- None beyond iteration 3.

### Outstanding Blockers:
- `saveAddress` wrote the street before the server accepted it. The OAuth error screen replaced itself with `missing_code`. Cart quantity could go past 99.
- Same structural blockers as iteration 3.

## Iteration 1 — Score: 2.0 / 3.0 — 2026-11-06 — 3454b4b
### Fixed Issues:
- (none — first audit)
### Outstanding Blockers:
- useStoreChrome god hook (~380 LOC)
- shared→features imports (storeChrome, clearShopSession)
- JWT in localStorage
- eslint without react plugin; lint not in ci
- ProductGrid nested interactive
- dialogs without focus trap; authMocked naming
- no ErrorBoundary; unused PAGE_SIZE

## Iteration 3 — Score: 2.0 / 3.0 — 2026-11-06 — after first fix wave
### Fixed Issues:
- storeChrome moved to app/; signedIn; ProductGrid; eslint react; ErrorBoundary
### Outstanding Blockers:
- god hook residual; JWT localStorage; focus trap incomplete

## Iteration 4 — Score: 2.5 / 3.0 — 2026-11-06 — 94c3ac6
### Fixed Issues:
- hook split; focus trap; nav dedupe; URL sanitize; fav removed; auth naming
### Outstanding Blockers:
- JWT localStorage (accepted interim); CSS file size

## Iteration 5 (confirmation) — Score: 2.5 / 3.0 — 2026-11-06 — f2ee778
### Fixed Issues:
- (none this iteration)
### Outstanding Blockers:
- score held; JWT interim; storeChrome still composes features
