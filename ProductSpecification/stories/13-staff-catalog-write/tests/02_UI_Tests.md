# 13 — UI Tests (admin Catalog tab)

Reference: `site/admin/` catalog tab; prod route `/admin/catalog`.  
Shell/ACL from story **12** must stay intact.

Load = n/a

---

### 1. Owner opens live Catalog list

Tier: 1

**Given** a signed-in owner  
**When** they open Catalog  
**Then** they see a live product list from the server  
**And** the panel is not a static shell placeholder  
**And** visibility filter defaults to showing all

---

### 2. Create via dialog appears in the list

Tier: 1

**Given** a signed-in manager on Catalog  
**When** they add a product with required fields, a category from the select, and a photo  
**Then** the product appears in the list after save  
**And** its photo preview is visible in the row

---

### 3. SALE row shows old price, new price, and discount percent

Tier: 1

**Given** a signed-in owner  
**And** a SALE product with compare-at price higher than price  
**When** they view that row in Catalog  
**Then** the old price is shown struck through  
**And** the current price is shown  
**And** the discount percent matches round((compare-at − price) / compare-at × 100)

---

### 4. Hide and restore from the row

Tier: 1

**Given** a signed-in owner on Catalog  
**And** a live product row  
**When** they hide the product  
**Then** with filter Hidden they still see it  
**And** when they restore it  
**Then** it appears under Live again

---

### 5. Empty search shows nothing found

Tier: 2

**Given** a signed-in owner on Catalog  
**When** they search for text that matches no product  
**Then** they see the message «Ничего не найдено»

---

### 6. Badge toggle in the row matches the edit form

Tier: 2

**Given** a signed-in owner on Catalog  
**And** a product without a badge  
**When** they set badge TOP on the row  
**And** they open edit for that product  
**Then** the form shows badge TOP  
**And** clearing the badge in the form removes it from the row after save

---

### 7. Edit keeps product code read-only

Tier: 2

**Given** a signed-in owner  
**When** they open edit on an existing product  
**Then** the product code field cannot be changed  
**And** they can still change name, price, and hide

---

### 8. Soft-hide control exists in the edit dialog

Tier: 2

**Given** a signed-in owner editing a product  
**When** they set hidden in the dialog and save  
**Then** the product is hidden in the list filters as expected

---

### 9. Image can be kept on edit without re-upload

Tier: 2

**Given** a signed-in owner editing a product that already has a photo  
**When** they change only the name and save without choosing a new file  
**Then** the save succeeds  
**And** the previous photo remains visible
