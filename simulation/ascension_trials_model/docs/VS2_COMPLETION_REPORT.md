---
title: Ascension Trials Configuration Model — VS2 Completion Report
type: spec-report
spec: ascension-trials-configuration-model
scope: VS2
updated: 2026-07-10
status: approved
approved: 2026-07-10
vs2c_gate: approved
vs2c_approved: 2026-07-10
---

# VS2 Completion Report — Ascension Trials Configuration Model

> **VS2-C correction pass (2026-07-10):** the VS2 exact engine was accepted by the
> narrow adversarial audit (`_review/ASCENSION_TRIALS_05_VS2_LAB_AUDIT_2026-07-10.md`),
> which found blocking defects **D1–D7 in the derived-metrics/reporting layer only**.
> Those defects are now fixed. Sections 1–12 below describe the original VS2 milestone
> (pre-correction) and are retained as the historical gate record; **§13 documents the
> VS2-C corrections, the corrected metrics, and the new test counts/commands, and is the
> current state of the package.** The exact engine (enumeration, matrices, collapse,
> dominance, LP, max-entropy, E^0.01) is unchanged — every count/value in §1–12 still
> reproduces.


This report is the **VS2 approval gate** (spec Task 25, REQ-14 / REQ-15). It is the
stop-for-review artifact for VS2 — the small-state exact laboratory: allocation
enumeration, strategic-equivalence collapse, exhaustive two-player payoff matrices,
iterated true strict-dominance elimination, the numerical zero-sum LP, the canonical
maximum-entropy equilibrium, the equilibrium-relevant set \(\mathcal E^{0.01}\), and
the VS2 metrics/reports. **VS1 is approved and its suite is preserved unchanged and
green. VS3–VS6 have not been started and will not begin without a new approval.**

- **Spec:** `.kiro/specs/ascension-trials-configuration-model/`
- **Package:** `simulation/ascension_trials_model/`
- **Code revision:** committed as the single deliberate VS1+VS2 milestone commit on
  top of `71cad20` (the resolved milestone hash is recorded in the session
  verification log accompanying this approval)
- **Environment:** CPython 3.13.5, NumPy 2.3.3, SciPy 1.16.0 (pinned in
  `requirements.lock`)

Evidence-class discipline (REQ-14.3, impl spec §3.4) is enforced throughout: exact
enumeration/dominance/tie results are `exact exhaustive`, zero-sum game values are
`numerical_lp`, and the canonical equilibrium is `numerical_convex`. No floating-point
result is labelled exact; exact limits are never silently replaced by sampling.

---

## 1. Complete VS2 test command and output

Run from `simulation/ascension_trials_model/`:

```bash
python -m pytest -q
```

Result (full summary line):

```
443 passed in 48.78s
```

Exit code `0`. This is the **whole** suite: the **378 VS1 tests are preserved and
green** and **65 new VS2 tests** were added (378 + 65 = 443). The VS2 modules alone:

```bash
python -m pytest tests/test_enumeration.py tests/test_matrix_collapse.py \
  tests/test_dominance.py tests/test_equilibrium.py \
  tests/test_vs2_reports.py tests/test_vs2_acceptance.py -W error::UserWarning -W error::RuntimeWarning
```

```
65 passed in 57.61s
```

The `-W error` run promotes any NumPy/SciPy `UserWarning`/`RuntimeWarning` to a
failure; the suite is clean under it, so the numerical solvers emit no warnings.

VS2 test modules (all green):

| Module | Tests | Covers |
|---|---|---|
| `tests/test_enumeration.py` | 19 | REQ-10 enumeration, weak compositions, estimate, ceiling refusal, maximality |
| `tests/test_matrix_collapse.py` | 9 | REQ-11/12 payoff matrices, antisymmetry, collapse, A15 invariance, matrix limit |
| `tests/test_dominance.py` | 6 | REQ-11 strict/weak dominance, MATH-13, A3 strict beaters |
| `tests/test_equilibrium.py` | 9 | REQ-12/13 LP, max-entropy, E^0.01, MATH-14 |
| `tests/test_vs2_reports.py` | 5 | REQ-14 metrics + deterministic small-state report |
| `tests/test_vs2_acceptance.py` | 17 | consolidated A3–A6/A15/MATH-13/MATH-14 gate + coverage map |

Every VS2 requirement (REQ-10..REQ-13 and the VS2 additions to REQ-14) is mapped in
`REQUIREMENT_COVERAGE` in `tests/test_vs2_acceptance.py`, kept honest by
`test_coverage_map_covers_every_vs2_requirement` and
`test_coverage_map_references_only_existing_tests`.

---

## 2. Exact results for A3–A6

All four fixtures are committed data (`fixtures/adversarial/`) referencing the toy
configs (`configs/toy/`); every oracle is transcribed from
`docs/ASCENSION_TRIALS_KIRO_IMPLEMENTATION_SPEC_V1_1.md` §14/§15, not reverse-engineered
(REQ-9.4). Counts are `exact exhaustive`.

| Fixture | Config | Legal allocations | Key exact oracle | Result |
|---|---|---|---|---|
| **A3** Turtle | budget 4, Trials 5/3, optional | **15** (= closed-form estimate 15) | `(4,0)` has **zero strict beaters**; C1 fails | PASS |
| **A4** Counter cycle | budget 6, Trials 5/4/3, optional | **84** | **0** unbeaten; 3-cycle present | PASS |
| **A5** Tie-fest | budget 4, Trials 5/5, full | **5** | every non-mirror pair is a 5–5 tie; tie rate **1** | PASS |
| **A6** Counterable-poor | budget 6, Trials 4/4/4, optional | **84** | **0** unbeaten; ordered-pair tie rate **1/3** (exact) | PASS |

- **A3.** 15 legal allocations `{(a,b) : a+b ≤ 4}`. `(4,0)` never loses (it wins or
  ties the 5-point Trial against any budget-4 opponent), so it has no strict beater and
  survives iterated strict elimination (which collapses the turtle config to the single
  survivor `(4,0)` over 14 rounds). "C1 fails" in the sense that no single winner-take-all
  line uniquely solves the state.
- **A4.** 84 legal allocations `{(a,b,c) : a+b+c ≤ 6}`; **no allocation is unbeaten**.
  The named counter cycle holds with strict wins: `(0,1,1)` beats `(3,0,0)` beats
  `(0,2,0)` beats `(0,1,1)` (each `win[X][Y] = +1`, `win[Y][X] = -1`).
- **A5.** 5 legal allocations under FULL completion; every ordered pair (including
  mirrors) is a final Recognition-Point tie, so the ordered-pair tie rate is exactly `1`.
- **A6.** 84 legal allocations; **0 unbeaten**; the ordered-pair final-tie rate is the
  exact fraction **1/3** (over all 84×84 ordered pairs).

---

## 3. Strict-versus-weak dominance verification (MATH-13)

Fixture `fixtures/adversarial/math13_weak_not_strict.json`, row payoff `M = [[1,1],[1,0]]`:

- **True strict dominance** uses `>` in *every* column. No strategy is strictly
  dominated → iterated elimination removes nothing: survivors rows `["r0","r1"]`,
  cols `["c0","c1"]`, **0 rounds**.
- **Weak-dominance diagnostics** correctly flag the weak-but-not-strict relations:
  row `r1` is weakly dominated by `r0` (`strict = false`); column `c0` is weakly
  dominated by `c1` (`strict = false`). Neither feeds the reasonable set (REQ-11.4).

Iteration mechanics are separately verified: `test_strictly_dominated_removed_simultaneously_in_one_round`
(all dominated strategies fall in one round) and `test_fixed_point_is_independent_of_row_permutation`
(order-independent fixed point, REQ-11.6). A4 has **no** strict domination (|R| = 84).

---

## 4. Payoff-matrix and strategic-collapse counts

Payoff construction is exhaustive and integer-exact (REQ-12.2); for symmetric self-play
one resolve fills cells `(i,j)` and `(j,i)` via the resolver's proven player-swap
symmetry (REQ-7.3).

| Fixture | Matrix | Win/margin antisymmetric | Collapsed classes | |R| (strict-dominance survivors) |
|---|---|---|---|---|
| A3 | 15×15 | yes | — | 1 |
| A4 | 84×84 | yes | **84** (no behavioural duplicates) | 84 |
| A5 | 5×5 | yes | 5 | — |
| A6 | 84×84 | yes | 84 | 84 |

- **Strategic-equivalence collapse** groups strategies with identical complete row+column
  behaviour (win, margin, final-tie flag, Trial-award vector) and keeps a
  representative→members map (REQ-11.1/11.2).
- **A15 equivalence inflation (MATH-12):** adding an unenterable "vault" Trial (a
  `locked` domain the player holds 0 of) leaves every strategic metric identical to A4 —
  legal count **84**, collapsed classes **84**, |R| **84**, |\(\mathcal E^{0.01}\)| **15**,
  final-tie rate **1/84**, win value 0. The inflated candidates are all filtered as
  illegal entries, so no behaviourally-distinct strategy is added.

---

## 5. LP values and residuals (`numerical_lp`)

Solver: `scipy.optimize.linprog(method='highs')`; tolerance `1e-9`. Win and margin games
are solved **separately** (REQ-12.3). A4 (MATH-11):

| Game | Value | Exploitability | Primal residual | Dual residual | Value gap | Status |
|---|---|---|---|---|---|---|
| Win | `-0.0` (\|v\| ≤ 1e-9 ✓) | `3.47e-16` | `1.80e-16` | `1.67e-16` | `0.0` | HiGHS Optimal |
| Margin | `0.0` | `5.48e-14` | — | — | — | HiGHS Optimal |

The A4 win game value is within `1e-9` of zero and the equilibrium is **mixed**
(support > 1). All residuals are within tolerance. Both symmetric zero-sum games have
value 0, as expected for an antisymmetric payoff matrix.

---

## 6. Maximum-entropy equilibrium results (`numerical_convex`)

Solver: `scipy.optimize.minimize(method='trust-constr')` over the optimal-strategy
polytope `{x ≥ 0, 1ᵀx = 1, xᵀM ≥ value}` with deterministic uniform initialization,
analytic gradient + Hessian, and **independent** post-solve validation of the optimality
constraints (Task 21; a conservative solver flag does not by itself reject a
numerically-optimal point). On validation failure it reports
`canonical_equilibrium_failed` and returns the LP vertex separately — never a silent
substitution (impl spec §11.3).

A4 canonical equilibrium:

- valid = **true** (`status = "ok (solver_status=1)"`);
- Shannon entropy **2.5160**, normalized entropy **0.5678**;
- support at 1e-9 / 1e-3 / 1e-2 = **32 / 15 / 15** (mixed);
- feasibility residual **0.0**, optimality residual **9.87e-8** (within the recorded
  `ENTROPY_OPTIMALITY_TOLERANCE = 1e-6`).

Sanity check (`test_max_entropy_prefers_uniform_on_a_symmetric_game`): the max-entropy
equilibrium of Rock-Paper-Scissors is the uniform `(1/3, 1/3, 1/3)` within `1e-6`.
Determinism verified: repeated solves are bit-identical.

---

## 7. \(\mathcal E^{0.01}\) verification (MATH-14)

Fixture `fixtures/adversarial/math14_equilibrium_mass.json`, `M = [[1,-1],[-1,1],[0,0],[-2,-2]]`,
game value 0. Per-strategy maximum equilibrium mass (one LP per strategy over the optimal
polytope, threshold `0.01 - 1e-9`):

| Strategy | Analytic max mass | Computed | In \(\mathcal E^{0.01}\)? |
|---|---|---|---|
| s0 | 1/2 | 0.5000000 | yes |
| s1 | 1/2 | 0.5000000 | yes |
| s2 | 1 | 1.0000000 | yes |
| s3 | 0 | 5.0e-8 | **no** (dominated) |

`included = [0, 1, 2]`, s3 excluded. The s3 residual `5e-8` is the optimal-polytope
numerical slack (`POLYTOPE_SLACK = 1e-7`); it is exactly-0 analytically and well inside
the fixture's declared `mass_tolerance = 1e-6` and far below the 0.01 inclusion threshold.
This is a documented numerical deviation, not an oracle change (see §10).

---

## 8. Matrix and memory limits (REQ-10.4, REQ-12, NFR-4)

Exact analysis is bounded and never degrades to sampling:

- **Enumeration:** closed-form candidate estimate computed *before* materializing;
  `enumerate_allocations(..., max_allocations=…)` raises `EnumerationLimitError` when the
  estimate exceeds the ceiling (default `DEFAULT_MAX_ALLOCATIONS = 200000`). Verified:
  A4 (84 candidates) refuses at `max_allocations=10` with `estimate=84, limit=10`.
- **Payoff matrix:** `MatrixLimitError` on dimension `> MAX_MATRIX_DIM = 10000` per side
  (impl spec §13.2) or an estimated `> MAX_MATRIX_BYTES = 536870912` (512 MiB). The
  dimension guard is unit-tested.
- **No silent sampling:** there is no Monte Carlo fallback anywhere in the exact path
  (REQ-10.5); over-limit states raise explicitly.

Recorded numerical constants (all printed into reports): `LP_TOLERANCE = 1e-9`,
`ENTROPY_FEASIBILITY_TOLERANCE = 1e-8`, `ENTROPY_OPTIMALITY_TOLERANCE = 1e-6`,
`POLYTOPE_SLACK = 1e-7`, `E_MASS_THRESHOLD = 0.01`, `E_MASS_TOLERANCE = 1e-9`.

---

## 9. Files changed

### New source modules (`src/ascension_trials/`)
- `enumerate.py` — weak-composition enumeration, closed-form size/memory estimate, `EnumerationLimitError`, maximality counts
- `matrix.py` — `build_two_player_payoff_matrix` (symmetric fast-path), `collapse_strategies`, `MatrixLimitError`
- `dominance.py` — iterated true strict-dominance elimination, weak-dominance diagnostics, `strict_row_dominators_of`
- `equilibrium.py` — `solve_zero_sum` (HiGHS, `numerical_lp`), `max_entropy_equilibrium` (`numerical_convex`), `equilibrium_relevant_set` (\(\mathcal E^{0.01}\))
- `metrics.py` — `compute_small_state_metrics` (all impl-spec §16 metrics)

### Modified source
- `reports.py` — added `build_small_state_report`, `vs2_evidence_class_table`, `vs2_hard_gates`, `_md_small_state`, and the `small-state` render dispatch
- `cli.py` — implemented the `analyse-small` VS2 command (was a stub)

### New committed fixtures (`fixtures/adversarial/`)
- `a3_turtle.json`, `a4_counter_cycle.json`, `a5_tie_fest.json`, `a6_counterable_poor.json`, `a15_equivalence_inflation.json`, `math13_weak_not_strict.json`, `math14_equilibrium_mass.json`

### New tests (`tests/`)
- `vs2_support.py` (loader helper), `test_enumeration.py`, `test_matrix_collapse.py`, `test_dominance.py`, `test_equilibrium.py`, `test_vs2_reports.py`, `test_vs2_acceptance.py`

### Modified tests
- `test_cli_reports.py` — the placeholder `test_analyse_small_is_a_stub_that_errors` was
  repurposed to `test_analyse_small_requires_config_and_state` (see §10); no VS1
  mathematical oracle or fixture was touched or weakened.

### Spec / docs / housekeeping
- `.kiro/specs/ascension-trials-configuration-model/tasks.md` — Tasks 16–25 checked
- `simulation/ascension_trials_model/docs/VS1_COMPLETION_REPORT.md` — status → approved (gate approval section added)
- `simulation/ascension_trials_model/README.md` — status updated (VS1 complete/approved, VS2 in progress)
- `.gitignore` — added local `.venv/` entries (see §10)
- `docs/VS2_COMPLETION_REPORT.md` — this report

---

## 10. Unresolved warnings and deviations

Listed honestly. None blocks the VS2 gate.

1. **MATH-14 s3 residual mass `5e-8` (numerical, within tolerance).** The strictly
   dominated strategy s3 has analytic equilibrium mass 0; the computed maximum is
   `5e-8`, produced by the optimal-polytope slack `POLYTOPE_SLACK = 1e-7`. It is inside
   the fixture's declared `mass_tolerance = 1e-6` and far below the 0.01 inclusion
   threshold, so s3 is correctly excluded from \(\mathcal E^{0.01}\). Documented, not an
   oracle change.

2. **One VS1 CLI test repurposed (behavioural, expected).** `test_analyse_small_is_a_stub_that_errors`
   asserted the VS2 `analyse-small` command was an unimplemented stub. Implementing VS2
   (Task 23, design §13.3) necessarily makes that command real, so the test was updated
   to `test_analyse_small_requires_config_and_state` (it still verifies the explicit
   exit-2 error path when required arguments are missing, NFR-4). The command's success
   path is exercised by the VS2 suite. **No VS1 mathematical oracle, fixture, or
   determinism/purity guarantee was weakened;** the other 377 VS1 tests are byte-for-byte
   unchanged and green.

3. **`.venv/` structure flag (benign, local, gitignored).** `node meta/checks/check.mjs`
   now reports one new structural flag — an undeclared root `.venv/` folder. It is a
   local Python virtual environment auto-created by the IDE's Python tooling during this
   session (not by any project code) and is **not** part of the deliverable. It was added
   to `.gitignore` (so it is never committed) but could not be deleted because a live IDE
   process holds a lock on `.venv/Scripts/python.exe`, and it is deliberately **not**
   declared in `meta/manifest.yml` because the checker also flags declared-but-missing
   folders (a venv does not exist on a fresh checkout). It affects no test and no
   deliverable.

4. **`2026-07-06-at-entry-model-secret-allocation.md` propagation flag — pre-existing,
   unrelated.** The same open-propagation flag noted in the VS1 report; unrelated to this
   spec and untouched here.

---

## 11. Gate decision

VS2 is complete and green: `443 passed` (378 VS1 preserved + 65 new VS2), zero solver
warnings under `-W error`. Every VS2 requirement is mapped to a test; A3–A6 exact counts,
the strict-vs-weak dominance distinction, the A4 numerical equilibrium (value 0, mixed,
residuals ≤ 1e-13), the canonical maximum-entropy equilibrium, \(\mathcal E^{0.01}\), the
A15 collapse invariance, and the matrix/enumeration limits are all reproduced from
committed source-backed oracles. Exact, `numerical_lp`, and `numerical_convex` claims are
labelled separately; exact ceilings never fall back to sampling.

**Stop for review. VS3–VS6 have not been started and will not begin without a new
approval.**

---

## 12. Approval

**Status: approved — 2026-07-10.** VS2 is accepted at the Task 25 gate. All warnings
and numerical deviations documented in §7 and §10 are **retained as-is and accepted**;
approval does not erase or resolve them — it accepts them as understood, non-blocking,
and correctly characterized (exact vs. `numerical_lp` vs. `numerical_convex` labels
intact; the MATH-14 `5e-8` polytope-slack residual, the repurposed VS1 CLI test, the
benign gitignored `.venv/` structure flag, and the pre-existing unrelated at-entry-model
propagation flag all stand as written).

The completed VS1 and VS2 implementation is captured as a single deliberate milestone
commit on top of `71cad20`. VS3–VS6 remain unstarted and require a **new Kiro spec**
(its own requirements, design, and tasks); the current Tasks 1–25 end here at the VS2
gate and are not to be extended by ad hoc coding.

---

## 13. VS2-C correction pass (2026-07-10)

This section is the **VS2-C approval gate**. The VS2 exact engine was accepted by the
narrow adversarial audit (`_review/ASCENSION_TRIALS_05_VS2_LAB_AUDIT_2026-07-10.md`,
verdict "trustworthy with corrections"). The audit independently reproduced the exact
core end to end and located blocking defects **only in the derived-metrics/reporting
layer**. This bounded pass fixes D1–D7; no change was made to enumeration, payoff
construction, strategic collapse, iterated strict dominance, the zero-sum LP, the
maximum-entropy equilibrium, or E^0.01, so every count and value in §1–12 still
reproduces exactly.

### 13.1 Corrections implemented

- **D1 — margin VOI (fixes B1).** `metrics.margin_voi` now computes the model's VOI_M
  (`VOI_M = Σ_b y_b · max_a margin[a,b] − v_M`) with `y` the canonical maximum-entropy
  **column** mixture of the *margin* game (`equilibrium.max_entropy_equilibrium_column`;
  equal to the row mixture at parity, computed per side so it generalizes to asymmetric
  states). The report records which mixture was used and that VOI depends on equilibrium
  selection. The pre-correction metric returned the unweighted mean of per-row maxima.
  - **A4 margin VOI: old (defective) `8.0` → new `4.516666770127806` (≈ 4.5167).**
    Regressions: matching-pennies `[[1,−1],[−1,1]]` gives VOI_M = 1 exactly (RT-1); A4
    pins to ≈ 4.5167 with an explicit assertion that the value is **not** the old `8.0`
    (RT-2).

- **D2 — real counterability gates (fixes B2).** `SmallStateMetrics` now carries the
  G4 boolean (`counter_R.c1_holds`, `counter_E.c1_holds`) over both `R` and `E^0.01`,
  the unbeaten-strategy list, the per-opponent best counter margin, and the G5 margin
  floor. A counter counts only if it wins **through Recognition Points** — `win = 1`
  *and* `margin > 0` — never on the final Spellbook tiebreak alone. Regressions: A3
  fails counterability over both sets and lists `(4,0)` unbeaten (RT-3); A4 and A6 pass
  over both `R` and `E^0.01`.

- **D3 — repaired hard-gate table (fixes B3).** `reports.vs2_hard_gates` no longer emits
  the unconditional `reasonable_set_R` / `equilibrium_relevant_set_E_0_01` PASS rows
  (those sizes are diagnostic counts in report §2). It now emits real, failable gates:
  equal-state counterability (G4) over `R` and `E^0.01`, counter quality (G5) over
  `E^0.01`, and the three equilibrium-weighted tie gates (G7). **A3 now produces a
  failed counterability gate; A5 produces a failed tie gate.**

- **D4 — equilibrium-weighted tie metrics (fixes C1/C2).** Added the equilibrium-
  weighted final-tie probability (`xᵀ T y` under the canonical row/column win-game
  mixtures) and the final-chain-decided rate (`win ≠ 0 & margin == 0`) both uniform and
  equilibrium-weighted. The bilinear form uses the row and column mixtures separately
  (asymmetric-ready). Regressions: A5 equilibrium-weighted tie probability = 1; a
  hand-built 2×2 chain-decided rate matches the analytic 1/2.

- **D5 — genuine collapse fixture A19.** Committed
  `fixtures/adversarial/a19_interchangeable_collapse.json` (+ `configs/toy/interchangeable_5_3.json`):
  two interchangeable domains, budget `(1,1)`, Trials `(5,3)` → **9 legal, 6 collapsed
  classes, class sizes `{1,1,1,2,2,2}`**. This is the only committed fixture whose
  collapse is a genuine merge (collapsed < legal), so it can catch a merge bug that
  A15's inflation-invariance cannot.

- **D6 — terminology / C1 prose (fixes C4).** `dominance.strict_row_dominators_of` is
  renamed to `strict_dominators_of` (deprecated alias retained). "Dominator" is reserved
  for improvement against **every** opposing strategy; "head-to-head winner/counter" for
  `win[a,b] = 1`. The A3 fixture prose and this report now read: **"C1 fails because
  `(4,0)` never loses; an uncounterable pure strategy exists."**

- **D7 — trial-sharing from resolver traces (fixes C3).** `PayoffMatrix.trial_shared_flags`
  is populated from the resolver's `TrialResult.shared_first`, and
  `trial_shared_award_rate` is derived from it — never reconstructed from award-value
  signatures. Regression A20 (`a20_shared_trace.json`, first = second = 2): a non-tied
  Trial whose winner and runner-up bank the same award value is **not** counted as
  shared; the corrected rate is `2/9` (the discredited award-signature method reported
  `4/9`).

### 13.2 Corrected metrics for the four toys (regenerated `analyse-small` reports)

Reports regenerated to `outputs/{a3,a4,a5,a6}/` (git-ignored, REQ-15.4). Gate outcomes
below are **honest**: A3/A5 are broken-by-design and now fail the appropriate gates; A4
is a counter-cycle exemplar (it passes counterability but legitimately fails the tie
gates, as it was never a tie-discipline exemplar).

| Fixture | Margin VOI | G4 over R | G4 over E^0.01 | G5 over E^0.01 | G7 final-shared (eq-wt) | Per-Trial shared |
|---|---|---|---|---|---|---|
| **A3** turtle | ≈ 2.0e-7 | **fail** — `(4,0)` unbeaten | **fail** — `(4,0)` unbeaten | fail | fail (1.000) | 2/15 |
| **A4** counter cycle | **4.51667** (was 8.0) | pass | pass | pass | fail (0.0928) | 29/252 |
| **A5** tie-fest | 0.0 | fail (all 5 unbeaten) | fail | fail | **fail (1.000)** | 4/25 |
| **A6** counterable-poor | 4.0 | pass | pass | pass | fail (0.482) | 29/252 |

Uniform tie rates are unchanged from §2 (A4 `1/84`, A5 `1`, A6 `1/3`); the corrected
equilibrium-weighted G7 figures are new.

### 13.3 Tests and exact commands/outputs

Run from `simulation/ascension_trials_model/`. Environment unchanged: CPython 3.13.5,
NumPy 2.3.3, SciPy 1.16.0.

Complete suite (378 VS1 preserved + VS2 including 13 new VS2-C regressions = 456):

```
python -m pytest -q
```
```
456 passed in 117.67s (0:01:57)
```

VS2 modules under warnings-as-errors (no solver warning promoted to failure):

```
python -m pytest tests/test_enumeration.py tests/test_matrix_collapse.py \
  tests/test_dominance.py tests/test_equilibrium.py \
  tests/test_vs2_reports.py tests/test_vs2_acceptance.py \
  -W error::UserWarning -W error::RuntimeWarning -q
```
```
78 passed in 115.06s (0:01:55)
```

New VS2-C regressions: `test_a4_margin_voi_is_corrected_and_not_the_old_row_max_mean`,
`test_margin_voi_matching_pennies_is_exactly_one`,
`test_a5_equilibrium_weighted_final_tie_probability_is_one`,
`test_chain_decided_rate_matches_analytic_on_hand_built_2x2` (test_equilibrium.py);
`test_a3_counterability_fails_and_lists_turtle_unbeaten`,
`test_counterability_holds_over_R_and_E` (A4, A6),
`test_a19_interchangeable_domains_collapse`,
`test_a20_trial_shared_rate_ignores_award_value_collision` (test_vs2_acceptance.py);
`test_a3_report_fails_counterability_gate`, `test_a5_report_fails_tie_gate`
(test_vs2_reports.py); plus the renamed/strengthened
`test_a3_4_0_has_zero_strict_dominators` (test_dominance.py). All prior VS1 and VS2
tests are preserved; the two report tests that asserted the removed unconditional
set-size gates were updated to assert the new real gates.

### 13.4 Files changed in VS2-C

- Source: `metrics.py` (D1/D2/D4/D7 metrics + gate helpers), `equilibrium.py`
  (`max_entropy_equilibrium_column`), `matrix.py` (`PayoffMatrix.trial_shared_flags`
  from resolver traces), `dominance.py` (`strict_dominators_of` rename + alias +
  terminology), `reports.py` (real `vs2_hard_gates`, updated small-state Markdown and
  notes).
- New fixtures/configs: `fixtures/adversarial/a19_interchangeable_collapse.json`,
  `fixtures/adversarial/a20_shared_trace.json`, `configs/toy/interchangeable_5_3.json`,
  `configs/toy/second_place_collision.json`. A3 fixture prose corrected.
- Tests: `test_equilibrium.py`, `test_vs2_acceptance.py`, `test_vs2_reports.py`,
  `test_dominance.py`, `vs2_support.py` (A19/A20 registered).

### 13.5 Gate decision

**Stop at the VS2-C approval gate.** D1–D7 are implemented with RT-1..RT-3 and the
D3/D4/D5/D7 regressions green; the full suite is `456 passed`, zero solver warnings under
`-W error`; A3 shows a failed counterability gate and A5 a failed tie gate; the A4 margin
VOI is corrected from `8.0` to `4.5167`. Per the audit and the working-system standing
rule, **VS3–VS6 have not been started and must not begin without a new approval**:
no asymmetric-state support, best-response optimization, integer programming, double
oracle or multiplayer analysis was added in this pass.

### 13.6 VS2-C approval

**Status: VS2-C gate approved — 2026-07-10.** The stop-for-review at §13.5 was
satisfied and the VS2-C correction pass is accepted at its gate. This approval is
**additive to, and does not alter, the record above**: §13.1–§13.5 (the D1–D7
corrections, the corrected metrics table in §13.2, the test counts/commands in §13.3,
and the files-changed list in §13.4) are retained verbatim as the gate record.

Specifically retained as **truthful, accepted fixture outcomes** (not defects to be
"fixed away"):

- **A4** (counter-cycle exemplar): passes counterability (G4/G5) but **legitimately
  fails the equilibrium-weighted final-shared tie gate G7 (≈ 0.0928)**. A4 was never a
  tie-discipline exemplar; the failure is the correct, honest reading of the fixture.
- **A6** (counterable-poor): passes counterability (G4/G5) but **legitimately fails G7
  (≈ 0.482)**, again the correct reading.
- **A3** (turtle) fails counterability by design (`(4,0)` uncounterable); **A5**
  (tie-fest) fails the tie gate by design (equilibrium-weighted tie probability = 1).

These are accepted as understood and correctly characterized, exactly as the §12 VS2
approval accepted the numerical deviations. Approval does not erase or resolve them.

The completed **VS1 + VS2 + VS2-C** work is captured as a deliberate milestone commit
(the VS2-C correction pass on top of the VS1+VS2 milestone `8b605f0`). The resolved
milestone hash and the from-committed-state reproduction of `python -m pytest -q`, the
VS2 warnings-as-errors command, and `node meta/checks/check.mjs` are recorded in the
accompanying session verification log
(`docs/VS2C_MILESTONE_VERIFICATION.md`).

**VS3–VS6 remain unstarted.** Per the audit and the working-system standing rule they
must not begin without a new approval; VS3 and VS4 are now scoped in the new Kiro spec
`.kiro/specs/ascension-trials-scalable-two-player-analysis/`, which is itself
stop-for-review before any implementation.
