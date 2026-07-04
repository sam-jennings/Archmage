---
title: Expansion - The Schools (v0.1)
type: expansion-ruleset
status: shelf-ready-untested
version: 0.1
created: 2026-07-02
relates_to:
  - "[[Expansion Directions - Post-Echo Exploration]]"
  - "[[Archmage Ascension - Complete Rulebook]]"
  - "[[Ascension Trials]]"
---

# The Schools — v0.1 Rules

*No two wizards were trained the same way.*

Asymmetric player identities: each wizard is a graduate of a School, granting one always-on **Talent** and one endgame **Lean**. Modular, opt-in, one card per player.

> **Stage gate:** shelf-ready, untested, queued behind the counter-economy fix like all expansion work. But note: Schools is the one module that can piggyback on *any* future base-game playtest at near-zero teaching cost.

## Design rules (binding on every School, present and future)

1. **No Talent touches counters, capacity, or the number of learning/casting actions.** The counter economy is under repair; talents modify *effects*, never *action economy*.
2. **No School names an energy.** (The standing compatibility rule: identical play at 2–4p without Echo and 5–6p with it.) Suit-agnostic wording only: "one energy of your choice," "each distinct energy," etc.
3. **Every Talent is checkable at a glance** — printed on the card, zero memory, no once-per-game tracking except where a flip-marker is specified.
4. **Every Lean is flat arithmetic** — "+N RP per X," never percentages, never conditionals-on-conditionals.
5. **A Lean may not reward a resource any Last Rites card converts to points** (cross-module rule from [[Expansion Directions - Post-Echo Exploration]] Part 2 — currently: nothing may score cards-in-hand, which Rite of Ash owns).

---

## Components

- 8 **School cards** (talent + lean printed on each).
- 8 matching **reference strips** (optional; the card is the reference).

## Setup — the School market

After determining start player, before dealing hands:

1. Reveal **player count + 2** School cards as a face-up market.
2. In **reverse turn order**, each player picks one School from the market.
3. Return the rest to the box. Your School is public all game.

*Why a market, not a deal:* dealing 2-keep-1 to each player needs 12 cards at 6p and gives no information about rivals' options; a public market of N+2 scales to every count with one rule, and picking in reverse turn order hands the compensation to the players who act last (see iteration log, bug B2).

---

## The eight Schools

| School | Talent (always on) | Lean (at evaluation) |
|---|---|---|
| **The Ashbinders** | Your 3-component Transfigurations exchange **discard 1 → take 1** (as if 4-component). | +1 RP per Transfiguration in your Spellbook. |
| **The Depthseekers** | Your 6+ component Conjurations draw **+3** instead of +2. | +1 RP per Conjuration in your Spellbook. |
| **The Archivists** | When you draw blind from the Source in Collection, **draw 2, keep 1, return 1** to the top *or* bottom of the Source. | +2 RP if your Spellbook contains 4 or more spells. |
| **The Chronomancers** | You may take your Collection pick **after** your Casting phase instead of before it (declare at turn start). | +2 RP if your Spellbook contains a spell of 5+ components. |
| **The Menders** | Components you gain from **Unlearn** are usable **immediately** (base: not until next turn). | +1 RP per distinct spell **type** in your Spellbook (max +4). |
| **The Harmonists** | When you take from the Array, look at the **top 2** of the Source and choose which one refills the slot (return the other on top). | +1 RP per distinct **energy** appearing in your Spellbook (max +5 with the extension; the cap is printed as "max = number of energies in the deck"). |
| **The Lucent Order** | Your **wilds** may change what they represent **once**, when you Reshape or Empower the spell containing them (flip the wild sideways to mark it spent). | +2 RP per wild in your Spellbook at evaluation. |
| **The Gravewrights** | Once per turn, when any of **your** components would go to the Arcane Reserve, you may place it on **top** of the Reserve pile *or* bury it at the bottom. | +2 RP if your largest spell is larger than every other player's largest spell (no tie). |

**Trials riders (only when playing with [[Ascension Trials]]):** each School card carries one line, e.g. Ashbinders — *win Transformation-trial ties*; Harmonists — *win Harmony-trial ties*; the rest analogous, always tie-breaking only, never power.

---

## Iteration log — bugs found and fixed before v0.1

- **B1 — Free-action talents violate the protected economy.** First drafts included "Reshape once per turn as a free action" and "one free Learn after a PT." Both grant learning actions — exactly the coupling design rule 1 exists to prevent (and the same trap flagged as Q2 in the Spell Duels doc). **Fix:** cut; every talent now modifies an effect or a choice, never the action count.
- **B2 — Deal-2-keep-1 doesn't scale.** 2 per player = 12 cards at 6p (roster is 8), and blind deals can hand one player two duds. **Fix:** public market of count+2, reverse-turn-order pick — scales 2–6, adds a first strategic read of the table, and compensates late seats.
- **B3 — Energy-named schools failed the compatibility test.** A "Voidcaller" school is broken text the moment Echo enters (or reads as privileged among five suits). **Fix:** design rule 2; all eight rosters re-worded suit-agnostically.
- **B4 — Archivists' filter accelerated the Source clock.** Original: "draw 2, keep 1, discard 1 to the Arcane Reserve" — every Archivist Collection burned the Source 2× and inflated the future Released Reserve. **Fix:** the unkept card returns to the Source (top or bottom); clock-neutral, still a strong filter.
- **B5 — Hand-scoring lean collided with Last Rites.** Original Archivist lean: "+1 RP per 3 components in hand." Stacks with Rite of Ash (hand → points) into a hoarding strategy both modules would separately reward. **Fix:** cross-module design rule 5; Archivists' lean re-keyed to spell count.
- **B6 — Gravewright talent was invisible/forgettable.** Original: "you may look at the top card of the Arcane Reserve at any time" — zero decisions, pure fiddle. **Fix:** placement control (top/bottom), which quietly seeds the future Released Reserve — a talent that gets *more* interesting late, and the roster's sleeper synergy with Last Rites (you can bury a component you plan to draw back in the Drought). Flagged as a cross-module watch item, judged acceptable: it costs a whole School slot to pursue.
- **B7 — Chronomancer timing created an information paradox.** "Collect after Casting" originally allowed collecting *mid*-Casting (after seeing Conjuration draws, before casting more). **Fix:** declare the delay at turn start; the pick happens after the whole Casting phase, before Recall.
- **B8 — Lucent Order enabled a shapeshifting engine.** Unrestricted "wilds may change on any Reshape" let one wild re-count toward a new pattern every single turn. **Fix:** once per wild per game, marked physically by rotating the card.
- **B9 — Leans vs. the moving score table.** Any lean tuned as "+2" today may be mistuned when the Stage-4 score table lands. **Accepted, not fixed:** leans are deliberately flat and small (≤ +5 swing) so retuning is a number change, not a redesign. Do not balance leans finely until the base table is frozen.

## Open balance questions (for the playtest, not for paper)

- Are Talents or Leans the dominant half? (Intent: Talents ≈ 70% of a School's value — identity should be felt during play, not at the count-up.)
- Ashbinders' talent is the only one that changes a *cost* — is discard-1-take-1 on 3-card Transfigurations simply the best talent in the roster?
- Do public Schools create useful table-reading ("she's Gravewright, watch the Reserve") or just noise?
- 2p: market of 4, pick 2-then-1 — does the first pick decide too much head-to-head?

## Scaling 2–6

Nothing scales except the market (count+2). At 5–6p (Echo extension) the Harmonist lean cap self-adjusts by its printed wording. All talents verified suit-count-agnostic (design rule 2).

## Drought handling

Talents that reference the Source, Array, or Collection pick (Archivists, Chronomancers, Harmonists) go **dormant** in the Drought — their structures are gone; no special text needed beyond one line on the card back: *"if the rule's object no longer exists, the talent sleeps."* Menders, Gravewrights (Reserve is gone → dormant), Lucent Order (still live — Reshape exists in the Drought) verified line by line.
