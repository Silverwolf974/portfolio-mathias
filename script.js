/* ===========================================================
   Portfolio — Mathias ALY-BERIL
   Navigation mobile, filtres projets, année dynamique.
   =========================================================== */
(function () {
  "use strict";

  // --- Année dynamique dans le footer ---
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // --- Menu mobile ---
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    // Refermer le menu après un clic sur un lien (mobile)
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // --- Filtres projets ---
  var filterBar = document.getElementById("filters");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".project-card"));
  if (filterBar) {
    filterBar.addEventListener("click", function (e) {
      var btn = e.target.closest(".filter");
      if (!btn) return;

      filterBar.querySelectorAll(".filter").forEach(function (b) {
        b.classList.remove("is-active");
      });
      btn.classList.add("is-active");

      var filter = btn.getAttribute("data-filter");
      cards.forEach(function (card) {
        var cats = card.getAttribute("data-cat") || "";
        var show = filter === "all" || cats.split(" ").indexOf(filter) !== -1;
        card.classList.toggle("is-hidden", !show);
      });
    });
  }

  // --- Bouton retour-en-haut (progressive enhancement) ---
  var toTop = document.createElement("button");
  toTop.className = "to-top";
  toTop.setAttribute("aria-label", "Revenir en haut de la page");
  toTop.innerHTML = "&uarr;";
  document.body.appendChild(toTop);

  function onScroll() {
    if (window.scrollY > 500) toTop.classList.add("show");
    else toTop.classList.remove("show");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  toTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // --- Révélation au défilement (IntersectionObserver) ---
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealEls = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          revObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { revObs.observe(el); });
  }

  // --- Scroll-spy : surligne le lien de section visible ---
  var sections = document.querySelectorAll("main section[id]");
  var navItems = document.querySelectorAll("#navLinks a");
  if (sections.length && navItems.length && "IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.getAttribute("id");
          navItems.forEach(function (a) {
            a.classList.toggle("active", a.getAttribute("href") === "#" + id);
          });
        }
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { spy.observe(s); });
  }
})();
