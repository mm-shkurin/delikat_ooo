# 15 — UI Tests (staff orders)

Reference: `site/admin/` orders panel for fields, not for the free status list.  
Route: `/admin/orders`.

Load = n/a

---

### 1. Owner, manager, and cashier open the same orders tab

Tier: 1

**Given** at least one store order  
**When** an owner, a manager, and a cashier each open Orders  
**Then** each sees the order list and a status control  
**And** a cashier still does not see Catalog, Categories, Statistics, Money, or Employees

---

### 2. The status control offers only the next allowed step

Tier: 1

**Given** an accepted order on the open Orders tab  
**When** the staff member looks at its status control  
**Then** the choices are Принят, then Собираем, then Отменён  
**When** they choose Собираем and the save succeeds  
**Then** the card shows Собираем  
**And** the choices become Собираем, Готов, and Отменён  
**And** a done or cancelled order has its status control disabled

---

### 3. The counter appears only after a successful load

Tier: 1

**Given** the Orders tab is still waiting for the list  
**When** the staff member looks at the panel  
**Then** neither the counter nor «Заказов нет» is shown  
**When** the list returns with no orders  
**Then** the counter reads «0 из 0»  
**And** the panel says «Заказов нет»  
**When** the list returns orders and the filter hides all of them  
**Then** the counter reads «0 из {total}»  
**And** the panel says «Заказов нет»

---

### 4. The default filter keeps cancelled orders visible

Tier: 2

**Given** orders in several statuses, including a cancelled order  
**When** the tab finishes loading  
**Then** the status filter is Все  
**And** the cancelled order is in the list  
**When** the staff member chooses Выдан  
**Then** only orders with that status remain  
**And** the list is not requested again

---

### 5. Search matches the short number, name, email, note, and street

Tier: 2

**Given** a loaded list with a named buyer, an email, a note, and a street  
**When** the staff member searches by a middle part of the name, the email, the note, the street, or the first 8 characters of the order id  
**Then** matching is case-insensitive  
**And** only matching cards remain  
**When** the search is empty or only spaces  
**Then** every loaded order is shown again  
**And** a city name alone does not change the list

---

### 6. Guest and signed-in cards use different contact lines

Tier: 2

**Given** a guest order and an order placed while signed in  
**When** the cards render  
**Then** the guest title is «Гость»  
**And** the guest contact is «№ » plus the first 8 lowercase characters of the order id  
**And** the signed-in contact is the email, then « · № », then those 8 characters  
**And** the line under the title is the local date, « · », Доставка or Самовывоз, and the street only when the street is not blank  
**And** a blank note is omitted  
**And** each line total uses the same ruble format as the card total

---

### 7. A refused change restores the status control

Tier: 2

**Given** an order whose next status was just refused  
**When** the panel shows the result  
**Then** the text is «Этот статус отсюда не поставить.»  
**And** the control returns to the previous status  
**When** the order no longer exists  
**Then** the text is «Заказ не найден.»  
**And** the card stays until the next successful load

---

### 8. A failed load does not look like an empty shop

Tier: 2

**Given** the order list request fails on the network  
**When** the tab shows the error  
**Then** the text is «Не получилось. Попробуйте ещё раз.»  
**And** the counter and «Заказов нет» stay hidden  
**When** a status save succeeds  
**Then** Statistics and Money stay on their empty shells

---

### 9. An expired session on the open tab does not invent a new redirect

Tier: 2

**Given** the Orders tab is already open  
**When** the list or a status save dies because the session expired  
**Then** the tab shows «Сессия истекла. Войдите заново.»  
**And** the cabinet does not add a new redirect
