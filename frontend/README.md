# Деликат — frontend (prod)

React + Vite storefront and staff admin. Reference UI mockup: `../site/`.
API contract: `../ProductSpecification/api-specs/store_api.yaml`.

## Architecture

Feature-sliced module map (layers inward):

| Layer | Path | Purpose |
|-------|------|---------|
| app | `src/app/` | Shell, ErrorBoundary, store chrome composition |
| features | `src/features/<feature>/` | Pages, hooks, feature API, `logic/*View.js` |
| shared | `src/shared/` | HTTP client, backend paths, session, browser helpers |

Staff JWT access/refresh are **HttpOnly cookies** (`delikat_access` / `delikat_refresh`) set by the API on exchange/refresh. The SPA keeps only an in-memory expiry hint — token strings never enter JS memory, `localStorage`, or `sessionStorage`.

## Setup

```bash
cd frontend
cp .env.example .env
# set VITE_API_PROXY_TARGET to your local API (e.g. http://127.0.0.1:8000)
npm install
```

Images come from Docker: `infra/docker-compose.yml` mounts `site/assets` into `frontend/public/assets`. Without Docker, junction `public/assets` → `../site/assets`.

### Containerization

```powershell
cd infra
docker compose up -d --build frontend backend
```

App: http://127.0.0.1:5173/ — API health: http://127.0.0.1:8000/health

## Dev

```bash
npm run dev
```

- App: http://127.0.0.1:5173/
- `/api/v1/*` proxies to `VITE_API_PROXY_TARGET`
- Leave `VITE_API_BASE_URL` empty so cookies share the Vite origin

## State

Local React state and feature hooks only (`useState`, `useCatalogPage`, `useStoreChrome`).
No Zustand / Redux / TanStack Query until a cross-route cache is required.

## Decisions

- **Why HttpOnly cookies for JWT:** XSS in the SPA must not be able to read access/refresh tokens from `localStorage` / `sessionStorage` / JS memory. Exchange/refresh JSON exposes only `expires_in_sec`; browsers rely on cookies + `credentials: 'include'`. CSRF posture: SameSite=Lax on auth cookies (documented trade-off vs double-submit).
- **Why no shared state library yet:** one route owns its data; a cache layer is a trade-off we defer until cross-route duplication appears (see waivers on ARCH-STATE-*).
- **Why CSS lives under `styles/tokens-*.css` + one `index.css` entry:** keeps design literals in token files and avoids feature-level global CSS imports.

## Checks

```bash
npm test
npm run lint
npm run ci
python ../scripts/check_api_contract.py
```

`npm run ci` runs lint, vitest, and `vite build`. Selenium: `cd ../acceptance && pip install -r requirements.txt && pytest -m frontend`

## Branches and commits

See root [CONTRIBUTING.md](../CONTRIBUTING.md): prefixed feature branches, Conventional Commits, merge into `main`. This layer may also land small sprint-check fixes as direct commits on `main` when a solo session owns `frontend/` (documented policy for GIT-DIRECT-MAIN).
