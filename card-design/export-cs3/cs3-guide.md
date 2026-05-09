# Archmage Ascension — Component Studio 3 Setup Guide

_Updated 2026-05-04 · 5-energy deck: Radiance / Void / Flux / Aether / Echo + Wild_

---

## Step 1 — Choose your design and export SVGs

Open `playtable.html` in a browser. Use the connector and art dropdowns to pick the
combination you want to print. Note the exact names shown (e.g. `parallelogram`, `echo`,
layout `classic`).

Then open a terminal in the `card-design/` folder and run:

```bash
node export-cs3/export.js --connector parallelogram --art echo --layout classic
```

This writes **101 SVG files** (one per card) to `export-cs3/svg-cards/` and a manifest
to `export-cs3/export-manifest.json`. The SVGs are rendered at 3× scale (756 × 1074 px)
which CS3 handles natively — no further scaling needed.

**Available options:**

| Flag | Default | Notes |
|------|---------|-------|
| `--connector` | `parallelogram` | Only `parallelogram` is currently complete. (`beacon` is incomplete.) |
| `--art` | `echo` | Only `echo` is currently complete. (`mixed`, `relic` are incomplete.) |
| `--layout` | `classic` | Also: `compact`, `regal`, `flag` |
| `--scale` | `3` | 3× = ~288 dpi at 96 dpi base. Increase for higher resolution. |

---

## Step 2 — CS3 game setup

| Setting | Value |
|---|---|
| Card size | 63 × 88 mm (standard poker) |
| Bleed | 3 mm on all sides |
| Resolution | 300 dpi |
| Total cards | 101 (100 energy + 1 wild) |

---

## Step 3 — Import the SVGs

The SVG files in `export-cs3/svg-cards/` are **complete, standalone card faces**.
Each SVG is named `{energy}-{value}.svg` (e.g. `radiance-07.svg`, `wild-00.svg`).

In CS3:
1. Go to **Image Manager** → create a folder called `archmage-cards`
2. Upload all 101 SVGs from `export-cs3/svg-cards/`
3. Use the CSV dataset (`archmage-cards.csv`) to drive per-card data (value label,
   energy name, quantity) if CS3 is populating additional text layers on top of the SVG art

---

## Step 4 — Import the dataset (optional)

The dataset `archmage-cards.csv` is useful if you want CS3 to manage quantity or
metadata. It is **not** needed for the card art itself — that's all baked into the SVGs.

**Column reference:**

| Column | Content |
|--------|---------|
| `quantity` | Always 1 |
| `name` | Unique card ID, e.g. `radiance-07` |
| `energy` | Energy name, e.g. `Radiance` |
| `value` | Integer 1–20 (Wild = 0) |
| `symbol_url` | Blank — art is in the SVG |
| `energy_colour` | Bright accent hex |
| `energy_mid` | Mid-tone hex |
| `is_wild` | `true` for the wild card only |

---

## Energy colour reference

| Energy | Bright | Mid |
|--------|--------|-----|
| Radiance | `#f5c518` | `#c8961a` |
| Void     | `#c060f0` | `#6a0dad` |
| Flux     | `#00c8b4` | `#008878` |
| Aether   | `#e8304a` | `#c8203a` |
| Echo     | `#c8d4e8` | `#7a8aaa` |

---

## Re-exporting after design changes

Any time you change a connector, art file, or palette in `lib/cards.js`, re-run the
export script. The SVGs in `svg-cards/` will be overwritten with the new render.

```bash
node export-cs3/export.js --connector parallelogram --art echo --layout classic
```
