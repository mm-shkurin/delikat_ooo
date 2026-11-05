# Interview — 08 React: лендинг и каталог по Store API

**Статус:** закрыто для story-spec.  
**Prod:** `frontend/`. **Reference:** `site/` (не prod API).

## Scope

**IN:**

- Vite + React + react-router; features `landing`, `catalog` (как adaptive-tutor/textery layout).
- API: `frontend/src/shared/api/backend/catalogApi.js` + paths/bodyGuards.
- Endpoints: catalog GET ×3; `VITE_API_BASE`; credentials include.
- UI parity with `site/`; «Показать ещё»; fulfillment on landing + catalog (shared store).
- Vitest на query mapper / view logic.

**OUT Wave 1:** prod fetch in `site/js`; cart/order API (10).

## Key Decisions

- `DECISION:` MSW or mock server until hex backend 09.
- `DECISION:` no `PRODUCTS` in React — server list + «Все» client-side.
- `DECISION:` cart overlays local/mock until 10.

## Check Notes

- `npm run dev` vs `site/` on 8767 side-by-side.
