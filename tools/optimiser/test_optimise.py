"""Tests for optimise.py.

Run from this directory with:
    python -m pytest test_optimise.py -v
"""

from __future__ import annotations

import os
import subprocess
import sys

import pytest

from optimise import (
    Card,
    _has_window,
    best_spell,
    enumerate_candidates,
    is_conjuration,
    is_enchantment,
    is_perfect_transmutation,
    is_transfiguration,
    parse_cards,
    solve_max,
    topk_partitions,
)


# =================================================================== Parser

def test_parse_basic():
    cards = parse_cards("V5,F6,R7,A8", 15)
    assert len(cards) == 4
    assert cards[0].suit == "V" and cards[0].value == 5
    assert cards[3].suit == "A" and cards[3].value == 8


def test_parse_handles_whitespace_and_case():
    cards = parse_cards(" v5 , F6 , w ", 15)
    assert len(cards) == 3
    assert cards[0].suit == "V" and cards[0].value == 5
    assert cards[2].is_wild


def test_parse_invalid_value_too_high():
    with pytest.raises(ValueError):
        parse_cards("V20", 15)


def test_parse_value_ok_in_20_deck():
    cards = parse_cards("V20", 20)
    assert cards[0].value == 20


def test_parse_invalid_suit():
    with pytest.raises(ValueError):
        parse_cards("X5", 15)


# =============================================================== Validators

def test_conjuration_valid():
    cards = parse_cards("V2,V5,V9,V13", 15)
    assert is_conjuration(cards)


def test_conjuration_too_small():
    cards = parse_cards("V2,V5", 15)
    assert not is_conjuration(cards)


def test_conjuration_invalid_mixed_suits():
    cards = parse_cards("V5,F5,R5", 15)
    assert not is_conjuration(cards)


def test_conjuration_with_wild():
    cards = parse_cards("V5,V9,W", 15)
    assert is_conjuration(cards)


def test_conjuration_all_wilds():
    cards = parse_cards("W,W,W", 15)
    assert is_conjuration(cards)


def test_enchantment_valid_3():
    cards = parse_cards("R7,V7,F7", 15)
    assert is_enchantment(cards)


def test_enchantment_max_size_4():
    cards = parse_cards("R7,V7,F7,A7", 15)
    assert is_enchantment(cards)


def test_enchantment_too_big():
    cards = parse_cards("R7,V7,F7,A7,W", 15)
    assert not is_enchantment(cards)


def test_enchantment_with_wild():
    cards = parse_cards("R7,V7,W", 15)
    assert is_enchantment(cards)


def test_enchantment_with_two_wilds():
    cards = parse_cards("R7,W,W", 15)
    assert is_enchantment(cards)


def test_enchantment_duplicate_suit_invalid():
    # Two cards with same suit + same value can't co-exist in a real deck,
    # but the validator should still reject it (it's checking suit-distinctness
    # for non-wilds).
    cards = [
        Card("R", 7, False, 0),
        Card("R", 7, False, 1),
        Card("V", 7, False, 2),
    ]
    assert not is_enchantment(cards)


def test_enchantment_mixed_values_invalid():
    cards = parse_cards("R7,V8,F7", 15)
    assert not is_enchantment(cards)


def test_transfiguration_valid():
    cards = parse_cards("V5,F6,R7,A8", 15)
    assert is_transfiguration(cards, 15)


def test_transfiguration_no_loop_around():
    cards = parse_cards("V14,F15,R1", 15)
    assert not is_transfiguration(cards, 15)


def test_transfiguration_with_wild_filling_gap():
    cards = parse_cards("V5,W,R7", 15)  # window [5,7], wild = anything-6
    assert is_transfiguration(cards, 15)


def test_transfiguration_duplicate_value_invalid():
    cards = parse_cards("V5,F5,R6", 15)
    assert not is_transfiguration(cards, 15)


def test_transfiguration_window_at_edge():
    cards = parse_cards("V14,F15,W", 15)  # window [13,15] valid
    assert is_transfiguration(cards, 15)
    cards = parse_cards("V1,F2,W", 15)  # window [1,3] valid
    assert is_transfiguration(cards, 15)


def test_perfect_transmutation_valid():
    cards = parse_cards("V5,V6,V7", 15)
    assert is_perfect_transmutation(cards, 15)


def test_perfect_transmutation_mixed_suit_invalid():
    cards = parse_cards("V5,F6,V7", 15)
    assert not is_perfect_transmutation(cards, 15)


def test_perfect_transmutation_with_wild():
    cards = parse_cards("V5,W,V7", 15)
    assert is_perfect_transmutation(cards, 15)


# ================================================================== Window

def test_window_basic():
    assert _has_window({5, 7}, 3, 15)
    assert _has_window({1, 2, 3}, 3, 15)
    assert _has_window({14, 15}, 4, 15)
    assert _has_window({1, 5}, 5, 15)
    assert not _has_window({1, 5}, 3, 15)


def test_window_empty_means_all_wilds():
    assert _has_window(set(), 3, 15)
    assert _has_window(set(), 5, 15)
    assert not _has_window(set(), 16, 15)  # can't fit 16 distinct slots in 1..15


def test_window_at_edges():
    # Need to fit 4 sequential including 13, 14, 15: only window [12,15]
    assert _has_window({13, 14, 15}, 4, 15)
    # Need to fit 4 sequential including 14, 15: windows [12,15] only
    assert _has_window({14, 15}, 4, 15)
    # Need 5 sequential including 14, 15: [11..15]
    assert _has_window({14, 15}, 5, 15)


# ============================================================== best_spell

def test_best_spell_picks_pt_over_conjuration():
    # V5,V6,V7: valid as Conjuration (3pts) and PT (7pts)
    cards = parse_cards("V5,V6,V7", 15)
    result = best_spell(cards, 15)
    assert result == ("PerfectTransmutation", 7)


def test_best_spell_picks_enchantment_over_pt_for_4_wilds():
    # 4 wilds: PT k=4 = 10, Enchantment k=4 = 15
    cards = parse_cards("W,W,W,W", 15)
    result = best_spell(cards, 15)
    assert result == ("Enchantment", 15)


def test_best_spell_invalid_set_returns_none():
    # 3 random cards forming nothing valid: V1, F8, R15 — no spell type works
    cards = parse_cards("V1,F8,R15", 15)
    assert best_spell(cards, 15) is None


# ============================================ Hand-worked optimal partitions

def _solve(spec: str, max_value: int = 15, k: int = 3):
    cards = parse_cards(spec, max_value)
    n = len(cards)
    cands = enumerate_candidates(cards, max_value)
    dp = solve_max(n, cands)
    ranked, _ = topk_partitions(n, cands, dp, k)
    return cards, dp[(1 << n) - 1], ranked


def test_hand_worked_two_enchantments():
    """Hand: R7, V7, F7, A7, R3, V3, F3.

    Worked optimum:
      - {R7, V7, F7, A7}: Enchantment k=4 = 15 pts
      - {R3, V3, F3}:     Enchantment k=3 = 6 pts
      Total = 21 pts.

    No partition of these 7 cards can exceed 21 (no Conjuration, Transfig, or
    PT can be formed because suits and values are too sparse for a sequence
    or a 3+ same-suit set). Thus 21 is optimal.
    """
    _, opt, _ = _solve("R7,V7,F7,A7,R3,V3,F3")
    assert opt == 21


def test_hand_worked_six_void_pt():
    """Hand: V3, V4, V5, V6, V7, V8.

    Worked optimum:
      - One Perfect Transmutation k=6 = 19 pts (using all cards).

    Splitting strictly worse:
      - PT k=5 + 1 leftover           = 14
      - PT k=3 + PT k=3                = 14
      - PT k=4 + 2 leftovers           = 10
      - Conjuration k=6                = 9
    """
    _, opt, ranked = _solve("V3,V4,V5,V6,V7,V8")
    assert opt == 19
    assert ranked[0][0] == 19
    # Next-best distinct partition scores 14 (several realisations).
    assert ranked[1][0] == 14


def test_hand_worked_two_pts_with_leftover():
    """Hand: V1, V2, V3, F8, F9, F10, R1.

    Worked optimum:
      - {V1, V2, V3}: PT k=3 = 7
      - {F8, F9, F10}: PT k=3 = 7
      - {R1}: leftover, scores 0
      Total = 14 pts.

    R1 cannot combine into any spell (V1+R1 only 2 cards; V1,V2,V3,R1
    fails Transfiguration because value 1 is duplicated; suits are mixed).
    """
    _, opt, _ = _solve("V1,V2,V3,F8,F9,F10,R1")
    assert opt == 14


def test_hand_worked_wilds_complete_an_enchantment():
    """Hand: R7, V7, F7, W.

    Worked optimum: Enchantment k=4 = 15 pts (wild stands in for Aether 7)."""
    _, opt, _ = _solve("R7,V7,F7,W")
    assert opt == 15


def test_hand_worked_all_wilds():
    """Hand: W, W, W, W. Best = Enchantment k=4 = 15 pts."""
    _, opt, _ = _solve("W,W,W,W")
    assert opt == 15


def test_hand_worked_overlapping_pts_split():
    """Hand: V5, V6, V7, F5, F6, F7.

    Two disjoint PTs (one per suit), each k=3 = 7 pts. Total = 14.

    Cross-suit combinations fail (Transfiguration would duplicate values
    5/6/7; Conjuration would mix suits).
    """
    _, opt, _ = _solve("V5,V6,V7,F5,F6,F7")
    assert opt == 14


def test_runner_ups_are_distinct():
    """For the six-void hand, the top-3 partitions returned must all be
    different (different multisets of spell bitmasks)."""
    _, _, ranked = _solve("V3,V4,V5,V6,V7,V8", k=3)
    keys = {tuple(sorted(c for c, _, _ in part)) for _, part, _ in ranked}
    assert len(keys) == len(ranked)


def test_max_value_20_deck():
    """Hand crossing the 16-20 value band; only valid in --max-value 20.

    F18, R19, A20: PT? mixed suits. Transfiguration k=3 = 5 pts. That's it.
    Plus V18, V19, V20: PT k=3 = 7 pts. Total = 12.
    """
    _, opt, _ = _solve("F18,R19,A20,V18,V19,V20", max_value=20)
    assert opt == 12


def test_max_value_15_rejects_value_18():
    with pytest.raises(ValueError):
        parse_cards("V18", 15)


# ===================================================================== CLI

def test_cli_runs_and_reports_optimal():
    here = os.path.dirname(os.path.abspath(__file__))
    result = subprocess.run(
        [sys.executable, "optimise.py", "--cards", "V5,V6,V7,V8", "--top-k", "1"],
        capture_output=True,
        text=True,
        cwd=here,
        check=False,
    )
    assert result.returncode == 0, result.stderr
    assert "Optimal score:" in result.stdout
    # V5-V8 is one PT k=4 = 10 pts.
    assert "Optimal score: 10" in result.stdout
