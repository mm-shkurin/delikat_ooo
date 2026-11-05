# Changelog

## 2026-11-05

- Guest session cookie is no longer replaced after the route sets `delikat_session`.
- Order idempotency lookup is limited to the current shopper. A foreign key returns 409 and does not reveal the other order.
- Checkout writes the order and clears the cart in one database transaction.
- A malformed `Idempotency-Key` is HTTP 400. Redis outages fail closed on revocation checks. Example JWT placeholders and non-local `fake` OAuth are refused at startup.
- `scripts/fix_alembic_version.py` binds the revision id instead of interpolating it.
