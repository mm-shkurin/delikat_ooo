# Story 09 — Бэкенд: каталог и фильтры

Delivery: **`/backend-delivery 09`** (один проход, без подэтапов). Skill: `.cursor/skills/backend-delivery/SKILL.md` § Story 09.

## Spec
- [x] interview
- [x] story-spec
- [x] spec-skeptic              # 2026-11-02 re-run: `accept` (MED HTTP 400 → test_catalog_http_validation)

## Back (backend/)
- [x] usecase catalog + ports
- [x] adapter db seed + repos (Alembic `0004_catalog`, fixtures examples)
- [x] adapter http GET catalog/*
- [x] usecase pytest
- [x] HTTP 400 validation (`test_catalog_http_validation.py`)

## Close
- [x] progress + stories.md update
- [x] pytest `backend/usecase/tests` — catalog suite green
- [x] smoke HTTP `:8000` — `GET /catalog/categories` (via compose backend)
