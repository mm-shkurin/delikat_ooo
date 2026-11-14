# 17 — UI Tests (categories tab and storefront sidebar)

Load = n/a

---

### 1. Owner sees Categories after Catalog

Tier: 1

**Given** an owner in the staff cabinet  
**When** they look at the tabs  
**Then** Categories sits immediately after Catalog  
**And** each row shows the id, the title, the order number, and the product count

### 2. Creating a category updates the open catalog

Tier: 1

**Given** the catalog is already open on a price filter and the sale view  
**And** a manager creates a category in the cabinet  
**When** the create succeeds  
**Then** the open catalog shows the new category button last without a full page reload  
**And** the price filter and the sale view stay

### 3. Delete asks with the same count as the row

Tier: 1

**Given** a category row whose count includes a hidden product  
**When** the manager chooses delete  
**Then** the question names that category and the same count  
**And** after they confirm, the sidebar no longer has that category button

### 4. Drag is only on a wide window

Tier: 1

**Given** the categories tab  
**When** the window is 420 pixels wide or narrower  
**Then** each row offers move up and move down and no drag  
**When** the window is wider  
**Then** each row offers move up, move down, and drag

### 5. Edit keeps the id and the product form omits All

Tier: 2

**Given** an existing category  
**When** the manager opens it for rename  
**Then** the id is visible and cannot be edited  
**When** they open the product form  
**Then** the category choices are the public categories  
**And** All is not a choice

### 6. An empty category uses the catalog empty text

Tier: 2

**Given** a category with no live products  
**When** a buyer presses that category button  
**Then** the catalog shows «Ничего не нашлось. Снимите часть фильтров.»

### 7. The open product panel stays put

Tier: 2

**Given** a product panel is already open  
**When** a manager deletes that product's category  
**Then** the open panel stays as it was  
**When** the buyer opens that product again, follows its product link, or refreshes the product detail  
**Then** they see «товар не найден»

### 8. Cashier cannot open Categories

Tier: 2

**Given** a cashier  
**When** they open the categories address  
**Then** they see Orders  
**And** the Categories tab is absent

### 9. Deleting the last category leaves only All

Tier: 2

**Given** one category that holds every remaining product  
**When** a manager deletes it and confirms  
**Then** the open catalog sidebar shows only All  
**And** the product grid is empty
