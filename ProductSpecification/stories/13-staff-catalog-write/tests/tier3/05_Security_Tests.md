# 13 — Security Tests (Tier 3)

Degradation: ACL deep-link already Tier-1 in story **12**; re-assert only if Catalog live tab regresses shell.

---

### 1. Cashier deep-link cannot open Catalog panel

Tier: 3

**Given** a signed-in cashier  
**When** they open a cabinet URL aimed at Catalog  
**Then** the Catalog panel is not shown  
**And** they land on an allowed tab from story 12 ACL
