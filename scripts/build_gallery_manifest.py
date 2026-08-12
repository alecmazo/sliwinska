#!/usr/bin/env python3
"""Build gallery manifest from public/images (skip tiny thumbs)."""
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1]
IMG = ROOT / "public" / "images"
MIN = 50_000  # skip broken thumbs

# Human-friendly labels when we can guess
LABELS = {
    "home-803cbd267aa7": "Stage intro",
    "show-photos-02": "Show ensemble",
    "dwts_cover": "DWTS cover",
    "wedding-couple": "Wedding couple",
    "wedding-couple-2": "Wedding couple",
    "corporate-3bdc07cf1f76": "Corporate energy",
    "about-d8e43c458a0a": "Portrait",
    "img_8693-3494e13": "Iconic DWTS poster",
    "edyta-cameron": "With Cameron",
    "edyta-evander": "With Evander",
    "edyta-hamilton": "With Hamilton",
    "edyta-joey": "With Joey",
    "alec_20edyta_20show_20pic": "Stage with Alec",
    "alec-edyta-copy": "Alec & Edyta",
    "img_1322": "Stage lights",
}

# Hidden from the public gallery — kids program is unpublished.
SKIP = {
    "7-8yr-old.jpg",
    "kids-998b9697863f.jpg",
    "photo-dec-16-2023-6-17-29-pm.jpg",
    "photo-dec-19-2023-8-53-34-am-1-.jpg",
    "img_2279.jpg",
    "img_2381.jpg",
    "b44b9f745edbce5cfb2a8e548565c2b4.jpeg",
    "c86755a6-b244-4819-b62a-5d802c96445b.jpeg",
}

items = []
for p in sorted(IMG.iterdir(), key=lambda x: x.name.lower()):
    if not p.is_file():
        continue
    if p.suffix.lower() not in {".jpg", ".jpeg", ".png", ".webp", ".gif"}:
        continue
    if p.stat().st_size < MIN:
        continue
    if p.name in SKIP:
        continue
    stem = p.stem
    label = LABELS.get(stem)
    if not label:
        # clean stem
        label = stem.replace("_", " ").replace("-", " ").title()
        if label.lower().startswith("img "):
            label = "Studio · " + label
        if "wedding" in label.lower():
            label = "Wedding · " + label
    wide = p.stat().st_size > 250_000 and any(k in stem for k in ("show", "home-803", "1322", "weddings-261"))
    tall = any(k in stem for k in ("edyta-", "about-", "dwts", "8693", "img_5546", "img_6232", "img_5645", "img_4545"))
    items.append({
        "file": p.name,
        "src": f"images/{p.name}",
        "label": label,
        "wide": bool(wide),
        "tall": bool(tall) and not wide,
    })

out = ROOT / "public" / "gallery-data.json"
out.write_text(json.dumps(items, indent=2) + "\n")
print(f"Wrote {len(items)} images → {out}")
for it in items:
    print(f"  {it['file'][:40]:40} {it['label']}")
