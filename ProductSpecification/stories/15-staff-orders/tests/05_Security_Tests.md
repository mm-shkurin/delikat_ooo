# 15 — Security Tests (staff orders)

List and status for owner, manager, and cashier are the same. Gate copy belongs to story 12.

Load = n/a

---

### 1. A missing token and a non-staff buyer cannot read or change orders

Tier: 1

**Given** no token  
**When** the client lists staff orders or changes a status  
**Then** the request is unauthorized  
**Given** a signed-in buyer who is not staff  
**When** they list staff orders or change a status  
**Then** the request is forbidden  
**And** the order status is unchanged

---

### 2. The orders tab is absent until the cabinet lets the person in

Tier: 2

**Given** no token, an expired staff session at the cabinet door, or a signed-in non-staff account  
**When** they open the cabinet  
**Then** the orders tab is not mounted  
**And** a person who still needs to sign in sees «Войдите через Яндекс ID — роль подтянется с сервера.»  
**And** a non-staff account sees «У этого аккаунта нет доступа в кабинет. Нужна роль сотрудника.»

---

### 3. A forbidden call on an already open tab uses the role sentence

Tier: 2

**Given** the Orders tab is already open  
**When** a later list or status save is forbidden  
**Then** the tab shows «У этого аккаунта нет доступа в кабинет. Нужна роль сотрудника.»  
**And** it does not show «Не получилось. Попробуйте ещё раз.»
