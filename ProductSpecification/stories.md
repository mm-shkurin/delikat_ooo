# Stories

## Done — Wave 1

| # | Story | Spec | Front | Back | Check | Notes |
|---|-------|------|-------|------|-------|-------|
| 08 | React: лендинг и каталог по API | x | x | · | x | acceptance catalog+checkout; 401→refresh; proxy :8000 |
| 07 | Hex: каркас и Yandex OAuth | x | · | x | x | spec-skeptic accept; smoke auth :8000; OAuth docs |
| 09 | Hex: каталог GET | x | · | x | x | pytest catalog + HTTP 400; smoke categories :8000 |

Wave 1 backend полоса (**07 + 09**) закрыта. Docker `infra/` поднимает hex **backend** на `:8000` (как adaptive-tutor). Полный mock cart — profile `mock-api` (:8002).

## Done — Wave 2 (backend)

| # | Story | Spec | Front | Back | Check | Notes |
|---|-------|------|-------|------|-------|-------|
| 10 | Cart/order API + React | x | x | x | x | smoke cart+orders :8000; story-spec done |

## Done — mock (Wave 3 reference)

| # | Story | Spec | Front | Back | Check | Notes |
|---|-------|------|-------|------|-------|-------|
| 11 | Мокап кабинета staff | mock | `site/` | · | x | `site/admin/` roles+tabs; prod → **12–16** |

План дробления: [`WAVE-3-ADMIN.md`](./WAVE-3-ADMIN.md).

## Backlog — Wave 3 (catalog staff)

| # | Story | Spec | Front | Back | Check | Notes |
|---|-------|------|-------|------|-------|-------|
| 12 | Staff: вход, роль, каркас вкладок | x | · | ~ | · | back Tier1 green (`/staff/*`); next front delivery |
| 13 | Staff: CRUD каталога (NEW/SALE, hide) | · | · | · | · | после 12; write API |
| 14 | Витрина = тот же каталог (hide/badges) | · | · | · | · | после 13 |

## Backlog — Wave 4 (orders staff)

| # | Story | Spec | Front | Back | Check | Notes |
|---|-------|------|-------|------|-------|-------|
| 15 | Staff: заказы — список и статусы | · | · | · | · | после 12; статусы packing…cancelled |

## Backlog — Wave 5 (owner analytics)

| # | Story | Spec | Front | Back | Check | Notes |
|---|-------|------|-------|------|-------|-------|
| 16 | Владелец: Статистика и Деньги | · | · | · | · | после 15; без эквайринга |

## Backlog — UI reference (site/)

| # | Story | Notes |
|---|-------|-------|
| 01–06 | Мокап-slices | AC = `site/`; закрываются при переносе в `frontend/` |

## Legend

- **Front** = `frontend/`
- **Back** = hex `backend/`
- `site/` не маркируется как Front done (исключение: **11** = mock-done)
