# Story 10 — carryover

- **Closed:** 2026-11-02 — hex cart/orders + React wire; smoke `:8000` session → fulfillment → add → order; acceptance checkout.
- **Contract:** `store_api.yaml` cart/* + POST /orders; no payment / history / email.
- **Open outside OpenAPI:** payment, order history, PDF/email, **admin catalog** (Must quality-debt closed 2026-11-06 — admin may start).
- **Quality debt plan:** Must done; Nice still open — B4 alembic path hack, C1/C2/C6 tokens/scoped/CSS size, D1/D2 httpOnly cookies. See `_project_audit/sprint-check-2026-11-06-quality-debt-delta.md`.
- **From: sprint-check 2026-11-05:** Do not regress session-scoped idempotency, locked checkout (`FOR UPDATE` + build order from locked cart), UUID-only `delikat_session` (middleware + ensure/require).
- **From: sprint-check 2026-11-06:** Adapters must not import `application` (session cookie helpers live in `adapters/http`). Guest `Depends(require_shop_session)` is not a DB session — probe regex fixed (A1). Cart mutations use `mutate` + `FOR UPDATE`. JWT still in `localStorage` until Nice D. Project grades neither GitVerse nor test-case criteria.
