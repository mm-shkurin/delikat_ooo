# Interview — 06 Покупатель видит макет входа по телефону

**Статус:** закрыто для mock story-spec; стык с **07** — отдельный work unit в Wave 2.

## Scope

**IN:** `#auth` form, `#phone` tel input, submit → close + login button checkmark (catalog `#login`, index `#login-hero` / `#login-cta`).

**OUT (Wave 1 mock):** SMS, JWT storage, `/me`.

## Key Decisions

- `DECISION:` auth не блокирует cart/checkout в мокапе
- `DECISION:` no E.164 validation on client in mock
- `DECISION:` Wave 2 wire — request/verify from **07**, store access token, optional GET /me for chip label
- `DECISION:` auth form has phone only (no code field in mock HTML) — Wave 2 spec adds code step UI

## Behavior & Rules

- Same layer pattern shade/escape/close
- home.js and catalog.js duplicate handler — **08** may extract shared `site/js/shared/` later

## Already Implemented (REUSE)

- auth onsubmit both pages

## NOT Yet Implemented (Gaps)

- story-spec for mock; story-spec delta for API wire (Wave 2)
- SMS code input UI

## Integrations

- Real SMS via backend **07** adapter

## Check Notes

- Open/close auth
- Login icon after submit
