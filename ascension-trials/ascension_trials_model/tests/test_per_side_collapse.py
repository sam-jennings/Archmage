"""VS3 Task 3 - per-side strategic collapse and canonical row/column mixtures.

Covers REQ-2 (per-side collapse; separate canonical row/column maximum-entropy
mixtures; per-side E^0.01; parity coincidence) and REQ-9 (rectangular zero-sum
solve). Extends the VS2 collapse/equilibrium suites (``test_matrix_collapse.py``,
``test_equilibrium.py``) to the asymmetric case this spec adds:

* :func:`collapse_strategies_per_side` collapses rows and columns **independently**
  over their own behaviour vectors, keeping a representative->members map per side
  (REQ-2.1);
* at genuine parity the two per-side maps coincide with each other and with the
  single VS2 :func:`collapse_strategies`, and the reduced matrix is byte-identical
  (design §5.2) - checked on the committed parity fixtures A4 (no merge) and A19
  (a genuine interchangeable-domain merge, 9 legal -> 6 classes);
* :func:`solve_two_sided_equilibrium` produces separate canonical row (maximin) and
  column (minimax) maximum-entropy mixtures and a per-side E^0.01 from one rectangular
  solve (REQ-2.2, REQ-2.3), and at parity the two mixtures / relevant sets coincide
  with the single VS2 canonical equilibrium (REQ-2.4);
* all ordering is deterministic and independent of dict/hash iteration order (NFR-1).

The A19 collapse oracle (6 classes, sizes {1,1,1,2,2,2}) is hand-derived in the VS2-C
audit, not reverse-engineered from engine output (REQ-9.4 provenance discipline).
"""

from __future__ import annotations

import numpy as np
import pytest

from ascension_trials import equilibrium as eq
from ascension_trials.enumerate import enumerate_allocations
from ascension_trials.matrix import (
    PerSideCollapseResult,
    build_two_player_payoff_matrix,
    collapse_strategies,
    collapse_strategies_per_side,
    strategy_id,
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


def _self_play_matrix(fixture_id):
    fx, cfg, state = _cfg_state(fixture_id)
    allocs = enumerate_allocations(cfg, state, player_count=2)
    M = build_two_player_payoff_matrix(cfg, state, state, allocs, allocs, player_count=2)
    return fx, M


def _rectangular_matrix():
    """A4 config with unequal budgets (2 vs 1) -> a genuinely rectangular 10x4 game."""
    _fx, cfg, _base = _cfg_state("A4")
    state_a = PlayerState(player_id="A", normal_power={"fungible": 2})
    state_b = PlayerState(player_id="B", normal_power={"fungible": 1})
    allocs_a = enumerate_allocations(cfg, state_a, player_count=2)
    allocs_b = enumerate_allocations(cfg, state_b, player_count=2)
    M = build_two_player_payoff_matrix(cfg, state_a, state_b, allocs_a, allocs_b, player_count=2)
    return cfg, state_a, state_b, M


def _assert_payoff_matrices_equal(m1, m2):
    assert m1.row_strategy_ids == m2.row_strategy_ids
    assert m1.column_strategy_ids == m2.column_strategy_ids
    assert np.array_equal(m1.win, m2.win)
    assert np.array_equal(m1.margin, m2.margin)
    assert np.array_equal(m1.final_tie, m2.final_tie)
    assert m1.row_award_signatures == m2.row_award_signatures
    assert m1.trial_shared_flags == m2.trial_shared_flags
    assert m1.trial_ids == m2.trial_ids


# --------------------------------------------------------------------------- #
# Per-side collapse reproduces the VS2 single collapse at parity (REQ-2.1/2.4) #
# --------------------------------------------------------------------------- #


@pytest.mark.parametrize("fixture_id", ["A4", "A5", "A19"])
def test_per_side_collapse_reproduces_vs2_single_collapse_at_parity(fixture_id):
    """At genuine parity the row and column maps coincide with each other and with
    the single VS2 collapse, and the reduced matrix is byte-identical (design §5.2)."""
    _fx, M = _self_play_matrix(fixture_id)
    vs2 = collapse_strategies(M)  # square symmetric VS2 path (byte-identical, untouched)
    per_side = collapse_strategies_per_side(M)

    # The two per-side maps coincide with each other...
    assert per_side.row_classes == per_side.column_classes
    assert per_side.row_representative_of == per_side.column_representative_of
    # ...and with the single VS2 collapse.
    assert per_side.row_classes == vs2.classes
    assert per_side.row_representative_of == vs2.representative_of
    assert per_side.row_class_count == per_side.column_class_count == vs2.class_count
    # The reduced matrix is byte-for-byte the VS2 reduced matrix.
    _assert_payoff_matrices_equal(per_side.matrix, vs2.matrix)


def test_a19_per_side_collapse_matches_hand_derived_oracle():
    """A19: two interchangeable domains -> 9 legal, 6 collapsed classes, sizes
    {1,1,1,2,2,2} (hand-derived VS2-C audit oracle, REQ-9.4)."""
    fx, M = _self_play_matrix("A19")
    exp = fx["expected"]
    assert M.shape == (exp["legal_allocations"], exp["legal_allocations"]) == (9, 9)

    per_side = collapse_strategies_per_side(M)
    assert per_side.row_class_count == exp["collapsed_classes"] == 6
    assert per_side.column_class_count == exp["collapsed_classes"] == 6
    row_sizes = sorted(len(members) for members in per_side.row_classes.values())
    col_sizes = sorted(len(members) for members in per_side.column_classes.values())
    assert row_sizes == col_sizes == exp["collapsed_class_sizes"] == [1, 1, 1, 2, 2, 2]

    # Every original strategy is a member of exactly one class on each side.
    row_members = [m for members in per_side.row_classes.values() for m in members]
    assert sorted(row_members) == sorted(M.row_strategy_ids)
    col_members = [m for members in per_side.column_classes.values() for m in members]
    assert sorted(col_members) == sorted(M.column_strategy_ids)


# --------------------------------------------------------------------------- #
# Rectangular per-side collapse: independent maps, no square-symmetry needed   #
# --------------------------------------------------------------------------- #


def test_collapse_strategies_still_requires_square_symmetric_matrix():
    """The VS2 square collapse still refuses a rectangular matrix (unchanged); the
    per-side collapse is the rectangular path (REQ-2.1)."""
    _cfg, _sa, _sb, M = _rectangular_matrix()
    assert M.shape == (10, 4)
    with pytest.raises(ValueError):
        collapse_strategies(M)


def test_per_side_collapse_handles_rectangular_matrix_independently():
    cfg, state_a, state_b, M = _rectangular_matrix()
    per_side = collapse_strategies_per_side(M)
    assert isinstance(per_side, PerSideCollapseResult)

    # Row and column sides collapse over their own (different-sized) strategy sets.
    assert 1 <= per_side.row_class_count <= 10
    assert 1 <= per_side.column_class_count <= 4
    assert per_side.matrix.shape == (per_side.row_class_count, per_side.column_class_count)

    # Members partition each side; representative is a member; maps cover every id.
    row_members = [m for members in per_side.row_classes.values() for m in members]
    assert sorted(row_members) == sorted(M.row_strategy_ids)
    assert set(per_side.row_representative_of) == set(M.row_strategy_ids)
    for rep, members in per_side.row_classes.items():
        assert rep in members
        assert rep == min(members)  # lexicographically-smallest id is the representative
        for m in members:
            assert per_side.row_representative_of[m] == rep

    col_members = [m for members in per_side.column_classes.values() for m in members]
    assert sorted(col_members) == sorted(M.column_strategy_ids)
    assert set(per_side.column_representative_of) == set(M.column_strategy_ids)
    for rep, members in per_side.column_classes.items():
        assert rep in members
        assert rep == min(members)
        for m in members:
            assert per_side.column_representative_of[m] == rep


def test_reduced_matrix_cells_match_original_at_representative_indices():
    """The reduced rectangular matrix is exactly the submatrix over row/column
    representatives (REQ-2.1)."""
    cfg, state_a, state_b, M = _rectangular_matrix()
    per_side = collapse_strategies_per_side(M)
    reduced = per_side.matrix

    row_index = {sid: i for i, sid in enumerate(M.row_strategy_ids)}
    col_index = {sid: j for j, sid in enumerate(M.column_strategy_ids)}
    for a, rep_row in enumerate(reduced.row_strategy_ids):
        for b, rep_col in enumerate(reduced.column_strategy_ids):
            i = row_index[rep_row]
            j = col_index[rep_col]
            assert reduced.win[a, b] == M.win[i, j]
            assert reduced.margin[a, b] == M.margin[i, j]
            assert bool(reduced.final_tie[a, b]) == bool(M.final_tie[i, j])
            assert reduced.row_award_signatures[a][b] == M.row_award_signatures[i][j]


def test_rectangular_column_side_collapses_interchangeable_domains_independently():
    """A truly rectangular matrix with interchangeable domains on the COLUMN side only:
    the column collapse must merge the domain-swap pairs (9 legal -> 6 classes, sizes
    {1,1,1,2,2,2}) exactly as A19 does, while the single-domain row side stays at 6
    distinct classes - proving the two sides collapse independently on a rectangular
    game, not just at parity (REQ-2.1). The 6/{1,1,1,2,2,2} column oracle is the
    hand-derived A19 merge structure (REQ-9.4)."""
    fx = load_vs2_fixture("A19")
    cfg = load_referenced_config(fx, "config_ref")  # interchangeable_5_3 (d1, d2 fungible)
    # Row side: one domain, budget 2 -> 6 legal allocations, no interchangeable merge.
    state_a = PlayerState(player_id="A", normal_power={"d1": 2})
    # Column side: both interchangeable domains, budget 1 each -> the A19 9-legal space.
    state_b = PlayerState(player_id="B", normal_power={"d1": 1, "d2": 1})
    allocs_a = enumerate_allocations(cfg, state_a, player_count=2)
    allocs_b = enumerate_allocations(cfg, state_b, player_count=2)
    assert len(allocs_a) == 6
    assert len(allocs_b) == 9

    M = build_two_player_payoff_matrix(cfg, state_a, state_b, allocs_a, allocs_b, player_count=2)
    assert M.shape == (6, 9)

    per_side = collapse_strategies_per_side(M)
    # The column side collapses the interchangeable domain-swap pairs, independently
    # of the row side (which has no interchangeable structure).
    assert per_side.column_class_count == 6
    col_sizes = sorted(len(members) for members in per_side.column_classes.values())
    assert col_sizes == [1, 1, 1, 2, 2, 2]
    # The single-domain row side has no behavioural duplicates.
    assert per_side.row_class_count == 6
    assert per_side.matrix.shape == (6, 6)


def test_per_side_collapse_is_deterministic_and_hash_order_independent():
    """Repeated builds and repeated collapses give identical maps and matrices (NFR-1)."""
    cfg, state_a, state_b, M1 = _rectangular_matrix()
    allocs_a = enumerate_allocations(cfg, state_a, player_count=2)
    allocs_b = enumerate_allocations(cfg, state_b, player_count=2)
    M2 = build_two_player_payoff_matrix(cfg, state_a, state_b, allocs_a, allocs_b, player_count=2)

    a = collapse_strategies_per_side(M1)
    b = collapse_strategies_per_side(M2)
    assert a.row_classes == b.row_classes
    assert a.column_classes == b.column_classes
    assert a.row_representative_of == b.row_representative_of
    assert a.column_representative_of == b.column_representative_of
    _assert_payoff_matrices_equal(a.matrix, b.matrix)
    # Representative id order is ascending (independent of grouping/dict order).
    assert list(a.matrix.row_strategy_ids) == sorted(a.matrix.row_strategy_ids)
    assert list(a.matrix.column_strategy_ids) == sorted(a.matrix.column_strategy_ids)


# --------------------------------------------------------------------------- #
# Per-side canonical mixtures + E^0.01 (REQ-2.2, REQ-2.3, REQ-2.4, REQ-9)      #
# --------------------------------------------------------------------------- #


def test_two_sided_equilibrium_at_parity_coincides_with_vs2():
    """At parity the row and column canonical mixtures coincide with each other and
    with the single VS2 canonical equilibrium; per-side E^0.01 coincide (REQ-2.4)."""
    _fx, M = _self_play_matrix("A4")
    cm = collapse_strategies(M).matrix

    ts = eq.solve_two_sided_equilibrium(cm.win, "win")
    # A4 win game has value 0 (MATH-11).
    assert abs(ts.value) <= 1e-9
    assert ts.row_equilibrium.valid and ts.column_equilibrium.valid

    # Row canonical mixture == the single VS2 canonical equilibrium (same deterministic
    # computation, so exact to solver precision).
    vs2_canonical = eq.max_entropy_equilibrium(cm.win, ts.value)
    assert np.allclose(ts.row_equilibrium.probabilities, vs2_canonical.probabilities, atol=1e-6)
    # Row and column canonical mixtures coincide at parity (antisymmetric game). They
    # are two independent max-entropy solves (on M vs -M^T), so they agree only within
    # the numerical-convex tolerance, not to machine precision (REQ-2.4 "within
    # tolerance"); the meaningful support agrees to ~1e-5.
    assert np.allclose(
        ts.row_equilibrium.probabilities, ts.column_equilibrium.probabilities, atol=1e-4
    )
    # E^0.01 is computed per side and coincides at parity.
    assert ts.row_relevant_set.included == ts.column_relevant_set.included
    vs2_ers = eq.equilibrium_relevant_set(cm.win, ts.value)
    assert ts.row_relevant_set.included == vs2_ers.included
    assert np.allclose(ts.row_relevant_set.max_mass, vs2_ers.max_mass, atol=1e-6)


def test_column_relevant_set_coincides_with_row_on_antisymmetric_game():
    """Rock-paper-scissors (antisymmetric): the column E^0.01 equals the row E^0.01,
    and both are the full uniform support (REQ-2.3)."""
    rps = np.array([[0, -1, 1], [1, 0, -1], [-1, 1, 0]], dtype=float)
    row_set = eq.equilibrium_relevant_set(rps)
    col_set = eq.equilibrium_relevant_set_column(rps)
    assert row_set.included == col_set.included == [0, 1, 2]
    assert np.allclose(col_set.max_mass, row_set.max_mass, atol=1e-6)


def test_two_sided_equilibrium_on_rectangular_game():
    """Separate row/column mixtures and per-side E^0.01 from one rectangular solve
    (REQ-2.2, REQ-2.3, REQ-9)."""
    cfg, state_a, state_b, M = _rectangular_matrix()
    ts = eq.solve_two_sided_equilibrium(M.win, "win")
    assert ts.zero_sum.success
    # Primal/dual agree: the rectangular minimax value is well-defined.
    assert ts.zero_sum.value_gap <= 1e-8
    assert ts.zero_sum.exploitability <= 1e-8

    x = ts.row_equilibrium.probabilities
    y = ts.column_equilibrium.probabilities
    # Row mixture is a distribution over the 10 rows; column mixture over the 4 columns.
    assert x.shape == (10,)
    assert y.shape == (4,)
    assert abs(float(x.sum()) - 1.0) <= 1e-6
    assert abs(float(y.sum()) - 1.0) <= 1e-6
    assert x.min() >= -1e-9 and y.min() >= -1e-9

    # E^0.01 per side: correct length, non-empty, masses in [0, 1].
    assert len(ts.row_relevant_set.max_mass) == 10
    assert len(ts.column_relevant_set.max_mass) == 4
    assert ts.row_relevant_set.size >= 1
    assert ts.column_relevant_set.size >= 1
    assert np.all(ts.row_relevant_set.max_mass <= 1.0 + 1e-6)
    assert np.all(ts.column_relevant_set.max_mass <= 1.0 + 1e-6)


def test_two_sided_equilibrium_is_deterministic():
    cfg, state_a, state_b, M = _rectangular_matrix()
    a = eq.solve_two_sided_equilibrium(M.win, "win")
    b = eq.solve_two_sided_equilibrium(M.win, "win")
    assert np.allclose(a.row_equilibrium.probabilities, b.row_equilibrium.probabilities, atol=1e-12)
    assert np.allclose(
        a.column_equilibrium.probabilities, b.column_equilibrium.probabilities, atol=1e-12
    )
    assert a.row_relevant_set.included == b.row_relevant_set.included
    assert a.column_relevant_set.included == b.column_relevant_set.included
