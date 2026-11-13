---
title: Ascension Trials — Scalable Two-Player Analysis (VS3 + VS4) — Design
type: spec-design
spec: ascension-trials-scalable-two-player-analysis
scope: VS3 and VS4 only
updated: 2026-07-10
status: proposed
requirements_source: requirements.md
builds_on: .kiro/specs/ascension-trials-configuration-model/design.md
---

# Design — Ascension Trials Scalable Two-Player Analysis (VS3 + VS4)

## Project

**Name:** Ascension Trials — Scalable Two-Player Analysis
**Spec ID:** `ascension-trials-scalable-two-player-analysis`
**Scope:** VS3 (asymmetric states + exact best-response oracles) and VS4 (certified
double oracle).
**Requirements source:** `requirements.md`.
**Builds on:** the approved VS1 + VS2 design; reuses its resolver, enumeration, matrix,
dominance and equilibrium layers unchanged.

---

## 1. Overview

VS3 and VS4 sit *on top of* the frozen VS1 resolver and VS2 laboratory. The design adds
three capabilities and touches the existing layers only additively:

1. **Asymmetric states (VS3).** Generalise the two-player payoff construction, collapse,
   equilibrium and metrics from square, symmetric self-play to **rectangular** games where
   A and B hold different states. Parity remains a special case that must reproduce VS2.
2. **Exact best-response oracles (VS3).** For each utility (win, margin) and each side,
   find an optimal deviation over the *entire* legal allocation space **without**
   materialising the full matrix, with a correctness certificate and mandatory resolver
   re-validation.
3. **Certified double oracle (VS4).** Iterate restricted-game solves and full-space best
   responses until the exploitability gap (from the full-space oracles only) is within
   tolerance, so equilibria can be certified for states VS2 could never enumerate.

**Invariant that governs the whole design:** the resolver is the only payoff authority.
Every optimiser (margin DP/IP, win MILP, double-oracle deviation) is a *search*; its
output is a candidate allocation that is only accepted after `resolve_profile` recomputes
its utility. The optimiser's own objective value is never reported as a result.

---

## 2. Architecture

```text
        VS1 kernel (frozen)                 VS2 laboratory (frozen)
   resolver.py  legality.py  power.py   enumerate.py  matrix.py  dominance.py
        │              │                     │           │        equilibrium.py
        │              │                     │           │            │
        ▼              ▼                     ▼           ▼            ▼
   ┌─────────────────────────────────────────────────────────────────────────┐
   │                          VS3 additions                                    │
   │  memo.py ── memoized resolver wrapper (content-hash key, byte-identical)   │
   │  matrix.py (extended) ── rectangular payoff construction + per-side        │
   │                          strategic-equivalence collapse (VS2 collapse home)│
   │  canonical.py (reused) ── canonical resolver-input signature / content hash│
   │  equilibrium.py (extended) ── row & column canonical mixtures (rect. LP)   │
   │  best_response.py ── margin BR (exact DP/IP/exhaustive) ; win BR (milp)    │
   │                       + mandatory resolver re-validation + certificates    │
   │  metrics.py (extended) ── asymmetric metrics, parity-preserving            │
   └─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
   ┌─────────────────────────────────────────────────────────────────────────┐
   │                          VS4 additions                                    │
   │  double_oracle.py ── restricted solve ↔ full-space BR loop                 │
   │                       exploitability certificate (upper − lower)           │
   └─────────────────────────────────────────────────────────────────────────┘
                                     │
                                     ▼
        reports.py (extended)   cli.py (extended: best-response, double-oracle)
```

### Layering rules (additive to the VS1/VS2 rules)

- `best_response.py` **calls the resolver** (through `memo.py`); it never re-implements
  payoff logic. It may build an internal MILP/DP *model* of legality and payoffs, but that
  model is a search device only — the result is always resolver-recomputed.
- `double_oracle.py` calls `best_response.py` and the VS2 zero-sum LP; it never enumerates
  the full matrix and never certifies convergence from the restricted game.
- `memo.py` is a transparent cache: identical inputs → identical outputs, same traces and
  audit hashes as the direct resolver; keyed by a content hash of the full resolver input
  (§7).
- Strategic-equivalence collapse stays in `matrix.py` (its VS2 home, `collapse_strategies`);
  VS3 adds a **per-side call** there, not a second implementation elsewhere. `canonical.py`
  is reused only for the canonical resolver-input signature / content hash (the memo key,
  §7).
- Extensions to `matrix.py`, `equilibrium.py`, `metrics.py`, `reports.py`, `cli.py` must
  keep every existing VS1/VS2 code path and result unchanged (REQ-14.7).

---

## 3. Sign and game conventions (REQ-1, REQ-9, REQ-10)

Both games are two-player zero-sum with the **row player = A** maximising:

- Win game: payoff \(u^W(a,b)\in\{-1,0,1\}\) from `ResolutionResult.win_utility[A]`.
- Margin game: payoff \(u^M(a,b)=r_A-r_B\) from `ResolutionResult.margin_utility[A]`.

For a rectangular payoff matrix \(U\in\mathbb Z^{m\times n}\) (rows = A's strategies,
columns = B's), with row mixture \(x\in\Delta^{m}\) and column mixture \(y\in\Delta^{n}\):

- \(u(x,y)=x^{\!\top}U y\).
- Row player guarantees \(\min_b (x^{\!\top}U)_b\) by committing to \(x\).
- Against \(y\), the row player's best attainable is \(\max_a (Uy)_a\).
- The game value \(v=\max_x\min_y x^{\!\top}Uy=\min_y\max_x x^{\!\top}Uy\) (minimax), solved
  by the VS2 `numerical_lp` LP; column player minimises.

Zero-sum for the column player follows from resolver player-swap symmetry
(\(u_B=-u_A\), VS1 REQ-7.3), verified per cell (REQ-1.4). Antisymmetry (\(U=-U^{\!\top}\))
holds **only** at parity and must never be assumed for \(A\ne B\) — asymmetric cells are
filled by direct resolver calls (REQ-1.3).

All reported best-response and double-oracle values use this **row-payoff convention**
(`value_row_payoff`). A row BR maximises \(u_{\text{row}}(a,y)\); a column BR minimises
\(u_{\text{row}}(x,b)\). A column oracle implemented as a maximisation of its own payoff
\(-u_{\text{row}}\) **negates** its result back to the row-payoff convention before
reporting; its own-perspective value may be carried separately as `value_side_payoff` but
is never used as a bound un-negated (REQ-6.1).

---

## 4. New / extended core types

```python
@dataclass(frozen=True)
class BestResponseCertificate:
    method: str                      # "exhaustive" | "exact_dp" | "milp" | "ip"
    optimal: bool                    # True iff optimality proven/certified within tolerance
    resolver_incumbent_value: float  # resolver-recomputed value of the incumbent (row-payoff)
    solver_objective_bound: float    # certified objective bound (row-payoff convention):
                                     #   row BR  -> UPPER bound on max_a u_row(a, y)
                                     #   column BR -> LOWER bound on min_b u_row(x, b)
    absolute_optimality_gap: float   # |incumbent - bound|
    relative_mip_gap: float | None   # MILP relative gap; None for exact methods
    solver_status: str | None        # backend status, e.g. HiGHS "Optimal"
    tolerances: Mapping[str, float]
    proof: Mapping[str, object]      # method-specific witness (see §6.4)

@dataclass(frozen=True)
class BestResponse:
    side: str                        # "row" (A) or "column" (B)
    utility: str                     # "win" | "margin"
    opponent: OpponentSpec           # a pure strategy or a mixture (ids + probs)
    allocation: Allocation           # exact, legal, with explicit residue
    value_row_payoff: float          # AUTHORITATIVE: resolver-recomputed, row-payoff convention
    value_side_payoff: float | None  # optional: acting side's own perspective
                                     #   (row: == value_row_payoff; column: == -value_row_payoff)
    certificate: BestResponseCertificate
    evidence_class: str              # exact_exhaustive_best_response | exact_dp_best_response
                                     #   | numerical_milp_best_response_certified

@dataclass(frozen=True)
class DoubleOracleIteration:
    index: int
    restricted_value: float
    row_support: tuple[tuple[str, float], ...]
    column_support: tuple[tuple[str, float], ...]
    upper_bound: float               # row BR certified UPPER bound on max_a u_row(a, y)
    lower_bound: float               # column BR certified LOWER bound on min_b u_row(x, b)
    gap: float                       # upper_bound - lower_bound  (>= 0), row-payoff convention
    row_deviation: str | None        # allocation id added, if profitable & new
    column_deviation: str | None

@dataclass(frozen=True)
class DoubleOracleResult:
    utility: str                     # "win" | "margin"
    converged: bool                  # True iff exploitability_gap <= tolerance
    stop_reason: str                 # "converged" | "iteration_cap" | "solver_failure"
                                     #   | "stalled" | "oracle_inconsistency"
    restricted_value: float
    lower_bound: float               # certified full-game lower bound (row-payoff)
    upper_bound: float               # certified full-game upper bound (row-payoff)
    exploitability_gap: float        # upper_bound - lower_bound (incorporates BR tolerances)
    row_strategy: tuple[tuple[str, float], ...]
    column_strategy: tuple[tuple[str, float], ...]
    iterations: tuple[DoubleOracleIteration, ...]
    tolerances: Mapping[str, float]  # LP, MILP, gap, profitable-deviation
    residuals: Mapping[str, float]
    evidence_class: str              # "certified equilibrium bracket" | "bound"
```

The rectangular `PayoffMatrix` reuses the VS2 dataclass; the only change is that
`row_strategy_ids` and `column_strategy_ids` may have different lengths and derive from
different states (REQ-1.3).

---

## 5. Asymmetric states (REQ-1, REQ-2, REQ-3)

### 5.1 Rectangular payoff construction

`build_two_player_payoff_matrix(config, state_a, state_b, allocs_a, allocs_b)` already
takes both states; VS3 removes the symmetric fast-path guard so it is used **only** when
`state_a == state_b` (parity). For \(A\ne B\), every cell \((i,j)\) is resolved directly
by `resolve_profile(config, {A: state_a, B: state_b}, {A: allocs_a[i], B: allocs_b[j]})`
through `memo.py`. Matrix/memory ceilings (VS2 `MAX_MATRIX_DIM`, `MAX_MATRIX_BYTES`) apply
to \(m\) and \(n\) separately; over-limit → `MatrixLimitError` (no sampling).

### 5.2 Per-side collapse

Strategic-equivalence collapse (VS2 `collapse_strategies`) is applied twice: once to the
rows over their behaviour vectors against the full column set, once to the columns over
their behaviour vectors against the full row set. Each retains its own
representative→members map (REQ-2.1). At parity the two maps coincide and reproduce the
VS2 single collapse.

### 5.3 Row and column canonical mixtures

The zero-sum LP is solved on the rectangular matrix; the primal gives the **row** maximin
mixture \(x\), the dual gives the **column** minimax mixture \(y\). The canonical
maximum-entropy selection (VS2 `max_entropy_equilibrium` / `max_entropy_equilibrium_column`)
is applied to each optimal-strategy polytope **independently** (REQ-2.2). \(\mathcal E^{0.01}\)
is computed per side. Parity ⇒ \(x=y=\) the VS2 canonical equilibrium (REQ-2.4).

### 5.4 Parity-preserving metrics

`metrics.py` is generalised so every bilinear metric takes \((x, y)\) explicitly
(the VS2-C work already moved VOI and the tie metrics to per-side mixtures, so this is a
small generalisation). Metrics meaningful only at parity are emitted as `not_applicable`
for asymmetric states (REQ-3.3). A dedicated regression asserts that, on every committed
VS2 parity fixture, all VS3 metrics equal the VS2 values exactly (exact fields) / within
tolerance (numerical fields) (REQ-1.5, REQ-3.4).

---

## 6. Exact best-response oracles (REQ-4, REQ-5, REQ-6)

### 6.1 Common contract

`best_response(config, states, side, utility, opponent, *, method="auto") -> BestResponse`

`opponent` is either a pure strategy (a single allocation) or a mixture (allocation ids +
probabilities). The oracle maximises the side's **expected** utility over that side's
entire legal allocation space:

\[
\text{win: } \max_{a}\ \sum_b y_b\,u^W(a,b),\qquad
\text{margin: } \max_{a}\ \sum_b y_b\,u^M(a,b).
\]

Regardless of method, the oracle:

1. produces a candidate legal allocation \(a^\*\) (a column oracle maximising its own
   payoff \(-u_{\text{row}}\) **negates** back to the row-payoff convention first, REQ-6.1);
2. **re-validates** with the resolver: for each \(b\) in the opponent support, call
   `resolve_profile` and recompute \(u_{\text{row}}(a^\*,b)\); set `value_row_payoff` to the
   \(y\)-weighted sum (authoritative, REQ-6.2), and optionally `value_side_payoff`;
3. if the optimiser's internal objective and `value_row_payoff` disagree beyond tolerance
   (exactly for a pure opponent and integer utility), raise `BestResponseValidationError`
   (REQ-6.4);
4. attaches a `BestResponseCertificate` recording the resolver incumbent value, the
   certified solver **objective bound**, the absolute gap, the relative MIP gap (MILP only),
   the solver status and the tolerances (§6.4, REQ-6.3).

### 6.2 Margin best response (REQ-4)

Margin is additive across Trials **only when the fixed opponent makes Trials
independent** — i.e. each Trial's award to A depends solely on A's and B's entries on that
Trial, with no shared-award coupling and no final-result tiebreak deciding the outcome.
`best_response` first runs a **separability check** on `(config, states, opponent)`:

- **Separable:** award to A on Trial \(t\) is a function of A's per-Trial allocation alone
  (given the fixed opponent), and the final result is decided by summed Recognition Points
  with no active final-tiebreak coupling. Then the problem is a bounded integer knapsack
  over Trials and domains: choose per-Trial, per-domain integer entries subject to the
  ledger (\(\sum \le\) available) maximising \(\sum_t \text{award}_A(t)\). Solved by an
  **exact-arithmetic dynamic program** over (domain budgets × Trials) or a small IP.
  Certificate: the exact DP optimum plus resolver recomputation of the assembled allocation
  (§6.1); evidence class `exact_dp_best_response` — exact **only** because the recurrence
  and objective use exact integer/rational arithmetic (REQ-4.2).
- **Coupled** (shared awards, coupling eligibility, or an active final Spellbook
  tiebreak): the separability check fails; the oracle **does not** decompose. It uses a
  `scipy.optimize.milp` integer program that models the coupling (evidence class
  `numerical_milp_best_response_certified`), or an exhaustive fallback on in-limit states
  (`exact_exhaustive_best_response`). Certificate: the certified MILP objective bound/gap,
  or the exhaustive maximum.

The separability check is conservative: when in doubt it declares *coupled* and avoids the
DP (REQ-4.2, REQ-4.3, Authority §4).

### 6.3 Win best response (REQ-5) — expected-sign MILP

The win objective is **not** additive (a Trial award changes total RP, which flips a
global win/tie/loss sign, possibly decided by the final tiebreak). A per-domain DP is
therefore **prohibited as the primary oracle** (REQ-5.1). Instead, against opponent support
\(\{(b, y_b)\}\), solve the MILP:

\[
\max\ \sum_b y_b\,(w_b - \ell_b)
\]

subject to, for each \(b\):

- integer allocation variables for A with ledger conservation, eligibility, Wild legality,
  invalidation and completion modelled as linear/integer constraints, so the feasible
  region is exactly A's legal allocations (REQ-5.3);
- A's Recognition-Point total \(r_A(b)\) and B's \(r_B(b)\) expressed from the modelled
  Trial awards (B fixed);
- binary indicators \(w_b,\,t_b,\,\ell_b\) (win / tie / loss) with
  \(w_b+t_b+\ell_b=1\), linked by big-\(M\) / indicator constraints to the sign of
  \((r_A(b)-r_B(b))\) **and**, on an RP tie, to the final-result (final Spellbook
  tiebreak) outcome, consistent with the resolver (REQ-5.2).

Backend: `scipy.optimize.milp` with the pinned SciPy/HiGHS backend (never
`scipy.optimize.linprog`, which does not solve MILPs — `linprog` is reserved for the
continuous restricted zero-sum LP of §8). The backend, options, `solver_status` and the
absolute/relative MIP gap are recorded (REQ-5.4). The MILP is a *search*: its incumbent
\(a^\*\) is re-validated by the resolver and the reported value is `value_row_payoff`
(REQ-5.5, REQ-6); the result carries the `numerical_milp_best_response_certified` evidence
class — a full-space search does not make a floating-point optimum exact (REQ-13, NFR-5).
If the MILP cannot certify optimality (relative/absolute gap above tolerance or non-optimal
status), the result is **not** emitted as "best"; on tractable states the oracle falls back
to exhaustive search, and on intractable states it raises `NonOptimalBestResponseError`
(REQ-5.6, NFR-4).

> **Modelling honesty.** Encoding eligibility, Wild legality, shared awards and the final
> Spellbook tiebreak exactly in a MILP is the hard part. The design keeps the MILP "small"
> (one state, one opponent support) and treats the resolver as ground truth: the MILP need
> only be *sound* (feasible region ⊆ legal allocations) and, when it claims optimality,
> *complete* (feasible region ⊇ legal allocations) — both are checked on tractable fixtures
> by exhaustive comparison (REQ-7.1). Any modelling gap surfaces there as a mismatch, not
> as a silent wrong answer.

### 6.4 Certificates and evidence classes (REQ-4.4, REQ-5, REQ-6.3, REQ-13)

Every `BestResponseCertificate` records the resolver-recomputed incumbent value, the
solver's **certified objective bound** (row BR: an **upper** bound on \(\max\); column BR:
a **lower** bound on \(\min\), both in the row-payoff convention), the absolute optimality
gap, the relative MIP gap (MILP only), the solver status and the tolerances. `proof` is
method-specific and machine-checkable:

- **exhaustive** → evidence class `exact_exhaustive_best_response`: the enumerated
  candidate count and the argmax; bound == incumbent (gap 0, **exact**); re-checkable by
  re-running enumeration.
- **exact_dp** → evidence class `exact_dp_best_response`: the exact-arithmetic DP value,
  the separability-check result, and the recomputed value of the assembled allocation
  (must equal the resolver value); bound == incumbent (gap 0, **exact**). Valid **only**
  with exact integer/rational arithmetic.
- **milp / ip** → evidence class `numerical_milp_best_response_certified`: the backend
  optimality status, the absolute and relative gaps, the certified objective bound, and the
  resolver-recomputed incumbent value. **Numerical, certified — not exact.**

`optimal=True` is set only when optimality is proven/certified within tolerance (exhaustive
and exact DP always; MILP/IP when the status is optimal and the gap is within tolerance).
The certificate never asserts optimality from the optimiser objective alone. The
double-oracle bounds (§8) consume the **certified objective bound**, substituting the
resolver-recomputed incumbent for it **only** where the gap certifies they coincide within
tolerance (REQ-6.5, REQ-10.1).

---

## 7. Memoized resolution (REQ-8)

`memo.py` wraps `resolve_profile` with a dictionary keyed by a **canonical content hash of
the complete normalized semantic resolver input** — the full configuration *content* (not
merely `config_id`/`config_version`), both player states, both allocations, the row/column
role assignment, and every other input that affects resolver output. `canonical.py`
produces this signature by hashing the same normalized, sorted structure the resolver's
audit hash is built from, so two keys collide **iff** the resolver inputs are genuinely
identical — and the key stays correct even if a configuration file is edited **without** a
version bump (REQ-8.1). Because the resolver is pure and deterministic (NFR-2), a cache hit
returns the identical `ResolutionResult`, including trace and audit hash (REQ-8.2).

- The memo is injectable; disabling it changes only performance (REQ-8.5).
- A proof test builds every committed fixture's payoff matrix twice — once memoized, once
  direct — and asserts the serialized matrices and all derived metrics are **byte-identical**
  (REQ-8.3).
- Cache hit rate and wall-clock runtime (memoized vs direct) are reported as diagnostics
  only (REQ-8.4). The double oracle benefits most: best-response re-validation resolves
  many repeated (state, allocation) pairs.

---

## 8. Double oracle (REQ-9, REQ-10, REQ-11, REQ-12)

### 8.1 Algorithm (run once per utility)

```text
X, Y  <- deterministic initial restricted strategy sets (e.g. one seeded allocation each)
for k in 1 .. iteration_cap:
    (v_R, x, y) <- solve_zero_sum(restricted_matrix(X, Y), utility)  # numerical_lp (linprog)
    row_br <- row_best_response(against mixture y over Y)     # full space, max_a u_row(a, y)
    col_br <- column_best_response(against mixture x over X)  # full space, min_b u_row(x, b)
    upper  <- row_br.certificate.solver_objective_bound   # certified UPPER bound on the max
    lower  <- col_br.certificate.solver_objective_bound   # certified LOWER bound on the min
    gap    <- upper - lower                                # row-payoff; includes BR tolerances
    if gap < -gap_tol:  return bound(lower, upper, stop_reason="oracle_inconsistency")
    record iteration(v_R, x, y, upper, lower, gap, deviations)
    if gap <= tolerance:  return converged(...)            # SOLE convergence certificate
    added_row <- add row_br to X if profitable(row_br, v_R) and new
    added_col <- add col_br to Y if profitable(col_br, v_R) and new
    if not (added_row or added_col):                       # gap > tol yet nothing to add
        return bound(lower, upper, stop_reason="stalled")  # never "converged"
return bound(lower, upper, stop_reason="iteration_cap")
```

Profitable-deviation tests carry explicit tolerances (row-payoff convention):
`profitable(row_br, v_R) := row_br.value_row_payoff > v_R + dev_tol`;
`profitable(col_br, v_R) := col_br.value_row_payoff < v_R - dev_tol`. Convergence is
declared **only** by `gap <= tolerance` (REQ-10.3) — never by "nothing added". "Nothing
added" while `gap > tolerance` is a **stall**, and a negative gap is an **oracle
inconsistency**; both return a `bound` (or raise an explicit consistency error), never a
converged result (REQ-9.4, REQ-12).

The restricted matrix is built only over \(X\times Y\) (plus the newly added
row/column), never the full matrix (REQ-9.5). Initial sets and the deviation rule are
deterministic and recorded (REQ-9.3). A strategy already present is not re-added (REQ-9.4).

### 8.2 Why the bracket is a valid certificate (REQ-10)

Work in the row-payoff convention. Let \(M=\max_a u_{\text{row}}(a,y)\) and
\(m=\min_b u_{\text{row}}(x,b)\). For the true full-game value \(v\):

- \(m \le v \le M\) — the row player can secure at least \(m\) by playing \(x\), and cannot
  do better than \(M\) against \(y\).

The oracles return **certified bounds**, not the exact \(M,m\): the row BR reports a
certified **upper** bound \(\text{upper}\ge M\), the column BR a certified **lower** bound
\(\text{lower}\le m\). Hence
\[
\text{lower}\le m\le v\le M\le\text{upper},
\]
so \([\text{lower},\text{upper}]\) is a **conservative** bracket on the full-game value that
**incorporates every BR optimisation tolerance** (it is at least as wide as the exact
oracle gap \(M-m\)). \(\text{gap}=\text{upper}-\text{lower}\ge 0\); when
\(\text{gap}\le\) tolerance, \((x,y)\) is a certified \(\varepsilon\)-equilibrium of the
**full** game with \(\varepsilon=\text{gap}\). Where an oracle proves optimality
(exhaustive, exact DP, or a MILP whose gap is within tolerance) the certified bound
coincides with the resolver-recomputed incumbent within tolerance, and that incumbent may
be used in its place (REQ-6.5). The restricted value \(v_R\) and any restricted-game search
are **never** used for the certificate (REQ-10.3). A negative gap indicates an oracle/LP
inconsistency and yields a `bound` with stop reason `oracle_inconsistency` (or an explicit
error), never a converged result (REQ-12).

### 8.3 Restricted-set collapse guard (REQ-9.6)

Two allocations that produce identical payoff vectors **against the current restricted
opponent set** are not thereby proven strategically equivalent over the full space — a
later-added opponent strategy may separate them. The double oracle may therefore
deduplicate only allocations that are **canonically identical** (identical resolver-input
content hash, §7); it must **not** permanently collapse or discard distinct strategies on
the basis of restricted-set payoff coincidence. Full behavioural strategic-equivalence
collapse (§5.2) remains valid only for the **fully materialised** VS3 rectangular matrices,
where every opposing strategy is present.

### 8.4 Reporting

- **Converged** (`gap <= tolerance`, the sole criterion): report restricted value;
  certified lower/upper full-game bounds; gap; row & column supports (resolver-checked
  allocations + probabilities); full iteration history; restricted-LP, MILP and
  profitable-deviation tolerances/residuals; evidence class **certified equilibrium
  bracket** (REQ-11).
- **Not converged** (`iteration_cap`, `solver_failure`, `stalled`, or
  `oracle_inconsistency`): report the certified interval \([\text{lower},\text{upper}]\),
  label it a **bound** (evidence class `bound`), record the stop reason; never present a
  point estimate as the equilibrium value (REQ-12).

Win and margin are solved in two independent runs and reported separately (REQ-9.1).

---

## 9. CLI and reports (REQ-13, REQ-14)

New `cli.py` commands (proposed):

```bash
python -m ascension_trials best-response --config C --state-a A --state-b B \
    --side row --utility win --opponent <alloc-or-mixture>
python -m ascension_trials double-oracle --config C --state-a A --state-b B \
    --utility margin --tol 1e-9 --max-iter N
python -m ascension_trials analyse-asymmetric --config C --state-a A --state-b B
```

Reports extend the VS2 JSON/Markdown with: a best-response section (allocation, resolver
value, certificate, evidence class) and a double-oracle section (bounds, gap, supports,
iteration history, tolerances/residuals, evidence class), plus the hard-gate table
(REQ-13.4). The metadata block is unchanged from VS2 (REQ-13.1).

---

## 10. Error handling (additive to VS1/VS2)

- `BestResponseValidationError` — optimiser value ≠ resolver value (REQ-6.2).
- `NonOptimalBestResponseError` — optimality required but not proven, no exhaustive
  fallback available (REQ-5.6).
- `MatrixLimitError` (reused) — rectangular matrix over ceiling (REQ-1.6).
- `DoubleOracleError` — raised only for an unrecoverable LP/oracle inconsistency where a
  `bound` cannot be formed (REQ-12).
- Non-convergence (iteration cap, solver failure, or a **stall** with `gap > tolerance`) is
  **not** an error — it is a reported `bound` carrying its stop reason (REQ-12); a negative
  gap is reported as `oracle_inconsistency` (bound) or raised explicitly.

Invalid inputs never yield partial authoritative results (NFR-4).

---

## 11. Testing strategy (REQ-7 and the gates)

### 11.1 Asymmetric / parity (REQ-1, REQ-2, REQ-3)
- Parity regression: for each committed VS2 parity fixture, all VS3 outputs equal VS2
  (exact) / within tolerance (numerical).
- At least one committed **unequal-state** fixture with hand-verified rectangular matrix,
  per-side collapse, and per-side canonical mixtures.

### 11.2 Best-response vs exhaustive (REQ-7.1)
- For every tractable VS2 fixture, both oracles (win, margin) vs exhaustive search for
  **every** opponent pure strategy and for tested mixtures; resolver value must equal the
  exhaustive optimum.

### 11.3 Planted best-response fixtures (REQ-7.3)
- illegal-entry trap; Wild legality; shared-award coupling; final-Spellbook-tiebreak
  decision; and a fixture where the **win optimum ≠ margin optimum** (proves the two
  objectives differ and that the win MILP is not substitutable by the margin oracle).

### 11.4 Memoization (REQ-8)
- Byte-identical memoized-vs-direct matrices on all committed fixtures; hit-rate/runtime
  diagnostics recorded.

### 11.5 Double oracle (REQ-9..REQ-12)
- Reproduce VS2 values for A4, A5, A6, MATH-14 within tolerance with certified gap
  \(\le 10^{-9}\).
- One state that **qualifies as beyond-matrix** (the exhaustive-matrix path refuses it with
  an explicit cell-count / memory-estimate / runtime-estimate limit, e.g. `MatrixLimitError`):
  run to a certified bracket and **independently recheck** the certificate by the REQ-10 /
  VS4-gate procedure — reconstruct \(x,y\) from the report, rerun **both** full-space oracles
  **outside** the driver with **memoization disabled**, directly resolve the returned
  allocations, and rebuild the lower/upper bounds and gap. A re-read of the driver's stored
  bounds does not count.
- A capped or stalled run on a deliberately hard instance returns a `bound` (stop reason
  recorded), not an estimate.
- Determinism: repeated runs are bit-stable (NFR-1).

### 11.6 Regression
- The full VS1 + VS2 suite remains green throughout (REQ-14.7).

---

## 12. Key design decisions

- **Resolver is the only payoff authority; optimisers are searches.** Every best response
  and deviation is resolver-recomputed before it counts (REQ-6).
- **One sign convention.** All values are row-payoff (`value_row_payoff`); a column
  oracle's own-utility optimum is **negated** before use, never assigned to a row-payoff
  bound un-negated (REQ-6.1).
- **Best-response evidence is method-typed, not scope-typed.** Exhaustive and exact-DP are
  exact; a floating-point MILP is `numerical_milp_best_response_certified`, never "exact",
  and every BR carries certified bounds (incumbent, objective bound, abs/rel gap, status,
  tolerances) (REQ-13, NFR-5, REQ-6.3).
- **Win uses an expected-sign `scipy.optimize.milp` model, not a DP** (`linprog` is only
  the continuous zero-sum LP). Win is a global sign, not an additive per-Trial quantity
  (REQ-5).
- **Margin decomposes only when proven separable** (exact-arithmetic DP); shared awards,
  coupling eligibility and final tiebreaks force an IP/exhaustive path (REQ-4).
- **The exploitability gap is the *sole* convergence certificate**, built from the
  full-space oracles' **certified objective bounds** (`upper − lower`), so the interval
  incorporates all BR tolerances. "No profitable deviation" never means converged; a stall
  or negative gap yields a `bound`, never a converged label (REQ-10, REQ-12).
- **Non-convergence yields an honest bound**, never a disguised point estimate (REQ-12).
- **Asymmetry is additive; parity is a checked special case** that must reproduce VS2
  exactly (REQ-1, REQ-3).
- **Collapse lives in `matrix.py`.** VS3 adds a per-side call; the double oracle only
  deduplicates canonically identical allocations (content-hash), never collapses on
  restricted-set payoff coincidence (REQ-9.6).
- **Memoization is a pure cache** keyed by a content hash of the full resolver input,
  proven byte-identical, never a correctness dependency (REQ-8).
- **No VS5/VS6, no general solver/learning/infra/UI.** Scope is exactly VS3 + VS4.
