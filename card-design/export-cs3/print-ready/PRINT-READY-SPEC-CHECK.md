# Archmage Ascension — Print-Ready Card Faces

Generated 2026-06-09. Design: **beacon** connector × **mixed** art × **classic** layout.

101 card-face PDFs, one per card, in this folder. All conform to the
printenbind.nl **Expert** submission spec.

## Spec compliance (all 101 files verified)

| Requirement (printenbind.nl) | Target | Result |
|---|---|---|
| File format | PDF/X-1a:2001 | PDF/X-1a, output intent embedded |
| Colour | CMYK, Fogra39L | DeviceCMYK only, FOGRA39 output intent + embedded ICC |
| Trim size | 62 × 88 mm (ratio 0.705) | TrimBox 62 × 88 mm |
| Bleed | 3 mm each side | MediaBox/BleedBox 68 × 94 mm (true 3 mm overprint) |
| Resolution | ≥ 300 dpi | 300 dpi (transparency flattened per PDF/X-1a) |
| Fonts | All embedded | Text outlined to vector paths — no font dependency |
| Safe zone | Text/graphics ≥ 5 mm from trim edge | Corner pips + labels inset to the 5 mm safe zone |

Verification checked every file individually: 101/101 pass on media size,
trim box, CMYK-only, Fogra39 output intent, and font embedding.

## What was done

1. Regenerated the 101 SVG faces (beacon + mixed + classic).
2. Wrapped each into a 68 × 94 mm canvas with the dark background extended
   into the 3 mm bleed margin (true bleed, not just background-to-trim).
3. Rendered to PDF via headless Chrome (faithful glow filters + gradients).
4. Ghostscript → CMYK / Fogra39L, PDF/X-1a:2001, fonts outlined, transparency
   flattened at 300 dpi.
5. Set TrimBox to the inner 62 × 88 mm; BleedBox/MediaBox to the full 68 × 94 mm.

## Notes for upload

- These are the card **fronts** only. You still need a card **back** —
  `export-cs3/card-back.svg/pdf` exists but has not been run through this
  CMYK/bleed pipeline; ask if you want it converted to match.
- The thin decorative inner frame sits close to the trim. printenbind warns
  borders can look uneven if narrower than 4 mm, because cutting can deviate up
  to 1 mm. It reads as an intentional design element here, but if you want it
  bulletproof against cut drift, widen it or pull it inward a touch.
- When uploading, tick **"extended document check"** so printenbind actively
  validates each file.
