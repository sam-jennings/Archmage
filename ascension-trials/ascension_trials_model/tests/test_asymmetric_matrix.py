"""VS3 Task 2 - rectangular / asymmetric payoff construction (REQ-1, NFR-4).

Extends the VS2 payoff-matrix tests (``test_matrix_collapse.py``) to the asymmetric
case this spec adds:

* two independent, possibly-unequal states A and B produce a **rectangular** m x n
  matrix, every cell filled by an independent resolver call (REQ-1.3);
* the antisymmetry fast-path is used **only** at genuine parity (A == B decided on
  the full resolver-relevant state signature, including tiebreak statistics), never
  for asymmetric states (REQ-1.3) - and at parity it reproduces full per-cell
  resolution byte-for-byte;
* every cell is two-player zero-sum, ``u_B == -u_A`` for win and margin, verified by
  the resolver / player-swap (REQ-1.4);
* the per-side matrix/memory ceilings apply to m and n independently and refuse
  over-limit requests rather than sampling (REQ-1.6, NFR-4).

The planted "final Spellbook tiebreak" config is a hand-verifiable oracle for the
guard fix: two states with equal power but different ``spell_count`` make a genuinely
asymmetric game, so the antisymmetry short-cut would produce a wrong (antisymmetric)
matrix. The expected cell values below are derived by hand from the rules, not from
oracle output (REQ-9.4 provenance discipline carried from VS2).
"""

from __future__ import annotations

import numpy as np
import pytest

from ascension_trials import matrix as matrix_mod
from ascension_trials.config_loader import config_from_dict
from ascension_trials.enumerate import enumerate_allocations, normal_totals_by_trial
from ascension_trials.matrix import (
    MAX_MATRIX_DIM,
    MatrixLimitError,
    ZeroSumViolationError,
    _symmetric_inputs,
    build_two_player_payoff_matrix,
    strategy_id,
    verify_two_player_zero_sum,
)
from ascension_trials.schema import PlayerState

from vs2_support import load_referenced_config, load_vs2_fixture


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
# Planted asymmetric fixture: equal power, different final-tiebreak stat       #
# --------------------------------------------------------------------------- #
#
# One fungible domain, budget 1, two Trials each rewarding first = 1 (shared-full
# ties, decided locally by total_power then shared). The final result is decided by
# `spell_count` then `shared`. With budget 1 the three legal allocations are:
#   0 = enter nothing        (normal totals (0, 0))
#   a = enter trial_1 with 1 (normal totals (1, 0))
#   b = enter trial_2 with 1 (normal totals (0, 1))
# Two states hold equal power (fungible: 1) but different spell_count, so whenever
# Recognition Points tie the final tiebreak always breaks toward A. That makes the
# game genuinely asymmetric (NOT u = -u^T), so the antisymmetry fast-path is invalid.

ASYM_TIEBREAK_CONFIG = {
    "id": "asym_final_tiebreak_demo",
    "version": "1.0",
    "supported_player_counts": [2],
    "declared_tiebreak_stats": ["spell_count"],
    "power_formula": {
        "profile": "declarative",
        "standard_spell_power": {"type": "linear", "expression": "n"},
    },
    "domains": [{"id": "fungible", "class": "fungible"}],
    "trials": [
        {
            "id": "trial_1",
            "active_player_counts": [2],
            "eligibility": {
                "allowed_domain_classes": ["fungible"],
                "source_count": {"universe": "class:fungible", "minimum": 1},
            },
            "entry_floor": {"value": 0, "scope": "normal"},
            "tie_award": {"type": "shared_full"},
            "trial_tiebreaks": ["total_power", "shared"],
            "rewards": {"by_player_count": {"2": {"first": 1, "second": 0}}},
        },
        {
            "id": "trial_2",
            "active_player_counts": [2],
            "eligibility": {
                "allowed_domain_classes": ["fungible"],
                "source_count": {"universe": "class:fungible", "minimum": 1},
            },
            "entry_floor": {"value": 0, "scope": "normal"},
            "tie_award": {"type": "shared_full"},
            "trial_tiebreaks": ["total_power", "shared"],
            "rewards": {"by_player_count": {"2": {"first": 1, "second": 0}}},
        },
    ],
    "allocation": {
        "completion": "optional",
        "residue_allowed": True,
        "infeasible_full_fallback": "reject",
    },
    "final_result": {"final_tiebreaks": ["spell_count", "shared"]},
}


def _asym_setup():
    cfg = config_from_dict(ASYM_TIEBREAK_CONFIG)
    state_a = PlayerState(
        player_id="A", normal_power={"fungible": 1}, tiebreak_stats={"spell_count": 10}
    )
    state_b = PlayerState(
        player_id="B", normal_power={"fungible": 1}, tiebreak_stats={"spell_count": 1}
    )
    # Same budget => identical legal allocation set; reuse it for both sides so the
    # only difference between the players is the final-tiebreak statistic.
    allocs = enumerate_allocations(cfg, state_a, player_count=2)
    totals = {i: normal_totals_by_trial(cfg, a, 2) for i, a in enumerate(allocs)}
    idx = {
        "empty": next(i for i, t in totals.items() if t == (0, 0)),
        "a": next(i for i, t in totals.items() if t == (1, 0)),
        "b": next(i for i, t in totals.items() if t == (0, 1)),
    }
    return cfg, state_a, state_b, allocs, idx


# --------------------------------------------------------------------------- #
# Rectangular construction (REQ-1.2, REQ-1.3)                                  #
# --------------------------------------------------------------------------- #


def test_rectangular_shape_and_ids_from_two_states():
    """Unequal states with different-sized allocation spaces => rectangular matrix."""
    _fx, cfg, base = _cfg_state("A4")  # config: one fungible domain, 3 Trials (5/4/3)
    state_a = PlayerState(player_id="A", normal_power={"fungible": 2})
    state_b = PlayerState(player_id="B", normal_power={"fungible": 1})
    allocs_a = enumerate_allocations(cfg, state_a, player_count=2)
    allocs_b = enumerate_allocations(cfg, state_b, player_count=2)
    # Different budgets => different-sized legal spaces: C(2+3,3)=10 vs C(1+3,3)=4.
    assert len(allocs_a) == 10
    assert len(allocs_b) == 4

    M = build_two_player_payoff_matrix(cfg, state_a, state_b, allocs_a, allocs_b, player_count=2)
    assert M.shape == (10, 4)
    assert len(M.row_strategy_ids) == 10
    assert len(M.column_strategy_ids) == 4
    assert list(M.row_strategy_ids) == [strategy_id(cfg, state_a, a) for a in allocs_a]
    assert list(M.column_strategy_ids) == [strategy_id(cfg, state_b, b) for b in allocs_b]
    # Every cell filled by a resolver call: win in range, award signature per Trial.
    assert set(np.unique(M.win)).issubset({-1, 0, 1})
    assert len(M.trial_ids) == 3
    assert all(
        len(M.row_award_signatures[i][j]) == 3 for i in range(10) for j in range(4)
    )
    assert M.row_allocations == tuple(allocs_a)
    assert M.column_allocations == tuple(allocs_b)


def test_rectangular_matrix_is_zero_sum_via_resolver_player_swap():
    """Every cell of an asymmetric game is two-player zero-sum (REQ-1.4)."""
    _fx, cfg, _base = _cfg_state("A4")
    state_a = PlayerState(player_id="A", normal_power={"fungible": 2})
    state_b = PlayerState(player_id="B", normal_power={"fungible": 1})
    allocs_a = enumerate_allocations(cfg, state_a, player_count=2)
    allocs_b = enumerate_allocations(cfg, state_b, player_count=2)
    checked = verify_two_player_zero_sum(
        cfg, state_a, state_b, allocs_a, allocs_b, player_count=2, player_swap=True
    )
    assert checked == len(allocs_a) * len(allocs_b) == 40


# --------------------------------------------------------------------------- #
# Parity guard is decided on the FULL resolver-relevant signature (REQ-1.3)    #
# --------------------------------------------------------------------------- #


def test_parity_guard_true_only_for_resolver_identical_states():
    cfg, state_a, state_b, allocs, _idx = _asym_setup()
    ids = tuple(strategy_id(cfg, state_a, a) for a in allocs)
    # Identical states => parity => fast-path allowed.
    assert _symmetric_inputs(cfg, state_a, state_a, ids, ids) is True
    # Equal power/Wild but different tiebreak stats => NOT parity => fast-path refused.
    assert _symmetric_inputs(cfg, state_a, state_b, ids, ids) is False
    # Different strategy lists are never parity either.
    assert _symmetric_inputs(cfg, state_a, state_a, ids, ids[:-1]) is False


def test_asymmetric_final_tiebreak_matrix_is_not_antisymmetric():
    """Hand-verified: with A's spell_count > B's, every RP tie is won by A, so the
    win matrix is NOT antisymmetric and the antisymmetry short-cut would be wrong."""
    cfg, state_a, state_b, allocs, idx = _asym_setup()
    assert len(allocs) == 3
    M = build_two_player_payoff_matrix(cfg, state_a, state_b, allocs, allocs, player_count=2)

    ia, ib, ie = idx["a"], idx["b"], idx["empty"]

    # Hand-computed win utilities (row = A's alloc, col = B's alloc):
    #   (a, b): A wins trial_1, B wins trial_2 -> RP 1-1 tie -> spell_count -> A wins.
    #   (b, a): A wins trial_2, B wins trial_1 -> RP 1-1 tie -> spell_count -> A wins.
    #   (empty, empty): RP 0-0 tie -> spell_count -> A wins (would be 0 at true parity).
    assert M.win[ia, ib] == 1
    assert M.win[ib, ia] == 1        # antisymmetry would force -1 here
    assert M.win[ie, ie] == 1        # a diagonal WIN, impossible at genuine parity
    # (a, empty): A scores 1, B scores 0 -> A wins outright with a +1 margin.
    assert M.win[ia, ie] == 1
    assert M.margin[ia, ie] == 1
    # (empty, b): B scores 1, A scores 0 -> A loses.
    assert M.win[ie, ib] == -1
    assert M.margin[ie, ib] == -1

    # The WIN game is genuinely asymmetric: the final Spellbook tiebreak breaks every
    # RP tie toward A, so win != -win^T and the antisymmetry short-cut would be wrong.
    assert not np.array_equal(M.win, -M.win.T)
    # The MARGIN game, by contrast, stays antisymmetric here: spell_count decides only
    # the win sign, never Recognition Points, so u^M = r_A - r_B is still antisymmetric.
    # (This is exactly why win-optimal and margin-optimal play can differ - VS3 REQ-5/7.)
    assert np.array_equal(M.margin, -M.margin.T)
    # ...yet the win game is still strictly zero-sum in every cell.
    verify_two_player_zero_sum(cfg, state_a, state_b, allocs, allocs, player_count=2)


def test_guard_routes_asymmetric_states_to_full_resolution():
    """The default build (guard decides) equals a forced full per-cell build:
    proof the guard sent the asymmetric states down the full path, not the short-cut."""
    cfg, state_a, state_b, allocs, _idx = _asym_setup()
    default_build = build_two_player_payoff_matrix(
        cfg, state_a, state_b, allocs, allocs, player_count=2
    )
    forced_full = build_two_player_payoff_matrix(
        cfg, state_a, state_b, allocs, allocs, player_count=2, use_symmetry=False
    )
    assert np.array_equal(default_build.win, forced_full.win)
    assert np.array_equal(default_build.margin, forced_full.margin)
    assert np.array_equal(default_build.final_tie, forced_full.final_tie)
    assert default_build.row_award_signatures == forced_full.row_award_signatures


def test_counterfactual_antisymmetry_shortcut_would_be_wrong(monkeypatch):
    """If the fast-path were (wrongly) applied to these asymmetric states, the
    mirror-filled cell would disagree with the correct full resolution - which is
    exactly why the guard must gate the short-cut to true parity."""
    cfg, state_a, state_b, allocs, idx = _asym_setup()
    correct = build_two_player_payoff_matrix(
        cfg, state_a, state_b, allocs, allocs, player_count=2
    )
    # Force the antisymmetry short-cut on despite A != B.
    monkeypatch.setattr(matrix_mod, "_symmetric_inputs", lambda *a, **k: True)
    forced_shortcut = build_two_player_payoff_matrix(
        cfg, state_a, state_b, allocs, allocs, player_count=2, verify_zero_sum=False
    )

    ia, ib = idx["a"], idx["b"]
    # The correct game has A winning both RP-tie cells; the short-cut mirror-fills one
    # of them from B's (losing) utility, corrupting it.
    assert correct.win[ia, ib] == 1 and correct.win[ib, ia] == 1
    assert not np.array_equal(correct.win, forced_shortcut.win)
    # Precisely: the mirror cell is flipped to -1 by the invalid short-cut.
    assert forced_shortcut.win[ib, ia] == -1


# --------------------------------------------------------------------------- #
# Parity fast-path reproduces full per-cell resolution byte-for-byte           #
# --------------------------------------------------------------------------- #


@pytest.mark.parametrize("fixture_id", ["A5", "A3"])
def test_parity_fast_path_matches_full_resolution(fixture_id):
    _fx, cfg, state = _cfg_state(fixture_id)
    allocs = enumerate_allocations(cfg, state, player_count=2)
    fast = build_two_player_payoff_matrix(cfg, state, state, allocs, allocs, player_count=2)
    full = build_two_player_payoff_matrix(
        cfg, state, state, allocs, allocs, player_count=2, use_symmetry=False
    )
    assert np.array_equal(fast.win, full.win)
    assert np.array_equal(fast.margin, full.margin)
    assert np.array_equal(fast.final_tie, full.final_tie)
    assert fast.row_award_signatures == full.row_award_signatures
    assert fast.trial_shared_flags == full.trial_shared_flags
    # A genuine parity game is antisymmetric (this is the VS2 self-play property).
    assert np.array_equal(fast.win, -fast.win.T)
    assert np.array_equal(fast.margin, -fast.margin.T)


# --------------------------------------------------------------------------- #
# Per-side ceilings refuse over-limit, never sample (REQ-1.6, NFR-4)           #
# --------------------------------------------------------------------------- #


def test_dimension_ceiling_applies_to_each_side_independently():
    # Rows over the ceiling.
    with pytest.raises(MatrixLimitError):
        matrix_mod._check_matrix_limits(MAX_MATRIX_DIM + 1, 2)
    # Columns over the ceiling.
    with pytest.raises(MatrixLimitError):
        matrix_mod._check_matrix_limits(2, MAX_MATRIX_DIM + 1)


def test_byte_ceiling_refuses_over_memory_matrix():
    # Both dimensions are under the per-side dimension ceiling, but the estimated
    # byte footprint is over the memory ceiling -> still refused (no sampling).
    assert 4000 <= MAX_MATRIX_DIM
    with pytest.raises(MatrixLimitError):
        matrix_mod._check_matrix_limits(4000, 4000)


def test_build_refuses_over_limit_per_side_without_sampling(monkeypatch):
    """The builder itself refuses an over-ceiling rectangular request on either
    side, raising MatrixLimitError rather than truncating or sampling (NFR-4)."""
    _fx, cfg, _base = _cfg_state("A4")
    state_a = PlayerState(player_id="A", normal_power={"fungible": 2})
    state_b = PlayerState(player_id="B", normal_power={"fungible": 1})
    allocs_a = enumerate_allocations(cfg, state_a, player_count=2)  # 10
    allocs_b = enumerate_allocations(cfg, state_b, player_count=2)  # 4
    monkeypatch.setattr(matrix_mod, "MAX_MATRIX_DIM", 5)
    # Rows (10) exceed the shrunk ceiling.
    with pytest.raises(MatrixLimitError):
        build_two_player_payoff_matrix(cfg, state_a, state_b, allocs_a, allocs_b, player_count=2)
    # Columns exceed when the wider space is on the column side.
    with pytest.raises(MatrixLimitError):
        build_two_player_payoff_matrix(cfg, state_b, state_a, allocs_b, allocs_a, player_count=2)


def test_zero_sum_violation_error_is_raised_on_corrupt_resolver(monkeypatch):
    """The inline per-cell zero-sum guard fails loud if the resolver ever returns a
    non-zero-sum two-player outcome (REQ-1.4, NFR-4)."""
    cfg, state_a, state_b, allocs, _idx = _asym_setup()

    real_resolve = matrix_mod.resolve_profile

    def corrupt_resolve(*args, **kwargs):
        result = real_resolve(*args, **kwargs)
        # Break zero-sum: make B's win utility agree with A's instead of negating.
        result.win_utility[matrix_mod.COL_PLAYER] = result.win_utility.get(
            matrix_mod.ROW_PLAYER, 0
        )
        return result

    monkeypatch.setattr(matrix_mod, "resolve_profile", corrupt_resolve)
    with pytest.raises(ZeroSumViolationError):
        build_two_player_payoff_matrix(cfg, state_a, state_b, allocs, allocs, player_count=2)
