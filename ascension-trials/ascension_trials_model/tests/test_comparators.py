"""Task 8 — Trial and final-result tiebreak comparators (REQ-8, REQ-7).

Covers, sourcing expected values from the design/model/impl-spec rather than
from engine output (REQ-9.4):

  * each Trial-tiebreak token's numerator/denominator semantics as EXACT
    ``Fraction`` (REQ-8.3/8.4), following design §6.1-§6.5 with DISTINCT
    denominators (utilization != efficiency, focus != commitment) rather than the
    normative-model §8.1 collapsed reading;
  * the preferred-local branch cannot read power outside the contested Trial
    (REQ-8.6) — proved both structurally (local comparators take only a
    :class:`TrialLocalView`) and behaviourally (their value is invariant to
    out-of-Trial power that the historical ratios do move on);
  * historical ratio branches are labelled historical (REQ-8.5);
  * every final-result tiebreak token (REQ-8.2);
  * the comparator chain runs in order until separated or ``shared`` (design
    §7.7/§7.9);
  * the source-backed adversarial fixtures A7 (ratio monotonicity trap) and A12
    (tie-cascade ordering + shared-first reward suppression).
"""

from __future__ import annotations

import json
from fractions import Fraction
from pathlib import Path

import pytest

from ascension_trials import comparators
from ascension_trials.comparators import (
    FinalTiebreakContext,
    TrialLocalView,
    TrialTiebreakContext,
)
from ascension_trials.config_loader import config_from_dict, validate_config_document
from ascension_trials.resolver import resolve_profile
from ascension_trials.schema import Allocation, Configuration, PlayerState

ADVERSARIAL = Path(__file__).resolve().parent.parent / "fixtures" / "adversarial"


# --------------------------------------------------------------------------- #
# Builders for isolated comparator unit tests                                  #
# --------------------------------------------------------------------------- #

_DOMAINS = [
    {"id": "void", "class": "energy"},
    {"id": "flux", "class": "energy"},
    {"id": "transformation", "class": "transformation"},
    {"id": "enchantment", "class": "enchantment"},
]


def cfg_with_trial(eligibility: dict, tiebreaks=("total_power", "shared")) -> Configuration:
    raw = {
        "id": "cmp_cfg",
        "version": "1.0",
        "supported_player_counts": [2],
        "power_formula": {
            "profile": "declarative",
            "standard_spell_power": {"type": "linear", "expression": "n"},
        },
        "domains": _DOMAINS,
        "trials": [
            {
                "id": "t",
                "active_player_counts": [2],
                "eligibility": eligibility,
                "trial_tiebreaks": list(tiebreaks),
            }
        ],
    }
    return config_from_dict(raw)


def trial_ctx(
    config: Configuration,
    normal_on: dict,
    state_normal: dict,
    *,
    allocated_normal_total: int | None = None,
    wild_total: int = 0,
    total_power: int | None = None,
) -> TrialTiebreakContext:
    trial = config.trials[0]
    normal_total = sum(p for p in normal_on.values() if p > 0)
    if total_power is None:
        total_power = normal_total + wild_total
    view = TrialLocalView(
        config=config,
        trial=trial,
        normal_on=dict(normal_on),
        normal_total=normal_total,
        total_power=total_power,
    )
    state = PlayerState(player_id="p", normal_power=dict(state_normal), wild_power=0)
    if allocated_normal_total is None:
        allocated_normal_total = normal_total
    return TrialTiebreakContext(
        local=view, state=state, allocated_normal_total=allocated_normal_total
    )


ENERGY_MONO = {
    "allowed_domain_classes": ["energy"],
    "source_count": {"universe": "class:energy", "minimum": 1, "maximum": 1},
}
ENERGY_MULTI = {
    "allowed_domain_classes": ["energy"],
    "source_count": {"universe": "class:energy", "minimum": 1},
}
# Admits energy + transformation, but COUNTS sources only within class:energy.
TWO_CLASS_COUNT_ENERGY = {
    "allowed_domain_classes": ["energy", "transformation"],
    "source_count": {"universe": "class:energy", "minimum": 1},
}


# --------------------------------------------------------------------------- #
# Preferred-local token semantics                                              #
# --------------------------------------------------------------------------- #


def test_total_power_is_the_local_trial_total():
    cfg = cfg_with_trial(ENERGY_MONO)
    ctx = trial_ctx(cfg, {"void": 5}, {"void": 5}, wild_total=2)
    assert comparators.trial_token_value("total_power", ctx) == 7


def test_normal_power_excludes_wild():
    cfg = cfg_with_trial(ENERGY_MONO)
    ctx = trial_ctx(cfg, {"void": 5}, {"void": 5}, wild_total=2, total_power=7)
    assert comparators.trial_token_value("normal_power", ctx) == 5


def test_qualifying_source_count_uses_the_counting_universe():
    cfg = cfg_with_trial(TWO_CLASS_COUNT_ENERGY)
    ctx = trial_ctx(cfg, {"void": 2, "transformation": 3}, {"void": 2, "transformation": 3})
    # universe class:energy counts only the energy source.
    assert comparators.trial_token_value("qualifying_source_count", ctx) == 1


def test_breadth_counts_qualifying_domains_and_differs_from_source_count():
    """breadth (design §6.5) counts distinct allow-list-qualifying domains, which
    is a DISTINCT comparator from qualifying_source_count (counted in the declared
    universe): here 2 vs 1."""
    cfg = cfg_with_trial(TWO_CLASS_COUNT_ENERGY)
    ctx = trial_ctx(cfg, {"void": 2, "transformation": 3}, {"void": 2, "transformation": 3})
    breadth = comparators.trial_token_value("breadth", ctx)
    qsc = comparators.trial_token_value("qualifying_source_count", ctx)
    assert breadth == 2
    assert qsc == 1
    assert breadth != qsc


# --------------------------------------------------------------------------- #
# Historical ratio token semantics (exact Fraction; design §6.1-§6.4)          #
# --------------------------------------------------------------------------- #


def test_legacy_utilization_numerator_and_denominator():
    """§6.1: (normal from qualifying used domains) / (capacity of those domains)."""
    cfg = cfg_with_trial(ENERGY_MULTI)
    # void+flux both qualify (energy). Capacity 4+6=10; on-Trial 3+2=5.
    ctx = trial_ctx(cfg, {"void": 3, "flux": 2}, {"void": 4, "flux": 6, "transformation": 99})
    assert comparators.trial_token_value("legacy_utilization", ctx) == Fraction(5, 10)


def test_utilization_restricts_to_qualifying_used_but_efficiency_uses_represented():
    """§6.1 vs §6.3 diverge when a represented domain is NOT allow-list-qualifying:
    utilization drops it from both numerator and denominator; efficiency keeps it."""
    cfg = cfg_with_trial(ENERGY_MONO)  # only energy qualifies
    ctx = trial_ctx(cfg, {"void": 3, "transformation": 2}, {"void": 4, "transformation": 10})
    utilization = comparators.trial_token_value("legacy_utilization", ctx)
    efficiency = comparators.trial_token_value("hybrid_efficiency", ctx)
    assert utilization == Fraction(3, 4)  # transformation excluded (not qualifying)
    assert efficiency == Fraction(5, 14)  # transformation included (represented)
    assert utilization != efficiency


def test_hybrid_efficiency_uses_capacity_of_represented_domains():
    """§6.3: normal-on-Trial / capacity of all normal domains represented."""
    cfg = cfg_with_trial(ENERGY_MULTI)
    ctx = trial_ctx(cfg, {"void": 3, "flux": 2}, {"void": 4, "flux": 6})
    assert comparators.trial_token_value("hybrid_efficiency", ctx) == Fraction(5, 10)


def test_legacy_focus_uses_normal_allocated_across_all_trials():
    """§6.2: normal-on-Trial / player's normal allocated across ALL Trials."""
    cfg = cfg_with_trial(ENERGY_MONO)
    ctx = trial_ctx(cfg, {"void": 5}, {"void": 5, "flux": 4}, allocated_normal_total=8)
    assert comparators.trial_token_value("legacy_focus", ctx) == Fraction(5, 8)


def test_hybrid_commitment_uses_total_spellbook_normal():
    """§6.4: normal-on-Trial / player's total normal Spellbook power."""
    cfg = cfg_with_trial(ENERGY_MONO)
    ctx = trial_ctx(cfg, {"void": 5}, {"void": 5, "enchantment": 3})
    assert comparators.trial_token_value("hybrid_commitment", ctx) == Fraction(5, 8)


def test_focus_and_commitment_diverge_when_normal_power_is_unallocated():
    """§6.2 vs §6.4 diverge exactly when a player leaves normal power unallocated:
    focus divides by allocated (5), commitment by the whole Spellbook (8). This is
    the A7 monotonicity mechanism."""
    cfg = cfg_with_trial(ENERGY_MONO)
    ctx = trial_ctx(
        cfg, {"void": 5}, {"void": 5, "enchantment": 3}, allocated_normal_total=5
    )
    focus = comparators.trial_token_value("legacy_focus", ctx)
    commitment = comparators.trial_token_value("hybrid_commitment", ctx)
    assert focus == Fraction(1, 1)
    assert commitment == Fraction(5, 8)
    assert focus != commitment


@pytest.mark.parametrize("token", sorted(comparators.HISTORICAL_TRIAL_TOKENS))
def test_ratio_zero_denominator_raises(token):
    """A zero/negative denominator is invalid input for a ratio tiebreak (impl
    spec §7.4) and fails loudly rather than producing a bogus comparison."""
    cfg = cfg_with_trial(ENERGY_MONO)
    # No capacity anywhere and nothing allocated elsewhere -> every ratio's
    # denominator collapses to zero, while the on-Trial numerator is positive.
    ctx = trial_ctx(cfg, {"void": 3}, {"void": 0}, allocated_normal_total=0)
    with pytest.raises(ValueError):
        comparators.trial_token_value(token, ctx)


# --------------------------------------------------------------------------- #
# Locality of the preferred branch (REQ-8.6)                                   #
# --------------------------------------------------------------------------- #


def test_local_comparators_accept_only_the_trial_view():
    """Structural locality: the preferred-local comparators take a TrialLocalView,
    which carries no state, no other Trial and no Spellbook total (REQ-8.6)."""
    cfg = cfg_with_trial(ENERGY_MULTI)
    view = TrialLocalView(
        config=cfg,
        trial=cfg.trials[0],
        normal_on={"void": 3, "flux": 2},
        normal_total=5,
        total_power=6,
    )
    assert comparators.local_total_power(view) == 6
    assert comparators.local_normal_power(view) == 5
    assert comparators.local_qualifying_source_count(view) == 2
    assert comparators.local_breadth(view) == 2


def test_local_tokens_ignore_out_of_trial_power_but_ratios_do_not():
    """Behavioural locality: hold the contested Trial fixed and vary only
    out-of-Trial power. Local tokens are invariant (REQ-8.6); the historical
    ratios move (that non-locality is why they are historical, REQ-8.5)."""
    cfg = cfg_with_trial(ENERGY_MONO)
    on_trial = {"void": 5}
    lean = trial_ctx(cfg, on_trial, {"void": 5}, allocated_normal_total=5)
    heavy = trial_ctx(cfg, on_trial, {"void": 8, "enchantment": 4}, allocated_normal_total=9)

    for token in sorted(comparators.LOCAL_TRIAL_TOKENS):
        assert comparators.trial_token_value(token, lean) == comparators.trial_token_value(
            token, heavy
        ), token

    # The commitment ratio, by contrast, changes with the out-of-Trial capacity.
    assert comparators.trial_token_value("hybrid_commitment", lean) == Fraction(1, 1)
    assert comparators.trial_token_value("hybrid_commitment", heavy) == Fraction(5, 12)


def test_token_classification_matches_local_and_historical_sets():
    assert comparators.LOCAL_TRIAL_TOKENS == {
        "total_power",
        "normal_power",
        "qualifying_source_count",
        "breadth",
    }
    assert comparators.HISTORICAL_TRIAL_TOKENS == {
        "legacy_utilization",
        "legacy_focus",
        "hybrid_efficiency",
        "hybrid_commitment",
    }
    for tok in comparators.LOCAL_TRIAL_TOKENS:
        assert comparators.is_local_token(tok) and not comparators.is_historical_token(tok)
    for tok in comparators.HISTORICAL_TRIAL_TOKENS:
        assert comparators.is_historical_token(tok) and not comparators.is_local_token(tok)


def test_ratio_semantics_are_documented_and_labelled_historical():
    """REQ-8.4/8.5: each ratio token declares its numerator, denominator and is
    labelled historical."""
    assert set(comparators.RATIO_SEMANTICS) == comparators.HISTORICAL_TRIAL_TOKENS
    for tok, meta in comparators.RATIO_SEMANTICS.items():
        assert meta["historical"] is True
        assert meta["numerator"] and meta["denominator"]
        assert meta["design_section"] in {"6.1", "6.2", "6.3", "6.4"}


def test_unknown_tokens_raise():
    cfg = cfg_with_trial(ENERGY_MONO)
    ctx = trial_ctx(cfg, {"void": 5}, {"void": 5})
    with pytest.raises(ValueError):
        comparators.trial_token_value("no_such_token", ctx)
    with pytest.raises(ValueError):
        comparators.final_token_value(
            "no_such_token", FinalTiebreakContext(state=ctx.state, sole_first_count=0)
        )


# --------------------------------------------------------------------------- #
# Final-result token semantics (model §8.2)                                    #
# --------------------------------------------------------------------------- #


def test_final_tokens_read_their_declared_sources():
    state = PlayerState(
        player_id="p",
        normal_power={"void": 7, "flux": 3},
        tiebreak_stats={"spell_count": 4, "largest_spell": 15},
    )
    ctx = FinalTiebreakContext(state=state, sole_first_count=2)
    assert comparators.final_token_value("first_place_trial_count", ctx) == 2
    assert comparators.final_token_value("total_normal_power", ctx) == 10
    assert comparators.final_token_value("spell_count", ctx) == 4
    assert comparators.final_token_value("largest_spell", ctx) == 15


def test_final_tokens_default_missing_stats_to_zero():
    ctx = FinalTiebreakContext(state=PlayerState(player_id="p"), sole_first_count=0)
    assert comparators.final_token_value("spell_count", ctx) == 0
    assert comparators.final_token_value("largest_spell", ctx) == 0
    assert comparators.final_token_value("total_normal_power", ctx) == 0


# --------------------------------------------------------------------------- #
# Fixture parsing helpers                                                      #
# --------------------------------------------------------------------------- #


def _state_from(raw: dict) -> PlayerState:
    return PlayerState(
        player_id=raw["player_id"],
        normal_power=dict(raw.get("normal_power", {})),
        wild_power=raw.get("wild_power", 0),
        tiebreak_stats=dict(raw.get("tiebreak_stats", {})),
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


def _states(mapping: dict) -> dict:
    return {pid: _state_from(s) for pid, s in mapping.items()}


def _allocs(mapping: dict) -> dict:
    return {pid: _alloc_from(a) for pid, a in mapping.items()}


def _load(name: str) -> dict:
    return json.loads((ADVERSARIAL / name).read_text(encoding="utf-8"))


@pytest.fixture
def a7():
    return _load("a7_monotonicity_trap.json")


@pytest.fixture
def a12():
    return _load("a12_tiebreak_cascade.json")


# --------------------------------------------------------------------------- #
# A7 — ratio monotonicity trap (impl spec §14 A7; MATH-8a)                      #
# --------------------------------------------------------------------------- #


def test_a7_configs_are_valid(a7):
    for cfg in a7["configs"].values():
        assert validate_config_document(cfg).valid


def test_a7_commitment_ratio_oracle(a7):
    """The design §6.4 commitment ratio for state 1 is A=5/8, B=1 -> B overtakes A.
    This is the exact-Fraction oracle that drives the resolver outcome."""
    states = _states(a7["states"]["state_1"])
    cfg = cfg_with_trial(ENERGY_MONO, tiebreaks=("hybrid_commitment", "shared"))
    a_ctx = trial_ctx(cfg, {"void": 5}, dict(states["A"].normal_power))
    b_ctx = trial_ctx(cfg, {"void": 5}, dict(states["B"].normal_power))
    va = comparators.trial_token_value("hybrid_commitment", a_ctx)
    vb = comparators.trial_token_value("hybrid_commitment", b_ctx)
    assert va == Fraction(5, 8)
    assert vb == Fraction(1, 1)
    assert vb > va


@pytest.mark.parametrize(
    "index", [0, 1, 2], ids=["state0_commitment_shared", "state1_commitment_B", "state1_local_shared"]
)
def test_a7_resolver_profiles(a7, index):
    res = a7["resolutions"][index]
    cfg = config_from_dict(a7["configs"][res["config"]])
    states = _states(a7["states"][res["state"]])
    allocs = _allocs(a7["allocations"][res["state"]])
    result = resolve_profile(cfg, states, allocs, player_count=a7["player_count"])
    assert result.validation.valid, " || ".join(result.validation.errors)

    exp = res["expected"]
    tr = next(t for t in result.trial_results if t.trial_id == "purity")
    assert tr.shared_first is exp["shared_first"]
    if exp["sole_first"] is None:
        assert tr.placements[0] == ["A", "B"]
    else:
        assert tr.placements[0] == [exp["sole_first"]]
    recognition = {pid: pr.recognition_points for pid, pr in result.player_results.items()}
    assert recognition == exp["recognition"]
    assert result.win_utility == exp["win_utility"]


def test_a7_extra_power_flips_commitment_winner_but_not_local(a7):
    """The whole point of A7: giving A unused Enchantment 3 changes B from a shared
    result (state 0) to an outright win (state 1) under Commitment, yet the local
    default chain still shares state 1 (no monotonicity inversion)."""
    commit = config_from_dict(a7["configs"]["commitment"])
    local = config_from_dict(a7["configs"]["local"])

    def winner_shared(cfg, state_key):
        result = resolve_profile(
            cfg, _states(a7["states"][state_key]), _allocs(a7["allocations"][state_key]), player_count=2
        )
        tr = next(t for t in result.trial_results if t.trial_id == "purity")
        return tr.shared_first

    assert winner_shared(commit, "state_0") is True   # state 0: shared
    assert winner_shared(commit, "state_1") is False  # state 1: B wins under Commitment
    assert winner_shared(local, "state_1") is True    # state 1: still shared locally


# --------------------------------------------------------------------------- #
# A12 — tiebreak cascade + shared-first suppression (impl spec §14 A12; MATH-7) #
# --------------------------------------------------------------------------- #


def test_a12a_source_count_breaks_the_tie(a12):
    case = a12["cases"]["a12a_source_count_tiebreak"]
    cfg = config_from_dict(case["config"])
    result = resolve_profile(
        cfg, _states(case["states"]), _allocs(case["allocations"]), player_count=case["player_count"]
    )
    assert result.validation.valid, " || ".join(result.validation.errors)
    exp = case["expected"]
    tr = next(t for t in result.trial_results if t.trial_id == exp["trial"])
    # Ties at total_power and normal_power, separated at qualifying_source_count.
    assert tr.total_power == exp["total_power"]
    assert tr.normal_totals == exp["normal_power"]
    assert tr.placements == [[exp["sole_first"]], ["B"]]
    assert tr.shared_first is exp["shared_first"]
    assert any(exp["deciding_token"] in line for line in tr.comparison_trace)
    recognition = {pid: pr.recognition_points for pid, pr in result.player_results.items()}
    assert recognition == exp["recognition"]
    assert result.win_utility == exp["win_utility"]
    assert result.margin_utility == exp["margin_utility"]


def test_a12b_source_count_stage_skipped_proceeds_to_shared(a12):
    case = a12["cases"]["a12b_source_count_skipped"]
    cfg = config_from_dict(case["config"])
    result = resolve_profile(
        cfg, _states(case["states"]), _allocs(case["allocations"]), player_count=case["player_count"]
    )
    assert result.validation.valid, " || ".join(result.validation.errors)
    exp = case["expected"]
    tr = next(t for t in result.trial_results if t.trial_id == exp["trial"])
    # Both mono entries tie through every applicable stage and share the award.
    assert tr.total_power == exp["total_power"]
    assert tr.placements == [["A", "B"]]
    assert tr.shared_first is exp["shared_first"]
    assert any(exp["deciding_token"] in line for line in tr.comparison_trace)
    recognition = {pid: pr.recognition_points for pid, pr in result.player_results.items()}
    assert recognition == exp["recognition"]
    assert result.win_utility == exp["win_utility"]


def test_a12c_shared_first_suppresses_second_place_when_enabled(a12):
    case = a12["cases"]["a12c_shared_first_suppression"]
    cfg = config_from_dict(case["config_suppress"])
    result = resolve_profile(
        cfg, _states(case["states"]), _allocs(case["allocations"]), player_count=case["player_count"]
    )
    assert result.validation.valid, " || ".join(result.validation.errors)
    exp = case["expected_suppress"]
    tr = next(t for t in result.trial_results if t.trial_id == exp["trial"])
    assert tr.placements[0] == exp["shared_first_group"]
    assert tr.shared_first is True
    # Shared first awarded to both; the lower place is suppressed (C gets nothing).
    assert tr.rewards_awarded == exp["rewards_awarded"]
    recognition = {pid: pr.recognition_points for pid, pr in result.player_results.items()}
    assert recognition == exp["recognition"]


def test_a12c_second_place_paid_when_suppression_disabled(a12):
    """The same shared-first Trial pays the lower place when the schema flag is off,
    proving the suppression is driven by ``suppress_lower_on_shared_first``."""
    case = a12["cases"]["a12c_shared_first_suppression"]
    cfg = config_from_dict(case["config_no_suppress"])
    result = resolve_profile(
        cfg, _states(case["states"]), _allocs(case["allocations"]), player_count=case["player_count"]
    )
    assert result.validation.valid, " || ".join(result.validation.errors)
    exp = case["expected_no_suppress"]
    tr = next(t for t in result.trial_results if t.trial_id == exp["trial"])
    assert tr.placements[0] == exp["shared_first_group"]
    assert tr.rewards_awarded == exp["rewards_awarded"]
    recognition = {pid: pr.recognition_points for pid, pr in result.player_results.items()}
    assert recognition == exp["recognition"]
