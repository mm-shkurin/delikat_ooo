# 13 — API Tests (Tier 3)

Degradation: rare validation edges; implement only if capacity remains.

---

### 1. Oversized or wrong-type image is rejected

Tier: 3

**Given** an owner token  
**When** they upload an image larger than 2 MiB or a non-image type  
**Then** the request fails validation

---

### 2. Invalid slug pattern is rejected

Tier: 3

**Given** an owner token  
**When** they create a product with id `Rib` or `1bad` or longer than 32 chars  
**Then** the request fails validation
