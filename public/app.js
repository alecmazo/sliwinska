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
    if (file === path || (path === "" && file === "index.html")) {
      a.setAttribute("aria-current", "page");
    }
  });
})();
