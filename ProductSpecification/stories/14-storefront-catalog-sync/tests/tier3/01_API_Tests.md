# 14 — API Tests (Tier 3)

Degradation: cache / optimistic / rare — not implemented in this story.

---

### 1. Buyer list ignores cache freshness windows

Tier: 3

**Given** staff just hid a product  
**When** a buyer lists products within an arbitrary short cache TTL  
**Then** (out of scope) no contract for intermediate stale pages beyond ordinary HTTP caching

Reason: ETag / Cache-Control tuning OUT (**14** Notes).
