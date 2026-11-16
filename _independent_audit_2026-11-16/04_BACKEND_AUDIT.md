# Backend audit

## Architecture snapshot

```
domain → usecase → adapters → application
```

Наблюдение: usecase **не** импортирует FastAPI вне тестов (`usecase/tests/*` используют TestClient — ок для HTTP smoke). Порты каталога/корзины/staff разделены по пакетам. Это соответствует CLAUDE.md.

## Size (~150–190 LOC hotspots)

| Lines | File |
|------:|------|
| ~188 | `adapters/http/staff_catalog_router.py` |
| ~184 | `usecase/staff_catalog/validation.py` |
| ~164 | `adapters/db/cart_store.py` |
| ~153 | `adapters/db/models.py` |
| ~152 | `usecase/cart/service.py` |

Правило «≲200 строк» в целом держится лучше, чем в sprint-check ноября-06. `models.py` всё ещё multi-aggregate (judgment FAIL в sprint-check).

## Data / correctness (vs quality-debt Must)

| Item | Debt plan | Факт 2026-11-16 |
|------|-----------|-----------------|
| B1 catalog filter in SQL | Must | **DONE** — `catalog_store.list_products` строит SQL subquery + count/limit/offset |
| B2 cart RMW lock | Must | **DONE** — `cart_store` `with_for_update()`; staff orders тоже |
| B3 DTO out of usecase | Must | Частично / judgment — sprint-check всё ещё ругал HTTP status в usecase |
| B4 alembic `sys.path.insert` | Nice | **OPEN** — `ARCH-PATH-HACK` FAIL |

Quality-debt документ не отражает, что B1/B2 уже в коде.

## Auth & session

- Guest: `delikat_session` HttpOnly SameSite=Lax.
- User/staff: `delikat_access` / `delikat_refresh` HttpOnly SameSite=Lax (`auth_cookie.py`).
- `deps.bearer_token`: cookie **or** Authorization Bearer.
- Fake OAuth для local — подтверждено тестами.

## Security gaps

1. **CSRF:** в коде backend **нет** double-submit / CSRF token. Поза = SameSite=Lax. Документировано во frontend README как trade-off. Для cookie-authenticated `POST/PATCH/DELETE` staff это остаточный риск (особенно если когда-нибудь ослабят SameSite или появятся subdomain attack surfaces).
2. **Redis Lua / alembic `text()`:** sprint-check SEC-* (часть FP) — не пересматривалось глубоко.
3. Staff ACL живёт в usecase staff* — хорошо; дублирование writer ACL отмечалось в sprint-check smells.

## Tests

- ~21 `test_*.py` под `usecase/tests` (+ HTTP cookie/validation suites).
- Сильная сторона: tier-тесты staff orders/catalog.
- Слабая: мало чистых adapter HTTP suites вне usecase; acceptance staff отсутствует.

## WebSocket

`catalog_router` обслуживает live signal (story 17). Кадр только после category write — согласовано со спекой. Контрактное оформление — см. `03_API_AND_CONTRACT.md`.

## Вывод

Backend — самая зрелая полоса. Долг сместился с «не работает» на «гигиена + CSRF policy + alembic packaging + doc sync».
