(function (RAVEN) {
  "use strict";

  var IMAGES = {
    "nightjar-standard": {
      full: "img/nightjar-standard-full.png",
      body: "img/nightjar-standard-body.png",
      head: "img/nightjar-standard-head.png",
    },
    "nightjar-relic-59": {
      full: "img/nightjar-relic-59-full.png",
      body: "img/nightjar-relic-59-body.png",
      head: "img/nightjar-relic-59-head.png",
    },
    "vesperal-66": {
      full: "img/vesperal-66-full.png",
      body: "img/vesperal-66-body.png",
      head: "img/vesperal-66-head.png",
    },
    "vesperal-deluxe": {
      full: "img/vesperal-deluxe-full.png",
      body: "img/vesperal-deluxe-body.png",
      head: "img/vesperal-deluxe-head.png",
    },
    "lacewing-s": {
      full: "img/lacewing-s-full.png",
      body: "img/lacewing-s-body.png",
      head: "img/lacewing-s-head.png",
    },
    "lacewing-baritone": {
      full: "img/lacewing-baritone-full.png",
      body: "img/lacewing-baritone-body.png",
      head: "img/lacewing-baritone-head.png",
    },
    "ossuary-phantom": {
      full: "img/ossuary-phantom-full.png",
      body: "img/ossuary-phantom-body.png",
      head: "img/ossuary-phantom-head.png",
    },
    "carrion-lark": {
      full: "img/carrion-lark-full.png",
      body: "img/carrion-lark-body.png",
      head: "img/carrion-lark-head.png",
    },

    "ash-chapel-dread": {
      full: "img/ash-chapel-dread-full.png",
      body: "img/ash-chapel-dread-body.png",
      head: "img/ash-chapel-dread-head.png",
    },
    "ash-chapel-parlour": {
      full: "img/ash-chapel-parlour-full.png",
      body: "img/ash-chapel-parlour-body.png",
      head: "img/ash-chapel-parlour-head.png",
    },
    "blackthorn-om": {
      full: "img/blackthorn-om-full.png",
      body: "img/blackthorn-om-body.png",
      head: "img/blackthorn-om-head.png",
    },
    "widows-walk-12": {
      full: "img/widows-walk-12-full.png",
      body: "img/widows-walk-12-body.png",
      head: "img/widows-walk-12-head.png",
    },

    "tidebone-p4": {
      full: "img/tidebone-p4-full.png",
      body: "img/tidebone-p4-body.png",
      head: "img/tidebone-p4-head.png",
    },
    "tidebone-j5": {
      full: "img/tidebone-j5-full.png",
      body: "img/tidebone-j5-body.png",
      head: "img/tidebone-j5-head.png",
    },
    "monolith-short": {
      full: "img/monolith-short-full.png",
      body: "img/monolith-short-body.png",
      head: "img/monolith-short-head.png",
    },

    "vigil-18-head": {
      full: "img/vigil-18-head-full.png",
      body: "img/vigil-18-head-body.png",
      head: "img/vigil-18-head-panel.png",
    },
    "candlewake-112": {
      full: "img/candlewake-112-full.png",
      body: "img/candlewake-112-body.png",
      head: "img/candlewake-112-panel.png",
    },

    "black-mass-fuzz": {
      full: "img/black-mass-fuzz-full.png",
      body: "img/black-mass-fuzz-body.png",
      head: "img/black-mass-fuzz-knobs.png",
    },
    "threnody-reverb": {
      full: "img/threnody-reverb-full.png",
      body: "img/threnody-reverb-body.png",
      head: "img/threnody-reverb-knobs.png",
    },
  };

  var RECOMMENDED_SIZE = "1200 × 1500";

  function entryFor(productId) {
    var e = IMAGES[productId];
    if (!e) return null;
    if (typeof e === "string")
      return { full: e, body: null, head: null, fit: "contain", alt: null };
    return {
      full: e.full || null,
      body: e.body || null,
      head: e.head || null,
      fit: e.fit === "cover" ? "cover" : "contain",
      alt: e.alt || null,
    };
  }

  function lookup(productId, view) {
    var e = entryFor(productId);
    if (!e) return null;
    var src = e[view] !== undefined && e[view] !== null ? e[view] : e.full;
    if (!src) return null;
    return { src: src, fit: e.fit, alt: e.alt };
  }

  function expectedFile(productId, view) {
    var e = entryFor(productId);
    var path = e ? e[view] || e.full : null;
    if (!path) return productId + "-" + view + ".png";
    return path.split("/").pop();
  }

  RAVEN.images = {
    map: IMAGES,
    lookup: lookup,
    expectedFile: expectedFile,
    recommendedSize: RECOMMENDED_SIZE,
  };
})((window.RAVEN = window.RAVEN || {}));


/*remember images are 1200x1500px*/