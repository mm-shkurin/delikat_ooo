# Changelog

## 2026-11-05

- Checkout retries reuse the same `Idempotency-Key` until the order is accepted.
- Catalog count label uses Russian plural rules (`21 товар`, `22 товара`).
- A failed product card can be closed. Loading more products is aborted when filters change.
- Catalog errors no longer tell the visitor how to start the developer stack.
