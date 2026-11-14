# 17 — API Tests (tier 3)

Degradation: recorded, not implemented in this story's first slice.  
Load = n/a

---

### 1. A dropped socket reads the catalog again

Tier: 3

**Given** an open catalog whose socket has dropped  
**When** the storefront subscribes again  
**Then** it reads categories first and then the current product window  
**And** it does not keep the sidebar from before the drop

### 2. A rejected product filter during refresh does not kill the catalog

Tier: 3

**Given** an open catalog refreshing after a category change  
**When** the product list rejects the selected category  
**Then** the filter becomes All and the products load without a category  
**And** the catalog does not show «Каталог сейчас недоступен.»
