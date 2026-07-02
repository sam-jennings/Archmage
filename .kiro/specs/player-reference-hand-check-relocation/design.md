# Design Document

## Overview

This design relocates the interactive "Check your hand" Hand Checker from the Quick Reference (`web-apps/player-reference/player-reference.html`) into the Full Rules (`web-apps/archmage-reference.html`), appending it as the final content block of the existing Spells tab, and removes it entirely from the Quick Reference. The Quick Reference's "First game?" tip is repointed to the Full Rules.

The Hand Checker is a self-contained, client-side widget: markup (`div.hc` with element IDs `hcEnergies`, `hcEntry`, `hcHand`, `hcClear`, `hcResults`), a CSS block (the `/* ── Hand checker ── */` rules), and a JavaScript section (state object `hc`, render functions, and the `hcFindSpells` detection algorithm). The core challenge is not the widget itself — which is copied verbatim — but adapting it to the Full Rules document, which has a **different DOM shell, a different script, and no copy of the Hand Checker's JS dependencies**. Those dependencies must be ported alongside the widget.

Both documents already share the same visual token system: `archmage-reference.html` links `archmage-theme.css`, which `@import`s `archmage-tokens.css`, the same token file the Quick Reference links directly. This means the `.hc` CSS and the shared `.ax-mini-card` primitive resolve identically in both documents with no token remapping required.

### Goals

- Full Rules gains a fully functional Hand Checker identical in behavior to the current Quick Reference tool.
- Quick Reference no longer contains any Hand Checker markup, CSS, JS, or element-ID references.
- The "First game?" tip directs readers to the Full Rules for the tool.
- No other content in either document changes.

### Non-Goals

- No change to the Hand Checker's detection logic, layout, or copy.
- No change to the four spell-type explanatory cards already present in the Full Rules Spells tab (the Hand Checker is *added* alongside them, not merged with them).
- No shared/extracted module: the dependencies are ported inline, matching each document's existing self-contained pattern.

## Dependency Analysis (source vs. destination)

The following was confirmed by reading both files and `archmage-theme.css`.

| Dependency | In Quick Reference (source) | Already in Full Rules (dest)? | Action |
|---|---|---|---|
| `--ax-*` design tokens | via `../archmage-tokens.css` | Yes — via `archmage-theme.css` `@import url('archmage-tokens.css')` | Reuse, no port |
| `.ax-mini-card` / `.ax-mini-symbol` / `.ax-mini-value` primitive | via tokens css | Yes — used by existing spell examples | Reuse, no port |
| `.hc*` CSS block | inline `<style>` | **No** | **Port** into Full Rules `<style>` |
| `ART` base path constant | `'../../art/energy-symbols-export/'` (2 levels up) | **No** | **Port with adapted path** `'../art/energy-symbols-export/'` (1 level up) |
| `ENERGIES` object | inline JS | **No** | **Port** |
| `WILD` object | inline JS | **No** | **Port** |
| `el(tag, cls, html)` helper | inline JS | **No** | **Port** |
| `miniCard(card, opts)` helper | inline JS | **No** | **Port** |
| `RP` table + `rpFor(kind, size)` | inline JS | **No** | **Port** |
| `SPELL_EFFECT_SHORT` map | inline JS | **No** | **Port** |
| Hand Checker section (`hc` state, `hcRender*`, `hcAdd/Remove`, `hcFindSpells`, `hcRenderResults`) | inline JS | **No** | **Port** |
| Tab system | `.screen` / `.tab` sticky bottom bar | Different: `.tab-content` with `showTab()` | No change; widget lives inside `#spells` which `showTab` toggles |

**Critical adaptation — the art path.** The Quick Reference lives at `web-apps/player-reference/player-reference.html`, so it reaches the art directory with `'../../art/energy-symbols-export/'`. The Full Rules lives at `web-apps/archmage-reference.html`, one directory shallower, and its existing spell examples already reference `'../art/energy-symbols-export/…'`. The ported `ART` constant must therefore be `'../art/energy-symbols-export/'`. Getting this wrong is the single most likely defect: symbols would 404 while the widget otherwise "works."

**Dependency scoping note.** The Full Rules script is a single top-level `<script>` (non-module, non-IIFE at the outer level). Ported symbols (`ENERGIES`, `WILD`, `el`, `miniCard`, `RP`, `rpFor`, `SPELL_EFFECT_SHORT`, `hc`, and the `hc*` functions) must be introduced without colliding with existing identifiers in that script. Confirmed: none of these names exist in the Full Rules script today (it uses `showTab`, `getSpellReference`, `scoreCalculator`, etc.), so the port is collision-free. The ported dependencies are added once, shared by the widget.

## Architecture

```
archmage-reference.html
├── <head><style>
│     … existing rules …
│     /* ── Hand checker (ported) ── */   ← NEW CSS block
│
├── <body>
│   └── #spells .tab-content
│         ├── existing spell-type cards (UNCHANGED)
│         └── div.hc  (hcEnergies / hcEntry / hcHand / hcClear / hcResults)  ← NEW markup, final block
│
└── <script>
      // ── Ported Hand Checker dependencies + widget ──   ← NEW JS
      const ART = '../art/energy-symbols-export/';   // adapted path
      const ENERGIES = {…}; const WILD = {…};
      const RP = {…}; function rpFor(){…}
      const SPELL_EFFECT_SHORT = {…};
      function el(){…} function miniCard(){…}
      const hc = { hand: [], energy: 'radiance' };
      function hcRenderEnergies(){…} … function hcRenderResults(){…}
      hcRenderEnergies(); hcRenderEntry(); hcRenderHand();   // init
      // … existing showTab / scoreCalculator code (UNCHANGED) …
```

```
player-reference.html  (removals only)
├── <style>  — DELETE the /* ── Hand checker ── */ block
├── #screen-spells — DELETE the div.hc block (keep spellTiles + door)
├── <script> — DELETE the HAND CHECKER section (hc state + hc* fns + init calls + hcClear listener)
├── retained shared deps (ENERGIES, WILD, el, miniCard, RP, SPELL_EFFECT_SHORT) — KEEP (still used by legend, spell tiles, RP table)
└── #screen-start "First game?" tip — EDIT the mid-game list item
```

Note the asymmetry: in the Quick Reference the shared dependencies (`ENERGIES`, `el`, `miniCard`, `RP`, `SPELL_EFFECT_SHORT`) are **retained** because the energy legend, spell tiles, and RP table still use them. Only the Hand-Checker-specific code is removed. In the Full Rules those same dependencies do not yet exist, so they are **added**. This is why the operation is "port dependencies" on one side and "remove only the widget" on the other.

## Components and Interfaces

### Component 1: Full Rules CSS block (ported)

The complete `/* ── Hand checker ── */` rule block is copied verbatim into the `archmage-reference.html` `<style>` element. All selectors (`.hc`, `.hc-tag`, `.hc-energies`, `.hc-energy`, `.hc-values`, `.hc-value`, `.hc-wild-add`, `.hc-hint`, `.hc-hand`, `.hc-clear`, `.hc-empty`, `.hc-results`, `.hc-result*`, `.hc-note`) reference only `--ax-*` tokens and the shared `.ax-mini-card` primitive, all of which resolve in the Full Rules via the theme's token import. No selector renaming or token substitution is required. Placement within the existing `<style>` (near the other spell-related rules) keeps the file organized.

### Component 2: Full Rules markup (ported, final block of Spells tab)

The `div.hc` block is inserted as the last child of `<div id="spells" class="tab-content">`, immediately before that div's closing tag, after the existing "Key Spell Concepts" card. Markup is copied verbatim:

```html
<div class="hc">
  <span class="ax-label" style="color: var(--ax-gold);">Check your hand</span>
  <p class="hc-tag">Tap in the components you're holding and see every spell they can form.</p>
  <div class="hc-energies" id="hcEnergies"></div>
  <div id="hcEntry"></div>
  <div class="hc-hand">
    <div class="hc-hand-head">
      <span class="ax-label" style="margin: 0;">Your components</span>
      <button class="hc-clear" id="hcClear" hidden>Clear all</button>
    </div>
    <div class="chip-row" id="hcHand"><span class="hc-empty">Nothing yet — pick an energy, then a value.</span></div>
  </div>
  <div class="hc-results" id="hcResults" hidden></div>
</div>
```

The five element IDs (`hcEnergies`, `hcEntry`, `hcHand`, `hcClear`, `hcResults`) are unique in the Full Rules document (they do not currently appear there), so no ID collision occurs. `.ax-label` and `.chip-row` are used; `.ax-label` is a shared token-css class and `.chip-row` must be confirmed available — it is defined in the Quick Reference `<style>` only, so if the Full Rules does not already define `.chip-row`, that single rule is ported alongside the `.hc` block (it is a trivial `display:flex; gap; flex-wrap` rule). This is the one non-`hc`-prefixed selector the widget's markup and result rendering depend on.

### Component 3: Full Rules JavaScript (ported dependencies + widget)

Ported verbatim except the `ART` path, added inside the existing top-level `<script>`:

- **Data**: `ART` (adapted to `'../art/energy-symbols-export/'`), `ENERGIES`, `WILD`, `RP`, `rpFor`, `SPELL_EFFECT_SHORT`.
- **Helpers**: `el(tag, cls, html)`, `miniCard(card, opts)`.
- **Widget**: `hc` state object, `hcRenderEnergies`, `hcRenderEntry`, `hcAdd`, `hcRemove`, `hcRenderHand`, the `hcClear` click listener, `hcFindSpells`, `hcRenderResults`.
- **Initialization**: `hcRenderEnergies(); hcRenderEntry(); hcRenderHand();`

Interfaces (unchanged from source):

```text
hcAdd(card: {e: EnergyKey|'wild', v: number|null}) -> void   // appends to hc.hand, re-renders
hcRemove(index: number) -> void                               // removes one component, re-renders
hcFindSpells() -> Array<{ kind, name, size, uses, effect, rp }> // detection over hc.hand
```

Because init runs at script execution time and the `#spells` markup is present in the initial HTML (tabs are toggled via CSS `.active`, not created dynamically), `document.getElementById('hcEnergies'|'hcEntry'|'hcHand'|'hcClear'|'hcResults')` all resolve at load. The widget renders into a hidden tab and is revealed unchanged when `showTab('spells')` runs — no integration with `showTab` is needed.

### Component 4: Quick Reference removals

- Delete the `/* ── Hand checker ── */` CSS block from `<style>`.
- Delete the `div.hc` block from `#screen-spells`, leaving the `#spellTiles` section and the "Full rules · Spells" door intact.
- Delete the `HAND CHECKER` JS section: the `hc` state object, `hcRenderEnergies`, `hcRenderEntry`, `hcAdd`, `hcRemove`, `hcRenderHand`, the `document.getElementById('hcClear')` listener, `hcFindSpells`, `hcRenderResults`, and the three init calls (`hcRenderEnergies(); hcRenderEntry(); hcRenderHand();`).
- **Retain** `ENERGIES`, `WILD`, `el`, `miniCard`, `RP`, `rpFor`, `SPELL_EFFECT_SHORT`, and `ART` — they remain in use by `renderLegend`, `renderSpellTiles`, and `renderRpTable`. Removing them would break the surviving Spells screen (violating 3.5/3.6).
- After removal, no `getElementById` call references any of the five deleted IDs, so the Spells screen initializes without error.

### Component 5: Quick Reference "First game?" tip edit

The mid-game list item currently reads:

```html
<li>Mid-game questions: use <b>Check your hand</b> on the Spells screen.</li>
```

It is rewritten to point at the Full Rules Hand Checker and to drop the Quick Reference "Spells screen" location, e.g.:

```html
<li>Mid-game questions: use <b>Check your hand</b> in the <a href="../archmage-reference.html#spells">full rules</a>.</li>
```

This satisfies both 4.1 (directs to Full Rules) and 4.2 (no longer names the Quick Reference Spells screen as the location).

## Data Models

The ported data models are unchanged from the source. Summarized for reference:

```text
EnergyKey       = 'radiance' | 'void' | 'flux' | 'aether'
Energy          = { name, tone, bg1, bg2, symbol, blurb }
WILD            = { name, tone, bg1, bg2, symbol, blurb }
Card            = { e: EnergyKey | 'wild', v: number | null }   // v is null for wilds
Hand            = Card[]                                         // hc.hand
RP              = { conjuration|transfiguration|perfect|enchantment : { size:number -> points:number } }
SpellResult     = { kind, name, size:number, uses:Card[], effect:string, rp:number }
```

Detection semantics (preserved verbatim):
- **Conjuration**: per energy, that energy's cards + all wilds, size ≥ 3.
- **Enchantment**: per value, matching cards + wilds, capped at size 4, size ≥ 3.
- **Transfiguration**: best value run across any energies, wilds fill gaps, must use ≥ 1 real card.
- **Perfect Transmutation**: best value run within a single energy.
- Results sorted by RP descending; results view shows top 6, up to 8 chips per result.

## Error Handling

- **Missing DOM node**: init functions call `getElementById` for the five IDs. Since the markup is static and present at load, these resolve; the design keeps the markup in the initial HTML rather than injecting it, avoiding null-node errors. (Validates 2.3.)
- **Broken symbol art**: mitigated by the adapted `ART` path. `<img>` `alt` text is set by `miniCard`, so a missing file degrades to alt text rather than a script error.
- **Fewer than 3 components**: `hcRenderResults` shows guidance text and keeps `hcResults` hidden/empty; no spell computation runs. (Preserved from source.)
- **No valid spell**: `hcFindSpells` returns `[]`; `hcRenderResults` shows the "don't form a valid spell yet" message. (Preserved.)
- **Quick Reference post-removal**: no orphaned `getElementById` calls remain, so the Spells screen script runs cleanly. (Validates 3.5.)

## Testing Strategy

Because this is a relocation of a self-contained widget plus targeted edits to two static HTML documents, most acceptance criteria are verified by structural presence/absence checks (EXAMPLE) and load-time smoke checks (SMOKE). The genuinely input-varying logic is the spell-detection algorithm and the two hand state transitions, which are covered by the correctness properties below.

**Structural / EXAMPLE checks** (presence in Full Rules 1.1, 1.2, 2.4; absence in Quick Reference 3.1–3.4, 3.6; tip content 4.1, 4.2): parse each HTML document and assert the presence/absence of the `div.hc` root, the five element IDs, the `.hc` CSS rules, the hand-checker JS symbols, and the tip wording/link. Diff surrounding content to confirm nothing else changed.

**Load-time / SMOKE checks** (2.1, 2.2, 2.3, 3.5): load each document in a headless browser (or jsdom) and assert no script/console errors, that the ported dependency symbols are defined in the Full Rules, that referenced `--ax-*` tokens resolve, and that the Hand Checker controls render in the Full Rules while the Quick Reference Spells screen still renders its tiles.

**Property tests** (1.3, 1.4, 1.5, 1.6): exercise the ported detection and state functions over many generated hands. Minimum 100 iterations per property. The `ART`/DOM concerns are stubbed so the logic can be tested headlessly; each property test references its design-document property number.

Generators:
- `genCard`: energy ∈ {radiance, void, flux, aether, wild}; value ∈ 1–20 for real energies, null for wild.
- `genHand`: 0–12 cards from `genCard`, plus targeted generators that bias toward same-energy sets, same-value sets, and consecutive-value runs (with and without wilds) to stress each spell type and the run/gap logic.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Selecting a component appends it to the hand

*For any* prior hand state and *any* component `{e, v}` produced by choosing an energy (including wild) and a value, invoking the add operation results in a hand whose length increased by exactly one and whose final element equals that component, leaving all prior components unchanged.

**Validates: Requirements 1.3**

### Property 2: Detected spells are valid and correctly scored

*For any* generated hand, every spell returned by the detection algorithm satisfies its spell type's requirement given the hand's components with wilds substituting for any energy/value (Conjuration: ≥3 same-energy incl. wilds with ≥1 real card of that energy; Enchantment: 3–4 same-value incl. wilds; Transfiguration: a consecutive value run of size ≥3 using ≥1 real card; Perfect Transmutation: a consecutive value run within a single energy), and each result's `rp` equals the RP-table value for its kind and size.

**Validates: Requirements 1.4**

### Property 3: Clearing empties the hand

*For any* hand state, invoking the clear operation results in an empty hand and a results view containing no spell results.

**Validates: Requirements 1.5**

### Property 4: Ported detection is equivalent to the original

*For any* generated hand, the ported Full Rules detection algorithm produces output equal to the original Quick Reference algorithm's output — the same set of spells with identical kinds, sizes, `uses` compositions, effect text, RP values, and ordering.

**Validates: Requirements 1.6**
