(function (RAVEN) {
  "use strict";

  var ui = RAVEN.ui,
    art = RAVEN.art,
    store = RAVEN.store,
    data = RAVEN.data;
  var esc = ui.esc,
    money = store.money;

  function stockTag(p) {
    if (p.stock <= 0) return '<span class="stock stock--out">Sold out</span>';
    if (p.stock <= 2)
      return '<span class="stock stock--low">' + p.stock + " left</span>";
    return '<span class="stock stock--in">In stock</span>';
  }

  function priceBlock(p, big) {
    return (
      '<p class="price' +
      (big ? " price--lg" : "") +
      '">' +
      money(p.price) +
      (p.compare
        ? '<span class="price--was">' + money(p.compare) + "</span>"
        : "") +
      "</p>"
    );
  }

  function card(p) {
    return (
      '<article class="card">' +
      '<div class="card__art">' +
      art.render(p, { view: "full", decorative: true }) +
      (p.badge ? '<p class="card__badge">' + esc(p.badge) + "</p>" : "") +
      (p.compare ? '<p class="card__sale">Reduced</p>' : "") +
      "</div>" +
      '<div class="card__body">' +
      '<p class="card__brand">' +
      esc(p.brandLabel) +
      "</p>" +
      '<h3 class="card__name"><a href="#/product/' +
      p.id +
      '">' +
      esc(p.name) +
      "</a></h3>" +
      '<p class="card__spec">' +
      esc(p.finishName) +
      "</p>" +
      '<div class="card__foot">' +
      priceBlock(p) +
      stockTag(p) +
      "</div>" +
      "</div>" +
      "</article>"
    );
  }

  function grid(list) {
    return '<div class="grid-products">' + list.map(card).join("") + "</div>";
  }

  function demoNote(extra) {
    return (
      '<div class="demo-note">' +
      "<b>Concept project.</b> RAVEN is a fictional retailer built as a portfolio piece for GHOST LIGHT. " +
      "The instruments, brands, prices and reviews are invented. " +
      (extra || "") +
      "</div>"
    );
  }

  var home = {
    render: function () {
      var featured = data.products
        .filter(function (p) {
          return p.featured;
        })
        .slice(0, 4);
      var hero = data.get("nightjar-standard");
      var steps = [
        [
          "01",
          "Intake",
          "Every instrument is unboxed, photographed and logged against its serial before it reaches the wall.",
        ],
        [
          "02",
          "The bench",
          "Fret level checked with a notched straightedge, nut slots cut to the shipped gauge, electronics tested.",
        ],
        [
          "03",
          "Play test",
          "An hour minimum through a valve amp. Anything that buzzes above the twelfth fret goes back.",
        ],
        [
          "04",
          "Pack",
          "Strings slackened a tone, headstock braced, double-boxed with the setup sheet inside the case.",
        ],
      ];
      return (
        "" +
        '<section class="hero">' +
        '<div class="container hero__inner">' +
        '<div class="hero__copy">' +
        '<p class="eyebrow">Middle of nowhere · Est. sometime</p>' +
        '<h1 class="hero__title">Nothing leaves<em>until it plays right</em></h1>' +
        '<p class="lede">A small room with nineteen instruments on the wall. Every one is set up on our bench, ' +
        "played for an hour, and photographed the day it arrives. If it is listed here, it exists and it is ready.</p>" +
        '<div class="hero__actions">' +
        '<a class="btn" href="#/shop">Browse the floor</a>' +
        '<a class="link-arrow" href="#/story">How we work ' +
        ui.icon("arrow", 15) +
        "</a>" +
        "</div>" +
        '<dl class="hero__stats">' +
        '<div class="hero__stat"><dt>On the wall</dt><dd>' +
        data.products.length +
        "</dd></div>" +
        '<div class="hero__stat"><dt>Bench setup</dt><dd>Included</dd></div>' +
        '<div class="hero__stat"><dt>Dispatch</dt><dd>48 hrs</dd></div>' +
        '<div class="hero__stat"><dt>Returns</dt><dd>30 days</dd></div>' +
        "</dl>" +
        "</div>" +
        '<div class="hero__art">' +
        art.render(hero, { view: "full", decorative: true, eager: true }) +
        '<p class="hero__caption"><b>' +
        esc(hero.name) +
        "</b>" +
        esc(hero.finishName) +
        "</p>" +
        "</div>" +
        "</div>" +
        "</section>" +
        '<nav class="cat-strip" aria-label="Shop by category">' +
        data.categories
          .map(function (c) {
            var n = data.products.filter(function (p) {
              return p.category === c.id;
            }).length;
            return (
              '<a class="cat-card" href="#/shop?cat=' +
              c.id +
              '">' +
              '<span class="cat-card__name">' +
              esc(c.label) +
              "</span>" +
              '<span class="cat-card__meta">' +
              esc(c.blurb) +
              "</span>" +
              '<span class="cat-card__count">' +
              n +
              " in stock</span>" +
              "</a>"
            );
          })
          .join("") +
        "</nav>" +
        '<section class="section container reveal">' +
        '<div class="section-head">' +
        '<div><p class="eyebrow">Currently on the wall</p><h2>This month&rsquo;s four</h2></div>' +
        '<a class="link-arrow" href="#/shop">All instruments ' +
        ui.icon("arrow", 15) +
        "</a>" +
        "</div>" +
        grid(featured) +
        "</section>" +
        '<section class="section section--edge container reveal">' +
        '<div class="split">' +
        '<div class="stack">' +
        '<p class="eyebrow">The shop</p>' +
        '<h2 style="font-size:var(--step-3)">We buy fewer guitars than we could sell</h2>' +
        '<p class="muted">RAVEN keeps a deliberately small floor. Nineteen instruments, six makers, and a bench ' +
        "in the back room that sees every one of them before a customer does. We would rather explain why we " +
        "do not stock something than sell you a guitar we have not played.</p>" +
        '<a class="link-arrow" href="#/story">Read the whole story ' +
        ui.icon("arrow", 15) +
        "</a>" +
        "</div>" +
        '<blockquote class="quote">A guitar that fights you is not a cheap guitar. It is an unfinished one.' +
        "<cite>Mara Vance, founder</cite></blockquote>" +
        "</div>" +
        "</section>" +
        '<section class="section section--edge container reveal">' +
        '<div class="section-head">' +
        '<div><p class="eyebrow">Before it ships</p><h2>Four things happen first</h2></div>' +
        "<p>In order, to every instrument on this site</p>" +
        "</div>" +
        '<div class="promise-grid">' +
        steps
          .map(function (s) {
            return (
              '<div class="promise"><span class="promise__num">' +
              s[0] +
              "</span><h3>" +
              esc(s[1]) +
              "</h3><p>" +
              esc(s[2]) +
              "</p></div>"
            );
          })
          .join("") +
        "</div>" +
        "</section>" +
        '<section class="section--tight container reveal">' +
        demoNote(
          "Checkout, stock levels and the contact form are front-end demonstrations — nothing is charged, reserved or sent.",
        ) +
        "</section>"
      );
    },
  };

  var shop = {
    render: function () {
      var f = store.state.filters;
      var bounds = data.priceBounds;
      var maxPrice = f.maxPrice == null ? bounds.max : f.maxPrice;

      function facet(key, items, labelKey) {
        return items
          .map(function (it) {
            var checked = store.state.filters[key].indexOf(it.id) >= 0;
            return (
              '<label class="check">' +
              '<input type="checkbox" data-facet="' +
              key +
              '" value="' +
              it.id +
              '"' +
              (checked ? " checked" : "") +
              ">" +
              "<span>" +
              esc(it[labelKey]) +
              "</span>" +
              "<span>" +
              store.countFor(key, it.id) +
              "</span>" +
              "</label>"
            );
          })
          .join("");
      }

      return (
        "" +
        '<div class="container section--tight">' +
        '<nav class="breadcrumb" aria-label="Breadcrumb"><a href="#/">Home</a><span>/</span>The floor</nav>' +
        "</div>" +
        '<div class="container">' +
        '<div class="section-head">' +
        '<div><p class="eyebrow">Everything we have</p><h2>The floor</h2></div>' +
        "<p>Stock counts are live against the shop&rsquo;s own ledger, updated each morning.</p>" +
        "</div>" +
        '<div class="shop-layout">' +
        '<form class="filters" id="filters" data-collapsed="true" aria-label="Filter instruments">' +
        '<div class="filters__head">' +
        "<h2>Refine</h2>" +
        '<button type="button" class="btn--quiet btn" data-action="clear-filters"' +
        (store.activeFilterCount() ? "" : " disabled") +
        ">Clear all</button>" +
        "</div>" +
        '<div class="filter-group"><h3>Category</h3>' +
        facet("categories", data.categories, "label") +
        "</div>" +
        '<div class="filter-group"><h3>Maker</h3>' +
        facet("brands", data.brands, "label") +
        "</div>" +
        '<div class="filter-group"><h3>Maximum price</h3>' +
        '<div class="range-row"><span>' +
        money(bounds.min) +
        '</span><span id="price-out">' +
        money(maxPrice) +
        "</span></div>" +
        '<input type="range" id="price-range" min="' +
        bounds.min +
        '" max="' +
        bounds.max +
        '" step="20" value="' +
        maxPrice +
        '" aria-label="Maximum price">' +
        "</div>" +
        '<div class="filter-group"><h3>Availability</h3>' +
        '<label class="check"><input type="checkbox" id="in-stock" ' +
        (f.inStockOnly ? "checked" : "") +
        "><span>In stock only</span><span>" +
        data.products.filter(function (p) {
          return p.stock > 0;
        }).length +
        "</span></label>" +
        "</div>" +
        "</form>" +
        '<div class="shop-results" id="shop-results">' +
        shopResults() +
        "</div>" +
        "</div>" +
        "</div>" +
        '<div class="container section--tight">' +
        demoNote() +
        "</div>"
      );
    },
  };

  function shopResults() {
    var list = store.results();
    var f = store.state.filters;
    var chips = [];
    f.categories.forEach(function (id) {
      var c = data.categories.filter(function (x) {
        return x.id === id;
      })[0];
      chips.push(["categories", id, c ? c.label : id]);
    });
    f.brands.forEach(function (id) {
      var b = data.brands.filter(function (x) {
        return x.id === id;
      })[0];
      chips.push(["brands", id, b ? b.label : id]);
    });
    if (f.maxPrice != null)
      chips.push(["maxPrice", "", "Under " + money(f.maxPrice)]);
    if (f.inStockOnly) chips.push(["inStockOnly", "", "In stock only"]);

    return (
      '<div class="shop-bar">' +
      '<p class="shop-bar__count"><b>' +
      list.length +
      "</b> of " +
      data.products.length +
      " instruments</p>" +
      '<button type="button" class="btn btn--ghost btn--sm filters-toggle" data-action="toggle-filters" aria-expanded="false" aria-controls="filters">' +
      "Filters" +
      (store.activeFilterCount()
        ? " (" + store.activeFilterCount() + ")"
        : "") +
      "</button>" +
      '<div class="select-wrap"><label class="sr-only" for="sort">Sort by</label>' +
      '<select id="sort">' +
      store.sortLabels
        .map(function (s) {
          return (
            '<option value="' +
            s[0] +
            '"' +
            (store.state.sort === s[0] ? " selected" : "") +
            ">" +
            esc(s[1]) +
            "</option>"
          );
        })
        .join("") +
      "</select></div>" +
      "</div>" +
      (chips.length
        ? '<div class="chips">' +
          chips
            .map(function (c) {
              return (
                '<button type="button" class="chip" data-action="remove-chip" data-key="' +
                c[0] +
                '" data-value="' +
                esc(c[1]) +
                '">' +
                esc(c[2]) +
                ui.icon("close", 11) +
                '<span class="sr-only">Remove filter</span></button>'
              );
            })
            .join("") +
          "</div>"
        : "") +
      (list.length
        ? grid(list)
        : '<div class="empty"><h3>Nothing matches that</h3>' +
          "<p>Try widening the price ceiling or clearing a maker.</p>" +
          '<button type="button" class="btn btn--ghost" data-action="clear-filters">Clear all filters</button></div>')
    );
  }

  var product = {
    render: function (params) {
      var p = data.get(params.id);
      if (!p) return notFound.render();
      var related = data.products
        .filter(function (x) {
          return x.id !== p.id && x.category === p.category;
        })
        .slice(0, 3);
      if (related.length < 3) {
        data.products.forEach(function (x) {
          if (
            related.length < 3 &&
            x.id !== p.id &&
            x.brand === p.brand &&
            related.indexOf(x) === -1
          )
            related.push(x);
        });
      }

      var specRows = Object.keys(p.specs)
        .map(function (k) {
          return (
            '<tr><th scope="row">' +
            esc(k) +
            "</th><td>" +
            esc(p.specs[k]) +
            "</td></tr>"
          );
        })
        .join("");

      return (
        "" +
        '<div class="container section--tight">' +
        '<nav class="breadcrumb" aria-label="Breadcrumb"><a href="#/">Home</a><span>/</span>' +
        '<a href="#/shop?cat=' +
        p.category +
        '">' +
        esc(p.categoryLabel) +
        "</a><span>/</span>" +
        esc(p.name) +
        "</nav>" +
        "</div>" +
        '<div class="container">' +
        '<div class="pdp">' +
        '<div class="gallery">' +
        '<div class="gallery__stage" id="stage">' +
        art.render(p, { view: "full", eager: true }) +
        "</div>" +
        '<div class="gallery__thumbs" role="tablist" aria-label="Views of this instrument">' +
        ["full", "body", "head"]
          .map(function (v, i) {
            return (
              '<button type="button" class="thumb" role="tab" data-action="set-view" data-view="' +
              v +
              '" data-id="' +
              p.id +
              '" aria-selected="' +
              (i === 0) +
              '" aria-label="' +
              (v === "full"
                ? "Full instrument"
                : v === "body"
                  ? "Body and hardware"
                  : "Headstock") +
              '">' +
              art.render(p, { view: v, decorative: true }) +
              "</button>"
            );
          })
          .join("") +
        "</div>" +
        "</div>" +
        '<div class="pdp__info">' +
        '<p class="eyebrow">' +
        esc(p.brandLabel) +
        "</p>" +
        '<h1 class="pdp__title">' +
        esc(p.name) +
        "</h1>" +
        '<div class="pdp__meta">' +
        '<span class="rating"><span class="rating__stars" aria-hidden="true">' +
        ui.stars(p.rating) +
        "</span>" +
        p.rating.toFixed(1) +
        " from " +
        p.reviews +
        " reviews</span>" +
        stockTag(p) +
        "</div>" +
        '<p class="lede">' +
        esc(p.blurb) +
        "</p>" +
        '<div class="buybox">' +
        '<div class="buybox__row" style="justify-content:space-between">' +
        priceBlock(p, true) +
        '<span class="muted" style="font-size:0.76rem">' +
        esc(p.finishName) +
        "</span>" +
        "</div>" +
        '<div class="buybox__row">' +
        '<div class="qty">' +
        '<button type="button" data-action="pdp-qty" data-step="-1" aria-label="Decrease quantity">&minus;</button>' +
        '<output id="pdp-qty" aria-live="polite">1</output>' +
        '<button type="button" data-action="pdp-qty" data-step="1" aria-label="Increase quantity">+</button>' +
        "</div>" +
        '<button type="button" class="btn" style="flex:1 1 180px" data-action="add-to-cart" data-id="' +
        p.id +
        '"' +
        (p.stock <= 0 ? " disabled" : "") +
        ">" +
        (p.stock <= 0 ? "Sold out" : "Add to cart") +
        "</button>" +
        "</div>" +
        '<ul class="assurances">' +
        "<li>" +
        ui.icon("wrench", 15) +
        "<span>Bench setup included: action 4/64 in on the bass side at the twelfth, relief .010 in, intonated to the shipped gauge.</span></li>" +
        "<li>" +
        ui.icon("truck", 15) +
        "<span>Dispatched within 48 hours. Free insured shipping over " +
        money(store.shipping.freeOver) +
        ", otherwise " +
        money(store.shipping.flat) +
        ".</span></li>" +
        "<li>" +
        ui.icon("shield", 15) +
        "<span>30-day return window, including on setup work. Ship it back in the same box.</span></li>" +
        "</ul>" +
        "</div>" +
        '<div class="tabs" role="tablist" aria-label="Product detail">' +
        '<button type="button" class="tab" role="tab" data-action="tab" data-tab="spec" aria-selected="true" aria-controls="panel-spec" id="tab-spec">Specification</button>' +
        '<button type="button" class="tab" role="tab" data-action="tab" data-tab="story" aria-selected="false" aria-controls="panel-story" id="tab-story">From the bench</button>' +
        '<button type="button" class="tab" role="tab" data-action="tab" data-tab="ship" aria-selected="false" aria-controls="panel-ship" id="tab-ship">Shipping</button>' +
        "</div>" +
        '<div id="panel-spec" role="tabpanel" aria-labelledby="tab-spec" data-tabpanel="spec">' +
        '<table class="spec-table"><caption class="sr-only">Full specification</caption><tbody>' +
        specRows +
        "</tbody></table>" +
        "</div>" +
        '<div id="panel-story" role="tabpanel" aria-labelledby="tab-story" data-tabpanel="story" hidden>' +
        '<div class="prose"><p>' +
        esc(p.story) +
        "</p>" +
        '<p class="muted">Serial logged on arrival. Weight and finish vary slightly between individual instruments; ' +
        "the figures above are measured from the piece currently in the shop, not a catalogue average.</p></div>" +
        "</div>" +
        '<div id="panel-ship" role="tabpanel" aria-labelledby="tab-ship" data-tabpanel="ship" hidden>' +
        '<div class="prose">' +
        "<p>Orders placed before 2pm Eastern leave the next working day. Instruments ship double-boxed with the " +
        "strings slackened a full tone and a brace under the headstock. Hard cases travel inside the outer carton, " +
        "never as the shipping container.</p>" +
        "<p>International orders are quoted individually because every carrier treats a guitar-shaped box differently. " +
        "Returns are accepted within 30 days in the original packing; we pay return shipping if the fault is ours.</p></div>" +
        "</div>" +
        "</div>" +
        "</div>" +
        "</div>" +
        '<section class="section section--edge container reveal">' +
        '<div class="section-head"><div><p class="eyebrow">Nearby on the wall</p><h2>You might also play</h2></div></div>' +
        grid(related) +
        "</section>"
      );
    },
  };

  var story = {
    render: function () {
      var timeline = [
        [
          "2019",
          "Two rooms above a print shop",
          "Mara Vance and Theo Rask open RAVEN with eleven instruments and one bench, selling mostly to players they already knew.",
        ],
        [
          "2021",
          "The Corvid bench starts building",
          "What began as repair work turns into the house brand. The first Nightjar Standard ships in March.",
        ],
        [
          "2023",
          "The wall is capped at twenty",
          "A deliberate ceiling on floor stock, after a year of carrying inventory nobody on staff could vouch for.",
        ],
        [
          "2026",
          "Still nineteen on the wall",
          "Six makers, one bench, and a rule that has not changed: it gets played before it gets listed.",
        ],
      ];
      return (
        "" +
        '<div class="container section--tight">' +
        '<nav class="breadcrumb" aria-label="Breadcrumb"><a href="#/">Home</a><span>/</span>The RAVEN story</nav>' +
        "</div>" +
        '<section class="container section--tight">' +
        '<p class="eyebrow">Since 2019</p>' +
        '<h1 style="font-size:var(--step-4);max-width:16ch;margin-block:0.5rem 1.5rem">A shop built around a bench, not a warehouse</h1>' +
        '<p class="lede" style="max-width:62ch">Most guitar retail is logistics with a guitar-shaped hole in the middle. ' +
        "RAVEN was started by two people who kept being handed instruments that had never been played by anybody " +
        "before they were sold, and who decided that was the thing worth fixing.</p>" +
        "</section>" +
        '<section class="section container reveal">' +
        '<div class="split">' +
        '<div class="stack">' +
        '<h2 style="font-size:var(--step-3)">What the bench actually does</h2>' +
        '<p class="muted">A new instrument arrives with a factory setup, which is a compromise written for a warehouse ' +
        "in one climate and a buyer in another. We take the strings off, check the fret plane with a notched " +
        "straightedge, dress anything proud, cut the nut slots to the gauge the guitar will actually ship with, " +
        "set relief and action, and intonate it at pitch.</p>" +
        '<p class="muted">Then somebody plays it for an hour. That last part is not a marketing line — it is how we ' +
        "catch a cold solder joint, a rattling truss nut, or a pickup that only misbehaves warm.</p>" +
        "</div>" +
        '<div class="promise-grid" style="grid-template-columns:1fr">' +
        '<div class="promise"><span class="promise__num">Bench rate</span><h3>$95 per hour</h3>' +
        "<p>Included on everything we sell. Charged only on outside repair work.</p></div>" +
        '<div class="promise"><span class="promise__num">Turnaround</span><h3>Three working days</h3>' +
        "<p>Full setup and fret dress on an instrument you already own.</p></div>" +
        '<div class="promise"><span class="promise__num">Trade-ins</span><h3>Offered in person</h3>' +
        "<p>We quote against what we can actually sell, and we say no often.</p></div>" +
        "</div>" +
        "</div>" +
        "</section>" +
        '<section class="section section--edge container reveal">' +
        '<div class="section-head"><div><p class="eyebrow">How it went</p><h2>Seven years, in four lines</h2></div></div>' +
        '<ul class="info-list" style="gap:0">' +
        timeline
          .map(function (t) {
            return (
              '<li style="display:grid;grid-template-columns:minmax(0,120px) minmax(0,1fr);gap:1rem 2rem;padding-block:1.4rem;border-bottom:1px solid var(--line)">' +
              '<span class="mono" style="color:var(--ember-500)">' +
              t[0] +
              "</span>" +
              '<div><h3 style="font-size:var(--step-1);margin-bottom:0.35rem">' +
              esc(t[1]) +
              "</h3>" +
              '<p class="muted" style="font-size:0.88rem">' +
              esc(t[2]) +
              "</p></div></li>"
            );
          })
          .join("") +
        "</ul>" +
        "</section>" +
        '<section class="section section--edge container reveal">' +
        '<div class="section-head"><div><p class="eyebrow">Who we stock</p><h2>Six makers</h2></div>' +
        "<p>Three of them build fewer than two hundred instruments a year</p></div>" +
        '<div class="promise-grid">' +
        data.brands
          .map(function (b) {
            var n = data.products.filter(function (p) {
              return p.brand === b.id;
            }).length;
            return (
              '<div class="promise"><span class="promise__num">' +
              n +
              " on the wall</span>" +
              "<h3>" +
              esc(b.label) +
              "</h3><p>" +
              esc(b.note) +
              "</p></div>"
            );
          })
          .join("") +
        "</div>" +
        "</section>" +
        '<div class="container section--tight">' +
        demoNote(
          "The founders, timeline and makers above are written for the demonstration.",
        ) +
        "</div>"
      );
    },
  };
  var contact = {
    render: function () {
      return (
        "" +
        '<div class="container section--tight">' +
        '<nav class="breadcrumb" aria-label="Breadcrumb"><a href="#/">Home</a><span>/</span>Contact</nav>' +
        "</div>" +
        '<div class="container section--tight">' +
        '<div class="split" style="align-items:start">' +
        '<div class="stack">' +
        '<p class="eyebrow">Talk to the shop</p>' +
        '<h1 style="font-size:var(--step-3)">Ask us something specific</h1>' +
        '<p class="muted">Weight of a particular instrument, how a neck profile measures at the first fret, whether ' +
        "we would take your bass in trade. Somebody on the bench answers, usually the same day.</p>" +
        '<form id="contact-form" novalidate style="display:grid;gap:1rem;margin-top:0.5rem">' +
        '<div class="form-grid">' +
        '<div class="field"><label for="c-name">Your name</label>' +
        '<input id="c-name" name="name" type="text" autocomplete="name" required>' +
        '<p class="error" data-error-for="c-name" hidden></p></div>' +
        '<div class="field"><label for="c-email">Email</label>' +
        '<input id="c-email" name="email" type="email" autocomplete="email" required>' +
        '<p class="error" data-error-for="c-email" hidden></p></div>' +
        "</div>" +
        '<div class="field"><label for="c-subject">Subject</label>' +
        '<div class="select-wrap" style="width:100%"><select id="c-subject" name="subject">' +
        "<option>About an instrument</option><option>Bench work and repairs</option>" +
        "<option>Trade-in valuation</option><option>Shipping and returns</option><option>Something else</option>" +
        "</select></div></div>" +
        '<div class="field"><label for="c-message">Message</label>' +
        '<textarea id="c-message" name="message" required></textarea>' +
        '<p class="error" data-error-for="c-message" hidden></p></div>' +
        '<div style="display:flex;flex-wrap:wrap;gap:1rem;align-items:center">' +
        '<button type="submit" class="btn">Send message</button>' +
        '<span class="muted" style="font-size:0.76rem">Demo form — nothing is transmitted.</span>' +
        "</div>" +
        "</form>" +
        '<div id="contact-done" hidden></div>' +
        "</div>" +
        '<div class="stack-lg">' +
        '<ul class="info-list">' +
        '<li><p class="k">The shop</p><p class="v">Somehere in the dark forest<br>Near the dead pond</p></li>' +
        '<li><p class="k">Hours</p><p class="v">Tuesday to Saturday, 11am – 7pm<br>Closed Sunday and Monday</p></li>' +
        '<li><p class="k">Email</p><p class="v mono" style="user-select:all">bench@raven-guitars.example</p></li>' +
        '<li><p class="k">Phone</p><p class="v mono" style="user-select:all">+6 666 666 6666</p></li>' +
        "</ul>" +
        demoNote(
          "The address, phone number and email above are placeholders and do not reach anyone.",
        ) +
        "</div>" +
        "</div>" +
        "</div>"
      );
    },
  };
  function lineItem(l, compact) {
    var p = l.product;
    return (
      '<div class="line-item">' +
      '<div class="line-item__art">' +
      art.render(p, { view: "body", decorative: true }) +
      "</div>" +
      '<div style="min-width:0">' +
      '<p class="line-item__brand">' +
      esc(p.brandLabel) +
      "</p>" +
      '<p class="line-item__name"><a href="#/product/' +
      p.id +
      '">' +
      esc(p.name) +
      "</a></p>" +
      '<p class="muted" style="font-size:0.74rem">' +
      esc(p.finishName) +
      "</p>" +
      '<div class="line-item__row">' +
      '<div class="qty">' +
      '<button type="button" data-action="line-qty" data-id="' +
      p.id +
      '" data-step="-1" aria-label="Decrease quantity of ' +
      esc(p.name) +
      '">&minus;</button>' +
      '<output aria-label="Quantity of ' +
      esc(p.name) +
      '">' +
      l.qty +
      "</output>" +
      '<button type="button" data-action="line-qty" data-id="' +
      p.id +
      '" data-step="1" aria-label="Increase quantity of ' +
      esc(p.name) +
      '"' +
      (l.qty >= p.stock ? " disabled" : "") +
      ">+</button>" +
      "</div>" +
      '<span class="price">' +
      money(l.line) +
      "</span>" +
      "</div>" +
      '<button type="button" class="btn btn--quiet" data-action="remove-line" data-id="' +
      p.id +
      '">Remove</button>' +
      "</div>" +
      "</div>"
    );
  }

  function totalsBlock(t) {
    return (
      '<div class="totals">' +
      '<div><span>Subtotal</span><span class="mono">' +
      money(t.subtotal) +
      "</span></div>" +
      '<div><span>Shipping</span><span class="mono">' +
      (t.subtotal === 0 ? "—" : t.freeShipping ? "Free" : money(t.shipping)) +
      "</span></div>" +
      "<div><span>Sales tax</span><span>Calculated at checkout</span></div>" +
      '<div class="grand"><span>Total</span><span>' +
      money(t.total) +
      "</span></div>" +
      "</div>" +
      (t.subtotal > 0 && !t.freeShipping
        ? '<p class="muted" style="font-size:0.74rem">' +
          money(t.toFreeShipping) +
          " more for free insured shipping.</p>"
        : "")
    );
  }

  var cartPage = {
    render: function () {
      var lines = store.lines(),
        t = store.totals();
      if (!lines.length) {
        return (
          '<div class="container section">' +
          '<div class="empty"><h3>Your cart is empty</h3>' +
          "<p>Nineteen instruments are on the wall, and every one of them has been played.</p>" +
          '<a class="btn btn--ghost" href="#/shop">Browse the floor</a></div></div>'
        );
      }
      return (
        '<div class="container section--tight">' +
        '<nav class="breadcrumb" aria-label="Breadcrumb"><a href="#/">Home</a><span>/</span>Cart</nav></div>' +
        '<div class="container">' +
        '<div class="section-head"><div><p class="eyebrow">' +
        store.count() +
        " item" +
        (store.count() === 1 ? "" : "s") +
        '</p><h2>Your cart</h2></div><a class="link-arrow" href="#/shop">Keep browsing ' +
        ui.icon("arrow", 15) +
        "</a></div>" +
        '<div class="split" style="grid-template-columns:minmax(0,1.6fr) minmax(0,1fr);align-items:start">' +
        "<div>" +
        lines
          .map(function (l) {
            return lineItem(l);
          })
          .join("") +
        "</div>" +
        '<div class="buybox">' +
        totalsBlock(t) +
        '<button type="button" class="btn btn--block" data-action="checkout">Checkout</button>' +
        '<button type="button" class="btn btn--quiet" data-action="clear-cart">Empty the cart</button>' +
        '<p class="muted" style="font-size:0.74rem">Demo checkout. No payment is taken and no order is placed.</p>' +
        "</div>" +
        "</div>" +
        "</div>"
      );
    },
  };

  function cartDrawerHTML() {
    var lines = store.lines(),
      t = store.totals();
    return (
      '<aside class="drawer" data-panel role="dialog" aria-modal="true" aria-labelledby="cart-title">' +
      '<div class="drawer__head">' +
      '<h2 id="cart-title">Cart <span class="mono muted" style="font-size:0.8rem">(' +
      store.count() +
      ")</span></h2>" +
      '<button type="button" class="icon-btn" data-action="close-overlay" aria-label="Close cart">' +
      ui.icon("close") +
      "</button>" +
      "</div>" +
      '<div class="drawer__body">' +
      (lines.length
        ? lines
            .map(function (l) {
              return lineItem(l, true);
            })
            .join("")
        : '<div class="empty" style="padding:2rem 1rem"><h3 style="font-size:var(--step-1)">Nothing here yet</h3>' +
          "<p>Add an instrument and it will wait for you.</p>" +
          '<a class="btn btn--ghost btn--sm" href="#/shop" data-action="close-overlay">Browse the floor</a></div>') +
      "</div>" +
      (lines.length
        ? '<div class="drawer__foot">' +
          totalsBlock(t) +
          '<button type="button" class="btn btn--block" data-action="checkout">Checkout</button>' +
          '<a class="btn btn--ghost btn--block" href="#/cart" data-action="close-overlay">View full cart</a>' +
          "</div>"
        : "") +
      "</aside>"
    );
  }

  function searchPanelHTML(query, results) {
    return (
      '<div class="search-panel" data-panel role="dialog" aria-modal="true" aria-label="Search the catalogue">' +
      '<div class="container" style="padding-inline:0">' +
      '<div class="search-field">' +
      ui.icon("search") +
      '<label class="sr-only" for="search-input">Search instruments</label>' +
      '<input id="search-input" type="search" autocomplete="off" placeholder="Search by name, maker or type" value="' +
      esc(query || "") +
      '">' +
      '<button type="button" class="icon-btn" data-action="close-overlay" aria-label="Close search">' +
      ui.icon("close") +
      "</button>" +
      "</div>" +
      '<div id="search-results-host">' +
      searchResultsHTML(query, results) +
      "</div>" +
      '<p class="search-hint">Press <kbd>Esc</kbd> to close · <kbd>/</kbd> opens search from anywhere</p>' +
      "</div>" +
      "</div>"
    );
  }

  function searchResultsHTML(query, results) {
    if (!query || query.trim().length < 2) {
      return '<p class="search-hint" style="margin-top:1rem">Try &ldquo;baritone&rdquo;, &ldquo;P-90&rdquo;, &ldquo;short scale&rdquo; or a maker&rsquo;s name.</p>';
    }
    if (!results.length) {
      return (
        '<p class="search-hint" style="margin-top:1rem">No instrument matches &ldquo;' +
        esc(query) +
        "&rdquo;. " +
        'The whole floor is <a href="#/shop" data-action="close-overlay" style="color:var(--ember-400)">on one page</a>.</p>'
      );
    }
    return (
      '<ul class="search-results">' +
      results
        .map(function (p) {
          return (
            '<li><a href="#/product/' +
            p.id +
            '" data-action="close-overlay">' +
            '<span class="r-art">' +
            art.render(p, { view: "body", decorative: true }) +
            "</span>" +
            '<span style="min-width:0"><span class="r-name">' +
            esc(p.name) +
            "</span><br>" +
            '<span class="r-meta">' +
            esc(p.brandLabel) +
            " · " +
            esc(p.categoryLabel) +
            "</span></span>" +
            '<span class="price">' +
            money(p.price) +
            "</span></a></li>"
          );
        })
        .join("") +
      "</ul>"
    );
  }

  function checkoutModalHTML() {
    var t = store.totals();
    return (
      '<div class="modal" data-panel role="dialog" aria-modal="true" aria-labelledby="checkout-title">' +
      '<p class="eyebrow">Demonstration</p>' +
      '<h2 id="checkout-title">There is no payment system behind this</h2>' +
      "<p>RAVEN is a front-end portfolio project, so checkout stops here on purpose. In a production build this " +
      "button would hand the cart to a payment provider and a stock service.</p>" +
      '<div style="margin:1.25rem 0;padding:1rem;border:1px solid var(--line);background:var(--ink-700)">' +
      totalsBlock(t) +
      "</div>" +
      '<p class="muted" style="font-size:0.82rem">What is real here: cart state, quantity limits against stock, ' +
      "shipping thresholds, persistence across a refresh, filtering, sorting, search and every layout. " +
      "What is not: payment capture, tax calculation, live inventory, accounts and order confirmation email.</p>" +
      '<div class="modal__foot">' +
      '<button type="button" class="btn" data-action="close-overlay">Back to the cart</button>' +
      '<a class="btn btn--ghost" href="#/story" data-action="close-overlay">About the shop</a>' +
      "</div>" +
      "</div>"
    );
  }

  var notFound = {
    render: function () {
      return (
        '<div class="container section"><div class="empty">' +
        '<p class="eyebrow">404</p><h3>That page is not on the wall</h3>' +
        "<p>It may have sold, or the link may be wrong.</p>" +
        '<a class="btn btn--ghost" href="#/shop">Browse the floor</a></div></div>'
      );
    },
  };

  RAVEN.views = {
    home: home,
    shop: shop,
    product: product,
    story: story,
    contact: contact,
    cart: cartPage,
    notFound: notFound,
    shopResults: shopResults,
    cartDrawerHTML: cartDrawerHTML,
    searchPanelHTML: searchPanelHTML,
    searchResultsHTML: searchResultsHTML,
    checkoutModalHTML: checkoutModalHTML,
  };
})((window.RAVEN = window.RAVEN || {}));
