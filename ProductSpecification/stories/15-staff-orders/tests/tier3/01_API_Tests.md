# 15 — API Tests (tier 3)

Not implemented in this story.

---

### 1. Two status saves in a row keep the later one

Tier: 3

**Given** two staff members open the same accepted order  
**When** one sets packing and the other then sets cancelled  
**Then** the stored status is cancelled  
**And** the order has no version field

Degradation: last write wins is the rule; a race harness is not part of this story.

---

### 2. The card time uses the browser zone

Tier: 3

**Given** an order timestamp with a timezone offset  
**When** the card renders the time  
**Then** the day, short month, hour, and minute follow the Russian locale in the browser zone

Degradation: locale formatting is covered by the card scenario; the zone is not pinned in automation.
