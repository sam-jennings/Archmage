---
title: Ascension Trials — Scalable Two-Player Analysis (VS3 + VS4) — Requirements
type: spec-requirements
spec: ascension-trials-scalable-two-player-analysis
scope: VS3 and VS4 only
updated: 2026-07-10
status: proposed
normative_source: ascension-trials/ascension_trials_model/docs/ASCENSION_TRIALS_KIRO_IMPLEMENTATION_SPEC_V1_1.md (§20), ASCENSION_TRIALS_CONFIGURATION_MODEL_V2_1.md
builds_on: .kiro/specs/ascension-trials-configuration-model/ (VS1 + VS2, approved 2026-07-10)
---

# Requirements — Ascension Trials Scalable Two-Player Analysis (VS3 + VS4)

## Project

**Name:** Ascension Trials — Scalable Two-Player Analysis
**Spec ID:** `ascension-trials-scalable-two-player-analysis`
**Scope:** **VS3 and VS4 only.** Asymmetric-state support and exact best-response
oracles (VS3); a certified double-oracle equilibrium method (VS4).
**Status:** Draft for approval. **No implementation begins until this spec's
requirements, design and tasks are approved.**
**Builds on:** the approved `ascension-trials-configuration-model` spec (VS1 rules
kernel + VS2 small-state exact laboratory), package `ascension-trials/ascension_trials_model/`.

## Introduction

VS1 delivered a pure, deterministic resolver; VS2 delivered an exact small-state
laboratory (exhaustive enumeration, strategic-equivalence collapse, exhaustive
two-player payoff matrices, iterated true strict dominance, the zero-sum LP, the
canonical maximum-entropy equilibrium, and the equilibrium-relevant set
\(\mathcal E^{0.01}\)). Both are approved and frozen; this spec must not weaken them.

VS2's exhaustive matrices do not scale: beyond a few thousand collapsed strategies per
side the payoff matrix cannot be materialised (VS2 refuses over-limit states rather than
sampling — REQ-10.4/REQ-12 of the prior spec). This spec adds two things and nothing else:

- **VS3 — asymmetric states + exact best-response oracles.** Support player A and player
  B holding *different* Spellbook states and *different* legal allocation spaces
  (rectangular games), and add exact best-response oracles for both the win and the
  margin utility that find an optimal deviation over the *full* legal strategy space
  **without** materialising the full matrix — each result validated by the resolver.
- **VS4 — certified double oracle.** Use those oracles inside a standard double-oracle
  loop that certifies exploitability against the *full* strategy space, so equilibrium
  values can be certified for states VS2 could never enumerate.

The resolver remains the sole source of payoff truth. Every optimiser here is a *search*
whose output is only accepted after the resolver independently recomputes its utility.

This spec deliberately excludes VS5 (cross-count candidate ranking) and VS6 (multiplayer),
and excludes all general-purpose solver, learning, infrastructure and UI work (see
**Out of Scope**).

---

## Glossary

Terms not redefined here carry their meaning from the prior spec and
`ASCENSION_TRIALS_KIRO_IMPLEMENTATION_SPEC_V1_1.md`.

- **Side:** the row player (A) or the column player (B) of a two-player game.
- **Asymmetric / unequal state:** a two-player game in which A and B have different
  player states and therefore different legal allocation spaces; the payoff matrix is
  **rectangular** (\(m\times n\), \(m\ne n\) in general).
- **Parity state:** the symmetric case A and B share an identical state and allocation
  space (the only case VS2 exercised); the square, antisymmetric games of VS2.
- **Win utility \(u^W\):** the resolver's two-player win utility \(u^W\in\{-1,0,1\}\)
  (A wins / final shared / A loses), read from `ResolutionResult.win_utility`.
- **Margin utility \(u^M\):** the resolver's Recognition-Point margin
  \(u^M=r_A-r_B\), read from `ResolutionResult.margin_utility`. Both games are
  two-player zero-sum (\(u_B=-u_A\)).
- **Row-payoff convention:** every game-theoretic value in this spec is expressed as the
  **row player's** payoff \(u_{\text{row}}(a,b)=u_A\). A row best response **maximises**
  \(u_{\text{row}}(a,y)\); a column best response **minimises** \(u_{\text{row}}(x,b)\)
  (equivalently it maximises its own payoff \(-u_{\text{row}}\), which must be **negated**
  back to the row-payoff convention before use). `value_row_payoff` is the authoritative
  quantity for all double-oracle bounds; `value_side_payoff` (the acting side's own
  perspective) may additionally be reported but is never used as a bound without negation.
- **Best-response (BR) oracle:** a function that, for a fixed side, a fixed opponent
  strategy or opponent mixture, and a utility (win or margin), returns a legal allocation
  optimising that side's expected row-payoff objective (row: maximise; column: minimise)
  over the **entire** legal allocation space, together with a **correctness certificate**
  (including certified optimizer bounds) and the **resolver-recomputed** `value_row_payoff`
  of the returned allocation.
- **Correctness certificate:** machine-checkable evidence bounding the returned
  allocation's optimality for the stated objective. It records the resolver-recomputed
  incumbent value, the solver's certified objective bound, the absolute optimality gap,
  the relative MIP gap, the solver status and the tolerances (REQ-6, design §6.4).
  Optimality is established either by exhaustive enumeration or an exact-arithmetic dynamic
  program (**exact**), or by a MILP proving its gap within tolerance (**numerical,
  certified — not exact**). The optimiser's unvalidated internal objective value alone is
  never a certificate.
- **Restricted game:** the finite zero-sum game over the current restricted strategy
  sets \(X\subseteq\) A's allocations, \(Y\subseteq\) B's allocations, solved (as a
  continuous LP) by the VS2 `numerical_lp` solver.
- **Exploitability certificate (double oracle):** the bracket
  \(\text{gap}=\text{upper\_bound}-\text{lower\_bound}\) in the row-payoff convention,
  where \(\text{upper\_bound}\) is the full **row** BR oracle's **certified objective upper
  bound** on \(\max_a u_{\text{row}}(a,y)\) against the current column mixture \(y\), and
  \(\text{lower\_bound}\) is the full **column** BR oracle's **certified objective lower
  bound** on \(\min_b u_{\text{row}}(x,b)\) against the current row mixture \(x\). Using
  certified solver bounds (not raw incumbents) makes the interval conservative — it
  incorporates every BR optimisation tolerance — and the full-game value is provably in
  \([\text{lower\_bound},\text{upper\_bound}]\).
- **Bound (result label):** a double-oracle result that stopped on iteration cap or
  solver failure — reported as a certified interval, explicitly **not** an equilibrium
  point estimate.
- **Memoized resolution:** a caching wrapper over the pure resolver keyed by a canonical
  (state, allocation) signature pair; it must not alter resolver semantics.

---

## Authority and non-negotiable constraints

Carried from `ASCENSION_TRIALS_KIRO_IMPLEMENTATION_SPEC_V1_1.md` §2 and §20 and binding here:

1. The resolver is the only authority on payoffs. **Every** best response and **every**
   double-oracle deviation is accepted only after the resolver independently recomputes
   its utility; an optimiser's internal objective is never authoritative by itself.
2. True strict dominance, weak-diagnostic-only, zero-sum win/margin games, explicit
   residue, exact-vs-numerical labelling and the no-silent-sampling rule are unchanged.
3. Win-utility best response **must not** use a per-domain dynamic program as its primary
   oracle.
4. Best-response decomposition **must not** be assumed where eligibility, shared rewards
   or final Spellbook tiebreaks couple decisions across Trials.
5. Double-oracle convergence **must not** be certified from restricted-game search, nor
   from a "no profitable deviation found" condition; convergence is declared **only** when
   the full-space exploitability gap is within tolerance (REQ-10).
6. Parity (equal-state) results from VS2 must be reproduced exactly.
7. No VS5 or VS6 capability, no multiplayer equilibrium claim, and none of the excluded
   technologies (see Out of Scope) may be introduced.
8. All game-theoretic values use the **row-payoff convention**; a column best response's
   own-utility optimum is **negated** to row-payoff terms before it is used as a bound.
9. Best-response optimality found by a floating-point MILP is **numerical (certified)**,
   not exact; only exhaustive search and exact-arithmetic dynamic programs yield **exact**
   best responses.

If an ambiguity blocks implementation, report it before coding rather than inventing a rule.

---

# Functional Requirements — VS3 (asymmetric states + exact best responses)

## REQ-1 — Asymmetric two-player state support

### User story

As an analyst, I want two-player games where A and B hold different states so that
non-mirror matchups can be analysed, not just symmetric self-play.

### Acceptance criteria

1. The system shall accept two independent player states (A and B), each with its own
   Spellbook-derived power, Wild, tiebreak statistics and provenance, and shall not
   require them to be equal.
2. Each side's legal allocation space shall be enumerated (or generated) from its **own**
   state; the two spaces may differ in size and content.
3. The two-player payoff matrix shall be **rectangular** \(m\times n\), rows indexed by
   A's strategies and columns by B's, with `win`, `margin`, `final_tie` and
   Trial-award-vector entries filled exclusively by resolver calls (no antisymmetry
   short-cut may be used when \(A\ne B\)).
4. Both games shall remain two-player zero-sum: for every cell,
   \(u^W_B=-u^W_A\) and \(u^M_B=-u^M_A\), verified by resolver player-swap.
5. When A and B are equal (parity), every VS3 result — legal counts, collapsed classes,
   \(\mathcal R\), \(\mathcal E^{0.01}\), game values, canonical mixtures, tie metrics —
   shall equal the corresponding VS2 result **exactly** (integer/exact fields identical;
   numerical fields within the recorded tolerances). A regression test shall assert this
   on the committed VS2 parity fixtures.
6. Matrix and memory ceilings (prior REQ-12 / NFR-4) shall continue to apply per side to
   the rectangular matrix; over-limit exact matrices shall be refused, never sampled.

---

## REQ-2 — Per-side strategic collapse and canonical mixtures

### User story

As a game theorist, I want equivalence collapse and equilibrium reporting done
separately for each side so that asymmetric games are handled correctly.

### Acceptance criteria

1. Strategic-equivalence collapse shall be performed **independently for the row side and
   the column side**, each over that side's own complete behaviour vectors (win, margin,
   final-tie flag, Trial-award vector against the opposing strategy set), retaining a
   representative→members map per side.
2. The zero-sum solve shall produce **separate** canonical row and column equilibrium
   mixtures (the row maximin mixture and the column minimax mixture), each labelled
   `numerical_lp`, with the canonical maximum-entropy selection applied per side.
3. \(\mathcal E^{0.01}\) shall be computed per side.
4. At parity the row and column canonical mixtures shall coincide (within tolerance) with
   each other and with the VS2 single canonical equilibrium.
5. All ordering shall be deterministic and independent of dictionary/hash iteration order
   (NFR-1).

---

## REQ-3 — Metrics extended to unequal states, parity preserved

### User story

As a reviewer, I want the VS2 metrics to generalise to asymmetric games without changing
their meaning at parity.

### Acceptance criteria

1. Every applicable VS2 metric (legal/maximal/collapsed counts, \(|\mathcal R|\),
   \(|\mathcal E^{0.01}|\), win/margin values, canonical mixtures, entropy, final-tie
   probability, per-Trial shared-award rate, final-tiebreak usage, counterability over
   \(\mathcal R\) and \(\mathcal E^{0.01}\), counter margins/distances, margin-VOI, dead
   power, reward concentration) shall be defined and computed for rectangular games,
   using the **row** and **column** mixtures separately wherever a mixture is required.
2. Bilinear / equilibrium-weighted metrics (e.g. equilibrium-weighted final-tie
   probability \(x^{\!\top}Ty\)) shall use the row mixture \(x\) and the column mixture
   \(y\) computed for the matching utility, not a single shared mixture.
3. Metrics that are only meaningful at parity (e.g. mirror-tie diagnostics) shall be
   reported as `not_applicable` for genuinely asymmetric states rather than silently
   producing a misleading number.
4. At parity, every metric value shall equal the VS2 value (exact fields identical,
   numerical fields within tolerance).
5. Every metric shall keep its VS2 evidence label.

---

## REQ-4 — Exact margin best-response oracle

### User story

As an analyst, I want an exact best response for the margin utility that exploits Trial
structure when it is valid but never assumes independence that the rules break.

### Acceptance criteria

1. The margin BR oracle shall, given a side, a fixed opponent pure strategy **or** an
   opponent mixture \(y\), and the margin utility, return a legal allocation maximising
   the side's expected margin \(\sum_b y_b\,u^M(a,b)\) over the side's entire legal
   allocation space.
2. It shall exploit additive per-Trial structure (a dynamic program or integer program
   over Trials, using **exact integer/rational arithmetic**) **only** when the
   configuration makes Trials separable for the fixed opponent — i.e. per-Trial awards are
   independent, and neither shared rewards nor final-result tiebreaks couple the decision.
   Only an exact-arithmetic DP may carry the `exact_dp_best_response` evidence class
   (REQ-13).
3. When eligibility, shared awards or final Spellbook tiebreaks couple decisions across
   Trials, the oracle shall **not** assume decomposability; it shall use an integer
   program or an exhaustive fallback that accounts for the coupling.
4. Whatever method is used, the oracle shall emit a **correctness certificate** (REQ-6.3)
   recording the certified optimizer bounds and the basis for optimality: exhaustive
   enumeration or an exact-arithmetic DP with a recomputed optimum (evidence class
   `exact_exhaustive_best_response` or `exact_dp_best_response`), or an IP/MILP whose
   absolute and relative gaps are within the recorded tolerance (evidence class
   `numerical_milp_best_response_certified`, **not** labelled exact).
5. The returned allocation shall be a legal allocation under the resolver's own legality
   rules (REQ-4/REQ-5/REQ-6 of the prior spec), including explicit residue.
6. The reported best-response value shall be the **resolver-recomputed** `value_row_payoff`
   of the returned allocation (REQ-6), not the optimiser's internal objective.

---

## REQ-5 — Exact win best-response oracle (expected-sign MILP)

### User story

As an analyst, I want an exact win-utility best response that optimises the expected win
sign directly, because win-optimal and margin-optimal play can differ.

### Acceptance criteria

1. The win BR oracle shall **not** use a per-domain dynamic program as its primary oracle.
2. It shall formulate the expected-sign objective against an opponent support as a small
   mixed-integer program: maximise \(\sum_b y_b\bigl(\mathbb 1[\text{A wins vs }b]-
   \mathbb 1[\text{A loses vs }b]\bigr)\), where the win/tie/loss indicators are binary
   variables linked to A's and B's total Recognition Points and to the final-result
   (final Spellbook tiebreak) outcome, consistent with the resolver's semantics.
3. The MILP shall model legal allocations (integer allocation variables, ledger
   conservation, eligibility, Wild legality, invalidation, completion policy) so that its
   feasible region contains only legal allocations.
4. It shall use `scipy.optimize.milp` with the pinned SciPy/HiGHS backend (never
   `scipy.optimize.linprog`, which does not solve MILPs and is reserved for the continuous
   zero-sum LPs); the backend, options, solver status and absolute/relative MIP gap shall
   be recorded (REQ-6.3).
5. It shall return an exact legal allocation plus its **independently resolver-recomputed**
   `value_row_payoff` (REQ-6); the MILP result carries the
   `numerical_milp_best_response_certified` evidence class (REQ-13), never an exact label.
6. The MILP's internal objective value shall never be reported as the result on its own;
   a MILP that cannot prove optimality shall be reported as such and shall fall back to an
   exhaustive oracle on tractable states rather than emitting an unproven "best" response.

---

## REQ-6 — Resolver validation and certified bounds for every best response

### User story

As a reviewer, I want every optimiser output re-checked by the resolver, expressed in one
sign convention, and accompanied by certified bounds, so that no result depends on the
optimiser being bug-free.

### Acceptance criteria

1. All best-response values shall use the **row-payoff convention**: a row BR maximises
   \(u_{\text{row}}(a,y)\); a column BR minimises \(u_{\text{row}}(x,b)\). A column oracle
   implemented as a maximisation of its own payoff \(-u_{\text{row}}\) shall **negate** its
   result to row-payoff terms; a column player's maximised own utility shall never be used
   as a row-payoff bound without negation.
2. For every best response returned (win or margin, pure-opponent or mixture), the system
   shall call the pure resolver on the returned allocation against the relevant opponent
   strategy/strategies and shall report the resolver-recomputed value in the row-payoff
   convention as `value_row_payoff` (authoritative). `value_side_payoff` (the acting side's
   own perspective) may additionally be reported but shall never feed a bound without
   negation.
3. Every best response shall carry a certificate recording: the resolver-recomputed
   incumbent value; the solver's certified objective bound; the absolute optimality gap;
   the relative MIP gap (where applicable); the solver status; and the tolerances used.
4. If the optimiser's internal objective and the resolver-recomputed value disagree beyond
   tolerance (exactly, for a pure opponent and integer win/margin values; within recorded
   tolerance for an expected value over a mixture), the system shall raise an explicit
   error and shall not emit a result.
5. The optimiser's internal objective shall be treated as a search heuristic only; the
   authoritative value is always the resolver's. A resolver-recomputed incumbent value may
   substitute for a certified solver bound **only** when the certificate establishes that
   the two coincide within the required tolerance (REQ-10).

---

## REQ-7 — Best-response validation suite

### User story

As a reviewer, I want the oracles proven against brute force and against planted hard
cases so that their correctness is demonstrated, not assumed.

### Acceptance criteria

1. For **every tractable VS2 fixture**, the BR oracle (win and margin) shall be compared
   against exhaustive search for **every tested opponent pure strategy and for tested
   opponent mixtures**; the oracle's resolver-recomputed value shall equal the exhaustive
   optimum in every case.
2. At least one **unequal-state** fixture with a **hand-verifiable** best-response oracle
   shall be committed and verified.
3. Planted fixtures shall be committed that exercise:
   - illegal entries (a tempting-but-illegal allocation the oracle must avoid);
   - Wild (Wild that does/does not legally raise a Trial total);
   - shared awards (a shared Trial award coupling the two sides' payoffs);
   - final Spellbook tiebreaks (a case decided only at the final tiebreak);
   - a **win-utility optimum that differs from the margin-utility optimum** on the same
     state and opponent (demonstrating the two objectives are not interchangeable).
4. All new fixtures shall carry source/oracle provenance and hand-verifiable expected
   values, never values reverse-engineered from oracle output.

---

## REQ-8 — Resolution memoization with byte-identical proof

### User story

As a maintainer, I want resolution memoized for speed without any change to results.

### Acceptance criteria

1. Resolution shall be memoizable by a canonical key that is a **content hash of the
   complete normalized semantic resolver input** — the full configuration content (not
   merely its id and version), both player states, both allocations, the row/column role
   assignment, and every other input that affects resolver output. The key shall be
   derived deterministically, shall collide only for genuinely identical resolver inputs,
   and shall remain correct even when a configuration file changes **without** a version
   bump.
2. The memoized path shall be a pure caching wrapper: it shall not change resolver
   semantics, ordering, traces or audit hashes.
3. On **all committed fixtures**, the payoff matrices (and any derived metric) produced via
   the memoized path shall be proven **byte-identical** to those produced by the direct
   (non-memoized) path.
4. The system shall report cache hit rate and wall-clock runtime for memoized vs direct
   resolution, as diagnostics only; these figures shall not affect any result.
5. Memoization shall never be a correctness dependency: disabling it shall change only
   performance, never output.

---

# Functional Requirements — VS4 (certified double oracle)

## REQ-9 — Double-oracle solver for win and margin

### User story

As an analyst, I want a standard double-oracle method so that equilibria can be found for
states too large for an exhaustive matrix.

### Acceptance criteria

1. A double-oracle solver shall be implemented **separately for the win utility and the
   margin utility** (two independent runs; the games are solved separately, never merged).
2. Each run shall: (1) start from restricted strategy sets \(X,Y\); (2) solve the
   restricted zero-sum game with the VS2 `numerical_lp` solver to obtain a restricted
   value and mixtures \(x,y\); (3) call the exact **full-space** best-response oracle for
   **both** players against \(y\) and \(x\); (4) add profitable deviations to \(X\) and
   \(Y\); (5) repeat until the certified exploitability gap is within tolerance or a stop
   condition is hit.
3. The initial restricted sets and the deviation-selection rule shall be deterministic and
   recorded.
4. A strategy already present shall not be re-added. A candidate deviation counts as
   **profitable** only when its certified best-response value improves on the incumbent
   restricted payoff by more than a recorded profitable-deviation tolerance (row:
   strictly greater; column: strictly lower, in the row-payoff convention). "No profitable
   deviation found" shall **not** by itself declare convergence (see REQ-10).
5. The solver shall never materialise the full payoff matrix; it shall build only the
   restricted matrix over \(X\times Y\) plus the best-response columns/rows it adds.
6. Behavioural equality against the **current restricted opponent set** does not prove
   full-space strategic equivalence. The double oracle may deduplicate allocations that are
   **canonically identical** (identical resolver-input content hash, REQ-8), but it shall
   **not** permanently collapse or discard distinct strategies merely because their payoff
   vectors coincide against the current restricted set. Full behavioural
   strategic-equivalence collapse remains valid only for the fully materialised VS3
   matrices (REQ-2).

---

## REQ-10 — Oracle-certified exploitability

### User story

As a reviewer, I want convergence certified only by the full-space oracles, in one sign
convention, and conservatively including all optimisation tolerances.

### Acceptance criteria

1. The stopping certificate shall be, in the row-payoff convention,
   \[
   \text{gap}=\text{upper\_bound}-\text{lower\_bound}
   \]
   where \(\text{upper\_bound}\) is the **row** BR oracle's **certified objective upper
   bound** on \(\max_a u_{\text{row}}(a,y)\), and \(\text{lower\_bound}\) is the **column**
   minimisation BR oracle's **certified objective lower bound** on
   \(\min_b u_{\text{row}}(x,b)\). A resolver-recomputed incumbent value may be used in
   place of a certified bound **only** where the certificate establishes they coincide
   within tolerance (REQ-6.5).
2. The full-game value shall be reported as lying in the closed interval
   \([\text{lower\_bound},\text{upper\_bound}]\); this interval shall **incorporate all
   best-response optimisation tolerances** (it is conservative — at least as wide as the
   exact oracle gap). The gap shall be \(\ge 0\) and the solver shall assert this (a
   negative gap is a consistency error, REQ-12).
3. Convergence shall be declared **only** when \(\text{gap}\le\) the configured tolerance,
   computed from the **full-space** oracle bounds. Neither the restricted-game value, nor
   restricted-game search, nor a "no profitable deviation found" condition shall ever be
   used to certify convergence.
4. Both bound computations shall reuse the resolver-validated best-response oracles of
   REQ-4/REQ-5/REQ-6; the bounds shall be recomputable independently from \(x\), \(y\), the
   configuration and the oracle (REQ-6 and the VS4-gate independent-recheck procedure).

---

## REQ-11 — Convergence reporting

### User story

As a reviewer, I want a complete, auditable record of a converged run.

### Acceptance criteria

1. On convergence the run shall report:
   - restricted-game value;
   - certified lower and upper **full-game** bounds;
   - the exploitability gap;
   - the row and column strategy supports (allocations and probabilities);
   - the iteration history (per iteration: restricted value, deviations added, bounds,
     gap);
   - solver tolerances and residuals (restricted LP and any MILP);
   - the evidence class.
2. All reported allocations shall be legal and resolver-checked.
3. Reports shall be deterministic and byte-stable where timestamps are excluded/normalised.

---

## REQ-12 — Non-convergence bounds (bound, not estimate)

### User story

As a reviewer, I want honest output when the method does not converge.

### Acceptance criteria

1. When the run stops without a within-tolerance gap — on iteration cap, solver failure,
   or a **stall** (no profitable deviation added while the certified gap is still above
   tolerance) — it shall report the **certified interval**
   \([\text{lower\_bound},\text{upper\_bound}]\) achieved so far and shall label the result
   a **bound**, explicitly **not** an equilibrium point estimate. Such a state shall
   **never** be labelled converged.
2. A stall (gap \(>\) tolerance yet no profitable deviation, or a negative gap) indicates an
   oracle/LP inconsistency; the run shall either return a `bound` with stop reason
   `stalled` / `oracle_inconsistency` or raise an explicit consistency error — never
   silently proceed and never claim convergence.
3. The label and evidence class shall make the non-convergence unmistakable; no point
   value shall be presented as "the equilibrium value" for a non-converged run.
4. The reason for stopping (`iteration_cap`, a specific `solver_failure`, `stalled`, or
   `oracle_inconsistency`) shall be recorded.

---

# Cross-cutting Requirements

## REQ-13 — Evidence classes and reports

### User story

As a reviewer, I want VS3/VS4 outputs labelled by evidence class, consistent with VS1/VS2.

### Acceptance criteria

1. Reports (JSON + Markdown) shall carry the prior spec's metadata block (config id/version,
   player count, state ids, scoring-reference version + content hash, Trials-power-profile
   version, provenance, method, solver, tolerances, seed, code revision where available).
2. Evidence classes shall extend the prior set with:
   - **`exact_exhaustive_best_response`** — a BR proven optimal by full enumeration
     (exact);
   - **`exact_dp_best_response`** — a BR proven optimal by an exact-arithmetic dynamic
     program (exact); valid only where the recurrence and objective use exact
     integer/rational arithmetic (REQ-4.2);
   - **`numerical_milp_best_response_certified`** — a BR found by a floating-point MILP
     with its absolute/relative gap certified within tolerance (**numerical, not exact** —
     searching the full allocation space does not make a floating-point result exact);
   - **certified equilibrium bracket** — a converged double-oracle result with
     \(\text{gap}\le\) tolerance;
   - **bound** — a non-converged double-oracle interval (REQ-12).
   The prior classes (theorem, exact exhaustive, exact-given-profile, numerical LP,
   numerical convex, sampled, design judgement) remain available.
3. No numerical or bracketed result shall be labelled exact; no bound shall be labelled an
   equilibrium.
4. Reports shall include a hard-gate table (pass/fail/not_evaluated) as in VS2.

## REQ-14 — Repository integration and reproducibility

### User story

As a maintainer, I want VS3/VS4 integrated into the existing package cleanly and
reproducibly.

### Acceptance criteria

1. Work shall live in the existing package `ascension-trials/ascension_trials_model/` and reuse
   the VS1/VS2 interfaces (`Configuration`, `PlayerState`, `Allocation`, `resolve_profile`,
   the enumeration, matrix, dominance and equilibrium modules) rather than duplicating them.
2. New modules shall be added for the best-response oracles, the memoization wrapper and
   the double-oracle solver; existing modules may be **extended** (rectangular matrices,
   per-side collapse/mixtures, asymmetric metrics, new report sections, new CLI commands)
   without breaking VS1/VS2 behaviour.
3. NumPy/SciPy versions shall remain pinned; any MILP backend shall be pinned in the lock
   file and recorded in reports.
4. Generated outputs shall stay gitignored.
5. `meta/manifest.yml` shall be updated in the same change if any declared path changes.
6. Exact test and CLI commands shall be recorded in the VS3 and VS4 completion reports.
7. All prior VS1 + VS2 tests shall remain green throughout; no VS1/VS2 oracle, fixture or
   determinism guarantee shall be weakened.

---

# Non-Functional Requirements

## NFR-1 — Determinism
All ordering, serialization, hashing, best-response tie-breaking, double-oracle deviation
selection and reports shall be independent of Python hash or dictionary iteration order.

## NFR-2 — Purity
The resolver and best-response oracles shall have no dependency on UI, database, network
or mutable global state; memoization shall be an explicit, injectable cache.

## NFR-3 — Numerical transparency
All floating-point and MILP claims shall expose method, tolerances, residuals and
optimality status/gap.

## NFR-4 — Failure visibility
The system shall fail explicitly on over-limit exact matrices, infeasible states,
non-optimal MILP status where optimality is required, and non-convergence — never
silently approximate, sample or repair.

## NFR-5 — Exactness preservation
Integer/exact quantities (enumeration, resolver payoffs, returned best-response
allocations) shall remain exact, and every returned best response is always an exact legal
allocation. **Optimality evidence is classified by method, not by search scope:** only
exhaustive search and exact-arithmetic dynamic programs yield **exact** best responses;
a floating-point MILP yields a **numerical, certified** best response (labelled
`numerical_milp_best_response_certified`) — searching the full allocation space does not
make it exact. The restricted-game LP, the max-entropy selection,
expected-value-over-mixture quantities and MILP-derived optimality are numerical and shall
be labelled so.

---

# Out of Scope for This Spec

Explicitly **not** included (and not to be introduced):

- VS5 cross-count candidate ranking (strength paths, per-count Pareto reports, archetype
  matrices, automatic "best configuration" selection);
- VS6 multiplayer simulation (S1/S2 populations, kingmaker/spoiler/contender metrics);
- generic n-player equilibrium solvers or any multiplayer equilibrium claim;
- CFR, reinforcement learning or neural models;
- a general game-description language;
- GPU, distributed or database infrastructure;
- UI work.

---

# Approval Gates

## Spec approval (before any implementation)

Implementation of VS3/VS4 may begin only after:

1. this `requirements.md` is approved;
2. `design.md` is consistent with every requirement here;
3. `tasks.md` maps every task to requirement IDs and encodes the VS3 and VS4 gates as
   explicit stop-for-review tasks.

## VS3 gate (stop for review)

VS3 is complete only when:

1. all prior VS1 + VS2 tests remain green (REQ-14.7);
2. asymmetric exhaustive (rectangular) matrices work and parity reproduces VS2 exactly
   (REQ-1, REQ-2, REQ-3);
3. the exact best responses (win and margin) match exhaustive search on **all in-limit
   fixtures**, for every tested opponent pure strategy and mixture (REQ-4, REQ-5, REQ-6,
   REQ-7);
4. the win and margin best-response objectives are shown to **differ** on a planted
   fixture (REQ-7.3);
5. memoized and direct outputs are **identical** on all committed fixtures (REQ-8).

Produce a VS3 completion report and **stop for review**. Do not begin VS4 without approval.

## VS4 gate (stop for review)

VS4 is complete only when:

1. the double oracle reproduces the VS2 game values for **A4, A5, A6 and MATH-14** within
   tolerance (REQ-9, REQ-10, REQ-11);
2. certified exploitability is at most \(10^{-9}\) on those fixtures (REQ-10);
3. at least one state **beyond practical full-matrix analysis** receives an
   **independently rechecked** certificate, where:
   - the state *qualifies as beyond-matrix* **only** when the configured exhaustive-matrix
     path refuses it via an explicit cell-count, memory-estimate or runtime-estimate limit
     (a raised `MatrixLimitError` or equivalent refusal — not a subjective judgement);
   - *independent rechecking* means: reconstruct the final row and column mixtures from the
     report; rerun **both** full-space BR oracles **outside** the double-oracle driver;
     **disable memoization**; directly resolve the returned best-response allocations; and
     recompute the certified lower and upper bounds and the gap. A repeated read of the
     driver's stored bounds is **not** an independent recheck (REQ-9, REQ-10);
4. non-convergence emits **bounds, not an unsupported point estimate** (REQ-12).

Produce a VS4 completion report and **stop for review**. VS5 and VS6 remain out of scope
and require their own new spec.
