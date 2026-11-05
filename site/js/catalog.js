(function initTheme() {
      const saved = localStorage.getItem("delikat-theme") || "wine";
      document.documentElement.setAttribute("data-theme", saved);
    })();

    function applyTheme(theme) {
      document.documentElement.setAttribute("data-theme", theme);
      localStorage.setItem("delikat-theme", theme);
      document.querySelectorAll("[data-theme-set]").forEach((btn) => {
        btn.setAttribute("aria-pressed", String(btn.dataset.themeSet === theme));
      });
    }

    const CATS = [
      { id: "all", title: "Все" },
      { id: "beef", title: "Говядина" },
      { id: "pork", title: "Свинина" },
      { id: "poultry", title: "Птица" },
      { id: "marble", title: "Мраморное мясо" },
      { id: "semi", title: "Полуфабрикаты" },
      { id: "sauce", title: "Специи и соусы" }
    ];

    const PRODUCTS = [
      { id: "rib", name: "Стейк Рибай", cat: "marble", weight: "~350 г", price: 1450, pop: 98, props: ["chilled","fresh","premium"], badge: "NEW", marble: "Мраморность 4–5", img: "assets/products/ribeye.jpg" },
      { id: "strip", name: "Нью-Йорк", cat: "beef", weight: "~300 г", price: 1290, pop: 95, props: ["chilled","fresh","premium"], badge: "TOP", marble: "Мраморность 3–4", img: "assets/products/strip.jpg" },
      { id: "filet", name: "Филе-миньон", cat: "beef", weight: "~220 г", price: 1890, pop: 90, props: ["chilled","fresh","premium"], marble: "Мраморность 2–3", img: "assets/products/filet.jpg" },
      { id: "toma", name: "Томагавк", cat: "marble", weight: "~1,1 кг", price: 5890, pop: 88, props: ["chilled","fresh","premium"], badge: "TOP", marble: "Мраморность 4–5", img: "assets/products/tomahawk.jpg" },
      { id: "beef", name: "Говядина без кости", cat: "beef", weight: "за 1 кг", price: 1290, was: 1490, pop: 86, props: ["chilled","fresh"], badge: "SALE", img: "assets/products/beef.jpg" },
      { id: "chicken", name: "Куриная грудка", cat: "poultry", weight: "за 1 кг", price: 690, pop: 84, props: ["chilled","fresh"], img: "assets/products/chicken.jpg" },
      { id: "denver", name: "Стейк Денвер", cat: "beef", weight: "~280 г", price: 990, was: 1190, pop: 80, props: ["chilled","fresh"], badge: "SALE", img: "assets/products/strip.jpg" },
      { id: "tender", name: "Вырезка говяжья", cat: "beef", weight: "за 1 кг", price: 2190, pop: 82, props: ["chilled","fresh","premium"], marble: "Мраморность 2–3", img: "assets/products/filet.jpg" },
      { id: "mince", name: "Фарш говяжий", cat: "semi", weight: "за 1 кг", price: 790, pop: 78, props: ["chilled","fresh"], img: "assets/products/beef.jpg" },
      { id: "ribs", name: "Рёбра говяжьи", cat: "beef", weight: "за 1 кг", price: 950, pop: 76, props: ["chilled","fresh"], img: "assets/products/tomahawk.jpg" },
      { id: "porkloin", name: "Корейка свиная", cat: "pork", weight: "за 1 кг", price: 620, pop: 74, props: ["chilled","fresh"], img: "assets/products/strip.jpg" },
      { id: "wagyu", name: "Вагю рибай", cat: "marble", weight: "~400 г", price: 4290, pop: 92, props: ["chilled","fresh","premium"], badge: "NEW", marble: "Мраморность 8–9", img: "assets/hero/hero-meat.png" },
      { id: "wings", name: "Крылья куриные", cat: "poultry", weight: "за 1 кг", price: 420, pop: 70, props: ["frozen","chilled"], img: "assets/products/chicken.jpg" },
      { id: "sauce1", name: "Перечный соус", cat: "sauce", weight: "120 г", price: 290, pop: 66, props: ["fresh"], img: "assets/products/ai-banner.jpg" },
      { id: "sauce2", name: "Чимичурри", cat: "sauce", weight: "120 г", price: 310, was: 360, pop: 68, props: ["fresh"], badge: "SALE", img: "assets/products/ai-banner.jpg" },
      { id: "burger", name: "Котлеты для бургера", cat: "semi", weight: "4 шт", price: 690, pop: 72, props: ["frozen","chilled"], img: "assets/products/beef.jpg" }
    ];

    const state = {
      cat: "all",
      sort: "pop",
      maxPrice: 7000,
      props: new Set(["chilled", "fresh"]),
      address: "",
      cart: [],
      pending: null,
      productId: null,
      weight: null,
      qty: 1
    };

    const WEIGHTS = ["~250 г", "~350 г", "~500 г", "1 кг"];

    const $ = (id) => document.getElementById(id);
    const rub = (n) => new Intl.NumberFormat("ru-RU").format(n) + " ₽";
    const cartTotal = () => state.cart.reduce((s, l) => s + l.price * l.qty, 0);
    const cartCount = () => state.cart.reduce((s, l) => s + l.qty, 0);

    function openLayer(id) {
      $("shade").hidden = false;
      ["product", "cart", "address", "auth"].forEach((n) => { $(n).hidden = n !== id; });
    }
    function closeLayers() {
      $("shade").hidden = true;
      ["product", "cart", "address", "auth"].forEach((n) => { $(n).hidden = true; });
      state.productId = null;
    }

    function paintChrome() {
      const count = cartCount();
      const badge = $("cart-count");
      badge.hidden = count === 0;
      badge.textContent = String(count);
      $("dock").hidden = count === 0;
      if (count) $("dock").textContent = "К заказу · " + rub(cartTotal());
      $("address-chip").textContent = state.address || "Омск";
    }

    function activeProps() {
      return [...$("props").querySelectorAll("input:checked")].map((i) => i.value);
    }

    function filtered() {
      const props = activeProps();
      let list = PRODUCTS.filter((p) => {
        if (state.cat !== "all" && p.cat !== state.cat) return false;
        if (p.price > state.maxPrice) return false;
        if (props.length && !props.some((pr) => p.props.includes(pr))) return false;
        return true;
      });
      if (state.sort === "price") list = list.slice().sort((a, b) => a.price - b.price);
      else if (state.sort === "sale") list = list.slice().sort((a, b) => Number(!!b.was) - Number(!!a.was) || a.price - b.price);
      else list = list.slice().sort((a, b) => b.pop - a.pop);
      return list;
    }

    function renderCats() {
      $("cats").innerHTML = CATS.map((c) =>
        '<button type="button" data-cat="' + c.id + '" aria-pressed="' + String(state.cat === c.id) + '">' + c.title + '</button>'
      ).join("");
    }

    function renderGrid() {
      const list = filtered();
      $("shown").textContent = "Показано " + list.length + " " + (list.length === 1 ? "товар" : list.length < 5 ? "товара" : "товаров");
      $("grid").setAttribute("aria-busy", "false");
      if (!list.length) {
        $("grid").innerHTML = '<p class="empty">Ничего не нашлось. Снимите часть фильтров.</p>';
        return;
      }
      $("grid").innerHTML = list.map((p) =>
        '<button type="button" class="card" data-open="' + p.id + '">' +
          '<div class="plate">' +
            '<img src="' + p.img + '" alt="" loading="lazy">' +
            (p.badge ? '<span class="badge' + (p.badge === "TOP" ? " top" : "") + '">' + p.badge + '</span>' : "") +
            (p.marble ? '<span class="marble">' + p.marble + '</span>' : "") +
          '</div>' +
          '<div class="card-body">' +
            '<h3>' + p.name + '</h3>' +
            '<div class="meta-row">' +
              '<span class="weight">' + p.weight + '</span>' +
              '<div class="price">' + (p.was ? "<s>" + rub(p.was) + "</s>" : "") + rub(p.price) + '</div>' +
            '</div>' +
            '<span class="add" data-add="' + p.id + '">+ В корзину</span>' +
          '</div>' +
        '</button>'
      ).join("");
    }

    function renderCart() {
      const lines = state.cart.map((line) =>
        '<div class="line"><div><strong>' + line.name + '</strong><br><span class="muted">' + line.note + '</span></div>' +
        '<div><div class="qty"><button type="button" data-dec="' + line.key + '">−</button><span>' + line.qty + '</span>' +
        '<button type="button" data-inc="' + line.key + '">+</button></div><div>' + rub(line.price * line.qty) + '</div></div></div>'
      ).join("");
      $("cart").innerHTML =
        '<button class="close" type="button" data-close aria-label="Закрыть">×</button>' +
        '<h2 id="cart-title">Корзина</h2>' +
        (lines || '<p class="muted">Пока пусто.</p>') +
        '<p><strong>Итого ' + rub(cartTotal()) + '</strong></p>' +
        '<button class="btn btn-accent" id="checkout" type="button"' + (cartCount() ? "" : " disabled") + '>Оформить в макете</button>' +
        '<p class="muted" id="checkout-note"></p>';
    }

    function openProduct(id) {
      const p = PRODUCTS.find((x) => x.id === id);
      if (!p) return;
      state.productId = p.id;
      state.weight = p.weight;
      state.qty = 1;
      renderProduct();
      openLayer("product");
    }

    function renderProduct() {
      const p = PRODUCTS.find((x) => x.id === state.productId);
      if (!p) return;
      const weights = Array.from(new Set([p.weight].concat(WEIGHTS)));
      $("product").innerHTML =
        '<div class="dish-visual">' +
          '<button class="close" type="button" data-close aria-label="Закрыть">×</button>' +
          '<button class="fav" type="button" aria-label="В избранное" aria-pressed="false">♡</button>' +
          '<img src="' + p.img + '" alt="' + p.name + '">' +
        '</div>' +
        '<div class="dish-sheet">' +
          '<h2 id="product-title">' + p.name + '</h2>' +
          '<p class="price-lg">' + (p.was ? "<s>" + rub(p.was) + "</s>" : "") + rub(p.price) + '</p>' +
          (p.marble ? '<p class="dish-meta">' + p.marble + '</p>' : '<p class="dish-meta">' + p.weight + '</p>') +
          '<p class="field-label">Вес</p>' +
          '<div class="weights">' +
            weights.map((w) =>
              '<button type="button" data-weight="' + w + '" aria-pressed="' + String(state.weight === w) + '">' + w + '</button>'
            ).join("") +
          '</div>' +
          '<div class="qty-row">' +
            '<div class="stepper">' +
              '<button type="button" data-qty="-1" aria-label="Меньше">−</button>' +
              '<b>' + state.qty + '</b>' +
              '<button type="button" data-qty="1" aria-label="Больше">+</button>' +
            '</div>' +
            '<button class="add-cart" type="button" data-add-product="' + p.id + '">В корзину · ' + rub(p.price * state.qty) + '</button>' +
          '</div>' +
        '</div>';
    }

    function addProduct(p, opts) {
      const note = (opts && opts.weight) || p.weight;
      const qty = (opts && opts.qty) || 1;
      const key = p.id + "|" + note;
      const found = state.cart.find((l) => l.key === key);
      if (found) found.qty += qty;
      else state.cart.push({ key, name: p.name, note, price: p.price, qty });
      paintChrome();
    }

    function tryAdd(id, opts) {
      const p = PRODUCTS.find((x) => x.id === id);
      if (!p) return;
      if (!state.address) {
        state.pending = { id, opts: opts || null };
        openLayer("address");
        return;
      }
      addProduct(p, opts);
      renderCart();
      openLayer("cart");
    }

    document.querySelectorAll("[data-theme-set]").forEach((btn) => {
      btn.addEventListener("click", () => applyTheme(btn.dataset.themeSet));
    });
    applyTheme(document.documentElement.getAttribute("data-theme") || "wine");

    $("burger").onclick = () => {
      const open = !$("menu-pop").classList.contains("open");
      $("menu-pop").classList.toggle("open", open);
      $("burger").setAttribute("aria-expanded", String(open));
    };
    $("open-cart").onclick = () => { renderCart(); openLayer("cart"); };
    $("dock").onclick = () => { renderCart(); openLayer("cart"); };
    $("login").onclick = () => openLayer("auth");
    $("address-chip").onclick = () => openLayer("address");
    $("price-max").oninput = () => {
      state.maxPrice = Number($("price-max").value);
      $("price-max-label").textContent = rub(state.maxPrice);
      renderGrid();
    };

    document.body.addEventListener("click", (event) => {
      const cat = event.target.closest("[data-cat]");
      if (cat) {
        state.cat = cat.dataset.cat;
        renderCats();
        renderGrid();
      }
      const sort = event.target.closest("[data-sort]");
      if (sort) {
        state.sort = sort.dataset.sort;
        document.querySelectorAll("[data-sort]").forEach((b) => b.setAttribute("aria-pressed", String(b === sort)));
        renderGrid();
      }
      const addQuick = event.target.closest("[data-add]");
      if (addQuick) {
        event.preventDefault();
        event.stopPropagation();
        tryAdd(addQuick.dataset.add);
        return;
      }
      const openCard = event.target.closest("[data-open]");
      if (openCard && !event.target.closest("[data-add]")) {
        openProduct(openCard.dataset.open);
        return;
      }
      const weightBtn = event.target.closest("[data-weight]");
      if (weightBtn) {
        state.weight = weightBtn.dataset.weight;
        renderProduct();
        return;
      }
      const qtyBtn = event.target.closest("[data-qty]");
      if (qtyBtn) {
        state.qty = Math.max(1, state.qty + Number(qtyBtn.dataset.qty));
        renderProduct();
        return;
      }
      const addFromProduct = event.target.closest("[data-add-product]");
      if (addFromProduct) {
        tryAdd(addFromProduct.dataset.addProduct, { weight: state.weight, qty: state.qty });
        return;
      }
      const fav = event.target.closest(".fav");
      if (fav) {
        const on = fav.getAttribute("aria-pressed") === "true";
        fav.setAttribute("aria-pressed", String(!on));
        fav.textContent = on ? "♡" : "♥";
        return;
      }
      if (event.target.closest("[data-close]") || event.target.id === "shade") closeLayers();
      const dec = event.target.closest("[data-dec]");
      const inc = event.target.closest("[data-inc]");
      if (dec || inc) {
        const key = (dec || inc).dataset.dec || (dec || inc).dataset.inc;
        const line = state.cart.find((l) => l.key === key);
        if (!line) return;
        line.qty += inc ? 1 : -1;
        if (line.qty <= 0) state.cart = state.cart.filter((l) => l !== line);
        paintChrome();
        renderCart();
      }
      if (event.target.id === "checkout") $("checkout-note").textContent = "Макет останавливается здесь.";
    });

    $("props").addEventListener("change", renderGrid);

    $("address").onsubmit = (event) => {
      event.preventDefault();
      state.address = $("street").value.trim();
      paintChrome();
      if (state.pending && state.address) {
        const pending = state.pending;
        state.pending = null;
        const id = typeof pending === "string" ? pending : pending.id;
        const opts = typeof pending === "string" ? null : pending.opts;
        addProduct(PRODUCTS.find((p) => p.id === id), opts);
        renderCart();
        openLayer("cart");
      } else closeLayers();
    };
    $("auth").onsubmit = (event) => {
      event.preventDefault();
      closeLayers();
      $("login").innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M5 12l5 5L20 7"/></svg>';
    };
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeLayers();
    });

    if (location.hash === "#sale") {
      state.sort = "sale";
      document.querySelectorAll("[data-sort]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.sort === "sale")));
    }

    $("price-max-label").textContent = rub(state.maxPrice);
    renderCats();
    renderGrid();
    paintChrome();
