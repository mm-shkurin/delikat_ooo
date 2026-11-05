# Stories

## Done — Wave 1

| # | Story | Spec | Front | Back | Check | Notes |
|---|-------|------|-------|------|-------|-------|
| 08 | React: лендинг и каталог по API | x | x | · | x | acceptance catalog+checkout; 401→refresh; proxy :8000 |
| 07 | Hex: каркас и Yandex OAuth | x | · | x | x | spec-skeptic accept; smoke auth :8000; OAuth docs |
| 09 | Hex: каталог GET | x | · | x | x | pytest catalog + HTTP 400; smoke categories :8000 |

Wave 1 backend полоса (**07 + 09**) закрыта. Docker `infra/` поднимает hex **backend** на `:8000` (как adaptive-tutor). Полный mock cart — profile `mock-api` (:8002).

## Backlog — UI reference (site/)

| # | Story | Notes |
|---|-------|-------|
| 01–06 | Мокап-slices | AC = `site/`; закрываются при переносе в `frontend/` |

## Done — Wave 2 (backend)

| # | Story | Spec | Front | Back | Check | Notes |
|---|-------|------|-------|------|-------|-------|
| 10 | Cart/order API + React | x | x | x | x | smoke cart+orders :8000; story-spec done |

## Legend

- **Front** = `frontend/`
- **Back** = hex `backend/`
- `site/` не маркируется как Front done
