(function (RAVEN) {
  "use strict";

  var ui = RAVEN.ui,
    store = RAVEN.store,
    views = RAVEN.views,
    data = RAVEN.data;

  var viewHost,
    firstRender = true,
    pdpQty = 1;

  var TITLES = {
    home: "RAVEN — guitars, set up by hand",
    shop: "The floor — RAVEN",
    product: "RAVEN",
    story: "The RAVEN story",
    contact: "Contact RAVEN",
    cart: "Your cart — RAVEN",
    notFound: "Not found — RAVEN",
  };

  function parseHash() {
    var raw = window.location.hash.replace(/^#/, "");
    var parts = raw.split("?");
    var path = parts[0] || "/";
    var query = {};
    (parts[1] || "").split("&").forEach(function (pair) {
      if (!pair) return;
      var kv = pair.split("=");
      query[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || "");
    });
    var seg = path.split("/").filter(Boolean);
    if (!seg.length) return { name: "home", params: {}, query: query };
    if (seg[0] === "shop") return { name: "shop", params: {}, query: query };
    if (seg[0] === "product" && seg[1])
      return { name: "product", params: { id: seg[1] }, query: query };
    if (seg[0] === "story") return { name: "story", params: {}, query: query };
    if (seg[0] === "contact")
      return { name: "contact", params: {}, query: query };
    if (seg[0] === "cart") return { name: "cart", params: {}, query: query };
    return { name: "notFound", params: {}, query: query };
  }

  function render() {
    var route = parseHash();
    store.state.route = route;

    if (route.name === "shop" && route.query.cat) {
      var cat = route.query.cat;
      if (
        data.categories.some(function (c) {
          return c.id === cat;
        })
      ) {
        store.state.filters.categories = [cat];
      }
    }

    var view = views[route.name] || views.notFound;
    pdpQty = 1;
    viewHost.innerHTML = view.render(route.params);
    viewHost.classList.remove("view-enter");
    void viewHost.offsetWidth;
    viewHost.classList.add("view-enter");

    document.title =
      route.name === "product" && data.get(route.params.id)
        ? data.get(route.params.id).name + " — RAVEN"
        : TITLES[route.name] || TITLES.home;

    syncNav(route);
    ui.observeReveals(viewHost);

    if (!firstRender) {
      window.scrollTo({ top: 0, behavior: "auto" });
      var heading = viewHost.querySelector("h1, h2");
      if (heading) {
        heading.setAttribute("tabindex", "-1");
        try {
          heading.focus({ preventScroll: true });
        } catch (e) {
          heading.focus();
        }
      }
    }
    firstRender = false;
  }

  function syncNav(route) {
    var map = {
      home: "#/",
      shop: "#/shop",
      story: "#/story",
      contact: "#/contact",
      cart: "#/cart",
    };
    var want = map[route.name];
    Array.prototype.forEach.call(
      document.querySelectorAll("[data-nav]"),
      function (a) {
        if (a.getAttribute("href") === want)
          a.setAttribute("aria-current", "page");
        else a.removeAttribute("aria-current");
      },
    );
  }

  function syncCartCount() {
    var n = store.count();
    var badge = document.getElementById("cart-count");
    var btn = document.getElementById("cart-button");
    if (badge) {
      badge.textContent = n;
      badge.hidden = n === 0;
    }
    if (btn)
      btn.setAttribute(
        "aria-label",
        n
          ? "Open cart, " + n + " item" + (n === 1 ? "" : "s")
          : "Open cart, empty",
      );
  }

  function toggleMobileNav(force) {
    var panel = document.getElementById("mobile-nav");
    var btn = document.getElementById("nav-toggle");
    var open = force != null ? force : panel.hidden;
    panel.hidden = !open;
    btn.setAttribute("aria-expanded", String(open));
    btn.innerHTML = open ? ui.icon("close") : ui.icon("menu");
  }

  function openCart() {
    ui.openOverlay("cart", views.cartDrawerHTML());
  }

  function refreshCartOverlay() {
    if (!ui.isOpen("cart")) return;
    var root = document.getElementById("overlay-root");
    var active = document.activeElement;
    var tag =
      active && active.getAttribute ? active.getAttribute("data-action") : null;
    var id =
      active && active.getAttribute ? active.getAttribute("data-id") : null;
    root.innerHTML =
      '<div class="scrim" data-action="close-overlay"></div>' +
      views.cartDrawerHTML();
    if (tag) {
      var sel =
        '[data-action="' + tag + '"]' + (id ? '[data-id="' + id + '"]' : "");
      var next = root.querySelector(sel);
      if (next && !next.disabled) {
        try {
          next.focus({ preventScroll: true });
        } catch (e) {
          /* ignore */
        }
      }
    }
  }

  function openSearch() {
    ui.openOverlay("search", views.searchPanelHTML("", []), {
      focus: "#search-input",
    });
  }

  function runSearch(value) {
    var host = document.getElementById("search-results-host");
    if (!host) return;
    host.innerHTML = views.searchResultsHTML(value, store.search(value));
  }

  function refreshShop() {
    var host = document.getElementById("shop-results");
    if (!host) return;
    host.innerHTML = views.shopResults();
    ui.observeReveals(host);
    Array.prototype.forEach.call(
      document.querySelectorAll("[data-facet]"),
      function (input) {
        var key = input.getAttribute("data-facet");
        var out = input.parentNode.querySelector("span:last-child");
        if (out) out.textContent = store.countFor(key, input.value);
      },
    );
    var clearBtn = document.querySelector(
      '.filters [data-action="clear-filters"]',
    );
    if (clearBtn) clearBtn.disabled = store.activeFilterCount() === 0;
    ui.announce(store.results().length + " instruments match");
  }

  function toggleFilters() {
    var panel = document.getElementById("filters");
    var btn = document.querySelector(".filters-toggle");
    if (!panel || !btn) return;
    var collapsed = panel.getAttribute("data-collapsed") !== "false";
    panel.setAttribute("data-collapsed", collapsed ? "false" : "true");
    btn.setAttribute("aria-expanded", String(collapsed));
  }

  function setGalleryView(id, view, button) {
    var p = data.get(id);
    var stage = document.getElementById("stage");
    if (!p || !stage) return;
    stage.innerHTML = RAVEN.art.render(p, { view: view, eager: true });
    Array.prototype.forEach.call(
      document.querySelectorAll(".thumb"),
      function (t) {
        t.setAttribute("aria-selected", String(t === button));
      },
    );
  }

  function setTab(name) {
    Array.prototype.forEach.call(
      document.querySelectorAll('[data-action="tab"]'),
      function (t) {
        t.setAttribute(
          "aria-selected",
          String(t.getAttribute("data-tab") === name),
        );
      },
    );
    Array.prototype.forEach.call(
      document.querySelectorAll("[data-tabpanel]"),
      function (panel) {
        panel.hidden = panel.getAttribute("data-tabpanel") !== name;
      },
    );
  }

  function bumpPdpQty(step, id) {
    var p = data.get(id || (store.state.route.params || {}).id);
    var max = p ? Math.min(Math.max(1, p.stock), 10) : 10;
    pdpQty = Math.min(max, Math.max(1, pdpQty + step));
    var out = document.getElementById("pdp-qty");
    if (out) out.textContent = pdpQty;
  }

  function validateContact(form) {
    var ok = true;
    [
      ["c-name", "Tell us who you are."],
      ["c-email", "We need an address to reply to."],
      ["c-message", "Add a message so we know what to answer."],
    ].forEach(function (pair) {
      var field = document.getElementById(pair[0]);
      var err = form.querySelector('[data-error-for="' + pair[0] + '"]');
      var value = field.value.trim();
      var bad = !value;
      if (
        !bad &&
        pair[0] === "c-email" &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      ) {
        bad = true;
        err.textContent = "That address is missing an @ or a domain.";
      } else if (bad) {
        err.textContent = pair[1];
      }
      field.setAttribute("aria-invalid", String(bad));
      err.hidden = !bad;
      if (bad && ok) {
        field.focus();
      }
      if (bad) ok = false;
    });
    return ok;
  }

  function onClick(e) {
    var link = e.target.closest ? e.target.closest('a[href^="#/"]') : null;
    var el = e.target.closest ? e.target.closest("[data-action]") : null;
    var action = el ? el.getAttribute("data-action") : null;

    if (action === "close-overlay") {
      ui.closeOverlay();
      if (link) {
      } else {
        e.preventDefault();
        return;
      }
    }

    if (link && !action) {
      if (ui.isOpen()) ui.closeOverlay();
      toggleMobileNav(false);
      return;
    }

    if (!action) return;

    switch (action) {
      case "open-cart":
        e.preventDefault();
        openCart();
        break;
      case "open-search":
        e.preventDefault();
        openSearch();
        break;
      case "nav-toggle":
        e.preventDefault();
        toggleMobileNav();
        break;
      case "add-to-cart": {
        e.preventDefault();
        var id = el.getAttribute("data-id");
        var product = data.get(id);
        var qty = document.getElementById("pdp-qty") ? pdpQty : 1;
        var now = store.add(id, qty);
        ui.toast(product.name + " added — " + now + " in your cart");
        ui.announce(product.name + " added to cart");
        openCart();
        break;
      }
      case "line-qty": {
        e.preventDefault();
        var lid = el.getAttribute("data-id");
        var step = parseInt(el.getAttribute("data-step"), 10);
        var line = store.lines().filter(function (l) {
          return l.product.id === lid;
        })[0];
        if (line) store.setQty(lid, line.qty + step);
        break;
      }
      case "remove-line": {
        e.preventDefault();
        var rid = el.getAttribute("data-id");
        var rp = data.get(rid);
        store.remove(rid);
        ui.announce((rp ? rp.name : "Item") + " removed from cart");
        break;
      }
      case "clear-cart":
        e.preventDefault();
        store.clear();
        ui.announce("Cart emptied");
        break;
      case "pdp-qty":
        e.preventDefault();
        bumpPdpQty(parseInt(el.getAttribute("data-step"), 10));
        break;
      case "set-view":
        e.preventDefault();
        setGalleryView(
          el.getAttribute("data-id"),
          el.getAttribute("data-view"),
          el,
        );
        break;
      case "tab":
        e.preventDefault();
        setTab(el.getAttribute("data-tab"));
        break;
      case "toggle-filters":
        e.preventDefault();
        toggleFilters();
        break;
      case "clear-filters":
        e.preventDefault();
        store.clearFilters();
        syncFilterInputs();
        break;
      case "remove-chip": {
        e.preventDefault();
        var key = el.getAttribute("data-key");
        if (key === "maxPrice") store.setFilter("maxPrice", null);
        else if (key === "inStockOnly") store.setFilter("inStockOnly", false);
        else store.toggleFacet(key, el.getAttribute("data-value"));
        syncFilterInputs();
        var fallback =
          document.querySelector("#shop-results .shop-bar .filters-toggle") ||
          document.getElementById("sort");
        if (fallback) fallback.focus();
        break;
      }
      case "checkout":
        e.preventDefault();
        ui.openOverlay("checkout", views.checkoutModalHTML());
        break;
      default:
        break;
    }
  }

  function syncFilterInputs() {
    var f = store.state.filters;
    Array.prototype.forEach.call(
      document.querySelectorAll("[data-facet]"),
      function (input) {
        input.checked =
          f[input.getAttribute("data-facet")].indexOf(input.value) >= 0;
      },
    );
    var range = document.getElementById("price-range");
    var out = document.getElementById("price-out");
    if (range)
      range.value = f.maxPrice == null ? data.priceBounds.max : f.maxPrice;
    if (out)
      out.textContent = store.money(
        f.maxPrice == null ? data.priceBounds.max : f.maxPrice,
      );
    var inStock = document.getElementById("in-stock");
    if (inStock) inStock.checked = f.inStockOnly;
  }

  function onChangeOrInput(e) {
    var t = e.target;
    if (t.matches("[data-facet]")) {
      store.toggleFacet(t.getAttribute("data-facet"), t.value);
      return;
    }
    if (t.id === "in-stock") {
      store.setFilter("inStockOnly", t.checked);
      return;
    }
    if (t.id === "price-range") {
      var v = parseInt(t.value, 10);
      var out = document.getElementById("price-out");
      if (out) out.textContent = store.money(v);
      store.setFilter("maxPrice", v >= data.priceBounds.max ? null : v);
      return;
    }
    if (t.id === "sort") {
      store.setSort(t.value);
      return;
    }
    if (t.id === "search-input") {
      runSearch(t.value);
      return;
    }
  }

  function onSubmit(e) {
    var form = e.target;
    if (form.id === "contact-form") {
      e.preventDefault();
      if (!validateContact(form)) {
        ui.announce("The form has errors");
        return;
      }
      var name = document.getElementById("c-name").value.trim();
      form.hidden = true;
      var done = document.getElementById("contact-done");
      done.hidden = false;
      done.innerHTML =
        '<div class="demo-note"><b>Thank you, ' +
        ui.esc(name.split(" ")[0]) +
        ".</b> " +
        "In a production build this message would reach the bench inbox and you would get a reply the same day. " +
        "This demonstration validates the form and stops there — nothing was transmitted.</div>";
      done.setAttribute("tabindex", "-1");
      done.focus();
      ui.announce(
        "Message validated. Nothing was sent, this is a demonstration.",
      );
      return;
    }
    if (form.id === "newsletter-form") {
      e.preventDefault();
      var input = document.getElementById("news-email");
      var value = input.value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        ui.toast("That email address does not look complete.");
        input.focus();
        return;
      }
      input.value = "";
      ui.toast("Demo only — no list exists and nothing was stored.");
      ui.announce("Demonstration only, nothing was stored.");
      return;
    }
    if (form.id === "filters") e.preventDefault();
  }

  function onKeydown(e) {
    var active = document.activeElement || document.body;
    var typing = /^(INPUT|TEXTAREA|SELECT)$/.test(active.tagName || "");
    if (
      (e.key === "/" && !typing) ||
      ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")
    ) {
      e.preventDefault();
      if (!ui.isOpen("search")) openSearch();
      return;
    }
    if (ui.isOpen("search") && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      var links = Array.prototype.slice.call(
        document.querySelectorAll(".search-results a"),
      );
      if (!links.length) return;
      e.preventDefault();
      var i = links.indexOf(document.activeElement);
      var next =
        e.key === "ArrowDown"
          ? (i + 1) % links.length
          : i <= 0
            ? links.length - 1
            : i - 1;
      links[next].focus();
    }
  }

  function onImageError(e) {
    var el = e.target;
    if (
      !el ||
      el.tagName !== "IMG" ||
      !el.classList ||
      !el.classList.contains("art")
    )
      return;
    var id = el.getAttribute("data-product");
    var view = el.getAttribute("data-view");
    if (!id || !el.parentNode) return;
    var holder = document.createElement("div");
    holder.innerHTML = RAVEN.art.placeholder(
      id,
      view,
      el.getAttribute("aria-hidden") === "true",
    );
    if (holder.firstChild) el.parentNode.replaceChild(holder.firstChild, el);
  }

  function boot() {
    ui.init();
    viewHost = document.getElementById("view");
    store.hydrate();
    syncCartCount();

    store.subscribe(function () {
      syncCartCount();
      refreshCartOverlay();
      if (store.state.route.name === "shop") refreshShop();
      if (store.state.route.name === "cart") {
        viewHost.innerHTML = views.cart.render();
        ui.observeReveals(viewHost);
      }
    });

    document.addEventListener("error", onImageError, true);
    document.addEventListener("click", onClick);
    document.addEventListener("change", onChangeOrInput);
    document.addEventListener("input", onChangeOrInput);
    document.addEventListener("submit", onSubmit);
    document.addEventListener("keydown", onKeydown);
    window.addEventListener("hashchange", render);

    render();
    ui.observeReveals(document);
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", boot);
  else boot();
})((window.RAVEN = window.RAVEN || {}));
