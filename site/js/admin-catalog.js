/* Admin cabinet mock (catalog + orders + stats).
   Catalog fields follow OpenAPI ProductSummary.
   badge: NEW | SALE | null. hidden is admin-only.
   Orders seed mirrors OrderCreated + buyer contacts.
   Stats/payments derive from orders (+ demo cash rows). No fetch. */
(function () {
  const STORAGE_KEY = "delikat-admin-catalog";
  const ORDERS_KEY = "delikat-admin-orders";
  const SESSION_KEY = "delikat-admin-ok";
  const ROLE_KEY = "delikat-admin-role";
  const DEMO_PASSWORD = "staff";

  const ROLES = {
    owner: {
      title: "Владелец",
      tabs: ["catalog", "orders", "stats", "money"]
    },
    manager: {
      title: "Менеджер",
      tabs: ["catalog", "orders"]
    },
    cashier: {
      title: "Кассир / мясник",
      tabs: ["orders"]
    }
  };

  const CATS = [
    { id: "beef", title: "Говядина" },
    { id: "pork", title: "Свинина" },
    { id: "poultry", title: "Птица" },
    { id: "marble", title: "Мраморное мясо" },
    { id: "semi", title: "Полуфабрикаты" },
    { id: "sauce", title: "Специи и соусы" }
  ];

  const IMAGES = [
    ["assets/products/ribeye.jpg", "Рибай"],
    ["assets/products/strip.jpg", "Нью-Йорк"],
    ["assets/products/filet.jpg", "Филе"],
    ["assets/products/tomahawk.jpg", "Томагавк"],
    ["assets/products/beef.jpg", "Говядина"],
    ["assets/products/chicken.jpg", "Птица"],
    ["assets/products/ai-banner.jpg", "Соус"],
    ["assets/hero/hero-meat.png", "Hero"]
  ];

  const ORDER_STATUSES = [
    { id: "accepted", title: "Принят" },
    { id: "packing", title: "Собираем" },
    { id: "ready", title: "Готов" },
    { id: "done", title: "Выдан" },
    { id: "cancelled", title: "Отменён" }
  ];

  const SEED = [
    row("rib", "Стейк Рибай", "marble", "~350 г", 1450, null, 98, ["chilled", "fresh", "premium"], "NEW", "Мраморность 4–5", "assets/products/ribeye.jpg"),
    row("strip", "Нью-Йорк", "beef", "~300 г", 1290, null, 95, ["chilled", "fresh", "premium"], null, "Мраморность 3–4", "assets/products/strip.jpg"),
    row("filet", "Филе-миньон", "beef", "~220 г", 1890, null, 90, ["chilled", "fresh", "premium"], null, "Мраморность 2–3", "assets/products/filet.jpg"),
    row("toma", "Томагавк", "marble", "~1,1 кг", 5890, null, 88, ["chilled", "fresh", "premium"], null, "Мраморность 4–5", "assets/products/tomahawk.jpg"),
    row("beef", "Говядина без кости", "beef", "за 1 кг", 1290, 1490, 86, ["chilled", "fresh"], "SALE", null, "assets/products/beef.jpg"),
    row("chicken", "Куриная грудка", "poultry", "за 1 кг", 690, null, 84, ["chilled", "fresh"], null, null, "assets/products/chicken.jpg"),
    row("denver", "Стейк Денвер", "beef", "~280 г", 990, 1190, 80, ["chilled", "fresh"], "SALE", null, "assets/products/strip.jpg"),
    row("tender", "Вырезка говяжья", "beef", "за 1 кг", 2190, null, 82, ["chilled", "fresh", "premium"], null, "Мраморность 2–3", "assets/products/filet.jpg"),
    row("mince", "Фарш говяжий", "semi", "за 1 кг", 790, null, 78, ["chilled", "fresh"], null, null, "assets/products/beef.jpg"),
    row("ribs", "Рёбра говяжьи", "beef", "за 1 кг", 950, null, 76, ["chilled", "fresh"], null, null, "assets/products/tomahawk.jpg"),
    row("porkloin", "Корейка свиная", "pork", "за 1 кг", 620, null, 74, ["chilled", "fresh"], null, null, "assets/products/strip.jpg"),
    row("wagyu", "Вагю рибай", "marble", "~400 г", 4290, null, 92, ["chilled", "fresh", "premium"], "NEW", "Мраморность 8–9", "assets/hero/hero-meat.png"),
    row("wings", "Крылья куриные", "poultry", "за 1 кг", 420, null, 70, ["frozen", "chilled"], null, null, "assets/products/chicken.jpg"),
    row("sauce1", "Перечный соус", "sauce", "120 г", 290, null, 66, ["fresh"], null, null, "assets/products/ai-banner.jpg"),
    row("sauce2", "Чимичурри", "sauce", "120 г", 310, 360, 68, ["fresh"], "SALE", null, "assets/products/ai-banner.jpg"),
    row("burger", "Котлеты для бургера", "semi", "4 шт", 690, null, 72, ["frozen", "chilled"], null, null, "assets/products/beef.jpg")
  ];

  const ORDERS_SEED = [
    {
      order_id: "b10e8400-e29b-41d4-a716-446655440000",
      status: "accepted",
      total_rub: 2900,
      created_at: "2026-11-06T08:12:00+06:00",
      buyer_name: "Алексей П.",
      buyer_phone: "+7 (913) 000-11-22",
      note: "",
      fulfillment: { mode: "delivery", address: { city: "Омск", street_line: "Ленина 10" } },
      lines: [
        { product_id: "rib", product_name: "Стейк Рибай", weight_label: "~350 г", quantity: 2, unit_price_rub: 1450, line_total_rub: 2900 }
      ]
    },
    {
      order_id: "c21f9511-f3ac-52e5-b827-557766551111",
      status: "packing",
      total_rub: 1980,
      created_at: "2026-11-06T09:40:00+06:00",
      buyer_name: "Мария К.",
      buyer_phone: "+7 (3812) 55-01-02",
      note: "Позвонить за 30 минут",
      fulfillment: { mode: "pickup", address: { city: "Омск", street_line: null } },
      lines: [
        { product_id: "chicken", product_name: "Куриная грудка", weight_label: "за 1 кг", quantity: 2, unit_price_rub: 690, line_total_rub: 1380 },
        { product_id: "sauce2", product_name: "Чимичурри", weight_label: "120 г", quantity: 2, unit_price_rub: 310, line_total_rub: 620 }
      ]
    },
    {
      order_id: "d32a0622-04bd-63f6-c938-668877662222",
      status: "ready",
      total_rub: 5890,
      created_at: "2026-11-05T18:05:00+06:00",
      buyer_name: "Игорь С.",
      buyer_phone: "+7 (908) 777-33-44",
      note: "",
      fulfillment: { mode: "delivery", address: { city: "Омск", street_line: "Маркса 5, кв. 12" } },
      lines: [
        { product_id: "toma", product_name: "Томагавк", weight_label: "~1,1 кг", quantity: 1, unit_price_rub: 5890, line_total_rub: 5890 }
      ]
    },
    {
      order_id: "e43b1733-15ce-74a7-d049-779988773333",
      status: "done",
      total_rub: 1580,
      created_at: "2026-11-04T14:20:00+06:00",
      buyer_name: "Гость",
      buyer_phone: "+7 (900) 111-22-33",
      note: "",
      fulfillment: { mode: "pickup", address: { city: "Омск", street_line: null } },
      lines: [
        { product_id: "mince", product_name: "Фарш говяжий", weight_label: "за 1 кг", quantity: 2, unit_price_rub: 790, line_total_rub: 1580 }
      ]
    },
    {
      order_id: "f54c2844-26df-85b8-e15a-88aa99884444",
      status: "done",
      total_rub: 2740,
      created_at: "2026-11-06T11:15:00+06:00",
      buyer_name: "Алексей П.",
      buyer_phone: "+7 (913) 000-11-22",
      note: "",
      fulfillment: { mode: "delivery", address: { city: "Омск", street_line: "Ленина 10" } },
      lines: [
        { product_id: "strip", product_name: "Нью-Йорк", weight_label: "~300 г", quantity: 1, unit_price_rub: 1290, line_total_rub: 1290 },
        { product_id: "rib", product_name: "Стейк Рибай", weight_label: "~350 г", quantity: 1, unit_price_rub: 1450, line_total_rub: 1450 }
      ]
    },
    {
      order_id: "a65d3955-37e0-96c9-f26b-99bb00995555",
      status: "done",
      total_rub: 1380,
      created_at: "2026-11-03T16:45:00+06:00",
      buyer_name: "Мария К.",
      buyer_phone: "+7 (3812) 55-01-02",
      note: "",
      fulfillment: { mode: "pickup", address: { city: "Омск", street_line: null } },
      lines: [
        { product_id: "chicken", product_name: "Куриная грудка", weight_label: "за 1 кг", quantity: 2, unit_price_rub: 690, line_total_rub: 1380 }
      ]
    },
    {
      order_id: "b76e4a66-48f1-a7d0-037c-aabb11aa6666",
      status: "cancelled",
      total_rub: 990,
      created_at: "2026-11-05T10:00:00+06:00",
      buyer_name: "Гость",
      buyer_phone: "+7 (900) 111-22-33",
      note: "Передумал",
      fulfillment: { mode: "delivery", address: { city: "Омск", street_line: "Кемеровская 2" } },
      lines: [
        { product_id: "denver", product_name: "Стейк Денвер", weight_label: "~280 г", quantity: 1, unit_price_rub: 990, line_total_rub: 990 }
      ]
    }
  ];

  const CHART_COLORS = ["#8b1a1a", "#0a0a0a", "#c41e3a", "#5c5c5c", "#2a9b6a", "#5c1010", "#9f1239", "#3a3a3a"];

  function row(id, name, categoryId, weight, price, compare, pop, props, badge, marble, image) {
    return {
      id: id,
      name: name,
      category_id: categoryId,
      default_weight_label: weight,
      price_rub: price,
      compare_at_price_rub: compare,
      popularity_score: pop,
      properties: props,
      badge: badge,
      marble_grade_label: marble,
      image_url: image,
      description: null,
      hidden: false
    };
  }

  const $ = (id) => document.getElementById(id);
  const rub = (n) => new Intl.NumberFormat("ru-RU").format(n) + " ₽";
  const catTitle = (id) => (CATS.find((c) => c.id === id) || { title: id }).title;
  const statusTitle = (id) => (ORDER_STATUSES.find((s) => s.id === id) || { title: id }).title;

  let catalog = loadCatalog();
  let orders = loadOrders();
  let editingId = null;
  let activeTab = "catalog";
  let currentRole = sessionStorage.getItem(ROLE_KEY) || "owner";

  function roleTabs() {
    return (ROLES[currentRole] || ROLES.owner).tabs.slice();
  }

  function canOpen(tab) {
    return roleTabs().indexOf(tab) !== -1;
  }

  function applyRoleChrome() {
    const allowed = roleTabs();
    ["catalog", "orders", "stats", "money"].forEach((tab) => {
      const btn = $("tab-" + tab);
      const ok = allowed.indexOf(tab) !== -1;
      btn.hidden = !ok;
      if (!ok) btn.setAttribute("aria-selected", "false");
    });
    const chip = $("role-chip");
    chip.hidden = false;
    chip.textContent = (ROLES[currentRole] || ROLES.owner).title;
  }

  function defaultTabForRole() {
    const allowed = roleTabs();
    if (allowed.indexOf(activeTab) !== -1) return activeTab;
    return allowed[0] || "orders";
  }

  function loadCatalog() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return clone(SEED);
      const data = JSON.parse(raw);
      if (!Array.isArray(data) || data.length === 0) return clone(SEED);
      if (!data.every((item) => item && typeof item.id === "string" && typeof item.name === "string")) {
        return clone(SEED);
      }
      return data;
    } catch (err) {
      return clone(SEED);
    }
  }

  function loadOrders() {
    try {
      const raw = localStorage.getItem(ORDERS_KEY);
      if (!raw) return clone(ORDERS_SEED);
      const data = JSON.parse(raw);
      if (!Array.isArray(data) || data.length === 0) return clone(ORDERS_SEED);
      if (!data.every((item) => item && typeof item.order_id === "string")) return clone(ORDERS_SEED);
      return data;
    } catch (err) {
      return clone(ORDERS_SEED);
    }
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function persistCatalog() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(catalog));
  }

  function persistOrders() {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }

  function fillSelect(select, options) {
    select.replaceChildren();
    options.forEach((opt) => {
      const node = document.createElement("option");
      node.value = opt.value;
      node.textContent = opt.label;
      select.append(node);
    });
  }

  function imageOptions(current) {
    const options = IMAGES.map(([value, label]) => ({ value: value, label: label }));
    if (current && !options.some((opt) => opt.value === current)) {
      options.push({ value: current, label: current });
    }
    return options;
  }

  function showApp(on) {
    $("gate").hidden = on;
    $("app").hidden = !on;
  }

  function setTab(name) {
    if (!canOpen(name)) name = defaultTabForRole();
    activeTab = name;
    applyRoleChrome();
    ["catalog", "orders", "stats", "money"].forEach((tab) => {
      const on = tab === name;
      $("panel-" + tab).hidden = !on;
      $("tab-" + tab).setAttribute("aria-selected", String(on));
    });
    if (name === "catalog") renderCatalog();
    else if (name === "orders") renderOrders();
    else if (name === "stats") renderStats();
    else if (name === "money") renderMoney();
  }

  function paintKpis(rootId, items) {
    const kpi = $(rootId);
    kpi.replaceChildren();
    items.forEach(([label, value]) => {
      const card = document.createElement("article");
      card.className = "kpi";
      card.innerHTML = "<span>" + label + "</span><strong>" + value + "</strong>";
      kpi.append(card);
    });
  }

  function productRowsFrom(live) {
    const rows = [];
    live.forEach((order) => {
      (order.lines || []).forEach((line) => rows.push(line));
    });
    return rows;
  }

  function activeOrders() {
    return orders.filter((order) => order.status !== "cancelled");
  }

  function aggregateMap(entries, keyFn, valueFn) {
    const map = new Map();
    entries.forEach((entry) => {
      const key = keyFn(entry);
      map.set(key, (map.get(key) || 0) + valueFn(entry));
    });
    return Array.from(map.entries())
      .map(([label, value]) => ({ label: label, value: value }))
      .sort((a, b) => b.value - a.value);
  }

  function donutSvg(slices) {
    const total = slices.reduce((sum, slice) => sum + slice.value, 0) || 1;
    const size = 168;
    const radius = 58;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;
    const arcs = slices.map((slice, index) => {
      const len = (slice.value / total) * circumference;
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", "84");
      circle.setAttribute("cy", "84");
      circle.setAttribute("r", String(radius));
      circle.setAttribute("fill", "none");
      circle.setAttribute("stroke", CHART_COLORS[index % CHART_COLORS.length]);
      circle.setAttribute("stroke-width", "22");
      circle.setAttribute("stroke-dasharray", len + " " + (circumference - len));
      circle.setAttribute("stroke-dashoffset", String(-offset));
      circle.setAttribute("transform", "rotate(-90 84 84)");
      offset += len;
      return circle;
    });
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 " + size + " " + size);
    svg.setAttribute("class", "donut");
    arcs.forEach((arc) => svg.append(arc));
    const hole = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    hole.setAttribute("cx", "84");
    hole.setAttribute("cy", "84");
    hole.setAttribute("r", "44");
    hole.setAttribute("fill", "var(--surface)");
    svg.append(hole);
    return { svg: svg, total: total, slices: slices };
  }

  function paintDonut(rootId, slices) {
    const root = $(rootId);
    root.replaceChildren();
    if (!slices.length) {
      root.textContent = "Нет данных";
      return;
    }
    const built = donutSvg(slices.slice(0, 8));
    const figure = document.createElement("div");
    figure.className = "donut-figure";
    figure.append(built.svg);
    const center = document.createElement("div");
    center.className = "donut-center";
    center.innerHTML = "<strong>" + rub(Math.round(built.total)) + "</strong><span>всего</span>";
    figure.append(center);
    root.append(figure);
    const legend = document.createElement("ul");
    legend.className = "chart-legend";
    built.slices.slice(0, 8).forEach((slice, index) => {
      const li = document.createElement("li");
      const swatch = document.createElement("span");
      swatch.className = "swatch";
      swatch.style.background = CHART_COLORS[index % CHART_COLORS.length];
      const label = document.createElement("span");
      label.textContent = slice.label;
      const val = document.createElement("strong");
      val.textContent = rub(Math.round(slice.value));
      li.append(swatch, label, val);
      legend.append(li);
    });
    root.append(legend);
  }

  function paintBars(rootId, slices, valueFormat) {
    const root = $(rootId);
    root.replaceChildren();
    if (!slices.length) {
      root.textContent = "Нет данных";
      return;
    }
    const max = Math.max.apply(null, slices.map((slice) => slice.value)) || 1;
    slices.forEach((slice) => {
      const row = document.createElement("div");
      row.className = "bar-row";
      const label = document.createElement("span");
      label.className = "bar-label";
      label.textContent = slice.label;
      const track = document.createElement("div");
      track.className = "bar-track";
      const fill = document.createElement("div");
      fill.className = "bar-fill";
      fill.style.width = Math.max(4, Math.round((slice.value / max) * 100)) + "%";
      track.append(fill);
      const val = document.createElement("span");
      val.className = "bar-value";
      val.textContent = valueFormat(slice.value);
      row.append(label, track, val);
      root.append(row);
    });
  }

  function dayKey(iso) {
    const date = new Date(iso);
    return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
  }

  function dayLabel(key) {
    const parts = key.split("-");
    const date = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" }).format(date);
  }

  function payDayHeading(iso) {
    const date = new Date(iso);
    const today = new Date();
    const sameDay = date.toDateString() === today.toDateString();
    if (sameDay) return "Сегодня";
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) return "Вчера";
    return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "long" }).format(date);
  }

  function buildPayments() {
    const fromOrders = activeOrders().map((order) => ({
      id: "pay-" + order.order_id,
      at: order.created_at,
      title: "Оплата заказа",
      subtitle: (order.buyer_name || "Покупатель") + " · № " + order.order_id.slice(0, 8),
      amount: order.total_rub,
      channel: order.fulfillment && order.fulfillment.mode === "pickup" ? "Наличные / карта в точке" : "Онлайн-оплата"
    }));
    const extras = [
      {
        id: "pay-cash-1",
        at: "2026-11-06T12:05:00+06:00",
        title: "Пополнение",
        subtitle: "Внесение выручки · касса",
        amount: 4500,
        channel: "Наличные"
      },
      {
        id: "pay-sbp-1",
        at: "2026-11-05T19:22:00+06:00",
        title: "Перевод СБП",
        subtitle: "Игорь С. · за томагавк",
        amount: 5890,
        channel: "СБП"
      },
      {
        id: "pay-card-1",
        at: "2026-11-04T15:01:00+06:00",
        title: "Оплата картой",
        subtitle: "Терминал самовывоза",
        amount: 1580,
        channel: "Карта"
      }
    ];
    return fromOrders.concat(extras).sort((a, b) => new Date(b.at) - new Date(a.at));
  }

  function renderStats() {
    const live = activeOrders();
    const buyers = new Set(live.map((order) => order.buyer_name || order.buyer_phone)).size;
    paintKpis("kpi-stats", [
      ["Заказов", String(live.length)],
      ["Покупателей", String(buyers)]
    ]);

    const buyerSlices = aggregateMap(live, (order) => order.buyer_name || "Гость", (order) => order.total_rub);
    const productMoney = aggregateMap(
      productRowsFrom(live),
      (line) => line.product_name,
      (line) => line.line_total_rub
    );
    paintDonut("donut-buyers", buyerSlices);
    paintDonut("donut-products", productMoney);
  }

  function renderMoney() {
    const live = activeOrders();
    const revenue = live.reduce((sum, order) => sum + order.total_rub, 0);
    const avg = live.length ? Math.round(revenue / live.length) : 0;
    const payments = buildPayments();
    const balance = payments.reduce((sum, row) => sum + row.amount, 0);

    paintKpis("kpi-money", [
      ["Выручка", rub(revenue)],
      ["Средний чек", rub(avg)],
      ["Приходы", rub(balance)],
      ["Операций", String(payments.length)]
    ]);

    const productQty = aggregateMap(
      productRowsFrom(live),
      (line) => line.product_name,
      (line) => line.quantity
    );
    const dayMoney = aggregateMap(live, (order) => dayKey(order.created_at), (order) => order.total_rub)
      .sort((a, b) => a.label.localeCompare(b.label))
      .map((slice) => ({ label: dayLabel(slice.label), value: slice.value }));

    paintBars("bars-days", dayMoney, (value) => rub(Math.round(value)));
    paintBars("bars-qty", productQty.slice(0, 8), (value) => String(value) + " шт");

    $("pay-balance").innerHTML = "<span>Доступно</span><strong>" + rub(balance) + "</strong>";
    const feed = $("pay-feed");
    feed.replaceChildren();
    let lastHeading = "";
    payments.forEach((row) => {
      const heading = payDayHeading(row.at);
      if (heading !== lastHeading) {
        lastHeading = heading;
        const h = document.createElement("h3");
        h.className = "pay-day";
        h.textContent = heading;
        feed.append(h);
      }
      const item = document.createElement("article");
      item.className = "pay-row";
      const icon = document.createElement("div");
      icon.className = "pay-icon";
      icon.textContent = row.channel === "СБП" ? "СБ" : row.channel === "Наличные" ? "₽" : "↓";
      const body = document.createElement("div");
      body.className = "pay-body";
      const title = document.createElement("strong");
      title.textContent = row.title;
      const sub = document.createElement("span");
      sub.textContent = row.subtitle;
      body.append(title, sub);
      const amount = document.createElement("div");
      amount.className = "pay-amount";
      amount.textContent = "+ " + rub(row.amount);
      const time = document.createElement("div");
      time.className = "pay-time";
      time.textContent = new Intl.DateTimeFormat("ru-RU", { hour: "2-digit", minute: "2-digit" }).format(new Date(row.at));
      const right = document.createElement("div");
      right.className = "pay-right";
      right.append(amount, time);
      item.append(icon, body, right);
      feed.append(item);
    });
  }

  function filteredCatalog() {
    const q = $("q").value.trim().toLowerCase();
    const cat = $("cat").value;
    const visibility = $("visibility").value;
    return catalog.filter((item) => {
      if (cat && item.category_id !== cat) return false;
      if (visibility === "live" && item.hidden) return false;
      if (visibility === "hidden" && !item.hidden) return false;
      if (!q) return true;
      return item.name.toLowerCase().includes(q) || item.id.toLowerCase().includes(q);
    });
  }

  function renderCatalog() {
    const items = filteredCatalog();
    $("count").textContent = items.length + " из " + catalog.length;
    $("empty").hidden = items.length !== 0;
    const list = $("list");
    list.replaceChildren();
    items.forEach((item) => list.append(skuNode(item)));
  }

  function setBadge(item, next) {
    item.badge = item.badge === next ? null : next;
    persistCatalog();
    renderCatalog();
  }

  function skuNode(item) {
    const li = document.createElement("li");
    li.className = "sku" + (item.hidden ? " is-hidden" : "");

    const img = document.createElement("img");
    img.src = "../" + item.image_url;
    img.alt = "";
    li.append(img);

    const title = document.createElement("div");
    title.className = "title";
    const h = document.createElement("h3");
    h.textContent = item.name;
    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent = item.id + " · " + catTitle(item.category_id) + " · " + item.default_weight_label;
    title.append(h, meta);
    li.append(title);

    const price = document.createElement("div");
    price.className = "price";
    price.append(document.createTextNode(rub(item.price_rub)));
    if (item.compare_at_price_rub) {
      const was = document.createElement("span");
      was.className = "was";
      was.textContent = rub(item.compare_at_price_rub);
      price.append(was);
    }
    li.append(price);

    const pills = document.createElement("div");
    pills.className = "pills";
    if (item.badge) {
      const badge = document.createElement("span");
      badge.className = "pill" + (item.badge === "SALE" ? " sale" : item.badge === "NEW" ? " new" : "");
      badge.textContent = item.badge;
      pills.append(badge);
    }
    if (item.hidden) {
      const off = document.createElement("span");
      off.className = "pill off";
      off.textContent = "скрыт";
      pills.append(off);
    }
    li.append(pills);

    const actions = document.createElement("div");
    actions.className = "row-actions";
    actions.append(badgeToggle("NEW", item.badge === "NEW", function () { setBadge(item, "NEW"); }));
    actions.append(badgeToggle("SALE", item.badge === "SALE", function () { setBadge(item, "SALE"); }));
    actions.append(button(item.hidden ? "Вернуть" : "Скрыть", "ghost", function () {
      item.hidden = !item.hidden;
      persistCatalog();
      renderCatalog();
    }));
    actions.append(button("Править", "ghost", function () { openEditor(item.id); }));
    li.append(actions);
    return li;
  }

  function badgeToggle(label, on, onClick) {
    const node = document.createElement("button");
    node.type = "button";
    node.className = "btn badge-btn" + (on ? " is-on" : "") + (label === "SALE" ? " is-sale" : " is-new");
    node.setAttribute("aria-pressed", String(on));
    node.textContent = label;
    node.title = on ? "Снять плашку " + label : "Пометить " + label;
    node.addEventListener("click", onClick);
    return node;
  }

  function button(label, kind, onClick) {
    const node = document.createElement("button");
    node.type = "button";
    node.className = "btn " + kind;
    node.textContent = label;
    node.addEventListener("click", onClick);
    return node;
  }

  function filteredOrders() {
    const q = $("oq").value.trim().toLowerCase();
    const status = $("ostatus").value;
    return orders.filter((order) => {
      if (status !== "all" && order.status !== status) return false;
      if (!q) return true;
      const hay = [
        order.order_id,
        order.buyer_name || "",
        order.buyer_phone || "",
        order.note || "",
        (order.fulfillment && order.fulfillment.address && order.fulfillment.address.street_line) || ""
      ].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }

  function renderOrders() {
    const items = filteredOrders();
    $("orders-count").textContent = items.length + " из " + orders.length;
    $("orders-empty").hidden = items.length !== 0;
    const list = $("orders-list");
    list.replaceChildren();
    items.forEach((order) => list.append(orderNode(order)));
  }

  function formatWhen(iso) {
    try {
      return new Intl.DateTimeFormat("ru-RU", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
      }).format(new Date(iso));
    } catch (err) {
      return iso;
    }
  }

  function orderNode(order) {
    const li = document.createElement("li");
    li.className = "order";

    const head = document.createElement("div");
    head.className = "order-head";
    const title = document.createElement("div");
    const h = document.createElement("h3");
    h.textContent = order.buyer_name || "Покупатель";
    const meta = document.createElement("div");
    meta.className = "meta";
    const mode = order.fulfillment && order.fulfillment.mode === "pickup" ? "Самовывоз" : "Доставка";
    const street = order.fulfillment && order.fulfillment.address && order.fulfillment.address.street_line;
    meta.textContent = formatWhen(order.created_at) + " · " + mode + (street ? " · " + street : "");
    title.append(h, meta);
    head.append(title);

    const total = document.createElement("div");
    total.className = "price";
    total.textContent = rub(order.total_rub);
    head.append(total);
    li.append(head);

    const contacts = document.createElement("div");
    contacts.className = "meta";
    contacts.textContent = (order.buyer_phone || "") + " · № " + order.order_id.slice(0, 8);
    li.append(contacts);

    if (order.note) {
      const note = document.createElement("p");
      note.className = "order-note";
      note.textContent = order.note;
      li.append(note);
    }

    const lines = document.createElement("ul");
    lines.className = "order-lines";
    (order.lines || []).forEach((line) => {
      const rowEl = document.createElement("li");
      rowEl.textContent = line.product_name + " · " + line.weight_label + " × " + line.quantity + " — " + rub(line.line_total_rub);
      lines.append(rowEl);
    });
    li.append(lines);

    const foot = document.createElement("div");
    foot.className = "order-foot";
    const status = document.createElement("label");
    status.className = "field status-field";
    const statusLabel = document.createElement("span");
    statusLabel.textContent = "Статус";
    const select = document.createElement("select");
    ORDER_STATUSES.forEach((opt) => {
      const option = document.createElement("option");
      option.value = opt.id;
      option.textContent = opt.title;
      if (opt.id === order.status) option.selected = true;
      select.append(option);
    });
    select.addEventListener("change", function () {
      order.status = select.value;
      persistOrders();
      renderOrders();
      if (activeTab === "stats") renderStats();
      if (activeTab === "money") renderMoney();
    });
    status.append(statusLabel, select);
    foot.append(status);

    const pill = document.createElement("span");
    pill.className = "pill status-" + order.status;
    pill.textContent = statusTitle(order.status);
    foot.append(pill);
    li.append(foot);
    return li;
  }

  function setProps(values) {
    document.querySelectorAll('input[name="prop"]').forEach((input) => {
      input.checked = values.indexOf(input.value) !== -1;
    });
  }

  function readProps() {
    return Array.from(document.querySelectorAll('input[name="prop"]:checked')).map((input) => input.value);
  }

  function setBadgeRadio(value) {
    const next = value === "NEW" || value === "SALE" ? value : "";
    document.querySelectorAll('input[name="badge"]').forEach((input) => {
      input.checked = input.value === next;
    });
  }

  function readBadge() {
    const checked = document.querySelector('input[name="badge"]:checked');
    return checked && checked.value ? checked.value : null;
  }

  function showFormError(text) {
    const node = $("form-error");
    node.hidden = !text;
    node.textContent = text || "";
  }

  function openEditor(id) {
    editingId = id;
    const item = id ? catalog.find((entry) => entry.id === id) : null;
    $("editor-title").textContent = item ? "Правка" : "Новый товар";
    $("f-id").value = item ? item.id : "";
    $("f-id").readOnly = Boolean(item);
    $("f-name").value = item ? item.name : "";
    $("f-category").value = item ? item.category_id : "beef";
    $("f-weight").value = item ? item.default_weight_label : "";
    $("f-price").value = item ? String(item.price_rub) : "";
    $("f-compare").value = item && item.compare_at_price_rub ? String(item.compare_at_price_rub) : "";
    $("f-pop").value = item ? String(item.popularity_score) : "50";
    setBadgeRadio(item && item.badge ? item.badge : "");
    $("f-marble").value = item && item.marble_grade_label ? item.marble_grade_label : "";
    fillSelect($("f-image"), imageOptions(item ? item.image_url : ""));
    $("f-image").value = item ? item.image_url : IMAGES[0][0];
    $("f-description").value = item && item.description ? item.description : "";
    $("f-hidden").checked = item ? Boolean(item.hidden) : false;
    setProps(item ? item.properties || [] : []);
    showFormError("");
    $("editor").showModal();
    (item ? $("f-name") : $("f-id")).focus();
  }

  function closeEditor() {
    if ($("editor").open) $("editor").close();
    editingId = null;
  }

  function intOrNull(raw) {
    const text = String(raw).trim();
    if (!text) return null;
    if (!/^\d+$/.test(text)) return undefined;
    return Number(text);
  }

  function validate(draft) {
    if (!/^[a-z][a-z0-9-]{0,31}$/.test(draft.id)) {
      return "Код: латиница в нижнем регистре, можно цифры и дефис.";
    }
    if (!editingId && catalog.some((item) => item.id === draft.id)) {
      return "Такой код уже есть.";
    }
    if (!draft.name.trim()) return "Нужно название.";
    if (!CATS.some((cat) => cat.id === draft.category_id)) return "Выберите категорию.";
    if (!draft.default_weight_label.trim()) return "Нужен вес.";
    if (draft.price_rub === undefined || draft.price_rub < 1 || draft.price_rub > 99999) {
      return "Цена — целое число от 1 до 99999.";
    }
    if (draft.compare_at_price_rub === undefined) return "Поле «Было» — пусто или целое число.";
    if (draft.compare_at_price_rub !== null && draft.compare_at_price_rub <= draft.price_rub) {
      return "«Было» должно быть больше текущей цены.";
    }
    if (draft.popularity_score === undefined || draft.popularity_score > 100) {
      return "Популярность — целое число от 0 до 100.";
    }
    if (draft.badge && draft.badge !== "NEW" && draft.badge !== "SALE") {
      return "Плашка только NEW или SALE.";
    }
    if (!draft.image_url) return "Выберите фото.";
    return "";
  }

  function onSave(event) {
    event.preventDefault();
    const compare = intOrNull($("f-compare").value);
    const price = intOrNull($("f-price").value);
    const pop = intOrNull($("f-pop").value);
    const draft = {
      id: $("f-id").value.trim().toLowerCase(),
      name: $("f-name").value.trim(),
      category_id: $("f-category").value,
      default_weight_label: $("f-weight").value.trim(),
      price_rub: price === null ? undefined : price,
      compare_at_price_rub: compare,
      popularity_score: pop === null ? undefined : pop,
      properties: readProps(),
      badge: readBadge(),
      marble_grade_label: $("f-marble").value.trim() || null,
      image_url: $("f-image").value,
      description: $("f-description").value.trim() || null,
      hidden: $("f-hidden").checked
    };
    const message = validate(draft);
    showFormError(message);
    if (message) return;
    if (editingId) {
      const index = catalog.findIndex((item) => item.id === editingId);
      if (index === -1) return;
      catalog[index] = draft;
    } else {
      catalog.unshift(draft);
    }
    persistCatalog();
    closeEditor();
    renderCatalog();
  }

  fillSelect($("cat"), [{ value: "", label: "Все" }].concat(CATS.map((cat) => ({ value: cat.id, label: cat.title }))));
  fillSelect($("f-category"), CATS.map((cat) => ({ value: cat.id, label: cat.title })));
  fillSelect($("f-image"), imageOptions(""));

  document.querySelectorAll("[data-tab]").forEach((btn) => {
    btn.addEventListener("click", function () {
      if (btn.hidden || !canOpen(btn.dataset.tab)) return;
      setTab(btn.dataset.tab);
    });
  });

  $("gate-form").addEventListener("submit", function (event) {
    event.preventDefault();
    const ok = $("password").value === DEMO_PASSWORD;
    $("gate-error").hidden = ok;
    if (!ok) return;
    const picked = document.querySelector('input[name="role"]:checked');
    currentRole = picked && ROLES[picked.value] ? picked.value : "owner";
    sessionStorage.setItem(SESSION_KEY, "1");
    sessionStorage.setItem(ROLE_KEY, currentRole);
    $("password").value = "";
    showApp(true);
    setTab(defaultTabForRole());
  });

  $("logout").addEventListener("click", function () {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(ROLE_KEY);
    currentRole = "owner";
    closeEditor();
    showApp(false);
    $("role-chip").hidden = true;
  });

  $("q").addEventListener("input", renderCatalog);
  $("cat").addEventListener("change", renderCatalog);
  $("visibility").addEventListener("change", renderCatalog);
  $("oq").addEventListener("input", renderOrders);
  $("ostatus").addEventListener("change", renderOrders);

  $("create").addEventListener("click", function () { openEditor(null); });
  $("reset").addEventListener("click", function () {
    const ok = window.confirm("Вернуть 16 товаров витрины? Правки каталога пропадут.");
    if (!ok) return;
    catalog = clone(SEED);
    persistCatalog();
    renderCatalog();
  });
  $("orders-reset").addEventListener("click", function () {
    const ok = window.confirm("Вернуть демо-заказы? Текущие статусы пропадут.");
    if (!ok) return;
    orders = clone(ORDERS_SEED);
    persistOrders();
    renderOrders();
  });

  $("editor-form").addEventListener("submit", onSave);
  $("cancel").addEventListener("click", closeEditor);
  $("close-editor").addEventListener("click", closeEditor);
  $("editor").addEventListener("click", function (event) {
    if (event.target === $("editor")) closeEditor();
  });

  if (sessionStorage.getItem(SESSION_KEY) === "1") {
    currentRole = sessionStorage.getItem(ROLE_KEY) || "owner";
    if (!ROLES[currentRole]) currentRole = "owner";
    showApp(true);
    setTab(defaultTabForRole());
  }
})();
