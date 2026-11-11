# 13 — API Tests (staff catalog write)

Contract: `ProductSpecification/api-specs/admin_api.yaml`  
Categories: store `GET /api/v1/catalog/categories` (unchanged).  
Buyer catalog GET unchanged in this story.

Load = n/a

---

### 1. Manager creates product with image

Tier: 1

**Given** a manager access token  
**And** an existing category  
**When** they create a product with valid fields and an image file  
**Then** the product is created  
**And** the list includes it with an image URL served by the media endpoint  
**And** `created_at` is set

---

### 2. Owner patches product fields

Tier: 1

**Given** an owner token  
**And** an existing product  
**When** they update name and price  
**Then** the product reflects the new name and price  
**And** `created_at` and id are unchanged

---

### 3. Soft-hide is visible under hidden filter

Tier: 1

**Given** an owner token  
**And** a live product  
**When** they mark the product hidden  
**Then** visibility `hidden` returns that product  
**And** visibility `live` does not

---

### 4. Cashier cannot list or write catalog

Tier: 1

**Given** a cashier token  
**When** they list staff catalog products or create or patch a product  
**Then** each request is forbidden

---

### 5. Staff list sorts SALE then NEW then TOP then unmarked

Tier: 1

**Given** an owner token  
**And** products with badges SALE, NEW, TOP, and none  
**When** they list staff catalog products  
**Then** items appear in order SALE, then NEW, then TOP, then unmarked  
**And** within the same badge group newer `created_at` comes first

---

### 6. Anonymous media returns uploaded image bytes

Tier: 1

**Given** a product whose image was stored by staff upload  
**When** anyone requests that product media URL without a token  
**Then** the image bytes are returned with the stored content type

---

### 7. Duplicate product id is rejected

Tier: 2

**Given** an owner token  
**And** a product id `rib` already exists  
**When** they create another product with id `rib`  
**Then** the request fails as product id taken  
**And** the existing product is not overwritten

---

### 8. SALE without compare-at price is rejected

Tier: 2

**Given** an owner token  
**When** they create or patch a product with badge SALE and missing or not-greater compare-at price  
**Then** the request fails validation

---

### 9. Search matches name or id

Tier: 2

**Given** an owner token  
**And** a product named «Стейк Рибай» with id `rib`  
**When** they list with query `риб` or query `rib`  
**Then** that product is included  
**And** unrelated products are not

---

### 10. Create without image is rejected

Tier: 2

**Given** an owner token  
**When** they create a product without an image file  
**Then** the request fails validation

---

### 11. Product id cannot be changed on patch

Tier: 2

**Given** an owner token  
**And** a product with id `rib`  
**When** they attempt to change the id via patch  
**Then** the id remains `rib`  
**And** the request is rejected or the id field is ignored without rename

---

### 12. Unknown category is rejected

Tier: 2

**Given** an owner token  
**When** they create a product with a category id that does not exist  
**Then** the request fails as category not found

---

### 13. Unauthenticated staff catalog is rejected

Tier: 2

**Given** no access token  
**When** the client lists or creates staff catalog products  
**Then** the response is unauthorized

---

### 14. Replace image updates media URL

Tier: 2

**Given** an owner token  
**And** an existing product with an image  
**When** they upload a replacement image  
**Then** the product image URL still points at the media endpoint  
**And** anonymous media returns the new bytes

---

### 15. Badge can be cleared to unmarked

Tier: 2

**Given** an owner token  
**And** a product with badge NEW  
**When** they patch badge to empty  
**Then** the product has no badge  
**And** list sort places it in the unmarked group
