# Story 09 — backend delivery summaries

### 2026-11-02 — Hex catalog shipped
- Type: decision
- Note: Catalog in `usecase/catalog` + `PostgresCatalogStore`; Alembic `0004_catalog` seeds 16 SKU via `catalog_seed.py` reading `FIXTURES_DIR` or repo `api-specs/examples`. Docker image sets `FIXTURES_DIR=/fixtures`.
