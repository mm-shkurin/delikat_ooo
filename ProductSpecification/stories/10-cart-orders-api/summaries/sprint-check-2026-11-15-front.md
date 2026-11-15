# Sprint-check 2026-11-15 — front

### 2026-11-15 — GitHub + no test-cases
- Type: decision
- Note: User scoped `/sprint-check frontend` to GitHub `origin` (not GitVerse) and told us not to hunt test-cases. Gate = live stand + release on `main`.

### 2026-11-15 — HttpOnly JWT (Nice D1)
- Type: decision
- Note: Exchange/refresh set `delikat_access` / `delikat_refresh` HttpOnly cookies; JSON body is only `token_type` + `expires_in_sec` (no JWT strings). SPA keeps `{ expiresAtMs }` in memory only; `authorizedRequest` uses `credentials: 'include'` without Bearer from JS.

### 2026-11-15 — Stage A front 2.5
- Type: quirk
- Note: Auditor held **2.5 / 3.0** (confirmation). Ceiling vs 3.0: features→widgets chrome imports, thin RTL (mostly mappers + one OrderCard), historical git author typo. Report: `_project_audit/sprint-check-2026-11-15-front.md`.

### 2026-11-15 — Docker bake on OneDrive
- Type: quirk
- Note: `docker compose up -d --build frontend backend` can fail with OneDrive “invalid file request”; restart-only works. Rebuild when bake context is clean.
