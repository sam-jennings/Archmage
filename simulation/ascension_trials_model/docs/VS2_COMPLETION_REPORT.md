---
title: Ascension Trials Configuration Model — VS2 Completion Report
type: spec-report
spec: ascension-trials-configuration-model
scope: VS2
updated: 2026-07-10
status: approved
approved: 2026-07-10
---

# VS2 Completion Report — Ascension Trials Configuration Model

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
