# 16 — UI Tests (owner stats / money)

Reference: `site/admin/` stats and money panels.  
Routes: `/admin/stats`, `/admin/money`.

Load = n/a

---

### 1. Owner sees live Statistics and Money tabs

Tier: 1

**Given** an owner session and at least one live order  
**When** they open Statistics  
**Then** they see Заказов and Покупателей KPI values from the stats response  
**And** they see the «Кто заказывает» and «Что берут» charts  
**When** they open Money  
**Then** they see Выручка, Средний чек, Приходы, and Операций  
**And** they see revenue bars, top bars, and the Приходы feed

---

### 2. Manager and cashier never see the analytics tabs

Tier: 1

**Given** a manager session and a cashier session  
**When** each opens the cabinet  
**Then** Statistics and Money tabs are absent  
**When** they open `/admin/stats` or `/admin/money` directly  
**Then** they land on their first allowed tab instead

---

### 3. Loading hides zeros and empty copy until success

Tier: 1

**Given** the Statistics tab is still waiting for the response  
**When** the owner looks at the panel  
**Then** there are no KPI cards and no «Нет данных»  
**When** the response returns with no live orders  
**Then** KPI values are zero  
**And** the charts show «Нет данных»  
**When** Money loads with no live orders  
**Then** KPI values are zero  
**And** the bars and the Приходы feed show «Нет данных»

---

### 4. Charts show at most eight slices and use the palette

Tier: 2

**Given** more than eight buyer keys in the stats response  
**When** the owner opens Statistics  
**Then** each donut shows at most eight legend rows  
**And** the donut center equals the sum of the shown slices  
**And** slice colors follow the agreed chart palette in order

---

### 5. Money feed headings and icons follow Omsk days

Tier: 2

**Given** inflows dated today, yesterday, and an older day in Asia/Omsk  
**When** the owner opens Money  
**Then** day headings are Сегодня, Вчера, and the older day with a long month name  
**And** a pickup channel row shows the ₽ icon  
**And** an online channel row shows the ↓ icon  
**And** Доступно equals `inflow_rub`

---

### 6. Reopening the tab refetches; Orders status change does not

Tier: 2

**Given** Statistics already loaded  
**When** staff changes an order status on Orders  
**Then** Statistics does not refetch by itself  
**When** the owner leaves Statistics and opens it again  
**Then** a new stats request is made

---

### 7. Narrow width keeps KPI in two columns

Tier: 2

**Given** a 390px-wide viewport and a loaded Money panel  
**When** the owner looks at the layout  
**Then** KPI sit in two columns  
**And** the charts stack in one column
