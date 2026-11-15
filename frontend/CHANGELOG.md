# Changelog

## 2026-11-15

- Staff admin: roster ACL, catalog editor, categories reorder, orders board, owner analytics.
- Categories panel aborts in-flight reloads on unmount; catalog property filters reuse staff form options.
- CI runs the full `npm run ci` lane (lint + vitest + vite build).
- Staff JWT moves to `sessionStorage` with proactive refresh from `expiresAtMs`; OrderCard RTL smoke + authSession unit tests.
- Catalog/landing/admin/staff CSS split under the ~200-line file budget.

## 2026-11-05

- Checkout retries reuse the same `Idempotency-Key` until the order is accepted.
- Catalog count label uses Russian plural rules (`21 товар`, `22 товара`).
- A failed product card can be closed. Loading more products is aborted when filters change.
- Catalog errors no longer tell the visitor how to start the developer stack.
