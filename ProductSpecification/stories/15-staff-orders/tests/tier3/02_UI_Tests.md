# 15 — UI Tests (tier 3)

Not implemented in this story.

---

### 1. Narrow window keeps search, filter, and status inside the card

Tier: 3

**Given** the Orders tab at a width of 390 pixels  
**When** the list has rendered  
**Then** the search field, status filter, and status control remain inside the panel  
**And** the card stacks in one column

Degradation: checked by eye on the cabinet width already used for other tabs. No separate automated layout gate in this story.

---

### 2. Each status pill uses the chosen token color

Tier: 3

**Given** one card in each status  
**When** the pills render  
**Then** Принят uses the text color, Собираем the accent, Готов success, Выдан muted text, and Отменён danger  
**And** the pill background stays the surface color

Degradation: color is specified; pixel checks are not part of the first implementation.
