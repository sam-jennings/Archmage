# Archmage Ascension — printenbind.nl session prompt

## Project state

We have been building a print-ready card submission for Archmage Ascension to
printenbind.nl. After several pipeline iterations the latest file check returned:

- Size: ✓  Resolution: ✓  Bleed: ✓
- **Margins: ✗** — "We raden het af een kader/randen/lijsten in je ontwerp te gebruiken,
  aangezien er bij kaders een grote kans is dat deze niet aan alle kanten evenredig uitkomt.
  Mocht je er desondanks op staan toch een kader te willen gebruiken, dan raden we je aan
  deze minimaal 5mm dik te maken/van de rand af te plaatsen."
  (Translation: avoid border frames in your design; if you insist, they must be ≥5mm thick
  OR placed ≥5mm from the trim edge.)

There are two things to fix in this session, then re-run the full export pipeline.

---

## Key files

| Windows path | Purpose |
|---|---|
| `card-design/lib/cards.js` | Card SVG renderer — source of truth (~803 lines) |
| `card-design/connectors/beacon.js` | Beacon connector (orb + halos) |
| `card-design/printenbind/outputs/export-cards.mjs` | Export script (600dpi, pdf-lib) |
| `card-design/printenbind/outputs/lib-cards.js` | Copy of cards.js used by export script |
| `card-design/printenbind/outputs/connectors-beacon.js` | Copy of beacon.js used by export script |
| `card-design/export-printenbind/` | Final output folder (105 PDFs + zip) |

All files are in the mounted OneDrive folder:
`C:\Users\sam.jennings\OneDrive - Arrise Solutions Malta Limited\Documents\Archmage Ascension\`

---

## ⚠ Critical: OneDrive Linux mount truncation

`card-design/lib/cards.js` is 803 lines on Windows but appears truncated at line ~790 in
Linux (ends mid-line at `get C`). This affects any bash/Python that reads the file directly.

**Workaround used in previous sessions:** use the Windows `Read` tool to read cards.js in
full, then write a complete copy to `/sessions/.../outputs/lib-cards-full.js` in the
sandbox. Then load it via the `LIB_CARDS` env var in the export script.

The `lib-cards.js` copy in `printenbind/outputs/` has the same truncation issue from Linux.
When running the export from bash, always set:
```
LIB_CARDS=/sessions/<session-id>/mnt/outputs/lib-cards-full.js
```

---

## Fix 1: Margins — border frames too close to trim edge

### Geometry reference

```
UPM = 252/62 = 4.065 SVG units/mm   (at sc=1)
5mm safe zone = 5 × 4.065 = 20.32 SVG units
Card: W=252, H=358, bleed B=12.19 SVG units
```

### Where the border frames are (4 locations in cards.js)

**1. `makeBeaconBorder` (~line 337):**
Draws a decorative ring just inside the card edge for beacon-connector cards.
```javascript
const bm = 2.5 * sc;   // ← only ~0.6mm from trim
const bmRx = (9.5 * (252/62) * sc - bm).toFixed(1);
gfx += `<rect x="${bm}" y="${bm}" width="${(W-2*bm).toFixed(1)}" ...`
```
Fix: change `bm = 2.5 * sc` to `bm = 20 * sc` (≈4.9mm — just inside 5mm).

**2. `vectorBorder` fallback (~line 461):**
Used for non-beacon connectors. Three rects at x=2, x=5, x=10 (fixed, unscaled).
```javascript
: `<rect x="2" y="2" width="${W-4}" height="${H-4}" ...`
  + `<rect x="5" y="5" width="${W-10}" height="${H-10}" ...`
  + `<rect x="10" y="10" width="${W-20}" height="${H-20}" ...`
```
Fix: move to safe zone — change x=2→`${(20*sc).toFixed(1)}`, x=5→`${(23*sc).toFixed(1)}`,
x=10→`${(28*sc).toFixed(1)}` and adjust widths/heights accordingly.
Or simply remove these three rects since all current exports use the beacon connector.

**3. `makeWildCard` border rects (~line 606):**
Same three fixed-position rects inside the wild card SVG template literal. Same fix as #2.

**4. `makeCardBack` border rects (~line 753):**
Uses `B+2*sc` and `B+5*sc` offsets where B=bleed (12.19 SVG units).
`B+2*sc` ≈ 14.2 units ≈ 3.5mm — still inside the 5mm zone.
Fix: change to `B+20*sc` and `B+23*sc` (or remove the inner ring).

### Recommendation
The simplest compliant fix: **move all border frames to ≥20*sc inset** (matching the 5mm
safe zone already used for gameplay elements). Alternatively, remove the outer two rings
entirely and keep only the innermost as a single line at 5mm inset — that is least likely
to trigger margin flags.

---

## Fix 2: Corner pip clash — values 1 and 2

### Root cause

The pip and beacon orb share the same x-centre (`OL_strip/2 = 31` SVG units). At low
values the orb y-position lands right on the pip text, causing them to collide.

**Corner pip text (cards.js lines 396, 432):**
```javascript
const pipY = layout.pipTop*sc + edgeInset;  // = 28 + 17 = 45 (baseline)
// cap-height top ≈ y=31; text occupies y=31–45
```

**Beacon orb (beacon.js, called with OL=OL_strip=62):**
```javascript
const rawCy = TM + val * ST;   // TM=16*sc, ST=16*sc
const margin = 44 * sc;
const cy = Math.max(margin, Math.min(H - margin, rawCy));
const orbR = 7.5 * sc;
```
- val=1: rawCy=32 → clamped to **cy=44** → orb core y=36.5–51.5 (overlaps pip at y=31–45)
- val=2: rawCy=48 → **cy=48** → orb core y=40.5–55.5 (still overlaps)

### Why a simple one-line fix doesn't work

Moving the pip UP is blocked by the 5mm safe zone: pip text top = pipY − cap_height must
be ≥ 20.32 SVG units. That means pipY ≥ ~34. At pipY=34 the orb core top is still 36.5
— only a 2.5-unit gap (~0.6mm). Not clearly above.

Increasing the beacon margin alone (e.g. `margin = 60 * sc`) pushes val=1 and val=2 to
the same clamped position, breaking the consistent stagger requirement.

### Correct fix: pip UP + beacons DOWN + range compression

**Three coordinated changes:**

**1. `cards.js` line 362 — shift beacon range down and compress it:**
```javascript
// Before:
const W=252*sc, H=358*sc, R=12*sc, OL=28*sc, TM=16*sc, ST=16*sc;
// After:
const W=252*sc, H=358*sc, R=12*sc, OL=28*sc, TM=42*sc, ST=13*sc;
```
Result (at sc=1):
- val=1: rawCy = 42+13 = **55** (> margin 44, so natural — no clamping) 
- val=20: rawCy = 42+260 = **302** (< H−margin 314, so natural — no clamping)
- All 20 values naturally staggered at 13-unit intervals; none clamped

**2. `cards.js` LayoutVariants — move pip up:**
```javascript
// Before:
classic: { pipTop: 28, pipSize: 20, labelBelow: true, numSize: 28, numPos: 'medallion' },
// After:
classic: { pipTop: 19, pipSize: 20, labelBelow: true, numSize: 28, numPos: 'medallion' },
```
New pipY = 19 + 17 = **36** (baseline). Text top ≈ 36−14 = **22 SVG units = 5.4mm** ✓ (safe zone).
Gap to val=1 orb core top (55−7.5=47.5): **47.5 − 36 = 11.5 SVG units = 2.8mm** — clearly above.

**3. `cards.js` line 398 — update bottom-right pip mirror position:**
```javascript
// Before:
const invCX=W-OL_strip/2, invCY=H-28*sc-edgeInset;
// After:
const invCX=W-OL_strip/2, invCY=H-19*sc-edgeInset;
```
New bottom pip: baseline at y=322 (was 313). Text edge at ~y=336.
Distance from bottom trim (y=358): **22 SVG units = 5.4mm** ✓

### Verification

| | Before | After |
|---|---|---|
| pip baseline | y=45 | y=36 |
| pip text top | y=31 (7.6mm) | y=22 (5.4mm) ✓ |
| val=1 orb cy | y=44 (clamped) | y=55 (natural) |
| pip-to-orb gap | **−8.5 (overlap!)** | +11.5 SVG units (2.8mm) ✓ |
| val=2 orb cy | y=48 | y=68 |
| val=20 orb cy | y=314 (clamped) | y=302 (natural) ✓ |
| consecutive stagger | 16 SVG units | 13 SVG units (consistent ✓) |

---

## After fixing: re-run the export pipeline

### Step 1: build lib-cards-full.js in sandbox

Use the Windows `Read` tool to get the full cards.js (803 lines), then write it verbatim
to `/sessions/<session>/mnt/outputs/lib-cards-full.js`. Verify with:
```bash
node --check /sessions/<session>/mnt/outputs/lib-cards-full.js
```

Also copy the fixed `connectors-beacon.js` to sandbox if beacon.js was changed.

### Step 2: export PNGs → PDFs (600dpi)

```bash
cd "card-design/printenbind/outputs"
LIB_CARDS=/sessions/<session>/mnt/outputs/lib-cards-full.js \
OUT_DIR=/sessions/<session>/mnt/outputs/print-pdfs-600 \
node export-cards.mjs
```

Script skips existing files. At 600dpi each card takes ~0.5–1s; the 45s bash timeout
may cut it short — just run again until all 105 files exist.

### Step 3: CMYK convert + TrimBox (Ghostscript + pypdf)

Use the script from the previous session as a template. Key points:
- GS flags: `dColorImageResolution=600`, `dDownsampleColorImages=false`, `FlateEncode`
- ICC: `/usr/share/texlive/texmf-dist/tex/generic/colorprofiles/FOGRA39L_coated.icc`
- **CRITICAL — pypdf 6.x TrimBox must be set this way** (`.trimbox.lower_left=` silently
  fails — it modifies a copy):
  ```python
  from pypdf.generic import NameObject, ArrayObject, FloatObject
  MM = 72 / 25.4
  TL, TB = 3*MM, 3*MM
  TR, TT = 65*MM, 91*MM   # 68-3, 94-3
  page[NameObject('/TrimBox')] = ArrayObject([FloatObject(TL), FloatObject(TB), FloatObject(TR), FloatObject(TT)])
  page[NameObject('/BleedBox')] = ArrayObject([FloatObject(0), FloatObject(0), FloatObject(68*MM), FloatObject(94*MM)])
  ```

### Step 4: copy to export-printenbind and rezip

Copy the 105 CMYKs to `card-design/export-printenbind/` and create
`printenbind-cards-cmyk-600.zip`. Note: `void-10.pdf` in that folder is still the old
300dpi version (OneDrive permission lock from Linux). Sam can rename `_void10_new.pdf` →
`void-10.pdf` on Windows, but the zip already has the correct void-10 inside.

---

## Print spec reference (printenbind.nl)

- Trim: 62×88mm, Bleed: 3mm each side → page 68×94mm
- TrimBox: inner 62×88mm; BleedBox/MediaBox: full 68×94mm
- 600dpi (1606×2222px), CMYK Fogra39L ICC
- Text and graphics ≥5mm from trim edge
- Corner punch radius: 9.5mm (already baked into border rx values from last session)
- Fonts must be embedded or baked into raster (we rasterise at 600dpi — no font issues)
