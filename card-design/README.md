# card-design

Self-contained Archmage Ascension card designer. **No build step. No server.**
Double-click `playtable.html` in File Explorer and it runs.

## Folder map

    card-design/
      playtable.html          ← main viewer. Open me first.
      lib/
        cards.js              ← palette + helpers + makeCard dispatcher
        tokens.css            ← design tokens (CSS variables)
      connectors/             ← ONE strip style per file. Self-register into window.AA_CONNECTORS.
        bloom-soft.js
        parallelogram.js
        notch.js
        triangle.js
        beacon.js
      art/                    ← ONE energy-art style per file. Self-register into window.AA_ART.
        sigil.js
        ritual.js
        glyph.js
        relic.js
        emblem.js
        runic.js
        crystalline.js
        engraved.js
        assets/               ← image files used by art/relic.js
      incoming/               ← drop standalone HTML files here from Claude/ChatGPT/etc.
      snapshots/              ← frozen one-file versions of specific connector+art combos.
      export-cs3/             ← CS3 export manifest + guide for the physical card run.
      references/             ← reference material that doesn't belong elsewhere.
      _archive/               ← old stuff. Safe to delete from Windows Explorer.

## How a card is drawn

Two dimensions, combined independently:

| Dimension    | Folder        | Registry              | Default      |
|--------------|---------------|-----------------------|--------------|
| **Connector** (the edge strip where cards bloom into each other) | `connectors/` | `window.AA_CONNECTORS` | `bloom-soft` |
| **Art** (the suit artwork filling the centre of the card)        | `art/`        | `window.AA_ART`        | `sigil`      |

`playtable.html` builds its two dropdowns by reading the keys of those registries at
page load, so you never have to hand-edit a list of options: if you add a new file
and a new `<script>` tag, it shows up automatically.

## Linking a specific combo

    playtable.html?connector=beacon&art=glyph

URL params are read on first paint and updated whenever you click a button, so
current combos are always shareable / bookmarkable.

## Opening a one-off design from Claude/ChatGPT

1. Save the HTML they gave you into `incoming/whatever.html`.
2. Open `playtable.html?incoming=whatever.html` — it opens that file in an iframe
   with a "back to play table" link, no need to fiddle with Windows file
   associations.

## Adding a new connector

1. Copy `connectors/bloom-soft.js` to `connectors/my-new-strip.js`.
2. Change `AA['bloom-soft']` to `AA['my-new-strip']`.
3. Edit the body of `render(val, e, opts)` — it returns an SVG string.
4. Add `<script src="connectors/my-new-strip.js"></script>` to `playtable.html`
   (in the Connectors block).
5. Refresh. The dropdown now has a `my-new-strip` button.

## Adding a new art variant

Same pattern in `art/`, registering into `AA_ART`:

    (function(){
      const AA = window.AA_ART = window.AA_ART || {};
      AA['moonwell'] = {
        name: 'Moonwell',
        notes: 'Concentric water rings per suit.',
        render: function(elem, cx, cy, artR, e, meta){
          // return an SVG string here
          return '';
        }
      };
    })();

Add the `<script src="art/moonwell.js">` tag; done.

## Canonical vs snapshot

- `playtable.html` is the **living** viewer. Edit freely, break things, iterate.
- `snapshots/` holds **frozen** single-file HTMLs for moments you want to keep
  working even if the live system is mid-refactor (e.g. the version you sent to
  print).

## Why this shape

The previous layout had three overlapping systems (`Play Table/`,
`archmage-ascension-design-system/`, `card-workbench/`) with duplicated copies of
everything. Connectors and art variants were baked together into monolithic
HTMLs, which made it impossible to mix and match. This version:

- keeps connector and art as **orthogonal dimensions** (two folders, two
  registries, two dropdowns) so any combo is one click away;
- uses **plain `<script>` tags**, no bundler, no npm, no Vite;
- stays editable from any LLM that can spit out a single HTML file
  (`incoming/`).

See `_archive/2026-04-23-pre-restructure/` for everything that was here before —
it's copies of the old top-level folders and can be removed from Windows
Explorer any time you're confident you don't need it.
