# Story 10 — backend delivery summaries

### 2026-11-02 — Hex cart + orders
- Type: decision
- Note: `CartService` + Postgres `shop_carts` / `cart_lines` / `shop_orders`; HTTP cart/* and `POST /orders` with Idempotency-Key. Session via `delikat_session` cookie; `GET /cart` → 401 without cookie (middleware sets cookie on other routes first). Product prices from catalog repo.

### 2026-11-02 — Depends import slip
- Type: mistake
- Note: `orders_router.py` missed `Depends` import — broke container start until fixed; rebuild `docker compose up -d --build backend`.
