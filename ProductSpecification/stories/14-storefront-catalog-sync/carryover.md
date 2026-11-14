# Story 14 — carryover

- **From: spec wave (2026-11-12):** story-spec + skeptic accept; api-spec live-only in `store_api.yaml`; test-spec T1=9 / T2=8. Hide ≡ `product_not_found`; panel «товар не найден» only on 404; stale open panel / poll / SSE OUT.
- **Do not regress:** staff catalog write (**13**); buyer DTO without `hidden`; buyer sort enum **09**; no auto-purge of cart lines added before hide. Panel copy stays `товар не найден` and is not the cart sentence `Товар не найден.`
- **From: frontend delivery (2026-11-14):** deep link is `?product=<id>` (`#sale` stays the hash). Detail GET lives in the search effect so StrictMode abort retries. Leaving the product layer clears `?product=`. `docker compose up --build` from this OneDrive tree still fails (`invalid file request`); images were built from a temp copy. Vite on the bind mount needs `compose restart frontend` after edits.
