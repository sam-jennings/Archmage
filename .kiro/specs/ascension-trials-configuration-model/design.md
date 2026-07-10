---
title: Ascension Trials Configuration Model — Design
type: spec-design
spec: ascension-trials-configuration-model
scope: VS1 and VS2
updated: 2026-07-10
status: proposed
requirements_source: requirements.md
---

# Design — Ascension Trials Configuration Model

## Project

**Name:** Ascension Trials Configuration Model  
**Spec ID:** `ascension-trials-configuration-model`  
**Scope:** VS1 and VS2  
**Requirements source:** `requirements.md`

---

## 1. Overview

The subsystem is a deterministic analysis pipeline with two layers:

1. **VS1 — Rules kernel**
   - configuration loading;
   - Spellbook power derivation;
   - legality;
   - deterministic resolution;
   - audit trace;
   - source-backed fixtures and tests.

2. **VS2 — Small-state exact laboratory**
   - allocation enumeration;
   - strategic-equivalence collapse;
   - payoff matrices;
   - strict-dominance analysis;
   - numerical zero-sum equilibrium;
   - canonical support and reports.

The architecture must keep configuration data, rules resolution and mathematical analysis separate. Historical or experimental rules belong in configuration files. The resolver must not contain branches such as “if baseline” or “if hybrid” except where a general schema token is being interpreted.

---

## 2. Architecture

```text
Spellbook JSON
      │
      ▼
spellbook.py ──► power.py ──► PlayerState
                                │
Configuration JSON ─► config_loader.py
                                │
Allocation JSON ────────────────┤
                                ▼
                       legality.py
                                │
                                ▼
                        resolver.py
                                │
                  ┌─────────────┴─────────────┐
                  ▼                           ▼
            ResolutionResult           canonical.py
                                              │
                          ┌───────────────────┴───────────────────┐
                          ▼                                       ▼
                    enumerate.py                            matrix.py
                          │                                       │
                          ▼                                       ▼
                    dominance.py                           equilibrium.py
                          └───────────────────┬───────────────────┘
                                              ▼
                                          metrics.py
                                              │
                                              ▼
                                          reports.py
```

### Layering rules

- `schema.py` defines immutable records and enums only.
- `config_loader.py` parses and validates data; it does not resolve games.
- `power.py` derives Trials domain power F_C(S) into player state; it does not inspect allocations and does not read the standard scoring reference.
- `scoring.py` computes standard Recognition Points q(S) by loading or adapting the standard scoring reference; it does not read Trials power profiles.
- `eligibility.py` answers whether a normal source set qualifies.
- `legality.py` validates ledgers, entries, floors and completion.
- `resolver.py` resolves a fixed profile only.
- `enumerate.py` produces allocations only.
- `matrix.py` calls the resolver to build payoffs.
- `dominance.py` and `equilibrium.py` operate on matrices, not raw rules.
- `reports.py` formats results; it does not calculate them.

---

## 3. Repository Layout

```text
simulation/ascension_trials_model/
├── README.md
├── pyproject.toml
├── requirements.lock
├── docs/
│   ├── requirements.md
│   ├── design.md
│   ├── tasks.md
│   ├── ASCENSION_TRIALS_CONFIGURATION_MODEL_V2_1.md
│   └── ASCENSION_TRIALS_KIRO_IMPLEMENTATION_SPEC_V1_1.md
├── configs/
│   ├── baseline_v28_stale.json
│   ├── hybrid_rebuild.json
│   └── toy/
│       ├── turtle_5_3.json
│       ├── cycle_5_4_3.json
│       ├── tie_fest_5_5.json
│       └── equal_4_4_4.json
├── fixtures/
│   ├── adversarial/
│   └── worked_examples/
├── src/
│   └── ascension_trials/
│       ├── schema.py
│       ├── config_loader.py
│       ├── spellbook.py
│       ├── power.py
│       ├── scoring.py
│       ├── eligibility.py
│       ├── legality.py
│       ├── resolver.py
│       ├── canonical.py
│       ├── enumerate.py
│       ├── dominance.py
│       ├── matrix.py
│       ├── equilibrium.py
│       ├── metrics.py
│       ├── reports.py
│       └── cli.py
├── tests/
└── outputs/
```

---

## 4. Core Types

All core records should be immutable where practical.

### 4.1 Configuration

```python
@dataclass(frozen=True)
class TrialsConfiguration:
    id: str
    version: str
    supported_player_counts: tuple[int, ...]
    historical_candidate: bool
    stale_by_design: bool
    power_profile: PowerProfile
    domains: tuple[DomainDefinition, ...]
    wild: WildRules
    trials: tuple[TrialDefinition, ...]
    allocation_rules: AllocationRules
    invalidation_rules: InvalidationRules
    final_result_rules: FinalResultRules
```

### 4.2 Domain

```python
@dataclass(frozen=True)
class DomainDefinition:
    id: str
    domain_class: str
    symmetry_group: str | None
```

### 4.3 Eligibility predicate

Avoid a generic `custom` mode.

```python
@dataclass(frozen=True)
class EligibilityPredicate:
    allowed_domain_ids: frozenset[str]
    allowed_domain_classes: frozenset[str]
    source_count_universe: SourceCountUniverse
    min_sources: int | None
    max_sources: int | None
    required_class_counts: Mapping[str, CountRange]
    required_domain_counts: Mapping[str, CountRange]
```

All declared constraints are conjunctive.

### 4.4 Trial definition

```python
@dataclass(frozen=True)
class TrialDefinition:
    id: str
    active_player_counts: frozenset[int]
    eligibility: EligibilityPredicate
    entry_floor: EntryFloor
    rewards_by_player_count: Mapping[int, RewardSchedule]
    tie_award: TieAwardRule
    tiebreak_chain: tuple[TrialTiebreakToken, ...]
```

### 4.5 Spellbook

```python
@dataclass(frozen=True)
class Spell:
    id: str
    spell_type: SpellType
    size: int
    energy_domain: str | None

@dataclass(frozen=True)
class Spellbook:
    id: str
    spells: tuple[Spell, ...]
```

### 4.6 Player state

```python
@dataclass(frozen=True)
class IndependentScore:
    """Standard Recognition Points q(S) — independent of Trials power F_C(S)."""
    value: int
    scoring_version: str   # standard scoring-reference version, e.g. "v3.1"
    content_hash: str      # SHA-256 of the loaded/adapted scoring reference

@dataclass(frozen=True)
class PlayerState:
    player_id: str
    normal_power: Mapping[str, int]        # F_C(S): Trials domain power under configuration C
    wild_power: int
    tiebreak_stats: Mapping[str, int]
    independent_score: IndependentScore    # q(S): standard Recognition Points, with provenance
    power_profile_version: str             # Trials-power-profile version used for F_C(S)
    provenance: Provenance
```

`independent_score` carries standard Recognition Points q(S) together with the scoring-reference
version and content hash it was derived from; `power_profile_version` records the Trials power
profile used to derive the domain powers in `normal_power` (F_C(S)). The two are captured
separately so their provenance can be audited independently (REQ-3.9).

### 4.7 Allocation

```python
@dataclass(frozen=True)
class Allocation:
    player_id: str
    normal_by_trial: Mapping[str, Mapping[str, int]]
    wild_by_trial: Mapping[str, int]
    normal_residue: Mapping[str, int]
    wild_residue: int
```

### 4.8 Resolution result

The result must contain both summarized values and a stepwise trace.

```python
@dataclass(frozen=True)
class ResolutionResult:
    valid: bool
    validation_messages: tuple[ValidationMessage, ...]
    trial_results: tuple[TrialResult, ...]
    player_results: Mapping[str, PlayerResult]
    win_utility: Mapping[str, int]
    margin_utility: Mapping[str, int]
    conservation_trace: ConservationTrace
    invalidation_trace: tuple[InvalidationEvent, ...]
    audit_hash: str
```

---

## 5. Configuration Schema

### 5.0 Separation of standard scoring q(S) and Trials power F_C(S)

Standard Recognition Points q(S) and Trials domain power F_C(S) are two independent quantities,
computed by independent code paths from independent data. Changing one cannot change the other,
which is exactly REQ-3.10 (a standard-table change moves q(S) and leaves F_C(S) fixed) and
REQ-3.11 (a Trials-power-profile change moves F_C(S) and leaves q(S) fixed).

- **q(S) — standard Recognition Points.** Produced by a dedicated standard-scoring module
  (`scoring.py`) that loads or adapts the current standard scoring reference
  `rulebook/Scoring System Reference.md` (v3.1). The design does **not** embed the score table;
  the module records the scoring-reference version and a content hash so the exact table used is
  auditable and cannot silently drift into an obsolete copy. q(S) is external to the Trials
  configuration and is supplied per player state.
- **F_C(S) — Trials domain power.** Produced by `power.py` from the Trials power profile carried
  by configuration C. It records the Trials-power-profile version.

Trials power profiles are modelled as **named, versioned components referenced by configurations**,
never hard-coded in the resolver. This lets the current-candidate profile and any experimental
profiles coexist and be compared without code changes.

**Reconciliation note.** The historical `baseline_v28_stale.json` configuration is *stale by design*
only with respect to its reward economy and 7-player structure — not its power-derivation math. The
v2.8 power *profile* (`trials_power_v28`, §5.1.2) is the **current-candidate** power profile even
though the full stale baseline configuration remains historical. Staleness of a configuration
therefore does not imply staleness of the power profile it happens to share.

### 5.1 Power profiles

Standard Recognition Points q(S) and Trials domain power F_C(S) are described separately here,
because they are independent quantities (see §5.0). No Trials power profile is ever the standard
scoring table: q(S) comes only from the scoring reference (§5.1.1), never from a `power_profile`.

#### 5.1.1 Standard scoring reference — q(S)

q(S) is produced by loading or adapting the current standard scoring reference
`rulebook/Scoring System Reference.md` (v3.1). The numeric score table is **not** embedded in this
design or in any configuration; the standard-scoring module reads it and carries only its
provenance:

```json
{
  "scoring_reference": {
    "source": "rulebook/Scoring System Reference.md",
    "version": "v3.1",
    "content_hash": "sha256:<hash of the loaded scoring reference>"
  }
}
```

Carrying only the version and content hash keeps the table in the rulebook so it cannot drift into
an obsolete copy (REQ-3.3, REQ-3.4).

#### 5.1.2 Current-candidate Trials power profile — F_C(S)

F_C(S) is derived from a data-driven, named, versioned Trials power profile referenced by a
configuration. The current candidate encodes the `rulebook/Ascension Trials.md` v2.8 formula. Here
`multiplier` is the piecewise `size_multiplier` factor applied to a spell's component count with the
stated rounding, so `power = round(size * multiplier)`:

```json
{
  "power_profile": {
    "id": "trials_power_v28",
    "version": "2.8",
    "experimental": false,
    "size_multiplier": [
      {"min": 3, "max": 4, "factor": 1.0},
      {"min": 5, "max": 6, "factor": 1.5, "rounding": "half_up"},
      {"min": 7, "max": null, "factor": 2.0}
    ],
    "spell_rules": {
      "conjuration": {"power": "size * multiplier", "domain": "energy"},
      "transfiguration": {"power": "size * multiplier", "domain": "transformation"},
      "perfect_transmutation": {
        "power": "size * multiplier",
        "contributes_to_energy": true,
        "contributes_to_transformation": true,
        "wild_award": 1
      },
      "enchantment": {
        "power": "size * multiplier",
        "domain": "enchantment",
        "wild_by_size": {"4": 1}
      }
    }
  }
}
```

This encodes: the piecewise size multiplier (1.0 for 3–4 components, 1.5 half-up for 5–6, 2.0 for
7+); energy domains (Void / Flux / Radiance / Aether) from Conjuration lengths and Transformation
from Transfiguration lengths; Enchantment domain power derived from Enchantment size; Perfect
Transmutation contributing formula power to both its energy domain and Transformation and granting
+1 Wild; and each 4-component Enchantment granting +1 Wild (REQ-3.6). Wild is added only to
already-attempted Trials, never counts as a source, never violates a mono requirement, and is
ignored in tiebreaks. The parser converts these declarations into validated internal operators, not
arbitrary code.

**Worked example (Maya Spellbook — current candidate).** For the Maya Spellbook (7-card Void
Conjuration, 5-card Transfiguration, 4-card Enchantment, 6-card Aether Perfect Transmutation), this
profile derives **Void 14, Aether 9, Transformation 17, Enchantment 4, Wild 2** by direct v2.8
application: Void 7→14 via ×2.0; Aether 6→9 via ×1.5 half-up; Transformation = Transfiguration 5→8
+ Perfect Transmutation 6→9 = 17; Enchantment 4 = size; Wild = Perfect Transmutation +1 and
4-component Enchantment +1. These are the current-candidate oracles for this Spellbook and differ
from the experimental oracles in §5.1.3.

#### 5.1.3 Experimental candidate — not canon, not standard scoring

The `2n-3` family is an **experimental candidate only**. It is marked `experimental: true` so it
can never be mistaken for canon or for the standard scoring table q(S). Its Enchantment scale
`{3:4, 4:8, 5:12}` is likewise experimental and is not the standard Enchantment score:

```json
{
  "power_profile": {
    "id": "hybrid_2n_minus_3",
    "version": "0.1-experimental",
    "experimental": true,
    "spell_rules": {
      "conjuration": {"formula": "2n-3"},
      "transfiguration": {"formula": "2n-3"},
      "perfect_transmutation": {
        "formula": "2n-3",
        "contributes_to_energy": true,
        "contributes_to_transformation": true,
        "wild_award": 1
      },
      "enchantment": {
        "table": {"3": 4, "4": 8, "5": 12},
        "wild_table": {"4": 1, "5": 1}
      }
    }
  }
}
```

The parser converts formulas into validated internal operators rather than evaluating arbitrary
code (REQ-3.7).

**Worked example (Maya Spellbook — experimental).** For the same Maya Spellbook (7-card Void
Conjuration, 5-card Transfiguration, 4-card Enchantment, 6-card Aether Perfect Transmutation), this
experimental profile derives **Void 11, Aether 9, Transformation 16, Enchantment 8, Wild 2** (Void
2·7−3 = 11; Aether 2·6−3 = 9; Transformation = Transfiguration 2·5−3 = 7 + Perfect Transmutation
2·6−3 = 9 = 16; Enchantment 4 → table 8; Wild = Perfect Transmutation +1 and 4-component
Enchantment +1). These values match the source-backed A16 worked example — so **A16 exercises the
EXPERIMENTAL profile, not the current candidate**; **A17** is the legacy-vs-hybrid comparison on the
same Spellbook.

### 5.2 Invalidation rules

```json
{
  "invalidation": {
    "illegal_trial_entry": "ignore_entry",
    "normal_domain_overallocation": "invalidate_domain_entries",
    "wild_overallocation": "reject_allocation",
    "invalid_allocation": "reject"
  }
}
```

### 5.3 Tiebreak tokens

#### Trial

- `total_power`
- `normal_power`
- `qualifying_source_count`
- `utilization_ratio`
- `focus_ratio`
- `efficiency_ratio`
- `commitment_ratio`
- `breadth`
- `shared`

#### Final

- `first_place_trial_wins`
- `total_normal_power`
- `spell_count`
- `largest_spell`
- `shared`

Each token must map to one pure comparator.

---

## 6. Historical Ratio Definitions

Historical definitions must be deterministic and isolated behind comparator functions.

### 6.1 Utilization ratio

For the contested Trial:

\[
\frac{\text{normal power allocated to this Trial from qualifying used domains}}
{\text{total available capacity of those same qualifying used domains}}
\]

### 6.2 Focus ratio

\[
\frac{\text{normal power allocated to this Trial}}
{\text{player's total normal power allocated across all Trials}}
\]

### 6.3 Efficiency ratio

\[
\frac{\text{normal power allocated to this Trial}}
{\text{total capacity of normal domains represented on this Trial}}
\]

### 6.4 Commitment ratio

\[
\frac{\text{normal power allocated to this Trial}}
{\text{player's total normal Spellbook power}}
\]

### 6.5 Breadth

Count distinct qualifying normal domains represented on the Trial.

Ratios must use `fractions.Fraction`.

---

## 7. Resolver Pipeline

### 7.1 Normalize

Sort players, domains, Trials and map keys.

### 7.2 Validate state closure

Reject a configuration that asks for unavailable tiebreak statistics.

### 7.3 Reconcile ledgers

For each player and source:

\[
allocated + residue = available
\]

Record exact discrepancies.

### 7.4 Apply over-allocation policies

- Identify offending normal domains.
- Invalidate or reject according to configuration.
- Record affected entries.
- Handle Wild separately.

### 7.5 Evaluate entries

For each player and Trial:

1. collect positive normal sources;
2. apply allowed ID/class filters;
3. apply conjunctive count predicates;
4. apply entry floor;
5. if illegal, apply entry policy;
6. discard attached Wild if no legal normal entry remains.

### 7.6 Enforce completion

- OPTIONAL: no further check.
- FULL: residue must be zero or fallback applies.
- MAXIMAL: for each residue unit, test whether adding it to any Trial creates a legal allocation.

A maximality failure must state a legal destination proving non-maximality.

### 7.7 Resolve Trials

Calculate normal, Wild and total values. Apply the configured comparator chain until separated or shared.

### 7.8 Award Recognition Points

Support:

- winner reward;
- lower-place reward;
- shared-full ties;
- divided ties;
- no-award ties;
- suppression of lower-place rewards where configured.

### 7.9 Resolve final result

Aggregate RP and apply final comparator chain.

### 7.10 Utilities

At two players:

\[
u^W\in\{-1,0,1\}
\qquad
u^M=r_A-r_B
\]

### 7.11 Audit hash

Hash canonical JSON containing:

- configuration version;
- normalized states;
- normalized allocations;
- validation and invalidation outcomes;
- Trial results;
- final results.

---

## 8. Enumeration

### 8.1 Generation strategy

For each normal domain:

1. generate weak compositions of available power over active Trials plus residue;
2. discard Trial placements incompatible with the domain's allowed classes/IDs where statically knowable;
3. combine domain compositions;
4. generate Wild compositions;
5. validate the complete allocation;
6. retain allocations satisfying the configured completion policy.

This is exhaustive and deterministic.

### 8.2 Limits

Before materializing a payoff matrix:

- estimate number of row and column allocations;
- estimate memory for all payoff and trace fields;
- reject above the configured limit.

No hidden sampling fallback.

---

## 9. Strategic Equivalence

### 9.1 Static normalization

Normalize allocations structurally before resolution.

### 9.2 Behavioural collapse

After a payoff matrix exists, allocations are equivalent only when their complete behaviour vectors match:

- win payoffs;
- margin payoffs;
- Trial-award vectors;
- final tie flags.

Use a stable digest of these vectors as the class key.

Retain representative and member IDs.

---

## 10. Dominance

### 10.1 True strict dominance

For rows:

\[
r'\succ r
\iff
M^W_{r'c}>M^W_{rc}\quad\forall c
\]

For columns, reverse the row player's ordering.

### 10.2 Iteration

- compare only surviving strategies;
- determine all removals;
- remove simultaneously;
- repeat;
- record round and dominator.

### 10.3 Weak diagnostic

Weak dominance uses non-strict comparison everywhere with at least one strict improvement. It must never feed the reasonable set.

---

## 11. Matrix Representation

```python
@dataclass(frozen=True)
class PayoffMatrix:
    row_strategy_ids: tuple[str, ...]
    column_strategy_ids: tuple[str, ...]
    win: np.ndarray
    margin: np.ndarray
    final_tie: np.ndarray
    trial_award_signatures: tuple[tuple[object, ...], ...]
```

Integer matrices remain exact. Trial signatures may be stored in a parallel compact structure.

---

## 12. Numerical Equilibrium

### 12.1 Zero-sum LP

Use SciPy HiGHS.

For the row player, solve the standard maximin LP. Solve or derive the dual for the column player.

Return:

- value;
- strategy;
- feasibility residual;
- optimality residual;
- status;
- tolerance.

Label as `numerical_lp`.

### 12.2 Canonical maximum-entropy equilibrium

1. Determine the optimal-strategy polytope from the LP value and tolerance.
2. Maximize:
   \[
   -\sum_i p_i\log p_i
   \]
3. Use deterministic initial conditions and solver options.
4. Validate returned strategy against equilibrium constraints.

Label as `numerical_convex`.

### 12.3 Equilibrium-relevant set

For each strategy \(i\), solve an LP maximizing \(p_i\) subject to optimality constraints. Include it when the optimum is at least \(0.01-10^{-9}\).

---

## 13. Reports

### 13.1 JSON

Machine-readable, schema-versioned and deterministic. Every report's `metadata` block records
(matching REQ-14.2):

- configuration ID and version;
- player count and state IDs;
- scoring-reference version and content hash (provenance of q(S));
- Trials-power-profile version (provenance of F_C(S));
- provenance, method, solver and tolerances;
- seed where applicable;
- code revision where available.

Recording q(S) and F_C(S) provenance in separate fields keeps the two independently auditable.

### 13.2 Markdown

Sections:

1. metadata;
2. validation;
3. exact counts;
4. equilibrium;
5. dominance;
6. counterability;
7. ties;
8. diagnostics;
9. evidence class;
10. assumptions and unresolved gates.

### 13.3 CLI

Proposed commands:

```bash
python -m ascension_trials validate-config configs/hybrid_rebuild.json
python -m ascension_trials resolve --config ... --fixture ...
python -m ascension_trials run-fixture A16
python -m ascension_trials analyse-small --config ... --state-a ... --state-b ...
python -m ascension_trials report-fixtures --format json,md
```

---

## 14. Error Handling

Use explicit typed exceptions or validation results:

- `ConfigurationError`
- `StateClosureError`
- `PowerDerivationError`
- `AllocationValidationError`
- `InfeasibleCompletionError`
- `EnumerationLimitError`
- `MatrixLimitError`
- `NumericalSolveError`

Invalid user/configuration data must not produce partial authoritative results.

---

## 15. Testing Strategy

### 15.1 Unit tests

- schema tokens;
- conjunctive eligibility;
- power formulas;
- Wild generation;
- ledger reconciliation;
- each tiebreak comparator;
- each invalidation policy;
- completion policies.

### 15.2 Fixture tests

A1, A2, A7, A8, A9, A10, A11, A12, A16, A17.

### 15.3 Exact laboratory tests

A3, A4, A5, A6 and strict-vs-weak dominance.

### 15.4 Numerical tests

- A4 value 0 within tolerance;
- mixed canonical equilibrium;
- multiple-equilibrium support-mass fixture.

### 15.5 Determinism tests

Run normalized fixtures repeatedly and across intentionally shuffled input order.

---

## 16. Existing-Code Reconciliation

Kiro has already created several modules. They are not accepted merely because they import.

Before new feature implementation:

1. map every existing class/function to this design;
2. identify mismatches;
3. preserve compatible code;
4. refactor incompatible code;
5. add tests before marking any task complete.

No task may be marked complete based solely on import success or hand verification.

---

## 17. Key Design Decisions

- Data-driven rules over configuration-specific code.
- Standard scoring q(S) and Trials power F_C(S) are independent, separately versioned, and separately provenanced; experimental power profiles are explicitly labelled and can never be mistaken for canon or for standard scoring.
- Pure resolver over stateful simulation.
- True strict dominance, not the former weak formula.
- Exact integer resolution; numerical equilibrium with transparent tolerance.
- Maximum-entropy canonical equilibrium for reproducibility.
- No hidden Monte Carlo fallback.
- Existing implementation is provisional until acceptance tests pass.
