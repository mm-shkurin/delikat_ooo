# 14 — API Tests (storefront catalog sync)

Contract: `ProductSpecification/api-specs/store_api.yaml`  
Staff hide/write via **13** (`admin_api.yaml`); buyer paths only.

Load = n/a

---

### 1. Hidden products are excluded from the buyer list

Tier: 1

**Given** a live product and a soft-hidden product in the same catalog  
**When** a buyer lists products  
**Then** the hidden product is not among the items  
**And** `total_count` counts only live products matching the query

---

### 2. Hidden detail returns the same not-found error as missing

Tier: 1

**Given** a soft-hidden product id and an unknown product id  
**When** a buyer requests each product detail  
**Then** both responses are not found with code `product_not_found`  
**And** neither response body includes a hide-specific code or a `hidden` field

---

### 3. Adding a hidden product to the cart fails as not found

Tier: 1

**Given** a soft-hidden product id  
**And** a guest cart session  
**When** the buyer adds that product to the cart  
**Then** the response is not found with code `product_not_found`  
**And** no cart line is created for that product

---

### 4. Staff name and price edits appear on the buyer list

Tier: 1

**Given** a live product  
**When** staff updates its name and price  
**And** a buyer lists products  
**Then** the product shows the new name and price

---

### 5. Buyer product payloads never expose hidden

Tier: 1

**Given** live products in the catalog  
**When** a buyer lists products or opens a live product detail  
**Then** each product object has no `hidden` field

---

### 6. Filters and empty pages count only live products

Tier: 2

**Given** the only product in a category is soft-hidden  
**When** a buyer lists products filtered by that category  
**Then** the item list is empty  
**And** `total_count` is zero

---

### 7. Buyer list returns staff badges on live products

Tier: 2

**Given** staff set badges NEW, SALE, and TOP on three live products  
**When** a buyer lists products  
**Then** those products include the matching badges  
**And** a SALE product may include compare-at price when set by staff

---

### 8. Staff image URL is visible on the buyer list

Tier: 2

**Given** staff uploaded an image for a live product  
**When** a buyer lists products  
**Then** that product’s image URL points at the served media for the product

---

### 9. Cart lines added before hide are not auto-removed

Tier: 2

**Given** a cart line for a product that was live when added  
**When** staff soft-hides that product  
**And** the buyer fetches the cart  
**Then** the existing line is still present  
**And** a new add of that product id still fails as not found
