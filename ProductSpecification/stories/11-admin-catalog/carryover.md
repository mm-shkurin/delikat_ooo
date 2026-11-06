# Story 11 — carryover

- **Mock wave (2026-11-06):** кабинет в `site/admin/` на ветке `feature/11-admin-catalog-mock`. Interview закрыт для мокапа.
- **Prod split (2026-11-06):** монолит 11 **не** идёт в один story-spec. План: [`WAVE-3-ADMIN.md`](../../WAVE-3-ADMIN.md) — stories **12–16**, waves 3–5, tier-guidance.
- **From: 09 / 10:** admin write / staff orders были outside OpenAPI; мокап — AC-источник.
- **Next sessions:**
  1. `/story 12` + `/interview` (staff auth + shell) — не `/story-spec 11`
  2. Затем 13 (catalog write), 14 (storefront sync); Wave 4 → 15; Wave 5 → 16
  3. OpenAPI staff: решить в interview **12** (extend `store_api.yaml` vs `admin_api.yaml`)
- **Nice / adjacent:** quality-debt Nice D (httpOnly JWT) до prod admin auth; B4 alembic path; C1/C2/C6 CSS tokens.
- **Do not regress (mock):** роль только через gate; кассир без Каталога/Статистики/Денег; без `fetch` в `site/js/admin-catalog.js`; без ссылки «Админ» в публичном nav витрины.
