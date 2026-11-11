# 13 — Security Tests (staff catalog ACL)

Cashier list/write forbidden is covered in API Tests §4 (Tier 1).  
Cashier Catalog deep-link → `tests/tier3/05_Security_Tests.md`.

---

### 1. Non-staff cannot mutate staff catalog

Tier: 2

**Given** an authenticated buyer with no staff role  
**When** they list or create staff catalog products  
**Then** access is forbidden
