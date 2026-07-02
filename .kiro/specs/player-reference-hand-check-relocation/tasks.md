# Implementation Plan: Player Reference Hand Checker Relocation

## Overview

Relocate the self-contained "Check your hand" Hand Checker from the Quick Reference (`web-apps/player-reference/player-reference.html`) into the Full Rules (`web-apps/archmage-reference.html`) as the final block of the Spells tab, then remove it from the Quick Reference and repoint the "First game?" tip. The Full Rules side is a "port dependencies + widget" operation (CSS, markup, JS deps `ENERGIES`/`WILD`/`el()`/`miniCard()`/`RP`/`rpFor()`/`SPELL_EFFECT_SHORT` plus the `hc*` widget code) with the `ART` path adapted from `'../../art/energy-symbols-export/'` to `'../art/energy-symbols-export/'`. The Quick Reference side is a "remove the widget only, keep shared deps" operation plus a one-line tip edit.

## Tasks

- [x] 1. Port the Hand Checker into the Full Rules (`web-apps/archmage-reference.html`)
  - [x] 1.1 Port the Hand Checker CSS block into the Full Rules `<style>`
    - Copy the `/* ── Hand checker ── */` rule block verbatim from `player-reference.html` into the `archmage-reference.html` `<style>`, placed near the other spell-related rules
    - Include all `.hc*` selectors (`.hc`, `.hc-tag`, `.hc-energies`, `.hc-energy`, `.hc-values`, `.hc-value`, `.hc-wild-add`, `.hc-hint`, `.hc-hand`, `.hc-clear`, `.hc-empty`, `.hc-results`, `.hc-result*`, `.hc-note`)
    - Confirm `.chip-row` exists in Full Rules; if not, port that single `display:flex; gap; flex-wrap` rule alongside the `.hc` block
    - No token substitution or selector renaming (tokens resolve via `archmage-theme.css` `@import`)
    - _Requirements: 1.1, 2.1_

  - [x] 1.2 Port the Hand Checker markup as the final block of the Spells tab
    - Insert the `div.hc` block (with IDs `hcEnergies`, `hcEntry`, `hcHand`, `hcClear`, `hcResults`) as the last child of `<div id="spells" class="tab-content">`, after the existing "Key Spell Concepts" card
    - Copy markup verbatim, keeping `.ax-label` and `.chip-row` usages
    - Leave all existing Spells tab content and other tabs unchanged
    - _Requirements: 1.1, 1.2, 2.4_

  - [x] 1.3 Port the Hand Checker JavaScript dependencies and widget into the Full Rules `<script>`
    - Add data: `ART` set to the adapted path `'../art/energy-symbols-export/'`, plus `ENERGIES`, `WILD`, `RP`, `rpFor`, `SPELL_EFFECT_SHORT`
    - Add helpers: `el(tag, cls, html)`, `miniCard(card, opts)`
    - Add widget: `hc` state object, `hcRenderEnergies`, `hcRenderEntry`, `hcAdd`, `hcRemove`, `hcRenderHand`, the `hcClear` click listener, `hcFindSpells`, `hcRenderResults`
    - Add init calls: `hcRenderEnergies(); hcRenderEntry(); hcRenderHand();`
    - Confirm no identifier collisions with existing Full Rules script symbols (`showTab`, `getSpellReference`, `scoreCalculator`, etc.)
    - _Requirements: 1.1, 1.3, 1.4, 1.5, 2.2, 2.3_

  - [x] 1.4 Write property test for the add (component selection) behavior
    - **Property 1: Selecting a component appends it to the hand**
    - **Validates: Requirements 1.3**
    - Exercise `hcAdd` over generated prior hands and components; assert length + 1, final element equals the component, prior components unchanged; ≥100 iterations

  - [x] 1.5 Write property test for detection validity and scoring
    - **Property 2: Detected spells are valid and correctly scored**
    - **Validates: Requirements 1.4**
    - Run `hcFindSpells` over generated hands (bias toward same-energy sets, same-value sets, and consecutive runs with/without wilds); assert each result satisfies its spell-type rule and `rp` equals the RP-table value for its kind/size; ≥100 iterations

  - [x] 1.6 Write property test for the clear behavior
    - **Property 3: Clearing empties the hand**
    - **Validates: Requirements 1.5**
    - Exercise the clear operation over generated hand states; assert the hand is empty and the results view contains no spell results; ≥100 iterations

- [x] 2. Checkpoint - Full Rules port
  - Ensure all tests pass, ask the user if questions arise.

- [x] 3. Remove the Hand Checker from the Quick Reference (`web-apps/player-reference/player-reference.html`)
  - [x] 3.1 Remove the Hand Checker CSS block from the Quick Reference `<style>`
    - Delete the `/* ── Hand checker ── */` block; retain `.chip-row` if it is still used by other Quick Reference content
    - _Requirements: 3.2_

  - [x] 3.2 Remove the Hand Checker markup and JS from the Quick Reference
    - Delete the `div.hc` block from `#screen-spells`, keeping the `#spellTiles` section and the "Full rules · Spells" door intact
    - Delete the `HAND CHECKER` JS section: `hc` state, `hcRenderEnergies`, `hcRenderEntry`, `hcAdd`, `hcRemove`, `hcRenderHand`, the `hcClear` listener, `hcFindSpells`, `hcRenderResults`, and the three init calls
    - Ensure no `getElementById` call references `hcEnergies`, `hcEntry`, `hcHand`, `hcClear`, or `hcResults`
    - Retain shared deps `ENERGIES`, `WILD`, `el`, `miniCard`, `RP`, `rpFor`, `SPELL_EFFECT_SHORT`, `ART` (still used by `renderLegend`, `renderSpellTiles`, `renderRpTable`)
    - _Requirements: 3.1, 3.3, 3.4, 3.5, 3.6_

  - [x] 3.3 Repoint the "First game?" tip to the Full Rules
    - Rewrite the mid-game list item on `#screen-start` to direct readers to the Full Rules Hand Checker (e.g. link to `../archmage-reference.html#spells`)
    - Remove the reference to the Quick Reference "Spells screen" as the tool's location
    - _Requirements: 4.1, 4.2_

- [x] 4. Write equivalence property test between ported and original detection
  - **Property 4: Ported detection is equivalent to the original**
  - **Validates: Requirements 1.6**
  - Run both the Full Rules and original Quick Reference `hcFindSpells` over the same generated hands; assert identical spell sets (kinds, sizes, `uses`, effect text, RP values, ordering); ≥100 iterations
  - _Requirements: 1.6_

- [x] 5. Write structural and load-time smoke checks for both documents
  - Parse both HTML documents and assert: presence of `div.hc`, the five IDs, `.hc` CSS, and hand-checker JS symbols in Full Rules (1.1, 1.2, 2.4); absence of all of them in Quick Reference (3.1–3.4); tip wording/link (4.1, 4.2)
  - Load each document headlessly and assert no script/console errors, ported deps defined in Full Rules, Hand Checker controls render, and Quick Reference Spells screen still renders its tiles (2.1, 2.2, 2.3, 3.5, 3.6)
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 2.4, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 4.1, 4.2_

- [x] 6. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional (tests) and can be skipped for a faster MVP.
- Each task references specific requirements for traceability.
- The single most likely defect is the `ART` path: it MUST become `'../art/energy-symbols-export/'` in the Full Rules (one level up), not the Quick Reference's `'../../art/energy-symbols-export/'`.
- The port is verbatim except the `ART` path; the Quick Reference removal keeps shared deps because the legend, tiles, and RP table still use them.
- Property tests reference their design-document property numbers; the `ART`/DOM concerns are stubbed so logic runs headlessly.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "3.1"] },
    { "id": 1, "tasks": ["1.2", "3.2"] },
    { "id": 2, "tasks": ["1.3", "3.3"] },
    { "id": 3, "tasks": ["1.4", "1.5", "1.6", "4", "5"] }
  ]
}
```
