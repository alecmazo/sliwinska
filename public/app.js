(function () {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  // Mark current nav link
  const path = (location.pathname.replace(/\/$/, "") || "/").split("/").pop() || "index.html";
  document.querySelectorAll(".nav a[href]").forEach((a) => {
    const href = a.getAttribute("href") || "";
    const file = href.split("/").pop() || "index.html";
    if (file === path || (path === "" && file === "index.html") || (path === "gallery" && file === "gallery.html")) {
      a.setAttribute("aria-current", "page");
    }
  });

  // Lightbox for gallery
  const box = document.getElementById("lightbox");
  const boxImg = document.getElementById("lightbox-img");
  const closeBtn = document.getElementById("lightbox-close");
  function closeLb() {
    if (!box) return;
    box.classList.remove("open");
    box.setAttribute("aria-hidden", "true");
    if (boxImg) boxImg.src = "";
  }
  if (box && boxImg) {
    document.querySelectorAll("[data-lightbox]").forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        const href = a.getAttribute("href");
        const label = a.getAttribute("data-label") || "";
        boxImg.src = href;
        boxImg.alt = label;
        box.classList.add("open");
        box.setAttribute("aria-hidden", "false");
      });
    });
    closeBtn?.addEventListener("click", closeLb);
    box.addEventListener("click", (e) => {
      if (e.target === box) closeLb();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeLb();
    });
  }
})();
