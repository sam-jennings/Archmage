# Archmage Ascension — Design System

A card game design system for **Archmage Ascension**, a spell-combining card game where players assemble spells by playing combinations of cards (same-suit consecutive runs, same-value sets, cross-suit sequences, etc).

## The product

Archmage Ascension is a physical playing card game (63 × 88 mm poker-size cards). The deck contains:

- **80 suit cards** — 4 suits (energies) × 20 values (1–20)
- **1 wild card** — "Convergence" (represents the residual power of the previous Archmage)

The four energies / suits are **Radiance** (gold), **Void** (purple), **Flux** (teal), and **Aether** (red). Each card has a distinctive edge/side connector strip that visualizes its value and lets adjacent cards show whether they "connect" when fanned.

### Pipeline

HTML renderer (design source of truth) → PNG exports → Component Studio 3 template + CSV → TTS (Tabletop Simulator) / PDF print.

## Sources this system was built from

- **Codebase (local mount):** `card-design/`
  - `card-design/CardDesign-combined.html` — LIVE working card renderer (Option D "Bloom Soft" connectors)
  - `card-design/comps/energy-symbols.html` — static reference for the 4 energy symbols + Convergence
  - `card-design/connectors/parallelogram.html` — alternative "Parallelogram Bands" connector spec (v1.2)
  - `card-design/references/design-system.md` — every CSS var + JS param explained with coupling rules
  - `card-design/references/cs3-guide.md` — Component Studio 3 import pipeline
  - `card-design/references/folder-guide.md` — file-layout + session checklist
  - `card-design/export-cs3/archmage-cards.csv` — 81-row dataset (suits + wild)

## Index — files in this system

| Path | Purpose |
|------|---------|
| `README.md` | This file — context, tone, visual foundations, iconography |
| `SKILL.md` | Agent-skill front-matter so this folder works as a Claude Code skill |
| `colors_and_type.css` | CSS custom properties for palette + typography (base + semantic) |
| `fonts/` | Webfont references (Cinzel, Cormorant Garamond — Google Fonts) |
| `assets/` | Logos, energy symbol SVG snippets, wild mark, background textures |
| `lib/cards.js` | Shared card renderer (makeCard, makeWildCard, palettes, connector variants) |
| `preview/*.html` | Design System cards — palettes, type, components, tokens |
| `ui_kits/card-game/` | The main UI kit: energy design variants, layout variants, connector variants, table-play mockup — also the source of the five exported React components below |

## Components

Five React components are exported from `ui_kits/card-game/` (each `<Name>.jsx` pairs with a `<Name>.d.ts`) and compiled onto `window.<Namespace>` — call `check_design_system` for the exact namespace. Consume them the same way any other project would, via the compiled bundle:

```html
<script src=".../_ds_bundle.js"></script>
<script type="text/babel">
  const { Card, Hand, SpellStage, Controls, PlayTable } = window.ArchmageAscensionDesignSystem_a4cf91;
</script>
```

| Component | Purpose |
|-----------|---------|
| `Card` | Thin React wrapper around `lib/cards.js` — renders one live card face (or the wild card) and re-renders on variant change. |
| `Hand` | Fanned hand of cards along the bottom edge, with hover lift and click-to-stage. |
| `SpellStage` | Center play zone where staged cards bind into a spell (consecutive-bloom fan via `ArchmageCards.buildFan`). |
| `Controls` | Right-side rail — cycles connector/energy-art variants, cast/reset actions. |
| `PlayTable` | Full scene assembly: opponent row, `SpellStage`, `Hand`, and `Controls` together — takes no props. |

`ui_kits/card-game/index.html` is the live-editable dev preview (loads the bundle and renders `<PlayTable/>`); `index.bundled-src.html` is the frozen `@dsCard`-tagged thumbnail shown in the Design System tab.

---

## CONTENT FUNDAMENTALS

### Voice & tone

The game leans **mystical / arcane / ceremonious** — a grimoire, not a tutorial. Copy reads like marginalia in an old magical text, with restraint and formality.

- **Sentence-case or Small-caps** for labels and section headings (rendered via `letter-spacing`, not ALL CAPS typed literally — `"RADIANCE"` in UI is done via styled Cinzel SMALL text with tracking).
- **Italic Cormorant** for flavor text and marginalia (e.g. *"Declare element & value when learned"*).
- **No contractions** in UI copy. ("Do not" not "Don't".)
- **No exclamation marks.** The tone is hushed, not excited.
- **No first person.** Copy addresses the player obliquely: "Declare element & value when learned" — not "You must declare…"
- **No emoji.** Ever. Symbolism is done with the energy iconography (sigils, lattices, spirals, waves, coronas).
- **Numbers are numeric** ("value 7") not spelled out.

### Naming conventions

- The four energies are **Radiance, Void, Flux, Aether** — NOT Fire/Water/Earth/Air (that was an earlier draft in `connectors/parallelogram.html`; the live design uses the evocative names).
- The wild is **Convergence** ("wild" / "star" / "★" are internal shorthand).
- Spell categories (from parallelogram.html spec): **Conjuration**, **Transfiguration**, **Enchantment**, **Perfect Transmutation**.
- Suits are now called "suits" internally (was previously "elements") — see `folder-guide.md` on the suits refactor.

### Copy examples from source

- Section label: `Four elements — value 7 shown`
- Caption: `Cold dark strips at the visible edge — no warmth between unrelated cards.`
- Caption: `Adjacent blooms overlap at the join — torchlight meeting torchlight.`
- Rules reminder on wild: `Declare element & value when learned`
- Spell flavor: `Wild fills the gap at value 5… the staircase continues through it.`

Note the use of em-dashes (not hyphens), lowercase section labels, and evocative metaphor ("torchlight meeting torchlight").

---

## VISUAL FOUNDATIONS

### Palette

Deep-black backgrounds with a single saturated hue per suit. Every suit has a **bright / mid / dim / bg1 / bg2 / border** role:

| Suit | Bright | Mid | Dim | Feel |
|------|--------|-----|-----|------|
| Radiance | `#f5c518` | `#c8961a` | `#3a2800` | Warm gold — sun, corona, torchlight |
| Void     | `#c060f0` | `#6a0dad` | `#200840` | Cool violet — starfield, ink |
| Flux     | `#00c8b4` | `#008878` | `#002820` | Cold teal — tide, signal |
| Aether   | `#e8304a` | `#c8203a` | `#400010` | Blood red — crystalline, arterial |
| Convergence (wild) | `#c8d8f8` | `#7080b8` | `#101828` | Moonstone — cool silver, clearly distinct from Radiance gold |

Page background: `#0a0810` (near-black, faintly violet).
Page text: `#d8cdb8` (warm parchment), dim text `#5a4878` (violet-gray).

Rule: `b` = bright saturated tone, `m` = `b` desaturated ~30% + darkened ~15%, `dim` = very dark hue for shadow/glow-fade. `bg1/bg2` are near-black tinted with the hue (lightness < 8%).

### Typography

- **Display / headings / pips / values:** Cinzel (Google Fonts) — Roman capitals, engraved-stone feel. Weights 400 / 600 / 700 / 900.
- **Body / flavor / marginalia:** Cormorant Garamond — italics used heavily for captions and rules text. Weights 300 / 400 / 600 / 700 + italic 400.
- **Headings style:** Cinzel with heavy tracking (`letter-spacing: 0.12em–0.35em`), uppercase via text-transform, very small sizes (9–13px) for section labels — a deliberate "engraved plaque" mannerism.
- **No sans-serif anywhere.** No Inter, no system-ui.
- **Value number (pip)**: Cinzel 700, fill = suit bright, with drop-shadow filter.
- Cormorant at small sizes works, but use Cinzel for anything below ~10px.

### Backgrounds

Always **deep black tinted with the suit hue**. Layered via:
1. Linear gradient `bg2 → bg1` (top → bottom, both near-black, lightness <8%)
2. Radial gradient at ~(50%, 48%), mid-hue at 10% opacity fading to transparent — gives a soft "glow from center"
3. Never pure solid color. Never pure white. Never aggressive purple/blue gradients.

### Borders

Dual-border treatment on every card:
- Outer: suit-mid at 42% opacity, 1px, inset 2px
- Inner: suit-mid at 18% opacity, 0.6px, inset 5px

The double ring reads as "hand-illuminated manuscript page" rather than "web card".

### Corner radii

- Cards: **12 px** at 1× scale (3% of card width). Crisp but not pill-like.
- Buttons / chips (in UI): **4–6 px**. Small, architectural.
- Never fully rounded (`9999px`) — pills are too modern.

### Tick marks

Along both long edges of every card: 21 tick marks (values 0–20). Major ticks every 5 (wider + more opaque); minors between. Tick color = suit-mid at 10–22% opacity. These are **functional** (players can count) AND textural.

### Connector / side-strip system

The most distinctive element. When cards are fanned (36 px overlap visible on each edge), the strip communicates the card's value and whether it "connects" to its neighbor. Two variants exist:

1. **Bloom Soft (Option D, LIVE)** — a soft radial glow centered at `Y = TM + val*ST` with opacity envelope. Plus a thin whisker parallelogram tracing the exact tick. Reads like "torchlight through a crack."
2. **Parallelogram Bands (v1.2)** — sharp parallelogram band at `Y = TM + (val±1)*ST` with a vertical gradient peaking at the center line. Wild card = all 20 stacked in gold. Reads like "glowing ladder."

### Cards played together (fan semantics)

- **Same value** across any suit → horizontal bright line aligns at identical Y.
- **Consecutive values** (e.g. 7, 8, 9) → blooms overlap / parallelograms touch at the join.
- **Non-consecutive** → cold dark strip between, no overlap.
- **Wild** → universal connector; matches any Y.

### Animation, hover, press

The source HTML is a static rendering tool — no animations. For UI surfaces built on this system:
- **Hover:** raise the suit-mid border opacity 42% → 65%; add a subtle glow (`box-shadow: 0 0 24px {suit-bright}/20`).
- **Press:** scale 0.98, shadow compresses.
- **Transitions:** 180ms ease-out for micro-interactions, 320ms for card flips.
- **Bounces:** none. The tone is ceremonious, not playful.

### Imagery / illustration approach

All card art is **vector SVG drawn in HTML** — concentric rings (Radiance), starfield + spirals (Void), standing waves (Flux), lattice-with-nodes (Aether). No photography, no painted art, no bitmap. Monochromatic-per-suit: every stroke uses the suit's bright/mid/dim tones plus pure black.

### Use of transparency and blur

Heavy use of **fill-opacity** (`.18`, `.35`, `.65`, `.88`) for layered glows. **No backdrop-filter / blur** — the texture comes from layered SVG, not CSS filters.

### Shadows

Drop shadows only on text (pips, values) via SVG `<feDropShadow dx=0 dy=1 stdDeviation=2.5 flood-color=#000 flood-opacity=.85>`. Inset shadows are unused. Elevation is conveyed by the double border + radial glow, not Material-style box-shadow stacks.

### Layout rules

- Every card follows the same grid: pip top-left inside the 36 px strip; inverted pip bottom-right (rotated 180°); centered medallion at 48% height containing the value; energy motif fills the medallion.
- The 36 px overlap strip is sacrosanct — all edge-connector, pip, and suit info must fit inside it. Never let art cross the strip boundary.
- Horizontal symmetry: left and right strips mirror each other.

### Avoid

- Rounded pill chips with left-border accent color
- Purple-to-blue SaaS gradients (the gradients here are black-to-near-black)
- Emoji
- Sans-serif type
- Pure white (`#fff`) — always warm off-white `#d8cdb8` or cooler `#c8b8e8`
- Fire/Water/Earth/Air naming (deprecated — use Radiance/Void/Flux/Aether)

---

## ICONOGRAPHY

The system has **no general-purpose icon set** (no Lucide / Heroicons / material-icons). All iconography is **bespoke SVG** drawn directly into the card art, and the vocabulary is restricted to:

1. **The four energy sigils** — concentric rings (Radiance), ringed starfield (Void), wave stack (Flux), lattice-with-nodes (Aether). These are the *only* icons in the product's core vocabulary. Always drawn at the suit's palette.
2. **The Convergence mark** — a 4-pointed kite-star whose arms each carry one suit's bright color. Used as the wild-card pip and corner mark.
3. **Value numerals** — Cinzel bold digits in the suit bright color, double-shadowed.
4. **The wild star pip** — a small 4-pointed SVG star (`wildPipStar()` in `CardDesign-combined.html`).
5. **Tick marks** — minor + major stroke lines along the card edges.

### Emoji? Unicode?

**Never emoji.** The parallelogram-bands v1.2 spec briefly used Unicode alchemical symbols (🜂🜄🜃🜁) for elemental shorthand but they were replaced in the live design by the bespoke SVG sigils. **Never use alchemical Unicode in UI copy** — they render inconsistently and break the hand-illuminated look.

### Asset locations

All energy art is inline SVG inside the renderer scripts (`lib/cards.js` in this system, sourced from `CardDesign-combined.html`). Individual symbol "sprites" are in `assets/symbols/` as static SVG for use outside the card context (e.g. UI chrome, marketing).

If a generic icon is *required* (export, settings, menu), substitute **Lucide icons** (CDN) at 1.5 px stroke, restyled to match the suit-mid color of the surrounding surface. Flag substitutions. No icon font is shipped.

---

## CAVEATS

- **Fonts** — Cinzel + Cormorant Garamond are loaded from Google Fonts; no local TTFs are included. If offline use is required, download from Google Fonts and place in `fonts/`.
- **Energy symbol SVGs** in `assets/symbols/` are extracted copies; the authoritative source remains `lib/cards.js`.
- The live design is Option D (Bloom). The Parallelogram variant is preserved in `ui_kits/card-game/` as a side-by-side comparison.
