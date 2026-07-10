"""Task 11 - the committed VS1 fixture library (REQ-9.2, REQ-9.4, REQ-14).

Every required VS1 fixture (A1, A2, A7, A8, A9, A10, A11, A12, A16, A17) must be
committed DATA that:

  * exists as a file and loads as JSON (REQ-9.2);
  * carries provenance/oracle metadata (REQ-14): a source citation naming the
    doc/section the expected values come from, an evidence class drawn from the
    REQ-14.3 vocabulary, and an explicit assertion that its expected values are
    independent of generated implementation output (REQ-9.4);
  * carries an expected-oracle block.

The library is stored under ``fixtures/adversarial/`` and ``fixtures/worked_examples/``.
Six adversarial fixtures (A7-A12) and the Maya Spellbook were authored inline by
Tasks 6-10 and are consolidated here with the shared ``oracle`` envelope; A1, A2,
A16 and A17 are newly authored by this task.

This file is the DATA library's loader + consistency check (Task 11). Building the
full VS1 acceptance-suite runner is Task 12; the resolver/derivation spot checks
below only confirm that the NEWLY authored oracle values are the source-backed
ones (deriving/resolving from the committed data), not hand-copied engine output.
"""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from ascension_trials.config_loader import (
    allocation_from_dict,
    config_from_dict,
    spellbook_from_dict,
    state_from_dict,
)
from ascension_trials.power import (
    derive_player_state,
    enchantment_power,
    standard_spell_power,
)
from ascension_trials.resolver import resolve_profile

FIXTURES = Path(__file__).resolve().parent.parent / "fixtures"
ADVERSARIAL = FIXTURES / "adversarial"
WORKED = FIXTURES / "worked_examples"

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

# The complete VS1 fixture set (REQ-9.2) and the committed file for each id.
REQUIRED_FIXTURES = {
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

# Any key a fixture may use to carry its expected oracle values.
_ORACLE_BEARING_KEYS = ("expected", "resolutions", "cases")

FIXTURE_IDS = sorted(REQUIRED_FIXTURES)


def load_fixture(fixture_id: str) -> dict:
    return json.loads(REQUIRED_FIXTURES[fixture_id].read_text(encoding="utf-8"))


def _load_worked(name: str) -> dict:
    return json.loads((WORKED / name).read_text(encoding="utf-8"))


# --------------------------------------------------------------------------- #
# Consistency: existence, JSON loading, provenance/oracle metadata             #
# --------------------------------------------------------------------------- #


@pytest.mark.parametrize("fixture_id", FIXTURE_IDS)
def test_required_fixture_exists(fixture_id):
    """Every REQ-9.2 fixture is committed as a data file."""
    assert REQUIRED_FIXTURES[fixture_id].is_file(), (
        f"missing committed fixture for {fixture_id}: {REQUIRED_FIXTURES[fixture_id]}"
    )


@pytest.mark.parametrize("fixture_id", FIXTURE_IDS)
def test_required_fixture_loads_as_json_with_matching_id(fixture_id):
    data = load_fixture(fixture_id)
    assert isinstance(data, dict)
    assert data.get("id") == fixture_id, f"{fixture_id}: fixture id field mismatch"
    assert isinstance(data.get("name"), str) and data["name"].strip()


@pytest.mark.parametrize("fixture_id", FIXTURE_IDS)
def test_required_fixture_carries_provenance_and_oracle_metadata(fixture_id):
    """REQ-14 / REQ-9.4: source citation, evidence class, and an explicit
    independent-of-implementation assertion on every fixture."""
    data = load_fixture(fixture_id)
    oracle = data.get("oracle")
    assert isinstance(oracle, dict), f"{fixture_id}: missing 'oracle' metadata block"

    source = oracle.get("source")
    assert isinstance(source, str) and source.strip(), (
        f"{fixture_id}: oracle.source must cite the doc/section the expected values come from"
    )

    assert oracle.get("evidence_class") in EVIDENCE_CLASSES, (
        f"{fixture_id}: oracle.evidence_class must be one of {sorted(EVIDENCE_CLASSES)}, "
        f"got {oracle.get('evidence_class')!r}"
    )

    assert oracle.get("independent_of_implementation") is True, (
        f"{fixture_id}: oracle.independent_of_implementation must be true (REQ-9.4)"
    )

    # A rich human-readable provenance narrative is retained alongside the metadata.
    assert isinstance(data.get("provenance"), str) and data["provenance"].strip(), (
        f"{fixture_id}: missing human-readable provenance narrative"
    )
    assert "REQ-9.4" in data["provenance"], (
        f"{fixture_id}: provenance should assert the REQ-9.4 no-reverse-engineering rule"
    )


@pytest.mark.parametrize("fixture_id", FIXTURE_IDS)
def test_required_fixture_carries_expected_oracle_block(fixture_id):
    data = load_fixture(fixture_id)
    assert any(data.get(key) for key in _ORACLE_BEARING_KEYS), (
        f"{fixture_id}: must carry an expected-oracle block (one of {_ORACLE_BEARING_KEYS})"
    )


def test_fixture_library_is_exactly_the_req_9_2_set():
    """Exactly A1, A2, A7-A12, A16, A17 are present - no more, no fewer (REQ-9.2)."""
    assert set(REQUIRED_FIXTURES) == {
        "A1", "A2", "A7", "A8", "A9", "A10", "A11", "A12", "A16", "A17",
    }


# --------------------------------------------------------------------------- #
# Loader helpers for the resolver/derivation spot checks                       #
# --------------------------------------------------------------------------- #


def _states(mapping: dict) -> dict:
    return {pid: state_from_dict(raw) for pid, raw in mapping.items()}


def _allocs(mapping: dict) -> dict:
    return {pid: allocation_from_dict(raw) for pid, raw in mapping.items()}


def _relabel_player(raw: dict, swap: dict) -> dict:
    out = dict(raw)
    out["player_id"] = swap.get(raw["player_id"], raw["player_id"])
    return out


def _relabel_domains_in_state(raw: dict, relabel: dict) -> dict:
    out = dict(raw)
    out["normal_power"] = {relabel.get(d, d): p for d, p in raw.get("normal_power", {}).items()}
    return out


def _relabel_domains_in_alloc(raw: dict, relabel: dict) -> dict:
    out = dict(raw)
    out["normal"] = {
        t: {relabel.get(d, d): p for d, p in doms.items()}
        for t, doms in raw.get("normal", {}).items()
    }
    res = raw.get("residue", {})
    out["residue"] = {
        "normal": {relabel.get(d, d): p for d, p in (res.get("normal") or {}).items()},
        "wild": res.get("wild", 0),
    }
    return out


# --------------------------------------------------------------------------- #
# A1 - mirror tie + player-swap symmetry (REQ-7.2, REQ-7.3)                     #
# --------------------------------------------------------------------------- #


def test_a1_mirror_tie_resolves_to_shared_and_is_swap_symmetric():
    fx = load_fixture("A1")
    cfg = config_from_dict(fx["config"])
    exp = fx["expected"]

    result = resolve_profile(
        cfg, _states(fx["states"]), _allocs(fx["allocations"]), player_count=fx["player_count"]
    )
    assert result.validation.valid, " || ".join(result.validation.errors)

    tr = next(t for t in result.trial_results if t.trial_id == exp["trial"])
    assert tr.shared_first is exp["shared_first"]
    assert tr.placements == exp["placements"]
    assert {p: r.recognition_points for p, r in result.player_results.items()} == exp["recognition"]
    assert result.win_utility == exp["win_utility"]
    assert result.margin_utility == exp["margin_utility"]

    # Player-swap symmetry: swapping two identical players is audit-hash invariant.
    swap = exp["player_swap_symmetry"]["swap"]
    swapped_states = _states({swap[p]: _relabel_player(s, swap) for p, s in fx["states"].items()})
    swapped_allocs = _allocs({swap[p]: _relabel_player(a, swap) for p, a in fx["allocations"].items()})
    swapped = resolve_profile(cfg, swapped_states, swapped_allocs, player_count=fx["player_count"])
    assert swapped.deterministic_hash == result.deterministic_hash


# --------------------------------------------------------------------------- #
# A2 - equivalent energy-domain relabel is isomorphic (REQ-7.4)                 #
# --------------------------------------------------------------------------- #


def test_a2_domain_relabel_is_isomorphic():
    fx = load_fixture("A2")
    exp = fx["expected"]
    cfg = config_from_dict(fx["config"])

    base = resolve_profile(
        cfg, _states(fx["states"]), _allocs(fx["allocations"]), player_count=fx["player_count"]
    )
    assert base.validation.valid, " || ".join(base.validation.errors)
    assert {p: r.recognition_points for p, r in base.player_results.items()} == exp["recognition"]
    assert base.win_utility == exp["win_utility"]
    assert base.margin_utility == exp["margin_utility"]

    # Relabel the two symmetry-group-equivalent energy domains everywhere.
    relabel = exp["relabel_invariance"]["relabel"]
    raw_cfg = json.loads(json.dumps(fx["config"]))
    for d in raw_cfg["domains"]:
        d["id"] = relabel.get(d["id"], d["id"])
    cfg2 = config_from_dict(raw_cfg)
    states2 = _states({p: _relabel_domains_in_state(s, relabel) for p, s in fx["states"].items()})
    allocs2 = _allocs({p: _relabel_domains_in_alloc(a, relabel) for p, a in fx["allocations"].items()})
    relabelled = resolve_profile(cfg2, states2, allocs2, player_count=fx["player_count"])

    # Player-facing outcomes are domain-name independent -> identical (isomorphic).
    assert {p: r.recognition_points for p, r in relabelled.player_results.items()} == exp["recognition"]
    assert relabelled.win_utility == base.win_utility
    assert relabelled.margin_utility == base.margin_utility


# --------------------------------------------------------------------------- #
# A16 - Maya derivation + source-backed three-Trial allocation (MATH-3)         #
# --------------------------------------------------------------------------- #


def test_a16_maya_derivation_and_source_allocation_are_self_consistent():
    fx = load_fixture("A16")
    spellbook = spellbook_from_dict(_load_worked(fx["spellbook_ref"]))
    profile = config_from_dict(_load_worked(fx["profile_ref"]))
    exp = fx["expected"]
    ds = exp["derived_state"]

    # 1. F_C(S) derivation reproduces the source vector (proposal 12 Step 1).
    derived = derive_player_state(spellbook, profile, player_id="maya")
    assert derived.normal_power.get("void") == ds["void"]
    assert derived.normal_power.get("aether") == ds["aether"]
    assert derived.normal_power.get("transformation") == ds["transformation"]
    assert derived.normal_power.get("enchantment") == ds["enchantment"]
    assert derived.wild_power == ds["wild"]

    # 2. The transcribed allocation exhausts every domain ledger exactly
    #    (proposal 12 Step 2 domain checks), and matches the derived state.
    per_domain: dict[str, int] = {}
    wild_used = 0
    for entry in exp["allocation"].values():
        for dom, power in entry["normal"].items():
            per_domain[dom] = per_domain.get(dom, 0) + power
        wild_used += entry["wild"]

    for dom, line in exp["ledger"].items():
        assert line["used"] == line["available"], f"A16 ledger {dom} not fully exhausted"
        if dom == "wild":
            assert wild_used == line["used"], "A16 Wild allocation != ledger"
        else:
            assert per_domain.get(dom, 0) == line["used"], f"A16 {dom} allocation != ledger"
            assert per_domain.get(dom, 0) == ds[dom], f"A16 {dom} allocation != derived state"

    # 3. Trial totals equal normal entries + Wild (proposal 12 Step 3): 10, 21, 15.
    for trial, entry in exp["allocation"].items():
        total = sum(entry["normal"].values()) + entry["wild"]
        assert total == exp["trial_totals"][trial], f"A16 {trial} total mismatch"


# --------------------------------------------------------------------------- #
# A17 - formula comparison isolates F_C(S) (MATH-4)                             #
# --------------------------------------------------------------------------- #


def test_a17_formula_comparison_matches_source():
    fx = load_fixture("A17")
    spellbook = spellbook_from_dict(_load_worked(fx["spellbook_ref"]))
    exp = fx["expected"]

    profiles = {
        name: config_from_dict(_load_worked(meta["profile_ref"]))
        for name, meta in fx["profiles"].items()
    }

    # Each profile derives its own source-backed vector from the same Spellbook.
    for name, cfg in profiles.items():
        want = exp["derived_state"][name]
        derived = derive_player_state(spellbook, cfg, player_id="maya")
        assert derived.normal_power.get("void") == want["void"], name
        assert derived.normal_power.get("aether") == want["aether"], name
        assert derived.normal_power.get("transformation") == want["transformation"], name
        assert derived.normal_power.get("enchantment") == want["enchantment"], name
        assert derived.wild_power == want["wild"], name

    # 5-card standard spell power: legacy 8 (half-up), hybrid 7 (2n-3).
    for name, cfg in profiles.items():
        assert standard_spell_power(cfg, 5) == exp["five_card_standard_spell_power"][name], name

    # Hybrid Enchantment table 4/8/12.
    hybrid = profiles["hybrid_2n_minus_3"]
    for size, points in exp["hybrid_enchantment_table"].items():
        assert enchantment_power(hybrid, int(size)) == points

    # The difference is attributed to F_C(S); experimental labelling is preserved.
    assert profiles["hybrid_2n_minus_3"].power_formula.experimental is True
    assert profiles["v28"].power_formula.experimental is False
