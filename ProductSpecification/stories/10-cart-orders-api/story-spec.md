# Story 10 — Cart & orders (Wave 2)

**Status:** done  

**Contract:** `ProductSpecification/api-specs/store_api.yaml`  
**Interview:** [interview.md](./interview.md)

## Frontend acceptance

1. **Server cart** — badge, drawer lines, qty +/- via `GET/PATCH/DELETE /cart/*`; add via `POST /cart/items`.
2. **Fulfillment** — hero mode + address sheet → `PUT /cart/fulfillment`; chip reflects server cart; landing ↔ catalog via `sessionStorage` bootstrap then server truth.
3. **Add flow** — delivery without street → address sheet; API `409 address_required` opens sheet.
4. **Checkout** — `POST /orders` + `Idempotency-Key` (UUID); processing disables button; success → receipt layer (`OrderCreated`); error → message, stay in cart.
5. **Reset** — `clearShopSession()` + empty server cart after order or reset.

## Out of scope

Payment, order history, PDF/email.

## Dev backend

Hex `backend/` — Postgres cart + orders (story 10 Back). Optional legacy: `docker compose --profile mock-api`.

## Check

- `cd frontend && npm test && npm run ci`
- `python scripts/check_api_contract.py`
- Manual: add → checkout → receipt; idempotent retry same key
