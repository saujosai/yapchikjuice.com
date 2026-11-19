// Client-side rendering for the strip archive. Plain DOM, no build step.

(function () {
  "use strict";

  var comics = (window.COMICS || []).slice().sort(function (a, b) {
    return a.number - b.number;
  });

  if (!comics.length) {
    document.getElementById("strip-title").textContent = "No strips yet";
    return;
  }

  var last = comics.length - 1;

  // Strip number from ?n=9 (or /c/9/ if a host rewrites to pretty paths).
  function requestedNumber() {
    var params = new URLSearchParams(window.location.search);
    var raw = params.get("n");
    if (raw === null) {
      var match = window.location.pathname.match(/\/c\/(\d+)\/?$/);
      raw = match ? match[1] : null;
    }
    var n = parseInt(raw, 10);
    return isNaN(n) ? null : n;
  }

  function indexForNumber(n) {
    for (var i = 0; i < comics.length; i++) {
      if (comics[i].number === n) return i;
    }
    return -1;
  }

  function formatDate(iso) {
    var parts = iso.split("-");
    if (parts.length !== 3) return iso;
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var month = months[parseInt(parts[1], 10) - 1] || parts[1];
    return month + " " + parseInt(parts[2], 10) + ", " + parts[0];
  }

  function hrefFor(number) {
    return "?n=" + number;
  }

  var requested = requestedNumber();
  var found = requested === null ? -1 : indexForNumber(requested);
  var index = found >= 0 ? found : last; // home = latest strip
  var comic = comics[index];

  // Title, meta, image.
  document.title = comic.title + " | Yapchik Juice";
  document.getElementById("strip-title").textContent = comic.title;
  document.getElementById("strip-number").textContent =
    "Strip " + comic.number + " of " + comics.length + " · " + formatDate(comic.date);

  var image = document.getElementById("strip-image");
  image.src = comic.image;
  image.alt = comic.alt;

  // Nav.
  function link(id, number, disabled) {
    var el = document.getElementById(id);
    if (disabled) {
      el.removeAttribute("href");
      el.setAttribute("aria-disabled", "true");
      el.tabIndex = -1;
    } else {
      el.href = hrefFor(number);
      el.removeAttribute("aria-disabled");
      el.removeAttribute("tabindex");
    }
  }

  link("nav-first", comics[0].number, index === 0);
  link("nav-prev", comics[Math.max(0, index - 1)].number, index === 0);

  var otherNumbers = comics.filter(function (_, i) { return i !== index; })
                           .map(function (c) { return c.number; });
  var randomNumber = otherNumbers[Math.floor(Math.random() * otherNumbers.length)];
  link("nav-random", randomNumber, otherNumbers.length === 0);

  link("nav-next", comics[Math.min(last, index + 1)].number, index === last);
  link("nav-last", comics[last].number, index === last);

  // Keyboard nav, XKCD-style. Ignore typing and modified keypresses.
  document.addEventListener("keydown", function (event) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    var tag = (event.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select" ||
        event.target.isContentEditable) return;

    var target = null;
    if (event.key === "ArrowLeft" && index > 0) {
      target = comics[index - 1].number;
    } else if (event.key === "ArrowRight" && index < last) {
      target = comics[index + 1].number;
    }
    if (target !== null) {
      event.preventDefault();
      window.location.href = hrefFor(target);
    }
  });

  document.getElementById("year").textContent = String(new Date().getFullYear());
})();
