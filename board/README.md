# board/

Physical game components — the printable artefacts that live on the table
during play.

Promoted to a top-level folder on 2026-07-02 because the board directly
affects the rules and is referenced by the rulebook; it was previously
tucked inside `art/ref cards + board/` and hard to find.

## Contents

- **`archmage_a3_landscape_board.pdf`** — the main game board.
  A3 landscape orientation. Content matches rulebook v3.3 (2026-11-21).
- **`regen_board_v33.py`** — rewrites the board PDF's text in place to v3.3
  (the original ReportLab source was never in the repo; art and layout are
  kept). Run `python board/regen_board_v33.py` from the repo root, once, on
  the pre-v3.3 PDF from git history — it is not idempotent on its own output.
- **`spell_ref.png`** — printable player-facing spell reference card.
  Note: per `web-apps/REFERENCE_SITE_PLAN.md`, the symbols on this image
  are out of date. The canonical source of energy artwork is
  `card-design/art/arcana.js`, and clean symbol exports live in
  `art/energy-symbols-export/`. Refresh this card the next time it's
  reprinted.
- **`turn_ref.png`** — printable player-facing turn-order reference card.

## Related

- `rulebook/` — the rules these components support.
- `card-design/` — the deck. The current primary card design (arcana + beacon)
  ships alongside the board.
- `art/energy-symbols-export/` — up-to-date SVG + PNG exports of the four
  currents and the wild, generated from `card-design/art/arcana.js`.
