# 16 — API Tests (owner stats / money)

Contract: `ProductSpecification/api-specs/admin_api.yaml`  
Source orders: same store as staff list (story 15).

Load = n/a

---

### 1. Owner stats count only non-cancelled orders

Tier: 1

**Given** live orders in accepted, packing, ready, and done, plus at least one cancelled order  
**When** an owner loads staff stats  
**Then** `order_count` equals the number of non-cancelled orders  
**And** cancelled totals do not appear in buyer or product slices  
**And** the body has `buyer_count`, `buyer_slices`, and `product_slices`

---

### 2. Owner money revenue ignores cancelled orders

Tier: 1

**Given** the same mix of live and cancelled orders  
**When** an owner loads staff money  
**Then** `revenue_rub` is the sum of live `total_rub`  
**And** `avg_check_rub` is zero when there are no live orders, otherwise half-away-from-zero of revenue divided by live count  
**And** `inflow_rub` equals `revenue_rub`  
**And** `operation_count` equals the number of live orders  
**And** each live order appears once in `inflows` with `amount_rub` equal to its total

---

### 3. Buyer and product slices use the agreed keys and sort

Tier: 1

**Given** live orders for «Гость» and a named buyer, and lines with known product names  
**When** an owner loads staff stats  
**Then** an empty trimmed buyer name becomes «Гость»  
**And** an empty trimmed product name becomes «Без названия»  
**And** buyer slice values are sums of order totals per buyer key  
**And** product slice values are sums of line totals  
**And** slices sort by value descending, then label ascending  
**And** the server does not drop slices beyond the eighth

---

### 4. Money days are Omsk sparse and inflows follow pickup channel

Tier: 1

**Given** live orders on two different Asia/Omsk calendar days, including a pickup order  
**When** an owner loads staff money  
**Then** `revenue_by_day` lists only days with positive value, sorted by `day` ascending  
**And** each `day` is `YYYY-MM-DD` in Asia/Omsk  
**And** the pickup inflow channel is «Наличные / карта в точке»  
**And** a non-pickup inflow channel is «Онлайн-оплата»  
**And** inflows sort by `at` descending, then `id` ascending  
**And** each inflow `id` is `pay-` plus the lowercase order id

---

### 5. Manager and cashier cannot read stats or money

Tier: 1

**Given** a manager token and a cashier token  
**When** each requests staff stats or staff money  
**Then** every request is forbidden  
**And** no aggregate body is returned

---

### 6. Empty shop returns zero aggregates

Tier: 2

**Given** no live orders  
**When** an owner loads stats and money  
**Then** counts and money totals are zero  
**And** slice, day, top, and inflow arrays are empty

---

### 7. Top by quantity uses the same product key

Tier: 2

**Given** live lines that share a product name across orders  
**When** an owner loads staff money  
**Then** `top_by_qty` sums quantity per trimmed product name  
**And** empty names become «Без названия»  
**And** rows sort by quantity descending, then label ascending  
**And** the server does not truncate the list

---

### 8. Average check uses half-away-from-zero

Tier: 2

**Given** live orders whose revenue divided by count ends in `.5`  
**When** an owner loads staff money  
**Then** `avg_check_rub` matches half-away-from-zero integer rounding
