(function (RAVEN) {
  "use strict";

  var KEY = "raven.cart.v1";
  var SHIP_FREE_OVER = 1500;
  var SHIP_FLAT = 45;

  var listeners = [];

  var state = {
    cart: [],
    filters: {
      categories: [],
      brands: [],
      maxPrice: null,
      inStockOnly: false,
    },
    sort: "featured",
    query: "",
    route: { name: "home", params: {} },
  };

  function read() {
    try {
      var raw = window.localStorage.getItem(KEY);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter(function (l) {
          return l && RAVEN.data.get(l.id) && l.qty > 0;
        })
        .map(function (l) {
          return { id: l.id, qty: Math.min(10, Math.max(1, l.qty | 0)) };
        });
    } catch (e) {
      return [];
    }
  }

  function write() {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state.cart));
    } catch (e) {}
  }

  function emit() {
    listeners.forEach(function (fn) {
      fn(state);
    });
  }

  function money(n) {
    return (
      "$" +
      Number(n).toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })
    );
  }

  function find(id) {
    for (var i = 0; i < state.cart.length; i++)
      if (state.cart[i].id === id) return state.cart[i];
    return null;
  }

  function add(id, qty) {
    var p = RAVEN.data.get(id);
    if (!p) return 0;
    var line = find(id);
    var want = (line ? line.qty : 0) + (qty || 1);
    var capped = Math.min(want, Math.max(1, p.stock), 10);
    if (line) line.qty = capped;
    else state.cart.push({ id: id, qty: capped });
    write();
    emit();
    return capped;
  }

  function setQty(id, qty) {
    var p = RAVEN.data.get(id);
    var line = find(id);
    if (!line || !p) return;
    var next = Math.min(Math.max(0, qty | 0), Math.max(1, p.stock), 10);
    if (next === 0) remove(id);
    else {
      line.qty = next;
      write();
      emit();
    }
  }

  function remove(id) {
    state.cart = state.cart.filter(function (l) {
      return l.id !== id;
    });
    write();
    emit();
  }

  function clear() {
    state.cart = [];
    write();
    emit();
  }

  function lines() {
    return state.cart
      .map(function (l) {
        var p = RAVEN.data.get(l.id);
        return { product: p, qty: l.qty, line: p.price * l.qty };
      })
      .filter(function (l) {
        return !!l.product;
      });
  }

  function count() {
    return state.cart.reduce(function (n, l) {
      return n + l.qty;
    }, 0);
  }

  function totals() {
    var subtotal = lines().reduce(function (n, l) {
      return n + l.line;
    }, 0);
    var shipping =
      subtotal === 0 ? 0 : subtotal >= SHIP_FREE_OVER ? 0 : SHIP_FLAT;
    return {
      subtotal: subtotal,
      shipping: shipping,
      total: subtotal + shipping,
      freeShipping: subtotal >= SHIP_FREE_OVER,
      toFreeShipping: Math.max(0, SHIP_FREE_OVER - subtotal),
    };
  }

  function matches(p, f) {
    if (f.categories.length && f.categories.indexOf(p.category) === -1)
      return false;
    if (f.brands.length && f.brands.indexOf(p.brand) === -1) return false;
    if (f.maxPrice != null && p.price > f.maxPrice) return false;
    if (f.inStockOnly && p.stock <= 0) return false;
    return true;
  }

  var SORTS = {
    featured: function (a, b) {
      return (
        b.featured - a.featured ||
        b.rating - a.rating ||
        a.name.localeCompare(b.name)
      );
    },
    "price-asc": function (a, b) {
      return a.price - b.price;
    },
    "price-desc": function (a, b) {
      return b.price - a.price;
    },
    newest: function (a, b) {
      return b.year - a.year || b.rating - a.rating;
    },
    rating: function (a, b) {
      return b.rating - a.rating || b.reviews - a.reviews;
    },
    name: function (a, b) {
      return a.name.localeCompare(b.name);
    },
  };

  var SORT_LABELS = [
    ["featured", "Featured"],
    ["price-asc", "Price, low to high"],
    ["price-desc", "Price, high to low"],
    ["newest", "Newest arrivals"],
    ["rating", "Best rated"],
    ["name", "Name, A to Z"],
  ];

  function results() {
    var f = state.filters;
    var out = RAVEN.data.products.filter(function (p) {
      return matches(p, f);
    });
    out.sort(SORTS[state.sort] || SORTS.featured);
    return out;
  }

  function countFor(key, value) {
    var f = {
      categories: key === "categories" ? [value] : state.filters.categories,
      brands: key === "brands" ? [value] : state.filters.brands,
      maxPrice: state.filters.maxPrice,
      inStockOnly: state.filters.inStockOnly,
    };
    if (key === "categories") f.categories = [value];
    if (key === "brands") f.brands = [value];
    return RAVEN.data.products.filter(function (p) {
      return matches(p, f);
    }).length;
  }

  function toggleFacet(key, value) {
    var arr = state.filters[key];
    var i = arr.indexOf(value);
    if (i === -1) arr.push(value);
    else arr.splice(i, 1);
    emit();
  }

  function setFilter(key, value) {
    state.filters[key] = value;
    emit();
  }
  function setSort(v) {
    state.sort = v;
    emit();
  }
  function clearFilters() {
    state.filters = {
      categories: [],
      brands: [],
      maxPrice: null,
      inStockOnly: false,
    };
    emit();
  }
  function activeFilterCount() {
    var f = state.filters;
    return (
      f.categories.length +
      f.brands.length +
      (f.maxPrice != null ? 1 : 0) +
      (f.inStockOnly ? 1 : 0)
    );
  }

  function search(q) {
    var term = String(q || "")
      .trim()
      .toLowerCase();
    if (term.length < 2) return [];
    var words = term.split(/\s+/);
    return RAVEN.data.products
      .map(function (p) {
        var score = 0;
        words.forEach(function (w) {
          if (p.name.toLowerCase().indexOf(w) >= 0) score += 6;
          if (p.brandLabel.toLowerCase().indexOf(w) >= 0) score += 4;
          if (p.categoryLabel.toLowerCase().indexOf(w) >= 0) score += 3;
          if (p.searchText.indexOf(w) >= 0) score += 1;
        });
        return { p: p, score: score };
      })
      .filter(function (r) {
        return r.score > 0;
      })
      .sort(function (a, b) {
        return b.score - a.score || a.p.price - b.p.price;
      })
      .slice(0, 6)
      .map(function (r) {
        return r.p;
      });
  }

  RAVEN.store = {
    state: state,
    subscribe: function (fn) {
      listeners.push(fn);
    },
    emit: emit,
    hydrate: function () {
      state.cart = read();
    },
    money: money,
    add: add,
    setQty: setQty,
    remove: remove,
    clear: clear,
    lines: lines,
    count: count,
    totals: totals,
    results: results,
    countFor: countFor,
    toggleFacet: toggleFacet,
    setFilter: setFilter,
    setSort: setSort,
    clearFilters: clearFilters,
    activeFilterCount: activeFilterCount,
    sortLabels: SORT_LABELS,
    search: search,
    shipping: { freeOver: SHIP_FREE_OVER, flat: SHIP_FLAT },
  };
})((window.RAVEN = window.RAVEN || {}));
