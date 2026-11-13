---
title: Ascension Trials — Configuration Selection Plan
type: plan
date: 2026-07-11
status: proposed working plan — how to get from qualitative goals to a chosen configuration
relates_to:
  - "ascension-trials/ascension_trials_model/docs/ASCENSION_TRIALS_CONFIGURATION_MODEL_V2_1.md"
  - "ascension-trials/design-history/ASCENSION_TRIALS_04_CONFIG_MODEL_ADVERSARIAL_REVIEW_2026-07-10.md"
  - "ascension-trials/design-history/ASCENSION_TRIALS_05_VS2_LAB_AUDIT_2026-07-10.md"
  - "ascension-trials/design-history/ASCENSION_TRIALS_03_HYBRID_REBUILD_CRITIQUE_2026-07-06.md"
purpose: A staged, minimum-engineering path to a final AT configuration. The code's only job is to reject configurations that would have wasted a playtest; everything it cannot veto is decided personally.
---

# How to actually pick the configuration

## 0. Reframe: this is not an optimization problem

There is no argmax. Half the V2_1 targets are soft ("aim for"), several trade off
against each other, and the tiebreaking judgement between two healthy configurations
is aesthetic. So the pipeline's output is deliberately **1–3 Pareto survivors with
one-page scorecards**, and "best" is your pick among them. Design the process around
that: code filters, you choose.

The space is also much smaller than it looks. Once the skeleton is frozen (Stage 1),
the open axes are roughly: trial list per count (2–3 options), reward pricing (2–3
vectors), claim floor (none / RP-floor / flat-5), 2p private-value lever (none /
Champion's Mark), 6p second place (on / off), tiebreak family (allocation-local /
ratio). That is **tens of candidate configurations, not thousands**. Nothing about
this justifies search automation.

**Budget rule for every stage below:** a playtest evening is the unit of cost. A piece
of code is worth building only if it plausibly prevents two or more bad playtests.

---

## Stage 0 — Fix the yardsticks (personal, ~1 hour, no code)

Adopt or adjust the provisional numbers in V2_1 (§11 G7, §15, §17.3) and write them
into one decision file so they stop moving during evaluation:

- tie budget at parity (V2_1: ≤5% shared winner, ≤5% decided by final chain);
- counter-quality floor (≥1 RP always; ≥ smallest trial reward for 90%);
- where robust dominance should sit (a percentile of *realistic* spellbook gaps —
  needs Stage 4's distribution, so record it as a percentile, not a number);
- complexity ceiling (max allocation minutes and written entries you'll accept);
- depth floor (≥3 distinct equilibrium-mass plans, normalized entropy ≥ 0.6);
- the coherency rule below (Stage 1) as a hard constraint, not a metric.

These are yours; the model cannot derive them. Everything downstream is measured
against this sheet.

## Stage 1 — Freeze the cross-count skeleton (personal + existing theory, no code)

Your coherency requirement — *players shouldn't plan their base-game spellbook
differently by player count* — is cheapest to satisfy **by construction, not by
measurement**:

1. **F (power conversion) and domain definitions are identical at every count.** A
   spell is worth the same power in the same domain at 2p and 6p, always. Base-game
   build incentives flow almost entirely through F and the domain map, so fixing them
   fixes planning invariance.
2. **Only the active-trial list and the reward table vary by count**, and every
   count's trial list is a subset of one master list. Your power is never worth
   *nothing* at some count — it just has fewer sinks.
3. **Every domain has ≥2 sinks at every count** (the file-03 diagnosis of 2p thinness,
   generalized). This is the constraint that makes subsetting safe.
4. **No count-varying resolution semantics** (floors, tie rules, wild rules identical
   everywhere). Review 04 §G class (iii) — semantic variation per count is the
   expensive kind of incoherency; refuse it outright.

The unavoidable residual: Echo and 5-card Enchantments exist only at 5–6p — that's a
base-game fact, not an AT choice, and Complete Mastery being 5–6p-only is *additive*
(new sink, no repurposed power), so it doesn't break rule 1.

Skeleton pieces already justified by prior analysis and not worth re-litigating:
2n−3 power formula (flat marginals are right for an allocation endgame), Enchantment
4/8/12 scale, PT double-domain with the file-03 nerf held behind a trigger, Wild as
small gated noise. Keep at most one alternative per piece; each alternative doubles
Stage 3, so make it earn the slot.

## Stage 2 — Enumerate candidates by hand (personal, ~1 evening, no code)

Write each candidate as a config JSON in the existing schema (they already load).
Factor, don't multiply: most axes are nearly independent, so test them in small
bundles rather than full factorial — e.g., settle the floor rule and tiebreak family
on one trial-list/reward baseline first (they dominate the gate results), then vary
trial lists and pricing on the winning floor/tiebreak choice. Expect ~15–30 configs
total across both waves.

## Stage 3 — 2p exact screening (code you already have: VS2→VS4)

Per candidate, per player count's *2p-relevant* content: hard gates at parity states
plus the adversarial states that matter (floored turtle above all — floors shrink the
contestable set and can recreate unbeatable strategies), a value curve along one or
two card-space strength paths, tie rates, and the depth panel (entropy, margin-VOI,
counter distance). Veto only on the Stage-0 core (feasibility, counterability, tie
budget, monotonicity, reachable dominance); everything else ranks.

Precondition: the VS2 audit's D1–D4 corrections (wrong VOI formula, missing G4/G5
gate computation, cosmetic gate rows, equilibrium-weighted tie rates) — without them
this stage reads wrong numbers. That is the one piece of genuinely outstanding
engineering that matters.

Output: one page per candidate. Expect the floor and reward axes to do most of the
killing; expect trial-list variants to separate on tie rates and dead-domain
diagnostics.

## Stage 4 — Realistic spellbooks: yes, but by sampling, not simulating

Answer to the direct question: **yes, the evaluation must see reasonable end-game
spellbooks — and no, that does not mean a base-game simulator.** Two cheap sources:

1. **Playtest imports** — final spellbooks from the session logs (Maya-style states).
   Zero code; you already record them.
2. **A constrained sampler** (~50–100 lines, throwaway): draw plausible final
   spellbooks from the real deck composition (energy split, spell-type limits, spell
   counts and sizes observed in play), at each player count. Not strategic, just
   *feasible and roughly shaped like real books*.

What it's for — the three questions synthetic states can't answer:
- the **realistic gap distribution**, which turns your Stage-0 dominance percentile
  into a number (is the robust threshold reachable? too reachable?);
- **trial entry rates** (does anyone ever legally and willingly enter Complete
  Mastery / clear the Enchantment floor? A trial nobody enters is a dead 8–9 RP);
- **equal-q shape pairs** for a small archetype spot-check (specialist vs generalist
  at equal standard score — run the exact 2p value on ~10 hand-picked pairs; skip the
  full archetype matrix until a finalist exists).

Epistemics stay as the model doc has them: structural failures on synthetic states
are real failures; *frequency* claims are conditional on this sampler and get
labelled as such.

## Stage 5 — Multiplayer spot-check (one seeded script, survivors only)

Only for the 2–3 Stage-3/4 survivors, and only the cheap population metrics: trial
congestion, uncontested-award rate, contender coverage, kingmaker opportunity, and
where the 6p second-place RP actually lands (the file-03 failure condition). S1
heuristic agents + seeds + one report. **No equilibrium machinery, no VS6-as-platform**
— if the VS6 spec has grown beyond "one seeded script with declared agents and
sensitivity reruns", cut it back to that.

## Stage 6 — Playtest the finalists (personal, the real gate)

Code cannot rank: whether Champion's Mark creates real bluffing or noise; whether the
reveal is dramatic; teach cost; whether floors feel fair or fiddly; whether 6p
trailing players stay engaged. One 2p and one 5–6p session per finalist, using the
file-03 watch lists (floor-minimum wins, Mark misreads, entered-trial counts,
repeat-allocation predictability probe, PT sweep check). The playtest verdicts pick
the winner; the pipeline's job was only to make sure every candidate at the table
deserved the evening.

---

## Code vs personal — the explicit split

| Layer | Who | Notes |
|---|---|---|
| Yardsticks / targets | **You** | Stage 0 decision file; model can't derive them |
| Skeleton (F, domains, coherency rule) | **You** (+ existing theory) | frozen before any run |
| Candidate enumeration | **You** | tens, hand-written JSON |
| Legality/resolution + 2p gates, value curves, depth | **Code (exists)** | VS2–VS4 after D1–D4 fixes |
| Realistic spellbook supply | **Code (small, new)** | sampler + playtest imports; the only new build |
| Per-count scorecards / Pareto view | **You + spreadsheet** | do NOT build VS5 as software |
| Multiplayer spot-check | **Code (one script)** | survivors only; S1 agents, seeds |
| Reward pricing, trial identity, feel levers | **You** | code checks prices, never invents them |
| Final pick among survivors | **You** | normative by design |

## What not to build (the over-engineering line)

- No automated config search (evolutionary/grid/Bayesian) — the space is tens, by hand.
- No base-game simulator — the sampler answers everything the AT choice needs.
- No multiplayer equilibrium anything (already prohibited in V2_1 §17.4).
- No VS5 software — a spreadsheet of per-count scorecards, worst count first, no
  cross-count averages.
- No full archetype matrix, no calibration modelling, no dashboards — the archetype
  spot-check is 10 pairs; complexity calibration is a stopwatch at the playtest.
- Nothing that runs once. If a stage's tooling takes longer to build than the manual
  loop it replaces across ~20 candidates, do it manually.

## Sequence and cost

Stage 0+1+2: two evenings of thinking and writing, no code. Stage 3 precondition:
D1–D4 metric fixes (small, already specified with regression tests in review 05).
Stage 4 sampler: one evening. Stage 5 script: one evening. Total *new* engineering
≈ two to three evenings; the rest is existing machinery, spreadsheets, and playtests.
If any stage starts growing beyond that, it has stopped saving time — cut it, not
the playtest.
