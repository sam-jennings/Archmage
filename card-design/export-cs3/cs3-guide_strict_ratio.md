# Archmage Ascension - Component Studio 3 / PDF Export Guide

Updated 2026-05-04 - strict print-ratio export

## Important ratio rule

Use **62 x 88 mm** for this printer/export target, not 63 x 88 mm.

- 62 / 88 = **0.704545**
- 732 / 1039 = **0.704524**

Those match the printer's required ~0.705 width/height ratio.

The earlier 63 x 88 mm setup is standard poker size, but it is **not** the same ratio:

- 63 / 88 = **0.715909**

That will make the exported cards fail the 0.705 ratio check if CS3 or another PDF tool uses 63 x 88 mm as the page size.

## Export exact no-bleed cards

Replace `export-cs3/export.js` with `export_strict_ratio.js`, renamed to `export.js`.

Then delete old outputs so you do not accidentally upload stale files:

```bash
rm -rf export-cs3/svg-cards export-cs3/pdf-cards export-cs3/export-manifest.json
```

Run:

```bash
node export-cs3/export.js --connector parallelogram --art echo --layout classic --pdf --no-bleed
```

Expected console output should include:

```text
trim      : 62 x 88 mm
bleed     : 0 mm each side
SVG box   : 732 x 1039 units (0.704524 ratio)
PDF page  : 62 x 88 mm (0.704545 ratio)
```

## Export with 3mm bleed

Run:

```bash
node export-cs3/export.js --connector parallelogram --art echo --layout classic --pdf
```

Expected output:

```text
trim      : 62 x 88 mm
bleed     : 3 mm each side
PDF page  : 68 x 94 mm
```

The **bleed page** naturally has a different outer page ratio because 3mm is added to every side. The final trimmed card is still 62 x 88 mm.

## CS3 setup

| Setting | Value |
|---|---|
| Card/trim size | 62 x 88 mm |
| Bleed | 0 mm if importing no-bleed finished faces; 3 mm if using the bleed export |
| Resolution | 300 dpi |
| Total cards | 101 |

Do **not** set the CS3 card size to 63 x 88 mm for this export target.

## What changed in the stricter exporter

The exporter now creates a final print canvas rather than exposing the internal art viewBox directly.

For no-bleed defaults:

- SVG root size: `62mm x 88mm`
- SVG viewBox: `0 0 732 1039`
- PDF MediaBox: forcibly normalised to `62mm x 88mm` when `pypdf` is installed

This means the SVG ratio, PDF page ratio, and supplier pixel ratio all agree.

## Optional dependency for stronger PDF verification

The script can convert with only CairoSVG, but installing `pypdf` lets it verify and normalise the PDF page boxes:

```bash
pip install cairosvg pypdf
```

or, if your Python setup requires it:

```bash
pip install cairosvg pypdf --break-system-packages
```
