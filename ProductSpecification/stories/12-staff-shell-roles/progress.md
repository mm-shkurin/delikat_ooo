# Story 12 — Staff: вход, роль, каркас вкладок

Волна: **3**. Референс: `site/admin/` (11). План: [`WAVE-3-ADMIN.md`](../../WAVE-3-ADMIN.md).

## Spec

- [x] interview — `interview.md` (подтверждено)
- [x] story-spec — `12_StaffShellRoles.md` + Notes; skeptic accept
- [x] api-spec — `admin_api.yaml` + `endpoints.md`
- [x] spec-skeptic — accept на story-spec (api-spec без отдельного skeptic)
- [x] test-spec — `tests/` T1=10 T2=15 T3=4; implement only T1(+T2)

## Front (frontend/)

- [ ] implement — gate: Tier 1 UI (+ Security UI)
- [ ] refactor
- [ ] check

## Back (backend/)

- [x] implement — gate: Tier 1 API (+ Security API); usecase staff + HTTP `/api/v1/staff/*`
- [x] refactor — n/a (touched files ≤ ~200)
- [ ] contract tests

## Close

- [ ] progress + stories.md update
