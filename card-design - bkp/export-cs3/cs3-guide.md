# Archmage Ascension — Component Studio 3 Setup Guide

_Generated 2026-04-09 · Based on card-design-spec-d4-optD (Direction 4, Option D)_

---

## 1. Game Setup

In CS3, create a new game and configure the card type:

| Setting | Value |
|---|---|
| Card size | 63 × 88 mm (standard poker) |
| Bleed | 3 mm on all sides |
| Resolution | 300 dpi |
| Total cards | 81 (80 element + 1 wild) |

---

## 2. Import the Dataset

The dataset file is `export/archmage-cards.csv` in the card-design folder.

**To import:**
1. In CS3, open the **Dataset** panel → **Import** → **Import from CSV**
2. Select `archmage-cards.csv`
3. Verify column mapping:
   - `quantity` → Quantity
   - `name` → Name / Unique ID
   - `element` → (custom field)
   - `value` → (custom field, integer)
   - `symbol_url` → (image field — leave blank for now, fill after image upload)
   - `element_colour` → (custom field, hex colour)
   - `element_mid` → (custom field, hex colour)
   - `is_wild` → (boolean field)

**For future updates:** If you publish the CSV to Google Sheets, paste the published CSV URL into CS3's dataset editor → **Import from Google Sheets**. CS3 will re-pull on demand — no manual re-import needed.

---

## 3. Upload Symbol Images

Once symbol PNGs have been exported from `card-design-combined.html`:

1. In CS3, go to **Image Manager** → create a folder called `archmage-symbols`
2. Upload one PNG per element:
   - `export/symbols/fire.png`
   - `export/symbols/water.png`
   - `export/symbols/earth.png`
   - `export/symbols/air.png`
   - `export/symbols/wild.png`
3. Copy each image's CS3 URL and paste it into the `symbol_url` column in the dataset (one URL per element, same URL for all values of that element)

---

## 4. Template Layer Order

Build the card template with these layers, top to bottom:

### Layer 1 — Value pip (top-left)
- Type: **Text**
- Content: `{{value}}`
- Font: Cinzel Bold
- Size: ~32pt
- Position: 4.8 mm from left edge, 6 mm from top
- Colour: element bright (use `{{element_colour}}`)

### Layer 2 — Element name (bottom-centre)
- Type: **Text**
- Content: `{{element}}`
- Font: Cinzel Regular
- Size: ~18pt
- Position: centred horizontally, ~72 mm from top
- Colour: element bright (`{{element_colour}}`), ~80% opacity

### Layer 3 — Symbol image (art zone, centred)
- Type: **Image**
- Source: `{{symbol_url}}`
- Size: 472 × 472 px equivalent (~40 × 40 mm at 300 dpi)
- Position: centred in art zone (approx 18–58 mm from top of card face)
- Blend: normal, 100% opacity

### Layer 4 — Connection strip (left edge)
- Type: **Static image** — strips do not vary per card; one strip asset covers all
- Width: 9.5 mm (= 36 px at 96 dpi ≈ 9.5 mm at 300 dpi)
- Height: full card height (88 mm + bleed)
- Position: flush left edge
- Note: The bloom position varies by value but is rendered in the card art, not as a separate CS3 layer. Use the strip asset as a subtle edge framing element only.

### Layer 5 — Background gradient
- Type: **Rectangle** with gradient fill
- Gradient: horizontal, bottom-left → top-right
- Colour from: `{{element_mid}}` at 12% opacity → `{{element_colour}}` at 88% opacity → `{{element_mid}}` at 12% opacity
- Stops: 12% and 88% as per design spec
- Covers full card face

### Layer 6 — Card base (bottom)
- Type: **Rectangle**, solid dark background
- Colour: derived from element (see values below)

---

## 5. Element Colour Reference

| Element | Bright (`element_colour`) | Mid (`element_mid`) | Background |
|---|---|---|---|
| Fire | `#c85520` | `#782810` | `#180804` |
| Water | `#1468d0` | `#0a3070` | `#040a18` |
| Earth | `#1a9838` | `#0c5018` | `#041408` |
| Air | `#c89818` | `#785808` | `#181204` |
| Wild | `#c8a84a` | `#7a6428` | `#181208` |

---

## 6. Wild Card Handling

The wild card (`is_wild = true`, value = 0) needs a slightly different template:

- **Value pip:** replace with ★ or "★" static text (not `{{value}}`)
- **Element name:** replace with "Wild" or "Convergence" static text
- **Symbol:** use `export/symbols/wild.png`
- **Strip:** all 20 bloom positions are active — use the all-blooms strip asset

In CS3 you can handle this with a conditional layer or by creating a separate template tab for the wild card.

---

## 7. Export for TTS / Print

**Tabletop Simulator cache export:**
1. CS3 → Export → TTS Cache
2. Name it `archmage-v1`
3. Resolution: 300 dpi, PNG

**Print-and-play PDF:**
1. CS3 → Export → PDF
2. Include bleed marks
3. Use 9-up layout (A4) or 6-up (letter)

---

## 8. Card Geometry Reference

These values match the HTML design spec exactly:

| Dimension | px (screen) | mm (print) |
|---|---|---|
| Card width | 252 px | 63 mm |
| Card height | 352 px | 88 mm |
| Corner radius | 12 px | 3 mm |
| Overlap strip width | 36 px | 9.5 mm |
| Strip step interval | 16 px | 4 mm |
| Strip positions (values) | 20 | 20 |
| Top margin (usable area) | 16 px | 4 mm |
| Bottom margin | 16 px | 4 mm |

---

## 9. What's Not Yet in CS3

- **Symbol PNGs** — not yet exported. Run the symbol export from `card-design-combined.html` headless render when design is final.
- **`symbol_url` column** — blank in the CSV. Fill after step 3 above.
- **Connection strip asset** — the bloom strip is rendered in the HTML card art. A static strip edge image for CS3 needs to be cropped from a rendered card export.

---

_To update the dataset after any colour or name change: edit `card-design-combined.html`, extract the new palette values, regenerate `archmage-cards.csv`, and re-import into CS3 (or re-publish to Google Sheets if connected)._
