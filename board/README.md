# board/

Physical game components — the printable artefacts that live on the table
during play.

Promoted to a top-level folder on 2026-07-02 because the board directly
affects the rules and is referenced by the rulebook; it was previously
tucked inside `art/ref cards + board/` and hard to find.

## Contents

- **`archmage_a3_landscape_board.pdf`** — the main game board.
  A3 landscape orientation.
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
