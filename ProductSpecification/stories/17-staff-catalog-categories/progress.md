# Story 17 — Категории каталога

Волна: Wave 3. После **13** и **14**.

## Spec

- [x] interview — `interview.md` (sources skeptic: start)
- [x] story-spec — `17_StaffCatalogCategories.md` + `_Notes.md`
- [x] api-spec — `endpoints.md` + `admin_api.yaml` + правка `store_api.yaml`
- [x] spec-skeptic — accept
- [x] test-spec — `tests/` T1=10, T2=14, T3=5

## Front (frontend/)

- [x] implement
- [x] refactor — staff-guards вынесены из `bodyGuards.js`
- [x] check — вкладка, создание, порядок, сокет, пустая категория, узкое окно
- [x] live smoke 2026-11-15 — Docker :5173/:8000; create `smoke17` → витрина «Смок 17» + empty copy → delete

## Back (backend/)

- [x] implement
- [x] refactor — n/a, файлы короче лимита
- [x] contract tests — pytest usecase 15 + `check_api_contract.py` (0 missing)

## Close

- [x] progress + stories.md update
- [x] live smoke close — admin categories CRUD + buyer sidebar (seed restored to 6)
