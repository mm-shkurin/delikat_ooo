# 16 — API Tier 3 (not implemented this story)

Degradation: acquiring / export / Sber / PDF stay out of Wave 5.

---

### 1. Acquiring feed rows appear beside order inflows

Tier: 3

**Given** a bank or terminal settlement feed  
**When** an owner loads money  
**Then** those rows appear in Приходы separately from order projections

---

### 2. Date-window query filters aggregates

Tier: 3

**Given** live orders across many months  
**When** an owner requests stats with a date window  
**Then** only that window is aggregated
