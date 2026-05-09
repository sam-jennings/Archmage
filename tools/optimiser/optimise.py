#!/usr/bin/env python3
"""
Archmage Ascension final-hand optimiser.

Designer-only tool. Given a player's full set of cards at game end (hand +
spellbook), return the partition into a scoring spellbook that maximises
Recognition Points under the standard evaluation, plus runner-up partitions
for comparison.

Usage:
    python optimise.py --cards "V5,F6,R7,A8,V9,V10,W,W"
    python optimise.py --cards "..." --max-value 20 --top-k 3

See ALGORITHM.md for the design rationale.
"""

from __future__ import annotations

import argparse
from collections import defaultdict
from dataclasses import dataclass
from typing import Optional


SUITS: dict[str, str] = {
    "R": "Radiance",
    "V": "Void",
    "F": "Flux",
    "A": "Aether",
}
SUIT_LETTERS = set(SUITS.keys())

# Recognition Points table from rulebook v2.8 / Scoring System Reference.
# Indexed by spell type, then by spell size.
SCORE_TABLE: dict[str, dict[int, int]] = {
    "Conjuration": {
        3: 3, 4: 4, 5: 6, 6: 9, 7: 13, 8: 18, 9: 24,
        10: 31, 11: 39, 12: 48, 13: 58, 14: 69, 15: 81,
    },
    "Transfiguration": {
        3: 5, 4: 7, 5: 10, 6: 14, 7: 19, 8: 25, 9: 32,
        10: 40, 11: 49, 12: 59, 13: 70, 14: 82, 15: 95,
    },
    "PerfectTransmutation": {
        3: 7, 4: 10, 5: 14, 6: 19, 7: 25, 8: 32, 9: 40,
        10: 49, 11: 59, 12: 70, 13: 82, 14: 95, 15: 109,
    },
    "Enchantment": {
        3: 6,
        4: 15,
    },
}


# ---------------------------------------------------------------- Card model

@dataclass(frozen=True)
class Card:
    """A single component card. is_wild=True means suit/value are placeholders
    that can stand in for any (suit, value) consistent with whichever spell
    the card ends up in."""
    suit: Optional[str]
    value: Optional[int]
    is_wild: bool = False
    index: int = 0  # position in the input, used only for display / tiebreak

    def display(self) -> str:
        if self.is_wild:
            return "W"
        return f"{self.suit}{self.value}"


def parse_cards(spec: str, max_value: int) -> list[Card]:
    """Parse a comma-separated card spec like 'V5,F6,R7,W'.
    Suits: R/V/F/A. 'W' (any case) denotes a wild."""
    cards: list[Card] = []
    tokens = [t.strip() for t in spec.split(",") if t.strip()]
    for i, tok in enumerate(tokens):
        if tok.upper() == "W":
            cards.append(Card(None, None, is_wild=True, index=i))
            continue
        if len(tok) < 2:
            raise ValueError(f"Bad card token: {tok!r}")
        suit = tok[0].upper()
        if suit not in SUIT_LETTERS:
            raise ValueError(f"Bad suit in {tok!r}; expected one of R/V/F/A or W")
        try:
            value = int(tok[1:])
        except ValueError as exc:
            raise ValueError(f"Bad value in {tok!r}") from exc
        if not (1 <= value <= max_value):
            raise ValueError(f"Value {value} in {tok!r} out of range 1..{max_value}")
        cards.append(Card(suit, value, is_wild=False, index=i))
    return cards


# ---------------------------------------------------------------- Validators

def _split_wilds(cards: list[Card]) -> tuple[list[Card], int]:
    nonwild = [c for c in cards if not c.is_wild]
    return nonwild, len(cards) - len(nonwild)


def is_conjuration(cards: list[Card]) -> bool:
    if len(cards) < 3:
        return False
    nonwild, _ = _split_wilds(cards)
    if not nonwild:
        return True
    return len({c.suit for c in nonwild}) == 1


def is_enchantment(cards: list[Card]) -> bool:
    if not (3 <= len(cards) <= 4):
        return False
    nonwild, _ = _split_wilds(cards)
    if not nonwild:
        return True
    if len({c.value for c in nonwild}) != 1:
        return False
    suits = [c.suit for c in nonwild]
    return len(suits) == len(set(suits))


def _has_window(values: set[int], k: int, max_value: int) -> bool:
    """Is there an integer window [a, a+k-1] within [1, max_value] that
    contains every value in `values`? Caller ensures values are distinct."""
    if not values:
        return k <= max_value
    lo, hi = min(values), max(values)
    if hi - lo > k - 1:
        return False
    a_min = max(1, hi - k + 1)
    a_max = min(max_value - k + 1, lo)
    return a_min <= a_max


def is_transfiguration(cards: list[Card], max_value: int) -> bool:
    k = len(cards)
    if k < 3:
        return False
    nonwild, _ = _split_wilds(cards)
    values = [c.value for c in nonwild]
    if len(values) != len(set(values)):
        return False
    return _has_window(set(values), k, max_value)


def is_perfect_transmutation(cards: list[Card], max_value: int) -> bool:
    k = len(cards)
    if k < 3:
        return False
    nonwild, _ = _split_wilds(cards)
    if nonwild and len({c.suit for c in nonwild}) != 1:
        return False
    return is_transfiguration(cards, max_value)


def best_spell(cards: list[Card], max_value: int) -> Optional[tuple[str, int]]:
    """Return (type, score) of the highest-scoring valid spell type for this
    card set, or None if it isn't a valid spell of any type."""
    k = len(cards)
    best: Optional[tuple[str, int]] = None

    def consider(t: str) -> None:
        nonlocal best
        s = SCORE_TABLE[t].get(k)
        if s is None:
            return
        if best is None or s > best[1]:
            best = (t, s)

    if is_perfect_transmutation(cards, max_value):
        consider("PerfectTransmutation")
    if is_transfiguration(cards, max_value):
        consider("Transfiguration")
    if is_conjuration(cards):
        consider("Conjuration")
    if is_enchantment(cards):
        consider("Enchantment")
    return best


# ---------------------------------------------------------------- Enumeration

def enumerate_candidates(
    cards: list[Card], max_value: int
) -> list[tuple[int, int, str]]:
    """Yield (bitmask, score, type) for every subset that forms a valid spell."""
    n = len(cards)
    candidates: list[tuple[int, int, str]] = []
    for mask in range(1, 1 << n):
        bits = bin(mask).count("1")
        if bits < 3:
            continue
        subset = [cards[i] for i in range(n) if mask & (1 << i)]
        result = best_spell(subset, max_value)
        if result is not None:
            t, score = result
            candidates.append((mask, score, t))
    return candidates


# ---------------------------------------------------------------- DP solve

def solve_max(
    n: int, candidates: list[tuple[int, int, str]]
) -> list[int]:
    """Bitmask DP. Returns dp where dp[mask] is the max Recognition Points
    achievable using only the cards whose bits are set in `mask`."""
    total = 1 << n
    dp = [0] * total

    by_low: dict[int, list[tuple[int, int]]] = defaultdict(list)
    for cmask, score, _t in candidates:
        low = (cmask & -cmask).bit_length() - 1
        by_low[low].append((cmask, score))

    for mask in range(1, total):
        pivot = (mask & -mask).bit_length() - 1
        best = dp[mask ^ (1 << pivot)]  # skip pivot
        for cmask, score in by_low[pivot]:
            if (cmask & mask) == cmask:
                v = dp[mask ^ cmask] + score
                if v > best:
                    best = v
        dp[mask] = best
    return dp


# ---------------------------------------------------------------- Top-K search

Partition = list[tuple[int, int, str]]  # list of (cmask, score, type)


def topk_partitions(
    n: int,
    candidates: list[tuple[int, int, str]],
    dp: list[int],
    k: int,
    node_budget: int = 2_000_000,
) -> tuple[list[tuple[int, Partition, tuple[int, int]]], int]:
    """Enumerate complete partitions over [0..n) and keep top-k by score
    (with tiebreaks: more spells first, then larger biggest-spell).

    Uses dp[mask] as a tight upper bound on remaining score for pruning.
    Returns (ranked, nodes_explored)."""
    by_low: dict[int, list[tuple[int, int, str]]] = defaultdict(list)
    for cmask, score, t in candidates:
        low = (cmask & -cmask).bit_length() - 1
        by_low[low].append((cmask, score, t))

    full = (1 << n) - 1
    found: dict[tuple[int, ...], tuple[int, Partition, tuple[int, int]]] = {}
    nodes = [0]
    threshold = [0]  # score below which we can prune (k-th best so far)

    def update_threshold() -> None:
        if len(found) < k:
            threshold[0] = 0
            return
        scores = sorted((v[0] for v in found.values()), reverse=True)
        threshold[0] = scores[k - 1]

    def tiebreak(part: Partition) -> tuple[int, int]:
        sizes = [bin(c).count("1") for c, _, _ in part]
        return (len(sizes), max(sizes) if sizes else 0)

    def keep(part: Partition, score: int) -> None:
        key = tuple(sorted(c for c, _, _ in part))
        if key in found:
            return  # same partition reached twice (shouldn't happen, defensive)
        found[key] = (score, list(part), tiebreak(part))
        update_threshold()

    def recurse(mask: int, score: int, partition: Partition) -> None:
        nodes[0] += 1
        if nodes[0] > node_budget:
            return
        if mask == 0:
            keep(partition, score)
            return
        # Tight prune: even with the perfect packing of the remainder we
        # cannot beat the current k-th best.
        if score + dp[mask] < threshold[0]:
            return
        pivot = (mask & -mask).bit_length() - 1
        # Option A: skip pivot
        recurse(mask ^ (1 << pivot), score, partition)
        # Option B: take a candidate spell containing pivot
        for cmask, csc, t in by_low[pivot]:
            if (cmask & mask) == cmask:
                partition.append((cmask, csc, t))
                recurse(mask ^ cmask, score + csc, partition)
                partition.pop()

    recurse(full, 0, [])

    ranked = sorted(
        found.values(),
        key=lambda x: (x[0], x[2]),
        reverse=True,
    )[:k]
    return ranked, nodes[0]


# ---------------------------------------------------------------- Output

def format_spell(cmask: int, score: int, t: str, cards: list[Card]) -> str:
    members = [cards[i].display() for i in range(len(cards)) if cmask & (1 << i)]
    size = len(members)
    return f"  [{t} k={size} = {score} pts] " + " ".join(members)


def print_partition(
    rank: int,
    score: int,
    partition: Partition,
    cards: list[Card],
) -> None:
    used = sum(bin(c).count("1") for c, _, _ in partition)
    leftover = len(cards) - used
    spells_word = "spell" if len(partition) == 1 else "spells"
    cards_word = "card" if leftover == 1 else "cards"
    print(
        f"#{rank}: {score} Recognition Points "
        f"({len(partition)} {spells_word}, {leftover} {cards_word} unused)"
    )
    for cmask, sc, t in sorted(partition, key=lambda x: -bin(x[0]).count("1")):
        print(format_spell(cmask, sc, t, cards))


# ---------------------------------------------------------------- CLI

def main() -> None:
    p = argparse.ArgumentParser(
        description="Archmage Ascension final-hand optimiser",
    )
    p.add_argument(
        "--cards",
        required=True,
        help="Comma-separated cards e.g. 'V5,F6,R7,W' (suits R/V/F/A, W=wild)",
    )
    p.add_argument(
        "--max-value",
        type=int,
        default=15,
        choices=[15, 20],
        help="Max card value: 15 (2-4 player deck) or 20 (5-7 player deck)",
    )
    p.add_argument(
        "--top-k",
        type=int,
        default=3,
        help="Number of partitions to report (1 = optimum only)",
    )
    p.add_argument(
        "--node-budget",
        type=int,
        default=2_000_000,
        help="Cap on runner-up search nodes (optimum is always exact)",
    )
    args = p.parse_args()

    cards = parse_cards(args.cards, args.max_value)
    n = len(cards)
    n_wild = sum(1 for c in cards if c.is_wild)
    print(f"Hand: {n} cards ({n_wild} wild), max value {args.max_value}")

    candidates = enumerate_candidates(cards, args.max_value)
    print(f"Candidate spells: {len(candidates)}")

    dp = solve_max(n, candidates)
    full = (1 << n) - 1
    print(f"Optimal score: {dp[full]}")

    ranked, nodes = topk_partitions(
        n, candidates, dp, args.top_k, args.node_budget
    )
    suffix = " (node budget hit; runners-up may be incomplete)" if nodes > args.node_budget else ""
    print(f"(searched {nodes} nodes; returning top {len(ranked)} partitions{suffix})\n")

    for rank, (score, partition, _tb) in enumerate(ranked, start=1):
        print_partition(rank, score, partition, cards)
        print()


if __name__ == "__main__":
    main()
