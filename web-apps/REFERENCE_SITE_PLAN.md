---
title: Player Reference Site — Plan (from scratch)
type: plan
status: draft
created: 2026-07-01
target: phone at the table, layered teach + lookup
---

# Archmage Ascension — Player Reference Site Plan

A ground-up plan for a phone-first reference players use *instead of* a physical
rulebook. This is a planning doc only — no site is built yet.

Decisions locked in with Sam:
- **Device:** phone, held at the table, mid-game.
- **Job:** both — a short teach path for a first game, then a fast lookup
  reference underneath.

---

## 1. The core insight that shapes everything

Players already have two things doing real work on the table:

- **The board** — the shared reference. It carries setup, the normal/drought
  turn steps, the Array, the Recognition Points table, source/reserve, and key
  reminders. Everyone looks at one board.
- **The deck** — each card shows an energy symbol and a value.

What is *no longer* on the table: the two reference cards (Spells Reference and
Turn Order & Learning). Those held the four spell definitions, the learning
actions, and the counter reminders — and they didn't print well, so they're gone.

**So the site's primary job is not "put the rulebook online." It's to be the
personal card each player lost.** The question a player actually asks mid-game,
five times a turn, is: *"Do these cards make a valid spell, and what does it do?"*
That used to be answered by a card in their hand. Now it has to be answered by
the phone in their hand. Everything else (teaching, scoring, edge cases) is
secondary to nailing that one lookup.

This is the answer to "does not using reference cards change the structure?" —
**yes, fundamentally.** It promotes the spell checker from "one section among
many" to the centrepiece, and it means the site is used *per player, in
parallel* (four people each on their own phone), not as one shared screen. That
changes both the IA and the interaction model.

---

## 2. Division of labour — don't duplicate the table

The fastest way to overwhelm a new player is to repeat, on the phone, what's
already printed 30cm in front of them. So draw a hard line:

| Lives on the BOARD (shared)            | Lives on the PHONE (personal)              |
|----------------------------------------|--------------------------------------------|
| Setup steps                            | "Can I cast this?" spell checker           |
| Normal / Drought turn sequence         | What each spell *does* when cast           |
| The Array, Source, Reserve layout      | Learning actions (Learn/Empower/Reshape/Unlearn) |
| Recognition Points table               | Energy-symbol legend (what the 5 symbols mean) |
| Key reminders                          | Worked examples & edge cases               |
|                                        | First-game walkthrough (teach layer)       |
|                                        | Scoring walkthrough + calculator           |

Rule of thumb for the build: **if it's already on the board, the site links to
it or shows a thumbnail — it does not re-explain it.** The phone fills gaps and
carries anything that needs interactivity, search, or per-player privacy.

---

## 3. What a new player genuinely needs (that board + deck don't give them)

Working through an actual first turn, the gaps are:

1. **What am I even trying to do?** The board shows *mechanics* but not the
   *goal*. One screen: build patterns in your Spellbook, race the depleting
   Source, be strongest when the Drought ends.
2. **What do these symbols mean?** New players can't read the four energy types
   by icon. A legend is essential — and it must use the *current* energy art,
   not the old suit symbols (see §7).
3. **Is this a valid spell?** The single highest-frequency question. Needs the
   four patterns (same-energy / sequence / matching-value / same-energy-sequence)
   shown as tappable checks, ideally with a "test my cards" interaction.
4. **What happens when I cast it?** The draw/transform effects, tied to spell
   size. Currently on the lost card.
5. **What can I do in the Learn phase?** Learn / Empower / Reshape / Unlearn —
   the four verbs, plainly. Also lost with the card.
6. **How do counters / capacity actually work?** Flagged in your own notes as
   *not comprehensible from the written rules alone* — this is exactly where an
   interactive visual earns its keep (see §6, and the caveat in §8).
7. **Worked examples.** One concrete example beats three sentences of rules.
8. **How do I win / how is this scored?** Recognition table is on the board, but
   a walked-through example + a calculator removes the arithmetic friction.

---

## 4. How to keep it from becoming overwhelming: layered disclosure

Never show layer *n+1* until the player wants it. Four layers, each collapsed
into the next:

- **Layer 0 — Goal (always the first screen, ~15 seconds).** One sentence on
  what you're building and how you win. Nothing else competes for attention.
- **Layer 1 — Teach ("Your first game").** A short, linear walkthrough: your
  first turn, narrated once. New players do this once and never again.
- **Layer 2 — Lookup (the working reference).** The spell checker, learning
  actions, energy legend, scoring. This is where returning players live. Fast,
  scannable, tap-to-expand.
- **Layer 3 — Rules-lawyer / FAQ.** Wilds, "can't loop around", breaking an
  enchantment reduces capacity, counter refresh, tie-breakers. Collapsed by
  default; only opened when an argument breaks out.

The discipline: **each screen answers exactly one question and offers a door to
the next.** If a screen is trying to answer three things, it's the wrong screen.

---

## 5. Information architecture (phone-first)

A sticky bottom tab bar (thumb-reachable) with 5 destinations, *not* one long
scroll. Long scrolls are where new players drown.

```
┌─────────────────────────────────────────────┐
│  ▸ START      one-screen goal + core loop     │  Layer 0
│               "New here? → Your first game"    │
├─────────────────────────────────────────────┤
│  ▸ SPELLS ★   the checker — THE centrepiece    │  Layer 2
│   • tap a pattern → requirements + example     │
│   • "test my cards" mini-interaction           │
│   • effect-when-cast, tied to size             │
├─────────────────────────────────────────────┤
│  ▸ YOUR TURN  normal + drought sequence         │  Layer 2
│   • the 3 steps, expandable                     │
│   • Learn / Empower / Reshape / Unlearn         │
│   • counters/capacity visual                    │
├─────────────────────────────────────────────┤
│  ▸ SCORING    Recognition table + worked example│  Layer 2
│   • tap spell size → points                     │
│   • end-game calculator                         │
├─────────────────────────────────────────────┤
│  ▸ MORE       legend, wilds, FAQ, tie-breaks    │  Layer 3
└─────────────────────────────────────────────┘
   [ Your first game ]  ← full-width teach path, Layer 1,
                          reachable from START, hidden after
```

Why tabs over scroll: a player mid-turn needs to jump from "is this valid?" to
"what does it score?" in one tap, not by hunting through 37 sections (which is
the current site's failure mode).

---

## 6. The centrepiece: the spell checker

This is the part worth designing hardest, because it's the lost card and the
most-used screen. Concept:

- Four spell types as four cards/tiles: **Conjuration** (same energy),
  **Transfiguration** (sequence), **Enchantment** (matching values),
  **Perfect Transmutation** (same energy + sequence).
- Tap one → its requirement stated in one line, a live example using the current
  energy symbols, and the effect-when-cast broken out by size (e.g. Conjuration
  3–5 → draw +1; 6+ → draw +2).
- Optional but high-value: a **"test my hand"** mode — the player taps in the
  energies/values they're holding and the site tells them which valid spells
  they can form. This is the single feature that most replaces a human teacher
  at the table, and it's only possible *because* it's digital — a printed card
  could never do it.

Keep each spell's default view to one screen. Effects and edge cases expand on
tap.

---

## 7. Visual system & the symbol problem

- There are **four energy types — Radiance, Void, Flux, Aether — plus a wild
  card.** That's it. The retired fifth-energy name is *not* an energy type and
  *not* the name of the wild; it must not appear anywhere player-facing. The wild
  is just "the wild card."
- The site **must** use the current energy artwork. The canonical source is the
  procedural renderer `card-design/art/arcana.js` — **not** the older
  `spell_ref.png` reference card, whose symbols are out of date. Clean exports of
  all four energies + the wild (SVG + PNG) have been generated from arcana.js and
  live in `art/energy-symbols-export/`; use those.
- Note a live inconsistency to resolve *before* building content: the board and
  rulebook still describe energies as suits (♠ Spades = Radiance, ♥ Hearts =
  Void, ♦ Diamonds = Flux, ♣ Clubs = Aether), while the card art uses the four
  named energy symbols. The site should drop suit language entirely and present
  one canonical legend: the four named energies + the wild.
- Match the existing dark/gold arcane theme (there's already an
  `archmage-theme.css`) so board, cards, and site read as one product.
- Accessibility on a phone at a table: high contrast, large tap targets, works
  in a dim room, readable one-handed. Worth an accessibility pass at build time.

---

## 8. Content caution — the loop isn't frozen

Your STATE.md puts the game at Stage 3, with two live problems: the
**enchantment/capacity economy** is being redesigned (likely partial-unlearn),
and the **counter refresh rule** isn't yet comprehensible. Implication for this
plan:

- Build the *structure* now, but **don't over-invest in polished
  enchantment/capacity content** until that redesign lands — you'd only rewrite
  it. Stub those sections; make them easy to update.
- The counter/capacity visual (§6, YOUR TURN) is worth prototyping precisely
  *because* the rules are hard to grasp — but treat it as a candidate that might
  expose the rule problem rather than paper over it. UX can't fix a rule that's
  genuinely ambiguous; if the visual is hard to design, that's a signal about
  the rule, not the site.

---

## 9. Open questions to settle before build

1. Is the "test my hand" checker in scope for v1, or a fast-follow? (It's the
   highest-value feature but the most build effort.)
2. Should the site be fully offline-capable (no signal at a friend's table)?
   Affects whether it's a static bundle or hosted.
3. Do you want a QR code on the board linking to the site, so players get to it
   without typing a URL?

*(Resolved: energies are Radiance / Void / Flux / Aether + a wild card. The
retired fifth-energy name is not a game term and appears nowhere on the site.)*

---

## 10. Suggested next step

Approve this shape, then build **v1 = START + SPELLS + YOUR TURN** only — the
three screens that replace the lost card and get a game running. Add SCORING,
the teach path, and MORE once the core lookup feels right in a real session.
The `design` plugin skills (design-critique, ux-copy, accessibility-review) are
worth running against the SPELLS screen specifically, since it carries the load.
