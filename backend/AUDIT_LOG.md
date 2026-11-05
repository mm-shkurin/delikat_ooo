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
