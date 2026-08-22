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

  function stars(n) {
    const s = Math.max(0, Math.min(5, Number(n) || 0));
    return "★★★★★".slice(0, s) + "☆☆☆☆☆".slice(s);
  }

  function toEmbedSrc(url) {
    if (!url) return null;
    const u = String(url).trim();
    const yt =
      u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{6,})/) ||
      u.match(/youtube\.com\/shorts\/([A-Za-z0-9_-]{6,})/);
    if (yt) return { kind: "iframe", src: "https://www.youtube.com/embed/" + yt[1] + "?rel=0" };
    const vimeo = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (vimeo) return { kind: "iframe", src: "https://player.vimeo.com/video/" + vimeo[1] };
    return { kind: "file", src: u };
  }

  function mountWeddingVideo() {
    const host = document.getElementById("wedding-video");
    if (!host) return;

    function itemHtml(v) {
      const label = v.label ? '<p class="video-label">' + v.label + "</p>" : "";
      const cap = v.caption ? '<p class="video-caption">' + v.caption + "</p>" : "";
      const embed = toEmbedSrc(v.src);
      if (!embed) return "";
      let body = "";
      if (embed.kind === "iframe") {
        body =
          '<iframe src="' +
          embed.src +
          '" title="Wedding first dance" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen loading="lazy"></iframe>';
      } else {
        const poster = v.poster ? ' poster="' + v.poster + '"' : "";
        body = '<video controls playsinline preload="metadata"' + poster + '><source src="' + embed.src + '"></video>';
      }
      return '<div class="video-item"><div class="video-frame">' + body + "</div>" + label + cap + "</div>";
    }

    fetch("site-media.json", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : {}))
      .catch(() => ({}))
      .then((cfg) => {
        const title = document.getElementById("wedding-video-title");
        if (title && cfg.weddingVideo && cfg.weddingVideo.title) title.textContent = cfg.weddingVideo.title;
        let list = Array.isArray(cfg.weddingVideos) ? cfg.weddingVideos.filter((v) => v && v.src) : [];
        if (!list.length && cfg.weddingVideo && cfg.weddingVideo.src) list = [cfg.weddingVideo];
        if (!list.length) {
          host.hidden = true;
          return;
        }
        host.hidden = false;
        host.innerHTML = list.map(itemHtml).join("");
      });
  }

  function mountReviews() {
    const grid = document.getElementById("review-grid");
    if (!grid) return;
    fetch("reviews.json", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data) return;
        const listing = data.listing || {};
        const badge = document.getElementById("google-badge");
        if (badge) {
          const count = listing.count != null ? listing.count : (data.reviews || []).length;
          badge.innerHTML =
            '<div><strong>' +
            (listing.rating != null ? listing.rating.toFixed(1) : "5.0") +
            ' <span class="stars">' +
            stars(listing.rating || 5) +
            "</span></strong><span>" +
            (listing.name || "Dance Sport classes") +
            " · " +
            count +
            " review" +
            (count === 1 ? "" : "s") +
            "</span></div>";
          if (listing.googleUrl) badge.href = listing.googleUrl;
        }
        const map = document.getElementById("google-map");
        if (map && listing.mapsQuery) {
          map.src =
            "https://maps.google.com/maps?q=" +
            encodeURIComponent(listing.mapsQuery) +
            "&z=15&output=embed";
        }
        function cardHtml(rev, featured) {
          const when = [rev.author, rev.date].filter(Boolean).join(" · ");
          return (
            "<div class=\"stars\" aria-label=\"" +
            (rev.stars || 5) +
            ' stars">' +
            stars(rev.stars || 5) +
            "</div>" +
            "<p>“" +
            String(rev.text || "").replace(/</g, "&lt;").replace(/\n\n/g, "</p><p>").replace(/\n/g, "<br>") +
            "”</p>" +
            "<footer><span>" +
            when +
            '</span><span class="review-source">' +
            (rev.source || "") +
            "</span></footer>"
          );
        }
        const list = data.reviews || [];
        const featured = list.find((r) => r.featured);
        const featEl = document.getElementById("featured-review");
        let rest = list;
        if (featEl && featured) {
          featEl.innerHTML = cardHtml(featured, true);
          rest = list.filter((r) => r !== featured);
        }
        grid.innerHTML = rest
          .map((rev) => {
            const cls = rev.featured ? "review-card featured" : "review-card";
            return '<blockquote class="' + cls + '">' + cardHtml(rev) + "</blockquote>";
          })
          .join("");
      })
      .catch(() => {});
  }

  mountWeddingVideo();
  mountReviews();
})();
