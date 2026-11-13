---
title: Ascension Trials — VS3 Completion Report (asymmetric states + exact best-response oracles)
type: spec-report
spec: ascension-trials-scalable-two-player-analysis
scope: VS3 only (Tasks 2–10); stop-for-review gate (Task 11)
updated: 2026-07-10
status: awaiting-review
---

# Ascension Trials — VS3 Completion Report

This is the **VS3 gate deliverable** for the spec
`.kiro/specs/ascension-trials-scalable-two-player-analysis/` (Task 11). VS3 adds
**asymmetric (rectangular) two-player states** and **exact, resolver-validated
best-response oracles** for the win and margin utilities, plus a **memoized resolution
wrapper**, on top of the frozen VS1 resolver and VS2 exact laboratory (milestone
`688c7ee`). It changes no VS1/VS2 result.

Per the spec's execution rule this is a **hard stop-for-review gate**: VS4 (Tasks 12–17)
must not begin until this report is reviewed and approved. VS5 and VS6 remain out of
scope and require their own spec.

## Gate result — PASS (awaiting review)

All five VS3-gate criteria (requirements.md §"VS3 gate") are met, backed by named tests
(see the gate table in §4). The full VS1 + VS2 + VS3 suite is green, and the
working-system checker carries only the two pre-existing benign flags already documented
at the VS2-C milestone — no new flag was introduced.

## Environment

- CPython **3.13.5** (system Python; the workspace `.venv/` is a broken OneDrive
  artifact — see §6).
- **NumPy 2.3.3**, **SciPy 1.16.0** (HiGHS MILP backend via `scipy.optimize.milp`),
  **pytest 9.0.3**. NumPy/SciPy are the versions pinned in `requirements.lock`
  (REQ-14.3).
- All commands run from `ascension-trials/ascension_trials_model/` unless noted otherwise.
- Repository state: committed HEAD `688c7ee` (VS1+VS2+VS2-C milestone). All VS3 code is
  additive and currently **uncommitted** in the working tree (this gate precedes the
  VS3 commit).

---

## 1. Full test suite — `python -m pytest -q`

Run from `ascension-trials/ascension_trials_model/`:

```
python -m pytest -q
```

```
.................................................................................. (…)
633 passed in 190.64s (0:03:10)
```

Exit code `0`. This is the **entire** VS1 + VS2 + VS3 suite (30 test modules). It
reproduces the `456 passed` VS1+VS2 baseline recorded in `VS2C_MILESTONE_VERIFICATION.md`
and adds **177 new VS3 tests** (456 + 177 = 633), confirming REQ-14.7 (no prior test
weakened; every prior test still green).

### 1a. Warnings-as-errors (VS2-milestone discipline, all VS3 modules)

The VS3 modules were additionally exercised under warnings-as-errors, so no NumPy/SciPy
`UserWarning`/`RuntimeWarning` from the LP/MILP solvers is silently tolerated:

```
python -m pytest tests/test_asymmetric_matrix.py tests/test_per_side_collapse.py \
  tests/test_asymmetric_metrics.py tests/test_memo.py \
  -W error::UserWarning -W error::RuntimeWarning -q
```
```
70 passed in 50.83s
```
```
python -m pytest tests/test_best_response_margin.py tests/test_best_response_win.py \
  tests/test_best_response_revalidation.py tests/test_best_response_validation.py \
  tests/test_vs3_reports.py -W error::UserWarning -W error::RuntimeWarning -q
```
```
107 passed in 23.83s
```

Both exit `0` (70 + 107 = 177 VS3 tests, all clean under `-W error`). The MILP/HiGHS
path (`scipy.optimize.milp`) and the rectangular LP path emit no promoted warnings.

---

## 2. Working-system checker — `node meta/checks/check.mjs`

Run from the repository root. Exit code `1` (the checker returns non-zero whenever any
flag is present). The flags are exactly the **two pre-existing, benign** ones already
documented in `VS2C_MILESTONE_VERIFICATION.md` and `VS2_COMPLETION_REPORT.md` — **no new
flag was introduced by VS3**:

- `! [structure] undeclared folder at root: .venv/` — local IDE-created virtualenv,
  gitignored, not part of the deliverable (§6).
- `! [decisions] 2026-07-06-at-entry-model-secret-allocation.md: 1 open propagation
  item(s)` — pre-existing, unrelated to this spec.

The `ascension-trials` thread line in the session brief still reads "VS1, VS2 and the
VS2-C correction pass are complete and APPROVED … VS3 and VS4 are now scoped in a new
Kiro spec … stop-for-review". No checker flag references the new VS3 files or the new
docs report (see the manifest note in §7).

---

## 3. VS3 test inventory

177 VS3 tests across nine new modules:

| Module | Tests | Covers |
|---|---:|---|
| `tests/test_asymmetric_matrix.py` | rectangular construction, parity guard, per-cell zero-sum, per-side ceilings | REQ-1, NFR-4 |
| `tests/test_per_side_collapse.py` | per-side collapse, rectangular zero-sum solve, row/column canonical mixtures, per-side E^0.01 | REQ-2, REQ-9 |
| `tests/test_asymmetric_metrics.py` | parity regression, unequal-state fixture ASYM-1, asymmetric metrics | REQ-1, REQ-2, REQ-3, REQ-7 |
| `tests/test_memo.py` | content-hash key, cache purity, byte-identical memoized-vs-direct | REQ-8, NFR-2 |
| `tests/test_best_response_margin.py` | separability check, exact-DP / MILP / exhaustive margin oracle | REQ-4, REQ-6, REQ-13, NFR-5 |
| `tests/test_best_response_win.py` | expected-sign win MILP, modelability gate, exhaustive fallback | REQ-5, REQ-6, REQ-13, NFR-3/4/5 |
| `tests/test_best_response_revalidation.py` | row-payoff convention, mandatory resolver re-validation | REQ-6 |
| `tests/test_best_response_validation.py` | oracles-vs-exhaustive sweep + 5 planted fixtures | REQ-7, REQ-4, REQ-5, REQ-6 |
| `tests/test_vs3_reports.py` | best-response + asymmetric reports, CLI commands, evidence-class/hard-gate tables | REQ-13, REQ-14 |

(Collected: `python -m pytest --collect-only -q <the nine files>` → `177 tests collected`.)

---

## 4. VS3 hard-gate table (criterion → status → evidence)

Each gate criterion from `requirements.md` §"VS3 gate" and Task 11, mapped to the
specific test(s) that prove it. All statuses are **PASS** and were confirmed green in
the §1 run.

| # | Gate criterion (requirement) | Status | Evidence (test) |
|---|---|---|---|
| G1 | All prior VS1 + VS2 tests remain green (REQ-14.7) | **pass** | Full-suite run §1: `633 passed`; the 456-test VS1+VS2 baseline (`test_vs1_acceptance.py`, `test_resolver.py`, `test_matrix_collapse.py`, `test_dominance.py`, `test_equilibrium.py`, `test_vs2_acceptance.py`, `test_vs2_reports.py`, `test_enumeration.py`, …) unchanged and passing |
| G2a | Rectangular (asymmetric) exhaustive matrices work (REQ-1) | **pass** | `test_asymmetric_matrix.py::test_rectangular_shape_and_ids_from_two_states` (10×4 from unequal budgets); `::test_rectangular_matrix_is_zero_sum_via_resolver_player_swap` (all 40 cells zero-sum via player-swap); `::test_asymmetric_final_tiebreak_matrix_is_not_antisymmetric` + `::test_counterfactual_antisymmetry_shortcut_would_be_wrong` (antisymmetry short-cut correctly refused for A≠B); ceilings: `::test_dimension_ceiling_applies_to_each_side_independently`, `::test_build_refuses_over_limit_per_side_without_sampling` (REQ-1.6/NFR-4) |
| G2b | Parity reproduces VS2 exactly (REQ-1.5, REQ-2.4, REQ-3.4) | **pass** | `test_asymmetric_matrix.py::test_parity_fast_path_matches_full_resolution` (fast-path == full per-cell, byte-for-byte); `test_per_side_collapse.py::test_per_side_collapse_reproduces_vs2_single_collapse_at_parity` + `::test_two_sided_equilibrium_at_parity_coincides_with_vs2`; `test_asymmetric_metrics.py::test_parity_reproduces_committed_vs2_oracles` (A3–A6, A19, A20) + `::test_parity_is_byte_stable_and_explicit_equal_state_is_identical` |
| G2c | Per-side collapse / canonical row+column mixtures / rectangular solve (REQ-2, REQ-3) | **pass** | `test_per_side_collapse.py::test_per_side_collapse_handles_rectangular_matrix_independently`, `::test_rectangular_column_side_collapses_interchangeable_domains_independently`, `::test_two_sided_equilibrium_on_rectangular_game`; `test_asymmetric_metrics.py::test_asym_metrics_per_side_counts_and_values`, `::test_asym_metrics_rectangular_rates_and_diagnostics`, `::test_asym_metrics_counterability_is_not_applicable` (REQ-3.3) |
| G3 | Exact best responses (win **and** margin) match exhaustive on all in-limit fixtures, for every tested opponent pure strategy **and** mixture (REQ-4, REQ-5, REQ-6, REQ-7) | **pass** | `test_best_response_validation.py::test_oracles_match_exhaustive_on_every_vs2_opponent` (both utilities, both sides, **every** pure opponent + tested mixtures, on A3/A4/A5/A6/A19/A20); margin: `test_best_response_margin.py::test_margin_oracle_matches_bruteforce_all_pure_opponents_row`/`_column`, `::test_dp_matches_bruteforce_on_mixture`, `::test_dp_milp_exhaustive_agree_pure`; win: `test_best_response_win.py::test_win_milp_matches_bruteforce_all_pure_opponents_row`/`_column`, `::test_win_milp_matches_bruteforce_on_mixture_row`/`_column`, `::test_win_milp_equals_exhaustive_on_a4_sampled`; rectangular oracle: `test_best_response_validation.py::test_asym1_unequal_state_best_response_oracle` (REQ-7.2) |
| G3-planted | Planted hard cases (illegal entry, Wild legality, shared award, final tiebreak) (REQ-7.3) | **pass** | `test_best_response_validation.py::test_planted_illegal_entry_trap` (BR-TRAP-1), `::test_planted_wild_legality` (BR-WILD-1), `::test_planted_shared_award_coupling` (BR-SHARED-1), `::test_planted_final_tiebreak_decision` (BR-FINALTIE-1); provenance: `::test_planted_fixture_carries_provenance_and_oracle` (REQ-7.4/9.4) |
| G4 | Win and margin objectives shown to **differ** on a planted fixture (REQ-7.3) | **pass** | `test_best_response_validation.py::test_planted_win_optimum_differs_from_margin_optimum` (BR-WINMARGIN-1) and `test_best_response_win.py::test_win_optimum_differs_from_margin_optimum`: against the mixture {B empty, B=(1,1)}·½ the **win** oracle uniquely picks totals `(0,2)` (E[win]=1, E[margin]=2) while the **margin** oracle uniquely picks `(1,1)` (E[margin]=5/2, E[win]=1/2); each argmax is strictly worse on the other objective |
| G5 | Memoized and direct outputs **byte-identical** on all committed fixtures (REQ-8) | **pass** | `test_memo.py::test_memoized_matrix_is_byte_identical_to_direct` (A3/A4/A5/A6/A19/A20) + `::test_memoized_matrix_byte_identical_on_a15_base_and_inflated`; `::test_memoized_metrics_are_byte_identical_to_direct` + `::test_memoized_metrics_byte_identical_on_a15`; identity/purity: `::test_cache_hit_returns_identical_result_object`, `::test_disabled_memo_is_a_pure_passthrough`; content-hash key: `::test_config_content_change_without_version_bump_changes_key` (REQ-8.1), `::test_explicit_zero_allocation_collides_with_canonical_form`, `::test_role_swap_changes_the_key` |
| G6 | Row-payoff convention + mandatory resolver re-validation on every BR (REQ-6) | **pass** | `test_best_response_revalidation.py::test_revalidation_invariant_full_matrix` ({win,margin}×{row,column}×{pure,mixture}), `::test_column_win_bound_is_negated_not_leaked`, `::test_column_margin_bound_is_negated_not_leaked` (column own-optimum negated, never leaked un-negated, REQ-6.1); disagreement raises: `::test_corrupted_win_objective_raises`, `::test_corrupted_margin_objective_raises`, `::test_exact_method_catches_subtolerance_decomposition_error` (REQ-6.4) |
| G7 | VS3 reports/CLI: evidence classes, certificates, hard-gate table, determinism (REQ-13, REQ-14) | **pass** | `test_vs3_reports.py::test_best_response_report_carries_certificate_and_evidence_class`, `::test_best_response_evidence_class_table_extends_prior_set`, `::test_no_numerical_result_labelled_exact` (REQ-13.3), `::test_best_response_report_is_byte_stable`, `::test_cli_best_response_margin_writes_report`, `::test_cli_analyse_asymmetric_writes_report`, `::test_cli_best_response_unproven_result_exits_nonzero` (NFR-4); VS1/VS2 tables unchanged: `::test_vs1_evidence_table_vocabulary_unchanged`, `::test_vs2_evidence_table_vocabulary_unchanged` (REQ-14.7) |

---

## 5. VS3 file list (added / modified since milestone `688c7ee`)

All paths under `ascension-trials/ascension_trials_model/` unless noted. Established via
`git status --short` and `git diff --stat 688c7ee -- ascension-trials/ascension_trials_model`.

### New source modules (REQ-14.2)
- `src/ascension_trials/best_response.py` — margin BR (separability check → exact-arithmetic DP / `scipy.optimize.milp` IP / exhaustive) and win BR (expected-sign MILP), with certificates and mandatory resolver re-validation in the row-payoff convention.
- `src/ascension_trials/memo.py` — content-hash-keyed memoized resolver wrapper + diagnostics.

### Extended source modules (existing VS1/VS2 code paths unchanged; REQ-14.2)
- `src/ascension_trials/matrix.py` — rectangular construction, parity guard on the full resolver-relevant signature, per-cell zero-sum guard, per-side collapse (`collapse_strategies_per_side`, `PerSideCollapseResult`). (+391 lines)
- `src/ascension_trials/equilibrium.py` — `solve_two_sided_equilibrium`, `equilibrium_relevant_set_column` (rectangular row/column canonical mixtures + per-side E^0.01). (+90 lines)
- `src/ascension_trials/metrics.py` — asymmetric metrics, per-side counts, `not_applicable` for parity-only diagnostics, parity preserved. (+372 lines)
- `src/ascension_trials/reports.py` — best-response report, asymmetric small-state report, VS3 evidence-class table, double-oracle-ready hard-gate table. (+407 lines)
- `src/ascension_trials/cli.py` — `best-response` and `analyse-asymmetric` commands. (+288 lines)

### New tests (9 files, 177 tests)
- `tests/test_asymmetric_matrix.py`, `tests/test_per_side_collapse.py`,
  `tests/test_asymmetric_metrics.py`, `tests/test_memo.py`,
  `tests/test_best_response_margin.py`, `tests/test_best_response_win.py`,
  `tests/test_best_response_revalidation.py`, `tests/test_best_response_validation.py`,
  `tests/test_vs3_reports.py`.

### New toy configs (best-response fixtures)
- `configs/toy/asym_two_trial.json`, `configs/toy/win_margin_divergence.json`,
  `configs/toy/illegal_entry_trap.json`, `configs/toy/wild_legality_br.json`,
  `configs/toy/shared_award_coupling.json`, `configs/toy/final_tiebreak_decision.json`.

### New adversarial fixtures (hand-verified oracles, REQ-7.3/7.4)
- `fixtures/adversarial/asym1_unequal_budget.json` (ASYM-1, rectangular hand-matrix),
  `fixtures/adversarial/br_win_margin_divergence.json` (BR-WINMARGIN-1),
  `fixtures/adversarial/br_illegal_entry_trap.json` (BR-TRAP-1),
  `fixtures/adversarial/br_wild_legality.json` (BR-WILD-1),
  `fixtures/adversarial/br_shared_award_coupling.json` (BR-SHARED-1),
  `fixtures/adversarial/br_final_tiebreak_decision.json` (BR-FINALTIE-1).

### Spec + docs
- `.kiro/specs/ascension-trials-scalable-two-player-analysis/` (requirements.md,
  design.md, tasks.md, task-1-reconciliation.md, tasks.meta.json).
- `docs/VS3_COMPLETION_REPORT.md` (this file).

> Note: the working tree also contains **unrelated, out-of-scope** in-flight edits from
> other threads (rulebook/GLOSSARY wording, `web-apps/` reference overhaul, `expansion/`
> restructuring, and assorted `meta/` edits). As at the VS2-C milestone, those are not
> part of this deliverable and should be committed separately; the VS3 commit should be
> scoped to the package + spec files listed above.

---

## 6. Warnings and deviations carried forward

1. **Broken workspace `.venv/` (OneDrive artifact).** The repo-local `.venv/` is a
   corrupted/partial virtualenv created under a synced OneDrive path; it is gitignored
   and surfaces as the benign checker flag `undeclared folder at root: .venv/`. All VS3
   commands were run with **system CPython 3.13.5** and the pinned deps, not `.venv`.
   No action required for the gate; carried forward from VS2-C.

2. **Win oracle is MILP-modelable only for a subset of configs; exhaustive fallback
   otherwise (REQ-5.6, design §6.3).** The expected-sign win MILP models per-Trial
   selection with a local tiebreak and no active final Spellbook tiebreak. For
   non-modelable configs (e.g. FULL completion, which couples legality across Trials),
   `method="auto"` falls back to the **exact exhaustive** oracle on tractable states and
   **raises** `NonOptimalBestResponseError` on over-limit states — it never emits an
   unproven "best". Proven by `test_best_response_win.py::test_win_milp_not_modelable_on_full_completion`,
   `::test_win_nonmodelable_falls_back_to_exhaustive`, `::test_win_nonmodelable_over_limit_raises_nonoptimal`.
   This is within design allowance, not a defect; noted so VS4 driver integration
   accounts for the mixed evidence class (`numerical_milp_best_response_certified` vs
   `exact_exhaustive_best_response`).

3. **Coupled-margin path uses the exhaustive fallback rather than a dedicated IP
   (design §6.2).** When the separability check declares a config *coupled* (shared
   awards, coupling eligibility, or an active final tiebreak), the margin oracle under
   `method="auto"` uses the **exact exhaustive** oracle (`exact_exhaustive_best_response`)
   on in-limit states, and raises on over-limit states — the design permits either an
   IP or exhaustive here, and the exhaustive route was chosen (a `scipy.optimize.milp` IP
   remains available via `method="milp"` and is cross-checked equal in
   `test_best_response_margin.py::test_dp_milp_exhaustive_agree_pure`). The dedicated
   exact-DP path (`exact_dp_best_response`) is reserved for proven-separable configs
   only. Proven by `::test_auto_routes_coupled_to_exhaustive_and_matches_bruteforce`,
   `::test_coupled_over_limit_raises_nonoptimal`.

4. **Evidence labelling.** No numerical/MILP result is labelled exact: the win MILP and
   the coupled-margin IP carry `numerical_milp_best_response_certified`; only exhaustive
   and exact-arithmetic DP carry exact labels (`exact_exhaustive_best_response`,
   `exact_dp_best_response`). Enforced by `test_vs3_reports.py::test_no_numerical_result_labelled_exact`
   and the certificate assertions across the best-response tests (REQ-13.3, NFR-5).

No deviation weakens a VS1/VS2 guarantee, and none blocks the gate.

---

## 7. Manifest note (REQ-14.5 / structure rule)

`meta/manifest.yml` declares `ascension-trials/ascension_trials_model/` at **directory
granularity** — its `purposes` entry states that `docs/` "holds the current normative
model + Kiro-implementation-spec snapshots" and enumerates the package's top-level
layout (`src/ascension_trials, tests, configs, fixtures, docs, README`) without listing
individual files inside `src/`, `tests/`, `configs/`, `fixtures/` or `docs/`. Because the
declaration is coarse (folder-level), adding VS3 source/test/config/fixture files and
this `docs/VS3_COMPLETION_REPORT.md` **does not change any declared path**, so **no
manifest update is required**. The checker confirms this: no `structure` flag references
the new files (§2). (This matches the precedent set by `docs/VS2C_MILESTONE_VERIFICATION.md`,
which was added without a manifest change.)

---

## 8. Result

- **Full suite:** `633 passed in 190.64s`, exit `0` (456 VS1+VS2 preserved + 177 VS3).
- **Warnings-as-errors (VS3 modules):** `70 passed` + `107 passed`, exit `0`.
- **Checker:** exit `1`, carrying only the two known-benign pre-existing flags; no new
  flag.
- **All five VS3-gate criteria PASS**, each backed by named tests (§4), including the
  win≠margin planted divergence and the byte-identical memoized-vs-direct proof.

**VS3 is complete and this is the stop-for-review gate.** Do **not** begin VS4
(Tasks 12–17) until this report is reviewed and approved. VS5 and VS6 remain out of scope
and require a new spec.
