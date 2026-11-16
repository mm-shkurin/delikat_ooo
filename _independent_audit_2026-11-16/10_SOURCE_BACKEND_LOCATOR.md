# Source appendix — backend locator

Agent: [Backend security smell audit](6060089d-a30c-4e6a-ac86-947b300a36ab)  
Status: success (composer). First Sonnet pass failed on weekly usage.

Итоги уже в `04_BACKEND_AUDIT.md` + F27/F28. Карта file:line:

## usecase → FastAPI

Prod usecase: **no match**. FastAPI только в `usecase/tests/*` harness.

## Staff ACL

- Policy: `domain/staff/role.py` — `can_manage_roster`, `can_write_catalog`, `assignable_by`
- Roster: `usecase/staff/service.py` — me / roster manager / assign / mutable target
- Catalog/categories writers; orders three roles; analytics owner-only
- HTTP: `adapters/http/errors.py` StaffForbidden → 403

## Cookie vs Bearer

- Cookies: `auth_cookie.py` delikat_access/refresh HttpOnly
- `deps.bearer_token` — Bearer **or** cookie
- Guest: `delikat_session` middleware
- Tests: cookie me + Bearer me both green

## CSRF / SameSite

- CSRF: **absent** under `backend/`
- SameSite=lax on access, refresh, guest session, signin_browser

## Locks

- Cart: `cart_store.py` `with_for_update()` on mutate/save_order
- Staff orders: `staff_order_store.py` `with_for_update()` on status

## Catalog load

- Storefront: SQL filter + count + limit/offset (`catalog_store.list_products`)
- Staff list: SQL + **`.limit(500)`**
- Categories: full small table

## WS live

- Route: `catalog_router.py` `/catalog/live`
- Hub: in-memory `CatalogLiveHub`
- Signal only from `staff_categories` (not staff_catalog SKU writes)

## Large modules (~LOC)

staff_catalog_router 188 · staff_catalog/validation 184 · auth_router 170 · cart_store 164 · models 153 · cart/service 152 · staff/service 148 · settings 142 · context 141 · analytics aggregate 140 · catalog_store 138 · staff_catalog/service 135
