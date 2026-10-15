(function (RAVEN) {
  "use strict";

  var ICONS = {
    cart: '<circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2 3h3l2.6 12.2a1.6 1.6 0 0 0 1.6 1.3h8.5a1.6 1.6 0 0 0 1.6-1.3L21.5 7H6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.6-3.6"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    close: '<path d="M5 5l14 14M19 5L5 19"/>',
    check: '<path d="m4 12 5 5L20 6"/>',
    truck:
      '<path d="M2 6h11v10H2zM13 9h4.5l2.5 3v4h-7z"/><circle cx="6" cy="18" r="1.6"/><circle cx="17" cy="18" r="1.6"/>',
    wrench:
      '<path d="M21 4.5a5 5 0 0 1-6.6 6.6L5 20.5 3.5 19l9.4-9.4A5 5 0 0 1 19.5 3z"/>',
    shield:
      '<path d="M12 3 20 6v6c0 5-3.4 8-8 9-4.6-1-8-4-8-9V6z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>',
    note: '<path d="M6 3h9l4 4v14H6z"/><path d="M9 11h7M9 15h7"/>',
    arrow: '<path d="M4 12h15M13 6l6 6-6 6"/>',
  };

  function icon(name, size) {
    return (
      '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"' +
      (size ? ' width="' + size + '" height="' + size + '"' : "") +
      ' stroke-linecap="round" stroke-linejoin="round">' +
      (ICONS[name] || "") +
      "</svg>"
    );
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function stars(rating) {
    var full = Math.round(rating);
    var s = "";
    for (var i = 0; i < 5; i++) s += i < full ? "★" : "☆";
    return s;
  }

  var overlayRoot,
    appRoot,
    lastFocus = null,
    current = null,
    trapHandler = null;

  var FOCUSABLE =
    'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function trap(panel) {
    trapHandler = function (e) {
      if (e.key === "Escape") {
        e.preventDefault();
        closeOverlay();
        return;
      }
      if (e.key !== "Tab") return;
      var items = Array.prototype.filter.call(
        panel.querySelectorAll(FOCUSABLE),
        function (el) {
          return el.offsetParent !== null || el === document.activeElement;
        },
      );
      if (!items.length) return;
      var first = items[0],
        last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", trapHandler, true);
  }

  function openOverlay(name, html, opts) {
    opts = opts || {};
    closeOverlay(true);
    lastFocus = document.activeElement;
    current = name;
    overlayRoot.innerHTML =
      '<div class="scrim" data-action="close-overlay"></div>' + html;
    overlayRoot.hidden = false;
    appRoot.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "hidden";
    var panel = overlayRoot.querySelector("[data-panel]");
    if (panel) {
      trap(panel);
      var target = panel.querySelector(opts.focus || FOCUSABLE);
      if (target) {
        try {
          target.focus({ preventScroll: true });
        } catch (e) {
          target.focus();
        }
      }
    }
    return panel;
  }

  function closeOverlay(silent) {
    if (!current) return;
    current = null;
    overlayRoot.innerHTML = "";
    overlayRoot.hidden = true;
    appRoot.removeAttribute("aria-hidden");
    document.body.style.overflow = "";
    if (trapHandler) {
      document.removeEventListener("keydown", trapHandler, true);
      trapHandler = null;
    }
    if (!silent && lastFocus && document.contains(lastFocus)) {
      try {
        lastFocus.focus({ preventScroll: true });
      } catch (e) {
        lastFocus.focus();
      }
    }
    lastFocus = null;
  }

  function isOpen(name) {
    return name ? current === name : !!current;
  }

  var toastTimer = null;
  function toast(message) {
    var host = document.getElementById("toast-host");
    host.innerHTML =
      '<div class="toast" role="status">' + esc(message) + "</div>";
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      host.innerHTML = "";
    }, 3200);
  }

  function announce(message) {
    var live = document.getElementById("live-region");
    if (live) {
      live.textContent = "";
      window.setTimeout(function () {
        live.textContent = message;
      }, 40);
    }
  }

  function observeReveals(scope) {
    var nodes = (scope || document).querySelectorAll(".reveal");
    if (!nodes.length) return;
    if (
      !("IntersectionObserver" in window) ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      Array.prototype.forEach.call(nodes, function (n) {
        n.classList.add("is-in");
      });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
    );
    Array.prototype.forEach.call(nodes, function (n) {
      io.observe(n);
    });
    window.setTimeout(function () {
      Array.prototype.forEach.call(nodes, function (n) {
        n.classList.add("is-in");
      });
    }, 1400);
  }

  function init() {
    overlayRoot = document.getElementById("overlay-root");
    appRoot = document.getElementById("app");
  }

  RAVEN.ui = {
    init: init,
    icon: icon,
    esc: esc,
    stars: stars,
    openOverlay: openOverlay,
    closeOverlay: closeOverlay,
    isOpen: isOpen,
    toast: toast,
    announce: announce,
    observeReveals: observeReveals,
  };
})((window.RAVEN = window.RAVEN || {}));
