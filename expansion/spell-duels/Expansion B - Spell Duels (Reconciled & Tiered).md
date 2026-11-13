---
title: Expansion B - Spell Duels (Reconciled & Tiered)
type: expansion-ruleset
status: shelf-ready-untested
created: 2026-07-02
supersedes:
  - "[[Expansion B - Spell Duels (Deep Dive)]]"
  - "[[Expansion B - Spell Duels Alternative (Resonance Gambits)]]"
  - "[[Expansion B - Spell Duels (Bold Effect Directions)]]"
relates_to:
  - "[[Expansion Concepts - Player Interaction]]"
  - "[[Archmage Ascension - Complete Rulebook]]"
  - "[[EXPANSION_INDEX]]"
---

# Spell Duels — Reconciled Ruleset & Complexity Tiers

This document reconciles the three Spell Duels notes files into one coherent design, flags every contradiction and open question found between them, and then lays the expansion out as **five complexity tiers** — from deliberately-too-thin to deliberately-too-much — so the right stopping point can be found by testing, not by guessing.

> **Stage gate (unchanged):** nothing here is Stage-3 work. Zero playtests exist for any version of Spell Duels. This is shelf-ready design, to be tested only after the capacity/counter fix is validated.

> **Deck model (revised 2026-07-02):** the base game is **2–4 players, four energies × 1–15 + 2 wilds**. The **5–6 player extension** adds **Echo 1–15 + 2 wilds** as a fifth full suit. There is no 1–20 deck and no 7-player count. Every tier below runs identically in both configurations; the only extension-specific rule is how Echo strikes declare forms (§ "Echo in a duel"). Values are always 1–15, so all band maths, wild values, and scaling notes use one deck range.

---

# Part 1 — Reconciliation

## 1.1 The settled chassis (all three documents agree)

These elements survived every iteration pass and are the fixed spine of every tier below:

1. **Frequency is duel power.** Higher frequency wins the clash; the defender wins exact ties. No bands gate *which* effects you may use (bands return only to scale effect *size* at higher tiers — see contradiction C3).
2. **Neighbour-only targeting.** You can only Channel at a player adjacent in seating. The structural firewall against dogpiling.
3. **Yield / Answer.** The defender always has a free off-ramp (Yield) and a card-risking counter (Answer). Defence is never mandatory hand-bleed.
4. **Committed-card spoils only.** A card can only change hands if its owner committed it to the duel. No hidden-hand theft, ever.
5. **Warded.** After being targeted, a player can't be targeted again until the start of their next turn. Caps focus-fire at every count.
6. **Duels are off in the Drought.** The endgame stays a calm optimisation. (Tier 4 bends the *approach* to the Drought, not the Drought itself.)
7. **Never destroy a built spell. Never attack capacity.** Planning stays safe; the fragile counter economy is never leaned on.
8. **No new card deck.** Strikes and guards are the energy components already in the game.

## 1.2 Contradictions found between the three files (and rulings)

| # | Contradiction | Deep Dive says | Gambits says | Bold Directions says | Ruling |
|---|---|---|---|---|---|
| **C1** | **Cost to duel** | Spends one cast action (a counter) | Free — costs no counter; the risked card is the cost | (silent — inherits Gambits) | **Free.** Coupling duels to counters makes duel access scale with the exact economy still under repair, and taxes low-capacity players hardest. Cast-action cost survives only as a Tier-5 dial. |
| **C2** | **Timing in the turn** | *In place of* casting one spell, during Casting | *After* all casting, before Recall | (silent) | **After casting, before Recall.** Follows from C1: if duels don't spend a counter, they can't occupy a cast slot. Also keeps the duel beat in a predictable place for teaching. |
| **C3** | **What frequency bands do** | Bands **gate** which effect you may attempt (High unlocks Siphon) | Bands are **banned**: "do not use frequency bands to unlock harsher effects" | Bands **scale the magnitude** of one effect (Low/Mid/High thirds) | **Both later documents are right, about different things.** Gating effect *type* behind bands is dead (arbitrary, rewards hoarding). Scaling effect *size* by band is alive and used from Tier 3 up. The two files don't actually conflict once gate vs. scale is named — but no file says this explicitly, so it's ruled here. |
| **C4** | **Reveal procedure** | Sequential and face-up (strike shown, then guard chosen); simultaneous reveal listed as a *slower, optional* dial | Face-down commits, simultaneous reveal, as **baseline** | (silent — inherits Gambits) | **Face-down, simultaneous.** The blind guess ("is that strike a 3 or a 13?") is where the bluffing lives, and it makes Yield a real decision instead of arithmetic. The Deep Dive's downtime worry is kept as an explicit playtest measure (see every tier's watch list); the "Open guard" face-up dial is the fallback if duels drag. |
| **C5** | **Wild cards in a clash** | Wild = any value you choose *up to deck maximum* (auto-wins as attacker, auto-ties as defender) | Wild = **one below deck maximum**; natural top card still beats it | (silent) | **One below maximum — always 14** under the single 1–15 deck. An unbeatable card deletes the guessing game the module runs on. |
| **C6** | **The defence mechanism itself** | Guard must be **≥ strike to repel**, else strike lands and guard is wasted — repelling costs *at least* what the attacker paid | Answer wins on **higher-or-tie**, and the *winner takes spoils* — defending can be profitable | (silent) | **Gambits' version.** The Deep Dive's "guard ≥ or wasted" makes defending strictly punitive, which pushes everyone toward permanent Accept/Yield and kills the clash. Defender-wins-ties + spoils makes Answering attractive exactly often enough. |
| **C7** | **The effects themselves** | Destabilise (−1 capacity), Suppress (spell can't cast), Siphon (hand theft) | All three rejected: Destabilise attacks capacity, Suppress is binary denial, Siphon is hidden-hand theft. Replaced by Flare/Dampen/Displace/Echo | Replace the Gambits forms with bolder wins (Elemental Powers / Marks / Bend the Magic) | **Destabilise, Suppress, and Siphon are dead at every tier** — each violates a guardrail in §1.1. The Gambits forms are the Tier-2 baseline; Bold's directions are Tiers 3–5. The Deep Dive's *chassis* thinking survives; its *effects menu* does not. |
| **C8** | **Which version to test first** | (implicitly itself) | "Use Resonance Gambits as the preferred baseline... keep the deep-dive version as a more aggressive variant" | "Prototype Direction 1 (Elemental Powers), and steal the Drought tug-of-war" | **Neither recommendation wins — the tier ladder replaces the question.** Testing starts at Tier 1 and climbs until it breaks. Gambits' forms are Tier 2; Elemental Powers are Tier 3; the tug-of-war is Tier 4. |
| **C9** | **⚠ The "Echo" name collision** | — | Names the Aether form **Echo**, with **Echo tokens** | (inherits the name) | **Renamed.** The fifth energy is called **Echo** (`_review/VISUAL_SYSTEM_with_Echo.md`) — and under the revised deck model it is a *printed reality* at 5–6 players, not parked design space, so the collision is no longer hypothetical. The Aether form is now **Imprint** (Imprint tokens). Pure rename — zero mechanical change. |
| **C10** | **Source-clock discipline** | (not analysed) | Major fix: only Flare (and a triggered Imprint) may draw from the Source, so duels barely move the Drought clock | Illuminate, Resonate, and Devour-High all touch the Source again | **The Gambits discipline is the rule; Bold's Source-touching is a *budgeted exception*.** At Tier 3 the Source-touch per duel is bounded to ~1 card and the token throttle caps total duels, so worst-case clock drift is small and measurable. Clock drift vs. baseline is a mandatory measure at Tiers 3–5. |

## 1.3 Open questions (no file resolves these — testing must)

- **Q1 — Flux dominance.** Gambits flags Displace's two-swap win as the strongest form effect, and Bold's Transmute (free Learn/Empower with ±1 nudges) is the strongest Tier-3 power. Both convert duel wins directly into building progress. *Watch: does the Flux form become the default declaration?* Levers: one-swap Displace; Transmute nudges only 1 component regardless of band.
- **Q2 — Transmute vs. the learning economy.** The guardrail says "never attack capacity" — but Bold's Transmute *grants* a free learning action, touching the same economy from the generous side. Nobody has checked whether a free, counter-less Learn/Empower breaks the round-trip counter redesign currently being validated in the base game. Must be re-checked against whatever counter fix lands.
- **Q3 — Does Yield need any sting?** At Tier 1, Yielding costs the defender nothing at all and the attacker a card — attacking may be strictly bad. At Tier 2+, form Yield-effects fix this. If Tier 1 tests limp, that's the expected cause, not a chassis failure.
- **Q4 — Imprint vs. flexible builders.** Gambits admits Imprint (né Echo) is strong against every-turn engines (big Conjurations, PTs) and weak against builders who can just hold a spell back. Accepted variance for a gentle effect — but confirm it doesn't read as "this form does nothing."
- **Q5 — Drought tug-of-war vs. the clean endgame.** Tier 4 makes the *timing* of the Drought contestable while keeping the Drought itself duel-free. That honours the letter of "duels off in the Drought" but not obviously its spirit (the leader hastening the clock is a new way to press an advantage near the end). No file examines this tension; Tier 4's watch list owns it.
- **Q6 — Interaction with The Living Array.** Displace's swaps and Command-the-Array assume base-game refill timing. If ever combined with Expansion A, re-derive. (Out of scope for current planning, recorded so it isn't lost.)
- **Q7 — 2p gentle spoils.** The 2p default (winner never takes the opponent's committed card) is a reviewer judgement, never tested. Confirm 2p duels still have enough stakes to bother.

---

# Part 2 — The Tier Ladder

Five tiers, cumulative unless stated. Each is a complete, playable stopping point. The ladder is built to overshoot at both ends **on purpose**: Tier 1 should feel almost too thin to be an expansion, Tier 5 should feel like too much game. Where it stops feeling thin and starts feeling heavy — that's the product, and it gets found at the table.

| Tier | Name | One-line | Adds | Teach time | New components |
|---|---|---|---|---|---|
| **1** | **Sparring** | The bare clash — cards are the only stakes | Clash, Yield/Answer, spoils, Warded | ~2 min | Warded tokens only |
| **2** | **Resonance Gambits** | Energy decides *what*, frequency decides *who* | Four energy forms (Flare / Dampen / Displace / Imprint) | ~5 min | + ref cards, Imprint tokens |
| **3** | **Elemental Powers** | Wins become signature wizard powers, scaled by band | Illuminate / Devour / Transmute / Resonate; Gambit-token throttle | ~7 min | + Gambit tokens |
| **4** | **The Failing Magic** | The clock itself becomes the prize | Bend option: hasten/stall the Drought, command the Array, seed the Source, seize the seat | ~9 min | + turn/seat marker |
| **5** | **The Resonance War** | Duels gain a memory that pays off at scoring | Resonance Marks (Tithe / Aegis / Beacon) + Overload + Summed Strikes | ~15 min | + Mark tokens per player colour |

**Shared frequency bands (used from Tier 3 up):** thirds of the 1–15 range — **Low 1–5 / Mid 6–10 / High 11–15** — at every player count. Bands never gate; they only scale.

## Echo in a duel (5–6 players, Echo extension in the deck)

The clash itself needs no rule: an Echo component strikes and guards by its frequency like any other card. The only gap is **form declaration** (Tiers 2–3), where forms are keyed to the four base energies. Ruling:

> **An Echo strike may be declared as any of the four forms.** Echo is resonance answering resonance — it takes the shape of whatever it meets. (Guards were always any-energy; nothing changes there.)

Consequences and safeguards:

- Echo cards become slightly premium *duel* cards (form-flexible at natural frequency, unlike wilds they don't lose a point). Bounded: ~1-in-5 of the deck, and Echo cards are simultaneously the extension's most contested *building* cards, so the flexibility has real opportunity cost. **Watch at 5–6p: are Echo cards being hoarded as ammunition instead of built?** If so, the dial is *"an Echo strike resolves at −1 frequency"* (mirrors the wild rule's logic).
- **Rejected alternative, kept on record:** a fifth Echo-only form ("Resound" — copy the effect of the last form resolved this round). More flavourful, but it adds a memory element and a fifth table row for a card that's absent at 2–4p — a rules asymmetry between configurations that this module doesn't need. Revisit only if mimic-Echo tests flat.
- Tier 1 needs nothing: no forms exist there.
- Tiers 4–5 need nothing: Bend options and Marks aren't energy-keyed. (Tier 5's **Beacon** may name Echo as its energy at 5–6p — legal, and worth one balance glance since Echo cards are contested.)

---

# Tier 1 — Sparring
### Deliberately minimal. If this tier feels like a complete expansion, everything above it is optional garnish.

## Complete rules

**When.** During your Casting phase, after you have finished casting spells and before Recall, you may **Channel** one clash at an adjacent player who does not hold a Warded token. Once per turn. Never during the Drought. Channelling costs no counter.

**The clash.**

1. **Strike.** Play one component from your hand face-down.
2. **Defender chooses:**
   - **Yield** — plays nothing. Your strike is revealed and goes to the Arcane Reserve. Nothing else happens.
   - **Answer** — plays one component from their hand face-down. Reveal both together.
3. **Compare frequency.** Higher wins; **defender wins ties**. A wild counts as **14** and its owner names its energy on reveal.
4. **Spoils** (only if the defender Answered). The winner takes **one** of the two committed cards into hand; the other goes to the Arcane Reserve. **At 2 players:** both committed cards go to the Arcane Reserve instead — the winner never takes the loser's card.
5. **Warded.** The defender takes a Warded token (whether they Yielded or Answered). They cannot be targeted again until the start of their next turn, when they discard it.

That is the entire tier. No effects, no forms, no reference card needed.

## New components

- Warded tokens (1 per player + spares). Nothing else.

## Interaction with the four spell types and the Drought

- **Conjuration:** untouched mechanically; its card flow becomes duel fuel, making Conjuration engines slightly more valuable.
- **Transfiguration / Perfect Transmutation:** untouched. The only pressure is indirect — a mid-sequence card you're holding is also a mid-strength duel card, so sequence-hoarders now leak information when they refuse to Answer.
- **Enchantment:** completely untouched — no capacity interaction of any kind. This tier is safe to test even while the counter fix is still settling (though don't).
- **Drought:** duels off; zero residue (no tokens persist except an expiring Warded).

## Scaling 2–6

- **2p:** gentle spoils (above) makes this *very* thin head-to-head — essentially a bluffing tax. Expected to under-deliver at 2p; that's data, not failure.
- **3–4p:** two live neighbours each; the sweet spot even at this weight.
- **5–6p (Echo extension):** fine — local skirmishes, Warded prevents pincers. Echo cards need no special rule at this tier (frequency is frequency).

## First playtest — watch for

**Could break:**
- **Attacking may be strictly bad (Q3).** Yield costs the defender nothing; the attacker always risks a card for, at most, a card. If nobody Channels by mid-game, the tier is under-fuelled — expected, and exactly what Tier 2's Yield effects exist to fix.
- **Pure card-poker reads as un-thematic** ("why am I doing this?"). Listen for players narrating it as magic vs. narrating it as poker.

**Success looks like:**
- Players Channel ~1–3 times each per game *without prompting*, and the Yield/Answer guess produces table noise (groans, laughs) at least once.
- A duel resolves in **under 30 seconds** (Gambits' pass condition, inherited).
- Someone holds a high card back from a spell *specifically* as duel insurance — the build-or-bank tension exists even with no effects at all.
- Nobody checks the rulebook after the second duel.

---

# Tier 2 — Resonance Gambits
### The reconciled baseline. Everything in Tier 1, plus: the energy you strike with decides what winning *does*.

## Complete rules (delta from Tier 1)

**Declare a form before committing your strike.** Your strike card must match the declared energy (a wild may be declared as any energy; at 5–6p an **Echo** strike may be declared as any form — see "Echo in a duel" above). If the revealed strike doesn't match the declared form: an Answering defender auto-wins; against a Yield the strike simply fizzles to the Reserve.

**If declaring Imprint,** also name one **non-Enchantment** spell in the target's Spellbook (Enchantments are never cast, so they can't be Imprinted).

Resolution order: reveal → compare frequency → **spoils** (as Tier 1) → **form effect** → Warded.

| Form (energy) | Yield (defender played nothing) | Strike win | Parry win (defender) |
|---|---|---|---|
| **Flare** (Radiance) | Attacker draws 1 from the Source, then discards 1 to the Reserve | Attacker draws 1 from the Source | Defender draws 1 from the Source |
| **Dampen** (Void) | Target discards 1 from hand (their choice) to the Reserve | Target discards 1 (their choice) | Attacker discards 1 (their choice) |
| **Displace** (Flux) | Attacker swaps 1 hand card with 1 Array card (no Source replacement) | Attacker swaps up to 2, one at a time | Defender swaps up to 2, one at a time |
| **Imprint** (Aether) | Attacker places an Imprint token on the named spell | Attacker places an Imprint token on the named spell | Defender may place an Imprint token on one of their own non-Enchantment spells |

**Imprint tokens.** You may own at most one Imprint in play. The next time the marked spell is cast, after it resolves, the Imprint's owner draws 1 from the Source then discards 1 to the Reserve; remove the token. Remove it unresolved if: the spell isn't cast before the start of the owner's next turn, or the spell is Unlearned/Reshaped away. Its value is the **fork**: the target either casts and feeds you a filter, or self-imposes a one-turn hold — both bend their turn.

**Source-clock discipline:** Flare and a *triggered* Imprint are the only Source draws in the tier. Dampen and Displace never touch the Source.

## New components

- 1 reference card per player (form table + resolution order)
- Imprint tokens (~6–10)

## Interaction with the four spell types and the Drought

- **Conjuration:** Flare partially overlaps Conjuration's identity (Source draws). Watch that Conjurations still feel special; if Flare is spammed, its filter (draw-then-discard on Yield) is the lever.
- **Transfiguration:** Displace adds Array volatility in both directions — it can wreck or gift the exact card a sequence-builder needs. Net effect on Transfiguration viability is the tier's biggest unknown (Q1).
- **Enchantment:** still zero capacity interaction. Dampen pressures the *hand*, which slows enchantment assembly slightly — acceptable, measurable (track enchantment uptake vs. baseline).
- **Perfect Transmutation:** the juiciest Imprint target (fires every turn, hates holding back). Intended — Imprint never stops the spell.
- **Drought:** duels off. If a Gambit effect draws the last Source card: finish the Gambit, trigger the Drought, remove all Imprint tokens (no stable channel to resolve them).

## Scaling 2–6

- **2p:** gentle spoils stays the default. Watch Dampen — if repeat-Dampen oppresses, add the dial *"you cannot declare Void against the same target on consecutive turns."*
- **3–4p:** sweet spot. Warded guarantees nobody eats both neighbours before acting.
- **5–6p (Echo extension):** more duels per round in absolute terms — watch total added minutes (target: expansion adds <10 min at 6p) — and watch whether mimic-Echo strikes dominate declarations (see "Echo in a duel").

## First playtest — watch for

**Could break:**
- **Displace dominance (Q1)** — if Flux is declared in >40% of duels, install one-swap Displace.
- **Source-clock drift** — count the turn the Drought triggers vs. a baseline game; more than ~1 round earlier means Flare needs its filter extended to all outcomes.
- **Imprint fizzle (Q4)** — if Imprint tokens routinely expire unresolved *and* nobody minds, the form is dead weight; sharpen (owner draws without discarding) or accept as the gentle option.
- **Downtime (C4)** — the face-down guess must stay snappy; if duels drag past ~45 s, switch to the face-up "open guard" dial before cutting anything else.

**Success looks like:**
- All four forms get declared over a session (no dead form, no default form).
- At least one Imprint fork visibly changes a target's turn (they hold a cast back, or grumble and feed the filter).
- Enchantment uptake and completed-spell counts stay within noise of the no-expansion baseline.
- Players start reading neighbours' hands from their declarations ("she's holding Void, don't fatten your hand").

---

# Tier 3 — Elemental Powers
### The forms become signature powers. Frequency bands return — to scale wins, never to gate them.

## Complete rules (delta from Tier 2)

**The four forms are replaced** by the powers below. Band (Low/Mid/High third of your *winning* card) scales the win. At 5–6p, an **Echo** strike may channel any of the four powers ("Echo in a duel" rule, unchanged).

| Form (energy) | Win effect (Low / Mid / High) | Yield | Parry win (defender) |
|---|---|---|---|
| **Illuminate** (Radiance) | Scry the top **2 / 3 / 4** of the Source; take 1 to hand; return the rest in any order | Scry 2, take 1 | Defender scries 2, takes 1 |
| **Devour** (Void) | Loser **banishes** 1 component of their choice from hand — removed from the game, *not* to the Reserve. High: also banish the top card of the Source | Loser banishes 1 (their choice) | Attacker banishes 1 of their own (their choice) |
| **Transmute** (Flux) | Take a free **Learn or Empower** now, treating up to **1 / 2 / 3** involved components as ±1 value (resolve immediately; no lingering altered values) | Free Empower, one component ±1 | Defender: free Empower, one component ±1 |
| **Resonate** (Aether) | **Copy the cast-effect of one of the loser's spells** once, as if you cast it (you pay any costs). Low: a 3-card spell; Mid: up to 5; High: any | Copy a 3-card spell's effect | Defender copies one of their *own* spells' effects |

**Gambit-token throttle (standard at this tier).** Each player starts with **4 Gambit tokens**; spend 1 to Channel; no refresh. Powers this strong cannot be a free every-turn slot — the throttle keeps each duel an event and caps worst-case Source-clock drift.

**Banished cards** are removed from the game entirely — they never join the Released Reserve, so Devour quietly thins the endgame pool.

## New components

- Updated reference cards; Gambit tokens (4 per player). Imprint tokens are retired at this tier (Resonate replaces the Imprint fantasy).

## Interaction with the four spell types and the Drought

- **Conjuration:** Illuminate overlaps Source-drawing again (C10) — but throttled to ≤4 uses per player per game, bounded to 1 card taken. Count clock drift anyway.
- **Transfiguration:** Transmute's ±1 nudge is a direct gift to sequence-builders — a near-miss 6-7-9 becomes castable. Strongest form for the spell type most fragile to interference; deliberate compensation, verify it isn't over-compensation.
- **Enchantment:** ⚠ **Q2 lives here.** Transmute grants a free, counter-less learning action — the only place any tier touches the learning economy. Must be re-validated against the final round-trip counter design before this tier is tested.
- **Perfect Transmutation:** Resonate's favourite target (copying a PT's double effect is the dream). PTs become prestige objects that attract neighbours' High strikes — thematic, but watch whether PT owners feel farmed.
- **Drought:** duels off; Gambit tokens are dead weight once the Source empties (spend-them-or-lose-them pressure is intended and shapes late-game pacing). Devour's banishments have already shrunk the Released Reserve — measure how much shorter the Drought runs.

## Scaling 2–6

- **2p:** the throttle (4 each) is the anti-snowball wall; gentle spoils stays. Devour head-to-head is the meanest thing in the whole ladder short of Tier 5 — test the *gentle-Devour* dial (the committed card is banished instead; no extra hand card) early.
- **3–4p:** ideal. 12–16 total duels per game, each meaningful.
- **5–6p (Echo extension):** up to 24 potential duels; if the game bloats, cut tokens to 3 at 5–6p. A mimic-Echo card plus a spent Gambit token is the tier's most efficient play — track it.

## First playtest — watch for

**Could break:**
- **Win-then-build snowball:** Transmute and Resonate convert clash wins into engine progress. Track duel-win share vs. final placing; correlation above ~coin-flip is the alarm.
- **Devour feel-bad:** permanent removal is a different emotional register from discard. One player quitting the table on a banish = install gentle-Devour permanently.
- **Q2:** any weirdness between Transmute and the counter economy — stop the test, this is a design fault not a tuning fault.
- **Analysis stall:** four scaled powers × band arithmetic; if declarations slow down, print band ranges on the ref card, and if that fails, drop back to Tier 2.

**Success looks like:**
- Post-game table talk names specific duels ("the turn you Devoured my 15"). Tier 3's whole reason to exist is memorability; if wins are forgotten, Tier 2 is the ceiling.
- All four powers used; token pools mostly spent by game end (3–4 of 4).
- Trailing players use Resonate on the leader's engine — the built-in catch-up valve functioning.

---

# Tier 4 — The Failing Magic
### Everything in Tier 3, plus: the clash can seize the shared world. The Drought clock becomes contestable.

## Complete rules (delta from Tier 3)

On any clash **win** (strike or parry), the winner may take their form's power **or instead Bend the Failing Magic** — one of:

1. **Hasten / Stall the Drought:** banish the top **1 / 2 / 3** (band) cards of the Source, *or* return that many cards from the Arcane Reserve into the Source (shuffled in). Hard cap: each player may Hasten/Stall at most **twice per game** (mark it on their Gambit tokens).
2. **Command the Array:** sweep and refill the whole Array from the Source, *or* reserve one Array card until your next turn (nobody else may take it).
3. **Seed the Source:** look at the top **2 / 3 / 4** (band) and reorder them.
4. **Seize the Seat:** take the start-player marker (turn order shifts accordingly). If this grates in testing, cut it first — it's the most expendable lever.

Yield outcomes are unchanged from Tier 3 (Bend is only available on a genuine clash win).

## New components

- Start-player/seat marker (if not already in use); a Hasten/Stall tally method (flip spent Gambit tokens).

## Interaction with the four spell types and the Drought

- **Conjuration:** Stall directly refuels Conjurations (more Source to draw); Hasten starves them. Conjuration-heavy players become the natural Stall faction — factions emerge from spell choice, which is new and worth watching for its own sake.
- **Transfiguration / PT:** Command the Array is a second Array-pressure tool on top of base volatility; sequence-builders now genuinely need the "reserve one card" defensive use. Check they discover it unprompted.
- **Enchantment:** untouched directly; but Stall lengthens games, giving slow enchantment ladders more runway — an *indirect* buff to the exact economy under repair. Measure enchantment uptake at this tier separately.
- **Drought:** duels still off *during* the Drought — but its **arrival** is now a fought-over prize (Q5). Leader hastens, pack stalls: a built-in rubber band, and the single most thematic idea in the whole module (wizards wrestling the collapse itself).

## Scaling 2–6

- **2p:** Hasten/Stall is at its most brutal head-to-head (no third party to balance the tug). Consider capping at once per game per player at 2p.
- **3–4p:** the tug-of-war shines — genuine multi-party clock politics.
- **5–6p (Echo extension):** with up to 12 Hasten/Stall plays theoretically possible, the cap matters most here; game length variance is the number to watch. Note the extension's bigger deck already lengthens the Source clock — collect a fresh 5–6p baseline before judging Hasten/Stall drift.

## First playtest — watch for

**Could break:**
- **Game length variance (the headline):** log Source-empty turn across games; if variance exceeds ±3 rounds vs. baseline, tighten the Hasten/Stall cap to 1 per player.
- **Q5 — endgame griefing by proxy:** a leader hastening the Drought the turn before a rival's enchantment comes online is legal and possibly miserable. If it reads as griefing rather than strategy, restrict Hasten (not Stall) to Mid band or better.
- **Bend eclipses the powers:** if winners near-always Bend, Tier 3's powers are dead content at this tier — evidence to ship Tier 4 as *replacing* the powers rather than adding to them.
- **Seat-seizing resentment** — cut first, ask questions later.

**Success looks like:**
- At least one visible clock battle (a Hasten answered by a Stall within a round) that the table talks about.
- The trailing player wins a game — or comes close — *because* of Stall; the rubber band demonstrably functions.
- Players choose between power and Bend roughly 60/40 either way — both halves alive.

---

# Tier 5 — The Resonance War
### Deliberately overwhelming. Everything in Tier 4, plus a scoring memory, margin bonuses, and multi-card strikes. This is the "too much" end of the spectrum — expected to fail as a first play, kept as the deluxe ceiling and as parts inventory.

## Complete rules (delta from Tier 4)

**A. Resonance Marks.** On a clash win, the winner may (as a third choice besides power / Bend) **place a Mark**:

| Mark | Placed on | At the Ascension (final evaluation) |
|---|---|---|
| **Tithe** | A rival's spell — band caps the markable spell size (Low: ≤3 cards / Mid: ≤5 / High: any) | You gain RP equal to the spell's component count; its owner loses the same. Flat math, never percentages |
| **Aegis** | One of your own spells | +2 RP, and the spell can't be Tithed |
| **Beacon** | An energy type | +1 whenever you Collect that energy (take an extra Source draw), from now on |

Marks are visible all game. Max **3 Tithes** placed per player. **Shedding a Tithe:** Reshape or Unlearn the marked spell (normal action, normal cost) and the Tithe is discarded — counterplay through the base game's own verbs.
Yield against a Mark-intending attacker: the attacker may still place a Tithe, but one band-cap lower. Answer-and-win: the defender may place an Aegis or a counter-Tithe instead of their parry effect.
**Trials compatibility:** when scoring with [[Ascension Trials]], Tithe RP resolves against final Recognition Points *after* trial resolution, and an Aegis adds its +2 to the owner's total; Marks never alter domain power. (Provisional — first Trials-with-Marks test owns this.)

**B. Overload.** If the winner's frequency beats the loser's by **5 or more**, the winner takes **two** of the three rewards (power / Bend / Mark). Never at 2p.

**C. Summed Strikes.** A strike (not a guard) may be **two components of the same energy**, frequencies summed, band from the sum. Both cards are committed (spoils risk both).

**D. Optional return of the cast-action cost (dial, off by default):** if duels prove too frequent even with tokens, Channelling additionally spends a cast action — the Deep Dive's cost, resurrected as the final brake (C1).

## New components

- Mark tokens in player colours (Tithe/Aegis/Beacon, ~8 per player); updated reference cards (now genuinely dense).

## Interaction with the four spell types and the Drought

- **Conjuration:** Beacons stack with Conjuration draws — a Radiance Beacon plus a Radiance engine is the tier's degenerate-combo candidate #1.
- **Transfiguration:** Summed Strikes give sequence-hoarders a use for duplicate mid-cards; Tithe-shedding via Reshape makes Reshape (the least-used base verb) suddenly matter — a quiet gift to the spell type that owns it.
- **Enchantment:** Enchantments can't be Imprinted, *can* be Tithed and Aegised. A Tithed 4-card Enchantment is a 4-RP endgame bomb sitting on the game's most contested object — either delicious or hateful; testing decides.
- **Perfect Transmutation:** attracts Tithes like it attracted Resonate; an Aegis on a big PT is the tier's signature defensive play.
- **Drought:** duels off, but Marks **persist and score** �