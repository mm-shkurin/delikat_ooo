# 17 — Security Tests (category staff routes)

Load = n/a

---

### 1. A buyer cannot call staff category routes

Tier: 2

**Given** a signed-in buyer who is not staff  
**When** they list or create categories on the staff routes  
**Then** each request is forbidden

### 2. A missing token cannot list staff categories

Tier: 2

**Given** no access token  
**When** they list staff categories  
**Then** the request is rejected as unauthenticated  
**And** the public category list still succeeds without a token
