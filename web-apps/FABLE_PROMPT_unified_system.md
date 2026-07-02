# Prompt for Fable — Unify the Archmage Ascension player-facing system

> You can read the entire project folder — reference files by the paths given below.
> You are free to edit files directly (no need to propose first). Do the work, then
> summarise what you changed in the coherence report at the end.

---

## Scope: the physical tabletop experience only

This is about a player's experience **while playing the physical board game** — the
board, cards, and their phone on the table. The digital "interactive game" app
(`web-apps/archmage-ascension/`) is **parked and out of scope**; do not touch it, and do
not treat it as a surface to unify. Everything here serves someone sitting at a table with
the physical components.

## Your role

You are unifying a board game's player-facing materials into one coherent, intuitive
system. Several pieces already exist but were built separately, so they drift in visual
style, vocabulary, and structure. Your job is **coherence and intuitiveness, not net-new
content**: make a player moving between the physical board and the digital reference
surfaces feel like they're inside one calm, well-designed product — never re-learning
where things are.

Do **not** merge everything into one giant page. The previous attempt failed exactly that
way (37 sections, comprehensive and unusable at the table). Keep the pieces separate but
make them obviously one family.

## The game in one paragraph (so your choices are informed)

Archmage Ascension is a 30–60 min tactical card game. Players draw magical **components**
(cards: one of four energies — **Radiance, Void, Flux, Aether** — plus a **wild** card, each
with a numeric value) from the depleting **Source**, and arrange them into four kinds of
**spells** in their **Spellbook**: Conjuration (same energy), Transfiguration (a value
sequence), Enchantment (matching values), and Perfect Transmutation (same-energy sequence).
A turn is Collection → Casting → Learning (Learn / Empower / Reshape / Unlearn). When the
Source runs out the **Drought** begins and the game ends; the most refined Spellbook wins on
**Recognition Points**. The physical board anchors the shared state (Source, the **Array**,
the **Arcane Reserve**, turn order, scoring). The pleasure is building patterns toward a
climactic ending.

## The pieces you are unifying

1. **The physical board** — `board/archmage_a3_landscape_board.pdf` (A3 landscape). This is
   the fixed anchor: it already carries Set-up, Normal Turn, Drought Turn, the Array,
   Recognition Points, Key Reminders, Source/Reserve. **Treat it as immutable ground truth**
   — the digital surfaces conform to *its* structure and wording, not the reverse. (You may
   list suggested board tweaks separately, but don't assume they'll happen.)
2. **Landing page** — `index.html`. Sections: Play, Reference, Tools. It's the front door
   to everything below.
3. **Online Rules** — `web-apps/archmage-reference.html`. The full, exhaustive rules
   reference. This is the deep tier.
4. **Quick Reference Card** — `web-apps/player-reference/player-reference.html`. A rough,
   phone-first "Start · Spells · Your Turn" lookup card. This is the most important surface
   to get right (see below) and it's the least finished.
5. **Canonical rules text** — `rulebook/Archmage Ascension - Complete Rulebook.md`. The single
   source of truth for wording. All surfaces derive from this; none may contradict it.
6. **Energy symbol art** — `art/energy-symbols-export/` (SVG + PNG for Radiance, Void, Flux,
   Aether, Wild), generated from the live renderer `card-design/art/arcana.js`. **These are
   the only correct symbols.** Do not trace, redraw, or substitute them, and never use the
   older `board/spell_ref.png` symbols.

## The intended three-tier reading model (design to this)

The digital and physical pieces form one stack, separated by *when a player uses them*:

- **Physical board** — shared table state and turn sequence, seen by everyone at once.
- **Quick Reference Card (phone)** — the personal, at-the-table lookup: "Can I cast this?
  What does it do? What can I do in Learning?" One question at a time. This replaces the
  printed player card, which didn't print well, so it must be self-sufficient for playing a
  whole game.
- **Online Rules** — the authoritative fallback for first-time deep learning and settling
  disputes. Reached from the card via "Full rules →", ideally deep-linked to the right
  section.

Make this relationship legible on the landing page (a one-line "when to use which" for each)
and via cross-links, so nobody wonders which surface to open.

## What "unified and coherent" concretely means — do all of these

1. **One visual language.** Right now the landing and Online Rules use `archmage-theme.css`
   while the Quick Reference Card uses `web-apps/player-reference/colors_and_type.css`.
   Reconcile these into a single shared token set (colours, type scale, spacing, borders, the
   dark/gold arcane mood) that all three in-scope surfaces import, so they read as one
   product. Cinzel/Cormorant type pairing and the dark-gold palette already in play should be
   the basis. (Ignore the parked game's copy of `colors_and_type.css`.)
2. **One vocabulary.** Enforce a single glossary across every surface: the four energies +
   "wild card" (never a fifth energy, never the word **"Convergence"**, never card-suit
   language like Spades/Hearts). Consistent capitalised game terms: Source, Array, Arcane
   Reserve, Spellbook, Component, Counter/Capacity, Learn/Empower/Reshape/Unlearn, Drought,
   Recognition Points.
3. **Structural echo of the board.** Use the board's own section names and order on the
   digital surfaces (Set-up, Normal Turn, Drought Turn, Learning Actions, Recognition
   Points, Key Reminders) so a player's eye moving from board to phone lands in familiar
   territory.
4. **Correct symbols everywhere** — the `energy-symbols-export` art, identically rendered on
   the card, the rules, and the landing, at consistent sizes.
5. **No duplicated wording that can drift.** Where the card and rules state the same rule,
   they must match the canonical rulebook phrasing. Prefer the card *linking* to the rules
   for depth over restating it.
6. **Coherent navigation.** Consistent header/way-back affordance across surfaces; the
   player can always get home and can always reach the next tier.

## What "intuitive to the player" means — hold these as constraints

- **Phone-first.** The Quick Reference Card is designed for a phone held at a table: thumb-
  reachable controls, large tap targets, readable one-handed in a dim room.
- **Progressive disclosure.** Each screen answers one question and offers a door to the next.
  Default-collapse depth; never wall-of-text a new player.
- **Teach then look up, in layers.** The card supports a first-ever game (a short guided
  path) and every game after (fast lookup) without those two modes fighting.
- **The star feature:** on the Spells screen, let a player check a hand — tap in the
  energies/values they hold and see which valid spells they can form. This is the single most
  intuitive thing the digital card can do that paper never could. Refine this if present,
  add it if not.
- **Calm, not busy.** Arcane and atmospheric, but restraint over spectacle; motion subtle
  and never blocking a lookup.

## Deliverables

1. A unified visual/token layer imported by all surfaces (or a clear plan + the edits to get
   there).
2. A refined **Quick Reference Card** as the centrepiece — polished from its current rough
   state, phone-first, embodying the intuitiveness constraints above.
3. Landing, Online Rules, and card made visually and verbally consistent, with the three-tier
   "when to use which" model and working cross-links.
4. A short **coherence report**: the vocabulary glossary you enforced, any contradictions you
   found against the canonical rulebook, and a list of suggested (optional) board tweaks that
   would tighten board↔digital continuity.

## Guardrails — do not

- Do not invent a fifth energy or reintroduce the term "Convergence" anywhere player-facing.
- Do not redraw or replace the `energy-symbols-export` art.
- Do not collapse the three tiers into one page.
- Do not change game rules or numbers; if something seems wrong, flag it in the coherence
  report against the canonical rulebook rather than editing the rules.
- Do not treat the board as editable ground you can restructure — conform to it.

Start by reading the board and the canonical rulebook to lock the vocabulary and structure,
then reconcile the visual layer, then refine the Quick Reference Card, then align the landing
and rules around it.
