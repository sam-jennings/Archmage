"""Task 19 - true strict-dominance elimination and weak diagnostics (REQ-11.3-11.7).

Verifies that strict dominance uses ``>`` in every column, removes all dominated
strategies simultaneously each round to an order-independent fixed point, keeps
weak dominance strictly separate, and reproduces the MATH-13 weak-but-not-strict
oracle and the A3 "(4,0) has zero strict beaters" oracle.
"""

from __future__ import annotations

import numpy as np
import pytest

from ascension_trials.dominance import (
    diagnose_weak_dominance,
    eliminate_strictly_dominated,
    strict_dominators_of,
)
from ascension_trials.enumerate import enumerate_allocations, find_allocation_by_normal_totals
from ascension_trials.matrix import build_two_player_payoff_matrix, strategy_id
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


# --------------------------------------------------------------------------- #
# MATH-13 - weak but not strict (REQ-11.7; impl spec §10.3)                     #
# --------------------------------------------------------------------------- #


def test_math13_strict_retains_weakly_dominated_strategy():
    fx = load_vs2_fixture("MATH-13")
    win = np.array(fx["win_matrix"], dtype=float)
    result = eliminate_strictly_dominated(win, fx["row_ids"], fx["col_ids"])
    # Strict elimination removes nothing (no strategy is strictly dominated).
    assert result.reasonable_row_ids == fx["expected"]["strict_survivors_rows"]
    assert result.reasonable_col_ids == fx["expected"]["strict_survivors_cols"]
    assert result.rounds == fx["expected"]["strict_rounds"] == 0
    assert result.removed_rows == [] and result.removed_cols == []


def test_math13_weak_diagnostics_flag_the_weakly_dominated():
    fx = load_vs2_fixture("MATH-13")
    win = np.array(fx["win_matrix"], dtype=float)
    weak = diagnose_weak_dominance(win, fx["row_ids"], fx["col_ids"])
    got = {
        (w.player, w.dominated_id, w.dominator_id, w.strict) for w in weak
    }
    for expected in fx["expected"]["weak_dominated"]:
        key = (expected["player"], expected["dominated"], expected["dominator"], expected["strict"])
        assert key in got
    # None of the weak relations is strict (that is the whole point of MATH-13).
    assert all(w.strict is False for w in weak)


# --------------------------------------------------------------------------- #
# A3 - (4,0) has zero strict dominators and is uncounterable                    #
# --------------------------------------------------------------------------- #


def test_a3_4_0_has_zero_strict_dominators():
    fx, cfg, state = _cfg_state("A3")
    allocs = enumerate_allocations(cfg, state, player_count=2)
    M = build_two_player_payoff_matrix(cfg, state, state, allocs, allocs, player_count=2)
    totals = tuple(fx["expected"]["named_strategy"]["normal_totals"])
    a40 = find_allocation_by_normal_totals(cfg, allocs, totals, player_count=2)
    idx = M.row_strategy_ids.index(strategy_id(cfg, state, a40))
    # No single strategy strictly dominates (4,0): zero strict dominators.
    assert strict_dominators_of(M.win, idx) == []
    # (4,0) survives iterated strict-dominance elimination.
    result = eliminate_strictly_dominated(M.win)
    assert idx in result.surviving_rows
    # C1 fails because (4,0) never loses — no strategy beats it head-to-head
    # through Recognition Points (an uncounterable pure strategy exists, audit D6).
    assert M.win[idx].min() >= 0
    assert not any(M.win[a, idx] == 1 and M.margin[a, idx] > 0 for a in range(M.win.shape[0]))


# --------------------------------------------------------------------------- #
# Simultaneity and order-independence (REQ-11.5, REQ-11.6)                      #
# --------------------------------------------------------------------------- #


def test_strictly_dominated_removed_simultaneously_in_one_round():
    # Row 0 strictly dominates rows 1 and 2 (single column each is enough here).
    win = np.array(
        [
            [5, 5, 5],
            [1, 1, 1],
            [0, 0, 0],
        ],
        dtype=float,
    )
    result = eliminate_strictly_dominated(win)
    removed_row_indices = {e.index for e in result.removed_rows}
    assert removed_row_indices == {1, 2}
    # Both dominated rows fall in the same (first) round -> simultaneous removal.
    assert all(e.round == 1 for e in result.removed_rows)


def test_fixed_point_is_independent_of_row_permutation():
    win = np.array([[5, 5, 5], [1, 1, 1], [0, 0, 0]], dtype=float)
    base = eliminate_strictly_dominated(win)
    perm = [2, 0, 1]
    permuted = win[np.ix_(perm, perm)]
    permuted_result = eliminate_strictly_dominated(permuted)
    # Same number of survivors regardless of ordering (order-independent fixed point).
    assert len(permuted_result.surviving_rows) == len(base.surviving_rows)


def test_a4_counter_cycle_has_no_strict_domination():
    fx, cfg, state = _cfg_state("A4")
    allocs = enumerate_allocations(cfg, state, player_count=2)
    M = build_two_player_payoff_matrix(cfg, state, state, allocs, allocs, player_count=2)
    result = eliminate_strictly_dominated(M.win)
    # The counter cycle means no allocation is strictly dominated: R = everything.
    assert len(result.surviving_rows) == 84
    assert result.rounds == 0
