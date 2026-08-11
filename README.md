# Sliwinska

**Edyta Śliwińska** digital home — marketing site, wedding storefront, corporate packages, and Sliw desk.

This is a **standalone project** (not DGA Capital). Domain stays at **GoDaddy**; apps/sites run on **Vercel + Railway**.

## Price recommendation (why this stack)

| Layer | Platform | Why | Typical $ |
|-------|----------|-----|-----------|
| **Main site** `edytasliwinska.com` | **Vercel** (static) | Free Hobby tier for static HTML; CDN + SSL | **$0** |
| **Images** | Git `public/images` (+ optional R2 later) | ~23 MB photos scraped from GoDaddy CDN; no paid DB required for static | **$0** |
| **Weddings app** `weddings.edytasliwinska.com` | **Railway** | Python API, forms, Stripe webhooks, CRM | shares Railway usage |
| **Sliw desk** `sliw.edytasliwinska.com` | **Railway** | Authenticated CRM | shares Railway usage |
| **Corporate packages** `corporate.edytasliwinska.com` | **Vercel static** (replacing Gamma) | Simple packages page, no Gamma dependency | **$0** |
| **Domain + DNS + email** | **GoDaddy** | Keep domain/MX; cancel **$360/yr** Website + Marketing | save **$360/yr** |

**Vercel vs Railway for the brochure site:** Vercel wins on price for static marketing ($0). Railway is better for the **app** stack you already run. Hybrid is cheapest and cleanest.

**Image “database”:** You don’t need a SQL database for photos on a marketing site. Files live in `public/images/` (versioned). Later: Cloudflare R2 / S3 if you outgrow git (~free tier enough for years at this size).

After cutover: **cancel GoDaddy Premium Website + Marketing (~$360/yr)**; keep **domain + email**.

## Repo layout

```text
Sliwinska/
  public/                 ← main marketing site (deploy to Vercel)
    index.html            ← Weddings first, Corporate second
    weddings.html
    corporate.html
    about.html, contact.html, kids.html, podcast.html
    images/               ← scraped photos (videos skipped)
    styles.css, app.js
  apps/sliw-agent/        ← desk + wedding storefront (from DGA monorepo)
  scrape/                 ← raw HTML + content.json (build reference)
  README.md
```

## Local preview (marketing site)

```bash
cd public && python3 -m http.server 4173
# open http://127.0.0.1:4173
```

## Deploy marketing site (Vercel)

```bash
# from repo root
npx vercel --prod
# Project root directory: public
# Or connect GitHub repo → Root Directory = public
```

### GoDaddy DNS (after Vercel deploy)

| Type | Name | Value |
|------|------|--------|
| A / CNAME | `@` | per Vercel dashboard |
| CNAME | `www` | `cname.vercel-dns.com` (or Vercel value) |

Keep existing:

| Type | Name | Value |
|------|------|--------|
| CNAME | `weddings` | Railway edge (current) |
| CNAME | `sliw` | Railway edge (current) |
| CNAME | `corporate` | Vercel (new packages page) |

## Subdomain map

| Host | Purpose |
|------|---------|
| `edytasliwinska.com` | Marketing home (this `public/`) |
| `weddings.edytasliwinska.com` | Booking + Stripe + leads (`apps/sliw-agent/weddings-site`) |
| `corporate.edytasliwinska.com` | Corporate packages (replace Gamma) |
| `sliw.edytasliwinska.com` | Internal desk (Alec + Edyta) |

## Content migration

- Scraped from GoDaddy builder (permission given): home, weddings, corporate, about, contact, kids, podcast, blog.
- **Photos transferred** into `public/images/` (~35 full-size assets). **Videos skipped.**
- Blog was effectively empty on source — omitted as a primary nav item (can re-add later).
- Nav order: **Weddings → Corporate → About → Kids → Podcast → Contact**.

## Sliw agent

Copied into `apps/sliw-agent/` from the DGA monorepo. Runtime still on Railway project `upbeat-ambition` until you create a dedicated Railway project (optional; not required for $ savings).

## Next steps

1. Preview `public/` locally.
2. Deploy `public/` to Vercel; point apex + www DNS.
3. Build thin `corporate` packages page → `corporate.edytasliwinska.com`; retire Gamma link.
4. Cancel GoDaddy Website + Marketing after DNS cutover verified.
5. Optional: new Railway project **Sliwinska** with only sliw + weddings services.
