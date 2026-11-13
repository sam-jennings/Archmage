"""Task 9 — deterministic resolver finalization (REQ-7, NFR-1, NFR-2, NFR-4).

Exercises the finalized 13-step pipeline (design §7.1 normalize → §7.11 audit hash)
at the resolver level, sourcing every oracle from the spec/docs rather than from
engine output (REQ-9.4):

  * MATH-1 — determinism and symmetry (A1, A2):
      - A1: player relabelling COMMUTES with resolution — resolving then relabelling
        equals relabelling then resolving, including the audit hash "up to the
        relabelling" (REQ-7.3). Checked bounded-exhaustively over every permutation
        of the player labels (pure stdlib ``itertools.permutations``; no PBT lib).
      - A2: relabelling equivalent energy domains (same ``symmetry_group``) commutes
        with resolution — isomorphic result and hash-up-to-relabelling (REQ-7.4).
      - determinism: identical output + identical SHA-256 across repeated runs and
        across intentionally shuffled input key order (REQ-7.2; design §15.5).
  * The audit hash covers exactly the six §7.11 inputs — configuration version,
    normalized states, normalized allocations, validation/invalidation outcomes,
    Trial results and final results (REQ-7.2).
  * RP traceability — every awarded Recognition Point maps to exactly one configured
    award entry (REQ-7.5).
  * purity — resolution never mutates its inputs (NFR-2).
  * explicit failure on an infeasible full allocation, with no silent repair (NFR-4).
  * MATH-2 — conservation (allocated + residue = available) and A11 invalidation scope.
  * MATH-3 — the Maya A16 derivation oracle plus a derive→resolve integration.
  * MATH-4 — the Trials power profile (F_C(S)) flows into resolved Trial power.

The VS1 part of MATH-8 (A7 monotonicity resolver profiles) is covered by
``tests/test_comparators.py::test_a7_resolver_profiles`` and
``::test_a7_extra_power_flips_commitment_winner_but_not_local``.
"""

from __future__ import annotations

import copy
import itertools
import json
from pathlib import Path

import pytest

from ascension_trials.canonical import deterministic_hash
from ascension_trials.config_loader import config_from_dict, validate_config_document
from ascension_trials.power import derive_player_state
from ascension_trials.resolver import resolve_profile
from ascension_trials.schema import Allocation, PlayerState, Spell, Spellbook

ADVERSARIAL = Path(__file__).resolve().parent.parent / "fixtures" / "adversarial"

# void and flux share a symmetry_group, so they are interchangeable (A2).
DOMAINS = [
    {"id": "void", "class": "energy", "symmetry_group": "normal_energy"},
    {"id": "flux", "class": "energy", "symmetry_group": "normal_energy"},
    {"id": "transformation", "class": "transformation"},
]

MONO_ENERGY = {
    "allowed_domain_classes": ["energy"],
    "source_count": {"universe": "class:energy", "minimum": 1, "maximum": 1},
}
MULTI_ENERGY = {
    "allowed_domain_classes": ["energy"],
    "source_count": {"universe": "class:energy", "minimum": 2},
}


# --------------------------------------------------------------------------- #
# Builders                                                                     #
# --------------------------------------------------------------------------- #


def make_trial(
    tid: str,
    eligibility: dict,
    *,
    active=(2, 3),
    tiebreaks=("total_power", "normal_power", "shared"),
    rewards: dict | None = None,
    tie_award: str = "shared_full",
    suppress: bool = False,
) -> dict:
    trial = {
        "id": tid,
        "active_player_counts": list(active),
        "eligibility": eligibility,
        "trial_tiebreaks": list(tiebreaks),
        "tie_award": {"type": tie_award},
        "suppress_lower_on_shared_first": suppress,
    }
    if rewards is not None:
        trial["rewards"] = {"by_player_count": {str(k): v for k, v in rewards.items()}}
    return trial


def raw_config(
    trials: list[dict],
    *,
    version: str = "1.0",
    completion: str = "optional",
    fallback: str = "reject",
    final_tiebreaks=None,
    domains: list[dict] | None = None,
) -> dict:
    return {
        "id": "resolver_test",
        "version": version,
        "supported_player_counts": [2, 3],
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
        "final_result": {
            "final_tiebreaks": final_tiebreaks
            or ["first_place_trial_count", "total_normal_power", "shared"]
        },
    }


def make_config(trials: list[dict], **kwargs):
    raw = raw_config(trials, **kwargs)
    result = validate_config_document(raw)
    assert result.valid, " || ".join(result.errors)
    return config_from_dict(raw)


def state(pid: str, normal: dict | None = None, wild: int = 0, tiebreak_stats: dict | None = None) -> PlayerState:
    return PlayerState(
        player_id=pid,
        normal_power=dict(normal or {}),
        wild_power=wild,
        tiebreak_stats=dict(tiebreak_stats or {}),
    )


def alloc(pid: str, normal: dict | None = None, wild: dict | None = None) -> Allocation:
    return Allocation(
        player_id=pid,
        normal={t: {d: int(p) for d, p in doms.items()} for t, doms in (normal or {}).items()},
        wild={t: int(p) for t, p in (wild or {}).items()},
    )


# --------------------------------------------------------------------------- #
# Relabelling helpers (pure renamings used by A1 / A2)                          #
# --------------------------------------------------------------------------- #


def relabel(obj, mapping: dict):
    """Recursively rename any exact-match string (dict key or value) via ``mapping``.

    Player ids (upper-case) and domain ids (lower-case) are disjoint whole tokens,
    so an exact-match rename is unambiguous. For a resolved *valid* profile the
    only strings that are player/domain ids appear as keys or list/scalar id
    fields — never as substrings of prose — so this yields ``σ·payload`` exactly.
    """
    if isinstance(obj, dict):
        return {mapping.get(k, k): relabel(v, mapping) for k, v in obj.items()}
    if isinstance(obj, list):
        return [relabel(v, mapping) for v in obj]
    if isinstance(obj, str):
        return mapping.get(obj, obj)
    return obj


def _payload_no_hash(result) -> dict:
    """The exact structure the audit hash is taken over (hash field blanked)."""
    d = result.to_dict()
    d["audit"]["deterministic_hash"] = ""
    return d


def rename_state(s: PlayerState, mapping: dict) -> PlayerState:
    """Rename the player id AND every normal-power domain key via ``mapping``."""
    return PlayerState(
        player_id=mapping.get(s.player_id, s.player_id),
        normal_power={mapping.get(d, d): p for d, p in s.normal_power.items()},
        wild_power=s.wild_power,
        tiebreak_stats=dict(s.tiebreak_stats),
        independent_score=s.independent_score,
        power_profile_version=s.power_profile_version,
        provenance_type=s.provenance_type,
        provenance_source_id=s.provenance_source_id,
    )


def rename_alloc(a: Allocation, mapping: dict) -> Allocation:
    """Rename the player id AND every allocated domain key via ``mapping``."""
    return Allocation(
        player_id=mapping.get(a.player_id, a.player_id),
        normal={t: {mapping.get(d, d): p for d, p in doms.items()} for t, doms in a.normal.items()},
        wild=dict(a.wild),
        residue_normal={mapping.get(d, d): p for d, p in a.residue_normal.items()},
        residue_wild=a.residue_wild,
    )


def relabel_inputs(states: dict, allocs: dict, mapping: dict) -> tuple[dict, dict]:
    new_states = {mapping.get(pid, pid): rename_state(s, mapping) for pid, s in states.items()}
    new_allocs = {mapping.get(pid, pid): rename_alloc(a, mapping) for pid, a in allocs.items()}
    return new_states, new_allocs


# --------------------------------------------------------------------------- #
# Scenario fixtures (distinct outcomes so a relabelling is non-trivial)         #
# --------------------------------------------------------------------------- #


def three_player_scenario():
    """Three players with DISTINCT recognition points (P0=6, P2=5, P1=1).

    P0 wins Purity outright; P2 beats P1 on Harmony. No over-allocation, all
    entries legal, optional completion -> the resolved trace carries no
    player-id-bearing prose, so a pure relabelling reproduces it exactly.
    """
    cfg = make_config(
        [
            make_trial("purity", MONO_ENERGY, active=(3,), rewards={3: {"first": 6, "second": 2}}),
            make_trial(
                "harmony", MULTI_ENERGY, active=(3,), tiebreaks=("total_power", "shared"),
                rewards={3: {"first": 5, "second": 1}},
            ),
        ]
    )
    states = {
        "P0": state("P0", {"void": 6}),
        "P1": state("P1", {"void": 2, "flux": 2}),
        "P2": state("P2", {"void": 3, "flux": 3}),
    }
    allocs = {
        "P0": alloc("P0", normal={"purity": {"void": 6}}),
        "P1": alloc("P1", normal={"harmony": {"void": 2, "flux": 2}}),
        "P2": alloc("P2", normal={"harmony": {"void": 3, "flux": 3}}),
    }
    return cfg, states, allocs


def mirror_scenario():
    """A1 mirror tie: two identical players -> shared first on every Trial."""
    cfg = make_config(
        [make_trial("purity", MONO_ENERGY, active=(2,), rewards={2: {"first": 6, "second": 0}})]
    )
    states = {"P0": state("P0", {"void": 5}), "P1": state("P1", {"void": 5})}
    allocs = {
        "P0": alloc("P0", normal={"purity": {"void": 5}}),
        "P1": alloc("P1", normal={"purity": {"void": 5}}),
    }
    return cfg, states, allocs


# --------------------------------------------------------------------------- #
# MATH-1 — A1: player relabelling commutes with resolution (REQ-7.3)            #
# --------------------------------------------------------------------------- #


def test_a1_mirror_tie_is_shared_and_swap_symmetric():
    """A1 (impl spec §14): identical states and allocations produce identical RP, a
    shared final result, and player-swap symmetry (identical audit hash)."""
    cfg, states, allocs = mirror_scenario()
    result = resolve_profile(cfg, states, allocs, player_count=2)

    rp = {pid: pr.recognition_points for pid, pr in result.player_results.items()}
    assert rp == {"P0": 6, "P1": 6}
    tr = result.trial_results[0]
    assert tr.shared_first is True and tr.placements == [["P0", "P1"]]
    assert result.win_utility == {"P0": 0, "P1": 0}
    assert result.margin_utility == {"P0": 0, "P1": 0}

    # Swapping the two identical players leaves the inputs (hence the hash) unchanged.
    swap = {"P0": "P1", "P1": "P0"}
    s2, a2 = relabel_inputs(states, allocs, swap)
    swapped = resolve_profile(cfg, s2, a2, player_count=2)
    assert swapped.deterministic_hash == result.deterministic_hash


def _recanonicalize_players(payload: dict) -> dict:
    """Re-sort the label-sorted lists in a relabelled payload back into the
    resolver's canonical order.

    ``legal_entries``, each ``placements`` group and the award traces are ordered
    by player label, so a pure relabelling must be followed by a re-sort before it
    equals a freshly resolved result. Every other field is a map (compared
    order-independently) or label-free prose, so needs no adjustment.
    """
    p = copy.deepcopy(payload)

    def award_key(a: dict):
        return (a["trial_id"], a["place"] == "second", a["place"], a["player_id"])

    for tr in p["trial_results"]:
        tr["legal_entries"] = sorted(tr["legal_entries"])
        tr["placements"] = [sorted(group) for group in tr["placements"]]
        tr["award_trace"] = sorted(tr["award_trace"], key=award_key)
    p["audit"]["award_trace"] = sorted(p["audit"]["award_trace"], key=award_key)
    return p


@pytest.mark.parametrize("perm", list(itertools.permutations(["P0", "P1", "P2"])))
def test_a1_player_relabelling_commutes(perm):
    """Bounded-exhaustive over all 6 permutations: resolving then relabelling equals
    relabelling then resolving, INCLUDING the audit hash "up to the relabelling"
    (i.e. modulo re-sorting the label-ordered lists back to canonical order)."""
    cfg, states, allocs = three_player_scenario()
    sigma = dict(zip(["P0", "P1", "P2"], perm))

    base = resolve_profile(cfg, states, allocs, player_count=3)
    s_sigma, a_sigma = relabel_inputs(states, allocs, sigma)
    resolved_sigma = resolve_profile(cfg, s_sigma, a_sigma, player_count=3)

    # σ·resolve(x) (relabel then re-canonicalize) == resolve(σ·x): the whole
    # normalized trace commutes, and therefore so does the audit hash.
    expected = _recanonicalize_players(relabel(_payload_no_hash(base), sigma))
    assert _payload_no_hash(resolved_sigma) == expected
    assert resolved_sigma.deterministic_hash == deterministic_hash(expected)


def test_a1_recognition_and_utilities_permute():
    """The substantive results permute with the player labels (spot check of the
    commutativity proved structurally above)."""
    cfg, states, allocs = three_player_scenario()
    base = resolve_profile(cfg, states, allocs, player_count=3)
    base_rp = {pid: pr.recognition_points for pid, pr in base.player_results.items()}
    assert base_rp == {"P0": 6, "P1": 1, "P2": 5}

    sigma = {"P0": "P2", "P1": "P0", "P2": "P1"}
    s2, a2 = relabel_inputs(states, allocs, sigma)
    swapped = resolve_profile(cfg, s2, a2, player_count=3)
    swapped_rp = {pid: pr.recognition_points for pid, pr in swapped.player_results.items()}
    for pid, rp in base_rp.items():
        assert swapped_rp[sigma[pid]] == rp
        assert swapped.win_utility[sigma[pid]] == base.win_utility[pid]


# --------------------------------------------------------------------------- #
# MATH-1 — A2: equivalent energy-domain relabelling commutes (REQ-7.4)          #
# --------------------------------------------------------------------------- #


def test_a2_energy_domain_relabelling_commutes():
    """A2 (impl spec §14): relabelling two symmetry-group-equivalent energy domains
    (void<->flux) in the configuration, states and allocations yields an isomorphic
    resolution — identical player-facing outcomes and audit hash up to the relabel."""
    dmap = {"void": "flux", "flux": "void"}
    trials = [
        make_trial("purity", MONO_ENERGY, active=(2,), rewards={2: {"first": 6, "second": 0}}),
        make_trial(
            "harmony", MULTI_ENERGY, active=(2,), tiebreaks=("total_power", "shared"),
            rewards={2: {"first": 5, "second": 0}},
        ),
    ]
    cfg = make_config(trials)
    states = {
        "P0": state("P0", {"void": 6}),
        "P1": state("P1", {"void": 3, "flux": 3}),
    }
    allocs = {
        "P0": alloc("P0", normal={"purity": {"void": 6}}),
        "P1": alloc("P1", normal={"harmony": {"void": 3, "flux": 3}}),
    }
    base = resolve_profile(cfg, states, allocs, player_count=2)

    # Relabel the domains everywhere: config, states and allocations.
    raw_relabelled = copy.deepcopy(raw_config(trials))
    for d in raw_relabelled["domains"]:
        d["id"] = dmap.get(d["id"], d["id"])
    cfg2 = config_from_dict(raw_relabelled)
    states2 = {pid: rename_state(s, dmap) for pid, s in states.items()}
    allocs2 = {pid: rename_alloc(a, dmap) for pid, a in allocs.items()}
    relabelled = resolve_profile(cfg2, states2, allocs2, player_count=2)

    # Player-facing outcomes are domain-name independent -> identical.
    assert {p: r.recognition_points for p, r in relabelled.player_results.items()} == {
        p: r.recognition_points for p, r in base.player_results.items()
    }
    assert relabelled.win_utility == base.win_utility
    assert relabelled.margin_utility == base.margin_utility
    for tr_b, tr_r in zip(
        sorted(base.trial_results, key=lambda t: t.trial_id),
        sorted(relabelled.trial_results, key=lambda t: t.trial_id),
    ):
        assert tr_b.total_power == tr_r.total_power
        assert tr_b.placements == tr_r.placements

    # And the whole trace commutes: σ·resolve(x) == resolve(σ·x), hash included.
    expected = relabel(_payload_no_hash(base), dmap)
    assert _payload_no_hash(relabelled) == expected
    assert relabelled.deterministic_hash == deterministic_hash(expected)


# --------------------------------------------------------------------------- #
# MATH-1 — determinism (REQ-7.2; design §15.5)                                  #
# --------------------------------------------------------------------------- #


def test_determinism_repeated_runs_are_identical():
    cfg, states, allocs = three_player_scenario()
    r1 = resolve_profile(cfg, states, allocs, player_count=3)
    r2 = resolve_profile(cfg, states, allocs, player_count=3)
    assert r1.to_dict() == r2.to_dict()
    assert r1.deterministic_hash == r2.deterministic_hash


def _shuffle_state(s: PlayerState) -> PlayerState:
    return PlayerState(
        player_id=s.player_id,
        normal_power={k: s.normal_power[k] for k in reversed(list(s.normal_power))},
        wild_power=s.wild_power,
        tiebreak_stats={k: s.tiebreak_stats[k] for k in reversed(list(s.tiebreak_stats))},
    )


def _shuffle_alloc(a: Allocation) -> Allocation:
    return Allocation(
        player_id=a.player_id,
        normal={
            t: {d: a.normal[t][d] for d in reversed(list(a.normal[t]))}
            for t in reversed(list(a.normal))
        },
        wild={t: a.wild[t] for t in reversed(list(a.wild))},
    )


def test_determinism_is_independent_of_input_key_order():
    """Shuffling the insertion order of the state/allocation maps (players, domains,
    trials) changes nothing: normalization makes the output and hash identical (NFR-1)."""
    cfg, states, allocs = three_player_scenario()
    ordered = resolve_profile(cfg, states, allocs, player_count=3)

    shuffled_states = {pid: _shuffle_state(states[pid]) for pid in reversed(list(states))}
    shuffled_allocs = {pid: _shuffle_alloc(allocs[pid]) for pid in reversed(list(allocs))}
    shuffled = resolve_profile(cfg, shuffled_states, shuffled_allocs, player_count=3)

    assert shuffled.to_dict() == ordered.to_dict()
    assert shuffled.deterministic_hash == ordered.deterministic_hash


# --------------------------------------------------------------------------- #
# Audit hash covers the six §7.11 inputs (REQ-7.2)                              #
# --------------------------------------------------------------------------- #


def test_audit_hash_is_sha256_hex():
    cfg, states, allocs = three_player_scenario()
    h = resolve_profile(cfg, states, allocs, player_count=3).deterministic_hash
    assert len(h) == 64 and all(c in "0123456789abcdef" for c in h)


def test_audit_hash_depends_on_each_documented_input():
    """The hash moves when any of the six §7.11 components changes: configuration
    version, normalized states, normalized allocations, and the resolved outcomes."""
    trials = [make_trial("purity", MONO_ENERGY, active=(2,), rewards={2: {"first": 6, "second": 0}}),
              make_trial("purity_b", MONO_ENERGY, active=(2,), rewards={2: {"first": 4, "second": 0}})]
    cfg = make_config(trials)
    states = {"P0": state("P0", {"void": 5}), "P1": state("P1", {"void": 3})}
    allocs = {
        "P0": alloc("P0", normal={"purity": {"void": 5}}),
        "P1": alloc("P1", normal={"purity": {"void": 3}}),
    }
    base = resolve_profile(cfg, states, allocs, player_count=2).deterministic_hash

    # (1) configuration version.
    cfg_v2 = make_config(trials, version="2.0")
    assert resolve_profile(cfg_v2, states, allocs, player_count=2).deterministic_hash != base

    # (2) normalized states: change a state statistic that leaves the winner intact.
    states_s = {"P0": state("P0", {"void": 5}, tiebreak_stats={"spell_count": 9}), "P1": states["P1"]}
    assert resolve_profile(cfg, states_s, allocs, player_count=2).deterministic_hash != base

    # (3) normalized allocations: same per-domain totals, different Trial placement.
    allocs_a = {
        "P0": alloc("P0", normal={"purity_b": {"void": 5}}),
        "P1": allocs["P1"],
    }
    assert resolve_profile(cfg, states, allocs_a, player_count=2).deterministic_hash != base

    # (4) validation/invalidation + Trial/final outcomes: force an over-allocation.
    states_over = {"P0": state("P0", {"void": 3}), "P1": states["P1"]}
    over = resolve_profile(cfg, states_over, allocs, player_count=2)  # P0 allocates 5 > 3
    assert over.deterministic_hash != base
    assert over.overallocated_domains.get("P0", {}).get("void") == 2


# --------------------------------------------------------------------------- #
# RP traceability — every awarded RP maps to one configured award (REQ-7.5)     #
# --------------------------------------------------------------------------- #


def assert_rp_traceable(result, cfg) -> None:
    # (1) each traced award references exactly one configured entry, correctly valued.
    seen: set[tuple[str, str]] = set()
    for a in result.award_trace:
        key = (a.trial_id, a.player_id)
        assert key not in seen, f"more than one award for {key}"
        seen.add(key)
        trial = cfg.trial_map()[a.trial_id]
        configured = trial.rewards_by_player_count.get(a.player_count, {}).get(a.place, 0)
        assert a.configured_award == configured
        if a.tie_resolution == "divided":
            assert a.awarded == configured // a.group_size
        else:
            assert a.awarded == configured
    # (2) the trace reproduces each Trial's rewards exactly.
    for tr in result.trial_results:
        assert {a.player_id: a.awarded for a in tr.award_trace} == dict(tr.rewards_awarded)
    # (3) each player's RP total is the sum of their traced awards.
    for pid, pr in result.player_results.items():
        assert pr.recognition_points == sum(a.awarded for a in result.award_trace if a.player_id == pid)


def test_rp_traceable_sole_first_and_lower_place():
    cfg = make_config(
        [make_trial("solo", MONO_ENERGY, active=(3,), rewards={3: {"first": 6, "second": 2}})]
    )
    states = {"P0": state("P0", {"void": 6}), "P1": state("P1", {"void": 4}), "P2": state("P2", {"void": 2})}
    allocs = {
        "P0": alloc("P0", normal={"solo": {"void": 6}}),
        "P1": alloc("P1", normal={"solo": {"void": 4}}),
        "P2": alloc("P2", normal={"solo": {"void": 2}}),
    }
    result = resolve_profile(cfg, states, allocs, player_count=3)
    assert result.trial_results[0].rewards_awarded == {"P0": 6, "P1": 2}
    assert_rp_traceable(result, cfg)


def test_rp_traceable_shared_full_tie():
    cfg = make_config(
        [make_trial("harmony", MULTI_ENERGY, active=(2,), tiebreaks=("total_power", "shared"),
                    rewards={2: {"first": 5, "second": 0}}, tie_award="shared_full")]
    )
    states = {"P0": state("P0", {"void": 2, "flux": 2}), "P1": state("P1", {"void": 2, "flux": 2})}
    allocs = {
        "P0": alloc("P0", normal={"harmony": {"void": 2, "flux": 2}}),
        "P1": alloc("P1", normal={"harmony": {"void": 2, "flux": 2}}),
    }
    result = resolve_profile(cfg, states, allocs, player_count=2)
    tr = result.trial_results[0]
    assert tr.shared_first and tr.rewards_awarded == {"P0": 5, "P1": 5}
    assert all(a.tie_resolution == "shared_full" for a in result.award_trace)
    assert_rp_traceable(result, cfg)


def test_rp_traceable_divided_tie():
    cfg = make_config(
        [make_trial("split", MULTI_ENERGY, active=(3,), tiebreaks=("total_power", "shared"),
                    rewards={3: {"first": 9, "second": 0}}, tie_award="divided")]
    )
    states = {pid: state(pid, {"void": 1, "flux": 2}) for pid in ("P0", "P1", "P2")}
    allocs = {pid: alloc(pid, normal={"split": {"void": 1, "flux": 2}}) for pid in ("P0", "P1", "P2")}
    result = resolve_profile(cfg, states, allocs, player_count=3)
    tr = result.trial_results[0]
    assert tr.rewards_awarded == {"P0": 3, "P1": 3, "P2": 3}  # 9 // 3
    for a in result.award_trace:
        assert a.tie_resolution == "divided" and a.awarded == 3 and a.group_size == 3
    assert_rp_traceable(result, cfg)


# --------------------------------------------------------------------------- #
# Purity (NFR-2) and explicit failure (NFR-4)                                   #
# --------------------------------------------------------------------------- #


def test_resolution_does_not_mutate_inputs():
    cfg, states, allocs = three_player_scenario()
    states_before = copy.deepcopy(states)
    allocs_before = copy.deepcopy(allocs)
    resolve_profile(cfg, states, allocs, player_count=3)
    assert states == states_before
    assert allocs == allocs_before


def test_infeasible_full_allocation_fails_explicitly_without_repair():
    """NFR-4 / REQ-4.6: a FULL completion policy with unspendable residue and the
    ``reject`` fallback fails explicitly — no silent clip or repair."""
    cfg = make_config(
        [make_trial("purity", MONO_ENERGY, active=(2,), rewards={2: {"first": 6, "second": 0}})],
        completion="full",
        fallback="reject",
    )
    st = {"P0": state("P0", {"void": 5}), "P1": state("P1", {"void": 5})}
    al = {
        "P0": alloc("P0", normal={"purity": {"void": 3}}),  # leaves 2 unspendable -> infeasible
        "P1": alloc("P1", normal={"purity": {"void": 5}}),
    }
    result = resolve_profile(cfg, st, al, player_count=2)
    assert not result.validation.valid
    assert any("full completion infeasible" in e for e in result.validation.errors)
    # The over-budget power is reported, not clipped.
    assert result.conservation["P0"]["void"] == {"available": 5, "allocated": 3, "residue": 2}


# --------------------------------------------------------------------------- #
# MATH-2 — conservation and invalidation (A11)                                  #
# --------------------------------------------------------------------------- #


def test_math2_conservation_identity_holds_for_every_ledger():
    """MATH-2: for every normal domain and Wild, allocated + residue = available."""
    cfg, states, allocs = three_player_scenario()
    result = resolve_profile(cfg, states, allocs, player_count=3)
    for pid, cons in result.conservation.items():
        for dom, line in cons.items():
            assert line["allocated"] + line["residue"] == line["available"], (pid, dom)


def test_math2_a11_reports_exact_overallocation_and_scope():
    """MATH-2 / A11 (impl spec §14): 11 available, 12 allocated across two Trials ->
    excess 1; every entry using that domain is invalidated; the unrelated domain
    entry stays eligible. Oracle transcribed from the committed A11 fixture."""
    fx = json.loads((ADVERSARIAL / "a11_overallocation.json").read_text(encoding="utf-8"))
    cfg = config_from_dict(fx["config"])
    st = PlayerState(
        player_id=fx["state"]["player_id"],
        normal_power=dict(fx["state"]["normal_power"]),
        wild_power=fx["state"].get("wild_power", 0),
    )
    raw_alloc = fx["allocation"]
    al = Allocation(
        player_id=raw_alloc["player_id"],
        normal={t: dict(d) for t, d in raw_alloc["normal"].items()},
        wild=dict(raw_alloc.get("wild", {})),
    )
    result = resolve_profile(cfg, {st.player_id: st}, {st.player_id: al}, player_count=fx["player_count"])
    exp = fx["expected"]

    assert result.overallocated_domains[st.player_id] == {exp["overallocated_domain"]: exp["excess"]}
    for tid in exp["invalidated_entries"]:
        assert tid in result.invalidated_trial_entries[st.player_id]
    for tid in exp["eligible_entries"]:
        tr = next(t for t in result.trial_results if t.trial_id == tid)
        assert st.player_id in tr.legal_entries
    # conservation records the exact ledger; excess is never clipped.
    void_line = result.conservation[st.player_id][exp["overallocated_domain"]]
    assert void_line["allocated"] - void_line["available"] == exp["excess"]


# --------------------------------------------------------------------------- #
# MATH-3 — Maya A16 derivation oracle + derive->resolve integration             #
# --------------------------------------------------------------------------- #

MAYA_V28 = {"void": 14, "flux": 0, "radiance": 0, "aether": 9, "transformation": 17, "enchantment": 4}
MAYA_HYBRID = {"void": 11, "flux": 0, "radiance": 0, "aether": 9, "transformation": 16, "enchantment": 8}
MAYA_DOMAINS = [
    {"id": "void", "class": "energy"},
    {"id": "flux", "class": "energy"},
    {"id": "radiance", "class": "energy"},
    {"id": "aether", "class": "energy"},
    {"id": "transformation", "class": "transformation"},
    {"id": "enchantment", "class": "enchantment"},
]


def test_math3_maya_derivation_oracle(maya_spellbook, v28_config, hybrid_config):
    """MATH-3 / A16 (design §5.1.2/5.1.3, impl spec §A16): the source-backed derived
    power vectors for the Maya Spellbook under both profiles."""
    v28 = derive_player_state(maya_spellbook, v28_config)
    assert v28.normal_power == MAYA_V28 and v28.wild_power == 2
    hyb = derive_player_state(maya_spellbook, hybrid_config)
    assert hyb.normal_power == MAYA_HYBRID and hyb.wild_power == 2


def test_math3_maya_hybrid_state_resolves_and_conserves(maya_spellbook, hybrid_config):
    """Integration: the source-backed Maya (hybrid) derived state feeds the resolver;
    a full allocation of all 44 normal + 2 Wild power conserves exactly and every RP
    is traceable. (The specific 10/21/15 Trial totals need the hybrid_rebuild trial
    set + the committed A16 allocation, authored in Tasks 10-11.)"""
    maya = derive_player_state(maya_spellbook, hybrid_config, player_id="maya")
    assert maya.normal_power == MAYA_HYBRID and maya.wild_power == 2

    cfg = make_config(
        [
            make_trial("t_void", MONO_ENERGY, active=(2,), rewards={2: {"first": 5, "second": 0}}),
            make_trial("t_aether", MONO_ENERGY, active=(2,), tiebreaks=("total_power", "shared"),
                       rewards={2: {"first": 5, "second": 0}}),
            make_trial("t_transformation", {"allowed_domain_classes": ["transformation"]},
                       active=(2,), tiebreaks=("total_power", "shared"), rewards={2: {"first": 5, "second": 0}}),
            make_trial("t_enchantment", {"allowed_domain_classes": ["enchantment"]},
                       active=(2,), tiebreaks=("total_power", "shared"), rewards={2: {"first": 5, "second": 0}}),
        ],
        completion="full",
        domains=MAYA_DOMAINS,
    )
    empty = state("rival", {})
    maya_alloc = alloc(
        "maya",
        normal={
            "t_void": {"void": 11},
            "t_aether": {"aether": 9},
            "t_transformation": {"transformation": 16},
            "t_enchantment": {"enchantment": 8},
        },
        wild={"t_void": 2},
    )
    result = resolve_profile(cfg, {"maya": maya, "rival": empty}, {"maya": maya_alloc, "rival": alloc("rival")}, player_count=2)

    assert result.validation.valid, " || ".join(result.validation.errors)
    # Full allocation of the derived state: zero residue, conservation identity holds.
    assert result.residue["maya"] == {"normal": 0, "wild": 0}
    for dom, line in result.conservation["maya"].items():
        assert line["allocated"] + line["residue"] == line["available"]
    # Wild adds to its Trial only after a legal normal entry (void 11 + Wild 2).
    tv = next(t for t in result.trial_results if t.trial_id == "t_void")
    assert tv.total_power["maya"] == 13
    # Maya wins every Trial uncontested; RP fully traceable.
    assert {p: r.recognition_points for p, r in result.player_results.items()} == {"maya": 20, "rival": 0}
    assert_rp_traceable(result, cfg)


# --------------------------------------------------------------------------- #
# MATH-4 — the Trials power profile F_C(S) flows into resolved Trial power       #
# --------------------------------------------------------------------------- #


def test_math4_profile_choice_changes_resolved_trial_power(v28_config, hybrid_config):
    """MATH-4 / A17: a size-5 Conjuration derives Void 8 under the current candidate
    (1.5*5 half-up) and Void 7 under the experimental 2n-3 profile; that F_C(S)
    difference carries straight through the resolver into the Trial total."""
    book = Spellbook("five", [Spell("c5", "conjuration", 5, "void")])
    cfg = make_config([make_trial("purity", MONO_ENERGY, active=(2,), rewards={2: {"first": 6, "second": 0}})])

    def trial_total(profile_config, expected_power):
        st = derive_player_state(book, profile_config, player_id="solo")
        assert st.normal_power["void"] == expected_power
        rival = state("rival", {})
        result = resolve_profile(
            cfg,
            {"solo": st, "rival": rival},
            {"solo": alloc("solo", normal={"purity": {"void": expected_power}}), "rival": alloc("rival")},
            player_count=2,
        )
        tr = result.trial_results[0]
        return tr.total_power["solo"]

    assert trial_total(v28_config, 8) == 8
    assert trial_total(hybrid_config, 7) == 7
