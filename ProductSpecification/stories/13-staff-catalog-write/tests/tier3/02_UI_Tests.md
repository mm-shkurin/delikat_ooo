# 13 — UI Tests (Tier 3)

Degradation: layout polish; does not block ship if Tier 1–2 green.

---

### 1. Narrow viewport keeps row actions usable

Tier: 3

**Given** a signed-in owner on Catalog  
**When** the viewport is about 390px wide  
**Then** badge, hide, and edit actions are not clipped  
**And** the edit dialog remains usable in one column

---

### 2. No category toolbar filter or reset-to-storefront

Tier: 3

**Given** a signed-in owner on Catalog  
**When** they view the toolbar  
**Then** there is no category filter control  
**And** there is no «Сбросить к витрине» control
