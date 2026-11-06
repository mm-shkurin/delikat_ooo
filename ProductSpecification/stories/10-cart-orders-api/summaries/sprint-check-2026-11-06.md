# Sprint-check 2026-11-06

### 2026-11-06 — Stage 0 override
- Type: decision
- Note: User: fix Stage 0 allowed; **do not grade GitVerse/git or test-cases** for this project. Gate = live Docker stand only (`5173`, `/catalog`, `8000/health`).

### 2026-11-06 — Stage A held at 2.5
- Type: decision
- Note: Back+front auditor ≥2.5 confirmed. Fixes included session cookies in adapters, domain `can_checkout`/street/`InvalidQuantity`, catalog `StoreUnavailable`, CORS PUT; frontend storeChrome → `app/`, eslint-react, focus trap, nav dedupe. JWT-in-localStorage left as interim.

### 2026-11-06 — Stage B scores
- Type: quirk
- Note: Consistency+smells both **0/1** (regression probes). `ARCH-BOUNDARY-3` false-positive on `Depends(require_shop_session)`. Report: `_project_audit/sprint-check-2026-11-06-full.md`. Git-docs/testing skipped by project policy.

### 2026-11-06 — GitHub origin
- Type: decision
- Note: `origin` = `https://github.com/mm-shkurin/delikat_ooo.git`; conventions from textery in `CONTRIBUTING.md` + `.memory-bank/steerings/development-conventions.md`.
