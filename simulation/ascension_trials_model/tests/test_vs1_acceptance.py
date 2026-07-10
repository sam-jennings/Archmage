"""Task 12 - the consolidated VS1 acceptance suite (REQ-1..REQ-9, REQ-14, REQ-15).

This module is the single VS1 acceptance gate. It does three things the per-module
suites (test_schema, test_eligibility, test_legality, test_invalidation,
test_comparators, test_resolver, test_power_derivation, test_scoring,
test_scoring_power_independence, test_committed_configs, test_fixture_library) do
not:

  1. REQUIREMENT -> TEST COVERAGE MAP (auditable). ``REQUIREMENT_COVERAGE`` maps
     every VS1 requirement to the specific tests that exercise it, across the whole
     suite. Two audit tests keep the map honest: every VS1 requirement is covered,
     and every referenced test actually exists (so the map cannot silently rot).

  2. END-TO-END FIXTURE ORACLE RUNS. Every committed fixture (A1, A2, A7, A8, A9,
     A10, A11, A12, A16, A17) is loaded from its DATA file and driven through
     derivation/resolution; the assertions are its committed source-backed oracle
     (the fixture's own ``expected`` block, REQ-9.4), not engine output. The
     per-module suites test mechanisms and edge cases; this suite proves each
     committed oracle reproduces end-to-end, and ties the mechanism tests to
     requirements via the coverage map rather than duplicating them.

  3. THE A16 MATH-3 FULL RESOLUTION (deferred by Tasks 4/9). The Maya Spellbook is
     derived against ``configs/hybrid_rebuild.json`` and her source-backed secret
     three-Trial allocation is resolved through ``resolve_profile`` at 5 players,
     confirming the committed Trial totals (Transformation Mastery 10, Complete
     Mastery 21, Energy Harmony 15) and full-ledger exhaustion.

Scope note. REQ-14 report *generation* (CLI JSON/Markdown, the hard-gate table -
REQ-14.1/14.4/14.5) is delivered by Task 13, and REQ-15 doc relocation + checker
warning (REQ-15.6/15.7) by Task 14. This VS1 suite covers the portions those
requirements already deliver: the q(S)/F_C(S) provenance and evidence-class
labelling the resolver/derivation and fixtures produce (REQ-14.2/14.3), and the
package layout, dependency pinning and ignored-outputs integration
(REQ-15.1/15.2/15.3/15.4).

Requirement -> test coverage map
--------------------------------
REQ-1  Data-driven configuration representation
    committed configs load+validate; strict unknown/missing-field rejection;
    historical vs experimental candidate metadata.
REQ-2  Declarative, conjunctive Trial eligibility (incl. Complete Mastery, Wild
    is never a source, contradiction detection).
REQ-3  Spellbook power derivation: q(S) from the scoring reference, F_C(S) from the
    Trials power profile, the two independent and separately provenanced; Maya
    oracles under both profiles.
REQ-4  Allocation ledger reconciliation, completion policies, maximality, the
    infeasible-full fallback (A8), never-clipped over-allocation.
REQ-5  Invalidation policies (illegal entry, over-allocated domain/Wild, malformed
    allocation) and the complete invalidation trace (A11).
REQ-6  Wild semantics: not a source, cannot satisfy a minimum / break a mono, adds
    to the primary total only after a legal normal entry, excluded from tiebreaks
    by default (A10).
REQ-7  Deterministic resolver: player/domain relabelling commute (A1, A2),
    determinism + audit hash, RP traceability, explicit infeasible failure.
REQ-8  Tiebreak vocabulary + exact-Fraction semantics, local vs historical, final
    tokens; the A7 monotonicity trap and A12 tie-cascade.
REQ-9  Committed configuration + fixture library, historical metadata, oracle
    provenance / independence.
REQ-14 q(S)+F_C(S) provenance and evidence-class labelling (report generation is
    Task 13).
REQ-15 Package layout, NumPy/SciPy pinning, ignored outputs (doc relocation and
    checker warning are Task 14).

The authoritative, machine-checked map is ``REQUIREMENT_COVERAGE`` below.
"""

from __future__ import annotations

import importlib
import json
from pathlib import Path

import pytest

from ascension_trials import scoring
from ascension_trials.config_loader import (
    allocation_from_dict,
    config_from_dict,
    load_configuration,
    spellbook_from_dict,
    state_from_dict,
)
from ascension_trials.power import (
    derive_player_state,
    enchantment_power,
    standard_spell_power,
)
from ascension_trials.resolver import resolve_profile
from ascension_trials.schema import Allocation

# --------------------------------------------------------------------------- #
# Paths                                                                        #
# --------------------------------------------------------------------------- #

HERE = Path(__file__).resolve().parent
PKG = HERE.parent  # simulation/ascension_trials_model
REPO_ROOT = PKG.parent.parent  # <repo>/  (PKG.parent == simulation/)
FIXTURES = PKG / "fixtures"
ADVERSARIAL = FIXTURES / "adversarial"
WORKED = FIXTURES / "worked_examples"
CONFIGS = PKG / "configs"

# The complete VS1 fixture set (REQ-9.2) and the committed file for each id.
FIXTURE_FILES = {
    "A1": ADVERSARIAL / "a1_mirror_tie.json",
    "A2": ADVERSARIAL / "a2_domain_relabel.json",
    "A7": ADVERSARIAL / "a7_monotonicity_trap.json",
    "A8": ADVERSARIAL / "a8_infeasible_fullness.json",
    "A9": ADVERSARIAL / "a9_penny_squat.json",
    "A10": ADVERSARIAL / "a10_wild_legality.json",
    "A11": ADVERSARIAL / "a11_overallocation.json",
    "A12": ADVERSARIAL / "a12_tiebreak_cascade.json",
    "A16": WORKED / "a16_maya_worked_example.json",
    "A17": WORKED / "a17_formula_comparison.json",
}

# REQ-14.3 evidence-class vocabulary.
EVIDENCE_CLASSES = frozenset(
    {
        "theorem",
        "exact exhaustive",
        "exact-given-profile",
        "numerical LP",
        "numerical convex",
        "sampled",
        "design judgement",
    }
)


# --------------------------------------------------------------------------- #
# Requirement -> test coverage map (auditable)                                 #
# --------------------------------------------------------------------------- #
# Each entry is (test_module_stem, test_function_name). The audit tests below
# verify (a) every VS1 requirement is present and non-empty, and (b) every
# referenced test actually exists (importable + attribute present), so the map
# cannot drift away from the suite.

SELF = "test_vs1_acceptance"

REQUIREMENT_COVERAGE: dict[str, list[tuple[str, str]]] = {
    "REQ-1": [
        ("test_committed_configs", "test_committed_config_validates"),
        ("test_committed_configs", "test_all_six_committed_configs_present"),
        ("test_committed_configs", "test_hybrid_rebuild_is_experimental_candidate"),
        ("test_schema", "test_base_config_is_valid"),
        ("test_schema", "test_unknown_top_level_field_rejected"),
        ("test_schema", "test_missing_required_field_rejected"),
        ("test_schema", "test_legacy_piecewise_power_profile_is_valid"),
        (SELF, "test_a2_acceptance"),
    ],
    "REQ-2": [
        ("test_eligibility", "test_energy_purity_qualifies_single_energy_source"),
        ("test_eligibility", "test_complete_mastery_qualifies_one_of_each_class"),
        ("test_eligibility", "test_source_count_universe_distinguishes_all_normal_allowed_and_class"),
        ("test_eligibility", "test_wild_only_entry_is_illegal"),
        ("test_schema", "test_complete_mastery_declarative_is_valid"),
        ("test_schema", "test_min_sources_greater_than_max_rejected"),
        ("test_schema", "test_source_count_universes_accepted"),
    ],
    "REQ-3": [
        ("test_power_derivation", "test_maya_current_candidate_v28_oracle"),
        ("test_power_derivation", "test_maya_experimental_2n3_oracle_matches_A16"),
        ("test_power_derivation", "test_power_profile_version_recorded"),
        ("test_scoring", "test_maya_standard_score"),
        ("test_scoring", "test_loads_current_reference_version"),
        ("test_scoring_power_independence", "test_changing_score_table_changes_q_not_F"),
        ("test_scoring_power_independence", "test_changing_power_profile_changes_F_not_q"),
        (SELF, "test_a16_maya_full_resolution_against_hybrid_rebuild"),
        (SELF, "test_a17_acceptance"),
    ],
    "REQ-4": [
        ("test_legality", "test_ledger_identity_holds_for_every_source"),
        ("test_legality", "test_over_allocation_is_recorded_and_never_clipped"),
        ("test_legality", "test_optional_completion_accepts_any_legal_residue"),
        ("test_legality", "test_full_completion_satisfied_when_residue_zero"),
        ("test_legality", "test_maximal_when_no_residual_unit_can_be_added"),
        ("test_legality", "test_non_maximal_names_legal_destination_same_domain"),
        (SELF, "test_a8_acceptance"),
        (SELF, "test_a16_maya_full_resolution_against_hybrid_rebuild"),
    ],
    "REQ-5": [
        ("test_invalidation", "test_illegal_entry_ignore_action_does_not_contend_and_is_traced"),
        ("test_invalidation", "test_overallocated_domain_invalidates_every_entry_using_that_domain"),
        ("test_invalidation", "test_wild_overallocation_invalidate_entries_using_wild"),
        ("test_invalidation", "test_malformed_allocation_rejects_profile_and_traces"),
        ("test_invalidation", "test_wild_dropped_when_normal_entry_is_illegal"),
        ("test_invalidation", "test_invalidation_event_records_player_subject_reason_and_affected_entries"),
        (SELF, "test_a11_acceptance"),
    ],
    "REQ-6": [
        ("test_invalidation", "test_wild_increases_primary_total_only_after_a_legal_normal_entry"),
        ("test_invalidation", "test_wild_excluded_from_local_tiebreak_statistics_by_default"),
        ("test_invalidation", "test_wild_cannot_enter_without_a_legal_normal_entry"),
        ("test_eligibility", "test_wild_does_not_satisfy_source_minimum"),
        ("test_eligibility", "test_wild_never_changes_the_verdict"),
        (SELF, "test_a10_acceptance"),
    ],
    "REQ-7": [
        ("test_resolver", "test_a1_player_relabelling_commutes"),
        ("test_resolver", "test_a2_energy_domain_relabelling_commutes"),
        ("test_resolver", "test_determinism_repeated_runs_are_identical"),
        ("test_resolver", "test_determinism_is_independent_of_input_key_order"),
        ("test_resolver", "test_audit_hash_depends_on_each_documented_input"),
        ("test_resolver", "test_rp_traceable_sole_first_and_lower_place"),
        ("test_resolver", "test_infeasible_full_allocation_fails_explicitly_without_repair"),
        (SELF, "test_a1_acceptance"),
        (SELF, "test_a16_maya_full_resolution_against_hybrid_rebuild"),
    ],
    "REQ-8": [
        ("test_comparators", "test_total_power_is_the_local_trial_total"),
        ("test_comparators", "test_normal_power_excludes_wild"),
        ("test_comparators", "test_legacy_utilization_numerator_and_denominator"),
        ("test_comparators", "test_hybrid_commitment_uses_total_spellbook_normal"),
        ("test_comparators", "test_local_comparators_accept_only_the_trial_view"),
        ("test_comparators", "test_ratio_semantics_are_documented_and_labelled_historical"),
        ("test_comparators", "test_final_tokens_read_their_declared_sources"),
        (SELF, "test_a7_acceptance"),
        (SELF, "test_a12_acceptance"),
    ],
    "REQ-9": [
        ("test_committed_configs", "test_all_six_committed_configs_present"),
        ("test_committed_configs", "test_baseline_historical_and_stale_metadata"),
        ("test_committed_configs", "test_baseline_power_profile_is_current_candidate_not_stale"),
        ("test_fixture_library", "test_fixture_library_is_exactly_the_req_9_2_set"),
        ("test_fixture_library", "test_required_fixture_carries_provenance_and_oracle_metadata"),
        ("test_fixture_library", "test_required_fixture_carries_expected_oracle_block"),
    ],
    "REQ-14": [
        ("test_fixture_library", "test_required_fixture_carries_provenance_and_oracle_metadata"),
        ("test_scoring_power_independence", "test_derived_state_records_both_provenances"),
        ("test_scoring", "test_independent_score_carries_provenance"),
        ("test_power_derivation", "test_power_profile_version_recorded"),
        (SELF, "test_provenance_and_evidence_labelling"),
    ],
    "REQ-15": [
        ("test_package_import", "test_package_imports_and_exposes_version"),
        ("test_package_import", "test_core_modules_import"),
        (SELF, "test_repository_integration_layout"),
    ],
}

VS1_REQUIREMENTS = [f"REQ-{n}" for n in range(1, 10)] + ["REQ-14", "REQ-15"]

# Each committed fixture maps to its end-to-end acceptance test in this module.
FIXTURE_ACCEPTANCE_TESTS = {
    "A1": "test_a1_acceptance",
    "A2": "test_a2_acceptance",
    "A7": "test_a7_acceptance",
    "A8": "test_a8_acceptance",
    "A9": "test_a9_acceptance",
    "A10": "test_a10_acceptance",
    "A11": "test_a11_acceptance",
    "A12": "test_a12_acceptance",
    "A16": "test_a16_maya_full_resolution_against_hybrid_rebuild",
    "A17": "test_a17_acceptance",
}


# --------------------------------------------------------------------------- #
# Loaders / helpers                                                            #
# --------------------------------------------------------------------------- #


def load_fixture(fixture_id: str) -> dict:
    return json.loads(FIXTURE_FILES[fixture_id].read_text(encoding="utf-8"))


def load_worked(name: str) -> dict:
    return json.loads((WORKED / name).read_text(encoding="utf-8"))


def _states(mapping: dict) -> dict:
    return {pid: state_from_dict(raw) for pid, raw in mapping.items()}


def _allocs(mapping: dict) -> dict:
    return {pid: allocation_from_dict(raw) for pid, raw in mapping.items()}


def _trial(result, trial_id: str):
    return next(t for t in result.trial_results if t.trial_id == trial_id)


def _recognition(result) -> dict:
    return {pid: pr.recognition_points for pid, pr in result.player_results.items()}


def _swap_players(mapping: dict, swap: dict) -> dict:
    out = {}
    for pid, raw in mapping.items():
        new = dict(raw)
        new["player_id"] = swap[raw["player_id"]]
        out[swap[pid]] = new
    return out


def _relabel_state_domains(raw: dict, relabel: dict) -> dict:
    out = dict(raw)
    out["normal_power"] = {relabel.get(d, d): p for d, p in (raw.get("normal_power") or {}).items()}
    return out


def _relabel_alloc_domains(raw: dict, relabel: dict) -> dict:
    out = dict(raw)
    out["normal"] = {
        t: {relabel.get(d, d): p for d, p in doms.items()}
        for t, doms in (raw.get("normal") or {}).items()
    }
    res = raw.get("residue", {})
    out["residue"] = {
        "normal": {relabel.get(d, d): p for d, p in (res.get("normal") or {}).items()},
        "wild": res.get("wild", 0),
    }
    return out


# --------------------------------------------------------------------------- #
# Coverage-map audit (auditable requirement -> test map)                       #
# --------------------------------------------------------------------------- #


def test_coverage_map_covers_every_vs1_requirement():
    """Every VS1 requirement (REQ-1..9, REQ-14, REQ-15) has at least one mapped
    test, and no unexpected requirement leaks in."""
    assert set(REQUIREMENT_COVERAGE) == set(VS1_REQUIREMENTS)
    for req in VS1_REQUIREMENTS:
        assert REQUIREMENT_COVERAGE[req], f"{req} has no mapped tests"


def test_coverage_map_references_only_existing_tests():
    """Every (module, test) the coverage map points at is importable and defined,
    so the map cannot silently rot as the suite evolves."""
    missing = []
    for req, refs in REQUIREMENT_COVERAGE.items():
        for module_name, func_name in refs:
            module = importlib.import_module(module_name)
            if not hasattr(module, func_name):
                missing.append(f"{req}: {module_name}::{func_name}")
    assert not missing, "coverage map references non-existent tests:\n" + "\n".join(missing)


def test_every_committed_fixture_has_an_end_to_end_acceptance_test():
    """Each REQ-9.2 fixture (A1, A2, A7-A12, A16, A17) is driven end-to-end here."""
    assert set(FIXTURE_ACCEPTANCE_TESTS) == set(FIXTURE_FILES)
    module = importlib.import_module(SELF)
    for fixture_id, func_name in FIXTURE_ACCEPTANCE_TESTS.items():
        assert hasattr(module, func_name), f"{fixture_id}: missing acceptance test {func_name}"


# --------------------------------------------------------------------------- #
# A1 - mirror tie: shared first + player-swap audit-hash invariance (REQ-7)     #
# --------------------------------------------------------------------------- #


def test_a1_acceptance():
    fx = load_fixture("A1")
    cfg = config_from_dict(fx["config"])
    exp = fx["expected"]

    result = resolve_profile(
        cfg, _states(fx["states"]), _allocs(fx["allocations"]), player_count=fx["player_count"]
    )
    assert result.validation.valid, " || ".join(result.validation.errors)

    tr = _trial(result, exp["trial"])
    assert tr.shared_first is exp["shared_first"]
    assert tr.placements == exp["placements"]
    assert _recognition(result) == exp["recognition"]
    assert result.win_utility == exp["win_utility"]
    assert result.margin_utility == exp["margin_utility"]

    # Player-swap symmetry: swapping the two identical players is hash-invariant.
    swap = exp["player_swap_symmetry"]["swap"]
    swapped = resolve_profile(
        cfg,
        _states(_swap_players(fx["states"], swap)),
        _allocs(_swap_players(fx["allocations"], swap)),
        player_count=fx["player_count"],
    )
    assert swapped.deterministic_hash == result.deterministic_hash


# --------------------------------------------------------------------------- #
# A2 - equivalent energy-domain relabel is isomorphic (REQ-7.4, REQ-1)          #
# --------------------------------------------------------------------------- #


def test_a2_acceptance():
    fx = load_fixture("A2")
    cfg = config_from_dict(fx["config"])
    exp = fx["expected"]

    base = resolve_profile(
        cfg, _states(fx["states"]), _allocs(fx["allocations"]), player_count=fx["player_count"]
    )
    assert base.validation.valid, " || ".join(base.validation.errors)
    assert _recognition(base) == exp["recognition"]
    assert base.win_utility == exp["win_utility"]
    assert base.margin_utility == exp["margin_utility"]
    for trial_id, meta in exp["trials"].items():
        assert _trial(base, trial_id).placements[0] == [meta["winner"]]

    # Relabel the two symmetry-group-equivalent energy domains everywhere.
    relabel = exp["relabel_invariance"]["relabel"]
    raw_cfg = json.loads(json.dumps(fx["config"]))
    for d in raw_cfg["domains"]:
        d["id"] = relabel.get(d["id"], d["id"])
    cfg2 = config_from_dict(raw_cfg)
    states2 = _states({p: _relabel_state_domains(s, relabel) for p, s in fx["states"].items()})
    allocs2 = _allocs({p: _relabel_alloc_domains(a, relabel) for p, a in fx["allocations"].items()})
    relabelled = resolve_profile(cfg2, states2, allocs2, player_count=fx["player_count"])

    # Player-facing outcomes are domain-name independent -> identical (isomorphic).
    assert _recognition(relabelled) == exp["recognition"]
    assert relabelled.win_utility == exp["win_utility"]
    assert relabelled.margin_utility == exp["margin_utility"]


# --------------------------------------------------------------------------- #
# A7 - ratio monotonicity trap: the committed resolver profiles (REQ-8)         #
# --------------------------------------------------------------------------- #


def test_a7_acceptance():
    fx = load_fixture("A7")
    for res in fx["resolutions"]:
        cfg = config_from_dict(fx["configs"][res["config"]])
        result = resolve_profile(
            cfg,
            _states(fx["states"][res["state"]]),
            _allocs(fx["allocations"][res["state"]]),
            player_count=fx["player_count"],
        )
        assert result.validation.valid, " || ".join(result.validation.errors)
        exp = res["expected"]
        tr = _trial(result, "purity")
        assert tr.shared_first is exp["shared_first"], res["name"]
        if exp["sole_first"] is None:
            assert tr.placements[0] == ["A", "B"], res["name"]
        else:
            assert tr.placements[0] == [exp["sole_first"]], res["name"]
        assert _recognition(result) == exp["recognition"], res["name"]
        assert result.win_utility == exp["win_utility"], res["name"]


# --------------------------------------------------------------------------- #
# A8 - infeasible fullness: reject vs residue fallback (REQ-4.6, NFR-4)         #
# --------------------------------------------------------------------------- #


def _a8_parts(fx: dict, fallback: str):
    raw_cfg = json.loads(json.dumps(fx["config"]))
    raw_cfg["allocation"]["infeasible_full_fallback"] = fallback
    cfg = config_from_dict(raw_cfg)
    st = state_from_dict(fx["state"])
    al = allocation_from_dict(fx["allocation"])
    return cfg, {st.player_id: st}, {al.player_id: al}


def test_a8_acceptance():
    fx = load_fixture("A8")
    exp = fx["expected"]

    cfg_r, states_r, allocs_r = _a8_parts(fx, "reject")
    reject = resolve_profile(cfg_r, states_r, allocs_r, player_count=fx["player_count"])
    assert reject.validation.valid is exp["fallback_reject"]["valid"]
    assert any(exp["fallback_reject"]["error_contains"] in e for e in reject.validation.errors)

    cfg_x, states_x, allocs_x = _a8_parts(fx, "residue")
    residue = resolve_profile(cfg_x, states_x, allocs_x, player_count=fx["player_count"])
    assert residue.validation.valid is exp["fallback_residue"]["valid"]
    assert any(exp["fallback_residue"]["warning_contains"] in w for w in residue.validation.warnings)


# --------------------------------------------------------------------------- #
# A9 - penny squat: uncontested full reward under maximal completion (REQ-4/7)  #
# --------------------------------------------------------------------------- #


def test_a9_acceptance():
    fx = load_fixture("A9")
    cfg = config_from_dict(fx["config"])
    exp = fx["expected"]

    result = resolve_profile(
        cfg, _states(fx["states"]), _allocs(fx["allocations"]), player_count=fx["player_count"]
    )
    assert result.validation.valid is exp["resolves"]
    assert (
        any("maximal completion violated" in w for w in result.validation.warnings)
        is exp["non_maximal_warning"]
    )
    tr = _trial(result, "purity")
    assert tr.uncontested is exp["purity"]["uncontested"]
    assert tr.legal_entries == exp["purity"]["legal_entries"]
    assert tr.rewards_awarded == {exp["purity"]["winner"]: exp["purity"]["reward"]}
    assert _recognition(result) == exp["recognition"]
    assert result.win_utility == exp["win_utility"]
    assert result.margin_utility == exp["margin_utility"]


# --------------------------------------------------------------------------- #
# A10 - Wild legality trio (REQ-6)                                              #
# --------------------------------------------------------------------------- #


def test_a10_acceptance():
    fx = load_fixture("A10")
    cfg = config_from_dict(fx["config"])
    for case_key, case in fx["cases"].items():
        st = state_from_dict(case["state"])
        al = allocation_from_dict(case["allocation"])
        trial_id = case["trial"]
        exp = case["expected"]
        result = resolve_profile(cfg, {st.player_id: st}, {al.player_id: al}, player_count=fx["player_count"])
        tr = _trial(result, trial_id)
        if exp["legal"]:
            assert st.player_id in tr.legal_entries, case_key
            assert tr.normal_totals[st.player_id] == exp["normal_total"], case_key
            assert tr.wild_totals[st.player_id] == exp["wild_added"], case_key
            assert tr.total_power[st.player_id] == exp["total_power"], case_key
            assert result.dropped_wild_entries.get(st.player_id, {}).get(trial_id, 0) == exp["dropped_wild"], case_key
        else:
            assert st.player_id not in tr.legal_entries, case_key
            assert result.dropped_wild_entries[st.player_id][trial_id] == exp["dropped_wild"], case_key
            assert tr.total_power.get(st.player_id, 0) == exp["total_power"], case_key


# --------------------------------------------------------------------------- #
# A11 - over-allocation scope + complete invalidation trace (REQ-5)             #
# --------------------------------------------------------------------------- #


def test_a11_acceptance():
    fx = load_fixture("A11")
    cfg = config_from_dict(fx["config"])
    st = state_from_dict(fx["state"])
    al = allocation_from_dict(fx["allocation"])
    exp = fx["expected"]
    pid = st.player_id

    result = resolve_profile(cfg, {pid: st}, {pid: al}, player_count=fx["player_count"])

    assert result.overallocated_domains[pid] == {exp["overallocated_domain"]: exp["excess"]}
    for tid in exp["invalidated_entries"]:
        assert result.invalidated_trial_entries[pid][tid] == f"overallocated_domain:{exp['overallocated_domain']}"
    for tid in exp["eligible_entries"]:
        assert pid in _trial(result, tid).legal_entries

    ev = next(
        e for e in result.invalidation_events
        if e.scope == "overallocated_domain" and e.player_id == pid
    )
    ee = exp["invalidation_event"]
    assert ev.domain == ee["domain"]
    assert ev.excess == ee["excess"]
    assert ev.action == ee["action"]
    assert ev.affected_entries == ee["affected_entries"]


# --------------------------------------------------------------------------- #
# A12 - tiebreak cascade + shared-first reward suppression (REQ-8)              #
# --------------------------------------------------------------------------- #


def test_a12_acceptance():
    fx = load_fixture("A12")
    cases = fx["cases"]

    # a12a: total & normal tie, separated at qualifying_source_count -> A wins.
    a = cases["a12a_source_count_tiebreak"]
    ra = resolve_profile(
        config_from_dict(a["config"]), _states(a["states"]), _allocs(a["allocations"]),
        player_count=a["player_count"],
    )
    exa = a["expected"]
    tra = _trial(ra, exa["trial"])
    assert tra.total_power == exa["total_power"]
    assert tra.placements == [[exa["sole_first"]], ["B"]]
    assert tra.shared_first is exa["shared_first"]
    assert _recognition(ra) == exa["recognition"]
    assert ra.win_utility == exa["win_utility"]

    # a12b: source-count stage inapplicable -> proceeds to shared.
    b = cases["a12b_source_count_skipped"]
    rb = resolve_profile(
        config_from_dict(b["config"]), _states(b["states"]), _allocs(b["allocations"]),
        player_count=b["player_count"],
    )
    exb = b["expected"]
    trb = _trial(rb, exb["trial"])
    assert trb.placements == [["A", "B"]]
    assert trb.shared_first is exb["shared_first"]
    assert _recognition(rb) == exb["recognition"]

    # a12c: shared-first suppression on -> no second-place award; off -> paid.
    c = cases["a12c_shared_first_suppression"]
    rs = resolve_profile(
        config_from_dict(c["config_suppress"]), _states(c["states"]), _allocs(c["allocations"]),
        player_count=c["player_count"],
    )
    exs = c["expected_suppress"]
    trs = _trial(rs, exs["trial"])
    assert trs.placements[0] == exs["shared_first_group"]
    assert trs.rewards_awarded == exs["rewards_awarded"]
    assert _recognition(rs) == exs["recognition"]

    rn = resolve_profile(
        config_from_dict(c["config_no_suppress"]), _states(c["states"]), _allocs(c["allocations"]),
        player_count=c["player_count"],
    )
    exn = c["expected_no_suppress"]
    trn = _trial(rn, exn["trial"])
    assert trn.rewards_awarded == exn["rewards_awarded"]
    assert _recognition(rn) == exn["recognition"]


# --------------------------------------------------------------------------- #
# A16 - MATH-3 full resolution against configs/hybrid_rebuild.json              #
# --------------------------------------------------------------------------- #


def test_a16_maya_full_resolution_against_hybrid_rebuild():
    """MATH-3 full resolution deferred by Tasks 4/9: drive the A16 Maya scenario
    END-TO-END from its data files. Derive F_C(S) from the Maya Spellbook against
    the committed ``configs/hybrid_rebuild.json``, then resolve her source-backed
    secret three-Trial allocation through ``resolve_profile`` at 5 players (Complete
    Mastery is a 5-6p Trial), and confirm the committed Trial totals (Transformation
    Mastery 10, Complete Mastery 21, Energy Harmony 15) and full-ledger exhaustion.

    All expected values are the committed A16 oracle (REQ-3, REQ-4, REQ-7, REQ-9.4)."""
    fx = load_fixture("A16")
    spellbook = spellbook_from_dict(load_worked(fx["spellbook_ref"]))
    config = load_configuration(CONFIGS / "hybrid_rebuild.json")
    exp = fx["expected"]
    ds = exp["derived_state"]

    # 1. F_C(S) derivation from the committed config reproduces the source vector.
    maya = derive_player_state(spellbook, config, player_id="maya")
    assert maya.normal_power["void"] == ds["void"] == 11
    assert maya.normal_power["aether"] == ds["aether"] == 9
    assert maya.normal_power["transformation"] == ds["transformation"] == 16
    assert maya.normal_power["enchantment"] == ds["enchantment"] == 8
    assert maya.wild_power == ds["wild"] == 2

    # 2. Build her secret allocation FROM the committed fixture data (transcribed
    #    from the proposal, not tuned to the totals).
    allocation = Allocation(
        player_id="maya",
        normal={t: dict(entry["normal"]) for t, entry in exp["allocation"].items()},
        wild={t: entry["wild"] for t, entry in exp["allocation"].items() if entry.get("wild")},
    )

    # 3. Full resolution against hybrid_rebuild at 5 players.
    result = resolve_profile(config, {"maya": maya}, {"maya": allocation}, player_count=fx["player_count"])
    assert result.validation.valid, " || ".join(result.validation.errors)

    # 4. Source-backed Trial totals (normal entries + attached Wild): 10 / 21 / 15.
    totals = {tr.trial_id: tr.total_power["maya"] for tr in result.trial_results if "maya" in tr.total_power}
    for trial_id, want in exp["trial_totals"].items():
        assert totals[trial_id] == want, f"A16 {trial_id}: got {totals.get(trial_id)}, want {want}"
    assert totals["transformation_mastery"] == 10
    assert totals["complete_mastery"] == 21
    assert totals["energy_harmony"] == 15

    # 5. Full-ledger exhaustion: every domain + Wild allocated == available, no residue.
    assert result.residue["maya"] == {"normal": 0, "wild": 0}
    for dom, line in exp["ledger"].items():
        if dom == "wild":
            continue
        cons = result.conservation["maya"][dom]
        assert cons["available"] == line["available"]
        assert cons["allocated"] == line["used"] == line["available"]
        assert cons["residue"] == 0
    # Conservation identity holds for EVERY ledger (MATH-2).
    for dom, line in result.conservation["maya"].items():
        assert line["allocated"] + line["residue"] == line["available"], dom

    # 6. She entered exactly her three Trials; the other active Trials carry no entry.
    entered = {tr.trial_id for tr in result.trial_results if "maya" in tr.total_power}
    assert entered == {"transformation_mastery", "complete_mastery", "energy_harmony"}
    for not_entered in exp["not_entered"]:
        assert "maya" not in _trial(result, not_entered).total_power


# --------------------------------------------------------------------------- #
# A17 - formula comparison isolates F_C(S) (REQ-3)                              #
# --------------------------------------------------------------------------- #


def test_a17_acceptance():
    fx = load_fixture("A17")
    spellbook = spellbook_from_dict(load_worked(fx["spellbook_ref"]))
    exp = fx["expected"]
    profiles = {
        name: config_from_dict(load_worked(meta["profile_ref"]))
        for name, meta in fx["profiles"].items()
    }

    for name, cfg in profiles.items():
        want = exp["derived_state"][name]
        derived = derive_player_state(spellbook, cfg, player_id="maya")
        assert derived.normal_power.get("void") == want["void"], name
        assert derived.normal_power.get("aether") == want["aether"], name
        assert derived.normal_power.get("transformation") == want["transformation"], name
        assert derived.normal_power.get("enchantment") == want["enchantment"], name
        assert derived.wild_power == want["wild"], name
        assert standard_spell_power(cfg, 5) == exp["five_card_standard_spell_power"][name], name

    hybrid = profiles["hybrid_2n_minus_3"]
    for size, points in exp["hybrid_enchantment_table"].items():
        assert enchantment_power(hybrid, int(size)) == points

    # The difference is attributed to F_C(S); experimental labelling is preserved.
    assert profiles["v28"].power_formula.experimental is False
    assert profiles["hybrid_2n_minus_3"].power_formula.experimental is True


# --------------------------------------------------------------------------- #
# REQ-14 - q(S) + F_C(S) provenance and evidence-class labelling               #
# --------------------------------------------------------------------------- #


def test_provenance_and_evidence_labelling():
    """REQ-14.2/14.3 (the VS1-implementable portion; report generation is Task 13).

    A fully-derived state records BOTH q(S) provenance (scoring-reference version +
    content hash) and F_C(S) provenance (Trials-power-profile version), separately
    auditable; and every committed fixture labels its oracle with a REQ-14.3
    evidence class."""
    spellbook = spellbook_from_dict(load_worked("maya_spellbook.json"))
    config = load_configuration(CONFIGS / "hybrid_rebuild.json")
    reference = scoring.load_scoring_reference()
    q = scoring.independent_score(spellbook, reference)
    state = derive_player_state(spellbook, config, independent_score=q, player_id="maya")

    # q(S) provenance.
    assert state.independent_score.value is not None
    assert state.independent_score.scoring_version == "v3.1"
    assert state.independent_score.content_hash
    assert state.independent_score.content_hash.startswith("sha256:")
    # F_C(S) provenance, recorded in a separate field so the two are independent.
    assert state.power_profile_version == "hybrid_2n_minus_3@0.1-experimental"
    assert state.independent_score.scoring_version != state.power_profile_version

    # Evidence-class labelling on every committed fixture (REQ-14.3 vocabulary).
    for fixture_id in FIXTURE_FILES:
        oracle = load_fixture(fixture_id)["oracle"]
        assert oracle["evidence_class"] in EVIDENCE_CLASSES, fixture_id


# --------------------------------------------------------------------------- #
# REQ-15 - repository integration and reproducibility                          #
# --------------------------------------------------------------------------- #


def test_repository_integration_layout():
    """REQ-15.1/15.2/15.3/15.4 (the VS1-implementable portion; doc relocation and
    the checker warning are Task 14).

    The subsystem lives in ``simulation/ascension_trials_model`` as a local pytest
    package (pyproject + ``src/ascension_trials`` + tests), pins NumPy and SciPy for
    VS2, and keeps generated outputs git-ignored."""
    assert (PKG / "pyproject.toml").is_file()
    assert (PKG / "src" / "ascension_trials").is_dir()
    assert (PKG / "tests").is_dir()

    pyproject = (PKG / "pyproject.toml").read_text(encoding="utf-8")
    assert "pytest" in pyproject

    lock = (PKG / "requirements.lock").read_text(encoding="utf-8")
    assert "numpy==" in lock
    assert "scipy==" in lock

    gitignore = (REPO_ROOT / ".gitignore").read_text(encoding="utf-8")
    assert "outputs/" in gitignore
