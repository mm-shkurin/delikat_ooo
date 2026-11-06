# 12 — Security Tier 3 (not implemented this story)

Degradation: rare ops edges outside cabinet UI path.

---

### 1. Ops path refuses removing the last owner

Tier: 3

**Given** exactly one owner exists via bootstrap  
**When** an ops/admin tool tries to remove that owner outside the cabinet UI  
**Then** the operation is rejected so the store is not left without an owner
