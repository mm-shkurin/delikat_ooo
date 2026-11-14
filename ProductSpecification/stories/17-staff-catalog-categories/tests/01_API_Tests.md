# 17 — API Tests (staff categories)

Contract: `ProductSpecification/api-specs/admin_api.yaml`  
Public list and product filter: `store_api.yaml`.  
Live signal: `x-websocket` `/api/v1/catalog/live`.

Load = n/a

---

### 1. Manager creates a category at the end

Tier: 1

**Given** a manager token and the six seed categories  
**When** they create a category with a new id and a title  
**Then** the staff list and the public category list show it last  
**And** its order number is one more than the previous maximum, not a hole left by a deleted row

### 2. Owner renames a category

Tier: 1

**Given** an owner token and an existing category  
**When** they change its title  
**Then** the public list shows the new title  
**And** the id is unchanged

### 3. Reorder rewrites visible order numbers

Tier: 1

**Given** an owner token and at least two categories  
**When** they submit the full id list in a new order  
**Then** the staff rows show order numbers 1 through N in that order

### 4. Delete removes the category and its products only

Tier: 1

**Given** an owner token, a category with a live product and a hidden product, and a past order that names that product  
**When** they delete the category  
**Then** the category and both products are gone from the catalog  
**And** the past order line still shows the saved name and price

### 5. Cashier cannot read or change categories

Tier: 1

**Given** a cashier token  
**When** they list, create, rename, reorder, or delete categories  
**Then** each request is forbidden

### 6. A category write signals the storefront

Tier: 1

**Given** a storefront listening for catalog changes  
**When** a manager creates a category  
**Then** the listener receives a change signal with no product fields, no hidden flag, and no product count  
**And** a later price edit of one product sends no such signal

### 7. The id all is reserved

Tier: 2

**Given** a manager token  
**When** they create a category with id all  
**Then** the request is rejected as reserved  
**And** no category named all is stored

### 8. A duplicate category id is rejected

Tier: 2

**Given** a category beef  
**When** a manager creates another category with id beef  
**Then** the request is rejected as taken  
**And** the existing title is unchanged

### 9. A title longer than 120 characters is rejected

Tier: 2

**Given** a manager token  
**When** they create a category whose title is 121 characters after trimming the edges  
**Then** the request is rejected  
**And** the stored title is not cut down to 120

### 10. An unknown public category filter is rejected

Tier: 2

**Given** no category with id missing  
**When** a buyer lists products filtered by missing  
**Then** the request is rejected  
**And** the response is not an empty product page

### 11. A partial order is rejected

Tier: 2

**Given** three categories  
**When** a manager submits an order list that omits one id  
**Then** the request is rejected  
**And** the previous order numbers stay

### 12. Renaming a missing category is rejected

Tier: 2

**Given** no category with id gone  
**When** a manager renames gone  
**Then** the request is rejected as not found

### 13. The staff count includes hidden products

Tier: 2

**Given** a category with one live product and one hidden product  
**When** a manager lists categories  
**Then** that row counts two products  
**And** the public category list has no product count
