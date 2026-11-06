# Story 10 — backend delivery summaries

### 2026-11-02 — Hex cart + orders
- Type: decision
- Note: `CartService` + Postgres `shop_carts` / `cart_lines` / `shop_orders`; HTTP cart/* and `POST /orders` with Idempotency-Key. Session via `delikat_session` cookie; `GET /cart` → 401 without cookie (middleware sets cookie on other routes first). Product prices from catalog repo.

### 2026-11-02 — Depends import slip
- Type: mistake
- Note: `orders_router.py` missed `Depends` import — broke container start until fixed; rebuild `docker compose up -d --build backend`.

### 2026-11-05 — Idempotency is per shopper
- Type: invariant
- Note: `find_order_by_idempotency(session_id, key)` — чужой key → `IdempotencyConflict` 409, не чужой заказ. `save_order` берёт `FOR UPDATE` на `shop_carts`, строит order из locked rows, чистит lines в той же транзакции.

### 2026-11-05 — Guest cookie must not clobber route cookie
- Type: mistake
- Note: `GuestSessionMiddleware` раньше всегда mint'ил новый UUID после route без входящей cookie и затирал `POST /sessions` / `ensure_shop_session`. Теперь: mint в `request.state` до route; set-cookie только если route сам cookie не выставил; cookie только UUID.

### 2026-11-06 — JWT placeholders kill Docker boot
- Type: quirk
- Note: `load_settings` отказывает `change-me-*-secret-change-me` и короткие/одинаковые secrets. `infra/.env` с примерами из старого `.env.example` → alembic/startup crash. Local: distinct ≥16-char secrets in `infra/.env` (file gitignored).
