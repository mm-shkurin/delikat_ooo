# 12 — API Tests (staff me + roster)

Contract: `ProductSpecification/api-specs/admin_api.yaml`  
OAuth exchange/logout: store API (unchanged).

Load = n/a

---

### 1. Staff me returns role for authenticated staff

Tier: 1

**Given** an account with staff role `owner`  
**And** a valid access token  
**When** the client requests current staff profile  
**Then** the response is success  
**And** the body includes email and role `owner`

---

### 2. Non-staff cannot read staff me

Tier: 1

**Given** an authenticated buyer with no staff role  
**When** the client requests current staff profile  
**Then** access is forbidden

---

### 3. Owner lists staff roster

Tier: 2

**Given** an owner token  
**And** the roster has at least one active member  
**When** the client lists staff members  
**Then** the response is success  
**And** each item has email, role, and status `active` or `pending`

---

### 4. Owner assigns cashier by email (registered → active)

Tier: 1

**Given** an owner token  
**And** a registered account with email `butcher@example.com` and no staff role  
**When** the owner assigns that email role `cashier`  
**Then** the member is created or updated as `active` with role `cashier`

---

### 5. Assign unknown email creates pending

Tier: 2

**Given** an owner token  
**And** no account exists for `newhire@example.com`  
**When** the owner assigns that email role `manager`  
**Then** the member is `pending` with role `manager`  
**And** user id is empty until first OAuth with that email

---

### 6. Pending activates on first OAuth email match

Tier: 1

**Given** a pending invite for `newhire@example.com` with role `cashier`  
**When** that person completes Yandex sign-in and the profile email matches  
**Then** the member becomes `active`  
**And** staff me returns role `cashier`

---

### 7. Owner updates manager role to cashier

Tier: 2

**Given** an owner token  
**And** an active member with role `manager`  
**When** the owner changes that member role to `cashier`  
**Then** the member role is `cashier`

---

### 8. Owner removes cashier from staff

Tier: 2

**Given** an owner token  
**And** an active cashier member  
**When** the owner removes that member from staff  
**Then** the member is gone from the roster  
**And** that account cannot read staff me

---

### 9. Unauthenticated staff me is rejected

Tier: 2

**Given** no access token  
**When** the client requests current staff profile  
**Then** the response is unauthorized

---

### 10. Invalid assign email is rejected

Tier: 2

**Given** an owner token  
**When** the owner assigns role `cashier` with an empty or malformed email  
**Then** the request fails validation
