# card-design

Self-contained Archmage Ascension card designer. **No build step. No server.**
Double-click `playtable.html` in File Explorer and it runs.

## Primary design — decided 2026-07-02

The primary card design is **arcana art + beacon connector**. That combination
is what ships to print and what the renderer defaults to. Everything else that
lived in `art/` and `connectors/` (sigil, ritual, glyph, relic, emblem, runic,
crystalline, engraved, mixed, echo, bloom-soft, parallelogram, notch, triangle)
has been archived to `_archive/card-design-non-primary-2026-07-02/`. The
registries (`window.AA_ART` / `window.AA_CONNECTORS`) still exist so the
architecture remains open for future exploration, but the deck is no longer
being iterated as a matrix of variants.

If you need to look at an old variant, restore the file from `_archive/` and
add its `<script>` tag back into `playtable.html`.

## Folder map

    card-design/
      playtable.html          ← main viewer. Open me first.
      playtable-mobile.html   ← mobile portrait reflow of the same viewer.
      VISUAL_SYSTEM.md        ← the visual design system (single source of truth).
      lib/
        cards.js              ← palette + helpers + makeCard dispatcher
        tokens.css            ← design tokens (CSS variables)
      connectors/
        beacon.js             ← the primary connector. Round glowing orb at value Y.
      art/
        arcana.js             ← the primary art. Procedural per-suit ritual diagrams.
                                Renders all five currents (radiance/void/flux/aether/echo)
                                and the wild card. No bitmap assets required.
      export-cs3/             ← Component Studio export (node project, defaults to beacon + arcana).
      export-printenbind/     ← print-ready output (final bundles only; per-card PDFs gitignored).
      printenbind/            ← printenbind session working files.
      generated/              ← generated review/style/production boards + their uploaded PNGs.
      incoming/               ← landing zone for standalone LLM-generated HTML files.
      snapshots/              ← dated one-file snapshots (frozen history).

## How a card is drawn

The renderer picks a connector and an art variant from their registries and
composes a single SVG. With the primary decision made, both dimensions default
to the same choice everywhere:

| Dimension    | Registry                | Default    | File                     |
|--------------|-------------------------|------------|--------------------------|
| **Connector**| `window.AA_CONNECTORS`  | `beacon`   | `connectors/beacon.js`   |
| **Art**      | `window.AA_ART`         | `arcana`   | `art/arcana.js`          |

`playtable.html` still exposes dropdowns for both dimensions so a future
variant can be dropped in and previewed without a code change.

## Linking a specific combo

    playtable.html?connector=beacon&art=arcana

URL params are read on first paint and updated whenever you click a button, so
current combos are always shareable / bookmarkable.

## Opening a one-off design from Claude/ChatGPT

1. Save the HTML they gave you into `incoming/whatever.html`.
2. Open `playtable.html?incoming=whatever.html` — it opens that file in an iframe
   with a "back to play table" link.

## Adding a new connector or art variant

If you want to explore a new visual direction:

1. Copy `connectors/beacon.js` (or `art/arcana.js`) as a template.
2. Change the registry key (`AA['your-name']`).
3. Edit the render body.
4. Add a `<script src="connectors/your-name.js"></script>` tag to `playtable.html`.

The dropdown updates automatically. If it earns its place, promote it here in
the README and archive the previous primary.

## Canonical vs snapshot

- `playtable.html` is the **living** viewer.
- `snapshots/` holds **frozen** single-file HTMLs from moments worth keeping
  (e.g. the version that was sent to print).

## Archive

See `_archive/card-design-non-primary-2026-07-02/` for the full set of art
variants and connectors that were in play before arcana + beacon was chosen.
See `_archive/card-design - bkp/` for the older hand-made backup of the entire
folder from the pre-restructure era.
