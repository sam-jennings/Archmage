---
title: Ascension Trials — Scalable Two-Player Analysis (VS3 + VS4) — Tasks
type: spec-tasks
spec: ascension-trials-scalable-two-player-analysis
scope: VS3 and VS4 only
updated: 2026-07-10
status: proposed
requirements_source: requirements.md
design_source: design.md
---

# Implementation Plan

**Ascension Trials — Scalable Two-Player Analysis (VS3 + VS4)**

## Overview

VS3 and VS4 extend the frozen VS1 resolver and VS2 exact laboratory (approved milestone
`688c7ee`) with two capabilities and nothing else: **VS3** adds asymmetric (rectangular)
two-player states and exact, resolver-validated best-response oracles for the win and
margin utilities; **VS4** wraps those oracles in a certified double-oracle equilibrium
method whose only convergence certificate is the full-space exploitability gap. The
resolver remains the sole payoff authority — every optimiser output is recomputed by the
resolver before it counts. Scope is strictly VS3 + VS4: no VS5/VS6, no general solver,
learning, infrastructure or UI work (see `requirements.md` Out of Scope).

## Project

**Name:** Ascension Trials — Scalable Two-Player Analysis
**Spec ID:** `ascension-trials-scalable-two-player-analysis`
**Scope:** VS3 and VS4 only.
**Status rule:** a task is complete only when its tests and acceptance criteria pass;
never on import success or hand verification alone.

## Execution rule

**Do not begin any implementation until `requirements.md`, `design.md` and this
`tasks.md` are approved.** VS1 + VS2 are frozen and approved (milestone `688c7ee`); this
spec extends the package additively and must keep the entire VS1 + VS2 suite green
throughout. VS4 tasks must not begin until the VS3 gate is approved. VS5 and VS6 are out
of scope and require their own new spec.

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2", "5"] },
    { "id": 2, "tasks": ["3"] },
    { "id": 3, "tasks": ["4"] },
    { "id": 4, "tasks": ["6", "7"] },
    { "id": 5, "tasks": ["8"] },
    { "id": 6, "tasks": ["9"] },
    { "id": 7, "tasks": ["10"] },
    { "id": 8, "tasks": ["11"] },
    { "id": 9, "tasks": ["12"] },
    { "id": 10, "tasks": ["13"] },
    { "id": 11, "tasks": ["14"] },
    { "id": 12, "tasks": ["15"] },
    { "id": 13, "tasks": ["16"] },
    { "id": 14, "tasks": ["17"] }
  ]
}
```

The waves above encode this dependency structure:

```text
1 → 2 → 3 → 4
1 → 5
4,5 → 6,7
6,7 → 8 → 9 → 10 → 11
11 approval → 12 → 13 → 14 → 15 → 16 → 17
```

- **Tasks 2–5** may proceed after **Task 1** wherever their direct dependencies permit
  (Task 1 is the reconciliation foundation; 2 → 3 → 4 chain the asymmetric-state work, and
  5 branches off Task 1 as the memoization foundation).
- **Tasks 6 and 7** (the margin and win best-response oracles) require the asymmetric-state
  and memoization foundations (Tasks 4 and 5) to be stable.
- **Task 8** (resolver re-validation + row-payoff convention) requires **both**
  best-response implementations (Tasks 6 and 7).
- **Task 9** (best-response validation suite) requires **Tasks 6–8**.
- **Task 10** (VS3 reports and CLI) requires the VS3 implementation and validation surfaces
  (through Task 9).
- **Task 11** is a **hard approval gate**: no VS4 task may begin before its stop-for-review
  approval.
- **Tasks 12–16** build the VS4 stack **sequentially** (restricted-game driver → deviation
  loop → certified exploitability → reporting → validation/scaling).
- **Task 17** is the final **stop-for-review** gate.

---

## Tasks

### VS3 — asymmetric states + exact best-response oracles

- [x] 1. Reconcile the VS2 laboratory against this spec before extending it
  - Confirm VS1 + VS2 are green from the committed milestone.
  - Map the resolver, enumeration, matrix, dominance and equilibrium interfaces this spec
    reuses; confirm strategic-equivalence collapse lives in `matrix.py`
    (`collapse_strategies`) and that VS3 extends it there (no second implementation);
    note the symmetric fast-path in `build_two_player_payoff_matrix` that VS3 must gate to
    parity-only.
  - Produce a short reconciliation note; do not modify VS2 oracles.
  - _Requirements: REQ-14, REQ-1, REQ-9_

- [x] 2. Rectangular / asymmetric payoff construction
  - Accept two independent, possibly-unequal states A and B.
  - Build a rectangular \(m\times n\) matrix filling every cell by resolver call; use the
    antisymmetry fast-path only when A == B (parity).
  - Verify per-cell zero-sum (\(u_B=-u_A\)) via resolver player-swap.
  - Keep per-side matrix/memory ceilings; refuse over-limit, never sample.
  - _Requirements: REQ-1, NFR-4_

- [x] 3. Per-side strategic collapse (in `matrix.py`) and canonical row/column mixtures
  - Extend `matrix.py`'s `collapse_strategies` to collapse rows and columns independently
    over their own behaviour vectors (no second collapse implementation elsewhere); keep a
    representative→members map per side.
  - Solve the rectangular zero-sum LP; produce separate canonical row (maximin) and column
    (minimax) maximum-entropy mixtures; compute \(\mathcal E^{0.01}\) per side.
  - _Requirements: REQ-2, REQ-9_

- [x] 4. Extend metrics to unequal states, preserving parity
  - Generalise every applicable VS2 metric to rectangular games using \(x\) and \(y\)
    separately for bilinear/equilibrium-weighted quantities.
  - Emit `not_applicable` for parity-only metrics on asymmetric states.
  - Add the parity regression: on every committed VS2 parity fixture, VS3 outputs equal
    VS2 exactly (exact fields) / within tolerance (numerical fields).
  - Add one committed **unequal-state** fixture with a hand-verified matrix, collapse and
    mixtures.
  - _Requirements: REQ-1, REQ-2, REQ-3, REQ-7_

- [x] 5. Memoized resolution wrapper
  - Implement a pure cache over `resolve_profile` keyed by a **content hash of the complete
    normalized semantic resolver input** (full configuration content — not just id/version
    — both states, both allocations, row/column roles, all output-affecting inputs);
    identical inputs return identical results, traces and audit hashes, and the key stays
    correct even if a config file changes without a version bump.
  - Make it injectable; disabling it changes only performance.
  - Prove memoized vs direct payoff matrices (and derived metrics) byte-identical on all
    committed fixtures.
  - Report cache hit rate and runtime as diagnostics only.
  - _Requirements: REQ-8, NFR-2_

- [x] 6. Exact margin best-response oracle
  - Implement a conservative separability check on (config, states, opponent).
  - Separable case: **exact-arithmetic** DP/IP over Trials × domain budgets maximising
    summed margin (evidence class `exact_dp_best_response`, valid only with exact
    integer/rational arithmetic).
  - Coupled case (shared awards, coupling eligibility, active final tiebreak): a
    `scipy.optimize.milp` IP (`numerical_milp_best_response_certified`) or exhaustive
    fallback (`exact_exhaustive_best_response`), no decomposition.
  - Emit a certificate recording the resolver incumbent value, certified objective bound,
    absolute/relative gap, solver status and tolerances; return an exact legal allocation
    with `value_row_payoff`.
  - _Requirements: REQ-4, REQ-6, REQ-13, NFR-5_

- [x] 7. Exact win best-response oracle (expected-sign MILP)
  - Formulate the expected-sign objective as a MILP with binary win/tie/loss indicators
    linked to total Recognition Points and the final-result tiebreak; model legal
    allocations as the feasible region.
  - Use `scipy.optimize.milp` with the pinned SciPy/HiGHS backend (never
    `scipy.optimize.linprog`, which is reserved for the continuous zero-sum LP); record
    backend, options, solver status and absolute/relative MIP gap.
  - Do **not** use a per-domain DP as the primary oracle.
  - Label the result `numerical_milp_best_response_certified` (not exact); report
    `value_row_payoff`.
  - On uncertified optimality: fall back to exhaustive on tractable states, else raise;
    never emit an unproven "best".
  - _Requirements: REQ-5, REQ-6, REQ-13, NFR-3, NFR-4_

- [x] 8. Mandatory resolver re-validation and row-payoff convention
  - Express every best-response value in the **row-payoff convention** (`value_row_payoff`);
    a column oracle maximising its own payoff negates before reporting; never assign a
    column player's own-utility optimum to a row-payoff bound un-negated. `value_side_payoff`
    is optional.
  - For every returned best response (win/margin, pure/mixture), recompute utility via the
    resolver and report the resolver `value_row_payoff` as authoritative.
  - Raise on optimiser-vs-resolver disagreement beyond tolerance.
  - _Requirements: REQ-6_

- [x] 9. Best-response validation suite
  - Compare both oracles against exhaustive search on every tractable VS2 fixture, for
    every opponent pure strategy and tested mixtures.
  - Add planted fixtures: illegal-entry trap, Wild legality, shared-award coupling,
    final-Spellbook-tiebreak decision, and a case where the win optimum differs from the
    margin optimum.
  - All fixtures carry hand-verifiable oracles with provenance.
  - _Requirements: REQ-7, REQ-4, REQ-5, REQ-6_

- [x] 10. VS3 reports and CLI
  - Add `best-response` and `analyse-asymmetric` commands.
  - Extend JSON/Markdown reports with best-response sections, certificates, evidence
    classes and the hard-gate table.
  - Keep the VS2 metadata block; keep determinism/byte-stability.
  - _Requirements: REQ-13, REQ-14_

- [x] 11. VS3 gate — stop for review
  - Produce a VS3 completion report showing:
    - all prior VS1 + VS2 tests green;
    - asymmetric (rectangular) exhaustive matrices working and parity reproducing VS2
      exactly;
    - exact best responses (win + margin) matching exhaustive search on all in-limit
      fixtures for every tested opponent pure strategy and mixture;
    - the win and margin objectives shown to differ on a planted fixture;
    - memoized and direct outputs identical on all committed fixtures;
    - exact commands and outputs, warnings/deviations, checker result, file list.
  - **Stop for review. Do not begin VS4 without approval.**
  - _Requirements: REQ-1, REQ-2, REQ-3, REQ-4, REQ-5, REQ-6, REQ-7, REQ-8, REQ-13, REQ-14_

---

### VS4 — certified double oracle

- [~] 12. Restricted-game driver
  - Build the restricted matrix over current \(X\times Y\) only (plus newly added
    row/column); solve with the VS2 `numerical_lp` solver for value and mixtures \(x,y\).
  - Deterministic initial restricted sets and deviation-selection rule; never build the
    full matrix.
  - _Requirements: REQ-9_

- [~] 13. Full-space best-response integration and profitable-deviation loop
  - Call the VS3 full-space oracles for row (against \(y\)) and column (against \(x\)).
  - Add profitable, not-yet-present deviations using explicit tolerances (row:
    `value_row_payoff > v_R + dev_tol`; column: `value_row_payoff < v_R - dev_tol`).
    **"No profitable deviation" does not by itself mean converged** (see task 14).
  - Deduplicate only **canonically identical** allocations (content hash); never
    permanently collapse strategies because their payoffs coincide against the current
    restricted set (full behavioural collapse is only for materialised VS3 matrices).
  - Run win and margin as two independent solves.
  - _Requirements: REQ-9, REQ-4, REQ-5, REQ-6_

- [~] 14. Oracle-certified exploitability (the sole convergence certificate)
  - Set `upper_bound` = the **row** BR's certified objective **upper** bound on
    \(\max_a u_{\text{row}}(a,y)\) and `lower_bound` = the **column** BR's certified
    objective **lower** bound on \(\min_b u_{\text{row}}(x,b)\), in the row-payoff
    convention; substitute a resolver incumbent for a certified bound only where the
    certificate shows they coincide within tolerance.
  - `gap = upper_bound - lower_bound`; the reported full-game interval incorporates all BR
    optimisation tolerances.
  - Declare convergence **only** when `gap <= tolerance`. Never certify from the
    restricted-game value/search or a "no deviation" condition; a negative gap is an oracle
    inconsistency.
  - _Requirements: REQ-10_

- [~] 15. Convergence and non-convergence reporting
  - On convergence (`gap <= tolerance` only): report restricted value, certified lower/upper
    full-game bounds, gap, row & column supports, iteration history,
    LP/MILP/profitable-deviation tolerances/residuals, evidence class
    `certified equilibrium bracket`.
  - On iteration-cap, solver-failure, **stall** (`gap > tolerance` with nothing added), or
    **oracle inconsistency** (negative gap): report the certified interval as a `bound`
    (never an equilibrium point estimate), recording the stop reason
    (`iteration_cap` / `solver_failure` / `stalled` / `oracle_inconsistency`), or raise an
    explicit consistency error. Never label such a state converged.
  - _Requirements: REQ-11, REQ-12, REQ-13_

- [~] 16. Double-oracle validation and scaling evidence
  - Reproduce VS2 game values for A4, A5, A6 and MATH-14 within tolerance, with certified
    gap \(\le 10^{-9}\).
  - Use a state that **qualifies as beyond-matrix** (the exhaustive-matrix path refuses it
    via an explicit cell-count / memory-estimate / runtime-estimate limit, e.g.
    `MatrixLimitError`); run it to a certified bracket and **independently recheck** the
    certificate: reconstruct \(x,y\) from the report, rerun both full-space oracles
    **outside** the driver with **memoization disabled**, directly resolve the returned
    allocations, and rebuild the lower/upper bounds and gap (a re-read of the driver's
    stored bounds does not count).
  - Show a capped/stalled hard instance returns a `bound`, not an estimate.
  - Confirm determinism (bit-stable repeats) and that memoization changes only runtime.
  - _Requirements: REQ-9, REQ-10, REQ-11, REQ-12, REQ-8, NFR-1_

- [~] 17. VS4 gate — stop for review
  - Produce a VS4 completion report showing:
    - double oracle reproduces A4, A5, A6, MATH-14 within tolerance;
    - certified exploitability \(\le 10^{-9}\) on those fixtures;
    - at least one beyond-full-matrix state with an independently rechecked certificate;
    - non-convergence emits bounds, not an unsupported point estimate;
    - all prior tests green; exact commands/outputs, residuals, checker result, file list.
  - **Stop for review. VS5 and VS6 remain out of scope and require a new spec.**
  - _Requirements: REQ-9, REQ-10, REQ-11, REQ-12, REQ-13, REQ-14_

## Notes

- This plan extends the existing package `ascension-trials/ascension_trials_model/` additively;
  the entire VS1 + VS2 suite must stay green throughout (REQ-14.7). VS1 + VS2 are frozen at
  milestone `688c7ee`.
- Each task cites its requirement IDs for traceability. The VS3 gate (Task 11) and the VS4
  gate (Task 17) are hard stop-for-review gates: no VS4 task begins before Task 11 approval,
  and no VS5/VS6 work begins without a new spec.
- Best-response evidence is method-typed: exhaustive / exact-DP are exact; the win MILP (and
  any coupled-margin IP) is `numerical_milp_best_response_certified` — never labelled exact.
- The double oracle's sole convergence certificate is the full-space exploitability gap;
  non-convergence (iteration cap, solver failure, stall, or oracle inconsistency) is reported
  as a `bound`, never an equilibrium point estimate.
