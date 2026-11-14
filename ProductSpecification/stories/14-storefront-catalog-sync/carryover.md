# Story 14 — carryover

- **From: spec wave (2026-11-12):** story-spec + skeptic accept; api-spec live-only in `store_api.yaml`; test-spec T1=9 / T2=8. Hide ≡ `product_not_found`; panel «товар не найден» only on 404; stale open panel / poll / SSE OUT.
- **Do not regress:** staff catalog write (**13**); buyer DTO without `hidden`; buyer sort enum **09**; no auto-purge of cart lines added before hide.
- **Next:** story 14 front+back done. Panel «товар не найден» and `?product=` deep link are live. Image rebuild via `docker compose build` is blocked on this Docker Desktop (invalid dockerfile request); frontend runs from the bind mount.
