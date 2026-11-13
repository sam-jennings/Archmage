---
title: Ascension Trials Configuration Model — Requirements
type: spec-requirements
spec: ascension-trials-configuration-model
scope: VS1 and VS2
updated: 2026-07-10
status: proposed
normative_source: ASCENSION_TRIALS_CONFIGURATION_MODEL_V2_1.md
---

# Requirements — Ascension Trials Configuration Model

## Project

**Name:** Ascension Trials Configuration Model  
**Spec ID:** `ascension-trials-configuration-model`  
**Scope:** VS1 and VS2 only  
**Status:** Draft for approval before implementation resumes  
**Normative source:** `ASCENSION_TRIALS_CONFIGURATION_MODEL_V2_1.md`

## Introduction

Build a deterministic, data-driven analysis subsystem for comparing alternative Ascension Trials configurations. The first milestone must:

- represent historical, current and experimental configurations as data;
- derive Trial power from Spellbooks;
- validate and resolve fixed allocation profiles;
- reproduce all source-backed adversarial fixtures;
- exhaustively analyse small two-player states;
- solve their zero-sum games numerically;
- report exact structural results separately from numerical or sampled results.

The first milestone must not optimize reward tables, select a final configuration, simulate the full base game or begin scalable multiplayer analysis.

---

## Glossary

- **Configuration:** A complete data description of power conversion, domains, Trials, eligibility, allocation rules, Wild rules, rewards, tiebreaks and information structure.
- **Player state:** Normal-domain power, Wild power, independent score, tiebreak statistics and provenance.
- **Standard Recognition Points \(q(S)\):** Independent standard Spellbook score computed from the current `rulebook/Scoring System Reference.md` (v3.1). A versioned scoring table, loaded or adapted — never embedded as an obsolete copy in this spec. Recorded with scoring-reference version and content hash. Used for the standard game evaluation, not for Trials.
- **Trials domain power \(F_C(S)\):** The per-domain Ascension Trials power a Spellbook generates under configuration \(C\), from a data-driven Trials power profile. Independent of \(q(S)\). The current `rulebook/Ascension Trials.md` (v2.8) formula is the current candidate; \(2n-3\) and similar are experimental candidates only.
- **Allocation:** Integer normal and Wild power assigned to Trials plus explicit residue.
- **Maximal allocation:** A legal allocation to which no residual unit can be added legally.
- **Strategic equivalence:** Two allocations produce identical win payoff, margin payoff, final outcome and Trial-award vector against every opposing allocation.
- **Reasonable set \(\mathcal R\):** Strategies surviving iterated elimination of true strictly dominated strategies.
- **Equilibrium-relevant set \(\mathcal E^{0.01}\):** Strategies capable of receiving at least 1% probability in some optimal two-player equilibrium.
- **Exact:** Integer, rational or exhaustive result without numerical approximation.
- **Numerical:** Floating-point LP or convex-optimization result with stated tolerances.
- **Sampled:** Monte Carlo or bounded-rational estimate with seed and confidence interval.

---

# Functional Requirements

## REQ-1 — Data-driven configuration representation

### User story

As a game designer, I want each Trials ruleset represented as data so that configurations can be compared without changing resolver code.

### Acceptance criteria

1. The system shall load configurations from committed JSON files.
2. The schema shall represent:
   - power formulas by spell type and size;
   - normal domains and domain classes;
   - player-count-specific active Trials;
   - declarative Trial eligibility;
   - entry floors;
   - allocation completion policies;
   - Wild generation and legality;
   - winner, lower-place and tie rewards;
   - Trial and final tiebreak chains;
   - invalid-allocation policies.
3. The schema shall represent both:
   - the historical v2.8 baseline, marked stale by design;
   - the hybrid rebuild candidate.
4. Unknown fields, unknown enum tokens and incomplete required fields shall produce explicit validation errors.
5. Configuration differences shall not require resolver code changes unless the mathematical model itself gains a new declared capability.

*Note: The standard scoring reference \(q(S)\) is external to the Trials configuration and is supplied per player state, keeping standard Recognition Points independent of the Trials power profile.*

---

## REQ-2 — Declarative Trial eligibility

### User story

As a model author, I want Trial eligibility expressed declaratively so that all source rules can be represented and tested.

### Acceptance criteria

1. Eligibility shall support:
   - exact source counts;
   - minimum and maximum source counts;
   - allowed domain IDs;
   - allowed domain classes;
   - required per-class minima and maxima;
   - named-only predicates;
   - source-count universes.
2. The source-count universe shall be explicit:
   - `all_normal`;
   - `allowed`;
   - `class:<id>`.
3. Wild shall never count as a source.
4. Complete Mastery shall be representable without a custom-code predicate.
5. When multiple eligibility constraints are present, all shall apply conjunctively.
6. A configuration with contradictory eligibility constraints shall fail validation.

---

## REQ-3 — Spellbook representation and power derivation

### User story

As a designer, I want final Spellbooks converted into power states reproducibly so that candidate formulas can be compared.

### Acceptance criteria

1. A Spellbook shall be represented as a list of typed spells containing:
   - spell ID;
   - spell type;
   - size;
   - energy domain where applicable.
2. Power derivation shall be deterministic.
3. Standard Recognition Points \(q(S)\) shall be computed by loading or adapting the current standard scoring reference `rulebook/Scoring System Reference.md` (v3.1).
4. An obsolete standard score table shall not be embedded in this spec's requirements or design, and \(q(S)\) shall derive only from the loaded or adapted current scoring reference.
5. Trials domain power \(F_C(S)\) shall be derived, per configuration \(C\), from a data-driven Trials power profile that is independent of \(q(S)\).
6. The current `rulebook/Ascension Trials.md` (v2.8) formula shall be encoded as the current candidate Trials power profile, including:
   - a piecewise size multiplier of 1.0 for 3–4 components, 1.5 with half-up rounding for 5–6 components, and 2.0 for 7 or more components;
   - Perfect Transmutation contributing formula power to its energy domain and to Transformation, and granting +1 Wild;
   - each 4-component Enchantment granting +1 Wild;
   - Enchantment domain power derived from Enchantment size.
7. The \(2n-3\) profile and every alternative, including the Enchantment 4/8/12 scale, shall be encoded only as explicitly experimental candidates, and shall not be labelled as current standard scoring or as the current Trials candidate.
8. For the Maya Spellbook (7-card Void Conjuration, 5-card Transfiguration, 4-card Enchantment, 6-card Aether Perfect Transmutation), the current-candidate (v2.8) Trials domain power \(F_C(S)\) shall derive: Void 14; Aether 9; Transformation 17; Enchantment 4; Wild 2 (obtained by applying the v2.8 rulebook formula directly).
9. For the same Maya Spellbook, the experimental \(2n-3\) profile shall derive: Void 11; Aether 9; Transformation 16; Enchantment 8; Wild 2, matching the source-backed A16 worked example.
10. Every derived state shall record provenance for both:
   - the scoring-reference version and content hash used for \(q(S)\);
   - the Trials-power-profile version used for \(F_C(S)\).
11. When the standard score table changes, \(q(S)\) shall change and \(F_C(S)\) shall remain unchanged.
12. When the Trials power profile changes, \(F_C(S)\) shall change and standard Recognition Points \(q(S)\) shall remain unchanged.

---

## REQ-4 — Allocation validation and residue

### User story

As a solver, I want every allocation validated against a conserved power ledger so that illegal profiles cannot silently affect results.

### Acceptance criteria

1. Allocations shall contain:
   - normal power by Trial and domain;
   - Wild power by Trial;
   - explicit normal and Wild residue.
2. All values shall be non-negative integers.
3. For every domain and Wild:
   \[
   allocated + residue = available
   \]
4. The system shall support:
   - optional allocation;
   - maximal allocation;
   - full allocation.
5. Maximal allocation shall mean no residual unit can be legally added to an active Trial.
6. An infeasible full-allocation state shall follow an explicit configured fallback:
   - reject;
   - treat as maximal with warning.
7. Over-allocation shall never be clipped silently.

---

## REQ-5 — Invalid-entry and invalid-domain behaviour

### User story

As a rules analyst, I want illegality scopes encoded explicitly so that the resolver reproduces each source ruleset exactly.

### Acceptance criteria

1. The configuration shall declare separate policies for:
   - a single illegal Trial entry;
   - over-allocation of a normal domain;
   - over-allocation of Wild;
   - an invalid whole allocation.
2. Supported actions shall include:
   - ignore the entry;
   - invalidate all entries using the offending domain;
   - reject the allocation;
   - apply a configured fallback.
3. Attached Wild shall be dropped when the corresponding normal entry is illegal.
4. Every invalidation shall appear in the audit trace with:
   - player;
   - Trial or domain;
   - reason;
   - affected entries.

---

## REQ-6 — Wild semantics

### User story

As a rules analyst, I want Wild handled independently from normal-source legality so that it cannot accidentally legalize an entry.

### Acceptance criteria

1. Wild shall not enter a Trial without a legal normal entry when the configuration forbids Wild-only entry.
2. Wild shall not satisfy minimum source counts.
3. Wild shall not break exact-one-source or mono-source requirements.
4. Wild may increase the primary Trial total after the normal entry is legal.
5. Wild inclusion in each tiebreak stage shall be configuration-driven.
6. The baseline/hybrid default shall exclude Wild from local tiebreak statistics.

---

## REQ-7 — Deterministic resolver

### User story

As a designer, I want a pure deterministic resolver with a complete trace so that every result can be reproduced and audited.

### Acceptance criteria

1. Resolution shall follow a fixed documented order:
   1. validate configuration and state closure;
   2. reconcile power ledgers;
   3. apply invalidation policies;
   4. evaluate eligibility and floors;
   5. drop invalid attached Wild;
   6. enforce completion policy;
   7. calculate normal, Wild and total Trial power;
   8. apply Trial tiebreaks;
   9. award Trial Recognition Points;
   10. aggregate player totals;
   11. apply final-result tiebreaks;
   12. calculate win and margin utilities;
   13. emit an audit hash and trace.
2. The same normalized input shall always produce the same output and SHA-256 audit hash.
3. Player relabelling shall commute with resolution.
4. Equivalent energy-domain relabelling shall commute with resolution.
5. Every awarded Recognition Point shall trace to one configured award.

---

## REQ-8 — Tiebreak vocabulary and semantics

### User story

As a configuration author, I want all tiebreak tokens enumerated and precisely defined so that historical and preferred branches are reproducible.

### Acceptance criteria

1. Trial tiebreak tokens shall include:
   - `total_power`;
   - `normal_power`;
   - `qualifying_source_count`;
   - `utilization_ratio`;
   - `focus_ratio`;
   - `efficiency_ratio`;
   - `commitment_ratio`;
   - `breadth`;
   - `shared`.
2. Final-result tiebreak tokens shall include:
   - `first_place_trial_wins`;
   - `total_normal_power`;
   - `spell_count`;
   - `largest_spell`;
   - `shared`.
3. Ratio comparisons shall use exact rational arithmetic.
4. Each ratio token shall have a documented numerator and denominator.
5. Historical ratio branches shall be labelled historical.
6. The preferred local branch shall not read power outside the contested Trial.

---

## REQ-9 — Configuration and fixture library

### User story

As a maintainer, I want committed configurations and fixtures so that the model's behaviour is regression-tested.

### Acceptance criteria

1. Commit:
   - `baseline_v28_stale.json`;
   - `hybrid_rebuild.json`;
   - `turtle_5_3.json`;
   - `cycle_5_4_3.json`;
   - `tie_fest_5_5.json`;
   - `equal_4_4_4.json`.
2. Commit VS1 fixture data for:
   - A1, A2, A7, A8, A9, A10, A11, A12, A16 and A17.
3. Historical baseline metadata shall state:
   - historical candidate;
   - stale by design;
   - no executable 7-player support;
   - no implication of current canon.
4. Fixture expected values shall come from the approved specification or cited source, not be reverse-engineered from current implementation output.

---

## REQ-10 — Small-state allocation enumeration

### User story

As a mathematical analyst, I want every legal allocation enumerated for small states so that structural claims can be verified exhaustively.

### Acceptance criteria

1. Enumeration shall produce every legal allocation exactly once before strategic collapse.
2. Enumeration ordering shall be deterministic.
3. Maximality shall be evaluated exactly.
4. The system shall refuse exact matrix construction beyond configured size or memory ceilings.
5. It shall never silently substitute sampling.
6. Required exact counts:
   - A3: 15 legal allocations;
   - A4: 84 legal allocations.

---

## REQ-11 — Strategic equivalence and dominance

### User story

As a game theorist, I want duplicate strategies collapsed and true strict dominance calculated correctly.

### Acceptance criteria

1. Strategic-equivalence collapse shall compare complete payoff and Trial-award behaviour.
2. The model shall retain mappings from canonical classes to original allocations.
3. True strict dominance shall require:
   \[
   u(a',b)>u(a,b)\quad\text{for every surviving }b
   \]
4. Weak dominance shall be reported separately and shall not define \(\mathcal R\).
5. Strictly dominated strategies shall be removed simultaneously each round.
6. The fixed point shall not depend on collection or iteration ordering.
7. A dedicated test shall distinguish weak from strict dominance.

---

## REQ-12 — Two-player payoff matrices and equilibrium

### User story

As a designer, I want small two-player Trials games solved as zero-sum games so that hidden allocation quality can be measured.

### Acceptance criteria

1. Matrices shall store:
   - win utility;
   - RP-margin utility;
   - final-tie flag;
   - Trial-award vector;
   - tiebreak-stage data.
2. Payoff construction shall be exhaustive for in-limit states.
3. Win and margin games shall be solved separately.
4. Floating-point LP output shall be labelled `numerical_lp`, not exact.
5. The solver shall record:
   - method;
   - tolerances;
   - primal and dual residuals;
   - convergence status.
6. A4 shall have win-utility value 0 within tolerance and a mixed equilibrium.
7. Failure or non-convergence shall be explicit.

---

## REQ-13 — Canonical equilibrium and equilibrium-relevant set

### User story

As an analyst, I want deterministic equilibrium reporting so that tie and support metrics are reproducible.

### Acceptance criteria

1. The canonical equilibrium shall be the maximum-Shannon-entropy optimal strategy within the optimal-strategy polytope.
2. The method and numerical tolerances shall be fixed and recorded.
3. Report:
   - raw and normalized entropy;
   - support at \(10^{-9}\), \(10^{-3}\) and \(10^{-2}\);
   - solver residuals.
4. For each strategy, maximize its possible mass over the equilibrium polytope.
5. Include a strategy in \(\mathcal E^{0.01}\) when maximum mass is at least \(0.01-10^{-9}\).
6. A hand-built multiple-equilibrium fixture shall verify this calculation.

---

## REQ-14 — Reports and evidence labelling

### User story

As a reviewer, I want every output labelled by evidence class and assumptions so that no numerical estimate is mistaken for proof.

### Acceptance criteria

1. The CLI shall generate JSON and Markdown reports.
2. Every report shall include:
   - configuration ID and version;
   - player count;
   - state IDs;
   - scoring-reference version and content hash;
   - Trials-power-profile version;
   - provenance;
   - method;
   - solver and tolerances;
   - seed where applicable;
   - code revision where available.
3. Evidence classes shall include:
   - theorem;
   - exact exhaustive;
   - exact-given-profile;
   - numerical LP;
   - numerical convex;
   - sampled;
   - design judgement.
4. Reports shall include a hard-gate table with:
   - pass;
   - fail;
   - not evaluated.
5. Normative design thresholds without approved oracles shall be reported but not treated as mathematical test failures.

---

## REQ-15 — Repository integration and reproducibility

### User story

As a repository maintainer, I want the subsystem integrated cleanly so that it can be rerun and audited later.

### Acceptance criteria

1. Use `ascension-trials/ascension_trials_model/`.
2. Use a local Python package with:
   - `pyproject.toml`;
   - `src/ascension_trials/`;
   - `pytest`.
3. Pin NumPy and SciPy versions for VS2.
4. Keep generated outputs ignored.
5. Update `meta/manifest.yml` in the same change.
6. Move model specs to the declared docs folder and reviews to `_review/`.
7. Update cross-references and clear the undeclared root-folder checker warning.
8. Record exact test and CLI commands in the final implementation report.

---

# Non-Functional Requirements

## NFR-1 — Determinism

All ordering, serialization, hashing and reports shall be independent of Python hash or dictionary iteration order.

## NFR-2 — Purity

The core resolver shall have no dependency on UI, database, network access or mutable global state.

## NFR-3 — Numerical transparency

All floating-point claims shall expose method, tolerance and residuals.

## NFR-4 — Failure visibility

The system shall fail explicitly on unsupported or infeasible states rather than silently approximating or repairing them.

## NFR-5 — Extensibility

Later VS3–VS6 components shall be able to consume the same configuration, state, allocation and resolver interfaces.

---

# Out of Scope for This Spec

- scalable best-response oracle;
- double-oracle equilibrium;
- strength-path sweeps;
- configuration optimization;
- multiplayer population simulation;
- full-game Spellbook construction;
- automatic declaration of a best Trials configuration;
- UI development.

---

# Approval Gate

Implementation may resume only after:

1. this requirements document is approved;
2. `design.md` is consistent with every requirement;
3. `tasks.md` maps every implementation task to requirement IDs;
4. existing code is reconciled against the approved design rather than assumed correct.
