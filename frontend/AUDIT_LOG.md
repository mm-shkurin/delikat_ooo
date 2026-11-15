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
## Iteration 6 — Score: 2.0 / 3.0 — 2026-11-15 — f827fb6
### Fixed Issues:
- (none — fresh /sprint-check audit)
### Outstanding Blockers:
- JWT in localStorage; no hook/component tests; CI skips vite build
- CHANGELOG stale; CSS megaliths; PROPERTY_OPTIONS + failure-mapper duplication
- storeChrome imports features; weak eslint; large UI modules
- useCategoriesPanel reload without AbortController; git author typo
## Iteration 7 — Score: 2.0 / 3.0 — 2026-11-15 — 30b7a3f
### Fixed Issues:
- AbortController on categories reload; shared PROPERTY_OPTIONS
- analyticsFailure delegates to ordersFailure; CHANGELOG; CI npm run ci
### Outstanding Blockers:
- JWT localStorage; mapper-only tests; storeChrome→features
- CSS megaliths; panels without abort; OrderCard duplicate keys
## Iteration 8 — Score: 2.0 / 3.0 — 2026-11-15 — 31bae46
### Fixed Issues:
- AbortController on orders/analytics/admin boot; staffBodyGuards tests
- OrderCard keys; analyticsFailure removed; jsconfig; JWT note in README
### Outstanding Blockers:
- JWT localStorage; no RTL/hook tests; storeChrome→features; CSS megaliths
- reloadMembers without abort; useAdminPage size; expiresInSec unused
## Iteration 9 — Score: 2.0 / 3.0 — 2026-11-15 — 0b5bd8d
### Fixed Issues:
- proactive expiresAtMs refresh; CSS catalog split; OrderCard RTL; authSession test
### Outstanding Blockers:
- JWT still client-persisted; landing/admin CSS size; storeChrome→features
## Iteration 10 — Score: 2.0 / 3.0 — 2026-11-15 — Stage A stop
### Fixed Issues:
- migrate localStorage→sessionStorage on read; expanded authSession tests
### Outstanding Blockers:
- JWT still client-readable (XSS); storeChrome↔features inversion
- thin RTL coverage; no authorizedRequest tests; eslint no-undef off
- Stage A frontend stopped below 2.5 after 5+ iterations (cap progress)

## Iteration 11 — Score: 2.0 / 3.0 — 2026-11-15 — e438e87 (pre-fix baseline)
### Fixed Issues:
- (none — fresh /sprint-check --front zero-bias audit)
### Outstanding Blockers:
- JWT in sessionStorage; CSS mid-splits; storeChrome→features; thin RTL; no-undef off

## Iteration 12 — Score: 2.0 / 3.0 — 2026-11-15 — b95a0bc
### Fixed Issues:
- HttpOnly JWT cookies (backend+front); SPA memory expiry only; styles/index.css + tokens-*; DOC-ARCH/ENV; ENV helpers; paths.live; prettier; no-undef
### Outstanding Blockers:
- OAuth/refresh still materialize JWT strings briefly; reload without markCookieSession; features→app; thin RTL; CSRF note

## Iteration 13 — Score: 2.0 / 3.0 — 2026-11-15 — 5ceff77
### Fixed Issues:
- exchange/refresh keep only expires_in_sec; markCookieSession after getMe; authorizedRequest 401/renew tests; WS backoff
### Outstanding Blockers:
- JWT still in exchange JSON; features→app; privacy copy

## Iteration 14 — Score: 2.5 / 3.0 — 2026-11-15 — aaa8fc2
### Fixed Issues:
- omit JWT from exchange/refresh JSON; widgets/storeChrome; privacy copy; shared chrome context
### Outstanding Blockers:
- widgets→features; Prettier not in CI; thin RTL; UnexpectedBodyError body

## Iteration 15 (confirmation) — Score: 2.5 / 3.0 — 2026-11-15 — aaa8fc2+
### Fixed Issues:
- held ≥2.5; UnexpectedBodyError no longer retains body; shared useUnmountSignal; Prettier format:check in ci
### Outstanding Blockers:
- widgets→features residual; thin RTL; author email typo (historical)
