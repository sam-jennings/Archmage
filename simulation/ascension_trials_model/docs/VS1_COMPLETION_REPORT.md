---
title: Ascension Trials Configuration Model — VS1 Completion Report
type: spec-report
spec: ascension-trials-configuration-model
scope: VS1
updated: 2026-07-10
status: approved
approved: 2026-07-10
---

# VS1 Completion Report — Ascension Trials Configuration Model

This report is the **VS1 approval gate** (spec Task 15, REQ-14 / REQ-15). It is the
stop-for-review artifact for VS1 (the rules kernel): configuration loading, Spellbook
power derivation, legality, the deterministic resolver, the audit trace, and the
source-backed fixtures and tests. **VS2 (Tasks 16+ — allocation enumeration, strategic
collapse, payoff matrices, dominance, numerical equilibrium) has not been started.**

- **Spec:** `.kiro/specs/ascension-trials-configuration-model/`
- **Package:** `simulation/ascension_trials_model/`
- **Code revision:** `71cad20` (`71cad202871eaed3ac864a1e6c1310818094b0ed`)
- **Python:** CPython 3.13 (package requires `>=3.12`)

---

## 1. Requirements coverage

Every VS1 functional requirement (REQ-1..REQ-9, REQ-14, REQ-15) maps to specific tests.
The authoritative, machine-checked source is the `REQUIREMENT_COVERAGE` map in
`tests/test_vs1_acceptance.py`; it is reproduced below. Two audit tests keep the map
honest so it cannot silently rot:

- `test_coverage_map_covers_every_vs1_requirement` — every VS1 requirement has at least one mapped test;
- `test_coverage_map_references_only_existing_tests` — every referenced `(module, test)` is importable and defined;
- `test_every_committed_fixture_has_an_end_to_end_acceptance_test` — each REQ-9.2 fixture has an end-to-end run.

Notation: `module::test`, where `module` is a file under `tests/` and `self` is
`test_vs1_acceptance.py`.

| Requirement | Covering tests |
|---|---|
| **REQ-1** Data-driven configuration representation | `test_committed_configs::test_committed_config_validates`, `test_all_six_committed_configs_present`, `test_hybrid_rebuild_is_experimental_candidate`; `test_schema::test_base_config_is_valid`, `test_unknown_top_level_field_rejected`, `test_missing_required_field_rejected`, `test_legacy_piecewise_power_profile_is_valid`; `self::test_a2_acceptance` |
| **REQ-2** Declarative Trial eligibility | `test_eligibility::test_energy_purity_qualifies_single_energy_source`, `test_complete_mastery_qualifies_one_of_each_class`, `test_source_count_universe_distinguishes_all_normal_allowed_and_class`, `test_wild_only_entry_is_illegal`; `test_schema::test_complete_mastery_declarative_is_valid`, `test_min_sources_greater_than_max_rejected`, `test_source_count_universes_accepted` |
| **REQ-3** Spellbook representation & power derivation | `test_power_derivation::test_maya_current_candidate_v28_oracle`, `test_maya_experimental_2n3_oracle_matches_A16`, `test_power_profile_version_recorded`; `test_scoring::test_maya_standard_score`, `test_loads_current_reference_version`; `test_scoring_power_independence::test_changing_score_table_changes_q_not_F`, `test_changing_power_profile_changes_F_not_q`; `self::test_a16_maya_full_resolution_against_hybrid_rebuild`, `self::test_a17_acceptance` |
| **REQ-4** Allocation validation & residue | `test_legality::test_ledger_identity_holds_for_every_source`, `test_over_allocation_is_recorded_and_never_clipped`, `test_optional_completion_accepts_any_legal_residue`, `test_full_completion_satisfied_when_residue_zero`, `test_maximal_when_no_residual_unit_can_be_added`, `test_non_maximal_names_legal_destination_same_domain`; `self::test_a8_acceptance`, `self::test_a16_maya_full_resolution_against_hybrid_rebuild` |
| **REQ-5** Invalid-entry / invalid-domain behaviour | `test_invalidation::test_illegal_entry_ignore_action_does_not_contend_and_is_traced`, `test_overallocated_domain_invalidates_every_entry_using_that_domain`, `test_wild_overallocation_invalidate_entries_using_wild`, `test_malformed_allocation_rejects_profile_and_traces`, `test_wild_dropped_when_normal_entry_is_illegal`, `test_invalidation_event_records_player_subject_reason_and_affected_entries`; `self::test_a11_acceptance` |
| **REQ-6** Wild semantics | `test_invalidation::test_wild_increases_primary_total_only_after_a_legal_normal_entry`, `test_wild_excluded_from_local_tiebreak_statistics_by_default`, `test_wild_cannot_enter_without_a_legal_normal_entry`; `test_eligibility::test_wild_does_not_satisfy_source_minimum`, `test_wild_never_changes_the_verdict`; `self::test_a10_acceptance` |
| **REQ-7** Deterministic resolver | `test_resolver::test_a1_player_relabelling_commutes`, `test_a2_energy_domain_relabelling_commutes`, `test_determinism_repeated_runs_are_identical`, `test_determinism_is_independent_of_input_key_order`, `test_audit_hash_depends_on_each_documented_input`, `test_rp_traceable_sole_first_and_lower_place`, `test_infeasible_full_allocation_fails_explicitly_without_repair`; `self::test_a1_acceptance`, `self::test_a16_maya_full_resolution_against_hybrid_rebuild` |
| **REQ-8** Tiebreak vocabulary & semantics | `test_comparators::test_total_power_is_the_local_trial_total`, `test_normal_power_excludes_wild`, `test_legacy_utilization_numerator_and_denominator`, `test_hybrid_commitment_uses_total_spellbook_normal`, `test_local_comparators_accept_only_the_trial_view`, `test_ratio_semantics_are_documented_and_labelled_historical`, `test_final_tokens_read_their_declared_sources`; `self::test_a7_acceptance`, `self::test_a12_acceptance` |
| **REQ-9** Configuration & fixture library | `test_committed_configs::test_all_six_committed_configs_present`, `test_baseline_historical_and_stale_metadata`, `test_baseline_power_profile_is_current_candidate_not_stale`; `test_fixture_library::test_fixture_library_is_exactly_the_req_9_2_set`, `test_required_fixture_carries_provenance_and_oracle_metadata`, `test_required_fixture_carries_expected_oracle_block` |
| **REQ-14** Reports & evidence labelling | `test_fixture_library::test_required_fixture_carries_provenance_and_oracle_metadata`; `test_scoring_power_independence::test_derived_state_records_both_provenances`; `test_scoring::test_independent_score_carries_provenance`; `test_power_derivation::test_power_profile_version_recorded`; `self::test_provenance_and_evidence_labelling`. **Report *generation* (CLI JSON/Markdown + hard-gate table, REQ-14.1/14.4/14.5) is delivered by Task 13** — see `tests/test_cli_reports.py`. |
| **REQ-15** Repository integration & reproducibility | `test_package_import::test_package_imports_and_exposes_version`, `test_core_modules_import`; `self::test_repository_integration_layout`. **Repo integration (package layout in `simulation/ascension_trials_model/`, doc relocation, cross-references, checker warning) is delivered by Tasks 2 and 14** (see `meta/decisions/2026-07-10-ascension-trials-housekeeping.md`). |

### Non-functional requirements

| NFR | Status in VS1 |
|---|---|
| **NFR-1** Determinism | Covered — `test_resolver::test_determinism_repeated_runs_are_identical`, `test_determinism_is_independent_of_input_key_order`, `test_audit_hash_depends_on_each_documented_input`; `self::test_a1_acceptance` (player-swap hash invariance). Ordering, serialization and hashing are independent of Python hash/dict order. |
| **NFR-2** Purity | Covered — the resolver is pure (integer + `fractions.Fraction`, no UI/DB/network/mutable global state); exercised by `test_resolver` and `test_package_import`. |
| **NFR-3** Numerical transparency | **VS2-scoped, not exercised in VS1.** VS1 has no floating-point path; NumPy/SciPy are pinned in `requirements.lock` for VS2 but unused by the resolver. |
| **NFR-4** Failure visibility | Covered — `self::test_a8_acceptance` (infeasible fullness → explicit reject or residue-with-warning fallback) and `test_resolver::test_infeasible_full_allocation_fails_explicitly_without_repair`. |
| **NFR-5** Extensibility | Design-level (VS3–VS6 reuse the same config/state/allocation/resolver interfaces); not a directly-tested VS1 behaviour. |

---

## 2. Test command and output

Run from `simulation/ascension_trials_model/`:

```bash
python -m pytest -q
```

Result (full summary line):

```
378 passed in 1.40s
```

Exit code `0`. The suite spans the 14 `test_*.py` modules under `tests/` (per-module unit
suites plus the consolidated `test_vs1_acceptance.py` gate). No skips, no xfails, no warnings
in the pytest summary.

---

## 3. Fixture results

All ten committed VS1 fixtures (REQ-9.2) are loaded from their **data files** and driven
end-to-end through derivation/resolution; each assertion is the fixture's own committed,
source-backed oracle (its `expected` block), never engine output (REQ-9.4). All pass.

| Fixture | Scenario | What it proves | Status |
|---|---|---|---|
| **A1** | Mirror tie | Shared first place; player-swap is audit-hash invariant (REQ-7) | PASS |
| **A2** | Domain relabel | Equivalent energy-domain relabelling commutes with resolution (REQ-7.4, REQ-1) | PASS |
| **A7** | Monotonicity trap | Historical ratio tiebreaks resolve to their committed profiles (REQ-8) | PASS |
| **A8** | Infeasible fullness | `reject` vs `residue`-with-warning fallback (REQ-4.6, NFR-4) | PASS |
| **A9** | Penny squat | Uncontested full reward under maximal completion (REQ-4/REQ-7) | PASS |
| **A10** | Wild legality trio | Wild cannot legalize/enter without a legal normal entry; adds to total only after (REQ-6) | PASS |
| **A11** | Over-allocation | Whole-domain invalidation scope + complete invalidation trace (REQ-5) | PASS |
| **A12** | Tiebreak cascade | Multi-stage tiebreak ordering + shared-first reward suppression (REQ-8) | PASS |
| **A16** | Maya worked example | Full MATH-3 resolution against `configs/hybrid_rebuild.json` (REQ-3/4/7/9.4) | PASS |
| **A17** | Formula comparison | F_C(S) difference isolated to the power profile; experimental label preserved (REQ-3) | PASS |

### A16 — Maya full-resolution totals

Maya's Spellbook (7-card Void Conjuration, 5-card Transfiguration, 4-card Enchantment,
6-card Aether Perfect Transmutation) derived under the **experimental** hybrid `2n-3`
profile carried by `configs/hybrid_rebuild.json` gives F_C(S) = **Void 11, Aether 9,
Transformation 16, Enchantment 8, Wild 2**. Resolving her source-backed secret three-Trial
allocation at 5 players reproduces the committed Trial totals and exhausts every ledger
exactly (no residue):

| Trial | Total power | Oracle |
|---|---|---|
| Transformation Mastery | **10** | 10 |
| Complete Mastery | **21** | 21 |
| Energy Harmony | **15** | 15 |

Ledger exhaustion: Void 11/11, Aether 9/9, Transformation 16/16, Enchantment 8/8, Wild 2/2;
`residue = {normal: 0, wild: 0}`. She entered exactly those three Trials; the other active
Trials (`energy_purity`, `enchantment_mastery`, `focused_power`, `universal_power`) carry no
entry. (`self::test_a16_maya_full_resolution_against_hybrid_rebuild`.)

---

## 4. Unresolved warnings

Listed honestly. None block the VS1 gate; each is either by-design or a pre-existing,
unrelated content-hygiene flag.

1. **`baseline_v28_stale` historical-ratio-tiebreak validation warnings — expected / by-design.**
   `python -m ascension_trials validate-config configs/baseline_v28_stale.json` returns
   `result: VALID` with **14 warnings**, two per Trial (`legacy_utilization`, `legacy_focus`):

   > `trial <id>: ratio tiebreak '<token>' is a historical convention expected to expose monotonicity failures (model §8.1)`

   These are deliberate: the historical v2.8 baseline uses ratio tiebreaks the model documents
   as non-monotonic, and the loader surfaces that fact rather than hiding it. The configuration
   is valid; the warnings are the intended signal (REQ-8.5 historical labelling).

2. **`meta/QUEUE.md` content flags (2) — noted in the housekeeping decision, out of scope here.**
   Recorded in `meta/decisions/2026-07-10-ascension-trials-housekeeping.md` ("Note for next
   session"):
   - a stale reference to `expansion/Ascension Trials Configuration Model.docx` (Master-plan-chain
     section) — that file does not exist anywhere in the repo; a leftover from before the model
     was written up as `.md` snapshots;
   - the Deferred section still lists "Ascension Trials" among parked Stage-4+ expansion concepts,
     which contradicts the standing F8 decision (`2026-07-06-f8-ascension-trials-reconcile.md`)
     that AT is an **active**, not parked, workstream.

   Both are content-judgment calls, not path breakages, and were intentionally left for whoever
   next edits those QUEUE lines.

3. **`2026-07-06-at-entry-model-secret-allocation.md` propagation flag — unrelated.**
   `node meta/checks/check.mjs` reports one open propagation item on this canon decision. It is
   unrelated to this spec's VS1 deliverables and predates Task 15.

---

## 5. Repository-check result

Run from the repo root:

```bash
node meta/checks/check.mjs
```

The checker prints the session brief and exits `1` **solely because of the pre-existing,
unrelated propagation flag** below — there is **no structure / undeclared-folder warning** and
no new drift from VS1:

```
FLAGS:
  ! [decisions] 2026-07-06-at-entry-model-secret-allocation.md: 1 open propagation item(s) on a canon decision — make the edits (or revert), then tick the boxes
```

The former undeclared root `Ascension Trials/` folder warning is gone (cleared by Task 14 /
the 2026-07-10 housekeeping decision). Adding this report under
`simulation/ascension_trials_model/docs/` introduced **no** new checker flag — the checker
validates top-level folder structure and specific filename patterns (playtests, skills,
`meta/decisions`, `meta/threads`), and `docs/` is already part of the declared package layout
(`meta/manifest.yml` `purposes`), so no manifest edit was required.

---

## 6. Exact VS1 file list

### Packaging / top level (`simulation/ascension_trials_model/`)
- `pyproject.toml` — package metadata; VS1 is pure-stdlib (`dependencies = []`); `pytest` and the VS2 `numpy`/`scipy` extras pinned here
- `requirements.lock` — exact pins: `pytest==9.0.3`, `numpy==2.3.3`, `scipy==1.16.0` (NumPy/SciPy for VS2)
- `README.md`

### Source modules (`src/ascension_trials/`)
- `__init__.py` (`__version__ = "0.1.0"`)
- `__main__.py` (CLI entry point)
- `schema.py`
- `config_loader.py`
- `spellbook.py`
- `power.py` — Trials domain power F_C(S)
- `scoring.py` — standard Recognition Points q(S)
- `eligibility.py`
- `legality.py`
- `comparators.py`
- `resolver.py`
- `canonical.py`
- `provenance.py`
- `reports.py`
- `cli.py`

### Tests (`tests/`)
- `conftest.py`
- `test_package_import.py`
- `test_schema.py`
- `test_eligibility.py`
- `test_power_derivation.py`
- `test_scoring.py`
- `test_scoring_power_independence.py`
- `test_legality.py`
- `test_invalidation.py`
- `test_comparators.py`
- `test_resolver.py`
- `test_committed_configs.py`
- `test_fixture_library.py`
- `test_cli_reports.py`
- `test_vs1_acceptance.py` — the consolidated VS1 acceptance gate + `REQUIREMENT_COVERAGE`

### Configurations (`configs/`) — the six committed configs (REQ-9.1)
- `baseline_v28_stale.json` (historical candidate; stale by design)
- `hybrid_rebuild.json`
- `toy/turtle_5_3.json`
- `toy/cycle_5_4_3.json`
- `toy/tie_fest_5_5.json`
- `toy/equal_4_4_4.json`
- `.gitkeep`

### Fixtures (`fixtures/`) — the ten VS1 fixtures (REQ-9.2) + 3 shared worked-example data files
- `adversarial/a1_mirror_tie.json`
- `adversarial/a2_domain_relabel.json`
- `adversarial/a7_monotonicity_trap.json`
- `adversarial/a8_infeasible_fullness.json`
- `adversarial/a9_penny_squat.json`
- `adversarial/a10_wild_legality.json`
- `adversarial/a11_overallocation.json`
- `adversarial/a12_tiebreak_cascade.json`
- `worked_examples/a16_maya_worked_example.json`
- `worked_examples/a17_formula_comparison.json`
- `worked_examples/maya_spellbook.json` (shared Spellbook data for A16/A17)
- `worked_examples/trials_power_v28.json` (current-candidate profile data for A17)
- `worked_examples/hybrid_2n_minus_3_experimental.json` (experimental profile data for A16/A17)
- `.gitkeep`

### Docs (`docs/`)
- `README.md` — disposition/index of the normative sources
- `ASCENSION_TRIALS_CONFIGURATION_MODEL_V2_1.md` — normative model source
- `ASCENSION_TRIALS_KIRO_IMPLEMENTATION_SPEC_V1_1.md` — implementation spec source
- `VS1_COMPLETION_REPORT.md` — this report

### Canonical spec (referenced, not copied) — `.kiro/specs/ascension-trials-configuration-model/`
- `requirements.md`, `design.md`, `tasks.md`, `tasks.meta.json`, `task-1-reconciliation.md`

---

## 7. Gate decision

VS1 is complete and green: `378 passed`, all ten fixtures reproduce their source-backed
oracles (including the A16 totals 10 / 21 / 15), the repository checker shows no structure
drift, and every VS1 requirement is mapped to a test. The only open items are the by-design
baseline warnings and pre-existing, unrelated QUEUE / decision-propagation flags.

**Stop for review. VS2 (Tasks 16+) has not been started and will not begin without approval.**

---

## 8. Gate approval (2026-07-10)

**VS1 approved.** The gate criteria are satisfied: 378 tests pass; all ten VS1 fixtures
reproduce their committed, source-backed oracles; every VS1 requirement is represented in
the coverage map; q(S) and F_C(S) are independently modelled and tested; the resolver and
reports are deterministic; repository structure drift is cleared; and the remaining warnings
are by-design (historical baseline ratio tiebreaks) or unrelated pre-existing project flags.
VS2 (Tasks 16–25) is authorized to proceed to its own approval gate (Task 25).
