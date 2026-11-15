# Story 15 — carryover

- **From: delivery (2026-11-15):** `/admin/orders` for owner, manager, cashier. One GET on tab open; filter/search are client-side. Status select = current + `allowed_next`. Buyer snapshot on `POST /orders` (guest or signed-in); receipt body without name/email. Alembic `0008_order_buyer_snapshot`.
- **Do not regress:** bad/expired Bearer on checkout → 401, no guest fallback. Replay Idempotency-Key returns current staff status and frozen `message`. Done/cancelled have empty `allowed_next` and a disabled select. Stats/Money stay shells after a successful PATCH.
- **Quirk:** OneDrive reparse points break `docker compose --build` (`invalid file request`). Build backend from a temp copy outside OneDrive when needed.
