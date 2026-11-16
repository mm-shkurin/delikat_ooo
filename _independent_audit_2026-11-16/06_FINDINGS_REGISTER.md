# Findings register

Severity: **P0** блокирует доверие/CI сейчас · **P1** вводит в заблуждение или копится риск · **P2** гигиена · **P3** nice.

| ID | Sev | Area | Finding | Evidence |
|----|-----|------|---------|----------|
| F01 | P0 | API/CI | `check_api_contract.py` FAIL: `/api/v1/catalog/live` во фронте, нет в YAML `paths` | live run 2026-11-16; `store_api.yaml` `x-websocket`; `paths.js` |
| F02 | P1 | Docs | Brief всё ещё «07 = SMS» | `BriefProductDescription.md` |
| F03 | P1 | Docs | PARALLEL-WAVE-1 = SMS/OTP план как будто живой | `PARALLEL-WAVE-1.md` |
| F04 | P1 | Docs | quality-debt «before admin» + next story 11 | `.memory-bank/tasks/quality-debt-plan.md` |
| F05 | P1 | Docs | carryover 10: admin API/React «still open» | `stories/10-…/carryover.md` |
| F06 | P1 | Docs | carryover 08: httpOnly «still open» | `stories/08-…/carryover.md` |
| F07 | P1 | Docs | backend README: staff = Bearer only | `backend/README.md` vs cookie SPA |
| F08 | P1 | Docs | CLAUDE/root narrative «контракт = store_api» единственный | `CLAUDE.md`, root mental model vs `admin_api.yaml` |
| F09 | P1 | Ops | Docker `--build` fails under OneDrive | carryovers 12–17; sprint-check front |
| F10 | P1 | Sec | CSRF = SameSite=Lax only; double-submit open (D2) | no CSRF code; frontend README trade-off |
| F11 | P1 | Product | Нет backlog-строк на оплату/телефон/PDF/историю — gaps только в prose | `INTERVIEWS.md`, carryover 10 |
| F12 | P2 | Spec | Story 10 naming `story-spec.md` ≠ `NN_Name.md` | `stories/10-cart-orders-api/` |
| F13 | P2 | Spec | 01–06 без formal story-spec (осознанно) | progress 01 |
| F14 | P2 | Arch | alembic `sys.path.insert` | `ARCH-PATH-HACK`; B4 |
| F15 | P2 | Quality | SMELL-LONG-FUNC / DUPLICATION front+back | sprint-check 2026-11-15 |
| F16 | P2 | Quality | features↔widgets coupling blocks Stage A 3.0 | sprint-check front |
| F17 | P2 | Test | Acceptance только catalog+checkout; staff UI без black-box | `acceptance/tests` |
| F18 | P2 | Test | Thin RTL staff | sprint-check Needs a task |
| F19 | P2 | Docs | technology.md browser-testing TBD | `technology.md` |
| F20 | P3 | Docs | quality-debt не отмечает B1/B2 done | plan vs `catalog_store` / `cart_store` |
| F21 | P3 | Git | GIT-BULK / GIT-DIRECT-MAIN historical | sprint-check; human policy |
| F22 | P3 | Parity | optional visual `site/`↔`frontend/` | carryover 08 |
| F23 | P0 | API docs | `json-contracts.md` / schemas всё ещё SMS verify + JSON `access_token`/`TokenPair` | `api-specs/json-contracts.md`, `store_api.yaml` components |
| F24 | P1 | OpenAPI | `admin_api.yaml` security = `bearerAuth` only; cookie session не описана | `admin_api.yaml` vs SPA cookie-only |
| F25 | P1 | Docs | WAVE-3 runbook «решить auth в interview 12» / диаграмма без 17 | `WAVE-3-ADMIN.md` |
| F26 | P2 | Naming | `07_BackendAuthSms.md` filename после OAuth pivot | `stories/07-store-backend-api/` |
| F27 | P2 | Backend | staff catalog list hard-cap `.limit(500)` | `catalog_store.py:75` |
| F28 | P2 | Backend | WS hub in-memory (не Redis) — multi-instance blind spot | `adapters/live/catalog_hub.py` |
| F29 | P2 | Docs | Root README всё ещё «Финальный HTML-макет» | `README.md` |
| F30 | P2 | Docs | INTERVIEWS 11 «референс для 12–16» — нет 17 | `stories/INTERVIEWS.md` |

## Appendix — parallel investigator notes

- Docs explorer: entry READMEs + OpenAPI examples are the largest onboarding traps (SMS/Bearer JSON).
- Backend locator: prod usecase **clean** of FastAPI; ACL centralized in `domain/staff/role.py` + per-service `_require_*`; CSRF absent; cart/orders `FOR UPDATE` present.

## Что уже закрыто (не поднимать как open)

- Stories **07–17** delivery (по `stories.md`)
- HttpOnly JWT cookies (D1) — 2026-11-15
- ARCH-SIZE back/front, ARCH-BOUNDARY back (sprint-check)
- Catalog SQL filter (B1) и cart `FOR UPDATE` (B2) — в коде

## Conflicts to resolve consciously

1. **Единый контракт-файл vs dual YAML** — процесс говорит store_api; практика admin_api. Зафиксировать в CLAUDE + Brief.
2. **WS в OpenAPI** — либо first-class path, либо исключение в чекере, либо path вне `paths.js`.
3. **GitVerse vs GitHub** — full sprint-check 2026-11-15 FAIL gate на GitVerse; front session scoped to GitHub PASS. Нужна одна политика артефакт-хоста.
