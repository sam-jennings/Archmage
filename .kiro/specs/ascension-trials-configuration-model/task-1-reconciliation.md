---
title: Ascension Trials Configuration Model — Task 1 Reconciliation Note
type: spec-reconciliation
spec: ascension-trials-configuration-model
updated: 2026-07-10
status: awaiting-approval
task: "1 — Reconcile existing implementation with the approved spec"
---

# Task 1 — Existing-Implementation Reconciliation

This note reconciles the code written **before** the Kiro spec was approved against the
now-approved `requirements.md` and `design.md`. Per the `tasks.md` execution rule and
design §16, existing modules are **implementation candidates**, not completed work:
nothing is "complete" on the strength of importing, compiling or hand-verification.
**No implementation code is modified by this task** — the deliverable is this analysis
artifact, produced *before* any code changes in tasks 2–25.

Every claim below was re-verified by reading the actual source in
`simulation/ascension_trials_model/src/ascension_trials/` (not inferred from the prior
note). The required six sections are §3 (inventory), §4 (item→requirement/design map),
§5 (missing behaviour), §6 (conflicting semantics), §7 (unused code) and §8 (per-module
verdict). §9 is a compact discrepancy register that the sections reference; §10 records
proposed (non-"complete") task status.

## 0. What exists, and where

- **Only code copy:** `simulation/ascension_trials_model/src/ascension_trials/` —
  `__init__.py`, `schema.py`, `config_loader.py`, `spellbook.py`, `power.py`,
  `eligibility.py`, `resolver.py`, `canonical.py`, `provenance.py`.
- **Package scaffolding present:** `pyproject.toml`, `README.md`, `requirements.lock`,
  `src/`. **Absent:** `configs/`, `fixtures/`, `tests/`, `docs/`, `outputs/`.
- **Root `Ascension Trials/`** holds documents only (normative model + Kiro spec sources +
  proposals/critiques) and a nested `ascension-trials-configuration-model-spec/` that
  contains only `requirements.md` / `design.md` / `tasks.md` copies. **No code lives
  there.** Removing/relocating that root folder is **task 14**, not task 1.
- Design §3 names 15 `src/` modules; **7 of them exist** (`schema`, `config_loader`,
  `spellbook`, `power`, `eligibility`, `resolver`, `canonical`) and **8 are absent**
  (`legality.py`, `reports.py`, `cli.py`, `enumerate.py`, `dominance.py`, `matrix.py`,
  `equilibrium.py`, `metrics.py`). One extra helper, `provenance.py`, exists but is not
  one of the design's 15 (it supports §4.6).

## 1. Final Kiro spec file paths

```
.kiro/specs/ascension-trials-configuration-model/requirements.md
.kiro/specs/ascension-trials-configuration-model/design.md
.kiro/specs/ascension-trials-configuration-model/tasks.md
.kiro/specs/ascension-trials-configuration-model/task-1-reconciliation.md   (this note)
```

## 2. Requirement → Design → Task traceability

| Requirement | Design sections | Tasks |
|---|---|---|
| REQ-1 Data-driven config | §1, §2, §3, §5.1–5.3 | 2, 3, 10 |
| REQ-2 Declarative eligibility | §4.3, §5.3, §7.5 | 3, 5 |
| REQ-3 Spellbook + power | §4.5, §5.1, §7.x | 4 |
| REQ-4 Allocation + residue | §4.7, §7.3, §7.6, §8.1 | 6 |
| REQ-5 Invalid-entry / domain | §5.2, §7.4, §7.5 | 3, 7 |
| REQ-6 Wild semantics | §5.1 (wild), §7.5 step 6 | 5, 7 |
| REQ-7 Deterministic resolver | §4.8, §7 (all), §7.11 | 7, 8, 9 |
| REQ-8 Tiebreak vocabulary | §5.3, §6 | 3, 8 |
| REQ-9 Config + fixture library | §3, §15.2 | 4, 10, 11 |
| REQ-10 Enumeration | §8 | 16 |
| REQ-11 Equivalence + dominance | §9, §10 | 17, 19 |
| REQ-12 Matrices + equilibrium | §11, §12.1 | 18, 20 |
| REQ-13 Canonical eq + E^0.01 | §12.2, §12.3 | 21, 22 |
| REQ-14 Reports + evidence labels | §13 | 11, 12, 13, 23 |
| REQ-15 Repo integration | §3, §16 | 2, 14 |
| NFR-1 Determinism | §7.1, §7.11 | 9, 13 |
| NFR-2 Purity | §2 | 2, 9 |
| NFR-3 Numerical transparency | §12 | 20, 21 |
| NFR-4 Failure visibility | §8.2, §14 | 6, 9, 16 |
| NFR-5 Extensibility | §2, §16 | VS3–VS6 (architectural) |

Every requirement maps to ≥1 design section and ≥1 task; every task cites requirement IDs.
Two internal observations: (a) A15 (equivalence invariance) is referenced by task 17 but
is a VS2 fixture, not in the REQ-9 VS1 fixture list — consistent, just noted; (b) design
§5.1 illustrates only the hybrid power profile — the legacy piecewise profile required by
REQ-3.2 is not shown in the schema example (see D-6).

## 3. Existing-code inventory (module → classes / public functions)

Only `src/ascension_trials/` is inventoried; underscore-prefixed helpers are omitted.

| Module | Design target (§2/§3) | Public API (classes / functions / constants) |
|---|---|---|
| `__init__.py` | package | `__version__ = "0.1.0"` |
| `schema.py` | `schema.py` | **Data:** `ValidationResult` (+`error`/`warn`/`merge`), `Domain`*, `CountBound`, `SourceCount`, `Eligibility`, `EntryFloor`, `TieAward`, `Trial` (+`is_active`), `WildRules`, `PowerSegment`, `StandardSpellPower`, `EnchantmentPower`, `Contribution`, `PowerFormula`, `InvalidationPolicy`, `AllocationRules`, `Configuration` (+`domain_map`/`domain_class`/`trial_map`/`active_trials`), `Spell`, `Spellbook`, `IndependentScore`, `PlayerState` (+`total_normal_power`), `Allocation` (+`trials_touched`/`normal_on`/`wild_on`). **Vocab:** `SPELL_TYPES`, `TRIAL_TIEBREAK_TOKENS`, `CAPACITY_RATIO_TOKENS`, `COMMITMENT_RATIO_TOKENS`, `RATIO_TOKENS`, `FINAL_TIEBREAK_TOKENS`, `COMPLETION_POLICIES`, `SOURCE_COUNT_UNIVERSES_FIXED`. (*only `Domain` is `frozen=True`.) |
| `config_loader.py` | `config_loader.py` | `VALID_PROFILES`; `config_from_dict`, `load_configuration`, `spellbook_from_dict`, `state_from_dict`, `allocation_from_dict`, `validate_configuration` |
| `spellbook.py` | `spellbook.py` | `validate_spellbook` |
| `power.py` | `power.py` | `eval_power_expression`, `standard_spell_power`, `enchantment_power`, `derive_player_state` |
| `eligibility.py` | `eligibility.py` | `evaluate_entry`, `count_sources_in_universe`, `qualifying_source_count` |
| `resolver.py` | `resolver.py` **+ absorbs** `legality.py` | `TrialEntry`, `TrialResult`, `PlayerResult`, `ResolutionResult` (+`to_dict`); `validate_state`, `validate_allocation`, `resolve_profile` |
| `canonical.py` | `canonical.py` | `canonical_json`, `deterministic_hash`, `canonical_allocation_key` |
| `provenance.py` | (supports §4.6) | `Provenance` (enum), `PERMITTED_PROVENANCE`, `is_valid_provenance` |

**Absent vs design §3:** `legality.py` (folded into `resolver.py`), `reports.py`, `cli.py`
(VS1, task 13), and `enumerate.py`, `dominance.py`, `matrix.py`, `equilibrium.py`,
`metrics.py` (VS2, tasks 16–23).

**Positive conformance confirmed by inspection:** no `if baseline / if hybrid` branch in the
resolver (design §2); ratios use `fractions.Fraction` (REQ-8.3); audit hash is SHA-256 over
sorted-key canonical JSON (REQ-7.2 / §7.11); win∈{-1,0,1} and margin = rₐ−r_b at two players
(§7.10); Wild is structurally never a source because eligibility reads only positive normal
entries (REQ-6.2/6.3).

## 4. Item → requirement / design mapping

| Item(s) | Requirement | Design | Conformance |
|---|---|---|---|
| `Configuration`/`Domain`/`Trial`/`PowerFormula`/`WildRules`/`AllocationRules` + token sets | REQ-1.2 | §4.1–4.4, §5.1–5.3 | shape present; token/vocab & schema-shape deviations (D-2..D-6) |
| `config_from_dict`/`load_configuration` | REQ-1.1 | §5.1 | JSON shape differs from §5.1 (D-6) |
| `validate_configuration` | REQ-1.4, REQ-2.6, REQ-8 | §5.3, §7.2 | token checks present; contradictory-eligibility & state-closure checks missing (D-11) |
| `Eligibility`/`evaluate_entry`/`count_sources_in_universe` | REQ-2.1–2.5, REQ-6.2/6.3 | §4.3, §5.3, §7.5 | conforms; no generic `custom` mode; `forbidden_*` is an extra beyond §4.3 |
| `qualifying_source_count` | REQ-8.1 | §5.3, §6 | conforms |
| `Spell`/`Spellbook`/`validate_spellbook` | REQ-3.1 | §4.5 | conforms |
| `standard_spell_power`/`enchantment_power`/`derive_player_state` | REQ-3.2–3.5 | §5.1 | logic present; `ast` eval & enchantment-table indexing (D-5, D-7) |
| `validate_state`/`validate_allocation` + ledger reconciliation | REQ-4.1–4.3, REQ-4.7 | §7.3 | conserves ledger, no silent clipping; lives in resolver not `legality.py` (D-1) |
| completion policy (`_apply_completion_policy`) | REQ-4.4–4.6 | §7.6 | optional/full present; **maximal is soft-warn only** (D-8) |
| over-allocation / invalidation (`resolve_profile` steps 4–5) | REQ-5.1–5.4, REQ-6.1 | §5.2, §7.4/7.5 | Wild drop + trace present; **actions largely hardcoded** (D-4, D-13) |
| tiebreak comparators (`_token_value`/`_compare_entries`) | REQ-8.1–8.6 | §5.3, §6 | Fraction-based; wrong token names + conflated denominators + no `breadth` (D-2) |
| final tiebreaks (`_resolve_final`) | REQ-8.2 | §5.3 | `first_place_trial_count` vs `first_place_trial_wins` (D-3) |
| `resolve_profile` 13-step spine + utilities | REQ-7.1–7.5 | §7 all | order present; result field naming/immutability differ (D-9) |
| `canonical_json`/`deterministic_hash`/`canonical_allocation_key` | REQ-7.2, NFR-1 | §7.11 | conforms |
| `Provenance`/`is_valid_provenance` | REQ-3.5 | §4.6 | vocab present; not enforced on load (D-12 adjacent) |

## 5. Missing behaviour (required by the spec, not yet implemented)

- **`legality.py` module** (design §2) — ledger/entry/floor/completion validation currently
  lives inside `resolver.py`. Boundary is missing. (REQ-4, REQ-7; tasks 6, 9) — D-1
- **Constructive maximality proof** (§7.6) — for MAXIMAL completion the resolver must name a
  legal destination for any addable residue unit; today it only emits a soft warning.
  (REQ-4.5; task 6) — D-8
- **Contradictory-eligibility validation** (REQ-2.6) — `validate_configuration` does not reject
  self-contradicting predicates (e.g. `min_sources > max_sources`, allowed∩forbidden overlap,
  a required class minimum exceeding a source maximum). (task 3) — D-11
- **State-closure validation** (§7.2, REQ-7.1 step 1) — no check that a requested final/Trial
  tiebreak statistic is actually available on the states. (tasks 3, 9) — D-11
- **`breadth` Trial tiebreak token** (REQ-8.1) — absent; the code approximated it with
  `qualifying_source_count`. (task 8) — D-2
- **Configuration-driven Wild inclusion in tiebreak stages** (REQ-6.5/6.6) — Wild inclusion is
  hardcoded (normal-only for ratios; Wild only in `total_power`); `included_in_tiebreaks` is
  ignored. (task 7/8) — D-13
- **Switchable invalidation actions** for illegal Trial entry, normal-domain over-allocation and
  invalid whole allocation (REQ-5.1/5.2) — only `overallocated_wild` is honoured; the others are
  hardcoded. (task 7) — D-13
- **Typed exception hierarchy** (§14) — `ConfigurationError`, `StateClosureError`, … do not
  exist; code uses `ValidationResult` + bare `ValueError`. (tasks 3–9) — D-10
- **`reports.py` / `cli.py`** (REQ-14, §13) — absent. (task 13)
- **VS2 modules** `enumerate.py`, `dominance.py`, `matrix.py`, `equilibrium.py`, `metrics.py`
  (REQ-10–REQ-13, §8–§12) — absent. (tasks 16–23)
- **`configs/`, `fixtures/`, `tests/` trees** (REQ-9, §15) — absent. (tasks 10, 11, 12)

## 6. Conflicting semantics (existing code contradicts the approved design)

- **D-2 (H) — Trial-tiebreak tokens & denominators.** Code tokens
  `legacy_utilization / legacy_focus / hybrid_efficiency / hybrid_commitment` vs approved
  `utilization_ratio / focus_ratio / efficiency_ratio / commitment_ratio` **+ `breadth`**.
  Worse, `_token_value` **conflates two distinct pairs**: it gives `legacy_utilization` and
  `hybrid_efficiency` the *same* denominator (capacity of used domains) although §6.1 vs §6.3
  differ (qualifying-*used* capacity vs capacity of domains *represented*); and it gives
  `legacy_focus` and `hybrid_commitment` the *same* denominator `total_normal_power()` although
  §6.2 `focus_ratio` is over **normal allocated across all Trials** while §6.4 `commitment_ratio`
  is over **total Spellbook normal**. So `focus_ratio` is currently computed with the wrong
  denominator. (REQ-8; task 8)
- **D-3 (M) — Final-tiebreak token name.** `first_place_trial_count` vs approved
  `first_place_trial_wins`. (REQ-8.2; tasks 8, 9)
- **D-4 (M) — Invalidation vocabulary & default.** Code keys/values
  (`overallocated_domain=invalidate_entries_using_domain`,
  `overallocated_wild=invalidate_entries_using_wild`, `malformed_allocation=reject_profile`)
  vs design §5.2 (`normal_domain_overallocation=invalidate_domain_entries`,
  `wild_overallocation=reject_allocation`, `invalid_allocation=reject`). The **default Wild
  over-allocation behaviour also differs** (code invalidates only Wild-using entries; §5.2
  rejects the whole allocation). (REQ-5; task 7)
- **D-5 (H) — Enchantment table indexing (spec-internal inconsistency).** Design §5.1's example
  `{"4":4,"5":8,"6+":12}` scores a 4-card Enchantment = 4, but REQ-3.2/3.4 and the hybrid
  source require **3/4/5 → 4/8/12** (Maya's 4-card Enchantment = 8). The code follows the
  REQ-3.4 oracle. This is an inconsistency **inside the approved design**; flag §5.1 for
  correction rather than silently reinterpreting. (REQ-3; task 4)
- **D-6 (M) — Config JSON power schema shape.** Loader expects
  `power_formula.{profile, standard_spell_power, enchantment_power, contributions,
  enchantment_wild_sizes}`; design §5.1 models `power_profile.spell_rules.<type>.{formula|table}`.
  Both are data-driven but incompatible on disk, and §5.1 omits the legacy piecewise profile
  REQ-3.2 requires. Align loader to §5.1 (or amend §5.1). (REQ-1/REQ-3; tasks 3, 4, 10)
- **D-7 (M) — Formula evaluation strategy.** `power.py` parses/evaluates the expression string
  via a restricted `ast` walker; §5.1 asks for formulas converted into *validated internal
  operators* rather than code evaluation. (REQ-3; task 4)
- **D-9 (L/M) — Result shape & immutability.** `ResolutionResult` uses `validation` (not
  `validation_messages`), three separate invalidation dicts (not a unified `invalidation_trace`)
  and `deterministic_hash` (not `audit_hash`); most records are **mutable** whereas design §4
  specifies `frozen=True`. (NFR-2; tasks 3, 9)
- **D-12 (L) — `independent_score`.** Design §4.6 types it as `int` + `score_version`; code wraps
  it as `IndependentScore(value: int|None = None, version)`. Represent "not computed" explicitly
  while keeping the score version. (REQ-3.5; task 4)

## 7. Unused / dead code (parsed but never consulted for behaviour)

Verified by source search: the following config fields are **parsed by `config_loader.py` and
stored on the dataclasses but never read by `resolver.py` / `eligibility.py` / `power.py`**, so
the corresponding behaviour is hardcoded (or enforced only structurally). This directly
undermines REQ-1.5 ("configuration differences shall not require resolver code changes") and, for
Wild-in-tiebreaks, REQ-6.5. Collected as **D-13**.

| Field | Where declared | Consulted? | Effect |
|---|---|---|---|
| `WildRules.enabled` | schema + loader | no | Wild always active |
| `WildRules.can_enter_alone` | schema + loader | no | superseded by `requires_legal_normal_entry` |
| `WildRules.counts_as_source` | schema + loader | no | Wild-not-a-source enforced structurally, not by flag |
| `WildRules.can_satisfy_source_minimum` | schema + loader | no | hardcoded false |
| `WildRules.can_break_source_maximum` | schema + loader | no | hardcoded false |
| `WildRules.included_in_tiebreaks` | schema + loader | no | **REQ-6.5 gap** — Wild-in-tiebreak hardcoded |
| `AllocationRules.residue_allowed` | schema + loader | no | never enforced |
| `InvalidationPolicy.illegal_trial_entry` | schema + loader | no | illegal entries always effectively ignored |
| `InvalidationPolicy.overallocated_domain` | schema + loader | no | normal-domain invalidation hardcoded (label only) |
| `InvalidationPolicy.malformed_allocation` | schema + loader | no | never applied |
| `schema.SOURCE_COUNT_UNIVERSES_FIXED` | schema | no | dead constant; loader re-inlines `("allowed","all_normal")` |

Only `InvalidationPolicy.overallocated_wild`, `WildRules.included_in_primary_total` and
`WildRules.requires_legal_normal_entry` are actually consulted among the optional Wild/
invalidation flags. No genuinely orphaned *functions* were found — every public function is
reachable from `resolve_profile` or the loaders; the dead surface is configuration fields.

## 8. Per-module verdict

Vocabulary: **compatible** (conforms to the design on inspection — still requires the task's
acceptance tests before it may be called done), **refactor** (keep and correct), **replace**
(rewrite), **missing** (does not exist). No module is declared "complete": none has run its
acceptance tests (task 12 / task 24).

| Module | Verdict | One-line justification |
|---|---|---|
| `__init__.py` | compatible | package marker only; nothing to reconcile |
| `schema.py` | **refactor** | right record shapes but wrong tiebreak/invalidation token names, missing `breadth`, mutable-not-frozen, dead constant (D-2/3/4/9) |
| `config_loader.py` | **refactor** | data-driven and reachable, but JSON shape differs from §5.1 and it lacks contradictory-eligibility + state-closure validation (D-6, D-11) |
| `spellbook.py` | compatible | matches §4.5/REQ-3.1; only open point is confirming the energy-domain-applicability policy for Transfiguration/Enchantment |
| `power.py` | **refactor** | derivation logic sound but uses `ast` string-eval vs validated operators, and depends on the unresolved §5.1/REQ-3.4 enchantment-table inconsistency (D-5, D-7) |
| `eligibility.py` | compatible | declarative, conjunctive, Wild-never-a-source, Complete Mastery expressible; `forbidden_*` is a harmless superset of §4.3 to confirm |
| `resolver.py` | **refactor** | correct 13-step spine + audit hash, but absorbs `legality.py`, maximality is soft-only, invalidation/Wild-tiebreak behaviour is hardcoded, result naming/immutability differ (D-1/8/9/13) |
| `canonical.py` | compatible | sorted-key canonical JSON + SHA-256 per §7.11/NFR-1; verify `default=str` never silently stringifies a value that ought to fail |
| `provenance.py` | compatible | supports the §4.6 provenance vocabulary; wire `is_valid_provenance` into state loading |
| `legality.py` | **missing** | design §2 mandates it; behaviour presently inside `resolver.py` |
| `reports.py`, `cli.py` | **missing** | VS1 reporting/CLI (REQ-14, §13); task 13 |
| `enumerate.py`, `dominance.py`, `matrix.py`, `equilibrium.py`, `metrics.py` | **missing** | VS2 laboratory (REQ-10–13, §8–§12); tasks 16–23 |

## 9. Discrepancy register (backing detail)

Severity: **H** blocks an acceptance criterion · **M** design-boundary/semantic · **L** cosmetic.

| ID | Sev | Summary | Requirement | Owning task |
|---|---|---|---|---|
| D-1 | M | `legality.py` folded into resolver | REQ-4, REQ-7 | 6, 9 |
| D-2 | H | tiebreak token names + conflated/incorrect ratio denominators + no `breadth` | REQ-8 | 8 |
| D-3 | M | `first_place_trial_count` vs `first_place_trial_wins` | REQ-8.2 | 8, 9 |
| D-4 | M | invalidation vocabulary + default Wild-over-allocation behaviour | REQ-5 | 7 |
| D-5 | H | enchantment-table indexing inconsistency inside design §5.1 vs REQ-3.4 | REQ-3 | 4 |
| D-6 | M | config JSON power-schema shape differs from §5.1; legacy profile unshown | REQ-1, REQ-3 | 3, 4, 10 |
| D-7 | M | `ast` string evaluation vs validated operators | REQ-3 | 4 |
| D-8 | H | maximality is a soft warning, not a constructive proof | REQ-4.5 | 6 |
| D-9 | L/M | result field naming + mutable-not-frozen records | NFR-2 | 3, 9 |
| D-10 | L | no typed exception hierarchy | NFR-4 | 3–9 |
| D-11 | M | no contradictory-eligibility / state-closure validation | REQ-2.6, REQ-7 | 3, 9 |
| D-12 | L | `independent_score` wrapper vs `int` | REQ-3.5 | 4 |
| D-13 | H | large parse-only config surface → behaviour hardcoded (esp. Wild-in-tiebreak, invalidation actions) | REQ-1.5, REQ-5, REQ-6.5 | 7, 8 |

None of these is irrecoverable: they are renames, one module split (`legality.py`), two
schema-shape reconciliations (D-5 config, D-6 power), the ratio-semantics fix (D-2), the
maximality proof (D-8), and wiring the parsed-but-ignored config surface (D-13). All are
resolved inside tasks 3–9 and proven by task 12.

## 10. Proposed task status (never "complete")

Labels: `not started` · `implemented but unverified` · `partially verified`. "Complete"
requires passing acceptance tests — **none have been written or run**, so no task is complete.

| Task | Title | Proposed status | Basis |
|---|---|---|---|
| 1 | Reconcile existing implementation | **delivered — awaiting approval** | this note; box left unchecked pending requirements/design approval |
| 2 | Package & repo integration | implemented but unverified | pyproject/src/pytest/pins/outputs done; **manifest + doc relocation not started**; no test |
| 3 | Configuration schema | implemented but unverified | schema present but D-2/D-6/D-11 open; no schema tests |
| 4 | Spellbook + power derivation | implemented but unverified | both profiles present; Maya hand-checked only; D-5/D-6/D-7/D-12 open; no A16/A17 test |
| 5 | Declarative eligibility | implemented but unverified | conjunctive + Complete Mastery declarative; no eligibility tests |
| 6 | Allocation validation & completion | implemented but unverified | in resolver not `legality.py` (D-1); maximality-as-proof missing (D-8); A8 not authored |
| 7 | Invalidation & Wild | implemented but unverified | present; D-4/D-13 token/default/hardcoding open; A9/A10/A11 not authored |
| 8 | Tiebreak comparators | implemented but unverified | Fraction ratios present but D-2/D-3 open; `breadth` missing; A7/A12 not authored |
| 9 | Deterministic resolver | implemented but unverified | 13-step pipeline + audit hash present; A1/A2 + MATH-1..4/8a not run |
| 10 | Committed configurations | not started | no config files authored |
| 11 | VS1 fixture library | not started | no fixture data authored |
| 12 | VS1 acceptance suite | not started | no tests written or run |
| 13 | CLI + VS1 reports | not started | no `cli.py` / `reports.py` |
| 14 | VS1 housekeeping | not started | manifest/doc relocation/root-folder removal pending |
| 15 | VS1 approval gate | not started | — |
| 16–25 | VS2 (enumeration → gate) | not started | no VS2 modules |

## 11. Stop point

Task 1 is delivered. Per the approval gate (`requirements.md`) and the `tasks.md` execution
rule, **implementation does not resume** until requirements + design are approved and this
reconciliation is accepted. No implementation code was modified by this task.
