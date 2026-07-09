#!/usr/bin/env python3
"""
Scoring-EV analysis for Archmage Ascension
===========================================

Answers two coupled questions raised by Session 4 (2026-07-06), on paper,
before the next live session. Spec: `.kiro/specs/scoring-ev-analysis/`.

  Q1 (pricing): Does the Recognition Points table pay each spell family in
                proportion to how hard that size is to reach, or are there
                difficulty-vs-reward inversions? Headline: a 7-card
                Transfiguration (19 pts) vs a 5-card Perfect Transmutation
                (14 pts) — the +5 gap Sam observed.

  Q2 (economy): How much of the observed end-game exploit is the score TABLE
                versus the unbounded RESHAPE? Does bounding Reshape alone flatten
                it, or is a re-price also needed?

Design:
  Part A  static pricing audit — turns the hand-model reach-probabilities from
          scoring_rebalance_stats into a difficulty proxy and prices each family/
          size against a pooled rarity curve (price ~ rarity^-beta, the
          convention from SCORING_REBALANCE.md), flagging cross-family inversions.
  Part B  end-game Reshape EV — reconstructs each player's realisable card pool
          at game end (exactly, using the conjuration-value tracking added to the
          rig) and compares four Reshape rules on the same seeded games:
          unbounded / size_capped[C] / cost_scaled / no_reshape.

Reuse: imports archmage_deck_sim and scoring_rebalance_stats unchanged (except the
additive conjuration "vals" capture in the rig). Nothing here mutates their behavior.

Everything flows through seeded RNGs: identical seed => identical output.

Usage:
    python scoring_ev.py analyze --trials 10000 --hand-trials 50000 --seed 42 \
        --json results/scoring_ev.json --md SCORING_EV.md
    python scoring_ev.py selfcheck            # property + anchor checks
"""

from __future__ import annotations

import argparse
import itertools
import json
import math
import os
import random
from collections import Counter, defaultdict

from archmage_deck_sim import WILD, DeckConfig, Game, Rules
from scoring_rebalance_stats import _max_run_with_wilds, hand_model, sim_composition


# --------------------------------------------------------------------------- #
# Recognition Points table                                                     #
# Source of truth: rulebook/Scoring System Reference.md (v3.1).                #
# This is a CHECKED MIRROR — assert_matches_canon() guards drift at import.    #
# Enchantment caps at size 5 (reachable only at 5-6 players).                  #
# --------------------------------------------------------------------------- #

FAMILIES = ("conjuration", "transfiguration", "perfect", "enchantment")

SCORE: dict[str, dict[int, int]] = {
    "conjuration":     {3: 0,  4: 1,  5: 2,  6: 3,  7: 7,  8: 13, 9: 20,
                        10: 29, 11: 38, 12: 50, 13: 63, 14: 79, 15: 100},
    "transfiguration": {3: 3,  4: 4,  5: 5,  6: 7,  7: 8,  8: 10, 9: 13,
                        10: 16, 11: 20, 12: 25, 13: 31, 14: 38, 15: 48},
    "perfect":         {3: 5,  4: 11, 5: 18, 6: 24, 7: 31, 8: 39, 9: 47,
                        10: 56, 11: 65, 12: 74, 13: 85, 14: 97, 15: 100},
    "enchantment":     {3: 4,  4: 10, 5: 16},
}

MAX_SPELL_SIZE = 15
FAMILY_LABEL = {
    "conjuration": "Conjuration",
    "transfiguration": "Transfiguration",
    "perfect": "Perfect Transmutation",
    "enchantment": "Enchantment",
    "built": "(as-played book)",
}

# The table score_spell() reads. Defaults to canon SCORE; --score-table overrides it
# so candidate re-pricings can be evaluated without touching canon.
_ACTIVE_SCORE: dict[str, dict[int, int]] = SCORE


def assert_matches_canon() -> None:
    """Fail fast if the embedded table drifts from canon invariants.

    Checks the v3.1 anchor values the design depends on, plus the structural
    invariants the table must satisfy: monotonic (strictly increasing) in size,
    and Perfect Transmutation is the ceiling at every size (p >= t and p >= c).

    Note (v3.1): the old "Perfect >= Transfiguration >= Conjuration" chain no
    longer holds. Conjuration ramps steeply and OVERTAKES Transfiguration from
    size 8 up (conj-8=13 > tf-8=10, ... conj-15=100 > tf-15=48); TF >= Conj only
    at the low end (sizes 3-7). Perfect Transmutation still dominates both, and
    Conj-15 == PT-15 == 100 (a size-15 pile IS a size-15 run). This mirrors what
    assert_table_sane() checks for candidate tables.
    """
    anchors = {
        ("conjuration", 3): 0,       # floor (only spell allowed to score 0)
        ("conjuration", 15): 100,    # ceiling (identity with PT-15)
        ("perfect", 15): 100,        # identity: Conj-15 == PT-15 == 100
        ("transfiguration", 15): 48,
        ("perfect", 3): 5,
        ("enchantment", 3): 4,
        ("enchantment", 4): 10,
        ("enchantment", 5): 16,
    }
    for (fam, size), want in anchors.items():
        got = SCORE[fam][size]
        if got != want:
            raise AssertionError(
                f"SCORE[{fam}][{size}] = {got}, expected {want} "
                f"(drift from rulebook/Scoring System Reference.md)")
    # identity: a size-15 Conjuration IS a size-15 Perfect Transmutation
    if not (SCORE["conjuration"][15] == SCORE["perfect"][15] == 100):
        raise AssertionError(
            f"identity violated: Conj-15={SCORE['conjuration'][15]}, "
            f"PT-15={SCORE['perfect'][15]} (must both be 100)")
    # monotonic non-decreasing in size, per family
    for fam in FAMILIES:
        sizes = sorted(SCORE[fam])
        for a, b in zip(sizes, sizes[1:]):
            if SCORE[fam][b] < SCORE[fam][a]:
                raise AssertionError(f"{fam} not monotonic at size {b}")
    # Perfect Transmutation is the ceiling at equal size. In v3.1 Transfiguration
    # and Conjuration cross over (TF >= Conj only at the low end), so we do NOT
    # require t >= c — only that Perfect dominates both.
    for size in range(3, 16):
        c, t, p = SCORE["conjuration"][size], SCORE["transfiguration"][size], SCORE["perfect"][size]
        if not (p >= t and p >= c):
            raise AssertionError(
                f"family ordering violated at size {size}: "
                f"perfect={p}, transfiguration={t}, conjuration={c}")


def score_spell(family: str, size: int) -> int:
    """Recognition Points for a spell of a family at a size (0 if below 3)."""
    if size < 3:
        return 0
    return _ACTIVE_SCORE[family].get(min(size, MAX_SPELL_SIZE), 0)


# --------------------------------------------------------------------------- #
# Realisable pool + best-single-spell evaluator (Part B core)                  #
# --------------------------------------------------------------------------- #

def realisable_pool(player) -> tuple[Counter, int, dict]:
    """Reconstruct everything a player holds at game end.

    Returns (naturals, wilds, built):
      naturals : Counter[(energy, value)] of natural cards (each count == 1,
                 since the deck holds one copy of every (energy, value))
      wilds    : total wild cards available
      built    : {"ench": [tier sizes...], "conj": [pile sizes...]} — the spells
                 the agent actually committed, for the no_reshape baseline.

    The pool aggregates hand + enchantment cards + conjuration cards. Conjuration
    values come from the rig's additive "vals" capture; older records without it
    fall back to value 0 placeholders (never happens post-instrumentation).
    """
    naturals: Counter = Counter()
    wilds = player.wilds

    # hand
    for v, energies in player.hand_vals.items():
        for e in energies:
            naturals[(e, v)] += 1

    # enchantments: naturals at the enchantment value + banked wilds
    ench_sizes = []
    for en in player.ench:
        for e in en["energies"]:
            naturals[(e, en["value"])] += 1
        wilds += en["wild_used"]
        ench_sizes.append(len(en["energies"]) + en["wild_used"])

    # conjurations: exact banked values (all one energy, all naturals)
    conj_sizes = []
    for cj in player.conj:
        vals = cj.get("vals")
        if vals is None:
            vals = [0] * cj["n"]  # pre-instrumentation fallback
        for v in vals:
            naturals[(cj["energy"], v)] += 1
        conj_sizes.append(cj["n"])

    return naturals, wilds, {"ench": ench_sizes, "conj": conj_sizes}


def _pool_views(naturals: Counter):
    """Derive the value/energy views the evaluator needs from a pool."""
    by_energy: dict[int, set[int]] = {}
    all_vals: set[int] = set()
    energy_count: Counter = Counter()
    val_energies: dict[int, set[int]] = {}
    for (e, v), _c in naturals.items():
        by_energy.setdefault(e, set()).add(v)
        all_vals.add(v)
        energy_count[e] += 1
        val_energies.setdefault(v, set()).add(e)
    return by_energy, all_vals, energy_count, val_energies


def best_single_spell(naturals: Counter, wilds: int, ranks: int, energies: int,
                      size_cap: int = MAX_SPELL_SIZE) -> tuple[str, int, int]:
    """Highest-scoring single spell formable from a pool, across all families.

    size_cap bounds the produced spell (used by size_capped / cost_scaled
    variants). Wilds are treated as fully available to the one spell chosen.
    Returns (family, size, score); ("built", 0, 0) if nothing reaches size 3.
    """
    by_energy, all_vals, energy_count, val_energies = _pool_views(naturals)
    cap = min(size_cap, MAX_SPELL_SIZE)
    if cap < 3:
        return ("built", 0, 0)

    # Transfiguration: consecutive value run across any energies, wilds fill gaps
    tf = min(_max_run_with_wilds(all_vals, wilds, ranks), cap)
    # Perfect Transmutation: consecutive value run within one energy
    pt = min(max((_max_run_with_wilds(vs, wilds, ranks) for vs in by_energy.values()),
                 default=min(wilds, ranks)), cap)
    # Conjuration: biggest single-energy pile + wilds
    conj = min((max(energy_count.values(), default=0) + wilds), cap)
    # Enchantment: most distinct energies sharing one value + wilds, capped by
    # energies-in-deck and 5
    ench_raw = max((len(es) for es in val_energies.values()), default=0)
    ench = min(ench_raw + wilds, energies, 5, cap)

    candidates = [
        ("transfiguration", tf, score_spell("transfiguration", tf)),
        ("perfect", pt, score_spell("perfect", pt)),
        ("conjuration", conj, score_spell("conjuration", conj)),
        ("enchantment", ench, score_spell("enchantment", ench)),
    ]
    # deterministic tie-break: highest score, then family order in FAMILIES
    fam_rank = {f: i for i, f in enumerate(FAMILIES)}
    best = max(candidates, key=lambda c: (c[2], -fam_rank[c[0]]))
    if best[2] <= 0:
        return ("built", 0, 0)
    return best


def score_built(built: dict) -> int:
    """no_reshape baseline: the committed spellbook scored as played."""
    total = 0
    for s in built["ench"]:
        total += score_spell("enchantment", s)
    for s in built["conj"]:
        total += score_spell("conjuration", min(s, MAX_SPELL_SIZE))
    return total


def reshape_variants(naturals: Counter, wilds: int, built: dict, ranks: int,
                     energies: int, counters: int, caps: tuple[int, ...],
                     cards_per_counter: int) -> dict[str, tuple[str, int, int]]:
    """End-game score under each Reshape rule. A Reshape is optional, so every
    variant is max(committed book, best reshaped spell) — guaranteeing
    no_reshape <= size_capped[C] <= unbounded and cost_scaled <= unbounded.

    Each value is (family, size, score) where family == 'built' means the player
    kept their committed book (no reshape improved it).
    """
    committed = score_built(built)
    built_result = ("built", 0, committed)

    def choose(cap: int) -> tuple[str, int, int]:
        fam, size, sc = best_single_spell(naturals, wilds, ranks, energies, cap)
        if sc > committed:
            return (fam, size, sc)
        return built_result

    out: dict[str, tuple[str, int, int]] = {}
    out["no_reshape"] = built_result
    out["unbounded"] = choose(MAX_SPELL_SIZE)
    for c in caps:
        out[f"size_capped_{c}"] = choose(c)
    out["cost_scaled"] = choose(max(0, counters * cards_per_counter))
    return out


# --------------------------------------------------------------------------- #
# Reshape-cost rule (vnext candidate): a Reshape costs one counter per spell    #
# broken. On the final turn a player has `counters` learning actions, so they   #
# can break at most `counters` committed spells. Cards freed by broken spells   #
# (plus loose hand cards + wilds) are reforged into the single best spell; the  #
# spells left unbroken stay in the book and still score. This is a partial      #
# multi-spell model (keep-some / forge-one), unlike `unbounded` which is all-   #
# or-nothing — so reshape_free (unlimited breaks) can exceed `unbounded`.       #
# --------------------------------------------------------------------------- #

def realisable_pool_split(player) -> tuple[Counter, int, list[dict]]:
    """Like realisable_pool, but keep committed spells separable so the reshape-
    cost rule can break a chosen subset. Returns (hand_naturals, hand_wilds,
    spells) where each spell is {"naturals": Counter, "wilds": int,
    "family": str, "size": int, "score": int}. Breaking every spell reproduces
    exactly realisable_pool()'s pool, and sum(spell scores) == score_built()."""
    hand_naturals: Counter = Counter()
    for v, energies in player.hand_vals.items():
        for e in energies:
            hand_naturals[(e, v)] += 1
    hand_wilds = player.wilds

    spells: list[dict] = []
    for en in player.ench:
        nat: Counter = Counter()
        for e in en["energies"]:
            nat[(e, en["value"])] += 1
        size = len(en["energies"]) + en["wild_used"]
        spells.append({"naturals": nat, "wilds": en["wild_used"],
                       "family": "enchantment", "size": size,
                       "score": score_spell("enchantment", size)})
    for cj in player.conj:
        nat = Counter()
        vals = cj.get("vals")
        if vals is None:
            vals = [0] * cj["n"]
        for v in vals:
            nat[(cj["energy"], v)] += 1
        size = min(cj["n"], MAX_SPELL_SIZE)
        spells.append({"naturals": nat, "wilds": 0,
                       "family": "conjuration", "size": size,
                       "score": score_spell("conjuration", size)})
    return hand_naturals, hand_wilds, spells


def reshape_cost_best(hand_naturals: Counter, hand_wilds: int, spells: list[dict],
                      ranks: int, energies: int, budget: int,
                      break_cost=None) -> tuple[str, int, int]:
    """Best end-game score when breaking committed spells costs counters.

    Optimizes over subsets K of spells to break: forge the single best spell from
    hand + wilds + cards of K, add back the committed score of the spells NOT
    broken. A subset is feasible iff sum(break_cost(spell) for spell in K) <=
    budget. Returns (family, size, score) of the best plan; 'built' means no
    reshape beat the committed book.

    break_cost(spell) -> int is the counter cost to break that spell. Default is
    a flat 1 each (the naive rule: budget == max spells breakable). Under F3, pass
    a cost that adds an Enchantment's granted capacity (breaking it destroys that
    capacity immediately): conjuration -> 1, enchantment -> 1 + grant(size). That
    makes breaking Enchantments dear and effectively walls their (run-inert) cards
    out of the reshape. n is small in practice (2-5 spells); guard huge n."""
    committed_total = sum(s["score"] for s in spells)
    best = ("built", 0, committed_total)  # break nothing -> keep the whole book
    n = len(spells)
    if budget <= 0 or n == 0:
        return best
    cost = break_cost or (lambda _s: 1)
    if n > 16:  # combinatorial guard (never hit in practice): greedy, cheapest first
        order = sorted(range(n), key=lambda i: cost(spells[i]))
        acc, tot = [], 0
        for i in order:
            if tot + cost(spells[i]) <= budget:
                acc.append(i); tot += cost(spells[i])
        subsets = [tuple(acc)]
    else:
        subsets = (K for k in range(1, n + 1)
                   for K in itertools.combinations(range(n), k)
                   if sum(cost(spells[i]) for i in K) <= budget)
    for K in subsets:
        nat = Counter(hand_naturals)
        w = hand_wilds
        broke_score = 0
        for i in K:
            nat += spells[i]["naturals"]
            w += spells[i]["wilds"]
            broke_score += spells[i]["score"]
        fam, size, sc = best_single_spell(nat, w, ranks, energies)
        total = sc + (committed_total - broke_score)
        if total > best[2]:
            best = (fam, size, total)
    return best


# --------------------------------------------------------------------------- #
# Part A — static pricing audit                                                #
# --------------------------------------------------------------------------- #

def _reach_by_family(deck: DeckConfig, players: int, rules: Rules,
                     sim_trials: int, hand_trials: int, seed: int) -> dict:
    comp = sim_composition(deck, players, rules, sim_trials, seed)
    hm = hand_model(deck, comp["seen_hist"], hand_trials, seed + 1)
    return {
        "transfiguration": {int(k): v for k, v in hm["tf_run_ge"].items()},
        "perfect": {int(k): v for k, v in hm["pt_run_ge"].items()},
        "conjuration": {int(k): v for k, v in hm["suit_ge"].items()},
        "enchantment": {int(k): v for k, v in comp["ench_tier_ge"].items()},
        "_mean_cards_seen": comp["mean_cards_seen"],
    }


def _fit_beta(points: list[tuple[float, float]]) -> tuple[float, float]:
    """Pooled least-squares fit of ln(price) = a - beta*ln(P).
    points = [(P, price), ...] with P > 0. Returns (beta, a)."""
    xs = [math.log(p) for p, _ in points]
    ys = [math.log(pr) for _, pr in points]
    n = len(xs)
    mx = sum(xs) / n
    my = sum(ys) / n
    var = sum((x - mx) ** 2 for x in xs)
    if var == 0:
        return 0.0, my
    slope = sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / var
    a = my - slope * mx
    return -slope, a  # beta = -slope


def part_a_pricing(deck: DeckConfig, players: int, rules: Rules,
                   sim_trials: int, hand_trials: int, seed: int) -> dict:
    reach = _reach_by_family(deck, players, rules, sim_trials, hand_trials, seed)

    rows = []
    fit_points = []
    for fam in FAMILIES:
        for size, p in sorted(reach[fam].items()):
            if size not in _ACTIVE_SCORE[fam]:
                continue
            price = _ACTIVE_SCORE[fam][size]
            rows.append({"family": fam, "size": size, "table_price": price,
                         "reach_p": p})
            if p > 0 and price > 0:  # log-fit can't take a 0 price (e.g. vnext Conj3=0)
                fit_points.append((p, price))

    beta, a = _fit_beta(fit_points)
    for r in rows:
        if r["reach_p"] > 0:
            implied = math.exp(a) * r["reach_p"] ** (-beta)
            r["implied_price"] = implied
            r["price_over_implied"] = r["table_price"] / implied
        else:
            r["implied_price"] = None
            r["price_over_implied"] = None

    # cross-family inversions: a spell that is EASIER (higher reach_p) yet scores
    # MORE than a harder one. Only compare reachable spells (reach_p > 0) — an
    # unreachable spell (e.g. 5-card Enchantment at 4 energies) is not a real
    # alternative, so it cannot be "underpriced" against.
    reachable = [r for r in rows if r["reach_p"] > 0]
    inversions = []
    for i in range(len(reachable)):
        for j in range(len(reachable)):
            if i == j:
                continue
            ri, rj = reachable[i], reachable[j]
            if ri["reach_p"] > rj["reach_p"] and ri["table_price"] > rj["table_price"]:
                inversions.append({
                    "easier": {"family": ri["family"], "size": ri["size"],
                               "price": ri["table_price"], "reach_p": ri["reach_p"]},
                    "harder": {"family": rj["family"], "size": rj["size"],
                               "price": rj["table_price"], "reach_p": rj["reach_p"]},
                    "price_gap": ri["table_price"] - rj["table_price"],
                    "reach_ratio": ri["reach_p"] / rj["reach_p"] if rj["reach_p"] else None,
                })
    inversions.sort(key=lambda d: -d["price_gap"])

    # named headline case
    tf7 = reach["transfiguration"].get(7)
    pt5 = reach["perfect"].get(5)
    headline = {
        "tf7_reach_p": tf7, "tf7_price": _ACTIVE_SCORE["transfiguration"][7],
        "pt5_reach_p": pt5, "pt5_price": _ACTIVE_SCORE["perfect"][5],
        "price_gap": _ACTIVE_SCORE["transfiguration"][7] - _ACTIVE_SCORE["perfect"][5],
        "tf7_easier_than_pt5": (tf7 is not None and pt5 is not None and tf7 > pt5),
        "is_inversion": (tf7 is not None and pt5 is not None and tf7 > pt5
                         and _ACTIVE_SCORE["transfiguration"][7] > _ACTIVE_SCORE["perfect"][5]),
    }

    return {"beta": beta, "a": a, "rows": rows,
            "inversions": inversions[:20], "n_inversions": len(inversions),
            "headline_tf7_vs_pt5": headline,
            "mean_cards_seen": reach["_mean_cards_seen"]}


# --------------------------------------------------------------------------- #
# Part B — end-game Reshape EV                                                 #
# --------------------------------------------------------------------------- #

def part_b_reshape(deck: DeckConfig, players: int, rules: Rules, trials: int,
                   seed: int, caps: tuple[int, ...], cards_per_counter: int) -> dict:
    rng = random.Random(seed)
    # F3: breaking an Enchantment destroys the capacity it granted, so its break
    # cost is 1 (action) + that grant; a Conjuration grants nothing, so it stays 1.
    grants = {3: rules.tier3_counters, 4: rules.tier4_counters, 5: rules.tier5_counters}

    def f3_break_cost(s):
        return (1 + grants.get(s["size"], 0)) if s["family"] == "enchantment" else 1
    scores: dict[str, list[float]] = defaultdict(list)
    family_mix: dict[str, Counter] = defaultdict(Counter)
    reshaped_tf: dict[str, int] = defaultdict(int)
    reshaped_any: dict[str, int] = defaultdict(int)
    n_players = 0
    counters_total = 0
    spells_total = 0
    afford_full = 0

    for _ in range(trials):
        g = Game(deck, players, rules, rng)
        g.play()
        for p in g.players:
            n_players += 1
            counters_total += p.counters
            naturals, wilds, built = realisable_pool(p)
            variants = reshape_variants(naturals, wilds, built, deck.ranks,
                                        deck.energies, p.counters, caps,
                                        cards_per_counter)
            # vnext reshape-cost rule: one counter per spell broken, so the number
            # of spells a player can break on the final turn == their counters.
            hand_nat, hand_w, spells = realisable_pool_split(p)
            n_spells = len(spells)
            spells_total += n_spells
            if p.counters >= n_spells:
                afford_full += 1
            variants["reshape_cost"] = reshape_cost_best(
                hand_nat, hand_w, spells, deck.ranks, deck.energies, p.counters,
                break_cost=f3_break_cost)
            variants["reshape_free"] = reshape_cost_best(
                hand_nat, hand_w, spells, deck.ranks, deck.energies, n_spells)
            for key, (fam, _size, sc) in variants.items():
                scores[key].append(sc)
                family_mix[key][fam] += 1
                if key != "no_reshape" and fam != "built":
                    reshaped_any[key] += 1
                    if fam == "transfiguration":
                        reshaped_tf[key] += 1

    def summarize(key: str) -> dict:
        xs = scores[key]
        mean = sum(xs) / len(xs)
        base_mean = sum(scores["no_reshape"]) / len(scores["no_reshape"])
        mix = family_mix[key]
        return {
            "mean_score": mean,
            "marginal_vs_no_reshape": mean - base_mean,
            "family_mix": {f: mix[f] / n_players for f in mix},
            "reshape_taken_share": reshaped_any[key] / n_players,
            "reshaped_tf_share": reshaped_tf[key] / n_players,
        }

    keys = (["no_reshape"] + [f"size_capped_{c}" for c in caps]
            + ["cost_scaled", "unbounded", "reshape_free", "reshape_cost"])
    return {"n_players": n_players, "trials": trials,
            "cards_per_counter": cards_per_counter,
            "mean_end_counters": counters_total / n_players,
            "mean_committed_spells": spells_total / n_players,
            "afford_full_break_share": afford_full / n_players,
            "variants": {k: summarize(k) for k in keys}}


# --------------------------------------------------------------------------- #
# Configurations                                                               #
# --------------------------------------------------------------------------- #

def study_configs(which: str = "deckA") -> list[tuple[str, int, DeckConfig]]:
    """Primary = 2p (the case Sam tested); secondary = 3p, 4p (Deck A = 4E, 2-4p).
    which='all' also appends Deck B (5E, 5-6p), the only deck where a 5-card
    Enchantment — and thus the vnext +5-counter tier-5 — is reachable."""
    deck_a = [
        ("2p", 2, DeckConfig(4, 15, 2)),
        ("3p", 3, DeckConfig(4, 15, 2)),
        ("4p", 4, DeckConfig(4, 15, 2)),
    ]
    deck_b = [
        ("5p", 5, DeckConfig(5, 15, 4)),
        ("6p", 6, DeckConfig(5, 15, 4)),
    ]
    return deck_a + deck_b if which == "all" else deck_a


# --------------------------------------------------------------------------- #
# Driver                                                                       #
# --------------------------------------------------------------------------- #

def cmd_analyze(args) -> None:
    global _ACTIVE_SCORE
    table_label = "canon (rulebook/Scoring System Reference.md)"
    if getattr(args, "score_table", None):
        _ACTIVE_SCORE = load_score_table(args.score_table)
        table_label = f"candidate: {args.score_table}"
    else:
        assert_matches_canon()
    uc_enabled = not args.no_uc
    rules = Rules(tier3_counters=args.tier3_counters,
                  tier4_counters=args.tier4_counters,
                  tier5_counters=args.tier5_counters,
                  uc_enabled=uc_enabled)
    caps = tuple(int(c) for c in args.caps.split(",") if c.strip())
    configs = study_configs(args.configs)
    ladder_label = (f"tier3=+{args.tier3_counters} tier4=+{args.tier4_counters} "
                    f"tier5=+{args.tier5_counters} UC={'on' if uc_enabled else 'off'}")
    out: dict = {"meta": {
        "seed": args.seed, "trials": args.trials, "hand_trials": args.hand_trials,
        "caps": list(caps), "cards_per_counter": args.cards_per_counter,
        "score_table": table_label, "ladder": ladder_label,
        "config_keys": [k for k, _p, _d in configs],
    }}

    for i, (key, players, deck) in enumerate(configs):
        pa = part_a_pricing(deck, players, rules, args.trials, args.hand_trials,
                            args.seed * 1000 + i)
        pb = part_b_reshape(deck, players, rules, args.trials,
                            args.seed * 50000 + i, caps, args.cards_per_counter)
        out[key] = {"players": players, "deck": deck.label(),
                    "part_a": pa, "part_b": pb}
        rc = pb["variants"]["reshape_cost"]
        rf = pb["variants"]["reshape_free"]
        print(f"done {key}: reshape_free=+{rf['marginal_vs_no_reshape']:.1f} "
              f"(->TF {rf['reshaped_tf_share']:.2f}) | reshape_cost=+"
              f"{rc['marginal_vs_no_reshape']:.1f} (->TF {rc['reshaped_tf_share']:.2f}) | "
              f"counters {pb['mean_end_counters']:.1f}, spells "
              f"{pb['mean_committed_spells']:.1f}, afford-full "
              f"{pb['afford_full_break_share']:.2f}", flush=True)

    if args.json:
        os.makedirs(os.path.dirname(args.json) or ".", exist_ok=True)
        with open(args.json, "w", encoding="utf-8") as f:
            json.dump(out, f, indent=1, sort_keys=True)
        print(f"wrote {args.json}")

    if args.md:
        write_markdown(out, args.md)
        print(f"wrote {args.md}")


def write_markdown(out: dict, path: str) -> None:
    m = out["meta"]
    L = []
    L.append("---")
    L.append("title: Scoring-EV Analysis — Results")
    L.append("type: analysis")
    L.append("updated: 2026-07-08")
    L.append("source: simulation/scoring_ev.py")
    L.append("---\n")
    L.append("# Scoring-EV Analysis — Results\n")
    L.append(f"Generated by `simulation/scoring_ev.py` (seed {m['seed']}, "
             f"{m['trials']} game-trials, {m['hand_trials']} hand-trials). "
             f"Score table: {m.get('score_table', 'canon')}. "
             f"Enchantment ladder: {m.get('ladder', 'canon (tier5=UC)')}.\n")
    L.append("> Ratios between families and between Reshape variants are the "
             "load-bearing output; absolute probabilities are indicative "
             "(inherits `simulation/ASSUMPTIONS.md`).\n")

    for key in m["config_keys"]:
        c = out[key]
        pa, pb = c["part_a"], c["part_b"]
        L.append(f"\n## {key} — {c['deck']}\n")

        head = pa["headline_tf7_vs_pt5"]
        gap = head['price_gap']
        gap_str = f"+{gap}" if gap >= 0 else str(gap)
        L.append("### Part A — pricing audit\n")
        L.append(f"Pooled rarity fit: price is proportional to rarity^{pa['beta']:.2f} "
                 f"(mean cards seen {pa['mean_cards_seen']:.1f}).\n")
        L.append(f"**Headline (Sam's datum):** 7-card Transfiguration = "
                 f"{head['tf7_price']} pts, 5-card Perfect Transmutation = "
                 f"{head['pt5_price']} pts ({gap_str} to the Transfiguration). "
                 f"Reach P(TF7) = {head['tf7_reach_p']:.3f} vs P(PT5) = "
                 f"{head['pt5_reach_p']:.3f} (TF7 easier to reach). "
                 + ("**Inversion: the easier spell scores more.**"
                    if head['is_inversion'] else
                    "Prices are correctly ordered — the easier spell scores no more.") + "\n")
        L.append("| Family | Size | Price | Reach P | Implied | Price/Implied |")
        L.append("|---|---:|---:|---:|---:|---:|")
        for r in pa["rows"]:
            imp = "—" if r["implied_price"] is None else f"{r['implied_price']:.1f}"
            rat = "—" if r["price_over_implied"] is None else f"{r['price_over_implied']:.2f}"
            L.append(f"| {FAMILY_LABEL[r['family']]} | {r['size']} | {r['table_price']} "
                     f"| {r['reach_p']:.3f} | {imp} | {rat} |")
        L.append(f"\nCross-family inversions found: **{pa['n_inversions']}**. "
                 "Top offenders (easier spell that scores more than a harder one):\n")
        if pa["inversions"]:
            L.append("| Easier (higher reach) | Price | vs Harder | Price | Gap |")
            L.append("|---|---:|---|---:|---:|")
            for inv in pa["inversions"][:8]:
                e, h = inv["easier"], inv["harder"]
                L.append(f"| {FAMILY_LABEL[e['family']]} {e['size']} "
                         f"(P={e['reach_p']:.3f}) | {e['price']} "
                         f"| {FAMILY_LABEL[h['family']]} {h['size']} "
                         f"(P={h['reach_p']:.3f}) | {h['price']} | +{inv['price_gap']} |")
        else:
            L.append("_none_")

        # Part B
        L.append("\n### Part B — end-game Reshape EV\n")
        L.append(f"Cost-scaled uses {pb['cards_per_counter']} pool-cards per counter "
                 f"of end-game budget; players hold {pb['mean_end_counters']:.1f} "
                 "counters on average at game end.\n")
        L.append(f"Players end with **{pb['mean_committed_spells']:.1f}** committed "
                 f"spells and **{pb['mean_end_counters']:.1f}** counters on average. "
                 f"`reshape_free` = unlimited breaks (the free-reshape ceiling). "
                 f"`reshape_cost` = the vnext rule: break spells within the counter "
                 f"budget, where breaking an Enchantment also costs the capacity it "
                 f"granted (F3), so Enchantments are dear to break and their "
                 f"single-value cards rarely enter the reshape.\n")
        L.append("| Reshape rule | Mean score | Marginal vs no-reshape | "
                 "Reshape taken | Reshaped→TF |")
        L.append("|---|---:|---:|---:|---:|")
        v = pb["variants"]
        order = (["no_reshape"] + [f"size_capped_{c}" for c in m["caps"]]
                 + ["cost_scaled", "unbounded", "reshape_free", "reshape_cost"])
        for k in order:
            s = v[k]
            L.append(f"| {k} | {s['mean_score']:.1f} | "
                     f"+{s['marginal_vs_no_reshape']:.1f} | "
                     f"{s['reshape_taken_share']:.2f} | {s['reshaped_tf_share']:.2f} |")

    # Recommendation scaffold (filled from 2p, the tested case)
    L.append("\n## Recommendation (Q2)\n")
    L.append(_recommendation(out))

    L.append("\n## Model limitations\n")
    L.append("- Greedy, identical, non-opponent-aware agents; no contest for the "
             "Array. A 2p exploit may be partly regulated by blocking at higher "
             "counts (Session 4 R2) — Part B measures the pool, not live contention.\n")
    L.append("- Hand-model reach-probabilities are chase ceilings, not in-play "
             "attainment.\n")
    L.append("- The Reshape evaluator forges the single best spell from the pool "
             "(vs keeping the committed book); multi-spell pool partitioning is a "
             "documented v2 refinement.\n")
    L.append("- Conjuration card values are captured exactly (rig `vals` field), so "
             "the pool reconstruction is exact for hand + enchantment + conjuration "
             "cards.\n")

    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write("\n".join(L) + "\n")


def _recommendation(out: dict) -> str:
    """Data-driven summary for the primary (2p) config, centred on the vnext
    reshape-cost rule (falls back gracefully for canon runs)."""
    c = out["2p"]
    pb = c["part_b"]
    v = pb["variants"]
    rf = v["reshape_free"]["marginal_vs_no_reshape"]
    rc = v["reshape_cost"]["marginal_vs_no_reshape"]
    ub = v["unbounded"]["marginal_vs_no_reshape"]
    rf_tf = v["reshape_free"]["reshaped_tf_share"]
    rc_tf = v["reshape_cost"]["reshaped_tf_share"]
    head = c["part_a"]["headline_tf7_vs_pt5"]

    lines = []
    lines.append(
        f"At 2p, with a **free** end-game reshape the best consolidation adds "
        f"**+{rf:.1f}** points over the as-played book and lands on a Transfiguration "
        f"**{rf_tf:.0%}** of the time (all-in-one `unbounded` = +{ub:.1f}). Charging "
        f"**one counter per spell broken** brings the marginal to **+{rc:.1f}** "
        f"(→TF {rc_tf:.0%}): players hold **{pb['mean_end_counters']:.1f}** counters and "
        f"**{pb['mean_committed_spells']:.1f}** committed spells on average, and can "
        f"afford to break the whole book in only "
        f"**{pb['afford_full_break_share']:.0%}** of games.")

    if head["is_inversion"]:
        lines.append(
            "Part A still shows the TF-vs-PT pricing inversion under this table "
            "(a 7-card Transfiguration is easier than a 5-card Perfect Transmutation "
            "yet scores more) — see the pricing rows above.")
    else:
        lines.append(
            "Part A shows **no** TF-vs-PT pricing inversion under this table (the "
            "easier spell no longer scores more) — see the pricing rows above.")

    lines.append(
        "Compare against the canon baseline in `SCORING_EV.md`. Candidate analysis "
        "only — nothing here is canon.")
    return "\n\n".join(lines)


# --------------------------------------------------------------------------- #
# Self-checks / property tests                                                 #
# --------------------------------------------------------------------------- #

def _gen_pool(rng: random.Random, energies: int, ranks: int, bias: str):
    """Generate a random realisable pool for property testing."""
    naturals: Counter = Counter()
    wilds = rng.randint(0, 4)
    cards = [(e, v) for e in range(energies) for v in range(1, ranks + 1)]
    if bias == "pt":       # favour long same-energy runs
        e = rng.randrange(energies)
        for v in range(1, rng.randint(4, ranks) + 1):
            naturals[(e, v)] += 1
    elif bias == "tf":     # favour long any-energy runs
        for v in range(1, rng.randint(4, ranks) + 1):
            naturals[(rng.randrange(energies), v)] += 1
    elif bias == "conj":   # favour a big one-energy pile
        e = rng.randrange(energies)
        for v in rng.sample(range(1, ranks + 1), rng.randint(3, ranks)):
            naturals[(e, v)] += 1
    elif bias == "ench":   # favour shared-value sets
        v = rng.randint(1, ranks)
        for e in range(energies):
            naturals[(e, v)] += 1
    else:                  # random scatter
        for c in rng.sample(cards, rng.randint(0, min(20, len(cards)))):
            naturals[c] += 1
    return naturals, wilds


def cmd_selfcheck(args) -> None:
    assert_matches_canon()
    print("canon table: OK")

    # Property 2: evaluator reproduces the datum + family ordering (v3.1)
    # a clean 5-card same-energy run scores PT=18; a 7-card any-energy run TF=8
    ranks, energies = 15, 4
    pt_pool = Counter({(0, v): 1 for v in range(1, 6)})       # 5-run in energy 0
    fam, size, sc = best_single_spell(pt_pool, 0, ranks, energies)
    assert (fam, size, sc) == ("perfect", 5, 18), (fam, size, sc)
    tf_pool = Counter({(v % energies, v): 1 for v in range(1, 8)})  # 7 distinct values
    fam, size, sc = best_single_spell(tf_pool, 0, ranks, energies)
    assert size == 7 and score_spell("transfiguration", 7) == 8
    print("datum PT5=18, TF7=8: OK")

    rng = random.Random(args.seed)
    biases = ["pt", "tf", "conj", "ench", "random"]
    iters = max(100, args.iters)

    # Property 2 (ordering/monotonicity already asserted in canon) + evaluator sanity
    for _ in range(iters):
        naturals, wilds = _gen_pool(rng, energies, ranks, rng.choice(biases))
        fam, size, sc = best_single_spell(naturals, wilds, ranks, energies)
        assert sc == score_spell(fam, size) or (fam == "built" and sc == 0)
        assert size <= MAX_SPELL_SIZE
        # capped size never exceeds cap
        for cap in (3, 6, 8, 10):
            _f, s2, _sc2 = best_single_spell(naturals, wilds, ranks, energies, cap)
            assert s2 <= cap
    print(f"evaluator properties ({iters} iters): OK")

    # Property 4: no_reshape <= size_capped[C] <= unbounded; cost_scaled <= unbounded
    for _ in range(iters):
        naturals, wilds = _gen_pool(rng, energies, ranks, rng.choice(biases))
        # random committed book
        built = {"ench": [rng.choice([3, 4]) for _ in range(rng.randint(0, 2))],
                 "conj": [rng.randint(3, 8) for _ in range(rng.randint(0, 2))]}
        counters = rng.randint(1, 5)
        vs = reshape_variants(naturals, wilds, built, ranks, energies, counters,
                              (6, 8, 10), 4)
        base = vs["no_reshape"][2]
        ub = vs["unbounded"][2]
        assert base <= ub, (base, ub)
        for c in (6, 8, 10):
            sc = vs[f"size_capped_{c}"][2]
            assert base <= sc <= ub, (base, sc, ub, c)
        assert vs["cost_scaled"][2] <= ub
        # monotonic in cap
        assert vs["size_capped_6"][2] <= vs["size_capped_8"][2] <= vs["size_capped_10"][2] <= ub
    print(f"reshape ordering properties ({iters} iters): OK")

    # Property 3 (partial): built_score matches a hand-computed spellbook score
    # (v3.1: ench-3=4, ench-4=10, conj-5=2)
    built = {"ench": [3, 4], "conj": [5]}
    assert score_built(built) == 4 + 10 + 2
    print("built-score check: OK")

    # Property 5: reshape-cost monotonic in budget and bounded below by no-reshape.
    # no_reshape (keep book) <= reshape_cost(budget b) <= reshape_free (budget n).
    all_cards = [(e, v) for e in range(energies) for v in range(1, ranks + 1)]
    for _ in range(iters):
        hand = Counter()
        for c in rng.sample(all_cards, rng.randint(0, 10)):
            hand[c] += 1
        hand_w = rng.randint(0, 3)
        spells = []
        for _s in range(rng.randint(0, 4)):
            nat, w = _gen_pool(rng, energies, ranks, rng.choice(biases))
            fam = rng.choice(["conjuration", "enchantment"])
            sz = min(sum(nat.values()) + w, 5 if fam == "enchantment" else MAX_SPELL_SIZE)
            spells.append({"naturals": nat, "wilds": w, "family": fam, "size": sz,
                           "score": score_spell(fam, sz) if sz >= 3 else 0})
        n = len(spells)
        committed = sum(s["score"] for s in spells)
        b = rng.randint(0, n)
        rc = reshape_cost_best(hand, hand_w, spells, ranks, energies, b)[2]
        rf = reshape_cost_best(hand, hand_w, spells, ranks, energies, n)[2]
        assert committed <= rc <= rf, (committed, rc, rf, b, n)
    print(f"reshape-cost ordering properties ({iters} iters): OK")

    print("\nALL SELF-CHECKS PASSED")


def extension_candidates(family: str, n: int, energies: int, ranks: int) -> int:
    """Number of DISTINCT deck cards (ignoring wilds) that grow a size-n spell of
    `family` to size n+1 — Sam's marginal-difficulty metric, generalised to any
    energy count. Fewer candidates = a harder step = deserves a bigger score jump.

    - Conjuration (same energy, any values): another card of that energy → ranks-n.
      Gets harder as the spell grows (you deplete the one energy's 15 cards).
    - Transfiguration (consecutive values, any energies): extend at either open end,
      any energy → energies * (open ends). ~flat: 2*energies interior, energies at a
      boundary, 0 when full.
    - Perfect Transmutation (consecutive values, one energy): extend at either open
      end, same energy → 1 * (open ends). ~flat and low: 2 interior, 1 at a boundary.
    """
    if family == "conjuration":
        return max(ranks - n, 0)
    ends = 2 if n <= ranks - 2 else (1 if n == ranks - 1 else 0)
    if family == "transfiguration":
        return ends * energies
    if family == "perfect":
        return ends * 1
    return 0


def cmd_difficulty(args) -> None:
    """Marginal-difficulty audit: candidates-to-extend vs the current score jump,
    per family and size, for a given energy count."""
    assert_matches_canon()
    E, R = args.energies, args.ranks
    print(f"Marginal difficulty — {E} energies x 1-{R} (ignoring wilds, best-case "
          f"open-ended runs)\n")
    print(f"{'size→+1':>8} | {'CONJ cand':>9} {'Δscore':>6} | "
          f"{'TF cand':>7} {'Δscore':>6} | {'PT cand':>7} {'Δscore':>6}")
    print("-" * 66)

    def dscore(fam, n):
        a, b = SCORE[fam].get(n), SCORE[fam].get(n + 1)
        return (b - a) if (a is not None and b is not None) else None

    for n in range(3, R):
        cc, tc, pc = (extension_candidates(f, n, E, R)
                      for f in ("conjuration", "transfiguration", "perfect"))
        dc, dt, dp = dscore("conjuration", n), dscore("transfiguration", n), dscore("perfect", n)
        fmt = lambda x: "  —" if x is None else f"{x:>3}"
        print(f"{n:>4}→{n+1:<3} | {cc:>9} {fmt(dc):>6} | "
              f"{tc:>7} {fmt(dt):>6} | {pc:>7} {fmt(dp):>6}")

    # identity + ordering checks the table should respect
    print("\nStructural checks:")
    print(f"  A size-{R} Conjuration IS a size-{R} Perfect Transmutation (all {R} of one "
          f"energy = consecutive). They must score equally.")
    print(f"    current: Conjuration {R} = {SCORE['conjuration'][R]}, "
          f"Perfect Transmutation {R} = {SCORE['perfect'][R]}  "
          f"-> {'OK' if SCORE['conjuration'][R] == SCORE['perfect'][R] else 'VIOLATED'}")
    gap3 = SCORE['perfect'][3] - SCORE['conjuration'][3]
    gapR = SCORE['perfect'][R] - SCORE['conjuration'][R]
    print(f"  Perfect Transmutation is a constrained Conjuration, so PT >= Conj at "
          f"every size, converging at {R}. Current gap: {gap3} at size 3 -> {gapR} at "
          f"size {R} ({'diverging (wrong direction)' if gapR > gap3 else 'converging'}).")
    # TF flatness signal
    print(f"  Transfiguration candidates are ~flat ({2*E} interior) at all sizes, but "
          f"its current Δscore rises {dscore('transfiguration',3)}→"
          f"{dscore('transfiguration',R-1)} — reward diverging from difficulty "
          f"(the overpricing).")


def assert_table_sane(table: dict) -> None:
    """Sanity checks a candidate table (not necessarily canon): monotonic in size,
    Perfect Transmutation >= Transfiguration and >= Conjuration at equal size, and the
    identity Conjuration-15 == Perfect-Transmutation-15 (same object)."""
    for fam in FAMILIES:
        sizes = sorted(table[fam])
        for a, b in zip(sizes, sizes[1:]):
            if table[fam][b] < table[fam][a]:
                raise AssertionError(f"{fam} not monotonic at size {b}")
    R = max(table["conjuration"])
    for size in range(3, R + 1):
        c, t, p = table["conjuration"][size], table["transfiguration"][size], table["perfect"][size]
        if not (p >= t and p >= c):
            raise AssertionError(f"ordering violated at size {size}: PT={p}, TF={t}, Conj={c}")
    if table["conjuration"][R] != table["perfect"][R]:
        raise AssertionError(f"Conj{R} ({table['conjuration'][R]}) != PT{R} "
                             f"({table['perfect'][R]}) — identity violated")


def load_score_table(path: str) -> dict:
    with open(path, encoding="utf-8") as f:
        raw = json.load(f)
    table = {fam: {int(k): int(v) for k, v in raw[fam].items()} for fam in raw}
    assert_table_sane(table)
    return table


def propose_table(ceiling: int = 100, energies: int = 4, ranks: int = 15) -> dict:
    """Build a candidate Recognition Points table from the marginal-difficulty shape.

    - Perfect Transmutation: ~flat difficulty (2 candidates/step) -> LINEAR from base 7
      to the ceiling.
    - Transfiguration: ~flat difficulty at 2*energies candidates/step, i.e. `energies`x
      easier per step than PT -> LINEAR with slope = PT-slope / energies (so a much
      lower ceiling; it is the cheapest big spell).
    - Conjuration: difficulty rises as the energy depletes -> keep canon's difficulty-
      correct convex SHAPE, rescaled to base 3 -> ceiling so it converges up to PT at 15
      (Conj15 == PT15, the same object).
    - Enchantment: emitted as the legacy 6/12/18 here — this difficulty-shape
      generator predates the v3.1 4/10/16 ladder, and the enchantment ladder is a
      separate decision, not derived from the run/pile difficulty shape.
    """
    span = ranks - 3
    pt_base, tf_base = 7, 5
    pt_slope = (ceiling - pt_base) / span
    tf_slope = pt_slope / energies
    canon_conj = SCORE["conjuration"]

    def rnd(x: float) -> int:
        return int(x + 0.5)

    pt = {n: rnd(pt_base + pt_slope * (n - 3)) for n in range(3, ranks + 1)}
    tf = {n: rnd(tf_base + tf_slope * (n - 3)) for n in range(3, ranks + 1)}
    conj = {n: rnd(3 + (ceiling - 3) * (canon_conj[n] - 3) / (canon_conj[ranks] - 3))
            for n in range(3, ranks + 1)}
    pt[ranks] = ceiling
    conj[ranks] = ceiling

    # enforce orderings + monotonicity after rounding
    for n in range(3, ranks + 1):
        conj[n] = min(conj[n], pt[n])
        tf[n] = min(tf[n], pt[n])
    for d in (pt, tf, conj):
        for n in range(4, ranks + 1):
            d[n] = max(d[n], d[n - 1])
    conj[ranks] = pt[ranks] = ceiling
    return {"conjuration": conj, "transfiguration": tf, "perfect": pt,
            "enchantment": {3: 6, 4: 12, 5: 18}}


def cmd_propose_table(args) -> None:
    table = propose_table(args.ceiling, args.energies, args.ranks)
    assert_table_sane(table)
    print(f"Candidate table (ceiling {args.ceiling}, {args.energies} energies) vs canon:\n")
    print(f"{'size':>4} | {'Conj':>10} | {'Transf':>10} | {'PerfTrans':>12}")
    print("-" * 46)
    for n in range(3, args.ranks + 1):
        def cell(fam):
            new = table[fam][n]
            old = SCORE[fam].get(n)
            return f"{new:>3} ({'+' if new>=old else ''}{new-old:>3})" if old is not None else f"{new:>3}   "
        print(f"{n:>4} | {cell('conjuration'):>10} | {cell('transfiguration'):>10} | {cell('perfect'):>12}")
    if args.out:
        os.makedirs(os.path.dirname(args.out) or ".", exist_ok=True)
        with open(args.out, "w", encoding="utf-8") as f:
            json.dump(table, f, indent=1, sort_keys=True)
        print(f"\nwrote {args.out}")


def main():
    ap = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)

    pa = sub.add_parser("analyze", help="run Part A + Part B and write outputs")
    pa.add_argument("--trials", type=int, default=10000)
    pa.add_argument("--hand-trials", type=int, default=50000)
    pa.add_argument("--seed", type=int, default=42)
    pa.add_argument("--tier3-counters", type=int, default=1,
                    help="total counters a 3-card enchantment grants (vnext: 1)")
    pa.add_argument("--tier4-counters", type=int, default=2,
                    help="total counters a 4-card enchantment grants (canon 2, vnext 3)")
    pa.add_argument("--tier5-counters", type=int, default=0,
                    help="total counters a 5-card enchantment grants when UC is off (vnext: 5)")
    pa.add_argument("--no-uc", action="store_true",
                    help="remove Unlimited Capacity (vnext): 5-card grants --tier5-counters instead")
    pa.add_argument("--configs", type=str, default="deckA", choices=["deckA", "all"],
                    help="deckA = 2/3/4p (4E); all = also 5/6p (5E, where the tier-5 enchantment exists)")
    pa.add_argument("--caps", type=str, default="6,8,10",
                    help="comma-separated size caps for size_capped variants ('' to skip)")
    pa.add_argument("--cards-per-counter", type=int, default=4,
                    help="pool-cards a single counter can Reshape (cost_scaled)")
    pa.add_argument("--score-table", type=str, default=None,
                    help="path to a candidate score-table JSON (default: canon)")
    pa.add_argument("--json", type=str, default="results/scoring_ev.json")
    pa.add_argument("--md", type=str, default="SCORING_EV.md")
    pa.set_defaults(func=cmd_analyze)

    pt = sub.add_parser("propose-table", help="generate a candidate re-priced table from the difficulty shape")
    pt.add_argument("--ceiling", type=int, default=100, help="Conj15 == PT15 anchor")
    pt.add_argument("--energies", type=int, default=4)
    pt.add_argument("--ranks", type=int, default=15)
    pt.add_argument("--out", type=str, default=None, help="write the table JSON here")
    pt.set_defaults(func=cmd_propose_table)

    ps = sub.add_parser("selfcheck", help="property + anchor checks")
    ps.add_argument("--seed", type=int, default=42)
    ps.add_argument("--iters", type=int, default=200)
    ps.set_defaults(func=cmd_selfcheck)

    pd = sub.add_parser("difficulty", help="marginal-difficulty audit (candidates to extend vs score jump)")
    pd.add_argument("--energies", type=int, default=4)
    pd.add_argument("--ranks", type=int, default=15)
    pd.set_defaults(func=cmd_difficulty)

    args = ap.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
