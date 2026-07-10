---
title: Ascension Trials Model — Kiro Implementation Specification v1.1
type: implementation-specification
date: 2026-07-10
status: ready-for-VS1
implements:
  - "ASCENSION_TRIALS_CONFIGURATION_MODEL_V2_1.md"
sources:
  - "_review/ASCENSION_TRIALS_04_CONFIG_MODEL_ADVERSARIAL_REVIEW_2026-07-10.md"
  - "_review/ASCENSION_TRIALS_MODEL_READINESS_REVIEW_2026-07-10.md"
scope:
  first_milestone:
    - VS1
    - VS2
  later:
    - VS3
    - VS4
    - VS5
    - VS6
---

# Ascension Trials Model — Kiro Implementation Specification v1.1

## 1. Mission

Build a reproducible analysis system that can:

1. represent multiple Ascension Trials rulesets as data;
2. resolve any fixed state and allocation profile deterministically;
3. exhaustively solve small two-player states;
4. verify the adversarial mathematical fixtures;
5. compare configurations without embedding a preferred ruleset in code;
6. scale later through exact best-response and double-oracle methods.

The first implementation milestone is **VS1 + VS2 only**. The readiness review has been resolved; implementation begins with VS1.

Do not optimize reward tables or select a final Trials configuration during the first milestone.

---

## 2. Authority and Non-Negotiable Definitions

`ASCENSION_TRIALS_CONFIGURATION_MODEL_V2_1.md` is the normative mathematical source.

Kiro must not change for implementation convenience:

- true strict dominance uses `>` against every surviving opponent profile;
- weak dominance is diagnostic only;
- two-player win and RP-margin games are zero-sum;
- maximal legal allocations include explicit residue;
- uncertainty metrics require a declared strategy distribution;
- multiplayer Nash-equilibrium claims are prohibited;
- exact and sampled results must be labelled separately;
- no weighted global configuration score is permitted.

If an ambiguity prevents implementation, report it before coding rather than inventing a rule.

---

## 3. Technology and Repository Decisions

The readiness-review branches are settled as follows.

### 3.1 Location

Use:

```text
simulation/ascension_trials_model/
```

The model derives and consumes Spellbook terminal states and belongs with simulation rather than general-purpose tooling.

Permanent document locations:

- live rules remain in `rulebook/Ascension Trials.md`;
- mathematical and implementation specifications live in `simulation/ascension_trials_model/docs/`;
- adversarial and readiness reviews live in `_review/`;
- do not retain a root `Ascension Trials/` directory.

Update `meta/manifest.yml` in the same commit that creates or moves these paths. Update all cross-references. Do not alter the content of the live rulebook merely to move model documents.

### 3.2 Packaging and tests

Deliberately adopt a local Python package despite the existing flat simulation scripts:

- Python 3.12+;
- `pyproject.toml`;
- `src/ascension_trials/` layout;
- `pytest`;
- parameterized and exhaustive property-style tests;
- no Hypothesis dependency in VS1 or VS2.

This is a contained analysis subsystem, not a precedent requiring unrelated simulation scripts to be repackaged.

### 3.3 Numerical libraries

Use:

- NumPy;
- SciPy `linprog(method="highs")` for zero-sum LPs;
- SciPy constrained optimization for maximum-entropy equilibrium selection;
- pytest for tests.

Pin exact installed versions in project dependency metadata and a committed lock or fully pinned requirements file. Kiro may choose the newest repository-compatible versions available in the implementation environment; unpinned dependencies are not acceptable.

### 3.4 Numerical labels

- Resolver, enumeration and payoff entries are exact integers.
- Floating-point LP results are labelled `numerical_lp`.
- Maximum-entropy results are labelled `numerical_convex`.
- Never label a floating-point equilibrium “exact.”
- Theoretical fixture values such as zero are asserted within the configured tolerance.

Initial tolerances:

- LP feasibility/optimality: \(10^{-9}\);
- entropy optimization feasibility: \(10^{-8}\);
- \(\mathcal E^{0.01}\) boundary comparison: include when maximum mass is at least \(0.01-10^{-9}\), and print the tolerance.

### 3.5 Determinism

Sort all:

- domain IDs;
- Trial IDs;
- players;
- allocation keys;
- canonical classes;
- matrix rows and columns;
- support reports.

Do not rely on hash, set or dictionary iteration order.

## 4. Repository Layout

```text
simulation/ascension_trials_model/
├── README.md
├── pyproject.toml
├── requirements.lock              # or equivalent exact lock
├── docs/
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
├── src/
│   └── ascension_trials/
│       ├── schema.py
│       ├── config_loader.py
│       ├── spellbook.py
│       ├── power.py
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
│       └── provenance.py
├── fixtures/
│   ├── adversarial/
│   └── worked_examples/
├── tests/
│   ├── test_schema.py
│   ├── test_spellbook_power.py
│   ├── test_eligibility.py
│   ├── test_resolver.py
│   ├── test_legality.py
│   ├── test_adversarial_fixtures.py
│   ├── test_enumeration.py
│   ├── test_dominance.py
│   └── test_equilibrium.py
└── outputs/                        # generated, ignored
```

Extend `.gitignore` for the nested output directory.

`baseline_v28_stale.json` must be labelled:

```yaml
historical_candidate: true
stale_by_design: true
supported_player_counts: [2, 3, 4, 5, 6]
notes:
  - "Preserves no-Echo historical candidate semantics."
  - "7-player source data is excluded from executable support."
```

It is never described as current canon.

## 5. Core Data Model

The examples below are normative in meaning. JSON may be used instead of YAML.

### 5.1 Spellbook

```yaml
spellbook_id: string
spells:
  - spell_id: string
    type: conjuration | transfiguration | perfect_transmutation | enchantment
    size: integer
    energy_domain: string | null
```

Validation:

- size is a positive integer within the configured spell-type range;
- Conjuration and Perfect Transmutation require `energy_domain`;
- Transfiguration and Enchantment must not contribute through an undeclared energy field;
- spell IDs are unique within a Spellbook.

### 5.2 Configuration

```yaml
id: string
version: string
historical_candidate: boolean
stale_by_design: boolean
supported_player_counts: [2, 3, 4, 5, 6]

rounding:
  mode: half_up

power_formula:
  profile: legacy_v28 | hybrid_2n_minus_3 | declarative
  standard_spell_power:
    type: piecewise | linear
    piecewise: []
    expression: "2*n-3"
  enchantment_power:
    type: spell_size | table
    table: {"3": 4, "4": 8, "5": 12}
  contributions:
    conjuration:
      energy: standard_spell_power
    transfiguration:
      transformation: standard_spell_power
    perfect_transmutation:
      energy: standard_spell_power
      transformation: standard_spell_power
      wild: 1
    enchantment:
      enchantment: enchantment_power
  enchantment_wild_sizes: [4, 5]

domains:
  - id: radiance
    class: energy
    symmetry_group: normal_energy
  - id: transformation
    class: transformation
  - id: enchantment
    class: enchantment

wild:
  enabled: true
  can_enter_alone: false
  requires_legal_normal_entry: true
  counts_as_source: false
  can_satisfy_source_minimum: false
  can_break_source_maximum: false
  included_in_primary_total: true
  included_in_tiebreaks: false

trials:
  - id: energy_purity
    active_player_counts: [2, 3, 4, 5, 6]
    eligibility:
      allowed_domain_ids: []
      allowed_domain_classes: [energy]
      forbidden_domain_ids: []
      forbidden_domain_classes: []
      source_count:
        universe: "class:energy"
        minimum: 1
        maximum: 1
      required_class_counts: {}
      required_domain_counts: {}
    entry_floor:
      value: 0
      scope: normal
    rewards:
      by_player_count:
        "2": {first: 6, second: 0}
    tie_award:
      type: shared_full | divided | none
    trial_tiebreaks:
      - total_power
      - normal_power
      - qualifying_source_count
      - shared

allocation:
  completion: optional | maximal | full
  residue_allowed: true
  infeasible_full_fallback: reject | residue
  invalidation:
    illegal_trial_entry: ignore_entry
    overallocated_domain: invalidate_entries_using_domain
    overallocated_wild: invalidate_entries_using_wild
    malformed_allocation: reject_profile

final_result:
  final_tiebreaks:
    - first_place_trial_count
    - total_normal_power
    - spell_count
    - largest_spell
    - shared
```

### 5.3 Eligibility semantics

Eligibility fields are conjunctive. There is no separate `mode`.

A normal source is a positive normal-domain allocation on that Trial. Wild is excluded.

`source_count.universe` accepts:

- `allowed`;
- `all_normal`;
- `class:<domain_class>`.

`required_class_counts` and `required_domain_counts` map IDs to `{minimum, maximum}`.

Complete Mastery is represented declaratively:

```yaml
eligibility:
  source_count:
    universe: all_normal
    minimum: 3
    maximum: null
  required_class_counts:
    energy: {minimum: 1, maximum: null}
    transformation: {minimum: 1, maximum: null}
    enchantment: {minimum: 1, maximum: null}
```

All normal domains not allowed by a Trial's filters make the entry illegal.

No opaque `custom` callback is permitted in VS1/VS2.

### 5.4 Trial-tiebreak tokens

Legal tokens:

| Token | Definition |
|---|---|
| `total_power` | legal normal + legal Wild on this Trial |
| `normal_power` | legal normal power on this Trial |
| `qualifying_source_count` | positive normal sources in the declared counting universe |
| `legacy_utilization` | normal power on this Trial ÷ total capacity of normal domains used positively on this Trial |
| `legacy_focus` | normal power on this Trial ÷ player's total normal power |
| `hybrid_efficiency` | same executable formula as `legacy_utilization`, separate provenance token |
| `hybrid_commitment` | same executable formula as `legacy_focus`, separate provenance token |
| `shared` | terminal shared Trial award |

Wild is excluded from ratio numerators, denominators and source counts.

The ratio formulas are historical execution conventions, not design endorsements.

### 5.5 Final-tiebreak tokens

Legal tokens:

| Token | Reads |
|---|---|
| `first_place_trial_count` | resolved Trial placements |
| `total_normal_power` | derived player state |
| `spell_count` | `tiebreak_stats` |
| `largest_spell` | `tiebreak_stats` |
| `shared` | terminal result |

Recognition Points are compared before the configured chain.

### 5.6 Player state

```yaml
player_id: string
normal_power:
  radiance: 0
  void: 0
  flux: 0
  aether: 0
  echo: 0
  transformation: 0
  enchantment: 0
wild_power: 0

tiebreak_stats:
  spell_count: 0
  largest_spell: 0

independent_score:
  value: 0
  version: string

provenance:
  type: synthetic-controlled | synthetic-adversarial | playtest-import | simulator-import
  source_id: string | null
```

Missing declared domains normalize to zero. Undeclared non-zero domains are invalid.

### 5.7 Allocation

```yaml
player_id: string
normal:
  trial_id:
    domain_id: integer
wild:
  trial_id: integer
residue:
  normal:
    domain_id: integer
  wild: integer
```

All values are non-negative integers.

### 5.8 Resolution result

```yaml
configuration:
  id: string
  version: string
player_count: integer

validation:
  valid: boolean
  errors: []
  warnings: []

invalidation_trace:
  overallocated_domains: {}
  invalidated_trial_entries: {}
  dropped_wild_entries: {}

trial_results:
  - trial_id: string
    legal_entries: {}
    normal_totals: {}
    wild_totals: {}
    total_power: {}
    comparison_trace: []
    placements: []
    rewards_awarded: {}

player_results:
  player_id:
    recognition_points: integer
    final_place: integer
    shared_first: boolean
    final_tiebreak_trace: []

utilities:
  win: {}
  margin: {}

audit:
  conservation: {}
  residue: {}
  deterministic_hash: string
```

The invalidation and comparison traces are required outputs.

## 6. Public Core Interfaces

Exact signatures may follow the chosen language.

```text
load_configuration(path) -> Configuration
validate_configuration(config) -> ValidationResult

derive_player_state(spellbook, config, q_version) -> PlayerState
validate_state(state, config) -> ValidationResult

validate_allocation(state, allocation, config) -> AllocationValidation
is_maximal_allocation(state, allocation, config) -> bool

resolve_profile(config, states, allocations) -> ResolutionResult

enumerate_allocations(config, state) -> Iterable[Allocation]
canonical_allocation_key(config, state, allocation) -> Hashable

build_two_player_payoff_matrix(
    config,
    state_a,
    state_b,
    allocations_a,
    allocations_b
) -> PayoffMatrix

eliminate_strictly_dominated(matrix) -> DominanceResult
diagnose_weak_dominance(matrix) -> DiagnosticResult

solve_zero_sum(matrix, utility) -> EquilibriumResult
maximize_equilibrium_mass(matrix, player, strategy_index) -> float

compute_small_state_metrics(...) -> MetricsReport
```

Core functions must be pure or deterministic with all seeds passed explicitly.

---

## 7. Resolver Semantics

### 7.1 Ordered pipeline

1. Validate configuration and token vocabularies.
2. Validate or derive player states from Spellbooks.
3. Validate allocation syntax and non-negative integers.
4. Reconcile each domain and Wild ledger.
5. Apply over-allocation invalidation.
6. Evaluate remaining normal entries against every eligibility predicate.
7. Drop Wild attached to an illegal or invalidated normal entry.
8. Check completion policy.
9. Calculate Trial totals.
10. Apply Trial comparison and tiebreaks.
11. Award Recognition Points.
12. Apply final-result tiebreaks.
13. Emit full audit trace.

### 7.2 Invalidation scopes

#### Illegal Trial entry

Default: ignore that player's complete entry on that Trial. Power remains spent for ledger/audit purposes unless the candidate configuration explicitly says otherwise; it contributes zero to the Trial.

#### Over-allocated normal domain

Default: every Trial entry drawing positive power from that domain is invalidated. Other entries remain eligible.

#### Over-allocated Wild

Default: every Trial entry drawing Wild is invalidated or has its Wild dropped according to configuration. The baseline model uses `invalidate_entries_using_wild`.

#### Malformed allocation

Reject the entire profile.

No over-allocation is clipped or proportionally reduced.

### 7.3 Wild semantics

- Wild-only entry: illegal.
- One normal source plus Wild on a two-source Trial: illegal because Wild does not satisfy the source minimum.
- Wild on a legal mono-source Trial: legal; Wild does not break the maximum source count.
- Wild attached to an illegal normal entry: dropped with the entry.
- Wild contributes to `total_power` only after normal-entry legality is established.
- Wild is ignored by all tiebreaks unless a future configuration explicitly introduces a new token.

### 7.4 Ratio tiebreak arithmetic

Use exact rational comparison by cross multiplication; do not convert ratios to floating point.

For `legacy_utilization` / `hybrid_efficiency`:

\[
\frac{\text{normal power on Trial}}
{\sum\text{total capacities of domains used positively on Trial}}
\]

For `legacy_focus` / `hybrid_commitment`:

\[
\frac{\text{normal power on Trial}}
{\text{total normal power across all domains}}
\]

A zero denominator is invalid input and must not arise for a legal normal entry.

### 7.5 Final result

Aggregate Recognition Points first, then apply the configured final chain. `first_place_trial_count` counts outright Trial firsts, not shared firsts, unless a future token explicitly says otherwise.

A final shared 2p result gives win utility zero.

## 8. Completion and Residue

Support all three policies.

### OPTIONAL

Any legal residue is permitted.

### MAXIMAL

An allocation is valid only when no residual unit can be legally added to any active Trial without removing another unit.

A maximality checker may be implemented by testing each residual unit against every possible Trial destination.

### FULL

All residue must be zero.

If full allocation is impossible:

- `reject`: state/config pair is infeasible;
- `residue`: treat as maximal and emit a warning.

The default candidate uses `MAXIMAL`.

---

## 9. Canonicalization

### 9.1 Static key

Before a payoff matrix exists, canonicalize exact duplicate allocation descriptions after normalized ordering.

### 9.2 Strategic equivalence

For VS2, two strategies may be collapsed only when their complete columns/rows are identical under:

- win payoff;
- margin payoff;
- Trial-award vector.

Retain a mapping from each canonical class to original allocations.

Adding an unenterable Trial must not change collapsed strategy counts or metrics.

---

## 10. Dominance

### 10.1 Strict dominance

For row strategies \(r,r'\):

\[
r'\text{ strictly dominates }r
\iff
u^W(r',c)>u^W(r,c)
\quad\forall c
\]

Use the analogous column-player definition.

Do not implement the weak-dominance formula under the name `strict`.

### 10.2 Iteration

At each round:

- evaluate dominance only against currently surviving opponent strategies;
- remove all strictly dominated strategies simultaneously;
- repeat to fixed point.

Return:

- survivors;
- removed strategies;
- dominator;
- elimination round.

### 10.3 Weak-dominance diagnostics

May report weak dominance separately, but must not feed the primary reasonable set.

---

## 11. Two-Player Matrix and Equilibrium

### 11.1 Payoffs

Store:

- \(u^W\in\{-1,0,1\}\);
- \(u^M=r_A-r_B\);
- final tie flag;
- Trial award vector;
- Trial and final tiebreak-stage counts.

Payoff construction is exhaustive and integer-exact for VS2 states.

### 11.2 Numerical zero-sum solve

For each utility:

- solve the finite zero-sum matrix using SciPy HiGHS;
- return value and optimal mixed strategy;
- validate primal feasibility, dual feasibility and exploitability residual;
- label the method `numerical_lp`.

Fixture values stated theoretically as zero pass when absolute value and residuals are within \(10^{-9}\).

### 11.3 Canonical maximum-entropy equilibrium

Among optimal strategies, select the maximum-Shannon-entropy point.

Implementation:

1. Obtain the game value and optimality constraints from the LP.
2. Solve the concave entropy maximization as constrained numerical optimization using fixed initialization and sorted strategy order.
3. Validate feasibility against the LP value.
4. If the entropy solve fails validation, do not silently substitute an arbitrary LP vertex. Return `canonical_equilibrium_failed` with the non-canonical optimal LP solution separately.

Return:

- probability vector;
- Shannon entropy;
- normalized entropy;
- support at \(10^{-9}\), \(10^{-3}\), \(10^{-2}\);
- optimization status;
- feasibility and optimality residuals;
- method label `numerical_convex`.

### 11.4 Equilibrium-relevant set

For each strategy, solve one LP maximizing its probability subject to optimality constraints.

Include it in \(\mathcal E^{0.01}\) when:

\[
p_{\max}\ge0.01-10^{-9}
\]

Return the maximum mass and tolerance for every strategy.

### 11.5 Deterministic output

Strategy arrays, support lists and ties between equivalent numerical outputs use canonical sorted order. Solver parallelism or nondeterministic modes must be disabled where possible.

## 12. VS1 — Resolver and Fixtures

### 12.1 Deliverables

- package and dependency metadata;
- manifest and path updates;
- configuration, Spellbook, state and allocation schemas;
- legacy and hybrid power derivation;
- declarative eligibility engine;
- invalidation policies;
- pure resolver;
- ratio and local tiebreak vocabularies;
- audit trace;
- baseline-stale and hybrid candidate files;
- toy configuration files;
- authored A1, A2, A7-profile, A8, A9, A10, A11, A12, A16 and A17 fixtures;
- parameterized pytest suite.

### 12.2 VS1 exit criteria

VS1 is complete only when:

- all resolver-level MATH tests pass;
- baseline-stale and hybrid candidate files load without code branches specific to their IDs;
- Complete Mastery is represented declaratively;
- A7's **specific supplied allocation profiles** reproduce the ratio inversion; the “best achievable” search remains VS2;
- A10 implements the corrected Wild semantics;
- A12's explicit subcases resolve through the intended tiebreak stage;
- A16 derives the expected power vector from its Spellbook and reproduces the source-backed allocation totals;
- deterministic hashes are stable;
- manifest and cross-reference checks pass.

Do not start VS2 until VS1 is reviewed.

## 13. VS2 — Small-State Exact Laboratory

### 13.1 Deliverables

- allocation enumeration;
- exact maximality checking;
- strategic-equivalence collapse;
- win and margin payoff matrices;
- iterated true strict-dominance elimination;
- weak-dominance diagnostics;
- zero-sum LP solver;
- canonical maximum-entropy equilibrium;
- \(\mathcal E^{0.01}\) support analysis;
- counterability and tie metrics;
- deterministic Markdown and JSON reports.

### 13.2 Scale limits

VS2 may reject or redirect states whose collapsed matrix exceeds a configured ceiling.

Initial ceiling:

- up to 10,000 row classes;
- up to 10,000 column classes;
- memory estimate checked before matrix construction.

Do not silently sample when the exact ceiling is exceeded.

### 13.3 Exit criteria

- all verified toy counts reproduced;
- equilibrium value fixtures reproduced within declared tolerance;
- dominance terminology tests pass;
- tie accounting matches fixtures;
- exact/sampled labels are correct;
- no result depends on iteration order or dictionary ordering.

---

## 14. Adversarial Fixtures

All fixture inputs are committed data. Tests must not construct hidden defaults.

### A1 — Mirror tie

Identical states and allocations.

Expected: identical RP, final shared result and player-swap symmetry.

### A2 — Domain relabel

Relabel equivalent energy domains in configuration, states and allocations.

Expected: isomorphic resolution.

### A3 — Turtle

Toy configuration:

- one fungible normal domain;
- budget 4;
- two Trials, rewards 5 and 3;
- every positive amount is a legal entry;
- optional allocation;
- WTA, shared-full ties;
- no tiebreak before shared.

Expected:

- 15 legal allocations including residue;
- `(4,0)` has zero strict beaters;
- C1 fails.

### A4 — Counter cycle

Toy configuration:

- budget 6;
- rewards 5, 4, 3;
- optional allocation;
- WTA, shared-full ties.

Expected:

- 84 legal allocations;
- zero unbeaten allocations;
- cycle `(0,1,1) -> (3,0,0) -> (0,2,0) -> (0,1,1)`;
- numerical LP value within \(10^{-9}\) of zero;
- mixed equilibrium.

### A5 — Tie-fest

- budget 4;
- full allocation;
- two Trials worth 5 and 5.

Expected: every non-mirror pair produces 5–5 before final tiebreak; tie gate would fail.

### A6 — Counterable but poor

- budget 6;
- three Trials worth 4 each;
- optional allocation.

Expected: zero unbeaten allocations and ordered-pair tie rate \(1/3\).

### A7 — Monotonicity trap

One Purity Trial worth 6.

State 0:

- A: Void 5;
- B: Void 5;
- both allocate Void 5.

State 1:

- A: Void 5, Enchantment 3;
- B unchanged;
- both use the same Trial allocations.

Legacy/hybrid Commitment convention:

\[
\text{normal on Trial}/\text{total normal power}
\]

Expected resolver profiles:

- state 0 shared result;
- state 1 B wins under Commitment;
- state 1 remains shared under the local default chain.

VS2 additionally enumerates A's choices and confirms best utility changes 0 → -1 in the legacy-ratio branch.

### A8 — Infeasible fullness

- all power in one domain;
- every Trial requires at least two sources;
- full completion.

Expected: infeasibility or configured residue fallback; no crash.

### A9 — Penny squat

One player places 1 legal normal power on a Trial the opponent skips, no floor.

Expected: full configured reward and uncontested-award diagnostic.

### A10 — Wild legality trio

#### A10a Wild-only

- 0 normal + 1 Wild.

Expected: illegal entry; Wild dropped.

#### A10b Wild cannot satisfy breadth

- one positive normal energy + Wild on Energy Harmony requiring two energy sources.

Expected: illegal entry.

#### A10c Wild is safe on mono

- one positive energy source + Wild on Energy Purity.

Expected: legal entry; Wild adds to total; source count remains one.

### A11 — Over-allocation

Available domain power 11; total allocated from that domain 12 across multiple Trials.

Expected:

- the domain is flagged;
- every entry using that domain is invalidated;
- exact excess reported;
- unrelated domain entries remain eligible.

### A12 — Tiebreak cascade

#### A12a Source-count tiebreak

One multi-source-eligible Trial worth 5.

- A: normal `2+2`, Wild 1 → total 5, normal 4, sources 2.
- B: normal `4`, Wild 1 → total 5, normal 4, sources 1.

Expected: A wins at `qualifying_source_count`.

#### A12b Source count skipped

One mono-only Trial with the same total and normal totals for both players.

Expected: source-count stage is inapplicable and result proceeds to `shared`.

#### A12c Shared first and second-place suppression

A 6p toy Trial with first/second rewards and two players tied for first after all stages.

Expected: both receive the configured shared-first award and no separate second-place award if suppression is enabled.

### A13 — Dominance staircase — deferred to VS5

No oracle-bearing fixture exists yet. Remove MATH-9 from the first milestone.

Before VS5, author a complete reachable card-space path with:

- explicit states at every step;
- a planted non-contiguous winning region;
- expected first-hold and upper-threshold values.

### A14 — Dead power

Add power with no legal sink.

Expected: dead-power diagnostic and no local-tiebreak monotonicity inversion.

### A15 — Equivalence inflation

Add a Trial nobody can enter.

Expected: strategic-equivalence classes and strategic metrics unchanged.

### A16 — Maya worked example

Spellbook:

- 7-card Void Conjuration;
- 5-card Transfiguration;
- 4-card Enchantment;
- 6-card Aether Perfect Transmutation.

Under the hybrid profile, expected derived state:

- Void 11;
- Aether 9;
- Transformation 16;
- Enchantment 8;
- Wild 2.

The fixture must transcribe the exact three-Trial allocation from hybrid rebuild §12 as committed data.

Expected:

- exact ledgers exhausted: 11/9/16/8/2;
- Trial totals 10, 21 and 15.

The acceptance oracle is the source-backed allocation plus those totals; Kiro must not invent a different allocation merely matching the totals.

### A17 — Formula comparison

Same Spellbook under:

- legacy profile;
- hybrid \(2n-3\) profile.

Expected:

- legacy 5-card standard spell power 8 using half-up rounding;
- hybrid 5-card standard spell power 7;
- hybrid Enchantment table 4/8/12;
- differences attributed to \(F\).

### A18 — Floored turtle — diagnostic, not first-milestone test

Start from A4 and apply a normal entry floor of 4.

VS2 may enumerate and report the surviving allocations and counterability, but no predeclared pass/fail oracle exists. Before promotion to a regression test, commit the exact expected allocation set and turtle result.

## 15. Mathematical Acceptance Tests

Only MATH tests have fixed correctness oracles. Design thresholds are report fields during the first milestone.

### VS1 tests

**MATH-1 — Determinism and symmetry.** A1 and A2.

**MATH-2 — Conservation and invalidation.**

\[
\text{valid allocation}+\text{residue}=\text{available}
\]

A11 reports exact over-allocation and invalidation scope.

**MATH-3 — Maya derivation and resolution.** A16.

**MATH-4 — Formula profiles.** A17 and the \(2n-3\) table:

- 3 → 3
- 4 → 5
- 5 → 7
- 6 → 9
- 7 → 11
- 10 → 17

**MATH-5 — Wild semantics.** A10a–c.

**MATH-6 — Eligibility conjunction.** Include Energy Purity, Energy Harmony, Focused Power and Complete Mastery examples proving source-count universe and per-class requirements.

**MATH-7 — Tiebreak cascade.** A12a–c.

**MATH-8a — Monotonicity resolver profiles.** A7 reproduces the stated outcomes for fixed supplied allocations.

### VS2 tests

**MATH-8b — Monotonicity best-achievable value.** Exhaustive A7 search confirms 0 → -1 under Commitment and no drop under local tiebreaks.

**MATH-9 — Enumeration.**

- A4: exactly 84 allocations, zero unbeaten, named cycle present.
- A3: exactly 15 allocations, `(4,0)` has zero strict beaters.

**MATH-10 — Tie accounting.**

- A5 tie-fest.
- A6 ordered-pair tie rate \(1/3\).

**MATH-11 — Numerical equilibrium.** A4 LP value within \(10^{-9}\) of zero and canonical equilibrium mixed.

**MATH-12 — Collapse invariance.** A15.

**MATH-13 — Strict versus weak dominance.** A hand-built matrix contains a weakly but not strictly dominated strategy; strict elimination retains it and weak diagnostics flag it.

**MATH-14 — Equilibrium-relevant mass.** A hand-built multiple-equilibrium matrix verifies per-strategy maximum mass and \(1\%\) inclusion using the declared tolerance.

### Deferred tests

- Dominance staircase and threshold semantics: VS5 after A13 is authored.
- Floored-turtle regression: after A18 receives a committed oracle.
- All multiplayer target tests: VS6.

A test marked deferred is not counted as a first-milestone failure.

## 16. Design Metrics Required in VS2 Reports

For each exact fixture or small candidate state:

- legal allocation count;
- maximal allocation count;
- collapsed class count;
- \(|\mathcal R|\);
- \(|\mathcal E^{0.01}|\);
- win and margin game values;
- canonical equilibrium probabilities;
- entropy and normalized entropy;
- final tie probability;
- Trial shared-award rate;
- final-tiebreak usage;
- counterability over \(\mathcal R\) and \(\mathcal E\);
- counter margins;
- counter distances;
- margin-VOI;
- dead power;
- Trial reward concentration.

Reports must not label a design gate pass when a normative threshold has not yet been evaluated.

---

## 17. Report Formats

### 17.1 JSON

Machine-readable reports must include:

```yaml
metadata:
  config_id:
  config_version:
  player_count:
  state_ids:
  q_version:
  provenance:
  method: exhaustive | exact_lp | bounded_exact | sampled
  solver:
  tolerances:
  seed:

counts: {}
equilibrium: {}
counterability: {}
ties: {}
complexity: {}
diagnostics: {}
gates:
  G1: pass | fail | not_evaluated
notes: []
```

### 17.2 Markdown

Human-readable reports should contain:

1. scope and evidence class;
2. hard-gate table;
3. equilibrium summary;
4. counterability summary;
5. tie and tiebreak summary;
6. diagnostics;
7. exact failures and counterexamples;
8. assumptions and limits.

Every failure should name a concrete state and allocation where possible.

---

## 18. Performance and Reproducibility

- deterministic ordering of domains, Trials and strategies;
- deterministic hashes for configurations, states and allocations;
- seeds recorded for any later sampled process;
- matrix memory estimate before allocation;
- solver tolerance recorded;
- exact enumeration never silently replaced by Monte Carlo;
- output files include code revision or commit hash where available;
- benchmark allocation enumeration and matrix construction separately.

No user-facing claim may rely on an unrecorded seed or mutable global state.

---

## 19. Readiness Review Resolution

The §19 readiness review has been completed and accepted.

Resolved blockers:

1. Eligibility is conjunctive and uses an explicit source-count universe.
2. Complete Mastery is declarative through per-class minimums.
3. Spellbook and power-derivation schemas are defined.
4. Invalidity scopes are configuration fields.
5. Trial and final tiebreak token vocabularies are enumerated.
6. Legacy ratio formulas are fixed as executable historical conventions.
7. Wild attached to an illegal entry is dropped; Wild remains safe on legal mono entries.
8. A7 is split into VS1 profile resolution and VS2 best-achievable search.
9. A13 and A18 are removed from first-milestone correctness gates.
10. Numerical LP and convex results are not labelled exact.
11. pytest without Hypothesis is the selected test approach.
12. The package, dependency, manifest and document-location conventions are fixed.

Kiro may now begin VS1.

If source inspection reveals that the hybrid rebuild's recorded A16 allocation differs from the readiness-review description, stop only that fixture, report the discrepancy and continue all unrelated VS1 work. Do not reinterpret the source silently.

## 20. Later Vertical Slices

These are architecture constraints, not first-milestone deliverables.

### VS3 — Exact best-response oracle

- per-domain dynamic programming where separable;
- integer programming fallback for coupled eligibility;
- validated cell-by-cell against VS2.

### VS4 — Double-oracle equilibrium

- add exact best responses iteratively;
- solve restricted zero-sum games;
- stop only with oracle-certified exploitability gap;
- report non-convergence explicitly.

### VS5 — Strength paths and configuration reports

- card-space path suppliers;
- first-hold and upper dominance thresholds;
- archetype matrices;
- per-count Pareto reports.

### VS6 — Multiplayer harness

- S1/S2 populations;
- exact-given-profile deviations;
- kingmaker, spoiler and contender metrics;
- no multiplayer equilibrium claims.

No VS3–VS6 work starts until VS1 and VS2 reproduce the exact fixtures and receive review.

---

## 21. Definition of Done for the First Milestone

The first milestone is complete when:

- VS1 and VS2 are implemented;
- baseline and hybrid configurations load from data;
- all VS1 and VS2 MATH tests in §15 pass; deferred tests are not counted;
- every verified adversarial number from the review is reproduced;
- true strict and weak dominance are not conflated;
- canonical equilibrium and \(\mathcal E^{0.01}\) are deterministic;
- exact evidence is distinguished from sampled evidence;
- a single command generates JSON and Markdown fixture reports;
- no candidate configuration has yet been automatically declared “best.”
