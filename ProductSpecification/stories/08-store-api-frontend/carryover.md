# Story 08 — carryover

- **Closed:** 2026-11-02 — spec-skeptic `accept`; acceptance catalog + story 10 checkout; Flow §6 / ProfileAuth notes synced (no «Сбросить сессию»).
- **Prod-hardening (closure queue):** `authorizedRequest` → `POST /auth/refresh` + one retry on 401, else logout.
- **Back column:** `·` — hex catalog via proxy; реализация в 07/09.
- **Optional later:** side-by-side visual parity audit `site/` vs `frontend/` (mobile); MSW для offline dev без Docker.
- **From: sprint-check 2026-11-05:** Checkout idempotency key + `checkoutInFlight` ref; OAuth callback single exchange (no `chrome` in effect deps). Still open for score: split `useStoreChrome` / stop `shared→features`, httpOnly refresh (not `localStorage`), ESLint wired in CI, focus trap on dialogs.
