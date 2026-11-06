# 12 — UI Tier 3 (not implemented this story)

Degradation: layout polish and non-blocking mock panel asserts — record only.

---

### 1. Narrow viewport keeps tabs and staff list usable

Tier: 3

**Given** a signed-in owner  
**And** the viewport is about 390px wide  
**When** they use the cabinet shell and Employees list  
**Then** tab labels are not clipped (tabs wrap)  
**And** the staff list is a single column

---

### 2. Mock panels render without live catalog write

Tier: 3

**Given** a signed-in owner  
**When** they open Catalog, Orders, Statistics, and Money panels  
**Then** each panel shows the mockup-style shell  
**And** the story does not require live write APIs for those panels

---

### 3. Gate and error copy match cabinet tone

Tier: 3

**Given** a refused non-staff visit to `/admin`  
**When** the refusal message is shown  
**Then** the copy matches the cabinet brand tone from the mockup  
**And** no demo password `staff` is advertised
