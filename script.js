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
      { src: "assets/product-1.jpg", title: "Product Photo 1", cap: "Isi caption product kamu" },
      { src: "assets/product-2.jpg", title: "Product Photo 2", cap: "Isi caption product kamu" },
      { src: "assets/product-3.jpg", title: "Product Photo 3", cap: "Isi caption product kamu" },
      { src: "assets/product-4.jpg", title: "Product Photo 4", cap: "Isi caption product kamu" },
      { src: "assets/product-5.jpg", title: "Product Photo 5", cap: "Isi caption product kamu" }
    ],
    bifest: [
      { src: "assets/bifest-1.jpg", title: "BINUS Festival 1", cap: "Momen booth / feedback" },
      { src: "assets/bifest-2.jpg", title: "BINUS Festival 2", cap: "Momen booth / feedback" },
      { src: "assets/bifest-3.jpg", title: "BINUS Festival 3", cap: "Momen booth / feedback" },
      { src: "assets/bifest-4.jpg", title: "BINUS Festival 4", cap: "Momen booth / feedback" },
      { src: "assets/bifest-5.jpg", title: "BINUS Festival 5", cap: "Momen booth / feedback" }
    ],
    entre: [
      { src: "assets/entre-1.jpg", title: "Entre Corner 1", cap: "Interaksi pengunjung" },
      { src: "assets/entre-2.jpg", title: "Entre Corner 2", cap: "Interaksi pengunjung" },
      { src: "assets/entre-3.jpg", title: "Entre Corner 3", cap: "Interaksi pengunjung" },
      { src: "assets/entre-4.jpg", title: "Entre Corner 4", cap: "Interaksi pengunjung" },
      { src: "assets/entre-5.jpg", title: "Entre Corner 5", cap: "Interaksi pengunjung" }
    ],
    bisanara: [
      { src: "assets/bisanara-1.jpg", title: "Bisanara Screenshot 1", cap: "Screen: (jelaskan halaman)" },
      { src: "assets/bisanara-2.jpg", title: "Bisanara Screenshot 2", cap: "Screen: (jelaskan halaman)" },
      { src: "assets/bisanara-3.jpg", title: "Bisanara Screenshot 3", cap: "Screen: (jelaskan halaman)" },
      { src: "assets/bisanara-4.jpg", title: "Bisanara Screenshot 4", cap: "Screen: (jelaskan halaman)" },
      { src: "assets/bisanara-5.jpg", title: "Bisanara Screenshot 5", cap: "Screen: (jelaskan halaman)" }
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
