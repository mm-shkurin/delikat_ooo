# Audit Log

## Iteration 1 — Score: 1.5 / 3.0 — 2026-11-05 — no commit (not a git repository)

### Fixed Issues:
- None in this iteration. The score is the first zero-bias audit.

### Outstanding Blockers:
- No git history, branch model, or `.gitignore` inside `backend/`. `.env` and `.venv` sit beside the source.
- `GuestSessionMiddleware` overwrites the session cookie minted by the route.
- `find_order_by_idempotency` is not scoped to `session_id`.
- `create_order` commits the order and clears the cart in two transactions.
- Malformed `Idempotency-Key` becomes HTTP 500. Unhandled exceptions are not logged.
- `RedisRevocations.is_revoked` returns false when Redis is down. Refresh tokens are not rotated.
- `scripts/fix_alembic_version.py` interpolates the revision into SQL.
- `OAUTH_PROVIDER=fake` is accepted for any `PUBLIC_BASE_URL`. Example JWT placeholders are accepted.
- Catalog list is filtered in Python. Default description and default city are duplicated. Quantity and address length errors become generic 500s.
- Account/session/order HTTP tests are missing. `GET /health` does not check Postgres or Redis. No linter or CI.
- README layout omits cart/orders and points at another repo for secrets.

## Iteration 2 — Score: 2.0 / 3.0 — 2026-11-05 — a64b6e2

### Fixed Issues:
- Guest cookie is no longer overwritten; idempotency is session-scoped; order and cart clear share one transaction.
- Malformed idempotency keys are HTTP 400. Redis revocation checks fail closed. Placeholder JWT secrets and non-local fake OAuth are refused. Alembic stamp uses a bound parameter.
- After this score: refresh tokens rotate, `redirect_uri` is sent on the token POST, local-origin check uses the hostname, `POST /sessions` keeps an existing cart, `/health` probes Postgres and Redis, address fields are length-capped, and a conflicting idempotency insert returns the stored order.

### Outstanding Blockers:
- Backend history is still one large initial commit plus fixes. Author email in git config contains a comma; config was not changed.
- No Ruff config and no workflow that runs pytest from `backend/`.
- Catalog filtering still happens in Python. Default city `Омск` is still copied in three modules.
- `test_oauth_fake.py` still needs live Postgres and Redis.

## Iteration 3 — Score: 2.0 / 3.0 — 2026-11-05 — edc41b2

### Fixed Issues:
- Checkout locks the cart row, JWT secrets must be distinct and at least 16 characters, OAuth Redis errors become 503, and a non-empty existing session cookie is reused.

### Outstanding Blockers:
- Catalog still filters in Python. One seeded description is reused. CI still skips the two HTTP tests that need Postgres.
- Author email in the existing git config contains a comma. The initial commit stays one bulk import.

## Iteration 4 — Score: 2.0 / 3.0 — 2026-11-05 — edc41b2

### Fixed Issues:
- None beyond iteration 3. The audit ran on that commit.

### Outstanding Blockers:
- `save_order` can still persist a cart snapshot taken before the row lock.
- Seeded product descriptions are empty, so every card gets the same fallback text.
- CI ignores the live HTTP tests. No Ruff config.
- Git history is still a bulk import on `main` by `trape3977@g,ail.com`.
