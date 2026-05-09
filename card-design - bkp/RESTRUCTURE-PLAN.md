# Restructure — 2026-04-23

Single-pass restructure of the card-design folder. What shipped and what's
still on Sam.

## Goal

Make card design **iterative and orthogonal**: pick one connector × one art
variant at runtime; add new files without touching anything else; no build
step; works from `file://`.

## What shipped

- [x] `_archive/2026-04-23-pre-restructure/` — copies of the three previous
      systems (`Play Table/`, `archmage-ascension-design-system/`,
      `card-workbench/`) plus the prior one-off HTML designs.
- [x] `playtable.html` — the living viewer. Two auto-populating dropdowns,
      `?connector=`/`?art=` URL params, `?incoming=` iframe mode.
- [x] `lib/cards.js` — palette, helpers, makeCard dispatcher reading from
      `window.AA_CONNECTORS` / `window.AA_ART` registries.
- [x] `lib/tokens.css` — CSS variables for page palette, type, geometry.
- [x] `connectors/` — 5 modular files: `bloom-soft`, `parallelogram`,
      `notch`, `triangle`, `beacon`. Each self-registers.
- [x] `art/` — 8 modular files: `sigil`, `ritual`, `glyph`, `relic`,
      `emblem`, `runic`, `crystalline`, `engraved`. Each self-registers.
- [x] `art/assets/` — 4 JPEGs extracted from the canonical HTML
      (`radiance.jpg`, `void.jpg`, `flux.jpg`, `aether.jpg`).
- [x] `incoming/` — landing zone for LLM-generated HTML files, viewable via
      `playtable.html?incoming=filename.html`.
- [x] `snapshots/2026-04-23-bloom-sigil.html` — self-contained fallback
      snapshot (53 KB, all code inlined, works alone).
- [x] `export-cs3/` — CSV manifest, CS3 guide, and manifest generator
      restored from the old `card-workbench/src/exporters/`.
- [x] READMEs in the root, `connectors/`, `art/`, `incoming/`,
      `snapshots/`, `export-cs3/`.
- [x] Smoke test passed: 5 × 8 = **40 combos** render; wild card renders;
      `ArchmageCards` public API loaded.

## Still on Sam (manual steps the sandbox couldn't do)

- [ ] **Delete the old top-level folders** from Windows Explorer:
  - `card-design/archmage-ascension-design-system/`
  - `card-design/card-workbench/`
  Both are copied into `_archive/2026-04-23-pre-restructure/`, so nothing
  is lost. The Linux sandbox can't remove them because the filesystem
  returned "operation not permitted" on those folders.
- [ ] **Remove stray `test_perm_file.txt`** at the card-design root (same
      reason — permission denied from the sandbox).
- [ ] **Update the `archmage-card-designer` skill**: copy
      `SKILL-UPDATE-FOR-archmage-card-designer.md` over the top of
      `.claude/skills/archmage-card-designer/SKILL.md`, then delete the
      staging file. The skill folder is read-only from the sandbox.
- [ ] **Confirm fonts load** on first open — `playtable.html` uses Google
      Fonts. If you routinely work offline, vendor Cinzel and Cormorant
      Garamond into `lib/fonts/` and point `tokens.css` at the local paths.
- [ ] **First-run internet test**: React + Babel are loaded from unpkg.
      They cache fine after the first load but the first open of
      `playtable.html` from `file://` needs a network connection.

## How to add a new connector (worked example)

    # Copy an existing file as the template
    cp connectors/bloom-soft.js connectors/spiral.js
    # Edit the file — change AA['bloom-soft'] to AA['spiral']
    # and rewrite the body of render(val, e, opts)

    # Add ONE line to playtable.html under the Connectors block:
    #   <script src="connectors/spiral.js"></script>

    # Refresh playtable.html — 'spiral' appears as a new button.

Same shape for art variants under `art/`.

## Known imperfections

- `references/` and `incoming/` are empty. They exist for future content.
- `lib/cards.js` carries legacy shims (`ArchmageCards.ConnectorVariants` /
  `.EnergyArtVariants` getters) so any code still using the old pattern
  keeps working during the transition. These can be removed once nothing
  outside the folder depends on them.
- The snapshot builder (`/sessions/confident-loving-mccarthy/build_snapshot.py`)
  isn't inside the card-design folder. If you want it closer to the deck,
  move it to `card-design/tools/build_snapshot.py` and update its paths.

---

*Restructure completed by Claude Cowork on 2026-04-23. Built and verified in
one session; the smoke test confirmed all 40 connector × art combinations
render without error.*
