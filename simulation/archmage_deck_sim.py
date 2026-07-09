#!/usr/bin/env python3
"""
Archmage Ascension — deck-configuration Monte Carlo rig
=======================================================

Reusable simulation for deck-structure questions (energies, rank range, wilds,
player count, enchantment-ladder tunables). See ASSUMPTIONS.md next to this file
for the player-strategy model and every simplification made.

Usage
-----
Single configuration:
    python archmage_deck_sim.py run --energies 5 --ranks 15 --wilds 4 \
        --players 5 --trials 10000 --seed 42

Full decision matrix (Option 1 vs Option 2 vs Live baseline, players 2-6):
    python archmage_deck_sim.py compare --trials 10000 --seed 42 \
        --csv results/matrix_base.csv

Tunable sweeps are just compare with overrides:
    python archmage_deck_sim.py compare --tier4-counters 3 --csv results/matrix_t4p3.csv
    python archmage_deck_sim.py compare --wilds56 6 --csv results/matrix_w6.csv

Exact closed-form check of the opening-hand conjuration metric:
    python archmage_deck_sim.py exact-check --energies 5 --ranks 15 --wilds 4

All randomness flows through one seeded RNG: identical seed => identical output.
"""

from __future__ import annotations

import argparse
import csv
import math
import os
import random
import sys
from dataclasses import dataclass, field

WILD = -1  # energy id of a wild card; wild cards have value 0


# --------------------------------------------------------------------------- #
# Configuration objects                                                        #
# --------------------------------------------------------------------------- #

@dataclass
class DeckConfig:
    """Deck composition. energies x ranks natural cards + wilds."""
    energies: int
    ranks: int
    wilds: int

    def build(self) -> list[tuple[int, int]]:
        deck = [(e, v) for e in range(self.energies) for v in range(1, self.ranks + 1)]
        deck.extend([(WILD, 0)] * self.wilds)
        return deck

    @property
    def size(self) -> int:
        return self.energies * self.ranks + self.wilds

    def label(self) -> str:
        return f"{self.energies}E x 1-{self.ranks} + {self.wilds}W ({self.size})"


@dataclass
class Rules:
    """Everything that is a rule/tunable rather than deck composition."""
    hand_size: int = 7
    array_size: int = 5
    start_counters: int = 1
    tier3_counters: int = 1      # counters a 3-card enchantment is worth (total)
    tier4_counters: int = 2      # counters a 4-card enchantment is worth (total) — tunable 2 or 3
    tier5_counters: int = 0      # counters a 5-card enchantment is worth (total) when uc_enabled=False
    uc_enabled: bool = True      # canon: 5-card = Unlimited Capacity. vnext: False => tier5_counters instead
    uc_drought_cap: int | None = None  # cap on UC learning actions per Drought turn (None = uncapped)
    conj_big_at: int = 6         # conjuration size at which the cast draws +2 instead of +1
    max_rounds: int = 400        # safety valve


# --------------------------------------------------------------------------- #
# Player state                                                                 #
# --------------------------------------------------------------------------- #

class Player:
    __slots__ = (
        "hand_vals", "hand_energy", "wilds",
        "ench", "conj", "counters", "uc",
        "draws", "uc_draws", "open3", "ever3", "conj_learned", "max_tier",
    )

    def __init__(self, rules: Rules):
        # hand_vals: value -> set of natural energies held at that value
        # (deck has exactly one copy of each (energy, value), so a set is exact)
        self.hand_vals: dict[int, set[int]] = {}
        self.hand_energy: dict[int, int] = {}
        self.wilds = 0
        self.ench: list[dict] = []   # {"value": v, "energies": set[int], "wild_used": int}
        self.conj: list[dict] = []   # {"energy": e, "n": int}
        self.counters = rules.start_counters
        self.uc = False
        # per-player stats
        self.draws = 0               # cards added to hand after the initial deal
        self.uc_draws: int | None = None
        self.open3 = False           # 3+ of one energy in the opening 7
        self.ever3 = False           # ever held 3+ of one energy in hand
        self.conj_learned = False
        self.max_tier = 0            # largest enchantment achieved (3, 4, 5)

    # ---- hand maintenance ----
    def add_card(self, card: tuple[int, int], count_draw: bool = True):
        e, v = card
        if count_draw:
            self.draws += 1
        if e == WILD:
            self.wilds += 1
            return
        self.hand_vals.setdefault(v, set()).add(e)
        n = self.hand_energy.get(e, 0) + 1
        self.hand_energy[e] = n
        if n >= 3:
            self.ever3 = True

    def remove_card(self, e: int, v: int):
        s = self.hand_vals[v]
        s.discard(e)
        if not s:
            del self.hand_vals[v]
        self.hand_energy[e] -= 1

    def hand_cards(self):
        for v, es in self.hand_vals.items():
            for e in es:
                yield (e, v)

    # ---- derived views used by the strategy ----
    def ench_values(self) -> set[int]:
        return {en["value"] for en in self.ench}

    def reserved_values(self) -> set[int]:
        """Values the player is 'saving' for enchantments: any value with 2+
        distinct energies in hand, plus values of enchantments in the book."""
        r = {v for v, es in self.hand_vals.items() if len(es) >= 2}
        r |= self.ench_values()
        return r

    def free_energy_cards(self, e: int) -> list[int]:
        """Values of energy-e cards in hand not reserved for enchantment work."""
        reserved = self.reserved_values()
        return [v for v, es in self.hand_vals.items() if e in es and v not in reserved]


# --------------------------------------------------------------------------- #
# One simulated game                                                           #
# --------------------------------------------------------------------------- #

class Game:
    def __init__(self, deck_cfg: DeckConfig, n_players: int, rules: Rules,
                 rng: random.Random):
        self.cfg = deck_cfg
        self.rules = rules
        self.rng = rng
        self.n = n_players
        self.players = [Player(rules) for _ in range(n_players)]

        deck = deck_cfg.build()
        rng.shuffle(deck)
        self.source = deck                      # draw = pop() from end
        self.array: list[tuple[int, int]] = []
        self.reserve: list[tuple[int, int]] = []
        self.released: list[tuple[int, int]] = []
        self.drought = False
        self.game_over = False
        self.pre_drought_turns = 0
        self.total_turns = 0

    # ---- deck plumbing ----
    def _take_from_source(self) -> tuple[int, int] | None:
        """Pop a card from the Source; trigger Drought the instant it empties."""
        if not self.source:
            # shouldn't happen (drought triggers on emptying), safety only
            self._trigger_drought()
            return None
        c = self.source.pop()
        if not self.source:
            self._trigger_drought()
        return c

    def _trigger_drought(self):
        if self.drought:
            return
        self.drought = True
        self.released = self.array + self.reserve
        self.rng.shuffle(self.released)
        self.array = []
        self.reserve = []

    # ---- strategy: value of a known card to a player ----
    def _card_score(self, p: Player, card: tuple[int, int]) -> int:
        e, v = card
        if e == WILD:
            return 100
        # fills an empower slot on a book enchantment
        for en in p.ench:
            if en["value"] == v and e not in en["energies"] \
                    and len(en["energies"]) < self.cfg.energies:
                return 90
        es = p.hand_vals.get(v, set())
        if e not in es:
            k = len(es)
            if k >= 2:
                return 60   # completes / extends a matched set in hand
            if k == 1:
                return 25   # starts a pair
        # conjuration material
        for cj in p.conj:
            if cj["energy"] == e and cj["n"] < self.rules.conj_big_at:
                return 35
        if p.hand_energy.get(e, 0) >= 2:
            return 20
        return 0

    # ---- phases ----
    def _collection(self, p: Player):
        if self.drought:
            if not self.released:
                self.game_over = True
                return
            p.add_card(self.released.pop())
            if not self.released:
                # last card drawn: player finishes this turn, then the game ends
                self.game_over = True
            return

        # normal play: Array pick (if clearly useful) else blind Source draw
        best_i, best_s = -1, 0
        for i, c in enumerate(self.array):
            s = self._card_score(p, c)
            if s > best_s:
                best_i, best_s = i, s
        if best_i >= 0 and best_s >= 50:
            p.add_card(self.array.pop(best_i))
            repl = self._take_from_source()
            if repl is not None and not self.drought:
                self.array.append(repl)
            elif repl is not None:
                # replacement drained the Source: card joins the merged pool
                self.released.append(repl)
                self.rng.shuffle(self.released)
        else:
            c = self._take_from_source()
            if c is not None:
                p.add_card(c)

    def _casting(self, p: Player):
        if self.drought or not p.conj:
            return
        casts = len(p.conj) if p.uc else min(p.counters, len(p.conj))
        for cj in sorted(p.conj, key=lambda d: -d["n"])[:casts]:
            bonus = 2 if cj["n"] >= self.rules.conj_big_at else 1
            for _ in range(bonus):
                c = self._take_from_source()
                if c is not None:
                    p.add_card(c)
                if self.drought:
                    return

    # ---- learning actions (each returns True if an action was taken) ----
    def _grant_tier(self, p: Player, new_size: int, old_size: int):
        r = self.rules
        totals = {3: r.tier3_counters, 4: r.tier4_counters, 5: r.tier5_counters}
        gain = totals.get(new_size, 0) - totals.get(old_size, 0)
        if gain > 0:
            p.counters += gain
        if new_size >= 5 and r.uc_enabled:
            p.uc = True
            if p.uc_draws is None:
                p.uc_draws = p.draws
        if new_size > p.max_tier:
            p.max_tier = new_size

    def _try_empower_ench(self, p: Player) -> bool:
        e_max = self.cfg.energies
        # natural card first, on the enchantment closest to the next tier
        for en in sorted(p.ench, key=lambda d: -(len(d["energies"]) + d["wild_used"])):
            size = len(en["energies"]) + en["wild_used"]
            if size >= e_max:
                continue
            avail = p.hand_vals.get(en["value"], set()) - en["energies"]
            if avail:
                e = avail.pop()
                p.remove_card(e, en["value"])
                en["energies"].add(e)
                self._grant_tier(p, size + 1, size)
                return True
        # a wild fills the 4th or 5th slot when no natural card can
        if p.wilds:
            for en in sorted(p.ench, key=lambda d: -(len(d["energies"]) + d["wild_used"])):
                size = len(en["energies"]) + en["wild_used"]
                if size >= e_max or size + 1 < 4:
                    continue
                p.wilds -= 1
                en["wild_used"] += 1
                self._grant_tier(p, size + 1, size)
                return True
        return False

    def _try_learn_ench(self, p: Player) -> bool:
        best_v, best_es = None, None
        for v, es in p.hand_vals.items():
            if len(es) >= 3 and (best_es is None or len(es) > len(best_es)):
                best_v, best_es = v, es
        if best_v is None and self.drought and p.wilds:
            # endgame push: 2 naturals + a wild may still form a triple
            for v, es in p.hand_vals.items():
                if len(es) == 2:
                    best_v, best_es = v, es
                    break
            if best_v is None:
                return False
            use = set(best_es)
            for e in use:
                p.remove_card(e, best_v)
            p.wilds -= 1
            p.ench.append({"value": best_v, "energies": use, "wild_used": 1})
            self._grant_tier(p, 3, 0)
            return True
        if best_v is None:
            return False
        use = set(list(best_es)[: self.cfg.energies])
        for e in use:
            p.remove_card(e, best_v)
        p.ench.append({"value": best_v, "energies": use, "wild_used": 0})
        self._grant_tier(p, len(use), 0)
        return True

    def _try_learn_conj(self, p: Player) -> bool:
        for e, cnt in p.hand_energy.items():
            if cnt < 3:
                continue
            free = p.free_energy_cards(e)
            if len(free) >= 3:
                for v in free:
                    p.remove_card(e, v)
                # "vals" retains the natural card values banked in this conjuration.
                # Additive only (nothing in the rig reads it); it lets end-game
                # analysis reconstruct the exact card pool. See scoring_ev.py.
                p.conj.append({"energy": e, "n": len(free), "vals": list(free)})
                p.conj_learned = True
                return True
        return False

    def _try_empower_conj(self, p: Player) -> bool:
        big = self.rules.conj_big_at
        for cj in p.conj:
            if cj["n"] >= big:
                continue
            free = p.free_energy_cards(cj["energy"])
            if free and cj["n"] + len(free) >= big:
                for v in free:
                    p.remove_card(cj["energy"], v)
                cj["n"] += len(free)
                cj.setdefault("vals", []).extend(free)  # keep exact banked values
                return True
        return False

    def _learning(self, p: Player):
        if p.uc:
            actions = self.rules.uc_drought_cap if (self.drought and self.rules.uc_drought_cap) else 10 ** 6
        else:
            actions = p.counters
        guard = 0
        while actions > 0 and guard < 100:
            guard += 1
            did = (self._try_empower_ench(p)
                   or self._try_learn_ench(p)
                   or (not self.drought and self._try_learn_conj(p))
                   or (not self.drought and self._try_empower_conj(p)))
            if not did:
                break
            actions -= 1

    # ---- full game ----
    def play(self):
        r = self.rules
        # deal
        for p in self.players:
            for _ in range(r.hand_size):
                p.add_card(self.source.pop(), count_draw=False)
            p.open3 = any(c >= 3 for c in p.hand_energy.values())
        # array
        self.array = [self.source.pop() for _ in range(r.array_size)]
        # binding: each player discards their least useful card to the Reserve
        for p in self.players:
            worst, worst_s = None, 10 ** 9
            for card in p.hand_cards():
                s = self._card_score(p, card)
                if s < worst_s:
                    worst, worst_s = card, s
            if worst is not None:
                p.remove_card(*worst)
                self.reserve.append(worst)

        for _ in range(r.max_rounds):
            for p in self.players:
                if self.drought and not self.released and not self.game_over:
                    self.game_over = True
                if self.game_over:
                    return
                started_pre_drought = not self.drought
                self._collection(p)
                if started_pre_drought:
                    self.pre_drought_turns += 1
                self.total_turns += 1
                if not self.drought:
                    self._casting(p)
                self._learning(p)
        self.game_over = True  # safety valve


# --------------------------------------------------------------------------- #
# Monte Carlo driver + statistics                                              #
# --------------------------------------------------------------------------- #

def _prop_ci(k: int, n: int) -> tuple[float, float, float]:
    """Proportion with 95% normal-approx CI."""
    if n == 0:
        return 0.0, 0.0, 0.0
    p = k / n
    se = math.sqrt(max(p * (1 - p), 1e-12) / n)
    return p, max(0.0, p - 1.96 * se), min(1.0, p + 1.96 * se)


def _mean_ci(xs: list[float]) -> tuple[float, float, float]:
    if not xs:
        return float("nan"), float("nan"), float("nan")
    m = sum(xs) / len(xs)
    if len(xs) < 2:
        return m, m, m
    sd = math.sqrt(sum((x - m) ** 2 for x in xs) / (len(xs) - 1))
    h = 1.96 * sd / math.sqrt(len(xs))
    return m, m - h, m + h


def simulate(deck_cfg: DeckConfig, n_players: int, rules: Rules,
             trials: int, seed: int) -> dict:
    rng = random.Random(seed)
    n_games = 0
    uc_games = 0
    uc_players = 0
    t3 = t4 = t5 = 0
    open3 = ever3 = conj = 0
    uc_draw_list: list[float] = []
    pace_list: list[float] = []
    draws_list: list[float] = []

    for _ in range(trials):
        g = Game(deck_cfg, n_players, rules, rng)
        g.play()
        n_games += 1
        any_uc = False
        for p in g.players:
            if p.uc:
                uc_players += 1
                any_uc = True
                if p.uc_draws is not None:
                    uc_draw_list.append(p.uc_draws)
            if p.max_tier >= 3:
                t3 += 1
            if p.max_tier >= 4:
                t4 += 1
            if p.max_tier >= 5:
                t5 += 1
            if p.open3:
                open3 += 1
            if p.ever3:
                ever3 += 1
            if p.conj_learned:
                conj += 1
            draws_list.append(p.draws)
        if any_uc:
            uc_games += 1
        pace_list.append(g.pre_drought_turns / n_players)

    np_total = n_games * n_players
    out = {
        "trials": n_games,
        "players": n_players,
        "deck": deck_cfg.label(),
        "energies": deck_cfg.energies,
        "ranks": deck_cfg.ranks,
        "wilds": deck_cfg.wilds,
        "tier4_counters": rules.tier4_counters,
        "seed": seed,
    }
    for name, (k, n) in {
        "uc_game": (uc_games, n_games),
        "uc_player": (uc_players, np_total),
        "t3plus_player": (t3, np_total),
        "t4plus_player": (t4, np_total),
        "t5_player": (t5, np_total),
        "open3_player": (open3, np_total),
        "ever3_player": (ever3, np_total),
        "conj_player": (conj, np_total),
    }.items():
        p_, lo, hi = _prop_ci(k, n)
        out[name], out[name + "_lo"], out[name + "_hi"] = p_, lo, hi
    for name, xs in {
        "uc_draws": uc_draw_list,
        "pace_predrought": pace_list,
        "draws_per_player": draws_list,
    }.items():
        m, lo, hi = _mean_ci(xs)
        out[name], out[name + "_lo"], out[name + "_hi"] = m, lo, hi
    return out


# --------------------------------------------------------------------------- #
# Exact closed-form check: opening-hand conjuration probability                #
# --------------------------------------------------------------------------- #

def exact_open3(deck: DeckConfig, hand_size: int) -> float:
    """P(some energy has >= 3 natural cards among the opening hand).
    Multivariate hypergeometric via generating polynomials."""
    E, R, W = deck.energies, deck.ranks, deck.wilds
    # coeff[k] = #ways to pick k natural cards with every energy count <= 2
    poly = [1]
    unit = [math.comb(R, i) for i in range(3)]  # counts 0,1,2 per energy
    for _ in range(E):
        new = [0] * (len(poly) + 2)
        for a, ca in enumerate(poly):
            for b, cb in enumerate(unit):
                new[a + b] += ca * cb
        poly = new
    total = math.comb(deck.size, hand_size)
    ok = 0
    for w in range(0, min(W, hand_size) + 1):
        k = hand_size - w
        if k < len(poly):
            ok += math.comb(W, w) * poly[k]
    return 1 - ok / total


# --------------------------------------------------------------------------- #
# Decision matrix                                                              #
# --------------------------------------------------------------------------- #

def decision_matrix(wilds56_opt1: int = 4, wilds56_opt2: int = 4):
    """(label, players, DeckConfig) rows for the Option 1 / Option 2 / Live grid."""
    rows = []
    for p in (2, 3, 4):
        rows.append(("Option1", p, DeckConfig(5, 12, 2)))
    for p in (5, 6):
        rows.append(("Option1", p, DeckConfig(5, 16, wilds56_opt1)))
    for p in (2, 3, 4):
        rows.append(("Option2", p, DeckConfig(4, 15, 2)))
    for p in (5, 6):
        rows.append(("Option2", p, DeckConfig(5, 15, wilds56_opt2)))
    # Live baseline: current rulebook decks (v2.8)
    for p in (2, 3, 4):
        rows.append(("Live", p, DeckConfig(4, 15, 2)))
    for p in (5, 6):
        rows.append(("Live", p, DeckConfig(4, 20, 4)))
    return rows


FIELDS_ORDER = [
    "option", "players", "deck", "energies", "ranks", "wilds", "tier4_counters",
    "trials", "seed",
    "uc_game", "uc_game_lo", "uc_game_hi",
    "uc_player", "uc_player_lo", "uc_player_hi",
    "uc_draws", "uc_draws_lo", "uc_draws_hi",
    "t3plus_player", "t3plus_player_lo", "t3plus_player_hi",
    "t4plus_player", "t4plus_player_lo", "t4plus_player_hi",
    "t5_player", "t5_player_lo", "t5_player_hi",
    "open3_player", "open3_player_lo", "open3_player_hi",
    "ever3_player", "ever3_player_lo", "ever3_player_hi",
    "conj_player", "conj_player_lo", "conj_player_hi",
    "pace_predrought", "pace_predrought_lo", "pace_predrought_hi",
    "draws_per_player", "draws_per_player_lo", "draws_per_player_hi",
]


def cmd_run(args):
    deck = DeckConfig(args.energies, args.ranks, args.wilds)
    rules = Rules(hand_size=args.hand_size, array_size=args.array_size,
                  tier4_counters=args.tier4_counters,
                  uc_drought_cap=args.uc_drought_cap)
    res = simulate(deck, args.players, rules, args.trials, args.seed)
    res["option"] = args.label or "custom"
    _emit([res], args.csv)


def cmd_compare(args):
    rules = Rules(tier4_counters=args.tier4_counters,
                  uc_drought_cap=args.uc_drought_cap)
    rows = list(enumerate(decision_matrix(args.wilds56, args.wilds56)))
    if args.rows:
        a, b = (int(x) if x else None for x in args.rows.split(":"))
        rows = rows[a:b]
    results = []
    for i, (label, players, deck) in rows:
        # seed derived from the row's absolute index: --rows never changes results
        res = simulate(deck, players, rules, args.trials, args.seed * 1000 + i)
        res["option"] = label
        results.append(res)
        print(f"done: {label} p={players} {deck.label()}", flush=True)
    _emit(results, args.csv, append=args.append)


def cmd_exact_check(args):
    deck = DeckConfig(args.energies, args.ranks, args.wilds)
    p = exact_open3(deck, args.hand_size)
    print(f"exact P(opening hand of {args.hand_size} holds 3+ of one energy) "
          f"for {deck.label()}: {p:.4f}")


def _emit(results: list[dict], csv_path: str | None, append: bool = False):
    if csv_path:
        os.makedirs(os.path.dirname(csv_path) or ".", exist_ok=True)
        mode = "a" if append and os.path.exists(csv_path) else "w"
        with open(csv_path, mode, newline="") as f:
            w = csv.DictWriter(f, fieldnames=FIELDS_ORDER, extrasaction="ignore")
            if mode == "w":
                w.writeheader()
            for r in results:
                w.writerow(r)
        print(f"wrote {csv_path}")
    hdr = f"{'option':8} {'p':>2} {'deck':24} {'UCgame%':>8} {'UCplr%':>7} " \
          f"{'T3+%':>6} {'T4+%':>6} {'T5%':>6} {'open3%':>7} {'conj%':>6} {'pace':>6}"
    print(hdr)
    for r in results:
        print(f"{r['option']:8} {r['players']:>2} {r['deck']:24} "
              f"{100*r['uc_game']:>7.1f}% {100*r['uc_player']:>6.1f}% "
              f"{100*r['t3plus_player']:>5.1f}% {100*r['t4plus_player']:>5.1f}% "
              f"{100*r['t5_player']:>5.1f}% {100*r['open3_player']:>6.1f}% "
              f"{100*r['conj_player']:>5.1f}% {r['pace_predrought']:>6.1f}")


def main():
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)

    def common(p):
        p.add_argument("--trials", type=int, default=10000)
        p.add_argument("--seed", type=int, default=42)
        p.add_argument("--tier4-counters", type=int, default=2,
                       help="total counters a 4-card enchantment grants (2 or 3)")
        p.add_argument("--uc-drought-cap", type=int, default=None,
                       help="cap UC learning actions per Drought turn (default uncapped)")
        p.add_argument("--csv", type=str, default=None)

    pr = sub.add_parser("run", help="simulate one deck/player configuration")
    pr.add_argument("--energies", type=int, required=True)
    pr.add_argument("--ranks", type=int, required=True)
    pr.add_argument("--wilds", type=int, required=True)
    pr.add_argument("--players", type=int, required=True)
    pr.add_argument("--hand-size", type=int, default=7)
    pr.add_argument("--array-size", type=int, default=5)
    pr.add_argument("--label", type=str, default=None)
    common(pr)
    pr.set_defaults(func=cmd_run)

    pc = sub.add_parser("compare", help="run the full Option1/Option2/Live matrix")
    pc.add_argument("--wilds56", type=int, default=4,
                    help="wild count in the 5-6 player decks (4 or 6)")
    pc.add_argument("--rows", type=str, default=None,
                    help="slice of matrix rows to run, e.g. 0:5 (seeds stay stable)")
    pc.add_argument("--append", action="store_true",
                    help="append to --csv instead of overwriting")
    common(pc)
    pc.set_defaults(func=cmd_compare)

    pe = sub.add_parser("exact-check", help="closed-form opening-hand check")
    pe.add_argument("--energies", type=int, required=True)
    pe.add_argument("--ranks", type=int, required=True)
    pe.add_argument("--wilds", type=int, required=True)
    pe.add_argument("--hand-size", type=int, default=7)
    pe.set_defaults(func=cmd_exact_check)

    args = ap.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()
