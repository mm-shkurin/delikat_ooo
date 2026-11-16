# Source appendix — docs consistency explorer

Agent: [Docs consistency audit](208df413-32f1-4585-9ab1-1052bc59c306)  
Status: success (Grok). First Sonnet pass failed on weekly usage.

Сжатая выжимка уже влита в `02_DOCUMENTATION_AUDIT.md`, `03_API_AND_CONTRACT.md`, `06_FINDINGS_REGISTER.md` (F23–F26). Ниже — полный список stale/auth/gaps без переработки.

## Stale vs 07–17 closed

- `BriefProductDescription.md` — «Prod (строим)»; 07 = SMS; нет 10–17
- `ProductSpecification/README.md` — Wave 1 + SMS; 17 omitted in plan table
- `PARALLEL-WAVE-1.md` — OTP/SMS 07.2; «не делать cart 10»
- `WAVE-3-ADMIN.md` — «решить auth в interview 12»; diagram 11→16 без 17
- `quality-debt-plan.md` — before admin / next story 11
- `stories/10/carryover.md` — admin API/React still open
- `stories/07/carryover.md` — Wave 3 вне OpenAPI; JSON token shape
- `stories/11/progress.md` — prod 12–16; ветка mock
- `stories/08/carryover.md` — httpOnly still Nice
- Root `README.md` — «Финальный HTML-макет»
- `INTERVIEWS.md` — 11 «референс для 12–16» (17 missing)

## Auth conflicts

- SMS leftovers: Brief, ProductSpecification README, PARALLEL, WAVE-3 OTP/invite, `json-contracts.md` §4, `store_api.yaml` PhoneVerify/TokenPair, `07_BackendAuthSms.md` filename
- Cookie reality: `frontend/README.md`, story 10 carryover (D1)
- Bearer docs: `backend/README.md`, `api-specs/README.md`, `admin_api.yaml` bearerAuth, 07 spec, 15 carryover wording

## Thin specs

- 01–06: interview+progress only
- 10: thin `story-spec.md`, no tests folder
- 11: mock-only, no story-spec by design; progress omits 17
