# Notes — 08 React frontend

## Warnings

### Technical
- **Не** патчить `site/js` для prod API.
- Эталон структуры: `../adaptive-tutor/frontend/src` или `../textery/frontend/src`.

## Suggestions

- MSW handlers from `store_api.yaml` for parallel work without backend.
- Dev stack: `infra/docker-compose.yml` — mock API (`backend`) + Vite frontend + `site` ref.

## Technical Notes

- Static assets: copy/serve from `site/assets` into `frontend/public` during bootstrap.
