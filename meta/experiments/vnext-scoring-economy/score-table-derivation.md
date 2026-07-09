---
title: How the theoretical score table was derived (methodology)
type: reference
experiment: vnext-scoring-economy
updated: 2026-07-08
---

# How we got to the theoretical score table

**Status: theoretical / not canon.** This documents how the candidate score table in
`proposed/score-table.md` was derived from first principles in the scoring workbook
(`tools/scoring models/archmage_scoring_m15_utility_model_v4_formula_corrected.xlsx`),
**before any adjustment from simulation or playtesting**. It exists so the reasoning (and
every assumption) can be revisited later. If a playtest contradicts an assumption, the
"Assumptions and what to change" section at the end maps each one to the knob that controls it.

This began as an open-ended exploration of how to price spells by rarity — the
[initial exploration](https://chatgpt.com/share/6a4f54d3-9c70-83eb-b95a-32602a3ba595) that
shaped the modelling approach. What follows is the cleaned-up, workbook-backed result of that
thinking.

The table is built in three layers:

1. **Difficulty** — how rare/hard each spell is, measured purely by probability.
2. **Utility** — discount that difficulty for the value a spell already pays you *during* play,
   and add a small subsidy to under-used spell types.
3. **Per-deck targets + a shared blend** — tune the layer-2 parameters so each deck's rounded
   table hits a set of shape targets, then reconcile the two decks into one printed table.

Assumes **no wild cards / no Echo** (the workbook decks are 4×15 = 60 and 5×15 = 75, no wilds).
Wilds/Echo pricing is a separate simulation concern, not modelled here.

---

## Layer 1 — Measuring difficulty

The premise is that a spell should be worth points in proportion to how **hard** it is to make.
The catch is that "how hard is a size-7 Conjuration?" has no single answer — it depends on what
you picture when you say *make it*:

- **Holding** seven cards that happen to form it right now? — a **snapshot**.
- **Building** it one card at a time across several turns? — a **path**.
- **Getting the chance** to assemble it somewhere in all the cards you see over a game? — an
  **opportunity**.

These are genuinely different questions, and each is the "right" one for a different way of
thinking about play. Rather than gamble on one, the workbook computes all three and blends them.
Each lens produces a probability *p*, which is turned into a **difficulty = −ln(p)**. The log is
the important move: it converts *multiplicative* rarity ("ten times rarer") into *additive*,
score-like steps ("one notch harder"), so a table built on −ln(p) rises in even increments
instead of exploding toward the top. Every spell type — Conjuration, Transfiguration, Perfect
Transmutation, Enchantment — gets its own *p* under each lens.

Why three, and not just the "obvious" one? The obvious one (a random hand — the snapshot) turns
out to be the *least* realistic: nobody is dealt seven random cards and asked if they make a
spell. Real difficulty lives between "how the spell is built up" and "how many chances you get to
build it", so the model needs those two lenses and uses the snapshot mainly as a sanity anchor.
The three below are listed in increasing order of realism for end-game scoring; the one that
actually feeds the table is the **fixed-opportunity** lens (1c), lightly mixed with the
**build-path** lens (1b).

Everything here is a *relative* measure — we care that a size-9 spell is meaningfully harder than
a size-7, and that Perfect Transmutation is harder than Conjuration, far more than we care about
any single probability's absolute value. That is why the layer can be reshaped by one weight
(alpha) without re-deriving anything.

### 1a. Raw / exact-subset model (`Raw_Model`)
"If you held exactly *n* random cards, what's the chance they form a valid size-*n* spell?"
`p = valid_n_card_spells / C(deck, n)`. The denominator is the **whole deck**, so this is the
"unbounded / see-everything" view.

- **Pro:** clean, exact, no path assumptions; a pure rarity measure.
- **Con:** unrealistic as *lived* difficulty — players don't hold a random *n*-card hand, they
  *build* toward a spell over many turns and only need it to exist *somewhere* in what they see.
  It over-states how hard small spells are and (relative to real play) under-states large ones.

### 1b. Marginal / build-path model (`Marginal_Model`)
"Start from the raw chance of a 3-card spell, then multiply by the realistic chance of
extending size *k* → *k+1* one card at a time." A drawing/growing process rather than a snapshot.

- **Pro:** matches how spells are actually assembled; captures that each extra card is a fresh
  hurdle.
- **Con:** the per-step extension probabilities are a model of "realistic" draws, not exact; it
  ignores that you often have several routes to a spell at once.

For the sequence spells (Transfiguration, Perfect Transmutation) the extension is not a flat
out-count: a run only grows at *both* ends when it isn't touching rank 1 or 15. A size-*n* run has
16−*n* legal positions, of which 14−*n* are double-open (two outs) and 2 are one-sided (one out),
so the effective outs fall as runs lengthen — the workbook's extension formula weights those
cases. (An earlier pass used a flat open-ended out-count and under-rated the boundary risk on long
Transfigurations.)

### 1c. Fixed-opportunity model (`Fixed_Opportunity`)
"Inside a fixed window of *m* cards (the `Inputs!B9` opportunity size, set to **15**), how many
valid size-*n* spells do you *expect* to see?" It uses the **same denominator C(deck, m) for
every size** — `expected = valid_count × C(N−n, m−n) / C(N, m)` — then bounds it to a
probability with `p = 1 − e^(−expected)`.

- **Pro:** this is the "did you get the *chance* to make it" lens, with one common yardstick
  across sizes. Small spells correctly become near-certain (you'll almost always *see* a 3-card
  spell in 15 cards → difficulty ≈ 0), while large spells stay rare. This is the behaviour we
  want end-game scoring to track.
- **Con:** `1 − e^(−expected)` is an approximation (it treats overlapping spell opportunities as
  independent — no exact inclusion/exclusion). It's a stable comparison layer, not a precise
  union probability.

A subtlety worth remembering: **same denominator does not mean same probability.** Even with the
common `C(deck, m)` window, a smaller spell embeds into that window in more ways than a larger
one. In Deck 1 a 4-card Enchantment comes out *more* likely than a 5-card Perfect Transmutation
(≈0.042 vs ≈0.024 expected in 15 cards) despite there being fewer 4E patterns (15) than 5PT
patterns (44): a 4-card target fits a 15-card window in `C(56,11)` ways vs `C(55,10)` for a
5-card target — a ≈5.1× embedding edge that outweighs PT's ≈2.9× pattern edge. The extra-card
requirement still bites, through the numerator rather than the denominator.

### On "variable opportunity"
There is no separate variable-window model in the workbook. The two "opportunity" framings are
the **fixed** *m*-card window (1c, what we use) and the **raw** whole-deck view (1a), which is
the unbounded limit. One concrete variable window *was* explored: `m = deck ÷ player count`
(Deck 1: 30 at 2p, 20 at 3p, 15 at 4p; Deck 2: 15 at 5p, ~12.5 at 6p). It changes the picture
materially — a larger window at 2–3p makes big spells much more achievable, even flipping the
4E-vs-5PT order at 2p — which is exactly why it was **rejected for a single universal table**: it
bakes player-count pacing into the scores. Fixed *m* = 15 keeps one neutral table; the
count-averaged version is retained only as a sanity check (it makes size-15 spells look ~5–6
difficulty points easier, because 2–3p abundance drags the average down). *m* stays a single
editable input if we ever want to test other horizons.

### Combining the lenses
Difficulty is blended in log-space with weight **alpha** (`Inputs!B7`):

- `Combined_Model` = alpha·raw + (1−alpha)·marginal (older; kept for reference).
- **`Combined_Fixed_Model` = alpha·fixed-opportunity + (1−alpha)·marginal** ← **this is the
  baseline the score table actually uses.** It replaced the raw layer with the fixed-opportunity
  layer because "chance to see it in a window" tracks real scoring better than "random hand".

Default **alpha = 0.8**: 80% weight on "did you get the opportunity in 15 cards", 20% on
"was the build path hard". The 20% marginal component is what keeps the low end from collapsing
straight to zero (fixed-opportunity difficulty is ~0 for small spells; the marginal term gives
them a little slope).

**Illustration — Conjuration difficulty by model (Deck A, 4E):**

| size | raw | marginal | fixed-opp | combined (0.8) |
|---:|---:|---:|---:|---:|
| 3 | 2.93 | 2.93 | 0.00 | 0.59 |
| 5 | 6.12 | 6.12 | 0.00 | 1.23 |
| 7 | 9.62 | 9.62 | 1.05 | 2.77 |
| 9 | 13.51 | 13.51 | 5.00 | 6.70 |
| 12 | 20.46 | 20.46 | 14.34 | 15.56 |
| 15 | 30.22 | 30.22 | 30.22 | 30.22 |

Note how raw and marginal agree for Conjuration (a straight run has one build path), how
fixed-opportunity is ~0 until mid sizes then converges to raw at 15, and how the combined column
sits mostly on the fixed-opportunity curve with a small marginal lift at the bottom.

---

## Layer 2 — The utility adjustment

Pure difficulty over-rewards spells that **already pay you while the game is running**. A
Conjuration draws cards; a Transfiguration / Perfect Transmutation exchanges with the Array; an
Enchantment hands you capacity counters. If a spell is its own reward mid-game, it should earn
*fewer* end-game recognition points, or it double-dips. Layer 2 subtracts an estimate of that
in-play value, and separately adds a small subsidy to spell types we want to keep attractive.

For each spell type the workbook computes a **utility** term, then an **adjusted difficulty**:

- **Conjuration** utility `I = horizon × max(0, draw − clock) × (1 if size<6 else 2)` — card
  draw is worth `draw`, minus a `clock` penalty for burning the shared Source; big conjurations
  count double. Adjusted `= max(0, base − lambda·I)`.
- **Transfiguration** utility `J = horizon × max(0, array − friction)` (0 by default, since the
  Array exchange value 0.6 < friction 0.8). Adjusted `= max(0, base − lambda·J + role)`, where
  `role` is the promotion subsidy.
- **Perfect Transmutation** utility `K = PTmult × (I + J)` — PT can exploit the same value but is
  harder/later, so it's discounted less (`PTmult` = 0.65). Adjusted `= max(0, base − lambda·K)`.
  **Special rule: at size 15, PT is forced equal to Conjuration** (a 15-card spell is both).
- **Enchantment** utility `L = horizon × capacity × gain(size)`, `gain` = +1/+3/+5 for sizes
  3/4/5. Adjusted `= max(0, base − lambda·L)`. (More capacity → more discount — see the
  Enchantment caveat below.)

Then **score = adjusted difficulty × scale**. The `max(0, …)` floors mean a spell whose in-play
value exceeds its difficulty scores 0 (this is what puts a 3-card Conjuration at the floor).

The knobs (all on `Inputs`, defaults in brackets):

| knob | cell | default | what it does |
|---|---|---:|---|
| alpha | B7 | 0.80 | fixed-opportunity vs marginal weight (Layer 1) |
| lambda | B23 | 0.50 | how hard the in-play utility discount bites |
| mu | B24 | 1.0 | weight on role subsidies |
| scale | B25 | 2.0 | adjusted difficulty → points multiplier (sets the ceiling) |
| horizon | B26 | 2 | how many future turns the in-play value is felt |
| draw value | B27 | 1.0 | value of a Conjuration card draw |
| clock penalty | B28 | 0.25 | cost of burning the Source when drawing |
| array value / friction | B29 / B30 | 0.6 / 0.8 | Transfiguration/PT exchange value vs its cost |
| PT utility mult | B31 | 0.65 | how much of the exchange value PT can exploit |
| capacity value | B32 | 0.75 | points-worth of one Enchantment capacity counter |
| 3E/4E/5E gain | B33/34/35 | 1/3/5 | capacity granted by size-3/4/5 Enchantment |
| TF role incentive | B36 | 1.5 | Transfiguration promotion subsidy |

---

## Layer 3a — Per-deck targets, and why

Before blending decks, each deck's rounded table is tuned to hit five shape targets. These are
design intent, not model outputs — they define what a "good" table looks like:

1. **C3 = 0** — a 3-card Conjuration is the trivial floor (you almost always have one), so it
   anchors the bottom at zero rather than paying out for nothing.
2. **Every other spell > 0** — no real spell should be worth 0 points; there are no dead cells.
3. **Each column strictly increasing** — a bigger spell of a type must *always* beat a smaller
   one, so growing a spell is never a trap and never a wash.
4. **PT15 = 100** — 100 is the ceiling (chosen for clean integer resolution at the low end), and
   size-15 Conjuration = size-15 Perfect Transmutation are literally the same object, so both cap
   at 100 (the "identity").
5. **PT ≥ Transfiguration at every size** — Perfect Transmutation is the most constrained spell
   class, so it should never be worth less than a Transfiguration of equal size.

## Layer 3b — Balancing the parameters to hit those targets

Only four knobs were moved from default per deck: **alpha, lambda, scale, TF-role**. What each
one is doing:

- **scale** sets the ceiling: pick it so the size-15 spell lands on 100.
- **lambda** controls the low end. The Conjuration utility doubles at size 6 (the `×2` above),
  which puts a step in the discount; lambda has to be small enough that the step doesn't flatten
  the 5→6→7 climb, yet large enough that C3 is discounted to 0. This is the tightest constraint.
- **alpha** reshapes the baseline so the low-end gaps are big enough to round to distinct
  integers while C3 still hits 0 — the default 0.8 can't do it, which is why alpha moves.
- **TF-role** lifts Transfiguration to about half of PT at the top without breaking PT ≥ TF.

Searching the input space (maximising every cell's distance from a rounding boundary) gave:

| deck | alpha | lambda | scale | TF-role | note |
|---|---:|---:|---:|---:|---|
| A (4E) | 0.816 | 0.27 | 3.40 | 0.15 | feasible region is a razor-thin ridge |
| B (5E), standalone | 0.84 | 0.28 | 3.04 | 0.0 | comfortably robust |

Deck A's targets pin it to a tiny window (alpha ≈ 0.814–0.817, lambda ≈ 0.262–0.274); Deck B has
much more room. That asymmetry matters for the blend.

---

## Layer 3c — From two decks to one shared table

We want **one printed table** used regardless of player count. The utility inputs are global —
only the deck energy count differs — so a single input set produces *different* A and B tables,
and **no single set makes them identical**: at Deck A's pinned inputs, Deck B's 3-card
Conjuration rounds to 1 (fails C3 = 0) and its PT15 overshoots to ~112. So the shared table is a
deliberate compromise:

- **Deck A is the anchor** (it's the 2–4 player deck — the more common table). Its optimal table
  is kept as-is, so PT15 = 100 and Deck A is scored exactly fairly.
- **Deck B is re-tuned with its ceiling relaxed.** Because Deck B's size-15 spells aren't
  realistically achievable, we drop the "B PT15 = 100" requirement, which frees Deck B's *scale*.
  Re-tuning (alpha 0.79, lambda 0.55, scale 3.0, TF-role 0.15) lets Deck B's low-mid curve sit
  almost on top of Deck A's through size 9. Re-tuned B's PT15 lands ≈ 96 (we don't care).
- **Blend, weighted toward A.** Shared value = weightA · A + (1 − weightA) · B, with
  **weightA = 0.65 for sizes 3–9** (leaning to the common deck even where they agree), ramping to
  **1.0 at size 15** (the high end is pure Deck A). This keeps the identity PT15 = 100.
- **Enchantment is decoupled.** The re-tune's high lambda (0.55, needed to match Conjuration)
  over-discounts capacity and flattened Enchantment's top (it gave 4, 9, 11). Enchantment instead
  uses Deck B *standalone* (lambda 0.28) blended with Deck A → **4, 10, 16** (+6, +6).

**The resulting shared table:**

| size | Conj | TF | PT | Ench |
|---:|---:|---:|---:|---:|
| 3 | 0 | 3 | 5 | 4 |
| 4 | 1 | 4 | 11 | 10 |
| 5 | 2 | 5 | 18 | 16 |
| 6 | 3 | 7 | 24 | — |
| 7 | 7 | 8 | 31 | — |
| 8 | 13 | 10 | 39 | — |
| 9 | 20 | 13 | 47 | — |
| 10 | 29 | 16 | 56 | — |
| 11 | 38 | 20 | 65 | — |
| 12 | 50 | 25 | 74 | — |
| 13 | 63 | 31 | 85 | — |
| 14 | 79 | 38 | 97 | — |
| 15 | 100 | 48 | 100 | — |

---

## What the shared table does for each deck

Because Deck A is the anchor, **Deck A is scored at its own fair value everywhere** (the shared
column equals Deck A's optimal table, give or take a +1 where the blend leans toward B). All of
the compromise is carried by **Deck B**. Measuring "generosity" = shared score − that deck's own
difficulty-optimal (fair) score:

- **Conjuration — under-rewarded in Deck B** (gen ≈ −1 to −3 from size 6 up; 0 at 3–5 and at 15).
  A mid/large Conjuration is genuinely *harder* in the 5-energy deck (more dilution of a single
  colour), so its fair value there is higher — but the shared table pays Deck A's lower number.
  Net: conjurations are the *better-value* play in Deck A and slightly short-changed in Deck B.
- **Transfiguration — over-rewarded in Deck B** (gen ≈ +1 at size 3 rising to +5 at size 15).
  Deck B's own table values TF lower (it used no role subsidy); the shared table pays Deck A's
  subsidised TF, so TF is the *better-value* play in Deck B. This partly offsets the Conjuration
  shortfall — a Deck B player is nudged toward Transfiguration, away from Conjuration.
- **Perfect Transmutation — near-fair for both** (gen 0 across 3–9; only +1/+2 in Deck B at
  sizes 10–14). PT is the cleanest shared column, because PT difficulty is very similar across
  the two decks.
- **Enchantment — provisional.** Slightly generous to Deck B at sizes 3–4; size 5 is Deck B only.

Summary of who finds what strong/weak, at equal printed points:

| spell | Deck A (4E) | Deck B (5E) |
|---|---|---|
| Conjuration (mid/large) | fair (good value) | harder than paid → **weak** |
| Transfiguration | fair | over-paid → **strong** |
| Perfect Transmutation | fair | ≈ fair |
| Enchantment | fair (3–4 only) | slightly strong (provisional) |

Caveat: "fair" means *that deck's own difficulty-optimal table*, which itself embeds the Layer-2
parameter choices (e.g. the TF subsidy differs between the two decks' optimal fits), so the TF
row above is partly a parameter choice, not purely intrinsic difficulty.

---

## How the model evolved (the forks, and the dead-ends)

This table is the endpoint of a deliberate search, not a first guess. The order in which ideas
were tried — and *why* each was abandoned for the next — is itself part of the reasoning, and
worth keeping in case a later assumption has to be revisited.

1. **Marginal outs (1/outs).** The first instinct was to price each size-up by how many cards let
   a spell grow: a 3→4 Conjuration needs 1 of ~12 cards, a 13→14 needs 1 of 2, so late Conjuration
   growth is worth far more. Intuitive, and it respected the 15C = 15PT identity from the start.
2. **Open- vs closed-ended runs.** Flat outs over-rated long sequence spells; weighting double-open
   vs one-sided positions made Transfiguration/PT taper realistically (this refinement survives in
   the build-path model, 1b).
3. **"1/outs is not a probability."** The real fix was to stop treating outs as a probability and
   move to **difficulty = −ln(p)**, which is additive and combinable. This became the backbone.
4. **Two models emerged.** Forcing 15PT = 15C under the marginal model needed an *artificial*
   compression of PT — a red flag. It exposed that "how rare is the finished spell" (raw
   final-state) and "how hard is it to build" (marginal path) are different questions; raw
   probability makes P(15C) = P(15PT) fall out for free, because the finished object is identical.
   Decision: **rarity is the primary driver, build-path only bends the curve** (log-space, alpha).
5. **Exact-subset denominators mispriced across sizes.** The raw model judged a 4-card spell
   against all 4-card hands and a 5-card spell against all 5-card hands — different yardsticks that
   silently priced in "needs one more card". Switched to the **fixed-opportunity** model (a common
   `C(deck, m)` window) so all sizes share one yardstick.
6. **Variable window by player count — explored, rejected.** `m = deck ÷ players` was tried; it
   makes big spells much easier at 2–3p and even flips 4E vs 5PT. Rejected for a single universal
   table (it bakes player count into scoring); **fixed m = 15** kept, count-average retained only
   as a sanity check.
7. **Utility layer added.** Pure rarity double-pays spells that already reward you in play
   (Enchantment capacity, Conjuration draw, Array exchange), so utility is **subtracted after** the
   probability difficulty, never baked into it — the probability baseline stays clean.
8. **Enchantment simplified, Transfiguration promoted.** Unlimited Capacity was dropped for a
   +1/+3/+5 ladder (so Enchantment no longer needs an extreme manual cap), and Transfiguration —
   probabilistically easy but under-played — got a positive **role incentive** rather than a
   discount (the +μ·role term). ("Mandatory-cast" was floated as T's downside and corrected: the
   real friction is the exchange/hand cost, not that casting is forced.)
9. **Then, in this repo:** the parameters were tuned to the five shape targets per deck, and the
   two decks were reconciled into the single shared table (Layer 3). The workbook itself needed
   fixing twice on the way — a merged-cell corruption, and a version that lost live formulas and
   accidentally shifted the marginal baseline (Deck 1 size-3 combined difficulty drifted from ~0.59
   to ~0); the current v4 workbook restored formula-driven tables on the correct baseline.

Steps 1–8 are the [initial exploration](https://chatgpt.com/share/6a4f54d3-9c70-83eb-b95a-32602a3ba595);
step 9 onward is this experiment's work.

---

## Assumptions, and what to change if one is wrong

Listed roughly most- to least-load-bearing. Each points at the lever that controls it.

1. **Difficulty = −ln(probability) is the right basis for points.** If scoring should be more or
   less "top-heavy", this is structural (would need a different transform, not just an input).
2. **Fixed-opportunity, m = 15, blended 80/20 with marginal build-path (alpha 0.8).** If the
   "window you effectively see" is smaller/larger, change `Inputs!B9` (m). If real difficulty is
   more about the build path than the window, lower alpha (`B7`); more about the window, raise it.
3. **The in-play utility values** (draw 1.0, clock 0.25, array 0.6/0.8, PT-mult 0.65, horizon 2).
   These are estimates of how much each spell "pays you during play". If a playtest shows, say,
   Conjuration card-draw is worth more than we assumed, raise `draw`/`horizon` and the low end
   drops further. `lambda` (`B23`) scales the whole discount up/down.
4. **Transfiguration needs a subsidy to stay played** (TF-role 0.15 in the shared table, giving
   TF15 ≈ ½ PT). If TF turns out fine unsubsidised, drop `B36`; if still ignored, raise it (watch
   PT ≥ TF, and the RESHAPE concentration exploit — see `reshape-rule.md`).
5. **The five shape targets** (C3 = 0, all > 0, strictly increasing, PT15 = 100, PT ≥ TF). These
   are design choices; changing any (e.g. a different ceiling, or allowing E3 = 0 instead of
   C3 = 0) re-opens the parameter search.
6. **Deck A (4E, 2–4 players) is the more common table, so it's the anchor.** If 5–6 player games
   turn out to dominate, re-anchor to Deck B, or lower the blend weight below 0.65 to share the
   compromise more evenly. Lever: `blend_weight` in `record_target_tables.py`.
7. **Deck B's large spells (≈12–15) are unreachable, so relaxing its ceiling is harmless.** If
   5–6 player games actually do reach size-14/15 spells, this is wrong and Deck B's high end needs
   its own calibration rather than following Deck A.
8. **Enchantment: capacity discount + the +1/+3/+5 ladder + capacity value 0.75.** Least settled —
   tied to the open Unlimited-Capacity decision (`enchantment-capacity.md`). The 4/10/16 row is
   provisional; `B32` and `B33–35` reshape it.
9. **No wilds / no Echo.** The whole model is priced on clean 4×15 and 5×15 decks. Wild cards and
   the Echo (5th/6th-player) energy change real difficulty and are handled in the simulation, not
   here — if they materially change achievability, the baselines shift.

---

## Reproduce / tooling

All under `tools/scoring models/` (kept for rebalancing):

- `archmage_..._v4_formula_corrected.xlsx` — the live workbook (Layers 1–2 as formulas).
- `_m2.py` — faithful Python reimplementation of the whole chain (verified to reproduce the
  workbook to < 1e-9 for both decks); `_m2b.py` — fast baseline-cached version + per-deck search.
- `record_target_tables.py` → `recorded_target_tables.json` — the machine-readable store of both
  per-deck input sets and the shared table (regenerate after any change).
- `_matchB.py` — re-tune Deck B to hug Deck A; `_shared_table.py` — shows a single shared input
  set is infeasible; `_ench.py` — Enchantment diagnostic; `_doc_data.py` — data behind this doc.

Per-deck input sets and the shared-table construction are recorded in `utility-model-input-sets.md`;
the current candidate table is `proposed/score-table.md`.
