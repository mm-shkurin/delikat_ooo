# Changelog

## 2026-11-15

- Staff order list is capped at 500 newest rows; status updates take a row lock before the transition check.
- Staff image uploads read at most 2 MiB + 1 byte before validation.
- Staff catalog search escapes `%` / `_` in `ILIKE`.
- Staff ACL denials share one `Forbidden` base type; CI runs Ruff; `tzdata` is a declared dependency.
- README documents staff catalog/categories/orders/analytics and live catalog.

## 2026-11-05

- Guest session cookie is no longer replaced after the route sets `delikat_session`.
- Order idempotency lookup is limited to the current shopper. A foreign key returns 409 and does not reveal the other order.
- Checkout writes the order and clears the cart in one database transaction.
- A malformed `Idempotency-Key` is HTTP 400. Redis outages fail closed on revocation checks. Example JWT placeholders and non-local `fake` OAuth are refused at startup.
- `scripts/fix_alembic_version.py` binds the revision id instead of interpolating it.
