#!/usr/bin/env python3
"""
Scoring-rebalance statistics for the deck-configuration decision
================================================================

Wraps archmage_deck_sim (unmodified) to extract end-of-game SPELLBOOK
COMPOSITION per configuration, then adds a hand-model Monte Carlo for the
two spell families the sim agent does not pursue (Transfiguration and
Perfect Transmutation).

Outputs per configuration:
  - P(player ends with enchantment tier >= s), s = 3,4,5
  - P(player ends with a conjuration of size >= n), n = 3..8
  - conjuration size distribution + mean total conjuration cards banked
  - cards-seen distribution (7 opening + draws)
  - hand-model P(cards seen contain a same-energy run >= k)      [Perfect Transmutation]
  - hand-model P(cards seen contain an any-energy value run >= k) [Transfiguration]
  - hand-model P(cards seen contain >= n of one energy)           [Conjuration ceiling]

The hand-model is deliberately strategy-free (an upper bound on what a
dedicated chaser could hold); as with the main rig, RATIOS between
configurations are the robust output, not absolute values.

Usage:
    python scoring_rebalance_stats.py --trials 5000 --hand-trials 20000 \
        --seed 42 --json results/scoring_stats.json
"""

from __future__ import annotations

import argparse
import json
import random
from collections import Counter

from archmage_deck_sim import WILD, DeckConfig, Game, Rules


# --------------------------------------------------------------------------- #
# Configurations under study                                                   #
# --------------------------------------------------------------------------- #

def study_rows():
    """(key, players, DeckConfig). Anchor = live/Option-2 deck at 3-4p."""
    rows = [
        ("anchor_3p", 3, DeckConfig(4, 15, 2)),
        ("anchor_4p", 4, DeckConfig(4, 15, 2)),
        ("opt2_5p",   5, DeckConfig(5, 15, 4)),
        ("opt2_6p",   6, DeckConfig(5, 15, 4)),
        # Option 1 (sketch): 5E x 1-12 + 2W at 2-4p, 5E x 1-16 + 4W at 5-6p
        ("opt1_2p",   2, DeckConfig(5, 12, 2)),
        ("opt1_3p",   3, DeckConfig(5, 12, 2)),
        ("opt1_4p",   4, DeckConfig(5, 12, 2)),
        ("opt1_5p",   5, DeckConfig(5, 16, 4)),
        ("opt1_6p",   6, DeckConfig(5, 16, 4)),
    ]
    return rows


# --------------------------------------------------------------------------- #
# Part 1 — spellbook composition from the full game sim                        #
# --------------------------------------------------------------------------- #

def sim_composition(deck: DeckConfig, players: int, rules: Rules,
                    trials: int, seed: int) -> dict:
    rng = random.Random(seed)
    n_players_total = 0
    ench_ge = Counter()          # tier s -> players with max_tier >= s
    conj_ge = Counter()          # size n -> players with a conj of size >= n
    conj_sizes = Counter()       # exact size histogram (all conjurations)
    conj_cards_total = 0         # total cards banked in conjurations
    ench_count_total = 0
    conj_count_total = 0
    seen_hist = Counter()        # cards seen (7 + draws) histogram

    for _ in range(trials):
        g = Game(deck, players, rules, rng)
        g.play()
        for p in g.players:
            n_players_total += 1
            for s in (3, 4, 5):
                if p.max_tier >= s:
                    ench_ge[s] += 1
            if p.conj:
                biggest = max(cj["n"] for cj in p.conj)
                for n in range(3, 9):
                    if biggest >= n:
                        conj_ge[n] += 1
            for cj in p.conj:
                conj_sizes[cj["n"]] += 1
                conj_cards_total += cj["n"]
            ench_count_total += len(p.ench)
            conj_count_total += len(p.conj)
            seen_hist[7 + p.draws] += 1

    N = n_players_total
    return {
        "deck": deck.label(),
        "players": players,
        "trials": trials,
        "ench_tier_ge": {s: ench_ge[s] / N for s in (3, 4, 5)},
        "conj_size_ge": {n: conj_ge[n] / N for n in range(3, 9)},
        "conj_size_hist": dict(sorted(conj_sizes.items())),
        "mean_conj_per_player": conj_count_total / N,
        "mean_ench_per_player": ench_count_total / N,
        "mean_conj_cards": conj_cards_total / N,
        "mean_cards_seen": sum(k * v for k, v in seen_hist.items()) / N,
        "seen_hist": {int(k): v for k, v in sorted(seen_hist.items())},
    }


# --------------------------------------------------------------------------- #
# Part 2 — hand-model for sequence spells (not pursued by the sim agent)       #
# --------------------------------------------------------------------------- #

def _max_run_with_wilds(values: set[int], wilds: int, ranks: int) -> int:
    """Longest consecutive value stretch coverable, filling <= wilds gaps."""
    if not values and wilds == 0:
        return 0
    best = min(wilds, ranks)
    vs = sorted(values)
    for i, a in enumerate(vs):
        # extend window upward from each start value
        held = 0
        j = i
        for b in range(a, ranks + 1):
            if j < len(vs) and vs[j] == b:
                held += 1
                j += 1
            length = b - a + 1
            if length - held > wilds:
                break
            best = max(best, length)
    return best


def hand_model(deck: DeckConfig, seen_hist: dict[int, int],
               trials: int, seed: int) -> dict:
    """Sample hands of size H (H ~ empirical cards-seen distribution) and
    measure best possible Transfiguration / Perfect Transmutation / max
    one-energy count. Wilds count as fully flexible."""
    rng = random.Random(seed)
    cards = deck.build()
    sizes = list(seen_hist.keys())
    weights = list(seen_hist.values())

    pt_ge = Counter()     # same-energy run >= k
    tf_ge = Counter()     # any-energy value run >= k
    suit_ge = Counter()   # >= n cards of one energy (wilds count)

    for _ in range(trials):
        h = rng.choices(sizes, weights)[0]
        hand = rng.sample(cards, min(h, len(cards)))
        wilds = sum(1 for e, _ in hand if e == WILD)
        by_e: dict[int, set[int]] = {}
        all_vals: set[int] = set()
        for e, v in hand:
            if e == WILD:
                continue
            by_e.setdefault(e, set()).add(v)
            all_vals.add(v)
        # Perfect Transmutation: per energy, wilds fill gaps
        pt = max((_max_run_with_wilds(vs, wilds, deck.ranks)
                  for vs in by_e.values()), default=min(wilds, deck.ranks))
        # Transfiguration: union of values, wilds fill gaps
        tf = _max_run_with_wilds(all_vals, wilds, deck.ranks)
        # Conjuration ceiling: biggest one-energy pile + wilds
        big = max((len(vs) for vs in by_e.values()), default=0) + wilds
        for k in range(3, 11):
            if pt >= k:
                pt_ge[k] += 1
            if tf >= k:
                tf_ge[k] += 1
            if big >= k:
                suit_ge[k] += 1

    return {
        "pt_run_ge": {k: pt_ge[k] / trials for k in range(3, 11)},
        "tf_run_ge": {k: tf_ge[k] / trials for k in range(3, 11)},
        "suit_ge": {k: suit_ge[k] / trials for k in range(3, 11)},
        "hand_trials": trials,
    }


# --------------------------------------------------------------------------- #
# Driver                                                                       #
# --------------------------------------------------------------------------- #

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--trials", type=int, default=5000)
    ap.add_argument("--hand-trials", type=int, default=20000)
    ap.add_argument("--seed", type=int, default=42)
    ap.add_argument("--tier4-counters", type=int, default=2)
    ap.add_argument("--json", type=str, default="results/scoring_stats.json")
    ap.add_argument("--only", type=str, default=None,
                    help="comma-separated row keys to (re)run")
    args = ap.parse_args()

    rules = Rules(tier4_counters=args.tier4_counters)
    only = set(args.only.split(",")) if args.only else None

    # load existing results if present so --only can patch incrementally
    try:
        with open(args.json) as f:
            out = json.load(f)
    except (OSError, json.JSONDecodeError):
        out = {}

    for i, (key, players, deck) in enumerate(study_rows()):
        if only and key not in only:
            continue
        res = sim_composition(deck, players, rules, args.trials,
                              args.seed * 1000 + i)
        res.update(hand_model(deck, res["seen_hist"], args.hand_trials,
                              args.seed * 7777 + i))
        out[key] = res
        print(f"done {key}: {deck.label()} p={players} "
              f"t3+={res['ench_tier_ge'][3]:.3f} conj3+={res['conj_size_ge'][3]:.3f} "
              f"seen={res['mean_cards_seen']:.1f}", flush=True)

    with open(args.json, "w") as f:
        json.dump(out, f, indent=1)
    print(f"wrote {args.json}")


if __name__ == "__main__":
    main()
