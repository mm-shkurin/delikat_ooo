# 15 — API Tests (staff orders)

Contract: `ProductSpecification/api-specs/admin_api.yaml`  
Checkout snapshot: `store_api.yaml` `POST /api/v1/orders`.

Load = n/a

---

### 1. Staff receives every order, newest first, without a phone

Tier: 1

**Given** orders created at different times, including a guest order and an order with a note  
**When** an owner, manager, or cashier loads the staff order list  
**Then** the body is an `items` list of every order  
**And** newer `created_at` comes first  
**And** equal timestamps break ties by the canonical lowercase order id  
**And** each item has status, allowed next statuses, total, time, buyer name, buyer email, note, fulfillment, and lines  
**And** a missing email or note is null  
**And** there is no phone field

---

### 2. Cashier advances an accepted order to packing

Tier: 1

**Given** a cashier token and an accepted order  
**When** they set the status to packing  
**Then** the order is packing  
**And** the response is the same order card  
**And** the next statuses are ready, then cancelled

---

### 3. A finished order rejects another status

Tier: 1

**Given** an order already marked done  
**When** a manager sets it to cancelled or ready  
**Then** the request is refused as an invalid transition  
**And** the stored status stays done  
**And** the message is «Этот статус отсюда не поставить.»

---

### 4. Checkout stores the buyer once and hides the snapshot from the receipt

Tier: 1

**Given** a shop session and a cart ready to check out  
**When** a guest places the order  
**Then** the staff card shows the name «Гость» and a null email  
**And** the receipt body has no buyer name and no buyer email  
**When** a signed-in buyer places another order with a valid token  
**Then** the staff card stores the trimmed shown profile name, or «Гость» when that name is empty  
**And** it stores the account email  
**And** the receipt body still has no buyer name and no buyer email

---

### 5. Repeating the checkout key returns the staff status and the original message

Tier: 1

**Given** an order whose status staff has moved to cancelled  
**When** the same shop session repeats the original checkout key  
**Then** the response succeeds with the cancelled status  
**And** the original receipt message is unchanged  
**And** the stored buyer name and email are unchanged  
**When** a different shop session presents that same key  
**Then** the request conflicts and the order is unchanged

---

### 6. Setting the current status again succeeds

Tier: 2

**Given** an order in packing  
**When** staff sends packing again  
**Then** the request succeeds  
**And** the card stays packing

---

### 7. A missing or unknown status is rejected

Tier: 2

**Given** a staff token and an existing order  
**When** they send an empty body, a body that is not an object, a body without status, or an unknown status  
**Then** each request is a validation error  
**And** the message is «Некорректный статус.»  
**And** the stored status is unchanged  
**And** extra fields besides status are ignored on a valid change

---

### 8. An unknown order and a bad id are refused

Tier: 2

**Given** a staff token  
**When** they change a status for an order id that does not exist  
**Then** the response says the order was not found  
**When** the id in the path is not a UUID  
**Then** the message is «Некорректный номер заказа.»

---

### 9. A bad token does not create or rewrite an order

Tier: 2

**Given** a shop session ready to check out  
**When** the checkout sends an invalid or expired token  
**Then** the request is unauthorized  
**And** no new order is stored  
**When** that token is sent again with a key that already created an order  
**Then** the stored status, name, and email stay as they were

---

### 10. Older orders without a snapshot read as a guest, lines keep creation order

Tier: 2

**Given** an order stored before buyer name and email existed  
**And** a newer order with two lines  
**When** staff loads the list  
**Then** the older card shows «Гость» and a null email  
**And** the newer card lists lines in the order they were saved
