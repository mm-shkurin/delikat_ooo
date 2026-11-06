# 12 — UI Tests (admin shell + Employees)

Reference: `site/admin/` mock layout; prod route `/admin`.  
Brand: Manrope / Oswald + storefront tokens.

Load = n/a

---

### 1. Owner sees full tab set including Employees

Tier: 1

**Given** a signed-in owner  
**When** they open the staff cabinet  
**Then** tabs Catalog, Orders, Statistics, Money, and Employees are visible  
**And** the header shows an owner role chip from the server

---

### 2. Cashier sees only Orders

Tier: 1

**Given** a signed-in cashier  
**When** they open the staff cabinet  
**Then** only the Orders tab is available  
**And** Catalog, Statistics, Money, and Employees are not shown

---

### 3. Manager sees Catalog, Orders, Employees — not Stats or Money

Tier: 2

**Given** a signed-in manager  
**When** they open the staff cabinet  
**Then** Catalog, Orders, and Employees are visible  
**And** Statistics and Money are not shown

---

### 4. Non-staff cannot enter the cabinet

Tier: 1

**Given** a signed-in buyer with no staff role  
**When** they open `/admin`  
**Then** the cabinet app is not shown  
**And** access is refused

---

### 5. Employees list shows member fields

Tier: 2

**Given** a signed-in owner  
**And** the roster has an active member and a pending invite  
**When** they open Employees → List  
**Then** each row shows email, role, and status  
**And** display name appears when present

---

### 6. Owner assigns via Employees → Assign

Tier: 2

**Given** a signed-in owner on Employees → Assign  
**When** they submit a valid email with role `cashier`  
**Then** the new or updated member appears in List with the chosen role

---

### 7. Manager Assign offers only cashier

Tier: 1

**Given** a signed-in manager on Employees → Assign  
**When** they open the role choices  
**Then** only `cashier` is available  
**And** `owner` and `manager` are not offered

---

### 8. Manager sees owner and manager rows read-only

Tier: 1

**Given** a signed-in manager on Employees → List  
**And** the roster includes an owner and a manager  
**When** they view those rows  
**Then** role change and remove actions are not available on them  
**And** remove remains available only for cashier rows

---

### 9. Owner rows are read-only for everyone in the cabinet

Tier: 2

**Given** a signed-in owner on Employees → List  
**And** another owner exists in the roster  
**When** they view that owner row  
**Then** role change and remove actions are not available

---

### 10. Deep-link to a forbidden tab redirects to the first allowed

Tier: 2

**Given** a signed-in cashier  
**When** they open a cabinet URL aimed at Catalog or Employees  
**Then** they land on Orders  
**And** the forbidden panel is not shown

---

### 11. Logout clears cabinet access

Tier: 2

**Given** a signed-in manager in the cabinet  
**When** they log out  
**Then** returning to `/admin` does not show the cabinet until they sign in again as staff

<!-- Tier 3: narrow viewport + mock panel shell → tests/tier3/02_UI_Tests.md -->
