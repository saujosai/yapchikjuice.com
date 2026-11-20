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
      window.location.href = pathFor(targetNumber);
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
