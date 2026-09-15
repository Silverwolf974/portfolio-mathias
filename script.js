/* ===========================================================
   Portfolio — Mathias ALY-BERIL
   Navigation mobile, filtres projets, année dynamique.
   =========================================================== */
(function () {
  "use strict";
  var isEnglish = document.documentElement.lang === "en";
  // Keep the current section when switching between equivalent pages.
  var languageSwitch = document.querySelector(".language-switch");
  if (languageSwitch) {
    var languagePage = languageSwitch.getAttribute("href");
    function syncLanguageAnchor() {
      languageSwitch.setAttribute("href", languagePage + window.location.hash);
    }
    syncLanguageAnchor();
    window.addEventListener("hashchange", syncLanguageAnchor);
  }

  // ===========================================================
  // GSAP + Lenis : moteur d'animation et défilement fluide.
  // Lenis est piloté par le ticker GSAP (une seule boucle rAF),
  // et n'est activé que si l'utilisateur accepte les animations
  // (gsap.matchMedia + prefers-reduced-motion).
  // ===========================================================
  var hasGsap = typeof window.gsap !== "undefined";
  var lenis = null;

  if (hasGsap && typeof window.ScrollTrigger !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
  }

  if (hasGsap && typeof window.Lenis !== "undefined") {
    gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", function () {
      lenis = new Lenis({
        duration: 1.1,
        smoothWheel: true
      });
      if (window.ScrollTrigger) lenis.on("scroll", ScrollTrigger.update);

      function lenisRaf(time) { lenis.raf(time * 1000); }
      gsap.ticker.add(lenisRaf);
      gsap.ticker.lagSmoothing(0);

      // Nettoyage si la préférence de mouvement change en cours de session
      return function () {
        gsap.ticker.remove(lenisRaf);
        lenis.destroy();
        lenis = null;
      };
    });
  }

  // Ancres internes : défilement fluide via Lenis (fallback natif sinon)
  document.addEventListener("click", function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link || !lenis) return;
    var target = document.querySelector(link.getAttribute("href"));
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target, { offset: -70 });
  });

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

  // --- Filtres projets (avec animation d'apparition) ---
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
        card.classList.remove("pop");
        if (show) {
          void card.offsetWidth; // relance l'animation
          card.classList.add("pop");
        }
      });
    });
    cards.forEach(function (card) {
      card.addEventListener("animationend", function (e) {
        if (e.animationName === "card-pop") card.classList.remove("pop");
      });
    });
  }

  // --- Bouton retour-en-haut (progressive enhancement) ---
  var toTop = document.createElement("button");
  toTop.className = "to-top";
  toTop.setAttribute("aria-label", isEnglish ? "Back to top" : "Revenir en haut de la page");
  toTop.innerHTML =
    '<svg class="ring" viewBox="0 0 56 56" aria-hidden="true">' +
    '<circle cx="28" cy="28" r="26"/><circle class="ring-val" cx="28" cy="28" r="26"/></svg>' +
    "<span>&uarr;</span>";
  document.body.appendChild(toTop);

  function onScroll() {
    if (window.scrollY > 500) toTop.classList.add("show");
    else toTop.classList.remove("show");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  toTop.addEventListener("click", function () {
    if (lenis) lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // --- Révélations au scroll, cascades, timeline, parallaxe : désormais
  //     gérées par GSAP + ScrollTrigger (voir l'initialisation plus haut).

  // --- Effets liés au scroll : header, indicateur, anneau ---
  var header = document.querySelector(".site-header");
  var scrollHint = document.querySelector(".scroll-hint");
  var ringVal = toTop.querySelector(".ring-val");
  var RING_LEN = 163.4;
  var fxTicking = false;

  function onScrollFx() {
    fxTicking = false;
    var y = window.scrollY;
    if (header) header.classList.toggle("scrolled", y > 10);
    if (scrollHint) scrollHint.classList.toggle("hide", y > 90);
    if (ringVal) {
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      var p = max > 0 ? y / max : 0;
      ringVal.style.strokeDashoffset = (RING_LEN * (1 - p)).toFixed(1);
    }
  }
  window.addEventListener("scroll", function () {
    if (!fxTicking) { fxTicking = true; requestAnimationFrame(onScrollFx); }
  }, { passive: true });
  onScrollFx();

  // --- Barre de progression de lecture ---
  var prog = document.createElement("div");
  prog.className = "scroll-progress";
  document.body.appendChild(prog);
  function onScrollProg() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - doc.clientHeight;
    prog.style.transform = "scaleX(" + (max > 0 ? window.scrollY / max : 0) + ")";
  }
  window.addEventListener("scroll", onScrollProg, { passive: true });
  window.addEventListener("resize", onScrollProg);
  onScrollProg();

  // --- Perf : n'animer les scènes SVG que des cartes visibles ---
  if ("IntersectionObserver" in window && cards.length) {
    var liveObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        entry.target.classList.toggle("live", entry.isIntersecting);
      });
    }, { rootMargin: "80px 0px" });
    cards.forEach(function (card) { liveObs.observe(card); });
  } else {
    cards.forEach(function (card) { card.classList.add("live"); });
  }

  // --- Tilt 3D des cartes projets (souris uniquement) ---
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  var reduceMotionEarly = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (finePointer && !reduceMotionEarly) {
    cards.forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        var r = card._rect || (card._rect = card.getBoundingClientRect());
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        card.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
        card.style.setProperty("--my", (py * 100).toFixed(1) + "%");
        var rx = (0.5 - py) * 7;
        var ry = (px - 0.5) * 9;
        card.style.transform =
          "perspective(900px) rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg) translateY(-4px)";
      });
      card.addEventListener("pointerenter", function () {
        card._rect = card.getBoundingClientRect();
        card.style.transition = "border-color .25s, box-shadow .25s";
      });
      card.addEventListener("pointerleave", function () {
        card.style.transition = "border-color .25s, box-shadow .25s, transform .45s ease";
        card.style.transform = "";
      });
    });
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
