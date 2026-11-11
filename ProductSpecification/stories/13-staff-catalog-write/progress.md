# Story 13 — Staff catalog write

Ветка: (создать при delivery; сессия interview на текущей).  
Волна: Wave 3. После **12**.

## Spec

- [x] interview — `interview.md`
- [x] story-spec / Notes — `13_StaffCatalogWrite.md` + `_Notes.md` (skeptic accept)
- [x] api-spec — `endpoints.md` + `admin_api.yaml` (staff catalog + media)
- [x] test-spec — `tests/` Tier 1–2 (+ tier3)

## Delivery

- [x] backend write + Postgres image — usecase fakes T1+T2; HTTP staff catalog + media; migration `0007`
- [x] frontend live Catalog tab — list/create/edit/hide/badge + SALE %; vitest/ci/contract green
- [ ] check / smoke (Docker Desktop engine offline — `cd infra; docker compose up -d --build`)

## Out → other stories

- Buyer hide / vitrina sync → **14**
- Categories CRUD + sort → **17**
