# Coherence Report — Unifying the Player-Facing System

**Date:** 2026-07-02
**Scope:** the physical-table experience — board (immutable anchor), landing page, Online Rules, Quick Reference Card. The parked interactive game app was not touched.

---

## What changed

### 1. One visual language — `web-apps/archmage-tokens.css` (new)

A single token set now defines the entire visual language: the board's night-violet field, engraved gold, hairline rules, the Cinzel/Cormorant Garamond pairing, tracking, spacing, radii, motion, and the five energy palettes taken from the live card renderer. It also carries shared primitives used identically everywhere: the `.ax-topbar` way-back header, `.ax-symbol` sizing for the canonical energy art, and `.ax-mini-card` — the one mini component-card design used for every example card and hand-checker chip.

All three surfaces import it: the landing and Online Rules through `archmage-theme.css` (whose palette now only aliases the tokens), the Quick Reference Card directly. `colors_and_type.css` is no longer referenced by any in-scope surface.

### 2. Quick Reference Card — rebuilt as the centrepiece

`web-apps/player-reference/player-reference.html` was a desktop mock-up of a phone (React + Babel from CDN, fixed 392×760 frame, sample-hand-only checker). It is now a real phone-first app: plain HTML/JS with no framework, filling the viewport, bottom tab bar in thumb reach, 44px+ tap targets, reduced-motion respected.

- **Four screens:** Start · Spells · Your Turn · Scoring — enough to play a whole game from the phone.
- **Board echo:** Start carries the board's Set-up list and Key Reminders verbatim; Your Turn is a Normal Turn / Drought Turn toggle using the board's own step wording; Scoring reproduces the board's Recognition Points table (sizes 3–15, same column order) and tiebreaker line.
- **The star feature — Check your hand:** tap in any components you hold (energy + value, wilds included) and every valid spell they can form is listed with the exact cards used, its cast effect, and its Recognition Points — wild-aware for all four spell types.
- **Progressive disclosure:** spell types, capacity rules, and the first-game path are collapsed tiles; each screen ends with one "Full rules →" door deep-linked into the matching Online Rules section.
- The little Recall counter demo survived the rebuild — it earns its place.

### 3. Online Rules — `web-apps/archmage-reference.html`

- **Retitled** from "Quick Reference" (which collided with the card) to **Online Rules · The Full Reference**.
- **Tabs renamed and reordered to the board's sections:** Set-up · Spells · Normal Turn · Drought Turn · Recognition Points · Ascension Trials, with hash deep links (`#set-up`, `#spells`, `#normal-turn`, `#drought-turn`, `#recognition-points`, `#ascension-trials`) that the card's doors target.
- **Vocabulary purged** (see glossary below): Vault → Source, Exchange → Array, Used Components → Arcane Reserve, Wild Magic Surge → Drought / Released Reserve, Initial Sacrifice → the Opening, elements/suits → the four energies.
- **Correct symbols:** the card-suit legend and CSS-drawn mini-card glyphs are gone; every symbol is now the canonical `art/energy-symbols-export/` art via the shared mini-card primitive.
- **Structure:** turn-sequence and learning-phase content moved out of the Spells tab into Normal Turn (one home per rule, no drift-prone duplication); a Key Reminders card mirrors the board in Set-up.
- **Navigation:** shared top bar (brand → home, link → Quick Reference Card) and a footer pointing back down the tiers.
- Score calculator and Trials export kept working (energy options now read from the new markup; export payload keeps legacy keys for the Trials importer but contains only energy names).

### 4. Landing page — `index.html`

Restructured around the three-tier reading model with a one-line "when to use which" on every card: **At the Table** (The Board — A3 print file · Quick Reference Card — "on your phone, mid-turn", now the primary card · Online Rules — "first game, settling disputes"), then **Tools** (Trials companion, Spellbook Optimizer), then **More** (Interactive Game clearly marked as a separate preview, Pitch Sheet). Header now shows the five canonical symbols and corrects the tagline (the old one said "two practitioners"; the game seats 2–7).

### 5. Symbol hygiene

The copies in `web-apps/player-reference/art/energy-symbols-export/` had drifted from the canonical exports. All surfaces now reference `art/energy-symbols-export/symbol_*.svg` directly (one source, no copies to drift); the stale copies were refreshed to canonical content anyway as a belt-and-braces measure.

---

## Enforced vocabulary

| Canonical term | Replaces (found in the wild) |
|---|---|
| the Source | The Vault, draw pile |
| the Array | The Exchange, market |
| Arcane Reserve | Used Components, discard pile |
| the Drought | Wild Magic (phase), The Long Dimming |
| Released Reserve | Wild Magic Surge (pile) |
| the Opening | Initial Sacrifice |
| Radiance / Void / Flux / Aether — **energies** | elements; Spades / Hearts / Diamonds / Clubs |
| wild card (substitutes for any energy and value) | fifth energy, "Convergence" |
| Component | card (kept only in physical set-up counts) |
| Counter / Capacity, Unlimited Capacity marker | action token |
| Recall | (unnamed counter-retrieval step) |
| Learn / Empower / Reshape / Unlearn | — |
| Recognition Points | points |
| Spellbook, Casting Phase, Collection Phase, Learning Phase | — |

"Convergence" and suit language now appear nowhere player-facing. (`spellbook-optimizer.html` still uses "suit" internally in its input shorthand — it's a Tools-tier analysis page, out of the three unified surfaces, but worth a pass someday.)

---

## Contradictions found against the canonical rulebook

Fixed on the digital surfaces:

1. **Drought casting** — the old Wild Magic tab said you could *still place counters on spells during the end phase* ("cast spells … if you wish, but only Enchantments provide benefits"). The rulebook and board are unambiguous: **no Casting Phase exists during the Drought**. Rewritten.
2. **Endgame framing** — the old page called Standard Evaluation "a faster, less competitive method … for casual play" and the Ascension Trial the "Recommended End Game Method". The rulebook makes Standard Evaluation the default and the Trials an advanced variant. Reframed on both the Recognition Points and Ascension Trials tabs.
3. **Recognition Points table** stopped at size 12; the board and Scoring System Reference run to 15. Extended, and column order now matches the board (Conj. · Transfig. · Perfect · Enchant.).
4. **Broken links** — two links pointed at `trials.html`, which doesn't exist; now `trials-multiplayer.html`.
5. **Wild rule embellishment** — the old card said a wild is "declared the moment it is learned"; the rulebook says only that wilds substitute for any energy/value combination. Removed.

Flagged, not edited (source documents — per guardrails):

6. **Rulebook §Components still maps energies to card suits** (♠ Spades: Radiance, etc.) — a playing-card-prototype legacy. Now that real cards and symbol art exist, recommend rewording to reference the energy symbols. No surface repeats the suit mapping any more.
7. **`rulebook/GLOSSARY.md` is stale** — e.g. "Component … has an element (Fire, Water, Earth, Air)", predating the Radiance/Void/Flux/Aether naming. Needs a refresh pass.
8. **`rulebook/Ascension Trials.md`** strategy primer says "elemental domains"; the surfaces now say "energy domains". One-word fix suggested.
9. **Opening vs Binding** — the board (and GLOSSARY) call the set-up discard "the Opening"; the rulebook section is titled "Binding to Arcane Reserve" and never uses the word. Surfaces follow the board ("the Opening"). Suggest adding the name to the rulebook section title.

---

## Suggested (optional) board tweaks

The board was treated as immutable; these would tighten board↔digital continuity at the next reprint:

1. **Key Reminders typo:** "Wilds substitute for any *current* and value" → "any *energy* and value".
2. **Name the Recall step:** "3. Learning — *Recall:* retrieve all counters…" — the rulebook names this step, players use the word, and the digital surfaces teach it by name.
3. **Unify the Opening verb:** board says "discards 1 card"; rulebook says "places 1 component from their hand". Same rule — one verb would be tidier ("places 1 component").
4. **`board/spell_ref.png`** still carries the outdated symbols (already noted in `board/README.md`) — regenerate from `art/energy-symbols-export/` at next reprint so the printed spell card matches every other surface.

---

## Files touched

- `web-apps/archmage-tokens.css` — **new**, the single shared token layer
- `web-apps/archmage-theme.css` — palette now aliases the tokens; unified background/heading treatment
- `web-apps/player-reference/player-reference.html` — full rebuild (framework-free, phone-first)
- `web-apps/archmage-reference.html` — retitle, board-order tabs + deep links, vocabulary, symbols, Drought fix, scoring extension, nav
- `index.html` — three-tier structure, when-to-use lines, canonical symbols, corrected tagline
- `web-apps/player-reference/art/energy-symbols-export/*.svg` — refreshed to canonical (no longer referenced; kept in sync as a safety net)
- `COHERENCE_REPORT.md` — this file
