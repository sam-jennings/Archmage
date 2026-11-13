---
title: VS3/VS4 Task 1 — VS2 Laboratory Reconciliation
type: spec-note
spec: ascension-trials-scalable-two-player-analysis
task: 1
updated: 2026-07-10
status: complete
---

# Task 1 — Reconcile the VS2 laboratory against the VS3/VS4 spec

This is the reconciliation note required by Task 1 (_Requirements: REQ-14, REQ-1, REQ-9_).
It maps the VS1/VS2 interfaces this spec reuses, records the reuse/extend/gap verdict per
module, confirms where strategic collapse lives, and pins the symmetric fast-path that VS3
must keep gated to parity. **No VS2 oracle, fixture, or test was modified in Task 1** — this
is a read-and-map pass only.

## 1. Baseline green confirmation

- VS1 + VS2 reproduce green from the committed milestone `688c7ee`
  (`docs/VS2C_MILESTONE_VERIFICATION.md`): `python -m pytest -q` → **456 passed**
  (re-run 2026-07-10 during Task 1: `456 passed in 125.45s`, exit 0). No VS2 source has
  changed since the milestone — only the `.kiro/specs/…` documents.
- VS2 modules run clean under warnings-as-errors (78 passed), per the milestone log.

## 2. Interfaces this spec reuses (VS1 + VS2)

All paths are `ascension-trials/ascension_trials_model/src/ascension_trials/`.

| Module | Public surface VS3/VS4 consume | Notes |
|---|---|---|
| `resolver.py` | `resolve_profile(config, states, allocations, player_count=2) -> ResolutionResult`; `ResolutionResult.{win_utility, margin_utility, player_results, trial_results, to_dict(), finalize_hash()}`; `PlayerResult.shared_first`; `TrialResult.{rewards_awarded, shared_first}` | Pure, deterministic, audit-hashed. **Sole payoff authority** (REQ-6). `win_utility`/`margin_utility` are per-player-id dicts; player ids are `ROW_PLAYER="A"`, `COL_PLAYER="B"` (defined in `matrix.py`). |
| `matrix.py` | `build_two_player_payoff_matrix(config, state_a, state_b, allocations_a, allocations_b, player_count=2) -> PayoffMatrix`; `collapse_strategies(matrix) -> CollapseResult`; `strategy_id(...)`; `PayoffMatrix` (fields incl. `row_allocations`, `column_allocations`); `MatrixLimitError`; `MAX_MATRIX_DIM=10_000`, `MAX_MATRIX_BYTES=512 MiB` | See §3 — matrix builder is already asymmetric-capable; collapse is symmetric-only. |
| `enumerate.py` | `enumerate_allocations(...)`, `estimate_allocation_count(...)`, `enumerate_maximal_allocations(...)`, `count_legal_and_maximal(...)`, `normal_totals_by_trial(...)`, `find_allocation_by_normal_totals(...)`, `EnumerationLimitError` | Per-side enumeration comes straight from each state; over-limit refuses (no sampling). |
| `equilibrium.py` | `solve_zero_sum(matrix: np.ndarray, utility) -> ZeroSumSolution` (internally `_solve_row_maximin` + `_solve_col_minimax`); `max_entropy_equilibrium(...)`; `max_entropy_equilibrium_column(...)`; `equilibrium_relevant_set(matrix, value)`; `maximize_equilibrium_mass(...)` | Operate on a raw ndarray, so **rectangular matrices already work**; the row and column canonical mixtures already exist (the `_column` variant was added in VS2-C). |
| `dominance.py` | iterated true strict-dominance elimination, weak diagnostics, `strict_dominators_of` | Reused for the reasonable set \(\mathcal R\) inside metrics (per-side at REQ-3). |
| `metrics.py` | `compute_small_state_metrics(...)`, `margin_value_of_information(...)`, `counterability_gate(...)`, `_bilinear(indicator, row_mixture, col_mixture)`, `SmallStateMetrics` | `_bilinear` **already takes separate row and column mixtures** (VS2-C) — asymmetric-ready. |
| `canonical.py` | `canonical_allocation_key(config, state, allocation)`, `normalized_state(...)`, `normalized_allocation(...)`, `canonical_json(...)`, `deterministic_hash(...)` | See §3 — no whole-config content hash exists yet (relevant to the REQ-8 memo key). |
| `reports.py`, `cli.py` | VS2 report builders + CLI dispatch | Extended (not rewritten) for VS3/VS4 report sections and commands (Task 10). |

## 3. Reconciliation verdicts and the three concrete findings

### 3.1 The payoff builder is already asymmetric-capable; the fast-path is already parity-gated (REQ-1)

`build_two_player_payoff_matrix` already accepts **two** states and **two** allocation
lists and, in its non-symmetric branch, resolves every one of the `m×n` cells directly with
`resolve_profile`. The antisymmetry short-cut (resolve `(i,j)` once, mirror-fill `(j,i)` via
the resolver's player-swap symmetry) runs **only** when

```
_symmetric_inputs(config, state_a, state_b, ids_a, ids_b)
  == (ids_a == ids_b and state_a.normal_power == state_b.normal_power
      and state_a.wild_power == state_b.wild_power)
```

is true — i.e. only at parity. **REQ-1.3 (no antisymmetry short-cut when \(A\ne B\)) is
therefore already satisfied by construction.** VS3 Task 2 is consequently a *validation and
test* task, not a rewrite: add rectangular fixtures, assert per-cell zero-sum
(\(u_B=-u_A\)) via resolver player-swap, and confirm the parity fast-path still reproduces
VS2 exactly. The per-side ceilings (`MAX_MATRIX_DIM`, `MAX_MATRIX_BYTES`, `MatrixLimitError`)
already apply to `rows` and `cols` independently (REQ-1.6). `PayoffMatrix` already carries
`row_allocations`/`column_allocations`, which VS3/VS4 need to map strategy indices back to
legal allocations for resolver re-validation and double-oracle deviations.

### 3.2 Strategic collapse lives in `matrix.py` and is symmetric-only — extend it there, not elsewhere (REQ-2, REQ-9.6, design A9)

`collapse_strategies` and `_behaviour_signature` are in **`matrix.py`** (confirmed;
`canonical.py` owns only the allocation *key/hash*, not collapse). `collapse_strategies`
**requires a square symmetric matrix** and raises `ValueError` when `row_strategy_ids !=
column_strategy_ids`, and `_behaviour_signature(matrix, index)` mixes row-behaviour and
column-behaviour of a single index (valid only when rows and columns are the same strategy
set).

- **Verdict:** per-side rectangular collapse (REQ-2.1) is a **gap**. VS3 Task 3 adds it **in
  `matrix.py`** as an extension of the existing collapse code — a row-side signature over the
  columns and a column-side signature over the rows, each producing its own
  representative→members map. No second collapse implementation is introduced in
  `canonical.py` or elsewhere (design §12 "collapse lives in `matrix.py`").
- The VS2 symmetric `collapse_strategies` path stays byte-for-byte intact for parity, so
  MATH-12 / A15 / A19 continue to reproduce.
- **VS4 caveat (REQ-9.6):** full behavioural collapse is valid only against a *fully
  materialised* matrix. Inside the double oracle the restricted opponent set is partial, so
  the driver may deduplicate only *canonically identical* allocations (content hash), never
  collapse on restricted-set payoff coincidence.

### 3.3 The memo key needs a whole-config content hash that `canonical.py` does not yet expose (REQ-8 / amendment A6)

`canonical.py` provides `normalized_state`, `normalized_allocation`, `canonical_json` and
`deterministic_hash`, and `canonical_allocation_key` returns `(player_id, normal, wild)` —
**none of these hashes the full configuration content**; `strategy_id` and the audit hash
key off state+allocation, and the closest config identity elsewhere is `config_id` /
`config_version`.

- **Verdict:** the REQ-8 memoization key is a **gap**. VS3 Task 5 (`memo.py`) must build a
  key that is a content hash of the **complete normalized semantic resolver input** —
  normalized configuration *content* (not `config_id`/`config_version`), both normalized
  states, both normalized allocations, the row/column role assignment, and `player_count` —
  reusing `canonical_json`/`deterministic_hash` over a normalized-config view (to be added in
  `memo.py`, or a small `normalized_config` helper). This keeps the key correct even if a
  config file changes without a version bump.

### 3.4 Equilibrium, enumeration, dominance, metrics — reuse, minimal extension

- `equilibrium.solve_zero_sum` / `max_entropy_equilibrium` / `max_entropy_equilibrium_column`
  / `equilibrium_relevant_set` all take a raw ndarray, so **rectangular games already solve**
  and both row and column canonical mixtures already exist (REQ-2.2/2.3). VS3 Task 3 wires
  them per side; no change to `equilibrium.py` internals is anticipated.
- `enumerate.py` and `dominance.py` are reused **unchanged** (per-side enumeration; per-side
  \(\mathcal R\)).
- `metrics.py`'s `_bilinear` already takes **separate** row/column mixtures (VS2-C), so the
  equilibrium-weighted metrics are asymmetric-ready. VS3 Task 4 generalises
  `compute_small_state_metrics` to rectangular inputs, adds the parity regression (VS3 == VS2
  on committed parity fixtures) and emits `not_applicable` for parity-only metrics.

## 4. New modules VS3/VS4 add (REQ-14.2)

- `best_response.py` — margin BR (separability check → exact-arithmetic DP/IP, else
  `scipy.optimize.milp` IP / exhaustive) and win BR (expected-sign `scipy.optimize.milp`),
  each with a certificate and mandatory resolver re-validation in the row-payoff convention.
- `memo.py` — the content-hash-keyed memoized resolver wrapper of §3.3.
- `double_oracle.py` — the restricted-solve ↔ full-space-BR loop with the certified
  exploitability bracket.

Everything else is an **extension** of an existing module (`matrix.py`, `equilibrium.py`,
`metrics.py`, `reports.py`, `cli.py`), never a fork.

## 5. Task 1 outcome

- VS1 + VS2 green confirmed (456 passed).
- Interfaces mapped; three concrete findings recorded: (3.1) asymmetric builder + parity
  fast-path already correct; (3.2) collapse is symmetric-only and must be extended in
  `matrix.py`; (3.3) memo key needs a whole-config content hash not yet in `canonical.py`.
- No VS2 oracle, fixture, or test was modified.

Task 1 is complete. Per the Task Dependency Graph, Tasks 2 and 5 may now proceed after
Task 1; the VS3 gate (Task 11) remains a hard stop-for-review before any VS4 work.
