# 12 — Security Tests (staff ACL)

---

### 1. Cabinet API never assigns or mutates owner via staff routes

Tier: 1

**Given** an owner token  
**When** the client tries to assign role `owner` by email  
**Then** the request is rejected  
**And** when the client tries to change or remove an existing owner member  
**Then** those requests are forbidden as owner-immutable

---

### 2. Manager cannot assign or promote to manager

Tier: 2

**Given** a manager token  
**When** the manager tries to assign email role `manager`  
**Then** access is forbidden  
**And** promoting a cashier to `manager` is also forbidden

---

### 3. Cashier cannot list or assign staff

Tier: 2

**Given** a cashier token  
**When** the client lists staff members or assigns a role  
**Then** access is forbidden

---

### 4. Manager cannot remove a manager

Tier: 2

**Given** a manager token  
**And** another active manager in the roster  
**When** the manager tries to remove that member  
**Then** access is forbidden
