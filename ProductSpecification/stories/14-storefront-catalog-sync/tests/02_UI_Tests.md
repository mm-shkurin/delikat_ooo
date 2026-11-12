# 14 — UI Tests (storefront catalog sync)

Prod route: `/catalog` (+ product panel).  
Admin hide/edit happens in `/admin/catalog` (**13**); this story asserts buyer UI after refresh / open.

Load = n/a

---

### 1. Hidden SKU disappears from the grid after refresh

Tier: 1

**Given** a buyer catalog showing a live product card  
**When** staff soft-hides that product  
**And** the buyer refreshes the catalog  
**Then** that product card is gone  
**And** the grid has no ghost card for it

---

### 2. Staff price and name edits show after refresh

Tier: 1

**Given** a live product on the catalog  
**When** staff changes its name and price  
**And** the buyer refreshes the catalog  
**Then** the card shows the new name and price

---

### 3. Opening a hidden product shows product not found

Tier: 1

**Given** a soft-hidden product id  
**When** the buyer opens that product on the catalog  
**Then** the panel shows exactly «товар не найден»  
**And** no product card for it appears in the grid

---

### 4. Deep link to a hidden product shows product not found

Tier: 1

**Given** a soft-hidden product id  
**When** the buyer opens a deep link to that product on the catalog  
**Then** the panel shows exactly «товар не найден»

---

### 5. NEW and SALE badges appear on storefront cards

Tier: 2

**Given** staff marked one live product NEW and another SALE with compare-at  
**When** the buyer refreshes the catalog  
**Then** the NEW card shows the NEW badge  
**And** the SALE card shows the SALE badge and the struck-through was price

---

### 6. Empty filtered catalog does not mention hidden

Tier: 2

**Given** filters that match no live products  
**When** the buyer views the catalog  
**Then** they see the existing empty catalog state  
**And** the copy does not mention that products are hidden

---

### 7. Non-not-found panel failure keeps the existing message

Tier: 2

**Given** the product detail request fails for a reason other than not found  
**When** the buyer opens that product  
**Then** the panel shows «Не удалось открыть карточку.»  
**And** it does not show «товар не найден»

---

### 8. Adding a hidden product from the UI uses the not-found failure text

Tier: 2

**Given** the buyer knows a soft-hidden product id  
**When** they try to add it to the cart from the storefront  
**Then** they see the same not-found failure text as for an unknown product
