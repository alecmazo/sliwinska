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
    const frame = document.getElementById("wedding-video-frame");
    if (!host || !frame) return;

    const files = [
      "media/wedding-first-dance.mp4",
      "media/wedding-dance.mp4",
      "media/first-dance.mp4",
      "media/wedding-first-dance.webm",
    ];

    function showFile(src, poster) {
      host.hidden = false;
      frame.innerHTML =
        '<video controls playsinline preload="metadata"' +
        (poster ? ' poster="' + poster + '"' : "") +
        '><source src="' +
        src +
        '"></video>';
    }
    function showIframe(src) {
      host.hidden = false;
      frame.innerHTML =
        '<iframe src="' +
        src +
        '" title="Wedding first dance" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen" allowfullscreen loading="lazy"></iframe>';
    }

    fetch("site-media.json", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : {}))
      .catch(() => ({}))
      .then((cfg) => {
        const v = (cfg && cfg.weddingVideo) || {};
        const poster = v.poster || "images/wedding-couple.jpeg";
        const cap = document.getElementById("wedding-video-caption");
        if (cap && v.caption && v.src) cap.textContent = v.caption;
        const title = document.getElementById("wedding-video-title");
        if (title && v.title) title.textContent = v.title;

        if (v.src) {
          const embed = toEmbedSrc(v.src);
          if (embed.kind === "iframe") {
            showIframe(embed.src);
            return;
          }
          showFile(embed.src, poster);
          return;
        }

        let i = 0;
        function tryNext() {
          if (i >= files.length) {
            host.hidden = true;
            return;
          }
          const src = files[i++];
          const probe = document.createElement("video");
          probe.preload = "metadata";
          probe.onloadedmetadata = () => showFile(src, poster);
          probe.onerror = tryNext;
          probe.src = src;
        }
        tryNext();
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
            String(rev.text || "").replace(/</g, "&lt;") +
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
