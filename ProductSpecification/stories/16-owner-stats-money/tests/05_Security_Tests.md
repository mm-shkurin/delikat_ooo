# 16 — Security Tests (owner stats / money)

Owner-only aggregates. Gate copy belongs to story 12.

Load = n/a

---

### 1. Missing token and non-staff cannot read aggregates

Tier: 1

**Given** no token  
**When** the client requests staff stats or staff money  
**Then** the request is unauthorized  
**Given** a signed-in buyer who is not staff  
**When** they request staff stats or staff money  
**Then** the request is forbidden

---

### 2. Analytics tabs stay unmounted until the cabinet lets the owner in

Tier: 2

**Given** no token, an expired staff session at the cabinet door, or a signed-in non-staff account  
**When** they open the cabinet  
**Then** Statistics and Money tabs are not mounted  
**And** a person who still needs to sign in sees «Войдите через Яндекс ID — роль подтянется с сервера.»  
**And** a non-staff account sees «У этого аккаунта нет доступа в кабинет. Нужна роль сотрудника.»

---

### 3. A forbidden call on an open tab uses the role sentence

Tier: 2

**Given** Statistics or Money is already open  
**When** a later load is forbidden  
**Then** the tab shows «У этого аккаунта нет доступа в кабинет. Нужна роль сотрудника.»  
**And** it does not show «Не получилось. Попробуйте ещё раз.»

---

### 4. An expired session on an open tab asks to sign in again

Tier: 2

**Given** Statistics or Money is already open  
**When** a later load is unauthorized  
**Then** the tab shows «Сессия истекла. Войдите заново.»
