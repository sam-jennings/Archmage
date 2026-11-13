# export-tabletopia/ — online playtest asset pack (Tabletopia)

Created 2026-07-20 when the online playtest platform switched from
Screentop.gg to Tabletopia (decision:
`meta/decisions/2026-07-20-tabletopia-switch.md`). Derived from
`../export-screentop/` — same renderer provenance, same v3.1 content.
**The F14 print-export hold is untouched; this is screen-only.**

Tabletopia specifics that shaped this pack (help.tabletopia.com):

- No spritesheets — every card face is its own file, one shared back.
- 10 px = 1 mm, so 600×852 px cards = 60×85.2 mm on the table.
- JPEG allowed for rectangular objects; recommended setup ≤ 20 MB, free
  Basic plan = 1 game / 2 setups / 200 MB storage.

## Contents

- `cards-jpg/` — 62 faces + `back.jpg`, JPEG q88 from the canonical PNGs
  (3.5 MB total vs 19 MB PNG). Row-major canon order: radiance 1–15,
  void 1–15, flux 1–15, aether 1–15, wild ×2.
- `board/board-a3-150dpi-v31.png` — v3.1-patched A3 board (2481×1754 px);
  set object size to 420×297 mm in Tabletopia (≈169% scaling, within the
  400% limit).
- `tokens/counter.png` — capacity counter, 300×300 px = 30×30 mm; keep PNG
  (transparency).

See `TABLETOPIA_BUILD_GUIDE.md` for the build/assembly steps.
