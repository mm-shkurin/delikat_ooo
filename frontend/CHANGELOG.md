# Changelog

## 2026-11-15

- Auth: HttpOnly `delikat_access` / `delikat_refresh` cookies; SPA keeps JWT out of web storage (memory hint only).
- Styles: single `styles/index.css` entry; page CSS lives under `styles/tokens-*.css`.
- README architecture map; `.env.example` uses placeholder host; Prettier config; `no-undef` lint.
- Catalog live WS path comes from `BACKEND.catalog.live`; browser globals via `shared/browser/dom`.
- Staff admin: roster ACL, catalog editor, categories reorder, orders board, owner analytics.
- Categories panel aborts in-flight reloads on unmount; catalog property filters reuse staff form options.
- CI runs the full `npm run ci` lane (lint + vitest + vite build).

## 2026-11-05

- Checkout retries reuse the same `Idempotency-Key` until the order is accepted.
- Catalog count label uses Russian plural rules (`21 товар`, `22 товара`).
- A failed product card can be closed. Loading more products is aborted when filters change.
- Catalog errors no longer tell the visitor how to start the developer stack.
