---
title: 2p Strategic Depth — Array Contention
type: review-exploration
status: parked-explore-later
created: 2026-07-09
thread: capacity-economy
---

# 2p Strategic Depth — restoring Array contention

**Status: exploration only. No decision, nothing to canon.** Parked for a later
analysis + playtest pass. This brief exists so the work can be picked up cold.

> [!warning] Scope widened (Sam, later on 2026-07-09)
> The "do not touch Ascension Trials" restriction below is **lifted**, and expansions
> are in scope. The full-scope exploration now lives in
> `_review/2P_STRATEGIC_DEPTH_DEEP_DIVE_2026-07.md`, which extends this brief
> (endgame/Trials fix, Veiled Power, the Rival's Gambit package). This file remains
> the source for the Array-contention half.

~~**Do NOT touch Ascension Trials here** — the 2p Trials predictability problem is real
but explicitly out of scope for this line (Sam, 2026-07-09). This is about the *main
loop* only.~~ (Superseded — see scope note above.)

## The problem

At 2p the game loses strategic depth versus its 3–4p sweet spot. Sam's observation:
Transfigurations are barely built or cast in the main phase because you can just
base-collect one Array card per turn — with a single opponent whose whole Spellbook you
can read, the chance they take the card you want before your next turn is negligible. So
the Array stops being contested, and the whole Transfiguration/Array subsystem goes
dormant.

(General trend, not unique to this game: higher counts → more social / less focus;
lower counts → more optimising. 3–4p is the intended sweet spot and works. The goal is
to lift 2p, **without touching 3–4p**.)

## Root cause

Two coupled things break at 2p:

1. **The Array decongests.** The Collection Phase lets anyone take 1 Array card/turn for
   free and safe. Transfiguration is the game's *fast lane* to Array cards (extra pulls
   during casting + hand churn); you build it at 3–4p because free collection isn't fast
   enough when several opponents cycle and might snipe. At 2p, free collection is plenty,
   so the fast lane has no reason to exist. **Base-collecting from the Array is "free and
   safe" at 2p — that is the real culprit.**
2. **Information is near-perfect.** One opponent's full Spellbook is readable, so there's
   little probabilistic reasoning — and the base game gives almost no tools to *act* on
   the read (no denial/blocking), so the extra information has nowhere to go.

Two levers follow: **restore Array contention** (fixes #1) and **give reading the
opponent something to do** (addresses #2).

Corroborating prior findings (capacity-economy thread, Session 4 / 2026-07-08):
"Transfiguration is an end-game Reshape target, not a live strategy — at 2p the array
cadence makes it unnecessary," and "Interaction scales with player count" (Round 1
parallel/no conflict; Round 2 heavy clashing). Same phenomenon, seen from other angles.

## Direction chosen by Sam (2026-07-09)

**Combine the base-scaling rule (option 1) and the 2p variant (option 2) into one
exploration.** The expansion route (a whole new interaction/duel/objective system) is set
aside *for this specific problem* — it adds depth generally but doesn't rescue the base 2p
loop, and it's an oversized tool for what is fundamentally a scaling problem. (Expansion
depth is still tracked separately under the expansions thread's "Strategic-depth
direction" P2.)

Diagnosis framing: this is a **scaling** problem (existing tension evaporates at low
count), not a **missing-system** problem — the native fix is a player-count lever in the
base rules, with a targeted 2p rule layered on if scaling alone isn't enough.

## Candidate levers to model & test

**Base rule — scale the Array by player count (option 1):**
- *Array size = f(players).* Smaller Array at 2p (candidate: 3 cards vs the standard 5),
  so both players are more likely to covet the same card and base-collection stops being
  safe. One parameter, no new components, thematically invisible.
- *Staleness flush.* Each round, sweep the oldest (or one marked) Array card into the
  Reserve before refilling — "use it or lose it" pressure against the *clock* rather than
  the opponent, so it bites even 1v1. Costs a small housekeeping step and speeds the
  Source clock slightly.

**2p variant — targeted, only touches 2p (option 2):**
- *Neutral drafter* ("the Academy takes its due"): each round a phantom hand claims one
  Array card by a simple deterministic rule (e.g. highest value, or matching the
  last-taken energy) and buries it in the Reserve. Restores "someone will take it before
  my turn" directly. Well-proven 2p pattern; tunable; leaves 3–4p untouched.
- *Denial action*: on your turn you may burn/bury one Array card (instead of, or once per
  round in addition to, collecting). Converts your perfect read of the opponent into a
  real weapon — the head-to-head bite 2p players want. Risk: can feel negative/griefy and
  slow the game; needs tuning so it isn't always-correct.

**First combined shape to try** (starting point, not a decision): smaller 2p Array
(size 3) as the base-scaling lever + a light neutral-drafter as the 2p variant. Add the
denial action only if reading-the-opponent still has nothing to do. Reason to start here:
smaller Array + neutral drafter are the two lowest-risk, most reversible knobs and they
attack the two root causes independently.

## Hard design constraints

- **Must be count-scaled or count-gated.** 3–4p works; nothing here may tighten the 3–4p
  market. A scaling rule satisfies this automatically; a flat base change does not (that's
  the argument against option 3-as-a-flat-rule).
- **Must not reduce hook visibility** (DR-HOOK, `meta/decisions/2026-07-06-protect-the-hook.md`):
  the player-burned Source clock + living Spellbook must stay front-and-centre. A staleness
  flush or neutral drafter that speeds the clock actually *reinforces* the hook — good — but
  watch that added housekeeping doesn't bury it.
- **Keep teach-load low** — comprehension is already a live problem (rules-and-teaching
  thread). Prefer the smaller-Array knob (zero new rules) over the drafter (an automa to
  teach) where they're interchangeable.

## Analysis plan (simulation/)

Use the existing rig (`simulation/`, deterministic seed 42). Model, at 2p:
- Baseline: how often the card a player "wants" is still available on their next turn
  (the safety metric). Expect very high at Array=5.
- Sweep Array size 3/4/5 and measure: contested-card overlap rate, Transfiguration
  build/cast rate in the main phase, Source-depletion speed, and whether engine-building
  becomes EV-positive vs pure base-collection.
- Add the neutral drafter (each candidate take-rule) and re-measure the same.
- Confirm 3–4p is unaffected by the *base* lever when it scales (Array=5 stays at 4p+).
- Output a short `simulation/2P_ARRAY_CONTENTION_*.md` when run.

## Playtest plan

Two-track: model first (sessions are 2–3 weeks apart), spend live sessions on experience.
Watch at 2p:
- Are Transfigurations built/cast in the main phase (the core signal)?
- Does base-collection stop feeling "free and safe" — do players feel snipe pressure?
- Does the read-your-opponent layer produce actual decisions (esp. with the denial action)?
- Fun/tempo cost of any added housekeeping; does the game still finish in 30–60 min?
- Regression check at 3–4p: sweet spot intact, no over-tightened market.

## Open questions

- Is smaller Array alone enough, or is a phantom-agent/denial rule required to move the
  needle?
- Best neutral-drafter take-rule (intuitive + creates real pressure without feeling
  arbitrary)?
- Does the denial action add depth or just spite? Cap it (once/round) or drop it?
- Does any of this interact badly with the vnext scoring/economy experiment? Sequence
  after that lands to avoid confounded playtests.

## Expansion concepts through the 2p-depth lens (reviewed 2026-07-09)

Reviewed all parked expansion concepts against *2-player strategic depth* specifically.
**Key finding, slightly counterintuitive:** the modules branded as "interaction" (Spell
Duels, Conclave) are the ones their own design docs flag as *weakest* at 2p —
neighbour-only reach is trivial with one neighbour, politics needs 3+, and the Duels
"gentle spoils" default is "essentially a bluffing tax… expected to under-deliver at 2p."
The concepts that deepen 2p do it *without* direct conflict — by putting a contested
shared resource/objective back on the table, or making the two seats asymmetric. This
matches the root cause above (decongestion + perfect information with nothing to do).

Ranked for 2p depth:

1. **The Living Array (`Expansion Concepts - Player Interaction.md`, module A) — most
   on-target, cheapest.** This *is* the expansion-form of option 1 (base-scaling) in this
   brief: convert the Array from a vending machine into a dwindling contested market
   (takes don't refill until round start; casting claims still self-replace, protecting
   the Source clock and Transfiguration/PT). Attacks the exact root cause. **Caveat:** as
   drafted it's tuned for 3–5p and rated only "mild" at 2p (~2 cards/round). Scaled down
   (smaller 2p Array) it becomes the sharpest 2p lever — so **treat module A as the
   ready-made ruleset to prototype for this brief's base-scaling half.** The neutral
   drafter / denial variant (option 2) then layers on top of A's contested market.
2. **The Overtones — strong but heavy and score-table-dependent.** A visible 16+ prestige
   rack with contested claims gives 2p a shared objective to race (restores "grab it
   before my turn" pressure + long-arc planning + denial). Downsides: heaviest module and
   *built out of the score table*, which is mid-flux in vnext-scoring-economy — premature
   until that lands. Hold as the later big-box.
3. **The Schools — reliable, cheapest to test, different kind of depth.** Asymmetric
   identities make 2p "my engine vs yours" (variety/matchup depth + replayability), and
   it's independent of the economy repair. But it's variety depth, not interactive depth —
   two asymmetric solitaires are still solitaires, so it doesn't fix the decongested
   Array. Best as a complement to A, not a substitute.
4. **Spell Duels — real 2p depth only if tuned for teeth, and risky.** Face-down
   simultaneous reveal gives true bluffing, and the "build a high card into a spell vs
   bank it as duel insurance" tension is genuine 2p depth even with no effects. But
   defaults are deliberately muted at 2p and 2p snowball is its headline risk; you'd have
   to dial 2p spoils *up*, against its own safety design.

Weak at 2p: **Last Rites** (deepens the endgame as a low-contention puzzle, doesn't touch
main-phase flatness); **Conclave** and **Convergence** (non-answers at competitive 2p —
politics needs 3+, Convergence is co-op/solo).

**Takeaway for this brief:** lead with Living Array as the base-scaling ruleset, optionally
pair Schools for cheap variety depth, hold Overtones for after the score table settles, and
keep the "conflict" boxes out of the 2p-depth answer.

## Related items

- capacity-economy thread — array-cadence observations (Session 4 / 2026-07-08).
- expansions thread — "Strategic-depth direction" P2 (the expansion route, tracked
  separately; this brief is the base-game/2p answer to the same underlying want).
- Constraint: DR-HOOK (`meta/decisions/2026-07-06-protect-the-hook.md`).
