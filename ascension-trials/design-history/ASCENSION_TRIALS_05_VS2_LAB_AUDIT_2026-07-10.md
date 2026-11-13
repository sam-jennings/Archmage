---
title: VS2 Mathematical Laboratory — Narrow Adversarial Audit
type: design-review
date: 2026-07-10
status: for-decision — audit of the implemented VS2 exact laboratory as the foundation for 2–6p configuration analysis
reviews:
  - "ascension-trials/ascension_trials_model/ (VS2 source, tests, fixtures at the VS1+VS2 milestone)"
  - "ascension-trials/ascension_trials_model/docs/VS2_COMPLETION_REPORT.md"
relates_to:
  - "ascension-trials/ascension_trials_model/docs/ASCENSION_TRIALS_CONFIGURATION_MODEL_V2_1.md"
  - ".kiro/specs/ascension-trials-configuration-model/{requirements.md,design.md}"
  - "ascension-trials/design-history/ASCENSION_TRIALS_04_CONFIG_MODEL_ADVERSARIAL_REVIEW_2026-07-10.md"
purpose: Determine whether VS2 is mathematically trustworthy, what VS3/VS4 minimally need, a defensible 3–6p methodology, and what infrastructure to refuse. Every claim below marked ✓ was independently re-executed or re-derived during this audit, not read off the completion report.
---

# VS2 Laboratory Audit

Audit method: read all VS2 source (`enumerate.py`, `matrix.py`, `dominance.py`,
`equilibrium.py`, `metrics.py`, `canonical.py`, resolver utility/tiebreak paths,
`reports.py` gates), all VS2 fixtures and the acceptance suite; re-ran the 65 VS2 tests
plus VS1 resolver/legality spot checks (all green ✓); and ran independent probes the
suite does not contain: a corrected ∀∃-counterability check on A3/A4/A6 ✓, an
`E^0.01` slack-sensitivity sweep ✓, a recomputation of margin-VOI against the model
doc's own formula ✗ (defect B1), enumeration invariants on the real hybrid config with
a multi-domain + Wild state ✓, a genuine strategic-merge probe (9 legal → 6 classes,
interchangeable domains) ✓, and resolver timing (0.17 ms/call) ✓.

---

## A. Verdict on VS2

**Trustworthy with corrections.**

The exact core is sound and was independently reproduced end to end: enumeration
(A3 = 15 legal / 5 maximal; A4 = 84 = C(9,3); hybrid multi-domain state ledger-exact,
wild-gated, duplicate-free, source-count-clean), payoff matrices (win/margin
antisymmetry asserted in tests; symmetric fast path resting on the VS1-proven
player-swap symmetry), behavioural collapse (conservative signature; genuine merges
verified correct on a probe the fixture library lacks), iterated true strict dominance
(correct strict `>` both directions, correct column-player orientation, simultaneous
per-round removal, order-independence tested; A3's 14-round cascade to the lone turtle
survivor `(4,0)` reproduced ✓ and is mathematically right — the never-losing column
strategy progressively dominates weaker columns, unlocking row eliminations one per
round), the zero-sum LP (correct primal/dual, residuals, exploitability; A4 value 0 ✓),
the max-entropy equilibrium (domain is the true row-optimal polytope
`{x≥0, 1ᵀx=1, xᵀM ≥ v−slack}`; RPS sanity test; independent post-validation; explicit
non-silent failure path), and `E^0.01` (per-strategy max-mass LP matches REQ-13.4/5;
A4 membership stable at |E| = 15 under slack 0, 1e-9 and 1e-6 ✓, smallest included
mass ≈ 0.0139).

The defects are all in the **derived metrics/reporting layer**, not the exact engine —
but two of them sit exactly where configuration comparisons will read numbers, so they
block foundation use until fixed (§B).

---

## B. Blocking defects

**B1 — `margin_voi` does not implement the model's VOI_M and is materially wrong.**
V2_1 §14.2 defines VOI_M = E_{b∼σ_B}[max_a u^M(a,b)] − v_M: for each opponent pure
strategy b, the best-response margin *down the column*, weighted by the opponent's
equilibrium mixture. `metrics.py` computes the mean over all rows of each row's max
*across columns* (the opponent's most obliging reply, not the best reply to the
opponent), unweighted. Independently recomputed on A4: reported 8.0 vs correct ≈ 4.52
under the canonical mixture ✗ — a ~1.8× overstatement on a primary Pareto axis. Any
config comparison using the VOI axis, or the §15 depth-target band ("VOI at least one
smallest-Trial reward but below 40% of pool"), would be corrupted.

**B2 — G4/G5 counterability gates are not computed anywhere in the analysis path, and
the metric named `counterability_over_R` is a different quantity.** The implemented
metric is mean counter *mass* (my C3 diagnostic). The V2_1 hard gate G4 is the ∀b∃a
boolean over R (and over E^0.01), with G5's per-b margin floor and the "must win
through Trial awards, not the final Spellbook tiebreak" condition. None of these exist
in `metrics.py` or in `reports.vs2_hard_gates`. Consequence: a *new* configuration
analysed via `analyse-small` could contain an unbeatable turtle and the report would
show a plausible-looking counterability of, say, 0.49 (A4's value ✓) with no failed
gate — the turtle is only caught for the committed A3 fixture, where it is a
hand-transcribed oracle. The foundation must compute the gate, not just pass fixtures
that happen to encode it.

**B3 — the report's "hard-gate table" contains gates that cannot fail.** The
`reasonable_set_R` and `equilibrium_relevant_set_E_0_01` rows in `vs2_hard_gates` are
unconditional `PASS` entries that merely restate set sizes. A reviewer reading "all
hard gates pass" learns nothing; worse, it invites treating a size report as a
verified property. Either make them real gates (attach the G4/G5/G7 conditions) or
move them to a counts section.

None of B1–B3 invalidates any number in the VS2 completion report itself — the exact
counts, LP values and equilibrium diagnostics there were all independently confirmed ✓.
They invalidate the *next* step: reading `analyse-small` output as configuration
evidence.

---

## C. Non-blocking weaknesses

1. **Tie metrics are uniform-pair rates, not equilibrium-weighted.** G7's bounds are
   defined "under the canonical maximum-entropy equilibrium at parity"; `final_tie_rate`
   is over all ordered legal pairs. For A5 (rate 1) the distinction is invisible; for
   real configs it is the difference between a gate and trivia. Needed before any G7
   evaluation (fix alongside B-layer work).
2. **RP-tie-broken-by-final-chain is invisible.** `matrix.final_tie` stores post-chain
   `shared_first`; `final_tiebreak_usage` therefore counts terminal shares, not "the
   final Spellbook chain decided the winner" (win ≠ 0 with margin = 0). The fields to
   compute it exist; the metric doesn't. G7's second bound is currently unevaluable.
3. **`trial_shared_award_rate` is reconstructed from award signatures** (admitted in a
   comment) and labelled `exact exhaustive`. Exact at 2p first-only rewards; ambiguous
   once second-place rewards exist (first/second value collisions). Derive from
   resolver trial traces instead.
4. **Terminology conflation: "strict beater".** `dominance.strict_row_dominators_of`
   documents a strict *dominator* (better in every column) as a "strict beater";
   head-to-head beating (win[a,b] = 1) is a different relation. In A3 both counts are
   zero, so the tests pass for the right numbers, but the A3 fixture prose and the
   completion report gloss C1 backwards ("no single WTA line uniquely solves the
   state") — C1 fails because a never-losing pure strategy *exists*. Fix the prose
   before someone quotes it as a design conclusion.
5. **Parity-only pipeline.** `collapse_strategies` raises on asymmetric matrices and
   `compute_small_state_metrics` assumes symmetric self-play, so VS2 cannot analyse
   unequal states (Δ > 0) at all. In-scope for VS2; the single biggest capability gap
   for realistic two-player analysis (§E).
6. **Max-entropy equilibrium computed for the row player only.** Fine at parity by
   symmetry; asymmetric states need both sides.
7. **Refusal is estimated on pre-filter candidates.** The enumeration ceiling compares
   the closed-form *candidate* product (before legality filtering), so heavily
   constrained configs with few legal allocations can be refused. Conservative and
   loud, never wrong — acceptable; document it. The matrix guard (dim 10,000) is not
   the binding constraint either: at the measured 0.17 ms/resolve, a 10⁴×10⁴ matrix is
   ~10⁸ resolves ≈ 4.6 h ✓ — practical ceiling is nearer 2–3×10³ per side without the
   memoization noted in §E.
8. **Fixture library exercises no genuine strategic merge.** Every committed fixture
   has collapsed = legal (A4: 84 = 84; A5: 5 = 5). A15 tests *inflation invariance*
   only — it cannot catch a collapse that merges wrongly or fails to merge. My probe
   (two interchangeable fungible domains, budget 1+1, two trials: 9 legal → 6 classes,
   hand-computable ✓) shows the merge path is correct today; commit it as a fixture so
   it stays correct (§D, RT-4).
9. **Collapse signature is finer than utility-equivalence** (includes per-Trial award
   vectors). Never merges wrongly (safe); may leave utility-equivalent strategies
   distinct, slightly inflating "distinct strategy" counts. Acceptable — document that
   collapsed counts are behaviour-classes, not utility-classes.
10. **Dominance is O(n³)-ish per round in pure Python.** Fine at 84; will not reach the
    matrix ceiling. Vectorize with NumPy broadcasting when needed — semantics-preserving.

---

## D. Required corrections with regression tests

**D1 (fixes B1).** Reimplement `margin_voi` as VOI_M = Σ_b y_b · max_a margin[a,b] − v_M,
with y = the canonical max-entropy *column* mixture of the margin game (equal to the row
mixture at parity by symmetry; compute per side once asymmetric states exist). Record
which mixture was used; note in the report that VOI depends on equilibrium selection.
*Regression RT-1:* matching-pennies margin matrix [[1,−1],[−1,1]] → v = 0, y uniform,
VOI_M = 1 exactly (analytic). *RT-2:* A4 margin_voi ≈ 4.5167 (pin to 1e-6 as
`numerical_lp`+`numerical_convex`), and assert reported value ≠ the old row-max mean
(8.0) to prevent regression to the wrong axis.

**D2 (fixes B2).** Add to `SmallStateMetrics`: `c1_holds_over_R` and `c1_holds_over_E`
(booleans: ∀b∃a win[a,b] = +1 within the set), `unbeaten_strategies` (ids with
column-min ≥ 0 over the set), per-b best counter margin over E^0.01, the G5 floor
check (max_a margin[a,b] ≥ 1 for all b ∈ E^0.01), and the trial-award condition (a
counter counts only if win = 1 *and* margin > 0 — i.e., won on Recognition Points, not
via the final Spellbook chain). *Regression RT-3:* A3 → c1_holds_over_R = False with
`(4,0)` listed unbeaten; A4 and A6 → True over both R and E^0.01 ✓ (verified by probe).

**D3 (fixes B3).** `vs2_hard_gates` gains real conditions: G4/G5 from D2 and the
equilibrium-weighted tie bounds from D4; the two unconditional rows become a "counts"
block. *Regression:* A3's report shows a FAILED gate; A5's report fails the tie gate.

**D4 (fixes C1/C2).** Add equilibrium-weighted tie metrics: xᵀTx under the canonical
mixture (T = final-tie indicator), and the chain-decided rate (win ≠ 0 & margin = 0)
both uniform and equilibrium-weighted. *Regression:* A5 → equilibrium-weighted tie
probability 1 (any mixture); a hand-built 2×2 fixture where one pure pair is RP-tied
and chain-decided → chain-decided rate matches the analytic value.

**D5 (fixes C8).** Commit the merge probe as fixture A19: two interchangeable domains,
budget (1,1), trials (5,3), oracle "9 legal, 6 collapsed classes, class sizes
{1,1,1,2,2,2}" (hand-derivable; verified ✓). This is the only fixture that would catch
a collapse-merging bug.

**D6 (fixes C4).** Rename `strict_row_dominators_of` → `strict_dominators_of` and fix
the "strict beater" docstrings, the A3 fixture prose and the completion-report gloss:
"C1 fails because `(4,0)` never loses — an uncounterable pure strategy exists." No code
behaviour change; a doc-only oracle must not misstate the property it certifies.

**D7 (fixes C3).** Derive per-trial shared flags from resolver trial results, not award
signatures; keep the `exact exhaustive` label only after that. *Regression:* a fixture
with second-place rewards where first = second value, asserting the shared rate ignores
the collision.

Corrections D1–D4 are prerequisites for reading any `analyse-small` output as
configuration evidence; D5–D7 can land with VS3.

---

## E. Minimum VS3 capability for scalable two-player analysis

The proposed list (exact best response vs a fixed opponent *mixture*; cell-by-cell
validation against VS2; double-oracle restricted-game equilibrium; exploitability
stopping certificate) is the right list. **It is sufficient once two things are added,
and one hidden assumption is corrected:**

1. **The smallest required correction: the win-utility best response to a mixture is
   not a per-domain DP.** Margin-utility BR decomposes (margin is a sum of per-Trial
   award differences; budget coupling gives a knapsack-style DP per domain against the
   opponent's realized totals). Win-utility BR maximizes Σ_b y_b · sign(margin(a,b)) —
   a global, non-separable objective. Plan the exact win-BR oracle as an **integer
   program** (binary beat/tie/lose indicators per opponent support member, big-M linked
   to the linear RP totals; opponent support is small under double oracle, so the IP is
   tiny), seeded by the margin-DP solution and per-b pure best responses. If the VS3
   design assumes one DP oracle serves both utilities, double oracle will silently
   converge to the wrong game.
2. **Asymmetric-state support** (C5/C6): per-side collapse (signature over the fixed
   opponent list — the definition already generalizes), per-side canonical equilibria,
   and `compute_small_state_metrics` accepting z_A ≠ z_B. Without this, no strength
   path, no Δ_G/Δ_R, no realistic pair — "realistic two-player analysis" is exactly the
   asymmetric case.
3. **Resolver memoization by canonical signature pair** (semantics-preserving: cells
   depend only on the two allocations' canonical keys), which raises the practical
   exact-matrix ceiling well above the current ~2–3k per side without touching resolver
   semantics. Validation: memoized matrix byte-identical to direct on all committed
   fixtures.

Cell-by-cell validation against VS2 exhaustive matrices on every committed fixture is
the correct gate for all of the above and needs no change.

---

## F. Minimum VS4 method and stopping certificate

**Method:** standard double oracle on the win game (margin game separately): maintain
restricted strategy sets; solve the restricted zero-sum LP; call the exact full-space
BR oracle (§E) against both restricted mixtures; add any BR with positive gain; stop
when neither side gains.

**Stopping certificate:** ε-exploitability in the *full* game, certified by the exact
oracle: gap(x̂, ŷ) = [max_a u(a, ŷ)] − [min_b u(x̂, b)], both terms computed by the
full-space BR oracle, never by restricted-set search. Report the gap with the LP
tolerances; declare convergence at gap ≤ ε with ε explicit (utilities are integers, so
the oracle terms are exact rationals given the float mixtures — the only numerical
slack is the LP mixture itself). On non-convergence within the iteration cap: report
the certified interval [min_b u(x̂,b), max_a u(a,ŷ)] for the value and label it as a
bound, never an estimate. **Gate:** VS4 must reproduce the VS2 LP value on every
committed fixture (A4, A5, A6, MATH-14) to within LP tolerance with gap ≤ 1e-9, and on
at least one state too large for VS2 enumeration must produce a certificate that an
independent second oracle run re-verifies.

Nothing more is minimally required. Warm starts, support heuristics and parallel BR
calls are optimizations to add only when a real state stalls.

---

## G. Defensible VS5 methodology for cross-count candidate evaluation

Comparing (i) one universal configuration, (ii) count-varying rewards/Trial lists,
(iii) count-varying resolution semantics:

1. **Per-count scorecards, never cross-count aggregates.** Every gate and every primary
   axis is computed and reported per player count (2, 3, 4, 5, 6). A configuration's
   summary is the *vector* of per-count results plus its single worst count, displayed
   first. No mean, no weighted sum across counts — an average is precisely the device
   that hides a broken 2p game behind a healthy 5p one.
2. **Hard gates are per-count vetoes.** A configuration failing any hard gate at any
   supported count fails outright for that count; a "universal" candidate that fails at
   one count is not universal — it is a per-count family with a hole.
3. **Universal-vs-varying decision rule** (V2_1 §19.3, endorsed with two refinements):
   a universal configuration is preferred iff (a) it passes all hard gates at every
   count, and (b) on each primary axis, at each count, it is within a declared
   per-axis tolerance of the best count-specific candidate *at that count*. Refinement
   one: the "within 10%" comparisons need declared per-axis normalizations (value
   curves in win-probability units; VOI in units of r_min; entropy normalized) —
   without them the 10% is not well-defined. Refinement two: rank candidates
   lexicographically by *worst count first* (maximin across counts on the gate-margin,
   then the §19.3 order), which structurally prevents strength at one count buying
   forgiveness at another.
4. **Class (iii) — count-varying resolution semantics — carries an extra burden:** each
   semantic variant is a distinct configuration for the resolver and must pass the full
   adversarial fixture family (turtle, tie-fest, floored-turtle A18-style) *per
   variant*; and the report must show the teach-cost delta explicitly (a semantics
   change between 4p and 5p is a rules-complexity event, not a parameter tweak). The
   model can price it; whether it is acceptable is Sam's §4-class normative call.
5. **Evidence discipline:** per-count results at 2p are exact/certified (VS2/VS4);
   3–6p results are exact-given-profile + sampled (§H) and must be labelled as such in
   the same table — a cross-count comparison must never silently mix an exact 2p value
   with a sampled 5p rate as if commensurate; the scorecard carries the evidence class
   per cell.

---

## H. Defensible VS6 methodology for 3–6 players

The proposed plan (exact unilateral BR against fixed profiles; exact-given-profile
regret/exploitability; bounded-rational populations; seeded repetitions with CIs;
opponent-model sensitivity) **is mathematically honest and sufficient for comparing
configurations**, with these bindings:

1. **Profile distributions must come from the declared S1/S2 populations, not uniform
   sampling.** Kingmaker/spoiler/contender rates against uniform-random profiles are
   statements about noise. Every empirical 3–6p metric is conditional on the generating
   population and must be stamped with it (V2_1 §17 already implies this; make it a
   report-schema requirement).
2. **Formalize "plausible contender"** as exact-given-profile: player i is a contender
   in a profile iff some legal allocation of i achieves sole or shared first against
   the others' fixed allocations — computable with the §E oracle, no equilibrium needed.
3. **Missing and indispensable: sensitivity bands.** The plan lists sensitivity as an
   idea; make it mandatory output — every 3–6p headline metric is reported as a band
   across the declared S2 parameter grid (and across S1 portfolio weightings), with the
   conclusion holding only if the band does. A config ranking that inverts inside the
   band is reported as "not separated", not as a winner.
4. **Cheap stability diagnostic (optional, honest):** iterated best-response dynamics
   from population profiles (does unilateral improvement cycle or settle?). Reported as
   a dynamics observation, never as equilibrium existence.
5. **Prohibited claims stand:** no general multiplayer Nash claims. The proposed
   methods are demonstrably sufficient for every §17.3 target (each is exact-given-
   profile or a population rate), and a general equilibrium solver would add
   selection ambiguity, PPAD-class cost and no gate the targets need — the burden in
   the audit brief is met: nothing in the 3–6p plan requires it.
6. **Reserved for humans** (unchanged): felt kingmaking, lower-place engagement,
   collusion/signalling, teach burden, timing/error calibration for the complexity
   model.

---

## I. Explicit over-engineering to exclude

- Any generic n-player Nash/equilibrium solver (support enumeration, Lemke–Howson
  beyond 2p, PPAD machinery) — see §H.5.
- Learning/CFR/RL frameworks for allocation play — S1/S2 + exact BR cover the need.
- Exact rational-arithmetic LP as the default — float HiGHS at 1e-9 on integer
  payoff matrices is adequate; keep exact rational re-solve as a *named escalation*
  used only if a gate decision ever sits within 1e-6 of its boundary (none does today;
  A4's nearest E^0.01 mass is 0.0139 vs threshold 0.01 ✓).
- A general game-description language beyond the current config schema; the schema
  already expresses every committed and proposed variant.
- GPU/parallelism/distributed infrastructure before a single double-oracle run has
  stalled on a real state.
- Multiplayer double oracle or multiplayer matrix materialization (|R|ⁿ tensors).
- Symbolic/algebraic threshold solving — path sweeps at 1-card granularity suffice.
- Deeper S2 cognitive modelling than the five declared parameters.
- Web dashboards, databases, artifact platforms for reports — deterministic JSON/MD
  files under version control are the requirement and are already implemented.

---

## J. Recommended implementation and review gates

1. **Gate VS2-C (corrections, before any config conclusion):** D1–D4 implemented with
   RT-1..RT-3 and the D3/D4 regressions green; D5–D7 may trail into VS3. Re-issue the
   small-state report for the four toys; A3 must now show a failed counterability gate.
2. **Gate VS3:** exact BR oracles (margin-DP + win-IP) validated cell-by-cell against
   VS2 exhaustive matrices on *all* committed fixtures, including asymmetric-state
   metrics on at least one hand-built unequal pair; memoized matrix byte-identical to
   direct construction.
3. **Gate VS4:** double oracle reproduces every VS2 equilibrium value within tolerance
   with certified gap ≤ 1e-9; one beyond-VS2 state with an independently re-verified
   ε-certificate; non-convergence path demonstrated to emit a bound, not an estimate.
4. **Gate VS5:** a planted dominance-staircase fixture (A13-style) reproduced along a
   card-space path; per-count scorecard schema with per-cell evidence classes; the
   universal-vs-varying rule executed on at least two candidate configs with the
   worst-count-first ordering visible in the output.
5. **Gate VS6:** byte-identical seeded reproduction of a full 3–6p run; sensitivity
   bands present on every headline metric; a demonstration that a deliberately
   perturbed opponent model flips a near-tied comparison into "not separated".
6. **Standing rule (unchanged from the working system):** each gate is a stop-for-
   approval with its own completion report; deviations listed, never absorbed.

---

*Evidence classes in this audit: independent re-execution ✓ (test suite, probes,
timings), exact re-derivation (A3 cascade logic, turtle/counterability semantics,
VOI formula), and design judgement (G/H/I/J recommendations). The single numerical
discrepancy found anywhere: reported margin_voi 8.0 vs correct ≈ 4.5167 on A4 (B1).*
