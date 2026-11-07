# Story 12 — carryover

- **Closed (2026-11-07):** contract (`check_api_contract` + staff pytest 10) + browser smoke fake OAuth owner → shell/ACL/Employees assign pending → logout gate.
- **Bootstrap:** `STAFF_OWNER_EMAILS` in env (not UI). Fake OAuth: `demo@example.test` when code=`demo`.
- **Do not regress:** owner never assignable/removable via cabinet; manager → cashier only; role only from backend after Yandex; no public «Админ» nav (D3).
- **Next:** story **13** catalog write (panels in 12 are shell-only).
- **Quirk:** `docker compose --build` may fail on OneDrive Dockerfile reparse (`invalid file request`); live stack already had staff routes; frontend volume mount picks up code without rebuild.
