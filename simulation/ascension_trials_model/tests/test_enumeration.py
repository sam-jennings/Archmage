"""Task 16 - small-state allocation enumeration (REQ-10; design §8; impl spec §8).

Verifies exhaustive, deterministic enumeration of legal allocations, the closed-form
size estimate, the exact-analysis refusal (never silent sampling), maximality
counting, and the source-backed counts A3 = 15 and A4 = 84.
"""

from __future__ import annotations

from math import comb

import pytest

from ascension_trials.enumerate import (
    DEFAULT_MAX_ALLOCATIONS,
    EnumerationLimitError,
    count_legal_and_maximal,
    enumerate_allocations,
    enumerate_maximal_allocations,
    estimate_allocation_count,
    find_allocation_by_normal_totals,
    normal_totals_by_trial,
    weak_compositions,
)
from ascension_trials.canonical import canonical_allocation_key
from ascension_trials.schema import PlayerState

from vs2_support import load_referenced_config, load_vs2_fixture


# --------------------------------------------------------------------------- #
# weak_compositions                                                            #
# --------------------------------------------------------------------------- #


@pytest.mark.parametrize(
    "total,parts",
    [(4, 3), (6, 4), (0, 1), (5, 1), (3, 5), (7, 2)],
)
def test_weak_compositions_count_and_sum(total, parts):
    comps = list(weak_compositions(total, parts))
    assert len(comps) == comb(total + parts - 1, parts - 1)
    assert all(len(c) == parts and sum(c) == total for c in comps)
    # No duplicates.
    assert len(set(comps)) == len(comps)


def test_weak_compositions_is_deterministic():
    a = list(weak_compositions(6, 4))
    b = list(weak_compositions(6, 4))
    assert a == b


def test_weak_compositions_rejects_bad_arguments():
    with pytest.raises(ValueError):
        list(weak_compositions(3, 0))
    with pytest.raises(ValueError):
        list(weak_compositions(-1, 2))


# --------------------------------------------------------------------------- #
# A3 = 15 and A4 = 84 (REQ-10.6; MATH-9)                                        #
# --------------------------------------------------------------------------- #


def _config_and_state(fixture_id):
    fx = load_vs2_fixture(fixture_id)
    cfg = load_referenced_config(fx)
    state = PlayerState(
        player_id=fx["state"]["player_id"],
        normal_power=dict(fx["state"]["normal_power"]),
        wild_power=fx["state"].get("wild_power", 0),
    )
    return fx, cfg, state


def test_a3_has_exactly_15_legal_allocations():
    fx, cfg, state = _config_and_state("A3")
    allocs = enumerate_allocations(cfg, state, player_count=fx["player_count"])
    assert len(allocs) == fx["expected"]["legal_allocations"] == 15


def test_a4_has_exactly_84_legal_allocations():
    fx, cfg, state = _config_and_state("A4")
    allocs = enumerate_allocations(cfg, state, player_count=fx["player_count"])
    assert len(allocs) == fx["expected"]["legal_allocations"] == 84


def test_a5_full_completion_has_exactly_5_allocations():
    fx, cfg, state = _config_and_state("A5")
    allocs = enumerate_allocations(cfg, state, player_count=fx["player_count"])
    assert len(allocs) == fx["expected"]["legal_allocations"] == 5
    # FULL completion: every allocation spends the whole budget (zero residue).
    for a in allocs:
        assert sum(a.residue_normal.values()) == 0 and a.residue_wild == 0


def test_a6_has_exactly_84_legal_allocations():
    fx, cfg, state = _config_and_state("A6")
    allocs = enumerate_allocations(cfg, state, player_count=fx["player_count"])
    assert len(allocs) == fx["expected"]["legal_allocations"] == 84


# --------------------------------------------------------------------------- #
# Determinism, estimate, and completeness                                      #
# --------------------------------------------------------------------------- #


def test_enumeration_is_deterministic_and_ordered_by_canonical_key():
    fx, cfg, state = _config_and_state("A4")
    first = enumerate_allocations(cfg, state, player_count=2)
    second = enumerate_allocations(cfg, state, player_count=2)
    keys_first = [canonical_allocation_key(cfg, state, a) for a in first]
    keys_second = [canonical_allocation_key(cfg, state, a) for a in second]
    assert keys_first == keys_second
    assert keys_first == sorted(keys_first)
    # No duplicate strategies.
    assert len(set(keys_first)) == len(keys_first)


def test_estimate_matches_actual_count_for_optional_configs():
    for fixture_id in ("A3", "A4", "A6"):
        fx, cfg, state = _config_and_state(fixture_id)
        est = estimate_allocation_count(cfg, state, player_count=2)
        allocs = enumerate_allocations(cfg, state, player_count=2)
        # For a single fungible domain with every positive placement legal, the
        # closed-form candidate estimate equals the exact legal count.
        assert est.upper_bound == len(allocs)


def test_a3_named_strategy_4_0_is_present():
    fx, cfg, state = _config_and_state("A3")
    allocs = enumerate_allocations(cfg, state, player_count=2)
    totals = fx["expected"]["named_strategy"]["normal_totals"]
    found = find_allocation_by_normal_totals(cfg, allocs, tuple(totals), player_count=2)
    assert found is not None
    assert normal_totals_by_trial(cfg, found, 2) == tuple(totals)


# --------------------------------------------------------------------------- #
# Refusal over the ceiling — never silent sampling (REQ-10.4, REQ-10.5, NFR-4) #
# --------------------------------------------------------------------------- #


def test_enumeration_refuses_over_ceiling_without_sampling():
    fx, cfg, state = _config_and_state("A4")  # 84 candidates
    with pytest.raises(EnumerationLimitError) as exc:
        enumerate_allocations(cfg, state, player_count=2, max_allocations=10)
    assert exc.value.estimate == 84
    assert exc.value.limit == 10


def test_default_ceiling_admits_the_toy_states():
    fx, cfg, state = _config_and_state("A4")
    # 84 is far below the default ceiling, so no refusal.
    allocs = enumerate_allocations(cfg, state, player_count=2, max_allocations=DEFAULT_MAX_ALLOCATIONS)
    assert len(allocs) == 84


# --------------------------------------------------------------------------- #
# Maximality (REQ-4.5, REQ-10.3)                                               #
# --------------------------------------------------------------------------- #


def test_maximal_subset_for_optional_a4():
    fx, cfg, state = _config_and_state("A4")
    legal, maximal = count_legal_and_maximal(cfg, state, player_count=2)
    assert legal == 84
    # Only allocations that spend the whole budget over the 3 Trials are maximal
    # (any residual fungible unit is always legally addable to some Trial).
    maximal_allocs = enumerate_maximal_allocations(cfg, state, player_count=2)
    assert maximal == len(maximal_allocs)
    for a in maximal_allocs:
        assert sum(a.residue_normal.values()) == 0
    # Compositions of 6 over exactly 3 Trials (residue 0) = C(6+2, 2) = 28.
    assert maximal == 28


def test_full_completion_allocations_are_all_maximal_for_a5():
    fx, cfg, state = _config_and_state("A5")
    legal, maximal = count_legal_and_maximal(cfg, state, player_count=2)
    assert legal == 5
    assert maximal == 5  # zero-residue allocations are trivially maximal
