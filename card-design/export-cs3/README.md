# export-cs3/

Assets for the **physical card run** — the manifest that drives the
CS3 / print-on-demand export.

## Files

- `archmage-cards.csv`   — the full card manifest (one row per card in the
  printable deck: id, suit, value, rarity, front art tag, etc.).
- `cs3-guide.md`         — notes for CS3 / DriveThruCards upload (artwork
  bleed, DPI, colour profile, back-of-card, card-count, pricing).
- `manifest-csv.js`      — helper that can (re)generate `archmage-cards.csv`
  from the in-memory deck definition. Ported from the old
  `card-workbench`. Run in Node or in DevTools against a page that has
  `ArchmageCards` loaded.

## Updating the manifest

1. Edit the deck definition inside `lib/cards.js` (the `buildCards`
   function) — that's the source of truth.
2. Regenerate `archmage-cards.csv` by re-running the exporter (or hand-edit
   if the change is small).
3. Commit the new CSV alongside `lib/cards.js` so the physical deck and
   the digital deck stay in sync.
