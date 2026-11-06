# Frontend Rules — Деликат

Prod: `frontend/`. Reference mockup: `site/` (no prod API in `site/js`).

## Humble object

- Pure logic in `features/<feature>/logic/*` (and `*View.js` wire helpers).
- HTTP only in `features/<feature>/api/` + `shared/api/backend/*`.
- Screens/components: call logic + API; **no** direct `fetch`, no business validation regex in JSX.

## Structure

```
frontend/src/features/<feature>/
  api/
  logic/
  components/   # or pages owned by feature
frontend/src/shared/api/backend/   # paths, guards, http
```

- New OpenAPI path → `paths.js` + `store_api.yaml` in the same change (`check_api_contract.py`).
- Do not rename wire field names from the contract.

## Size

- Prefer components **≤ ~100 lines**; extract subviews when larger.
- Prefer hooks **≤ ~200 lines** (sprint ARCH-SIZE); split chrome / overlays / page data.
- Prefer CSS modules / feature-scoped sheets over one giant page CSS; use `design/tokens` / `tokens.css` — avoid raw hex sprawl.

## Mockup data

- Never hardcode mockup placeholder identity (emails, phones) as prod truth.
- Prices/names for demos come from API or clearly named fixtures.

## Testing

- Vitest for logic and API clients (`npm test`).
- Prefer testing pure functions / view-models over brittle full-page mounts.
- Acceptance (optional): `acceptance/` with `data-testid`; no class-based selectors.

## Browser globals

- Prefer `shared/browser/*` helpers over scattered `window` / `document` (quality-debt Nice still tracks remaining leaks).
