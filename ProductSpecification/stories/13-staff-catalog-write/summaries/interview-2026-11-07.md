# Interview — story 13 (2026-11-07)

### 2026-11-07 — catalog write interview
- Type: decision
- Note: Write only `/api/v1/staff/catalog/...` in `admin_api.yaml`. Staff list sees `hidden`; buyer GET hide → **14**. Badges NEW|SALE|TOP (wider than mock 11). Images in Postgres (bytes+ctype), not MinIO/S3. Categories create/sort → **17**; 13 = select existing only. `site/` stays static mock.

### 2026-11-07 — backlog 17
- Type: decision
- Note: Added story **17** Staff: категории каталога (CRUD + порядок) after 13; sort_order for vitrina.
