# 14 — UI Tests (Tier 3)

Degradation: realtime / poll / focus-revalidate / optimistic — OUT (clean code).

---

### 1. Already open panel stays stale until a new open

Tier: 3

**Given** the buyer has an open panel on a live product  
**When** staff soft-hides that product without the buyer refreshing or re-opening  
**Then** the panel may still show the old detail  
**And** the next open or refresh detail shows «товар не найден»

Reason: auto-invalidate / poll / SSE OUT — record expected stale, do not implement.

---

### 2. Optimistic storefront updates after staff edit

Tier: 3

**Given** a buyer viewing the catalog  
**When** staff edits a product  
**Then** the grid does not update until the buyer refreshes or re-fetches the list

Reason: optimistic UI OUT.

---

### 3. TOP badge visual redesign on storefront

Tier: 3

**Given** a live product with badge TOP  
**When** the buyer views the card  
**Then** existing TOP styling from **08** is enough  

Reason: redesign OUT; smoke covered by API badge Tier 2 if needed.
