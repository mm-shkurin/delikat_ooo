# Story 14 — Storefront catalog sync

Ветка: (создать при delivery).  
Волна: Wave 3. После **13**.

## Spec

- [x] interview — `interview.md`
- [x] story-spec — `14_StorefrontCatalogSync.md` + `_Notes.md` (skeptic accept)
- [x] api-spec — `endpoints.md` + live-only semantics в `store_api.yaml` / json-contracts / README
- [x] spec-skeptic — accept (clean: no poll/SSE; stale open panel OUT)
- [x] test-spec — `tests/` T1=9 / T2=8 (+ tier3)

## Front (frontend/)

- [x] implement — panel «товар не найден» только на 404; deep link `?product=`
- [x] refactor — n/a (touched files under limits; fetch lives in the search effect)
- [x] check — vitest/ci; browser: deep link, badges, was, empty copy

## Back (backend/)

- [x] implement — после test-spec Tier 1 (API); list/detail/cart hide
- [x] refactor — n/a (touched files under limits; DTO assert in adapters/http/tests)
- [x] contract tests — usecase T1/T2 + `check_api_contract.py`

## Close

- [x] progress + stories.md update
