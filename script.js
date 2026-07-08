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
  toTop.setAttribute("aria-label", "Revenir en haut de la page");
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // --- Révélation au défilement (IntersectionObserver) ---
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealEls = document.querySelectorAll(".reveal");

  // Effet « décodage » du titre de section (façon terminal)
  function decodeTitle(section) {
    var title = section.querySelector(".section-title");
    if (!title || title.dataset.decoded) return;
    title.dataset.decoded = "1";
    var node = title.lastChild;
    if (!node || node.nodeType !== 3) return;
    var finalText = node.textContent;
    var glyphs = "▓▒░<>/\\|=+*#";
    var frame = 0, total = 18;
    (function tick() {
      frame++;
      var keep = Math.floor((finalText.length * frame) / total);
      var out = finalText.slice(0, keep);
      for (var i = keep; i < finalText.length; i++) {
        out += finalText[i] === " " ? " " : glyphs[Math.floor(Math.random() * glyphs.length)];
      }
      node.textContent = out;
      if (frame < total) requestAnimationFrame(tick);
      else node.textContent = finalText;
    })();
  }

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    var revObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          decodeTitle(entry.target);
          revObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { revObs.observe(el); });
  }

  // --- Révélation en cascade des grilles de cartes ---
  var staggerGrids = document.querySelectorAll(
    ".projects-grid, .skills-grid, .curriculum-grid, .cards-grid, .contact-grid, .soft-tags"
  );
  if (!reduceMotion && "IntersectionObserver" in window && staggerGrids.length) {
    var stagObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var grid = entry.target;
          grid.classList.add("in");
          stagObs.unobserve(grid);
          // Une fois la cascade jouée, on retire les classes pour ne pas
          // interférer avec les filtres et le tilt 3D.
          setTimeout(function () {
            grid.classList.remove("stagger", "in");
          }, grid.children.length * 70 + 700);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -30px 0px" });
    staggerGrids.forEach(function (grid) {
      Array.prototype.forEach.call(grid.children, function (child, i) {
        child.style.setProperty("--d", (i * 70) + "ms");
      });
      grid.classList.add("stagger");
      stagObs.observe(grid);
    });
  }

  // --- Timeline : ligne dessinée + étapes en cascade ---
  var timelines = document.querySelectorAll(".timeline");
  if (!reduceMotion && "IntersectionObserver" in window && timelines.length) {
    var tlObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          tlObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    timelines.forEach(function (tl) {
      Array.prototype.forEach.call(tl.querySelectorAll(".timeline-item"), function (item, i) {
        item.style.setProperty("--i", i);
      });
      tl.classList.add("tl-anim");
      tlObs.observe(tl);
    });
  }

  // --- Effets liés au scroll : header, indicateur, parallaxe, anneau ---
  var header = document.querySelector(".site-header");
  var scrollHint = document.querySelector(".scroll-hint");
  var heroPhoto = document.querySelector(".hero-photo");
  var ringVal = toTop.querySelector(".ring-val");
  var RING_LEN = 163.4;
  var fxTicking = false;

  function onScrollFx() {
    fxTicking = false;
    var y = window.scrollY;
    if (header) header.classList.toggle("scrolled", y > 10);
    if (scrollHint) scrollHint.classList.toggle("hide", y > 90);
    if (heroPhoto && !reduceMotion && y < 900) {
      heroPhoto.style.transform = "translateY(" + (y * 0.1).toFixed(1) + "px)";
    }
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
