# Quality debt session — 2026-11-06

### 2026-11-06 — Must quality debt closed via worktrees
- Type: decision
- Note: Backend (`features/quality-back`) and frontend (`features/quality-front`) landed in parallel worktrees then merged to `main`. Must A1–A5, B1–B3, C3–C5, E done. Nice B4/C1–C2/C6/D parked. Admin catalog unblocked.

### 2026-11-06 — cart mutate lock + SQL catalog list
- Type: invariant
- Note: Cart add/patch/delete/fulfillment go through `PostgresCartStore.mutate` (`SELECT … FOR UPDATE`). Checkout still locks inside `save_order`. Catalog filters/sort/limit/offset run in SQL via port `list_products(ProductListQuery)`.

### 2026-11-06 — wire DTOs stay in adapters
- Type: decision
- Note: `serialize_cart` lives in `adapters/http/cart_presenters.py`. `ProfileService.view` returns `UserProfileView`; HTTP maps to `UserProfileResponse`. Usecase no longer owns JSON dict shapes for those.

### 2026-11-06 — Docker redis host-port clash
- Type: quirk
- Note: Delikat redis publish on `127.0.0.1:6380` can collide with `adaptive-tutor-redis`. After a failed bind, redis may come up outside `delikat_default` → backend DNS `redis` fails until `docker compose up -d --force-recreate redis backend frontend`.
