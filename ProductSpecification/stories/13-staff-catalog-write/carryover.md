# Story 13 — carryover

- **From: spec wave (2026-11-11):** story-spec + skeptic accept; api-spec in `admin_api.yaml`; test-spec T1=10 / T2=15. Sort SALE→NEW→TOP→null; SALE was/%; anonymous media GET; no category filter; hide row+dialog; create image required / edit keep|replace.
- **Do not regress:** cashier catalog write 403 + no tab; manager=owner write; slug/`created_at` immutable; buyer GET unchanged (**14**); `site/` static.
- **Next:** `/backend-delivery 13` and/or `/frontend-delivery 13` (parallel; commit by paths). Gate: Tier 1 for that lane.
