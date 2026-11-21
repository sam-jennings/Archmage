---
title: Expansion - The Last Rites (v0.2)
type: expansion-ruleset
status: shelf-ready-untested
version: 0.2
created: 2026-07-02
updated: 2026-11-13
base_rules: rulebook v3.2
relates_to:
  - "[[Expansion Directions - Post-Echo Exploration]]"
  - "[[Archmage Ascension - Complete Rulebook]]"
  - "[[Scoring System Reference]]"
  - "[[Ascension Trials]]"
  - "[[Expansion - The Schools (v0.2)]]"
---

# The Last Rites — v0.2 Rules

*When the Source dies, magic doesn't stop — it changes state. Rites are end-times workings that only function in a dying world.*

The Drought becomes a third act: a face-up row of Rites, visible from setup so players build toward them all game, performable only once the Source is gone. Every Rite consumes magic **utterly** — its cost is banished from the game — and the endgame becomes a disassembly race: strip your engine for Rites, or hold your patterns for standard evaluation.

> **Status (2026-11-13):** v0.2, re-priced on paper against **rulebook v3.2**. Untested. Developed together with [[Expansion - The Schools (v0.2)]] (Sam's pick, 2026-11-13); each module is tested alone first, then together. Neither rides on the first v3.2 base-game playtest.

## Changelog

- **v0.2 (2026-11-13)** — every Rite re-checked and re-priced against rulebook v3.2 (score table with the 3-card Conjuration at 0 and Conjuration-15 = Perfect Transmutation-15 = 100; Enchantment ladder +1/+3/+5 scoring 4/10/16, max 4 components at 2–4 players; RESHAPE at one counter per spell; partial UNLEARN with same-turn re-learn; EMPOWER may convert spell types; flexible wilds; Source-emptying timing; immediate game end when the Released Reserve is depleted).
  - **Final Pattern** is now a flat **+5** (needs a spell of 6+ components). The old "+1 virtual size" was worth up to +21 at the top of the v3.2 table and rewarded concentrating into one huge spell (R1).
  - **Sundering** bonus **+3 → +4**; it may not take a bound spell; taking an Enchantment follows the capacity-loss rule (R2).
  - **Transposition rewritten**: the v0.1 text had no useful legal placement (any ±1 shift breaks a run or an Enchantment and does nothing in a Conjuration). It now changes the number of a card in your hand that you learn this turn (R3).
  - **Clarified**: what a Drought turn is (the turn that empties the Source is not one; the draw that empties the Released Reserve ends the game before any Rite), wilds in costs, Grave-Song with fewer than 3 cards, Binding blocks EMPOWER conversions and Sundering, Silence can't target itself (R4–R8).
  - **New**: Drought-length desk check, value table, "Interactions with The Schools" section, paper-and-coins component list.
- **v0.1 (2026-07-02)** — first full ruleset; nine bugs fixed on paper (B1–B9). Byte-exact copy in `_archive/Expansion - The Last Rites (v0.1).md-v0.1-2026-11-13/`; history in git.

## Design rules (binding)

1. **No Rite touches counters, capacity, or learning actions.** Rite performance is a separate allowance (below), so low-capacity players rite exactly as well as high-capacity ones. In v3.2 terms: no Rite grants or costs a counter, changes the Enchantment ladder or size cap, or changes what a learning action costs. (A Rite may *require* a normal learning action, paid as normal — Transposition only.)
2. **All costs are banished** (removed from the game) — never paid into the Released Reserve, which is the game-end clock (see iteration log, B1).
3. **Suit-agnostic wording** (the standing 2–4p / 5–6p compatibility rule): costs say "of one energy," "of matching number," never a named suit.
4. **Flat arithmetic only** at evaluation; every scored Rite is recorded at the moment it's performed. **No Rite's value grows with spell size** (v0.2): the v3.2 table rises steeply at the top, so any size-scaled bonus pays most for one huge spell.
5. **No Rite rewards cards-in-hand held passively** — Rite of Ash *converts* the hand (you lose it); nothing scores a hand you keep (cross-module rule with [[Expansion - The Schools (v0.2)]], its design rule 5).
6. **No Rite changes a spell's size or type for any other rule** (v0.2). Rite points are recorded on their own; spells are scored as they are built.

---

## Components (paper + coins, beside one printed base set)

- 8 **Rite cards** — index cards written from the table below (no new printing; F14 export hold).
- **Coins** for markers, in a denomination you are *not* using for counters: Performed (8, one per Rite), Binding (up to 8), Transposition (up to 8).
- The score pad, for Rite points.
- 1 reference card: "When you may perform a Rite" (below), copied by hand.

## Setup

Place all 8 Rite cards face-up in a row beside the Source. They are inert until the Drought — but public from turn one. That visibility *is* the expansion during acts one and two: players shape late-game hands and Spellbooks toward the Rites they intend to claim.

## When and how you may perform a Rite

- **Only on your Drought turns.** A Drought turn is a turn that *starts* after the Drought has begun. The turn on which the Source runs dry is not a Drought turn (it finishes under the v3.2 rule: no more casting, then Learning — but no Rite).
- **When:** after your Collection draw, at any point in your Learning phase — before, between or after your learning actions.
- **The draw that empties the Released Reserve ends the game at once** (base rule), so there is no Rite on that turn.
- Pay the printed cost by **banishing** the components (remove from game, face-up in a shared banished pile for verification).
- Place a **Performed** coin on the Rite: **each Rite can be performed only once per game, by whoever gets there first.**
- Limits: **max 1 Rite per player per turn, max 2 per player per game.**
- Rites cost no counters and are not learning actions.
- **Wilds in costs:** a wild may pay for any one component of a cost; it counts as whatever the cost needs (any energy, any number).
- **Costs from your Spellbook:** only Sundering takes a spell. Every other cost comes from your hand. You may UNLEARN (1 counter, as normal) earlier in the same Learning phase to move components into your hand and then pay with them — v3.2 lets returned components be used the same turn.

---

## The eight Rites

| # | Rite | Cost (banish) | Effect |
|---|---|---|---|
| 1 | **Rite of Binding** | 2 components of one energy, from hand | Place a Binding coin on one of your spells. It can no longer be changed — no EMPOWER (including converting it to another type), RESHAPE, UNLEARN or Sundering — and scores **+2 RP**. Record the +2 now. |
| 2 | **Rite of the Final Pattern** | 3 components of one energy, from hand | Perform only if you have a spell of **6 or more components**. Gain **+5 RP** (record it now). The spell is not marked and does not change. |
| 3 | **Rite of Ash** | Your entire hand (minimum 3 cards) | **+1 RP per 2 cards banished** (round down, max +4). |
| 4 | **Rite of the Grave-Song** | 1 component, from hand | For the rest of the game, **your Drought Collection draw becomes: look at the top 3 of the Released Reserve (or all of it, if fewer), take 1, return the rest on top in any order.** (Personal, ongoing; starts with your next turn.) |
| 5 | **Rite of Transposition** | 2 components of matching number, from hand | Choose one other non-wild component in your hand: its number becomes **one higher or one lower** (your choice; never below 1 or above 15). You must LEARN or EMPOWER it into a spell **this turn** (normal action, 1 counter). When it enters your Spellbook, put a Transposition coin on it: it keeps the new number while it stays in your Spellbook, including through RESHAPE. If it isn't learned this turn, or later returns to your hand, the shift ends (remove the coin). Its energy never changes. |
| 6 | **Rite of Sundering** | One complete spell of **exactly 3 components** from your Spellbook (not a bound spell) | Gain RP equal to that spell's table value **+4**, scored now (record it). The components are gone. If it was an Enchantment, you lose its capacity immediately; you may not Sunder an Enchantment unless you can absorb that loss from your unused counters this turn. |
| 7 | **Rite of Silence** | 3 components of one energy, from hand | Choose any *other* un-performed Rite: place a Performed coin on it. **No one may perform it.** Silence itself is also Performed. |
| 8 | **Rite of the Long Dusk** | 2 components, from hand | Starting with you and going round the table, every player (you included) **may** add 1 card from hand face down to the Released Reserve; then shuffle it. (Voluntary — the Drought lengthens by however many accept.) |

**Trials riders (only with [[Ascension Trials]]):** Binding — the bound spell's domain power +1; Sundering — the sundered spell contributes **no** domain power (it's gone); Transposition — the new number is the card's number for domain purposes too; Final Pattern and the rest have no Trials contact. *Not refreshed beyond this in v0.2: Ascension Trials is parked (F8).*

### Rulings (v3.2)

- **Binding.** A bound Enchantment keeps its capacity for the rest of the game (it can't be stepped down). Binding stops *actions*, not coins: a spell holding a Transposition card can still be bound. The +2 is recorded when performed, so it does not depend on the spell surviving — and a bound spell can't be removed anyway.
- **Final Pattern.** The 6+ spell only has to exist when you perform the Rite. Enchantments never qualify (max 4 or 5 components). The +5 is flat: the same for a 6-card Transfiguration and a 14-card Conjuration.
- **Ash.** Your hand is empty afterwards; you still draw on later turns. You may UNLEARN into your hand first (1 counter), but the +4 cap limits that to a small gain.
- **Grave-Song.** Clock-neutral: you still take exactly one card, so the number of Drought draws is unchanged. If the Released Reserve holds 1 card, you take it (and the game ends). Returned cards go on top, so you choose what the next player draws from your rejects — intended, and a watch item at 2p. Does not modify a draw that some other module replaces (see Interactions, guard I2).
- **Transposition.** The shifted card is simply a card with a new number: the spell it joins must be valid with that number, and its type is decided by how you build it — LEARN, EMPOWER (including a conversion) and RESHAPE read the new number like any other. **It cannot change the type of a spell that is already built**, and nothing is re-checked at evaluation: spells score as they stand. Example: Spellbook run 10-11-12-13; hand Flux 4, Void 4, Radiance 15. Banish both 4s, shift Radiance 15 to 14, EMPOWER the run to 10-14 (1 counter). Wilds can't be shifted (they already are whatever the spell needs). Enchantments still obey the size cap (max 4 at 2–4p, 5 at 5–6p); gained capacity arrives at the start of your next turn as normal.
- **Sundering.** Exactly 3 components, so only small spells can go. "Table value" is the v3.2 score table: 3-card Conjuration 0, Transfiguration 3, Perfect Transmutation 5, Enchantment 4. The capacity check mirrors the base affordability gate without the action cost (a Rite costs no counter).
- **Silence.** Takes one of your two Rites and 3 cards to deny one Rite.
- **Long Dusk.** The 2 cost components are banished, not added. Cards added from hand are face down. It adds at most one card per player, so it lengthens the Drought by at most one round.

---

## Drought length — desk check (v0.2)

How many Drought turns does each player actually get? Rites need no counters, so **Rite opportunities = your Drought turns**.

**Formula.** Released Reserve size **R = 5** (the Array) **+ N** (binding, 1 per player) **+ D** (cards discarded to the Arcane Reserve before the Drought — in the base game only Transfiguration and Perfect Transmutation exchanges discard: 2 cards for a 3-card spell, 1 for 4+). Each Drought turn draws 1 card, and the draw of the last card ends the game at once, so **live Drought turns = R − 1**, shared round the table starting with the player after the one who emptied the Source.

**Inputs.** Deck 62 cards (2–4p) / 79 (5–6p); 7 cards dealt each; 5 in the Array. Pre-Drought turns per player come from the simulation rig (`simulation/RESULTS.md`, Option 2 = the live decks: 10.7 / 7.1 / 4.8 / 5.5 / 4.0 at 2 / 3 / 4 / 5 / 6 players). The rig does not model Transfigurations, so D is an assumption, in three cases: **f** = cards discarded to the Reserve per table turn = **0** (nobody casts a Transfiguration), **0.25** (about one 4+ Transfiguration cast every four table turns), **0.5** (an active Transfiguration player). Each such cast also takes one extra Source card (the Array refill), which shortens the pre-Drought: turns = Source ÷ (base Source use per turn + f).

**Working (2p example).** Source = 62 − 14 − 5 = 43 cards over 21.4 turns = 2.0 cards per turn. At f = 0.25: 43 ÷ 2.25 ≈ 19 turns, D ≈ 5, R = 5 + 2 + 5 = 12, live turns 11 → 5.5 each.

| Players | Source at start | f = 0: R → live turns each | f = 0.25: R → each | f = 0.5: R → each |
|:--:|:--:|:--:|:--:|:--:|
| 2 | 43 | 7 → **3.0** | 12 → 5.5 | 16 → 7.5 |
| 3 | 36 | 8 → **2.3** | 13 → 4.0 | 16 → 5.0 |
| 4 | 29 | 9 → **2.0** | 13 → 3.0 | 16 → 3.8 |
| 5 | 39 | 10 → **1.8** | 16 → 3.0 | 20 → 3.8 |
| 6 | 32 | 11 → **1.7** | 16 → 2.5 | 20 → 3.2 |

(Long Dusk adds up to N more cards; Grave-Song and the Gravewright set-aside are clock-neutral.)

**Seat effect.** Live turns don't divide evenly. Example, 6p at f = 0: 10 live turns → the four players after the trigger get 2, the last two (including the player who emptied the Source) get 1. The player who empties the Source tends to get the fewest Drought turns.

**Session evidence.** None of the four session logs records the number of Drought turns. Session 1 (2p) describes the Drought as "take cards one at a time" (both players held 4-card Enchantments), which fits a multi-turn 2p Drought; Session 4 (2p) used it for a last-turn giant RESHAPE (since priced at one counter per spell). The sim lets the player who draws the last card finish Learning; the rulebook ends the game at once — the table above follows the rulebook.

**Conclusions.**
- **2 players: 2 Rites each is achievable** in every case (at least 3 live turns each), and the cap of 2 really binds. No design change needed at 2p. Row: 8 Rites for at most 4 performances — a puzzle, not a race.
- **3–4 players:** achievable for most players; at f = 0 it means riting on both of your two turns, so only a pre-built hand gets two.
- **5–6 players:** with few Transfigurations, some players get **only one** Drought turn. The cap of 2 doesn't bind there; turns and the row do (10–19 live turns for 8 Rites). The Long Dusk is the release valve. **No rule change in v0.2** — a per-count cap would add a rule for a problem the row already limits; flagged as an open question and a playtest measure instead.

---

## Value table (v0.2, on the v3.2 score table)

What a hand card is worth otherwise, for comparison: in the Drought a spare card either grows a spell (the score-table step for one more component) or is worth 0. A loose 3-of-one-energy is a 0-point 3-card Conjuration in v3.2. One more component is worth: Conjuration +1 (sizes 3→6), +4 to +13 (6→13), +16 (13→14), +21 (14→15); Transfiguration +1 to +7, +10 (14→15); Perfect Transmutation +6 to +12, +3 (14→15); Enchantment 3→4 +6.

| Rite | Components removed | v0.1 text on the v3.2 table | v0.2 value | RP per component | Notes |
|---|:--:|---|---|:--:|---|
| Binding | 2 (hand) | +2 | **+2** + lock | 1.0 | Unchanged. Lock costs little: RESHAPE now costs a counter per spell anyway. |
| Final Pattern | 3 (hand) | +1 size: Conjuration +1…+21, Transfiguration +1…+10, PT +3…+12; undefined at size 15 and for a 4-card Enchantment at 2–4p | **+5 flat** (needs a 6+ spell) | 1.7 | The flagship Rite; 3 off-energy cards are otherwise a 0-point Conjuration. |
| Ash | whole hand (≥3) | +1 per 2, max +4 | **unchanged** | 0.5 | A last-live-turn dump; hand cards score 0 at evaluation. |
| Grave-Song | 1 (hand) | filtered draws | **unchanged** | — | Worth about (your remaining Drought turns) better picks; strongest at 2p, weak at 5–6p. |
| Transposition | 2 (hand) | nothing (no legal useful placement) | **one card ±1, learned this turn** | — | Gains one component in a run or Enchantment: Transfiguration +1…+10, PT +3…+12, Enchantment 3→4 +6. Never helps a Conjuration (energy, not number). |
| Sundering | 3 (a spell) | value +3 (net +3; a 3-card Conjuration 0 → 3) | **value +4 (net +4)** | 1.3 | Net gain is flat; you also lose the spell's growth, a spell for the tiebreak, and an Enchantment's capacity. |
| Silence | 3 (hand) | denies one Rite | **unchanged** | — | Max denied value is now about +5 (no Rite is worth +21 any more). |
| Long Dusk | 2 (hand) | +0…N Released Reserve cards | **unchanged** | — | At most one more round. |

**Why these numbers.**
- **Final Pattern +5.** Mid-size Conjurations and Perfect Transmutations (6–10 components) gain about +4 to +9 from one more component (Transfigurations +1 to +3) on the v3.2 table, so +5 keeps the Rite's typical value while removing the top tail. Flat means the same reward for any spell of 6+, so it gives no reason to concentrate. +5 sits above Binding (+2, cheaper and keeps the spell) and Sundering (+4, no hand cards needed), below what the same 3 cards would earn if they fit your own big spell — so players only use off-energy cards, which is the intended "dead cards into one last working".
- **Sundering +4.** Banishing a spell should pay at least 1 RP per component; +3 for 3 cards was below Final Pattern's rate once a junk 3-card Conjuration became worth 0 (in v3.2 three spell cards and three hand cards are close to interchangeable, because UNLEARN returns them the same turn). It can't reopen 3-card Conjuration parking: the Rite exists once per game, so at most one such spell per game earns anything.
- **Binding +2** stays the cheap Rite. **Ash** keeps its cap: 8 cards for +4 is below any spell's rate.

**Concentration check ("one 15-card spell").** The v3.2 table makes Conjuration 14→15 worth +21. In v0.2 no Rite adds a component or a size to a spell (design rules 4 and 6), Transposition can't help a Conjuration (it changes numbers, Conjurations need an energy), and Final Pattern pays the same +5 to any 6+ spell. The only help toward a 15th card is Grave-Song's filter (one card in three, once per turn) — the same kind of help the base game's draws give. No Rite makes the concentrated play stronger than it already is in v3.2.

---

## Interactions with The Schools ([[Expansion - The Schools (v0.2)]])

Both files agree on these guards (Schools G1/G2):

- **I1 — Spells score and count as built.** No Rite changes a spell's size or type (design rule 6). Final Pattern and Binding record flat points; Schools Leans count actual components and spell types as built. A Transposition card is an actual component with its shifted number; Leans count components, types, energies and wilds, never numbers, so the shift changes no Lean. A sundered spell is gone and counts for nothing; banished cards are gone.
- **I2 — One modifier per draw.** The Gravewright's set-aside card (picked from the Arcane Reserve when the Drought begins, before the shuffle) replaces one Collection draw and is not a draw from the Released Reserve: Grave-Song does not apply to it. Grave-Song applies to the Gravewright's later draws as normal.

| School | Contact with the Rites | Ruling |
|---|---|---|
| Gravewrights | Grave-Song (July audit watch item). The v0.1 "pre-seed the Reserve, then Grave-Song it" combo never worked — the Drought shuffles the Arcane Reserve — and the Schools v0.2 talent is now a one-card set-aside at the Drought start. Lean (+2 for the largest spell) | I2. A Gravewright with Grave-Song has the best Drought draws at the table, at the cost of a School pick and one of two Rites: accepted, watch item. The set-aside is clock-neutral, so the Drought-length table is unchanged. Lean: Final Pattern no longer adds size, so it can't win "largest spell". |
| Ashbinders | 3-card Transfigurations discard 1 instead of 2 | Shrinks D, so slightly shorter Droughts — fewer Rite turns. Lean: Sundering a 3-card Transfiguration loses its +1. |
| Depthseekers | Draw 3 on a 6+ Conjuration | The Source empties sooner; the Released Reserve is unchanged. Lean (+2 per 6+ Conjuration) and Final Pattern (needs a 6+ spell) both reward one 6+ spell, flat — no concentration push. |
| Archivists | Lean +2 for 4+ spells | Sundering can drop you below 4: a real trade-off. Talent sleeps in the Drought. |
| Chronomancers | Delayed pick becomes a Drought draw if the Source runs dry mid-Casting | That turn is still the trigger turn, not a Drought turn: no Rite on it. |
| Menders | UNLEARN Array swap | Sleeps in the Drought (no Array), so it never feeds a Rite cost. |
| Harmonists | Lean per energy | Banishing hand cards doesn't change it; Sundering may. |
| Lucent Order | EMPOWER re-declares wild numbers; Lean +2 per wild | Transposition can't target a wild. A wild spent on a Rite cost leaves the Spellbook count (owner's choice). Binding stops EMPOWER, so Lucent can't touch a bound spell. |
| Any | Schools design rule 5 | Rite of Ash is still the only thing that converts the hand to points; no Lean scores the hand. |

---

## Iteration log — bugs found and fixed before v0.1

- **B1 — Paying costs into the Released Reserve broke the clock (the big one).** The original sketch had Rites "feeding magic back to the dying world" — costs shuffled into the Released Reserve. But the Reserve's depletion *is* the end-of-game trigger: heavy Rite play would extend the game, light play shorten it, and a trailing player could chain-Rite to postpone the ending indefinitely-ish. **Fix:** all costs are **banished**; the fiction becomes "consumed utterly." The clock is deliberately contestable in exactly one place, at one bounded size, by group consent: the Long Dusk (see B6).
- **B2 — Rites-as-learning-actions taxed the wrong players.** If a Rite costs a learning action, capacity leaders rite freely and 1-counter players choose between riting and learning — re-coupling the endgame to the economy. **Fix:** design rule 1; separate once-per-turn allowance.
- **B3 — First-come-first-served favoured whoever sat after the Drought trigger.** The player whose turn follows the trigger gets first pick of all 8 Rites. Partially structural (someone must go first) — **mitigations:** max 1 per turn / 2 per game (a first mover can't sweep), costs are steep enough that riting turn one of the Drought means having *pre-built* the hand for it (a genuine all-game plan, which is the expansion's point), and Grave-Song/Long Dusk get better later, flattening the early-pick premium. **Residual risk accepted and flagged for the playtest** (measure: RP earned from Rites by Drought-seat position).
- **B4 — Spell-type conversion at evaluation created illegal states.** An early Rite ("one spell scores as a different type") invited un-checkable arrangements and Trials domain chaos. **Fix:** replaced by Final Pattern and Transposition. *(v0.2: both reworked again — R1, R3.)*
- **B5 — Grave-Song as written accelerated the clock.** "Draw 3 extra, keep 1" depleted the Reserve 2 cards faster per use. **Fix:** it *replaces* the normal Collection draw (look 3, take 1, return 2) — strictly clock-neutral, still the strongest engine Rite, now costed at only 1 card because its value is spread over turns.
- **B6 — The Long Dusk forced discards (feel-bad) and was compulsory.** **Fix:** voluntary per player — trailing players accept, leaders decline; the clock is only ever extended by the people who want it extended.
- **B7 — Sundering double-dipped with Trials.** **Fix:** Trials rider zeroes the sundered spell's domain contribution.
- **B8 — Silence was a kingmaker at 2 cost.** **Fix:** cost raised to 3-of-one-energy — denial is a real sacrifice of your own endgame, and it uses one of your two Rites.
- **B9 — Binding + Transposition on the same spell.** Ruled: legal; binding stops *actions*, not markers. *(v0.2: still true; the Transposition card is now placed by a normal LEARN/EMPOWER before any binding.)*

## Iteration log — v0.2 refresh against rulebook v3.2

- **R1 — Final Pattern paid most for one huge spell.** "Scores as one size larger" read the v3.2 table, whose top steps are steep (Conjuration 13→14 +16, 14→15 +21). Combined with a last-turn RESHAPE into one Conjuration, it rewarded exactly the end-game concentration v3.2 removed. It was also undefined for a 15-card spell (no row 16) and for a 4-card Enchantment at 2–4p (the 5-card row is 5–6p only). **Fix:** flat +5, needs a 6+ spell, spell unchanged (design rules 4 and 6).
- **R2 — Sundering re-priced and tied to v3.2 capacity.** +3 was below the other Rites' rate once a 3-card Conjuration scores 0 (see the value table). **Fix:** +4; may not take a bound spell; an Enchantment's capacity is lost immediately, gated like the base affordability rule (no action cost).
- **R3 — Transposition had no useful legal placement.** Shifting any card already in a run or an Enchantment by ±1 makes the spell invalid (so the v0.1 validity check always refused it), and in a Conjuration the number doesn't matter. **Fix:** shift a hand card and learn it this turn; the number is real for all rules while it stays in your Spellbook. It can't change an existing spell's type and nothing is re-checked at evaluation. Can't target wilds (flexible wilds already take any number in a sequence).
- **R4 — When is the Drought?** v3.2 lets the Source run dry mid-turn; the active player then goes to Learning. **Fix:** Rites only on turns that start after the Drought began, so the first-pick rule (B3) stays as designed.
- **R5 — Immediate end.** The draw that empties the Released Reserve ends the game at once, so that player gets no Rite — stated on the reference card; it matters for Ash ("perform on your last *live* turn").
- **R6 — Wilds in costs.** v3.2 wilds never declare an energy. **Fix:** a wild pays for any one component of a cost.
- **R7 — Binding vs v3.2 EMPOWER.** EMPOWER may convert a spell type again (A6 dropped). **Fix:** Binding names conversion and Sundering explicitly.
- **R8 — Small wording fixes.** Grave-Song with fewer than 3 cards; Silence can't target itself; Long Dusk goes round from the performer; Performed / Binding / Transposition markers are coins for paper play.

## Open questions for Sam (design, paper)

1. **Final Pattern:** flat +5 for a 6+ spell (recommended), or keep "one size larger" but only for spells of 12 or fewer components (keeps the table flavour; still worth up to +13)?
2. **Sundering +4** (recommended) or keep +3?
3. **Transposition rewrite** (shift a hand card, learn it this turn) — approve, or cut the Rite and replace it?
4. **5–6p short Droughts:** some players get one Drought turn. Accept for the first test (recommended; the Long Dusk is the valve), or let the player who empties the Source perform a Rite on that turn (gives them back a turn, but rewards racing the Source)?
5. **Grave-Song at 2p:** returning rejects on top lets you choose your opponent's next draw. Keep (recommended, it's the Rite's bite) or return them to the bottom?

## Open questions (for the playtest)

- **Is 2 Rites per player the right lifetime cap?** Desk check: it binds at 2p, rarely at 5–6p.
- **Does the row actually shape early-game play** (the design's central promise), or do players ignore it until the Drought? Measure: does anyone hold cards they'd otherwise spend, citing a Rite?
- **Rite of Ash vs. hand-building:** is it ever right before your last live turn?
- **Drought length:** log, per player, pre-Drought turns, Drought turns, who emptied the Source, and how many cards were discarded to the Arcane Reserve (that number is D in the desk check).
- **Seat position:** RP from Rites by Drought seat (B3), and whether the player who empties the Source feels short-changed.

## Scaling 2–6

The row is always 8 Rites; scarcity scales naturally (2p: 8 Rites for at most 4 performances = low contention, a puzzle; 6p: 8 for up to 12, but only about 10–19 live Drought turns = a genuine race). If 5–6p testing shows the row stripped by round two of the Drought, the extension box adds 2 more Rite cards (slots 9–10) rather than changing any rule. Costs are count-agnostic by design rule 3; the Enchantment size cap (4 at 2–4p, 5 at 5–6p) applies unchanged.

## Interaction with the four spell types (v3.2)

- **Conjuration:** dormant in the Drought. A 3-card Conjuration scores 0, which makes it natural Sundering fodder (+4) or, unlearned to hand, a Final Pattern cost. Big Conjurations get no Rite help toward size 15.
- **Transfiguration:** Transposition is the sequence-builder's Rite (finish the run you never drew). Every Transfiguration cast before the Drought also lengthens the Drought (its discards join the Released Reserve).
- **Perfect Transmutation:** Transposition can add a component (+6 to +12 mid-table; only +3 at 14→15). Final Pattern pays it the flat +5 like any 6+ spell.
- **Enchantment:** Rites don't consume capacity, so Enchantment investment keeps its base-game value. Binding locks an Enchantment's capacity in; Sundering a 3-card Enchantment loses its +1 counter at once; Transposition can supply a 4th matching card (max 4 at 2–4p), its capacity arriving next turn as normal.
- **Spell Duels:** zero contact (duels off in the Drought).
