# Story 10 / Wave 2 — frontend delivery summary

### 2026-11-02 — Server cart + checkout (Wave 2)
- Type: decision
- Note: `useStoreChrome` wired to `cartApi` / `orderApi`; bootstrap `loadCartWithSession` + sync local fulfillment via `PUT /cart/fulfillment`. Checkout: `POST /orders` + receipt layer; errors `409` → address sheet or inline message. Mock-api: in-memory cart per `delikat_session`. Vitest: `fulfillmentPayload`, existing `cartView` / `orderView`.

### 2026-11-02 — Auth sheet: one exit control
- Type: decision
- Note: Убрана отдельная кнопка «Сбросить сессию магазина» в `StoreOverlays` AuthSheet. Полный сброс (JWT + guest cookie + корзина) — только **«Выйти»** у вошедшего пользователя (`resetShopSession`). Гостю отдельного reset в UI нет.

### 2026-11-02 — Story 08 wave close
- Type: decision
- Note: spec-skeptic `accept` (report in folder); `stories.md` 08 → Spec/Check `x`; acceptance green (5 tests). Хвост вне 08: sync `progress.md` 04–05, optional visual parity audit.

### 2026-11-02 — Closure queue (post Wave 2 code)
- Type: decision
- Note: Prod UI по контракту готов (08+10). Хвост: `/spec-skeptic` **07 → 09 → 08** (10 optional), check (docker rebuild, `npm ci`, `check_api_contract`, `backend pytest`, acceptance + checkout e2e), sync stale `progress.md` 04–05, wave close **08** в `stories.md`. `/continue` — **не** только front: первый `[ ]` может быть 07/09 skeptic или общий check.

### 2026-11-02 — Delivery-loop tail closed
- Type: decision
- Note: 401→refresh+retry; OAuth/gateway docs; catalog HTTP 400 tests; progress 04–06 + story-spec 10 done; skeptic 08 notes resolved; carryovers 07–10 updated. Acceptance against Docker hex `:5173`→`:8000`.

### 2026-11-05 — Checkout idempotency + OAuth callback race
- Type: mistake
- Note: `submitCheckout` must keep one `Idempotency-Key` until receipt path finishes; guard with a ref (`checkoutInFlight`), not only React `checkoutBusy`. `OAuthCallbackPage` must not list `chrome` in effect deps (re-runs exchange); strip failed code via `history.replaceState`, not navigate that clears error into `missing_code`.

### 2026-11-05 — Sprint-check Stage A plateau
- Type: decision
- Note: Zero-bias auditor held both layers at 2.0/3.0 (iters 2–5; target ≥2.5). Structural leftovers: `useStoreChrome` god-hook + `shared→features`, JWTs in `localStorage`, mapper-only tests, catalog filter-in-Python. Stage B not started. Gate FAIL without GitVerse remotes — scores provisional.
