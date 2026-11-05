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
    document.querySelectorAll("[data-theme-set]").forEach((btn) => {
      btn.addEventListener("click", () => applyTheme(btn.dataset.themeSet));
    });
    applyTheme(document.documentElement.getAttribute("data-theme") || "wine");

    const state = { address: "", cart: [], mode: "delivery" };
    const $ = (id) => document.getElementById(id);
    const rub = (n) => new Intl.NumberFormat("ru-RU").format(n) + " ₽";
    const cartTotal = () => state.cart.reduce((s, l) => s + l.price * l.qty, 0);
    const cartCount = () => state.cart.reduce((s, l) => s + l.qty, 0);

    function openLayer(id) {
      $("shade").hidden = false;
      ["cart", "address", "auth"].forEach((n) => { $(n).hidden = n !== id; });
    }
    function closeLayers() {
      $("shade").hidden = true;
      ["cart", "address", "auth"].forEach((n) => { $(n).hidden = true; });
    }

    function paintChrome() {
      const count = cartCount();
      const heroBadge = $("cart-count-hero");
      heroBadge.hidden = count === 0;
      heroBadge.textContent = String(count);
      const chip = $("address-chip");
      if (chip) {
        chip.textContent = state.mode === "pickup"
          ? "Самовывоз"
          : (state.address || "Омск");
      }
      $("mode-delivery").setAttribute("aria-pressed", String(state.mode === "delivery"));
      $("mode-pickup").setAttribute("aria-pressed", String(state.mode === "pickup"));
      $("dock").hidden = count === 0;
      if (count) $("dock").textContent = "К заказу · " + rub(cartTotal());
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
        (lines || '<p class="muted">Пока пусто. Товары добавляются в каталоге.</p>') +
        '<p><strong>Итого ' + rub(cartTotal()) + '</strong></p>' +
        '<a class="btn btn-accent" href="catalog.html" style="text-align:center">Открыть каталог</a>';
    }

    $("open-cart-hero").onclick = () => { renderCart(); openLayer("cart"); };
    $("dock").onclick = () => { renderCart(); openLayer("cart"); };
    $("login-hero").onclick = () => openLayer("auth");
    $("login-cta").onclick = () => openLayer("auth");
    $("address-chip").onclick = () => openLayer("address");
    $("address-chip-mobile").onclick = () => { $("menu-pop").classList.remove("open"); openLayer("address"); };
    $("mode-delivery").onclick = () => { state.mode = "delivery"; paintChrome(); };
    $("mode-pickup").onclick = () => { state.mode = "pickup"; paintChrome(); };
    $("burger").onclick = () => {
      const pop = $("menu-pop");
      const open = !pop.classList.contains("open");
      pop.classList.toggle("open", open);
      $("burger").setAttribute("aria-expanded", String(open));
    };
    $("privacy-link").onclick = (e) => {
      e.preventDefault();
      const note = $("privacy-note");
      note.hidden = false;
      note.tabIndex = -1;
      note.focus();
    };

    document.body.addEventListener("click", (event) => {
      const jump = event.target.closest("[data-jump]");
      if (jump) {
        const target = document.getElementById(jump.dataset.jump);
        if (target) target.scrollIntoView({ behavior: "smooth" });
        $("menu-pop").classList.remove("open");
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
    });

    $("address").onsubmit = (event) => {
      event.preventDefault();
      state.address = $("street").value.trim();
      paintChrome();
      closeLayers();
    };
    $("auth").onsubmit = (event) => {
      event.preventDefault();
      closeLayers();
      $("login-hero").innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M5 12l5 5L20 7"/></svg>';
      $("login-cta").textContent = "Вы в макете";
    };
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeLayers();
    });

    paintChrome();
