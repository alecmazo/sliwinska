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
    "7-8yr-old": "Kids class",
    "kids-998b9697863f": "Youth program",
    "edyta-cameron": "With Cameron",
    "edyta-evander": "With Evander",
    "edyta-hamilton": "With Hamilton",
    "edyta-joey": "With Joey",
    "alec_20edyta_20show_20pic": "Stage with Alec",
    "alec-edyta-copy": "Alec & Edyta",
    "img_1322": "Stage lights",
    "img_2279": "Performance",
}

items = []
for p in sorted(IMG.iterdir(), key=lambda x: x.name.lower()):
    if not p.is_file():
        continue
    if p.suffix.lower() not in {".jpg", ".jpeg", ".png", ".webp", ".gif"}:
        continue
    if p.stat().st_size < MIN:
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
    wide = p.stat().st_size > 250_000 and any(k in stem for k in ("show", "home-803", "1322", "2279", "weddings-261"))
    tall = any(k in stem for k in ("edyta-", "about-", "dwts", "img_2381", "img_5546", "img_6232", "img_5645", "img_4545"))
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
