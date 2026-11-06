# Story 10 — carryover

- **Closed:** 2026-11-02 — hex cart/orders + React wire; smoke `:8000` session → fulfillment → add → order; acceptance checkout.
- **Contract:** `store_api.yaml` cart/* + POST /orders; no payment / history / email.
- **Open outside OpenAPI:** payment, order history, PDF/email, admin catalog (start **after** `.memory-bank/tasks/quality-debt-plan.md`).
- **Quality debt plan:** `.memory-bank/tasks/quality-debt-plan.md` + kickoff `.memory-bank/tasks/NEW-CHAT-quality-debt.md`.
- **From: sprint-check 2026-11-05:** Do not regress session-scoped idempotency, locked checkout (`FOR UPDATE` + build order from locked cart), UUID-only `delikat_session` (middleware + ensure/require).
- **From: sprint-check 2026-11-06:** Adapters must not import `application` (session cookie helpers live in `adapters/http`). Guest `Depends(require_shop_session)` is not a DB session — probe regex can false-positive. JWT stays in `localStorage` until httpOnly work. Project grades neither GitVerse nor test-case criteria.
