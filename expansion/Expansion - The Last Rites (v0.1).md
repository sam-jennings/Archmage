---
title: Expansion - The Last Rites (v0.1)
type: expansion-ruleset
status: shelf-ready-untested
version: 0.1
created: 2026-07-02
relates_to:
  - "[[Expansion Directions - Post-Echo Exploration]]"
  - "[[Archmage Ascension - Complete Rulebook]]"
  - "[[Ascension Trials]]"
  - "[[Expansion - The Schools (v0.1)]]"
---

# The Last Rites — v0.1 Rules

*When the Source dies, magic doesn't stop — it changes state. Rites are end-times workings that only function in a dying world.*

The Drought becomes a third act: a face-up row of Rites, visible from setup so players build toward them all game, performable only once the Source is gone. Every Rite consumes magic **utterly** — its cost is banished from the game — and the endgame becomes a disassembly race: strip your engine for Rites, or hold your patterns for standard evaluation.

> **Stage gate:** shelf-ready, untested, queued behind the counter-economy fix like all expansion work.

## Design rules (binding)

1. **No Rite touches counters, capacity, or learning actions.** Rite performance is a separate allowance (below), so low-capacity players rite exactly as well as high-capacity ones.
2. **All costs are banished** (removed from the game) — never paid into the Released Reserve, which is the game-end clock (see iteration log, B1).
3. **Suit-agnostic wording** (the standing 2–4p / 5–6p compatibility rule): costs say "of one energy," "of matching value," never a named suit.
4. **Flat arithmetic only** at evaluation; every scored Rite is marked physically at the moment it's performed.
5. **No Rite rewards cards-in-hand held passively** — Rite of Ash *converts* the hand (you lose it); nothing scores a hand you keep (cross-module rule with [[Expansion - The Schools (v0.1)]]).

---

## Components

- 8 **Rite cards** (large, face-up row).
- **Binding markers** (~6), **±1 markers** (~4), **Performed markers** (8 — one per Rite card).
- 1 rules/turn-order reference card.

## Setup

Place all 8 Rite cards face-up in a row beside the Source. They are inert until the Drought — but public from turn one. That visibility *is* the expansion during acts one and two: players shape late-game hands and Spellbooks toward the Rites they intend to claim.

## When and how you may perform a Rite

During the Drought only, on your turn, **after** your Collection draw, you may perform **one** Rite (before, during, or after your Learning actions — declare which):

- Pay the printed cost by **banishing** the components (remove from game, face-up in a shared banished pile for verification).
- Place a **Performed marker** on the Rite: **each Rite can be performed only once per game, by whoever gets there first.**
- Limits: **max 1 Rite per player per turn, max 2 per player per game.**
- Rites cost no counters and are not Learning actions.

If the Released Reserve empties, the game ends immediately as normal — an unfinished plan is a plan you started too late.

---

## The eight Rites

| # | Rite | Cost (banish) | Effect |
|---|---|---|---|
| 1 | **Rite of Binding** | 2 components of one energy, from hand | Place a Binding marker on one of your spells: it can no longer be changed (no Empower/Reshape/Unlearn) and scores **+2 RP**. |
| 2 | **Rite of the Final Pattern** | 3 components of one energy, from hand | One of your spells scores as if it had **one more component** (mark it). The spell itself is unchanged. |
| 3 | **Rite of Ash** | Your entire hand (minimum 3 cards) | **+1 RP per 2 cards banished** (round down, max +4). |
| 4 | **Rite of the Grave-Song** | 1 component from hand | For the rest of the game, **your Drought Collection draw becomes: look at the top 3 of the Released Reserve, take 1, return 2 in any order.** (Personal, ongoing.) |
| 5 | **Rite of Transposition** | 2 components of matching value, from hand | Place a ±1 marker on one component in your Spellbook: at evaluation it counts as one value higher or lower (your choice when placed). All patterns are re-checked at evaluation with the shifted value; if the shift would make any spell invalid, it can't be placed there. |
| 6 | **Rite of Sundering** | One complete 3-component spell from your Spellbook | Gain RP equal to that spell's evaluation value **+3**, scored now (mark it on the Rite). The components are gone. |
| 7 | **Rite of Silence** | 3 components of one energy, from hand | Choose any un-Performed Rite: place a Performed marker on it. **No one may perform it.** |
| 8 | **Rite of the Long Dusk** | 2 components, from hand | Every player (you included) **may** add 1 card from hand to the Released Reserve; shuffle it. (Voluntary — each player chooses; the Drought lengthens by however many accept.) |

**Trials riders (only with [[Ascension Trials]]):** printed as one line per card — Binding: the bound spell's domain power +1; Final Pattern: the marked spell's power uses its virtual size; Sundering: the sundered spell contributes **no** domain power (it's gone); Transposition: shifted value applies to domain calculation; the rest have no Trials contact.

---

## Iteration log — bugs found and fixed before v0.1

- **B1 — Paying costs into the Released Reserve broke the clock (the big one).** The original sketch had Rites "feeding magic back to the dying world" — costs shuffled into the Released Reserve. But the Reserve's depletion *is* the end-of-game trigger: heavy Rite play would extend the game, light play shorten it, and a trailing player could chain-Rite to postpone the ending indefinitely-ish. **Fix:** all costs are **banished**; the fiction becomes "consumed utterly." The clock is deliberately contestable in exactly one place, at one bounded size, by group consent: the Long Dusk (see B6).
- **B2 — Rites-as-learning-actions taxed the wrong players.** If a Rite costs a learning action, capacity leaders rite freely and 1-counter players choose between riting and learning — re-coupling the endgame to the economy under repair. **Fix:** design rule 1; separate once-per-turn allowance.
- **B3 — First-come-first-served favoured whoever sat after the Drought trigger.** The player whose turn follows the trigger gets first pick of all 8 Rites. Partially structural (someone must go first) — **mitigations:** max 1 per turn / 2 per game (a first mover can't sweep), costs are steep enough that riting turn one of the Drought means having *pre-built* the hand for it (a genuine all-game plan, which is the expansion's point), and Grave-Song/Long Dusk get better later, flattening the early-pick premium. **Residual risk accepted and flagged for the playtest** (measure: RP earned from Rites by Drought-seat position).
- **B4 — Spell-type conversion at evaluation created illegal states.** An early Rite ("one spell scores as a different type") invited un-checkable arrangements and Trials domain chaos. **Fix:** replaced by Final Pattern (+1 virtual size — flat, legal by construction) and Transposition (value shift with an explicit validity check).
- **B5 — Grave-Song as written accelerated the clock.** "Draw 3 extra, keep 1" depleted the Reserve 2 cards faster per use. **Fix:** it *replaces* the normal Collection draw (look 3, take 1, return 2) — strictly clock-neutral, still the strongest engine Rite, now costed at only 1 card because its value is spread over turns.
- **B6 — The Long Dusk forced discards (feel-bad) and was compulsory.** Original: "each player adds 1 card from hand." A player with a 3-card hand planning Rite of Ash is robbed by someone else's Rite. **Fix:** voluntary per player — it becomes a real table decision (trailing players accept, leaders decline), i.e. the clock is only ever extended by the people who want it extended.
- **B7 — Sundering double-dipped with Trials.** Scoring a spell *and* keeping its domain power was strictly better than not sundering. **Fix:** Trials rider explicitly zeroes the sundered spell's domain contribution.
- **B8 — Silence was a kingmaker at 2 cost.** Cheap denial let a leader lock the best Rite for pocket change. **Fix:** cost raised to 3-of-one-energy (as expensive as Final Pattern) — denial is now a real sacrifice of your own endgame, and it consumes one of your two lifetime Rites.
- **B9 — Binding + Transposition on the same spell.** Ruled: legal (bind after shifting), but Transposition's validity check runs at placement — a bound spell can still receive a ±1 marker since binding stops *actions*, not markers. One sentence on the card: "markers are not changes."

## Open questions (for the playtest)

- **Is 2 Rites per player the right lifetime cap?** (3 might make the Drought the whole game; 1 might make the row feel like scenery.)
- **Does the row actually shape early-game play** (the design's central promise), or do players ignore it until the Drought? Measure: does anyone hold cards they'd otherwise spend, citing a Rite?
- **Rite of Ash vs. hand-building:** is banish-your-whole-hand ever right before the last turn? If it's only ever a final-turn dump, cut the minimum or raise the cap.
- **Drought length:** base-game Droughts run short. If testing shows most games allow only 1 Rite per player, the cap question answers itself — or the Long Dusk becomes near-mandatory, which is its own finding.

## Scaling 2–6

The row is always 8 Rites; scarcity scales naturally (2p: 8 rites for a max of 4 performances = low contention, a puzzle; 6p: 8 for up to 12 = a genuine race). If 5–6p testing shows the row stripped by round two of the Drought, the extension box adds 2 more Rite cards (slots 9–10) rather than changing any rule. Costs are count-agnostic by design rule 3.

## Interaction with the four spell types

- **Conjuration / Perfect Transmutation:** dormant casters in the Drought — but their *size* is Sundering and Final Pattern fodder; big engines finally have an endgame decision beyond "sit there and score."
- **Transfiguration:** Transposition is the sequence-builder's Rite (finish the 12-13-**14** you never drew). Intended favouritism; watch it.
- **Enchantment:** capacity still matters in the Drought (learning actions) — and Rites deliberately *don't* consume it, so enchantment investment keeps its base-game value, no more, no less. Binding an Enchantment is legal and safe (they're never "changed" by casting anyway) — niche but fine.
- **Spell Duels:** zero contact (duels off in the Drought). **Schools:** checked line by line — see [[Expansion - The Schools (v0.1)]] design rule 5 and its B6 (Gravewrights can pre-seed the Reserve they'll later Grave-Song through; costs a School slot, flagged as the pairing's watch item).
