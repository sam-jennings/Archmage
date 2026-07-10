"""Tasks 20-22 - numerical zero-sum LP, max-entropy equilibrium, E^0.01 (REQ-12/13).

Verifies the HiGHS zero-sum solve (win and margin separately, with residuals and
labels), the A4 value-0/mixed-equilibrium oracle (MATH-11), the canonical
maximum-entropy equilibrium and its independent validation, and the MATH-14
equilibrium-relevant-mass oracle.
"""

from __future__ import annotations

from fractions import Fraction

import numpy as np
import pytest

from ascension_trials import equilibrium as eq
from ascension_trials.enumerate import enumerate_allocations
from ascension_trials.matrix import build_two_player_payoff_matrix
from ascension_trials.schema import PlayerState

from vs2_support import load_referenced_config, load_vs2_fixture


def _cfg_state(fixture_id):
    fx = load_vs2_fixture(fixture_id)
    cfg = load_referenced_config(fx)
    st = fx["state"]
    state = PlayerState(
        player_id=st["player_id"],
        normal_power=dict(st["normal_power"]),
        wild_power=st.get("wild_power", 0),
    )
    return fx, cfg, state


def _a4_win_margin():
    fx, cfg, state = _cfg_state("A4")
    allocs = enumerate_allocations(cfg, state, player_count=2)
    M = build_two_player_payoff_matrix(cfg, state, state, allocs, allocs, player_count=2)
    return fx, M


# --------------------------------------------------------------------------- #
# Zero-sum LP (REQ-12.3, 12.4, 12.5, 12.6; MATH-11)                             #
# --------------------------------------------------------------------------- #


def test_a4_win_game_value_is_zero_within_tolerance_and_mixed():
    fx, M = _a4_win_margin()
    sol = eq.solve_zero_sum(M.win, "win")
    assert sol.success
    assert abs(sol.value) <= fx["expected"]["lp_value_tolerance"] == 1e-9
    assert sol.evidence_class == "numerical_lp"
    # Mixed equilibrium: the optimal strategy spreads over more than one strategy.
    assert int((sol.row_strategy > 1e-9).sum()) > 1
    # Residuals within tolerance.
    assert sol.exploitability <= 1e-8
    assert sol.value_gap <= 1e-8


def test_win_and_margin_games_are_solved_separately():
    fx, M = _a4_win_margin()
    win = eq.solve_zero_sum(M.win, "win")
    margin = eq.solve_zero_sum(M.margin, "margin")
    assert win.utility == "win" and margin.utility == "margin"
    assert win.success and margin.success
    # Both symmetric zero-sum games have value 0.
    assert abs(win.value) <= 1e-9
    assert abs(margin.value) <= 1e-9


def test_lp_records_method_and_tolerance():
    fx, M = _a4_win_margin()
    sol = eq.solve_zero_sum(M.win, "win")
    assert "highs" in sol.method.lower()
    assert sol.tolerance == 1e-9
    assert "Optimal" in sol.status or "optimal" in sol.status.lower()


# --------------------------------------------------------------------------- #
# Canonical maximum-entropy equilibrium (REQ-13.1-13.3; impl spec §11.3)        #
# --------------------------------------------------------------------------- #


def test_a4_canonical_equilibrium_is_valid_and_mixed():
    fx, M = _a4_win_margin()
    sol = eq.solve_zero_sum(M.win, "win")
    me = eq.max_entropy_equilibrium(M.win, sol.value)
    assert me.valid
    assert me.status.startswith("ok")
    assert me.evidence_class == "numerical_convex"
    assert me.entropy > 0.0
    assert 0.0 < me.normalized_entropy <= 1.0
    assert me.support_1e_2 > 1  # mixed
    assert me.feasibility_residual <= eq.ENTROPY_FEASIBILITY_TOLERANCE
    assert me.optimality_residual <= eq.ENTROPY_OPTIMALITY_TOLERANCE


def test_max_entropy_is_deterministic():
    fx, M = _a4_win_margin()
    a = eq.max_entropy_equilibrium(M.win)
    b = eq.max_entropy_equilibrium(M.win)
    assert np.allclose(a.probabilities, b.probabilities, atol=1e-12)
    assert a.entropy == b.entropy


def test_max_entropy_prefers_uniform_on_a_symmetric_game():
    # Rock-paper-scissors: unique max-entropy optimum is uniform (1/3, 1/3, 1/3).
    rps = np.array([[0, -1, 1], [1, 0, -1], [-1, 1, 0]], dtype=float)
    me = eq.max_entropy_equilibrium(rps)
    assert me.valid
    assert np.allclose(me.probabilities, np.array([1 / 3, 1 / 3, 1 / 3]), atol=1e-6)


# --------------------------------------------------------------------------- #
# MATH-14 - equilibrium-relevant mass (REQ-13.4, 13.5; impl spec §11.4)         #
# --------------------------------------------------------------------------- #


def test_math14_per_strategy_max_mass_and_inclusion():
    fx = load_vs2_fixture("MATH-14")
    M = np.array(fx["win_matrix"], dtype=float)
    exp = fx["expected"]

    lp = eq.solve_zero_sum(M, "win")
    assert abs(lp.value - exp["game_value"]) <= exp["value_tolerance"]

    ers = eq.equilibrium_relevant_set(M, lp.value)
    expected_mass = [float(Fraction(s)) for s in exp["max_mass"]]
    assert np.allclose(ers.max_mass, expected_mass, atol=exp["mass_tolerance"])
    assert ers.included == exp["included_indices"]
    for excluded in exp["excluded_indices"]:
        assert excluded not in ers.included
    # The dominated strategy s3 carries essentially zero equilibrium mass — the
    # analytic value is exactly 0, reproduced within the fixture's declared numerical
    # tolerance (the tiny residual is the optimal-polytope slack, POLYTOPE_SLACK).
    assert ers.max_mass[3] <= exp["mass_tolerance"]


def test_math14_threshold_and_tolerance_are_recorded():
    fx = load_vs2_fixture("MATH-14")
    M = np.array(fx["win_matrix"], dtype=float)
    ers = eq.equilibrium_relevant_set(M)
    assert ers.threshold == 0.01
    assert ers.tolerance == 1e-9


def test_maximize_equilibrium_mass_matches_set_computation():
    fx = load_vs2_fixture("MATH-14")
    M = np.array(fx["win_matrix"], dtype=float)
    lp = eq.solve_zero_sum(M, "win")
    for i, want in enumerate([0.5, 0.5, 1.0, 0.0]):
        assert abs(eq.maximize_equilibrium_mass(M, i, lp.value) - want) <= 1e-6
