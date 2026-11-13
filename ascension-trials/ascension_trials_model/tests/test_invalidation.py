"""Task 7 — invalidation policies, the complete invalidation trace, and Wild
behaviour (REQ-5, REQ-6, REQ-7.1 steps 3/5).

Covers, sourcing expected values from the normative model / Kiro implementation
spec (design §5.2/§7.4/§7.5, impl spec §7.2/§7.3) rather than from engine output
(REQ-9.4):

  * the four configured invalidation policies (REQ-5.1/5.2): a single illegal
    Trial entry (``illegal_trial_entry``), normal-domain over-allocation
    (``overallocated_domain``, whole-domain scope), Wild over-allocation
    (``overallocated_wild``), and an invalid whole allocation
    (``malformed_allocation``);
  * dropping attached Wild when the corresponding normal entry is illegal or
    invalidated (REQ-5.3, REQ-6.1);
  * the complete invalidation trace — each event records player, Trial or domain,
    reason, and affected entries (REQ-5.4);
  * Wild semantics (REQ-6): Wild is never a source, cannot satisfy a minimum or
    break a mono/exact-one requirement, may increase the primary total only after
    a legal normal entry, and is excluded from the local tiebreak statistics by
    default;
  * the source-backed adversarial fixtures A9 (penny squat), A10a/b/c (Wild
    legality trio) and A11 (over-allocation).
"""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from ascension_trials import legality
from ascension_trials.config_loader import config_from_dict, validate_config_document
from ascension_trials.resolver import resolve_profile
from ascension_trials.schema import Allocation, Configuration, PlayerState

ADVERSARIAL = Path(__file__).resolve().parent.parent / "fixtures" / "adversarial"

DOMAINS = [
    {"id": "void", "class": "energy"},
    {"id": "flux", "class": "energy"},
    {"id": "transformation", "class": "transformation"},
]

PURITY = {
    "allowed_domain_classes": ["energy"],
    "source_count": {"universe": "class:energy", "minimum": 1, "maximum": 1},
}
HARMONY = {
    "allowed_domain_classes": ["energy"],
    "source_count": {"universe": "class:energy", "minimum": 2},
}
OPEN = {}  # no source predicate: an empty normal entry passes eligibility


# --------------------------------------------------------------------------- #
# Builders                                                                     #
# --------------------------------------------------------------------------- #


def _trial(tid: str, eligibility: dict, tiebreaks=("total_power", "shared"), active=(2,), rewards=None) -> dict:
    trial = {
        "id": tid,
        "active_player_counts": list(active),
        "eligibility": eligibility,
        "trial_tiebreaks": list(tiebreaks),
    }
    if rewards is not None:
        trial["rewards"] = {"by_player_count": {"2": rewards}}
    return trial


def make_config(
    trials: list[dict],
    *,
    completion: str = "optional",
    invalidation: dict | None = None,
    wild: dict | None = None,
    domains: list[dict] | None = None,
) -> Configuration:
    allocation: dict = {
        "completion": completion,
        "residue_allowed": True,
        "infeasible_full_fallback": "reject",
    }
    if invalidation is not None:
        allocation["invalidation"] = invalidation
    raw = {
        "id": "invalidation_test",
        "version": "1.0",
        "supported_player_counts": [2],
        "power_formula": {
            "profile": "declarative",
            "standard_spell_power": {"type": "linear", "expression": "n"},
        },
        "domains": domains or DOMAINS,
        "trials": trials,
        "allocation": allocation,
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
) -> Allocation:
    return Allocation(
        player_id=pid,
        normal={t: {d: int(p) for d, p in doms.items()} for t, doms in (normal or {}).items()},
        wild={t: int(p) for t, p in (wild or {}).items()},
    )


def events_of(result, scope: str, pid: str | None = None) -> list:
    return [
        e
        for e in result.invalidation_events
        if e.scope == scope and (pid is None or e.player_id == pid)
    ]


# --------------------------------------------------------------------------- #
# REQ-5.2 — per-entry illegality: illegal_trial_entry action                   #
# --------------------------------------------------------------------------- #


def test_illegal_entry_ignore_action_does_not_contend_and_is_traced():
    """Default ``ignore_entry``: an illegal entry contributes zero and does not
    contend; it is traced but not recorded as a hard-invalidated entry (§7.2)."""
    cfg = make_config([_trial("purity", PURITY)], invalidation={"illegal_trial_entry": "ignore_entry"})
    st = state(normal={"void": 3, "flux": 3})
    al = alloc(normal={"purity": {"void": 2, "flux": 1}})  # 2 energy sources > max 1 -> illegal
    result = resolve_profile(cfg, {"p": st}, {"p": al}, player_count=2)
    assert result.validation.valid, " || ".join(result.validation.errors)
    tr = next(t for t in result.trial_results if t.trial_id == "purity")
    assert "p" not in tr.legal_entries
    assert "p" in tr.illegal_entries
    # ignore_entry does not populate the hard-invalidated map...
    assert "p" not in result.invalidated_trial_entries
    # ...but the illegality is still fully traced (REQ-5.4).
    evs = events_of(result, "illegal_entry", "p")
    assert len(evs) == 1
    assert evs[0].action == "ignore_entry"
    assert evs[0].trial_id == "purity"
    assert evs[0].affected_entries == ["purity"]
    assert "class:energy" in evs[0].reason


def test_illegal_entry_invalidate_action_records_and_traces():
    """``invalidate_entry`` additionally records the entry in the hard-invalidated
    map, and still traces it with the configured action."""
    cfg = make_config([_trial("purity", PURITY)], invalidation={"illegal_trial_entry": "invalidate_entry"})
    st = state(normal={"void": 3, "flux": 3})
    al = alloc(normal={"purity": {"void": 2, "flux": 1}})
    result = resolve_profile(cfg, {"p": st}, {"p": al}, player_count=2)
    assert result.invalidated_trial_entries.get("p", {}).get("purity")
    evs = events_of(result, "illegal_entry", "p")
    assert len(evs) == 1 and evs[0].action == "invalidate_entry"


# --------------------------------------------------------------------------- #
# REQ-5.2 — normal-domain over-allocation: whole-domain invalidation            #
# --------------------------------------------------------------------------- #


def test_overallocated_domain_invalidates_every_entry_using_that_domain():
    """Whole-domain scope: over-allocating a domain invalidates every entry drawing
    it; unrelated-domain entries remain eligible; the exact excess is reported and
    never clipped (REQ-5.2, REQ-4.7; §7.2)."""
    cfg = make_config(
        [_trial("a", PURITY), _trial("b", PURITY), _trial("c", PURITY)],
    )
    st = state(normal={"void": 11, "flux": 4})
    al = alloc(normal={"a": {"void": 6}, "b": {"void": 6}, "c": {"flux": 4}})  # void 12 > 11
    result = resolve_profile(cfg, {"p": st}, {"p": al}, player_count=2)

    assert result.overallocated_domains == {"p": {"void": 1}}
    assert result.invalidated_trial_entries["p"] == {
        "a": "overallocated_domain:void",
        "b": "overallocated_domain:void",
    }
    # The unrelated flux entry stays eligible.
    tr_c = next(t for t in result.trial_results if t.trial_id == "c")
    assert "p" in tr_c.legal_entries
    # One complete domain event with the exact excess and affected entries.
    evs = events_of(result, "overallocated_domain", "p")
    assert len(evs) == 1
    ev = evs[0]
    assert ev.domain == "void" and ev.excess == 1
    assert ev.action == "invalidate_entries_using_domain"
    assert ev.affected_entries == ["a", "b"]


# --------------------------------------------------------------------------- #
# REQ-5.2 — Wild over-allocation policy                                        #
# --------------------------------------------------------------------------- #


def test_wild_overallocation_invalidate_entries_using_wild():
    """Baseline ``invalidate_entries_using_wild``: every entry drawing Wild is
    invalidated even when its normal part is legal (§7.2)."""
    cfg = make_config(
        [_trial("purity", PURITY, rewards={"first": 6, "second": 0})],
        invalidation={"overallocated_wild": "invalidate_entries_using_wild"},
    )
    st = state(normal={"void": 3}, wild=1)
    al = alloc(normal={"purity": {"void": 3}}, wild={"purity": 2})  # wild 2 > 1
    result = resolve_profile(cfg, {"p": st}, {"p": al}, player_count=2)

    tr = next(t for t in result.trial_results if t.trial_id == "purity")
    assert "p" not in tr.legal_entries  # whole entry invalidated
    assert result.invalidated_trial_entries["p"]["purity"] == "overallocated_wild"
    evs = events_of(result, "overallocated_wild", "p")
    assert len(evs) == 1
    assert evs[0].excess == 1 and evs[0].action == "invalidate_entries_using_wild"
    assert evs[0].affected_entries == ["purity"]


def test_wild_overallocation_drop_wild_keeps_legal_normal_entry():
    """``drop_wild``: the Wild is dropped but the legal normal entry survives with
    its normal-only total (§7.2)."""
    cfg = make_config(
        [_trial("purity", PURITY, rewards={"first": 6, "second": 0})],
        invalidation={"overallocated_wild": "drop_wild"},
    )
    st = state(normal={"void": 3}, wild=1)
    al = alloc(normal={"purity": {"void": 3}}, wild={"purity": 2})  # wild 2 > 1
    result = resolve_profile(cfg, {"p": st}, {"p": al}, player_count=2)

    tr = next(t for t in result.trial_results if t.trial_id == "purity")
    assert "p" in tr.legal_entries  # normal entry kept
    assert tr.total_power["p"] == 3  # Wild dropped -> normal only, not 3+2
    assert result.dropped_wild_entries["p"]["purity"] == 2
    evs = events_of(result, "overallocated_wild", "p")
    assert len(evs) == 1 and evs[0].action == "drop_wild"


# --------------------------------------------------------------------------- #
# REQ-5.1 — malformed (invalid whole) allocation: reject_profile                #
# --------------------------------------------------------------------------- #


def test_malformed_allocation_rejects_profile_and_traces():
    """A negative allocation value is an invalid whole allocation: the configured
    ``malformed_allocation`` policy (reject_profile) rejects the profile and the
    event is traced (REQ-5.1, REQ-5.4, NFR-4)."""
    cfg = make_config([_trial("purity", PURITY)])
    st = state(normal={"void": 3})
    al = alloc(normal={"purity": {"void": -1}})
    result = resolve_profile(cfg, {"p": st}, {"p": al}, player_count=2)
    assert not result.validation.valid
    evs = events_of(result, "malformed_allocation", "p")
    assert len(evs) == 1
    assert evs[0].action == "reject_profile"
    assert "negative" in evs[0].reason


# --------------------------------------------------------------------------- #
# REQ-5.3 / REQ-6.1 — drop attached Wild when the normal entry is illegal        #
# --------------------------------------------------------------------------- #


def test_wild_dropped_when_normal_entry_is_illegal():
    """Wild attached to an illegal normal entry is dropped with the entry; it never
    leaks into the total (REQ-5.3)."""
    cfg = make_config([_trial("harmony", HARMONY)])
    st = state(normal={"void": 1}, wild=2)
    al = alloc(normal={"harmony": {"void": 1}}, wild={"harmony": 2})  # 1 source < 2 -> illegal
    result = resolve_profile(cfg, {"p": st}, {"p": al}, player_count=2)
    tr = next(t for t in result.trial_results if t.trial_id == "harmony")
    assert "p" not in tr.legal_entries
    assert tr.total_power.get("p", 0) == 0
    assert result.dropped_wild_entries["p"]["harmony"] == 2
    assert events_of(result, "illegal_entry", "p")[0].dropped_wild == 2


def test_wild_cannot_enter_without_a_legal_normal_entry():
    """REQ-6.1: on a Trial with no source minimum an empty normal entry passes
    eligibility, yet Wild-only entry is still blocked by
    ``requires_legal_normal_entry`` and the Wild is dropped."""
    cfg = make_config([_trial("open", OPEN)])
    st = state(wild=1)
    al = alloc(normal={}, wild={"open": 1})
    result = resolve_profile(cfg, {"p": st}, {"p": al}, player_count=2)
    tr = next(t for t in result.trial_results if t.trial_id == "open")
    assert "p" not in tr.legal_entries
    ev = events_of(result, "illegal_entry", "p")[0]
    assert ev.reason == "wild_without_normal" and ev.dropped_wild == 1


# --------------------------------------------------------------------------- #
# REQ-6 — Wild semantics                                                       #
# --------------------------------------------------------------------------- #


def test_wild_increases_primary_total_only_after_a_legal_normal_entry():
    """REQ-6.4: on a legal mono entry Wild adds to the primary total, while the
    qualifying source count stays at the single normal source (Wild is not a
    source, REQ-6.2/6.3)."""
    cfg = make_config([_trial("purity", PURITY, tiebreaks=("total_power", "qualifying_source_count", "shared"), rewards={"first": 6, "second": 0})])
    st = state(normal={"void": 1}, wild=1)
    al = alloc(normal={"purity": {"void": 1}}, wild={"purity": 1})
    result = resolve_profile(cfg, {"p": st}, {"p": al}, player_count=2)
    tr = next(t for t in result.trial_results if t.trial_id == "purity")
    assert "p" in tr.legal_entries
    assert tr.normal_totals["p"] == 1
    assert tr.wild_totals["p"] == 1
    assert tr.total_power["p"] == 2  # 1 normal + 1 Wild


def test_wild_excluded_from_local_tiebreak_statistics_by_default():
    """REQ-6.6: the default excludes Wild from local tiebreak statistics. Two
    entries tie on total_power (5 each) but the normal_power stage — which excludes
    Wild — separates them in favour of the all-normal entry."""
    cfg = make_config(
        [_trial("purity", PURITY, tiebreaks=("total_power", "normal_power", "shared"), rewards={"first": 6, "second": 0})],
    )
    all_normal = state("all_normal", normal={"void": 5})
    with_wild = state("with_wild", normal={"void": 4}, wild=1)
    als = {
        "all_normal": alloc("all_normal", normal={"purity": {"void": 5}}),
        "with_wild": alloc("with_wild", normal={"purity": {"void": 4}}, wild={"purity": 1}),
    }
    result = resolve_profile(cfg, {"all_normal": all_normal, "with_wild": with_wild}, als, player_count=2)
    tr = next(t for t in result.trial_results if t.trial_id == "purity")
    assert tr.total_power == {"all_normal": 5, "with_wild": 5}  # tie on total
    assert tr.placements[0] == ["all_normal"]  # normal_power (Wild excluded) breaks it
    assert not tr.shared_first


def test_wild_not_included_in_tiebreaks_flag_defaults_false():
    """The baseline/hybrid default WildRules excludes Wild from tiebreaks (REQ-6.6)."""
    cfg = make_config([_trial("purity", PURITY)])
    assert cfg.wild.included_in_tiebreaks is False


# --------------------------------------------------------------------------- #
# REQ-5.4 — the invalidation trace is complete and deterministic                #
# --------------------------------------------------------------------------- #


def test_invalidation_event_records_player_subject_reason_and_affected_entries():
    """Every event carries the four REQ-5.4 fields; the serialized trace is stable
    across repeated runs (NFR-1)."""
    cfg = make_config([_trial("a", PURITY), _trial("b", PURITY)])
    st = state(normal={"void": 5})
    al = alloc(normal={"a": {"void": 3}, "b": {"void": 3}})  # void 6 > 5
    r1 = resolve_profile(cfg, {"p": st}, {"p": al}, player_count=2)
    r2 = resolve_profile(cfg, {"p": st}, {"p": al}, player_count=2)
    ev = events_of(r1, "overallocated_domain", "p")[0]
    assert ev.player_id == "p"  # player
    assert ev.domain == "void"  # domain subject
    assert ev.reason  # reason
    assert ev.affected_entries == ["a", "b"]  # affected entries
    # Complete structured trace surfaces in the result dict and is deterministic.
    assert r1.to_dict()["invalidation_trace"]["events"]
    assert r1.deterministic_hash == r2.deterministic_hash


# --------------------------------------------------------------------------- #
# Adversarial fixtures A9, A10, A11 (REQ-9.4 source-backed oracles)             #
# --------------------------------------------------------------------------- #


def _state_from(raw: dict) -> PlayerState:
    return PlayerState(
        player_id=raw["player_id"],
        normal_power=dict(raw.get("normal_power", {})),
        wild_power=raw.get("wild_power", 0),
    )


def _alloc_from(raw: dict) -> Allocation:
    res = raw.get("residue", {})
    return Allocation(
        player_id=raw["player_id"],
        normal={t: dict(d) for t, d in raw.get("normal", {}).items()},
        wild=dict(raw.get("wild", {})),
        residue_normal=dict(res.get("normal", {})),
        residue_wild=res.get("wild", 0),
    )


@pytest.fixture
def a9():
    return json.loads((ADVERSARIAL / "a9_penny_squat.json").read_text(encoding="utf-8"))


@pytest.fixture
def a10():
    return json.loads((ADVERSARIAL / "a10_wild_legality.json").read_text(encoding="utf-8"))


@pytest.fixture
def a11():
    return json.loads((ADVERSARIAL / "a11_overallocation.json").read_text(encoding="utf-8"))


def test_a9_configs_are_valid(a9, a10, a11):
    for fx in (a9, a10, a11):
        assert validate_config_document(fx["config"]).valid, fx["id"]


def test_a9_penny_squat_wins_uncontested_and_resolves(a9):
    """A9: 1 legal normal power on a Trial the opponent skips -> full reward and an
    uncontested-award diagnostic. Under MAXIMAL completion the under-committed squat
    resolves with a warning rather than being rejected (Task-6 severity split)."""
    cfg = config_from_dict(a9["config"])
    states = {pid: _state_from(s) for pid, s in a9["states"].items()}
    allocs = {pid: _alloc_from(a) for pid, a in a9["allocations"].items()}
    result = resolve_profile(cfg, states, allocs, player_count=a9["player_count"])
    exp = a9["expected"]

    assert result.validation.valid is exp["resolves"]
    assert any("maximal completion violated" in w for w in result.validation.warnings) is exp["non_maximal_warning"]

    tr = next(t for t in result.trial_results if t.trial_id == "purity")
    assert tr.uncontested is exp["purity"]["uncontested"]
    assert tr.legal_entries == exp["purity"]["legal_entries"]
    assert tr.rewards_awarded == {exp["purity"]["winner"]: exp["purity"]["reward"]}
    assert {pid: pr.recognition_points for pid, pr in result.player_results.items()} == exp["recognition"]
    assert result.win_utility == exp["win_utility"]
    assert result.margin_utility == exp["margin_utility"]


@pytest.mark.parametrize("case_key", ["a10a_wild_only", "a10b_wild_cannot_satisfy_breadth", "a10c_wild_safe_on_mono"])
def test_a10_wild_legality_trio(a10, case_key):
    """A10a/b/c: Wild-only and Wild-cannot-satisfy-breadth entries are illegal with
    their Wild dropped; Wild is safe on a legal mono entry, adding to the total
    while the source count stays at one (§7.3)."""
    cfg = config_from_dict(a10["config"])
    case = a10["cases"][case_key]
    st = _state_from(case["state"])
    al = _alloc_from(case["allocation"])
    trial_id = case["trial"]
    exp = case["expected"]

    # Direct entry legality (shared resolver/maximality definition, design §7.5).
    trial = cfg.trial_map()[trial_id]
    legal, reason = legality.entry_is_legal(cfg, trial, al.normal_on(trial_id), 2, wild=al.wild_on(trial_id))
    assert legal is exp["legal"]

    result = resolve_profile(cfg, {"p": st}, {"p": al}, player_count=a10["player_count"])
    tr = next(t for t in result.trial_results if t.trial_id == trial_id)
    if exp["legal"]:
        assert "p" in tr.legal_entries
        assert tr.normal_totals["p"] == exp["normal_total"]
        assert tr.wild_totals["p"] == exp["wild_added"]
        assert tr.total_power["p"] == exp["total_power"]
        from ascension_trials.eligibility import qualifying_source_count

        assert qualifying_source_count(cfg, trial, al.normal_on(trial_id)) == exp["qualifying_source_count"]
        assert result.dropped_wild_entries.get("p", {}).get(trial_id, 0) == exp["dropped_wild"]
    else:
        assert "p" not in tr.legal_entries
        assert exp["reason_contains"] in reason
        assert result.dropped_wild_entries["p"][trial_id] == exp["dropped_wild"]
        assert tr.total_power.get("p", 0) == exp["total_power"]


def test_a11_overallocation_scope(a11):
    """A11: void 11 available, 12 allocated across two Trials -> excess 1; both void
    entries invalidated, the unrelated flux entry stays eligible, and the exact
    excess is reported (REQ-5.2, REQ-4.7)."""
    cfg = config_from_dict(a11["config"])
    st = _state_from(a11["state"])
    al = _alloc_from(a11["allocation"])
    result = resolve_profile(cfg, {st.player_id: st}, {st.player_id: al}, player_count=a11["player_count"])
    exp = a11["expected"]
    pid = st.player_id

    assert result.overallocated_domains[pid] == {exp["overallocated_domain"]: exp["excess"]}
    for tid in exp["invalidated_entries"]:
        assert result.invalidated_trial_entries[pid][tid] == f"overallocated_domain:{exp['overallocated_domain']}"
    for tid in exp["eligible_entries"]:
        tr = next(t for t in result.trial_results if t.trial_id == tid)
        assert pid in tr.legal_entries

    evs = events_of(result, "overallocated_domain", pid)
    assert len(evs) == 1
    ev = evs[0]
    ee = exp["invalidation_event"]
    assert ev.domain == ee["domain"]
    assert ev.excess == ee["excess"]
    assert ev.action == ee["action"]
    assert ev.affected_entries == ee["affected_entries"]
