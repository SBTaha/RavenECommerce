(function (RAVEN) {
  "use strict";

  var VIEW_LABEL = {
    full: "full instrument",
    body: "detail of the body and hardware",
    head: "detail of the headstock and controls",
  };

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function altFor(p, view) {
    return (
      p.name +
      ", " +
      p.finishName +
      ", " +
      (VIEW_LABEL[view] || VIEW_LABEL.full)
    );
  }

  function placeholder(product, view, decorative) {
    var p = typeof product === "string" ? RAVEN.data.get(product) : product;
    if (!p) return "";
    var file = RAVEN.images.expectedFile(p.id, view);
    var label = "Photograph pending: " + altFor(p, view);

    return (
      '<div class="art art--empty"' +
      (decorative
        ? ' aria-hidden="true"'
        : ' role="img" aria-label="' + esc(label) + '"') +
      ">" +
      '<svg class="art__icon" viewBox="0 0 48 48" aria-hidden="true" focusable="false" fill="none" ' +
      'stroke="currentColor" stroke-width="1.25" stroke-linejoin="round">' +
      '<rect x="6" y="10" width="36" height="28" rx="2"/>' +
      '<path d="m6 31 9-8 7 6 8-9 12 11"/>' +
      '<circle cx="17" cy="19" r="2.5"/>' +
      "</svg>" +
      '<p class="art__slot">' +
      esc(file) +
      "</p>" +
      '<p class="art__size">' +
      esc(RAVEN.images.recommendedSize) +
      "</p>" +
      "</div>"
    );
  }

  function render(p, opts) {
    opts = opts || {};
    var view = VIEW_LABEL[opts.view] ? opts.view : "full";
    var found = RAVEN.images.lookup(p.id, view);

    if (!found) return placeholder(p, view, opts.decorative);

    return (
      '<img class="art art--photo' +
      (opts.className ? " " + opts.className : "") +
      '"' +
      ' src="' +
      esc(found.src) +
      '"' +
      ' alt="' +
      (opts.decorative ? "" : esc(found.alt || altFor(p, view))) +
      '"' +
      ' data-product="' +
      esc(p.id) +
      '" data-view="' +
      view +
      '"' +
      ' data-fit="' +
      found.fit +
      '"' +
      ' loading="' +
      (opts.eager ? "eager" : "lazy") +
      '" decoding="async"' +
      (opts.decorative ? ' aria-hidden="true"' : "") +
      ">"
    );
  }

  RAVEN.art = {
    render: render,
    placeholder: placeholder,
    views: ["full", "body", "head"],
    viewLabel: VIEW_LABEL,
  };
})((window.RAVEN = window.RAVEN || {}));
