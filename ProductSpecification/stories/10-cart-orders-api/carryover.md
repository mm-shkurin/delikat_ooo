# Story 10 — carryover

- **Closed:** 2026-11-02 — hex cart/orders + React wire; smoke `:8000` session → fulfillment → add → order; acceptance checkout.
- **Contract:** `store_api.yaml` cart/* + POST /orders; no payment / history / email.
- **Open outside OpenAPI:** payment, order history, PDF/email. Staff cabinet **12–17** delivered in `main` (mock **11** remains `site/` reference).
- **Quality debt plan:** Must done; Nice — D1 HttpOnly JWT **done** (2026-11-15); still open B4 alembic path, residual C/smells, D2 CSRF beyond SameSite=Lax. See `_project_audit/sprint-check-2026-11-15-front.md`. Independent audit: `_independent_audit_2026-11-16/`.
- **From: sprint-check 2026-11-05:** Do not regress session-scoped idempotency, locked checkout (`FOR UPDATE` + build order from locked cart), UUID-only `delikat_session` (middleware + ensure/require).
- **From: sprint-check 2026-11-06:** Adapters must not import `application` (session cookie helpers live in `adapters/http`). Guest `Depends(require_shop_session)` is not a DB session — probe regex fixed (A1). Cart mutations use `mutate` + `FOR UPDATE`. Project grades neither GitVerse nor test-case criteria.
- **From: sprint-check 2026-11-15 front:** Do not put JWT strings back into SPA memory/web storage or into exchange/refresh JSON. Auth cookies stay HttpOnly; SPA may keep only `expiresAtMs`. Stage A front held 2.5 — next 3.0 blockers are features→widgets chrome and RTL depth, not cookies.
- **From: session 2026-11-16:** OneDrive Desktop needs pin (`attrib +P` / Always keep on this device) or bake fails with `invalid file request`; after pin, `compose --build` from repo path OK. Live fake-OAuth cookie auth re-verified PASS (`/me`, `/staff/me` owner, refresh, logout).
