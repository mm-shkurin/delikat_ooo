# 17 — UI Tests (tier 3)

Degradation: edge controls and rare copy. Not in the first implement slice.  
Load = n/a

---

### 1. The first row does not move upward

Tier: 3

**Given** the first category row  
**When** the manager presses move up  
**Then** no order request is sent

### 2. Two categories may share a title

Tier: 3

**Given** a category titled Говядина  
**When** a manager creates another category with a different id and the same title  
**Then** both rows are listed

### 3. The categories list shows the generic failure

Tier: 3

**Given** the categories tab cannot load  
**When** the request fails  
**Then** the tab shows «Не получилось. Попробуйте ещё раз.»
