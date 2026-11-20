// Small enhancements on the prerendered pages: canonicalize old ?n= links,
// randomize the "?" button, keyboard nav, and the footer year.

(function () {
  "use strict";

  var params = new URLSearchParams(window.location.search);
  var raw = params.get("n");
  var current = parseInt(document.body.getAttribute("data-strip-number"), 10);
  var last = parseInt(document.body.getAttribute("data-last-number"), 10);
  var dialog = document.getElementById("signup-dialog");
  var openSubscribe = document.querySelectorAll("[data-open-subscribe]");

  // Old links used ?n=3. Send them to the permanent /c/3/ URL.
  if (raw !== null) {
    var requested = parseInt(raw, 10);
    var target;
    if (isNaN(requested) || requested < 1 || requested > last) {
      target = "/";
    } else if (requested === current) {
      target = window.location.pathname;
    } else {
      target = pathFor(requested);
    }
    window.location.replace(target);
    return;
  }

  // Baked fallback is a real link; pick a different strip at runtime.
  if (last > 1) {
    var randomNumber = current;
    while (randomNumber === current) {
      randomNumber = 1 + Math.floor(Math.random() * last);
    }
    document.getElementById("nav-random").href = pathFor(randomNumber);
  }

  // Changing strips is the site's one authored motion moment: the strip drifts
  // and softens toward the direction of travel, a wash of its own paint blooms
  // over it, the next page loads beneath, and the new strip sharpens into place.
  var washMs = 300;
  var navigating = false;
  var reduceMotion = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : null;

  // The outgoing strip moves opposite the arrow, so the next one arrives from
  // that side. "none" is the random button: a focus pull with no direction.
  var travel = {
    right: { x: "-7vw", wash: "72%", token: "right" },
    left:  { x: "7vw",  wash: "28%", token: "left" },
    none:  { x: "0px",  wash: "50%", token: "none" }
  };

  function navigateWithWash(href, direction) {
    if (!href || navigating) return;
    if (reduceMotion && reduceMotion.matches) {
      window.location.href = href;
      return;
    }
    var move = travel[direction] || travel.none;
    navigating = true;
    try {
      sessionStorage.setItem("yj-strip-transition", move.token);
    } catch (e) { /* storage blocked: still navigate, just without the entrance */ }
    var root = document.documentElement;
    root.style.setProperty("--wash-x", move.wash);
    root.style.setProperty("--travel-x", move.x);
    root.setAttribute("data-transition", "exit");
    window.setTimeout(function () { window.location.href = href; }, washMs);
  }

  var stripNav = document.getElementById("strip-nav");
  if (stripNav) {
    stripNav.addEventListener("click", function (event) {
      // Let the browser handle modified clicks (open in new tab, etc.).
      if (event.defaultPrevented || event.button !== 0 ||
          event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      var link = event.target.closest ? event.target.closest("a.nav-btn") : null;
      if (!link || link.getAttribute("aria-disabled") === "true") return;
      var href = link.getAttribute("href");
      if (!href || href === "#") return;
      event.preventDefault();
      var direction = link.id === "nav-next" || link.id === "nav-last" ? "right"
                    : link.id === "nav-prev" || link.id === "nav-first" ? "left"
                    : "none";
      navigateWithWash(href, direction);
    });
  }

  document.addEventListener("keydown", function (event) {
    if (dialog && dialog.open) return;
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    var tag = (event.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select" ||
        event.target.isContentEditable) return;

    var targetNumber = null;
    if (event.key === "ArrowLeft" && current > 1) {
      targetNumber = current - 1;
    } else if (event.key === "ArrowRight" && current < last) {
      targetNumber = current + 1;
    }
    if (targetNumber !== null) {
      event.preventDefault();
      navigateWithWash(pathFor(targetNumber), event.key === "ArrowRight" ? "right" : "left");
    }
  });

  if (dialog && openSubscribe.length && typeof dialog.showModal === "function") {
    openSubscribe.forEach(function (button) {
      button.addEventListener("click", function () { dialog.showModal(); });
    });
    dialog.querySelector(".signup-dialog__close").addEventListener("click", function () {
      dialog.close();
    });
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) dialog.close();
    });
  }

  document.getElementById("year").textContent = String(new Date().getFullYear());

  function pathFor(number) {
    return number === last ? "/" : "/c/" + number + "/";
  }
})();
