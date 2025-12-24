/* Tasquirre E-Catalog — slide-like scrolling + galleries + modal */
(function () {
  const slidesEl = document.getElementById("slides");
  const slides = Array.from(document.querySelectorAll(".slide"));
  const dots = Array.from(document.querySelectorAll(".dot"));

  const btnPrev = document.getElementById("btnPrev");
  const btnNext = document.getElementById("btnNext");

  const modal = document.getElementById("modal");
  const modalImg = document.getElementById("modalImg");
  const modalCap = document.getElementById("modalCap");

  // ---------- Slide helpers ----------
  function getCurrentIndex() {
    const y = slidesEl.scrollTop;
    let best = 0;
    let bestDist = Infinity;
    slides.forEach((s, i) => {
      const dist = Math.abs(s.offsetTop - y);
      if (dist < bestDist) { bestDist = dist; best = i; }
    });
    return best;
  }

  function goToIndex(i) {
    const idx = Math.max(0, Math.min(slides.length - 1, i));
    slides[idx].scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function goToHash(hash) {
    const el = document.querySelector(hash);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  btnPrev?.addEventListener("click", () => goToIndex(getCurrentIndex() - 1));
  btnNext?.addEventListener("click", () => goToIndex(getCurrentIndex() + 1));

  // Keyboard navigation (↑/↓, PgUp/PgDn)
  window.addEventListener("keydown", (e) => {
    if (modal.classList.contains("is-open")) {
      if (e.key === "Escape") closeModal();
      return;
    }
    if (["ArrowDown", "PageDown"].includes(e.key)) { e.preventDefault(); goToIndex(getCurrentIndex() + 1); }
    if (["ArrowUp", "PageUp"].includes(e.key)) { e.preventDefault(); goToIndex(getCurrentIndex() - 1); }
    if (e.key === "Home") { e.preventDefault(); goToIndex(0); }
    if (e.key === "End") { e.preventDefault(); goToIndex(slides.length - 1); }
  });

  // Dots click
  dots.forEach(d => {
    d.addEventListener("click", () => {
      const target = d.getAttribute("data-target");
      if (target) goToHash(target);
    });
  });

  // Observe slide visibility for reveal + dot active
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const idx = slides.indexOf(entry.target);
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        dots.forEach(x => x.classList.remove("is-active"));
        if (dots[idx]) dots[idx].classList.add("is-active");

        // Update URL hash (nice for share)
        const id = entry.target.id;
        if (id) history.replaceState(null, "", "#" + id);
      }
    });
  }, { root: slidesEl, threshold: 0.55 });

  slides.forEach(s => io.observe(s));

  // Also support navbar links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || href.length < 2) return;
      const el = document.querySelector(href);
      if (!el) return;
      e.preventDefault();
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  // ---------- Galleries ----------
  // You can change captions freely
  const galleries = {
    product: [
      { src: "p1.jpeg", title: "Product", cap: "Photo 1" },
      { src: "p2.jpeg", title: "Product", cap: "Photo 2" },
      { src: "p3.jpeg", title: "Product", cap: "Photo 3" },
      { src: "p4.jpeg", title: "Product", cap: "Photo 4" },
      { src: "p5.jpeg", title: "Product", cap: "Photo 5" }
    ],
    bifest: [
      { src: "bf1.jpeg", title: "BINUS Festival", cap: "Photo 1" },
      { src: "bf2.jpeg", title: "BINUS Festival", cap: "Photo 2" },
      { src: "bf3.jpeg", title: "BINUS Festival", cap: "Photo 3" },
      { src: "bf4.jpeg", title: "BINUS Festival", cap: "Photo 4" },
      { src: "bf5.jpeg", title: "BINUS Festival", cap: "Photo 5" }
    ],
    entre: [
      { src: "ec1.jpeg", title: "Entre Corner", cap: "Photo 1" },
      { src: "ec2.jpeg", title: "Entre Corner", cap: "Photo 2" },
      { src: "ec3.jpeg", title: "Entre Corner", cap: "Photo 3" },
      { src: "ec4.jpeg", title: "Entre Corner", cap: "Photo 4" },
      { src: "ec5.jpeg", title: "Entre Corner", cap: "Photo 5" }
    ],
    bisanara: [
      { src: "ss1.png", title: "Bisanara Screenshot 1", cap: "Evidence 1" },
      { src: "ss3.png", title: "Bisanara Screenshot 2", cap: "Evidence 2" },
      { src: "ss2.png", title: "Bisanara Screenshot 3", cap: "Evidence 3" },
      { src: "ss5.png", title: "Bisanara Screenshot 4", cap: "Evidence 4" },
      { src: "ss4.png", title: "Bisanara Screenshot 5", cap: "Evidence 5" }
    ]
  };

  function buildGallery(key, mountId) {
    const mount = document.getElementById(mountId);
    if (!mount) return;

    const items = galleries[key] || [];
    mount.innerHTML = "";

    items.forEach((it, idx) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "gcard";
      card.setAttribute("aria-label", `Open ${it.title}`);

      // Use placeholder if image missing
      const imgWrap = document.createElement("div");
      imgWrap.className = "gcard__img";

      const img = document.createElement("img");
      img.src = it.src;
      img.alt = it.title;
      img.loading = "lazy";
      img.onerror = () => {
        // fallback: remove broken <img> and show emoji placeholder
        img.remove();
        const ph = document.createElement("div");
        ph.style.fontWeight = "900";
        ph.style.color = "rgba(43,27,16,.72)";
        ph.innerHTML = "📷<br/><span style='font-size:12px'>Add image</span>";
        imgWrap.appendChild(ph);
      };

      imgWrap.appendChild(img);

      const meta = document.createElement("div");
      meta.className = "gcard__meta";
      meta.innerHTML = `<div class="gcard__title">${it.title}</div><div class="gcard__cap">${it.cap}</div>`;

      card.appendChild(imgWrap);
      card.appendChild(meta);

      card.addEventListener("click", () => openModal(it.src, `${it.title} — ${it.cap}`));

      mount.appendChild(card);
    });
  }

  buildGallery("product", "gallery-product");
  buildGallery("bifest", "gallery-bifest");
  buildGallery("entre", "gallery-entre");
  buildGallery("bisanara", "gallery-bisanara");

  // Scroll controls for each gallery row
  function scrollGallery(key, dir) {
    const row = document.getElementById(`gallery-${key}`);
    if (!row) return;
    const amount = 260 * dir;
    row.scrollBy({ left: amount, behavior: "smooth" });
  }

  document.querySelectorAll("[data-gprev]").forEach(btn => {
    btn.addEventListener("click", () => scrollGallery(btn.dataset.gprev, -1));
  });
  document.querySelectorAll("[data-gnext]").forEach(btn => {
    btn.addEventListener("click", () => scrollGallery(btn.dataset.gnext, +1));
  });

  // ---------- Modal ----------
  function openModal(src, caption) {
    modalImg.src = src;
    modalCap.textContent = caption || "";
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
  }

  function closeModal() {
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    modalImg.src = "";
    modalCap.textContent = "";
  }

  modal.addEventListener("click", (e) => {
    const close = e.target && e.target.dataset && e.target.dataset.close;
    if (close) closeModal();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
  });

  // If user opens with hash, go to that section nicely
  window.addEventListener("load", () => {
    const hash = window.location.hash;
    if (hash && document.querySelector(hash)) {
      setTimeout(() => goToHash(hash), 50);
    } else {
      // Make first visible quickly
      slides[0]?.classList.add("is-visible");
    }
  });
})();


document.querySelectorAll(".dot").forEach(dot => {
  dot.addEventListener("click", () => {
    const target = dot.dataset.target;
    const section = document.querySelector(target);

    if (!section) return;

    section.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
});
