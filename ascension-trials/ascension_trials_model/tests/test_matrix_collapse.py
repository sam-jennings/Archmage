"""Tasks 17-18 - payoff matrices and strategic-equivalence collapse (REQ-11, REQ-12).

Verifies exhaustive two-player payoff construction, the win/margin antisymmetry that
follows from the resolver's player-swap symmetry, deterministic strategy ordering,
the matrix memory guard, and behavioural strategic collapse including the A15
equivalence-inflation invariance (MATH-12).
"""

from __future__ import annotations

import numpy as np
import pytest

from ascension_trials.enumerate import enumerate_allocations
from ascension_trials.matrix import (
    MAX_MATRIX_DIM,
    MatrixLimitError,
    build_two_player_payoff_matrix,
    collapse_strategies,
    strategy_id,
)
from ascension_trials.metrics import compute_small_state_metrics
from ascension_trials.schema import PlayerState

from vs2_support import (
    config_from_fixture_inline,
    load_referenced_config,
    load_vs2_fixture,
)


def _cfg_state(fixture_id, key="config_ref", state_key="state"):
    fx = load_vs2_fixture(fixture_id)
    cfg = load_referenced_config(fx, key)
    st = fx[state_key]
    state = PlayerState(
        player_id=st["player_id"],
        normal_power=dict(st["normal_power"]),
        wild_power=st.get("wild_power", 0),
    )
    return fx, cfg, state


# --------------------------------------------------------------------------- #
# Payoff-matrix construction (REQ-12.1, REQ-12.2)                              #
# --------------------------------------------------------------------------- #


def test_payoff_matrix_shape_and_strategy_order():
    fx, cfg, state = _cfg_state("A4")
    allocs = enumerate_allocations(cfg, state, player_count=2)
    M = build_two_player_payoff_matrix(cfg, state, state, allocs, allocs, player_count=2)
    assert M.shape == (84, 84)
    # Rows and columns index the same strategy set in the same order (self-play).
    assert M.row_strategy_ids == M.column_strategy_ids
    # Deterministic order = the (canonical) enumeration order.
    assert list(M.row_strategy_ids) == [strategy_id(cfg, state, a) for a in allocs]


def test_win_and_margin_are_antisymmetric_for_symmetric_play():
    fx, cfg, state = _cfg_state("A4")
    allocs = enumerate_allocations(cfg, state, player_count=2)
    M = build_two_player_payoff_matrix(cfg, state, state, allocs, allocs, player_count=2)
    assert np.array_equal(M.win, -M.win.T)
    assert np.array_equal(M.margin, -M.margin.T)
    # Diagonal (mirror match) is always a shared/tie: win 0, margin 0.
    assert np.all(np.diag(M.win) == 0)
    assert np.all(np.diag(M.margin) == 0)
    assert np.all(np.diag(M.final_tie))


def test_win_values_are_in_range_and_margin_matches_signs():
    fx, cfg, state = _cfg_state("A4")
    allocs = enumerate_allocations(cfg, state, player_count=2)
    M = build_two_player_payoff_matrix(cfg, state, state, allocs, allocs, player_count=2)
    assert set(np.unique(M.win)).issubset({-1, 0, 1})
    # Win sign agrees with margin sign wherever there is a decisive margin.
    decisive = M.margin != 0
    assert np.all(np.sign(M.win[decisive]) == np.sign(M.margin[decisive]))


def test_award_signature_length_matches_active_trials():
    fx, cfg, state = _cfg_state("A4")
    allocs = enumerate_allocations(cfg, state, player_count=2)
    M = build_two_player_payoff_matrix(cfg, state, state, allocs, allocs, player_count=2)
    assert len(M.trial_ids) == 3
    assert all(len(M.row_award_signatures[i][j]) == 3 for i in range(3) for j in range(3))


def test_matrix_limit_error_when_dimension_exceeds_ceiling():
    # Construct a tiny state but force the ceiling check by monkeypatching not
    # needed: use a fabricated oversized strategy list via the public guard.
    fx, cfg, state = _cfg_state("A4")
    allocs = enumerate_allocations(cfg, state, player_count=2)
    huge = list(allocs) * 0  # empty; we instead assert the guard triggers on dims
    # Directly exercise the guard by faking a dimension over the ceiling.
    from ascension_trials import matrix as matrix_mod

    with pytest.raises(MatrixLimitError):
        matrix_mod._check_matrix_limits(MAX_MATRIX_DIM + 1, 2)


# --------------------------------------------------------------------------- #
# Strategic-equivalence collapse (REQ-11.1, REQ-11.2)                          #
# --------------------------------------------------------------------------- #


def test_collapse_partitions_all_strategies_and_maps_members():
    fx, cfg, state = _cfg_state("A4")
    allocs = enumerate_allocations(cfg, state, player_count=2)
    M = build_two_player_payoff_matrix(cfg, state, state, allocs, allocs, player_count=2)
    collapse = collapse_strategies(M)
    # A4 has no behavioural duplicates: 84 distinct classes.
    assert collapse.class_count == 84
    # Every original strategy maps to exactly one representative, and members
    # partition the full strategy set.
    all_members = [m for members in collapse.classes.values() for m in members]
    assert sorted(all_members) == sorted(M.row_strategy_ids)
    assert set(collapse.representative_of) == set(M.row_strategy_ids)
    for rep, members in collapse.classes.items():
        assert rep in members
        for m in members:
            assert collapse.representative_of[m] == rep


def test_collapse_requires_symmetric_matrix():
    fx, cfg, state = _cfg_state("A4")
    allocs = enumerate_allocations(cfg, state, player_count=2)
    M = build_two_player_payoff_matrix(cfg, state, state, allocs[:3], allocs[:5], player_count=2)
    with pytest.raises(ValueError):
        collapse_strategies(M)


def test_collapse_groups_true_duplicates():
    # A5 tie-fest: every non-mirror pair ties, but the five allocations still
    # differ on the diagonal (mirror is a 10-10 double win vs 5-5). Confirm the
    # collapse is well-defined and each class's members share behaviour.
    fx, cfg, state = _cfg_state("A5")
    allocs = enumerate_allocations(cfg, state, player_count=2)
    M = build_two_player_payoff_matrix(cfg, state, state, allocs, allocs, player_count=2)
    collapse = collapse_strategies(M)
    # Behaviour within a class is identical by construction; re-verify.
    for members in collapse.classes.values():
        idxs = [M.row_strategy_ids.index(m) for m in members]
        base = idxs[0]
        for other in idxs[1:]:
            assert np.array_equal(M.win[base], M.win[other])
            assert np.array_equal(M.win[:, base], M.win[:, other])


# --------------------------------------------------------------------------- #
# A15 equivalence inflation (MATH-12)                                          #
# --------------------------------------------------------------------------- #


def test_a15_unenterable_trial_does_not_change_collapsed_count_or_metrics():
    fx = load_vs2_fixture("A15")
    base_cfg = load_referenced_config(fx, "base_config_ref")
    base_state = PlayerState(
        player_id=fx["base_state"]["player_id"],
        normal_power=dict(fx["base_state"]["normal_power"]),
        wild_power=fx["base_state"].get("wild_power", 0),
    )
    inflated_cfg = config_from_fixture_inline(fx, "inflated_config")
    inflated_state = PlayerState(
        player_id=fx["inflated_state"]["player_id"],
        normal_power=dict(fx["inflated_state"]["normal_power"]),
        wild_power=fx["inflated_state"].get("wild_power", 0),
    )

    base = compute_small_state_metrics(base_cfg, base_state, player_count=2)
    inflated = compute_small_state_metrics(inflated_cfg, inflated_state, player_count=2)

    # The unenterable Trial inflates the candidate space but adds no legal /
    # behaviourally-distinct strategy: every strategic metric is invariant.
    assert inflated.legal_count_a == base.legal_count_a == fx["expected"]["legal_allocations"]
    assert (
        inflated.collapsed_class_count
        == base.collapsed_class_count
        == fx["expected"]["collapsed_classes"]
    )
    assert inflated.reasonable_set_size == base.reasonable_set_size
    assert inflated.equilibrium_relevant_size == base.equilibrium_relevant_size
    assert inflated.final_tie_rate == base.final_tie_rate
