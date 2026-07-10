"""Task 24 - VS2 acceptance suite (REQ-10..REQ-13; impl spec §13.3, §15 MATH-9..14).

The consolidated VS2 gate. Every oracle is loaded from committed fixture DATA
(fixtures/adversarial/) and driven end-to-end through the exact laboratory, so no
expected value is reverse-engineered from engine output (REQ-9.4). A requirement
coverage map (kept honest by audit tests) records where each VS2 requirement is
verified, mirroring the VS1 acceptance suite.
"""

from __future__ import annotations

import importlib
from fractions import Fraction

import numpy as np
import pytest

from ascension_trials import equilibrium as eq
from ascension_trials.dominance import (
    diagnose_weak_dominance,
    eliminate_strictly_dominated,
    strict_row_dominators_of,
)
from ascension_trials.enumerate import (
    enumerate_allocations,
    find_allocation_by_normal_totals,
    normal_totals_by_trial,
)
from ascension_trials.matrix import build_two_player_payoff_matrix, collapse_strategies, strategy_id
from ascension_trials.metrics import compute_small_state_metrics
from ascension_trials.schema import PlayerState

from vs2_support import (
    VS2_FIXTURES,
    config_from_fixture_inline,
    load_referenced_config,
    load_vs2_fixture,
)

# REQ-14.3 evidence-class vocabulary (shared with VS1).
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


def _state(fx, key="state"):
    st = fx[key]
    return PlayerState(
        player_id=st["player_id"],
        normal_power=dict(st["normal_power"]),
        wild_power=st.get("wild_power", 0),
    )


def _matrix_for(fixture_id):
    fx = load_vs2_fixture(fixture_id)
    cfg = load_referenced_config(fx)
    state = _state(fx)
    allocs = enumerate_allocations(cfg, state, player_count=fx["player_count"])
    M = build_two_player_payoff_matrix(cfg, state, state, allocs, allocs, player_count=fx["player_count"])
    return fx, cfg, state, allocs, M


def _unbeaten_count(win) -> int:
    """Rows that never lose (min over columns >= 0)."""
    return int(sum(1 for i in range(win.shape[0]) if win[i].min() >= 0))


# --------------------------------------------------------------------------- #
# A3 - Turtle (MATH-9)                                                         #
# --------------------------------------------------------------------------- #


def test_a3_acceptance():
    fx, cfg, state, allocs, M = _matrix_for("A3")
    exp = fx["expected"]
    assert len(allocs) == exp["legal_allocations"] == 15

    totals = tuple(exp["named_strategy"]["normal_totals"])
    a40 = find_allocation_by_normal_totals(cfg, allocs, totals, player_count=2)
    idx = M.row_strategy_ids.index(strategy_id(cfg, state, a40))
    assert strict_row_dominators_of(M.win, idx) == []  # zero strict beaters
    # (4,0) never loses, so the turtle is unbeaten (C1's unique-solve criterion fails).
    assert M.win[idx].min() >= 0
    assert exp["c1_fails"] is True


# --------------------------------------------------------------------------- #
# A4 - Counter cycle (MATH-9, MATH-11)                                         #
# --------------------------------------------------------------------------- #


def test_a4_acceptance_counts_and_cycle():
    fx, cfg, state, allocs, M = _matrix_for("A4")
    exp = fx["expected"]
    assert len(allocs) == exp["legal_allocations"] == 84
    assert _unbeaten_count(M.win) == exp["unbeaten_allocations"] == 0

    # Cycle: consecutive X -> Y means X beats Y (win[X][Y] == +1, win[Y][X] == -1).
    cycle = exp["cycle"]

    def index_of(totals):
        a = find_allocation_by_normal_totals(cfg, allocs, tuple(totals), player_count=2)
        return M.row_strategy_ids.index(strategy_id(cfg, state, a))

    for x, y in zip(cycle, cycle[1:]):
        ix, iy = index_of(x), index_of(y)
        assert M.win[ix][iy] == 1
        assert M.win[iy][ix] == -1


def test_a4_acceptance_numerical_equilibrium():
    fx, cfg, state, allocs, M = _matrix_for("A4")
    exp = fx["expected"]
    sol = eq.solve_zero_sum(M.win, "win")
    assert sol.success
    assert abs(sol.value - exp["win_lp_value"]) <= exp["lp_value_tolerance"]
    me = eq.max_entropy_equilibrium(M.win, sol.value)
    assert me.valid
    assert (me.support_1e_2 > 1) == exp["mixed_equilibrium"]


# --------------------------------------------------------------------------- #
# A5 - Tie-fest (MATH-10)                                                      #
# --------------------------------------------------------------------------- #


def test_a5_acceptance():
    fx, cfg, state, allocs, M = _matrix_for("A5")
    exp = fx["expected"]
    assert len(allocs) == exp["legal_allocations"] == 5

    n = M.win.shape[0]
    # Every non-mirror ordered pair is a final Recognition-Point tie (5-5).
    for i in range(n):
        for j in range(n):
            if i != j:
                assert M.final_tie[i][j], f"({i},{j}) not a tie"
                assert M.margin[i][j] == 0
                assert M.win[i][j] == 0
    assert exp["all_nonmirror_pairs_final_tie"] is True
    # Full ordered-pair tie rate = 1.
    tie_rate = Fraction(int(M.final_tie.sum()), n * n)
    assert tie_rate == Fraction(fx["expected"]["final_tie_rate"])


# --------------------------------------------------------------------------- #
# A6 - Counterable but poor (MATH-10)                                          #
# --------------------------------------------------------------------------- #


def test_a6_acceptance():
    fx, cfg, state, allocs, M = _matrix_for("A6")
    exp = fx["expected"]
    assert len(allocs) == exp["legal_allocations"] == 84
    assert _unbeaten_count(M.win) == exp["unbeaten_allocations"] == 0

    n = M.win.shape[0]
    tie_rate = Fraction(int(M.final_tie.sum()), n * n)
    assert tie_rate == Fraction(exp["ordered_pair_tie_rate"]) == Fraction(1, 3)


# --------------------------------------------------------------------------- #
# A15 - Equivalence inflation (MATH-12)                                        #
# --------------------------------------------------------------------------- #


def test_a15_acceptance_collapse_invariance():
    fx = load_vs2_fixture("A15")
    base_cfg = load_referenced_config(fx, "base_config_ref")
    base_state = _state(fx, "base_state")
    inflated_cfg = config_from_fixture_inline(fx, "inflated_config")
    inflated_state = _state(fx, "inflated_state")

    base = compute_small_state_metrics(base_cfg, base_state, player_count=2)
    inflated = compute_small_state_metrics(inflated_cfg, inflated_state, player_count=2)

    assert base.legal_count_a == inflated.legal_count_a == fx["expected"]["legal_allocations"]
    assert (
        base.collapsed_class_count
        == inflated.collapsed_class_count
        == fx["expected"]["collapsed_classes"]
    )
    assert base.reasonable_set_size == inflated.reasonable_set_size
    assert base.equilibrium_relevant_size == inflated.equilibrium_relevant_size
    assert base.final_tie_rate == inflated.final_tie_rate
    assert abs(base.win_value - inflated.win_value) <= 1e-9


# --------------------------------------------------------------------------- #
# MATH-13 - strict vs weak dominance                                           #
# --------------------------------------------------------------------------- #


def test_math13_acceptance():
    fx = load_vs2_fixture("MATH-13")
    win = np.array(fx["win_matrix"], dtype=float)
    strict = eliminate_strictly_dominated(win, fx["row_ids"], fx["col_ids"])
    assert strict.reasonable_row_ids == fx["expected"]["strict_survivors_rows"]
    assert strict.reasonable_col_ids == fx["expected"]["strict_survivors_cols"]
    assert strict.rounds == fx["expected"]["strict_rounds"]

    weak = diagnose_weak_dominance(win, fx["row_ids"], fx["col_ids"])
    got = {(w.player, w.dominated_id, w.dominator_id) for w in weak}
    for expected in fx["expected"]["weak_dominated"]:
        assert (expected["player"], expected["dominated"], expected["dominator"]) in got
    assert all(w.strict is False for w in weak)


# --------------------------------------------------------------------------- #
# MATH-14 - equilibrium-relevant mass                                          #
# --------------------------------------------------------------------------- #


def test_math14_acceptance():
    fx = load_vs2_fixture("MATH-14")
    M = np.array(fx["win_matrix"], dtype=float)
    exp = fx["expected"]
    lp = eq.solve_zero_sum(M, "win")
    assert abs(lp.value - exp["game_value"]) <= exp["value_tolerance"]
    ers = eq.equilibrium_relevant_set(M, lp.value)
    expected_mass = [float(Fraction(s)) for s in exp["max_mass"]]
    assert np.allclose(ers.max_mass, expected_mass, atol=exp["mass_tolerance"])
    assert ers.included == exp["included_indices"]


# --------------------------------------------------------------------------- #
# Fixture metadata / provenance (REQ-9.4, REQ-14)                              #
# --------------------------------------------------------------------------- #


@pytest.mark.parametrize("fixture_id", sorted(VS2_FIXTURES))
def test_vs2_fixture_carries_provenance_and_oracle(fixture_id):
    fx = load_vs2_fixture(fixture_id)
    assert fx.get("id") == fixture_id
    oracle = fx.get("oracle")
    assert isinstance(oracle, dict), f"{fixture_id}: missing oracle block"
    assert isinstance(oracle.get("source"), str) and oracle["source"].strip()
    assert oracle.get("evidence_class") in EVIDENCE_CLASSES
    assert oracle.get("independent_of_implementation") is True
    assert isinstance(fx.get("provenance"), str) and "REQ-9.4" in fx["provenance"]
    assert isinstance(fx.get("expected"), dict) and fx["expected"]


# --------------------------------------------------------------------------- #
# VS2 requirement coverage map (kept honest by audit tests)                    #
# --------------------------------------------------------------------------- #

REQUIREMENT_COVERAGE = {
    "REQ-10": [  # small-state enumeration
        ("test_enumeration", "test_a3_has_exactly_15_legal_allocations"),
        ("test_enumeration", "test_a4_has_exactly_84_legal_allocations"),
        ("test_enumeration", "test_enumeration_is_deterministic_and_ordered_by_canonical_key"),
        ("test_enumeration", "test_enumeration_refuses_over_ceiling_without_sampling"),
        ("test_enumeration", "test_maximal_subset_for_optional_a4"),
        ("self", "test_a3_acceptance"),
        ("self", "test_a4_acceptance_counts_and_cycle"),
    ],
    "REQ-11": [  # strategic equivalence + dominance
        ("test_matrix_collapse", "test_collapse_partitions_all_strategies_and_maps_members"),
        ("test_matrix_collapse", "test_a15_unenterable_trial_does_not_change_collapsed_count_or_metrics"),
        ("test_dominance", "test_math13_strict_retains_weakly_dominated_strategy"),
        ("test_dominance", "test_math13_weak_diagnostics_flag_the_weakly_dominated"),
        ("test_dominance", "test_strictly_dominated_removed_simultaneously_in_one_round"),
        ("test_dominance", "test_fixed_point_is_independent_of_row_permutation"),
        ("self", "test_a3_acceptance"),
        ("self", "test_a15_acceptance_collapse_invariance"),
        ("self", "test_math13_acceptance"),
    ],
    "REQ-12": [  # payoff matrices + zero-sum equilibrium
        ("test_matrix_collapse", "test_payoff_matrix_shape_and_strategy_order"),
        ("test_matrix_collapse", "test_win_and_margin_are_antisymmetric_for_symmetric_play"),
        ("test_matrix_collapse", "test_matrix_limit_error_when_dimension_exceeds_ceiling"),
        ("test_equilibrium", "test_a4_win_game_value_is_zero_within_tolerance_and_mixed"),
        ("test_equilibrium", "test_win_and_margin_games_are_solved_separately"),
        ("self", "test_a4_acceptance_numerical_equilibrium"),
    ],
    "REQ-13": [  # canonical equilibrium + E^0.01
        ("test_equilibrium", "test_a4_canonical_equilibrium_is_valid_and_mixed"),
        ("test_equilibrium", "test_max_entropy_prefers_uniform_on_a_symmetric_game"),
        ("test_equilibrium", "test_math14_per_strategy_max_mass_and_inclusion"),
        ("test_equilibrium", "test_maximize_equilibrium_mass_matches_set_computation"),
        ("self", "test_math14_acceptance"),
    ],
    "REQ-14": [  # reports + evidence labelling (VS2 additions)
        ("test_vs2_reports", "test_small_state_report_has_metadata_and_evidence_labels"),
        ("test_vs2_reports", "test_small_state_report_is_byte_stable"),
        ("self", "test_vs2_fixture_carries_provenance_and_oracle"),
    ],
}


def test_coverage_map_covers_every_vs2_requirement():
    required = {"REQ-10", "REQ-11", "REQ-12", "REQ-13", "REQ-14"}
    assert required.issubset(set(REQUIREMENT_COVERAGE))
    for req, tests in REQUIREMENT_COVERAGE.items():
        assert tests, f"{req} has no covering tests"


def test_coverage_map_references_only_existing_tests():
    this_module = importlib.import_module(__name__)
    for req, entries in REQUIREMENT_COVERAGE.items():
        for module_name, test_name in entries:
            module = this_module if module_name == "self" else importlib.import_module(module_name)
            assert hasattr(module, test_name), f"{req}: missing {module_name}::{test_name}"
