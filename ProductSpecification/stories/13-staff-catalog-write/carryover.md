# Story 13 — carryover

- **From: spec wave (2026-11-11):** story-spec + skeptic accept; api-spec in `admin_api.yaml`; test-spec T1=10 / T2=15. Sort SALE→NEW→TOP→null; SALE was/%; anonymous media GET; no category filter; hide row+dialog; create image required / edit keep|replace.
- **From: backend delivery (2026-11-11):** `StaffCatalogService` + Postgres blob; routes list/create/patch/image + media; alembic `0007`. pytest staff_catalog 14 green. Docker rebuild pending when Desktop is up (`cd infra; docker compose up -d --build backend`).
- **Do not regress:** cashier catalog write 403 + no tab; manager=owner write; slug/`created_at` immutable; buyer GET still shows hidden until **14**; `site/` static.
- **From: frontend delivery (2026-11-11):** live Catalog panel + editor; staff catalog API client; SALE was/% + TOP; refactor split editor fields / `catalogAdmin.css`.
- **Next:** Docker rebuild + browser smoke (`/admin/catalog`); then story **14** (buyer hide / vitrina).
