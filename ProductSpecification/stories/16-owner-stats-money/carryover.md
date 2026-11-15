# Story 16 — carryover

- **From: delivery (2026-11-15):** `/admin/stats` + `/admin/money` owner-only. GET `/staff/stats` + `/staff/money`; all-time; live ≠ `cancelled`. S3 superseded: no demo bank extras; `inflow_rub` ≡ `revenue_rub`. Day buckets and Сегодня/Вчера in Asia/Omsk.
- **Do not regress:** manager/cashier no tabs + API 403. Cashier deep-link falls through. Donut center = sum of shown slices (≤8), not always full shop revenue. No realtime recompute after PATCH on orders tab.
- **Quirk:** Docker Desktop + OneDrive still breaks `compose --build` (`invalid file request`). Backend was refreshed via `docker cp` + restart when build failed; frontend volume mount is live without image rebuild.
