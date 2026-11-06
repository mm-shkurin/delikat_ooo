# Story 12 — carryover

- **Back (2026-11-06):** implement+refactor done — `/api/v1/staff/*`, migration `0006`, usecase tests green. Contract tests still open.
- **Front (2026-11-06):** `/admin` shell + Employees (list/assign) + ACL tabs; Yandex gate (no demo password); vitest ACL/view green. Browser smoke vs live staff still open.
- **From: 11:** mock ACL/UI in `site/admin/`; no public «Админ» nav (D3); demo password `staff` must not ship in prod UI.
- **Bootstrap:** `STAFF_OWNER_EMAILS` in env (not UI). Fake OAuth: `demo@example.test` when code=`demo`.
- **Do not regress:** owner never assignable/removable via cabinet; manager → cashier only; role only from backend after Yandex.
