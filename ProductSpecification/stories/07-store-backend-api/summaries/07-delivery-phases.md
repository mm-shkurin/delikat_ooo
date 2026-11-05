# Journey — Story 07 backend auth

### 2026-11-01 — Backend auth = longest vertical (not catalog/cart)
- Type: decision
- Note: Product focus for «hex» discussion is **backend** SMS/JWT auth (story 07), not frontend. Frontend already has authApi + mock AuthSheet; hex backend tree still empty.

### 2026-11-01 — Delivery phases 07.1 → 07.5
- Type: decision
- Note: Story spec split into ordered phases: 07.1 skeleton, 07.2 OTP usecase **without** JWT/HTTP, 07.3 JWT+DB, 07.4 HTTP, 07.5 guest cookie. Migrations account tables in 07.3; 07.2 uses fakes only.

### 2026-11-01 — /backend-delivery runbooks
- Type: decision
- Note: `.cursor/skills/backend-delivery/SKILL.md` documents `/backend-delivery 07.N` (one phase per invocation). `progress.md` has one checkbox per phase; `/continue 07` dispatches same way.
