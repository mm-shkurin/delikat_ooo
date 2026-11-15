# Story 11 — carryover

- **Mock wave (2026-11-06):** кабинет в `site/admin/` на ветке `feature/11-admin-catalog-mock`. Interview закрыт для мокапа.
- **Prod split (2026-11-06):** монолит 11 **не** идёт в один story-spec. План: [`WAVE-3-ADMIN.md`](../../WAVE-3-ADMIN.md) — stories **12–16**, waves 3–5, tier-guidance.
- **From: 09 / 10:** admin write / staff orders были outside OpenAPI; мокап — AC-источник.
- **From: merge (2026-11-15):** `feature/11-admin-catalog-mock` fast-forward в `main` (`ee6740b`). Prod **12–17** на месте.
- **Nice / adjacent:** quality-debt Nice D (httpOnly JWT); B4 alembic path; C1/C2/C6 CSS tokens.
- **Do not regress (mock):** роль только через gate; кассир без Каталога/Статистики/Денег; без `fetch` в `site/js/admin-catalog.js`; без ссылки «Админ» в публичном nav витрины.
