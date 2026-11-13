"""Task 6 — allocation ledger reconciliation and completion semantics (REQ-4).

Covers, sourcing expected values from the normative model / Kiro implementation
spec (design 7.3/7.6, impl spec 7/8) rather than from engine output (REQ-9.4):

  * ledger reconciliation: allocated + residue == available for every normal
    domain and Wild, non-negative for legal allocations, over-allocation recorded
    and NEVER clipped (REQ-4.2, 4.3, 4.7);
  * completion policies OPTIONAL / MAXIMAL / FULL (REQ-4.4);
  * maximality as "no residual unit can be legally added to an active Trial",
    with a failure naming a legal destination Trial (REQ-4.5, design 7.6);
  * the explicit infeasible-FULL fallback reject / residue (REQ-4.6);
  * the source-backed adversarial fixture A8 (infeasible fullness).
"""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from ascension_trials import legality
from ascension_trials.config_loader import config_from_dict, validate_config_document
from ascension_trials.eligibility import evaluate_entry
from ascension_trials.resolver import resolve_profile
from ascension_trials.schema import Allocation, Configuration, PlayerState

ADVERSARIAL = Path(__file__).resolve().parent.parent / "fixtures" / "adversarial"

DOMAINS = [
    {"id": "void", "class": "energy"},
    {"id": "flux", "class": "energy"},
    {"id": "transformation", "class": "transformation"},
]


# --------------------------------------------------------------------------- #
# Builders                                                                     #
# --------------------------------------------------------------------------- #


def _trial(tid: str, eligibility: dict, tiebreaks=("total_power", "shared"), active=(2,)) -> dict:
    return {
        "id": tid,
        "active_player_counts": list(active),
        "eligibility": eligibility,
        "trial_tiebreaks": list(tiebreaks),
    }


def make_config(
    trials: list[dict],
    *,
    completion: str = "maximal",
    fallback: str = "reject",
    domains: list[dict] | None = None,
    wild: dict | None = None,
) -> Configuration:
    raw = {
        "id": "legality_test",
        "version": "1.0",
        "supported_player_counts": [2],
        "power_formula": {
            "profile": "declarative",
            "standard_spell_power": {"type": "linear", "expression": "n"},
        },
        "domains": domains or DOMAINS,
        "trials": trials,
        "allocation": {
            "completion": completion,
            "residue_allowed": True,
            "infeasible_full_fallback": fallback,
        },
    }
    if wild is not None:
        raw["wild"] = wild
    result = validate_config_document(raw)
    assert result.valid, " || ".join(result.errors)
    return config_from_dict(raw)


def state(pid: str = "p", normal: dict | None = None, wild: int = 0) -> PlayerState:
    return PlayerState(player_id=pid, normal_power=dict(normal or {}), wild_power=wild)


def alloc(
    pid: str = "p",
    normal: dict | None = None,
    wild: dict | None = None,
    residue_normal: dict | None = None,
    residue_wild: int = 0,
) -> Allocation:
    return Allocation(
        player_id=pid,
        normal={t: {d: int(p) for d, p in doms.items()} for t, doms in (normal or {}).items()},
        wild={t: int(p) for t, p in (wild or {}).items()},
        residue_normal=dict(residue_normal or {}),
        residue_wild=residue_wild,
    )


# --------------------------------------------------------------------------- #
# Ledger reconciliation (REQ-4.2, 4.3, 4.7)                                    #
# --------------------------------------------------------------------------- #

PURITY = {"allowed_domain_classes": ["energy"], "source_count": {"universe": "class:energy", "minimum": 1, "maximum": 1}}
HARMONY = {"allowed_domain_classes": ["energy"], "source_count": {"universe": "class:energy", "minimum": 2}}
FOCUSED = {"source_count": {"universe": "all_normal", "minimum": 1, "maximum": 1}}


def test_ledger_identity_holds_for_every_source():
    """allocated + residue == available for each domain and Wild (REQ-4.3)."""
    cfg = make_config([_trial("purity", PURITY)])
    st = state(normal={"void": 5, "flux": 2, "transformation": 4}, wild=3)
    al = alloc(normal={"purity": {"void": 3}}, wild={"purity": 1})
    recon = legality.reconcile_ledgers(st, al, cfg)
    for src, line in recon.normal.items():
        assert line.allocated + line.residue == line.available, src
        assert line.identity_holds
    assert recon.wild.allocated + recon.wild.residue == recon.wild.available
    # void: 5 available, 3 used -> 2 residue; flux/transformation untouched.
    assert recon.normal["void"].residue == 2
    assert recon.normal["flux"].residue == 2
    assert recon.normal["transformation"].residue == 4
    assert recon.wild.residue == 2


def test_legal_allocation_is_balanced_and_nonnegative():
    cfg = make_config([_trial("purity", PURITY)])
    st = state(normal={"void": 5}, wild=1)
    al = alloc(normal={"purity": {"void": 5}}, wild={"purity": 1},
               residue_normal={"void": 0}, residue_wild=0)
    recon = legality.reconcile_ledgers(st, al, cfg)
    assert recon.balanced
    assert recon.discrepancies == []
    assert all(line.nonnegative for line in recon.normal.values())


def test_over_allocation_is_recorded_and_never_clipped():
    """Allocating beyond the available budget is a recorded discrepancy with a
    negative residue — not silently reduced to fit (REQ-4.7)."""
    cfg = make_config([_trial("purity", PURITY)])
    st = state(normal={"void": 3})
    al = alloc(normal={"purity": {"void": 5}})  # 5 > 3 available
    recon = legality.reconcile_ledgers(st, al, cfg)
    line = recon.normal["void"]
    assert line.allocated == 5  # NOT clipped to 3
    assert line.residue == -2  # available - allocated, negative
    assert line.overallocation == 2
    assert not recon.balanced
    over = [d for d in recon.discrepancies if d.kind == "over_allocation"]
    assert len(over) == 1 and over[0].source == "void"
    assert recon.overallocated_domains() == {"void": 2}


def test_wild_over_allocation_is_recorded():
    cfg = make_config([_trial("purity", PURITY)])
    st = state(normal={"void": 3}, wild=1)
    al = alloc(normal={"purity": {"void": 3}}, wild={"purity": 4})  # 4 > 1 available
    recon = legality.reconcile_ledgers(st, al, cfg)
    assert recon.wild.overallocation == 3
    assert recon.overallocated_wild == 3
    assert any(d.kind == "over_allocation" and d.source == "wild" for d in recon.discrepancies)


def test_declared_residue_mismatch_is_recorded():
    """An explicitly declared residue that disagrees with the computed residue is
    an exact reconciliation discrepancy (REQ-4.1/4.3)."""
    cfg = make_config([_trial("purity", PURITY)])
    st = state(normal={"void": 5})
    al = alloc(normal={"purity": {"void": 3}}, residue_normal={"void": 1})  # computed 2, declared 1
    recon = legality.reconcile_ledgers(st, al, cfg)
    mism = [d for d in recon.discrepancies if d.kind == "declared_residue_mismatch"]
    assert len(mism) == 1
    assert mism[0].computed_residue == 2 and mism[0].declared_residue == 1


def test_validate_allocation_surfaces_over_allocation_error():
    cfg = make_config([_trial("purity", PURITY)], completion="optional")
    st = state(normal={"void": 3})
    al = alloc(normal={"purity": {"void": 5}})
    validation = legality.validate_allocation(st, al, cfg, player_count=2)
    assert not validation.valid
    assert any("over-allocated" in e and "not clipped" in e for e in validation.errors)


# --------------------------------------------------------------------------- #
# Completion policies OPTIONAL / MAXIMAL / FULL (REQ-4.4, 4.6)                  #
# --------------------------------------------------------------------------- #


def test_optional_completion_accepts_any_legal_residue():
    cfg = make_config([_trial("purity", PURITY)], completion="optional")
    st = state(normal={"void": 5})
    al = alloc(normal={"purity": {"void": 1}}, residue_normal={"void": 4})
    result = legality.enforce_completion(cfg, st, al, player_count=2)
    assert result.satisfied
    assert result.normal_residue == 4
    assert result.errors == []


def test_full_completion_satisfied_when_residue_zero():
    cfg = make_config([_trial("focused", FOCUSED)], completion="full")
    st = state(normal={"void": 4})
    al = alloc(normal={"focused": {"void": 4}}, residue_normal={"void": 0})
    result = legality.enforce_completion(cfg, st, al, player_count=2)
    assert result.satisfied and result.normal_residue == 0


def test_full_completion_infeasible_reject_fallback():
    """FULL is impossible when leftover power has no legal home; fallback=reject
    marks the state/config infeasible (impl spec 8; REQ-4.6)."""
    cfg = make_config([_trial("harmony", HARMONY)], completion="full", fallback="reject")
    st = state(normal={"void": 6})  # single energy domain -> harmony (2 energy) unreachable
    al = alloc(residue_normal={"void": 6})
    result = legality.enforce_completion(cfg, st, al, player_count=2)
    assert not result.satisfied
    assert result.fallback_applied == "reject"
    assert any("full completion infeasible" in e for e in result.errors)


def test_full_completion_infeasible_residue_fallback_treats_as_maximal():
    cfg = make_config([_trial("harmony", HARMONY)], completion="full", fallback="residue")
    st = state(normal={"void": 6})
    al = alloc(residue_normal={"void": 6})
    result = legality.enforce_completion(cfg, st, al, player_count=2)
    assert result.satisfied  # accepted with a warning
    assert result.fallback_applied == "residue"
    assert any("treated as maximal" in w for w in result.warnings)
    # The all-residue allocation genuinely IS maximal here (nothing legal to add).
    assert result.is_maximal


# --------------------------------------------------------------------------- #
# Maximality proof (REQ-4.5; design 7.6)                                       #
# --------------------------------------------------------------------------- #


def test_maximal_when_no_residual_unit_can_be_added():
    """Dead power: a single energy domain can never enter a 2-energy Trial, so the
    all-residue allocation is maximal (no legal destination exists)."""
    cfg = make_config([_trial("harmony", HARMONY)])
    st = state(normal={"void": 5})
    al = alloc(residue_normal={"void": 5})
    assert legality.is_maximal_allocation(st, al, cfg, player_count=2)
    assert legality.find_maximality_witness(cfg, st, al, player_count=2) is None


def test_non_maximal_names_legal_destination_same_domain():
    """A Purity Trial (exactly one energy source) can always take more of the same
    domain: leftover void is addable, so the allocation is non-maximal and the
    witness names the destination Trial and domain (design 7.6)."""
    cfg = make_config([_trial("purity", PURITY)])
    st = state(normal={"void": 5})
    al = alloc(normal={"purity": {"void": 3}}, residue_normal={"void": 2})
    witness = legality.find_maximality_witness(cfg, st, al, player_count=2)
    assert witness is not None
    assert witness.kind == "normal"
    assert witness.trial_id == "purity" and witness.domain == "void"
    assert not legality.is_maximal_allocation(st, al, cfg, player_count=2)


def test_non_maximal_via_adding_a_second_domain_to_reach_min_sources():
    """Leftover flux can complete Harmony's two-energy requirement on a Trial that
    currently holds only void — the witness must name flux as the addable unit."""
    cfg = make_config([_trial("harmony", HARMONY)])
    st = state(normal={"void": 3, "flux": 3})
    al = alloc(normal={"harmony": {"void": 3}}, residue_normal={"void": 0, "flux": 3})
    witness = legality.find_maximality_witness(cfg, st, al, player_count=2)
    assert witness is not None and witness.domain == "flux" and witness.trial_id == "harmony"


def test_maximal_check_ignores_inactive_trials():
    """A residual unit that would only fit an inactive Trial does not break
    maximality (design 7.6 restricts additions to active Trials)."""
    cfg = make_config([_trial("purity", PURITY, active=(3,))])  # active only at 3 players
    st = state(normal={"void": 5})
    al = alloc(normal={}, residue_normal={"void": 5})
    # At player_count 2 the only Trial is inactive -> nothing addable -> maximal.
    assert legality.is_maximal_allocation(st, al, cfg, player_count=2)
    # At player_count 3 the Trial is active and void is addable -> non-maximal.
    assert not legality.is_maximal_allocation(st, al, cfg, player_count=3)


def test_wild_residue_breaks_maximality_when_a_legal_normal_entry_exists():
    """A leftover Wild unit can be legally added to a Trial that already has a legal
    normal entry (REQ-6.4), so leaving Wild unspent there is non-maximal."""
    cfg = make_config([_trial("purity", PURITY)])
    st = state(normal={"void": 3}, wild=2)
    al = alloc(normal={"purity": {"void": 3}}, wild={}, residue_normal={"void": 0}, residue_wild=2)
    witness = legality.find_maximality_witness(cfg, st, al, player_count=2)
    assert witness is not None and witness.kind == "wild" and witness.trial_id == "purity"


def test_wild_residue_does_not_break_maximality_without_a_legal_normal_entry():
    """Wild cannot enter alone: with no legal normal entry anywhere, leftover Wild
    stays as residue and the allocation is still maximal (A8-shaped)."""
    cfg = make_config([_trial("harmony", HARMONY)])
    st = state(normal={"void": 3}, wild=2)
    al = alloc(residue_normal={"void": 3}, residue_wild=2)
    assert legality.is_maximal_allocation(st, al, cfg, player_count=2)


# --------------------------------------------------------------------------- #
# Bounded-exhaustive: maximality witness is sound and complete                 #
# --------------------------------------------------------------------------- #


def _oracle_addable_normal(cfg: Configuration, st: PlayerState, al: Allocation, player_count: int):
    """Independent scan (via eligibility.evaluate_entry, no floors/Wild in these
    configs) of every (active Trial, residual domain) single-unit addition.

    Returns the sorted set of legal (trial_id, domain) destinations."""
    recon = legality.reconcile_ledgers(st, al, cfg)
    residue = [d for d, line in recon.normal.items() if line.residue > 0]
    found = []
    for trial in cfg.active_trials(player_count):
        for dom in residue:
            candidate = dict(al.normal_on(trial.id))
            candidate[dom] = candidate.get(dom, 0) + 1
            legal, _reasons = evaluate_entry(cfg, trial, candidate)
            if legal:
                found.append((trial.id, dom))
    return sorted(found)


def test_maximality_matches_independent_oracle_bounded():
    """Over a bounded grid, is_maximal_allocation agrees with an independent
    eligibility scan, and any returned witness is a genuine legal destination."""
    cfg = make_config([_trial("purity", PURITY), _trial("harmony", HARMONY)])
    checked = 0
    for void in range(4):
        for flux in range(4):
            for a_void in range(void + 1):
                st = state(normal={"void": void, "flux": flux})
                al = alloc(
                    normal={"purity": {"void": a_void}} if a_void else {},
                    residue_normal={"void": void - a_void, "flux": flux},
                )
                oracle = _oracle_addable_normal(cfg, st, al, 2)
                witness = legality.find_maximality_witness(cfg, st, al, player_count=2)
                assert legality.is_maximal_allocation(st, al, cfg, 2) == (not oracle)
                if witness is not None:
                    assert (witness.trial_id, witness.domain) in oracle  # soundness
                checked += 1
    assert checked == 40  # 4 (flux) * sum(void+1 for void in 0..3) = 4 * 10


# --------------------------------------------------------------------------- #
# Completion is enforced through the resolver pipeline (design 7.6 wiring)      #
# --------------------------------------------------------------------------- #


def test_resolver_warns_but_resolves_non_maximal_allocation_under_maximal_policy():
    """A non-maximal allocation is still resolvable: the resolver proceeds and
    records a non-fatal warning naming the legal destination (design 7.6, NFR-4).
    This keeps penny-squat-style fixtures (A9) resolvable rather than rejected."""
    cfg = make_config([_trial("purity", PURITY)], completion="maximal")
    st = state(normal={"void": 5})
    al = alloc(normal={"purity": {"void": 3}}, residue_normal={"void": 2})
    result = resolve_profile(cfg, {"p": st}, {"p": al}, player_count=2)
    assert result.validation.valid, " || ".join(result.validation.errors)
    assert any("maximal completion violated" in w and "purity" in w for w in result.validation.warnings)
    assert result.trial_results  # resolution proceeded

def test_strict_validate_allocation_rejects_non_maximal_under_maximal_policy():
    """The strict allocation validator (used by enumeration, Task 16) treats a
    non-maximal allocation as invalid under maximal completion (impl spec 8)."""
    cfg = make_config([_trial("purity", PURITY)], completion="maximal")
    st = state(normal={"void": 5})
    al = alloc(normal={"purity": {"void": 3}}, residue_normal={"void": 2})
    validation = legality.validate_allocation(st, al, cfg, player_count=2)
    assert not validation.valid
    assert not validation.completion.satisfied
    assert any("maximal completion violated" in e for e in validation.errors)


def test_resolver_accepts_maximal_allocation_under_maximal_policy():
    cfg = make_config([_trial("purity", PURITY)], completion="maximal")
    st = state(normal={"void": 5})
    al = alloc(normal={"purity": {"void": 5}}, residue_normal={"void": 0})
    result = resolve_profile(cfg, {"p": st}, {"p": al}, player_count=2)
    assert result.validation.valid, " || ".join(result.validation.errors)
    assert not any("maximal completion violated" in w for w in result.validation.warnings)


# --------------------------------------------------------------------------- #
# Adversarial fixture A8 — infeasible fullness (REQ-4.6; REQ-9 fixture)         #
# --------------------------------------------------------------------------- #


@pytest.fixture
def a8():
    return json.loads((ADVERSARIAL / "a8_infeasible_fullness.json").read_text(encoding="utf-8"))


def _a8_parts(a8, *, fallback: str):
    raw_cfg = json.loads(json.dumps(a8["config"]))
    raw_cfg["allocation"]["infeasible_full_fallback"] = fallback
    cfg = config_from_dict(raw_cfg)
    st = PlayerState(
        player_id=a8["state"]["player_id"],
        normal_power=dict(a8["state"]["normal_power"]),
        wild_power=a8["state"].get("wild_power", 0),
    )
    res = a8["allocation"].get("residue", {})
    al = Allocation(
        player_id=a8["allocation"]["player_id"],
        normal={t: dict(d) for t, d in a8["allocation"].get("normal", {}).items()},
        wild=dict(a8["allocation"].get("wild", {})),
        residue_normal=dict(res.get("normal", {})),
        residue_wild=res.get("wild", 0),
    )
    return cfg, st, al


def test_a8_config_is_valid(a8):
    assert validate_config_document(a8["config"]).valid


def test_a8_no_legal_entry_possible_for_the_state(a8):
    """L = empty set: the single-domain state cannot form a legal entry on any
    active (2+-domain) Trial — the source of the infeasibility (per A8)."""
    cfg, st, _al = _a8_parts(a8, fallback="reject")
    for trial in cfg.active_trials(a8["player_count"]):
        # Put every available unit of the sole domain onto the Trial: still 1 source.
        entry = {dom: st.normal_power[dom] for dom in st.normal_power}
        legal, _r = legality.entry_is_legal(cfg, trial, entry, a8["player_count"])
        assert not legal
    assert a8["expected"]["any_legal_entry_possible"] is False


def test_a8_all_residue_allocation_is_maximal(a8):
    cfg, st, al = _a8_parts(a8, fallback="reject")
    assert legality.is_maximal_allocation(st, al, cfg, a8["player_count"])
    recon = legality.reconcile_ledgers(st, al, cfg)
    assert recon.normal_residue_total() == a8["expected"]["normal_residue_total"]


def test_a8_full_fallback_reject_marks_infeasible(a8):
    """fallback=reject -> the state/config pair is infeasible (config rejected)."""
    cfg, st, al = _a8_parts(a8, fallback="reject")
    completion = legality.enforce_completion(cfg, st, al, a8["player_count"])
    assert not completion.satisfied
    assert completion.fallback_applied == "reject"
    assert a8["expected"]["fallback_reject"]["error_contains"] in " || ".join(completion.errors)


def test_a8_full_fallback_residue_engages_residue_rule(a8):
    """fallback=residue -> residue rule engaged: accepted as maximal with a warning."""
    cfg, st, al = _a8_parts(a8, fallback="residue")
    completion = legality.enforce_completion(cfg, st, al, a8["player_count"])
    assert completion.satisfied
    assert completion.fallback_applied == "residue"
    assert a8["expected"]["fallback_residue"]["warning_contains"] in " || ".join(completion.warnings)


def test_a8_resolver_does_not_crash_and_reflects_fallback(a8):
    """Both fallback paths resolve without crashing (A8: 'no crash')."""
    cfg_reject, st, al = _a8_parts(a8, fallback="reject")
    reject_result = resolve_profile(cfg_reject, {st.player_id: st}, {st.player_id: al}, player_count=a8["player_count"])
    assert not reject_result.validation.valid
    assert any("full completion infeasible" in e for e in reject_result.validation.errors)

    cfg_residue, st2, al2 = _a8_parts(a8, fallback="residue")
    residue_result = resolve_profile(cfg_residue, {st2.player_id: st2}, {st2.player_id: al2}, player_count=a8["player_count"])
    assert residue_result.validation.valid, " || ".join(residue_result.validation.errors)
    assert any("treated as maximal" in w for w in residue_result.validation.warnings)
