#!/usr/bin/env python3
"""
Archmage Ascension — Solo mode Stage 1 sim: The Attuned Rival (v0.1)
=====================================================================

Scratch Monte Carlo for the solo-mode test plan, Stage 1
(`expansion/solo-attuned-rival/Solo Mode - The Attuned Rival (v0.1).md`, section 14).
Rules: rulebook v3.2 (score table, flexible wilds, Source-emptying timing) plus the
Rival's Flip / Tithe / Burn, Ravening, solo Drought and max-of-two-readings scoring.
See SOLO_RIVAL_STAGE1.md next to this file for assumptions, results and what the sim
does NOT model.

Usage
-----
Full Stage 1 report (markdown tables to stdout):
    python solo_rival_sim.py report --trials 4000 --seed 20261113

One configuration:
    python solo_rival_sim.py run --profile normal --adjacency 2 --trials 2000

All randomness for a configuration flows through one random.Random(seed + index):
identical seed => identical output. Standard library only.
"""

from __future__ import annotations

import argparse
import random
import statistics
import sys
import time
from collections import Counter, defaultdict
from dataclasses import dataclass, replace

WILD = -1                    # energy id of a wild; wilds carry rank 0
ENERGIES = ("Radiance", "Void", "Flux", "Aether")   # also the Tithe tiebreak order
RIVAL_E = 1                  # Rival attuned to Void (default; suits are symmetric)
E_CAP = 4                    # Enchantment max size at 2-4p (v3.2)

# v3.2 Recognition Points table (rulebook/Scoring System Reference.md)
TABLE = {
    "C": {3: 0, 4: 1, 5: 2, 6: 3, 7: 7, 8: 13, 9: 20, 10: 29, 11: 38, 12: 50, 13: 63, 14: 79, 15: 100},
    "T": {3: 3, 4: 4, 5: 5, 6: 7, 7: 8, 8: 10, 9: 13, 10: 16, 11: 20, 12: 25, 13: 31, 14: 38, 15: 48},
    "P": {3: 5, 4: 11, 5: 18, 6: 24, 7: 31, 8: 39, 9: 47, 10: 56, 11: 65, 12: 74, 13: 85, 14: 97, 15: 100},
    "E": {3: 4, 4: 10},
}
E_CAPACITY = {3: 1, 4: 3}    # counters an Enchantment grants (cumulative), 2-4p
PRIO = {"P": 3, "E": 2, "T": 1, "C": 0}   # "largest spell" tie order: PT > E > T > C


def pts(kind: str, n: int) -> int:
    # shortcut: sizes above 15 (a 16-17 card Conjuration with wilds) clamp to the 15 row;
    # the table has no row for them. Revisit only if such books show up in play.
    if n < 3:
        return 0
    return TABLE[kind][min(n, max(TABLE[kind]))]


def runs_of(sorted_distinct: list[int]) -> list[list[int]]:
    runs: list[list[int]] = []
    for r in sorted_distinct:
        if runs and r == runs[-1][-1] + 1:
            runs[-1].append(r)
        else:
            runs.append([r])
    return runs


def rival_score(row: list[int]) -> tuple[int, int, int, int]:
    """Return (score as written = max(a, b), reading a, reading b, best legal partition).

    a = whole row as one Conjuration; b = every maximal run of 3+ as a PT, the rest as one
    Conjuration if 3+ remain. 'best' also tries every subset of runs as PTs (still a legal
    one-energy Spellbook) to show whether the two-reading rule leaves points on the table.
    Duplicate ranks (a wild declared onto a rank that later arrives naturally) cannot sit
    in the same run, so they fall to the Conjuration remainder.
    """
    n = len(row)
    a = pts("C", n)
    runs = [len(x) for x in runs_of(sorted(set(row))) if len(x) >= 3]
    used = sum(runs)
    b = sum(pts("P", l) for l in runs) + pts("C", n - used)
    best = max(a, b)
    for mask in range(1 << len(runs)):
        u = s = 0
        for i, l in enumerate(runs):
            if mask >> i & 1:
                u += l
                s += pts("P", l)
        best = max(best, s + pts("C", n - u))
    return max(a, b), a, b, best


def declare_rival_wild(row: list[int]) -> tuple[int, bool]:
    """Section 7 wild rule. Returns (declared rank, used_a_fallback_not_in_the_rules)."""
    s = set(row)
    if not s:
        return 8, True                      # rules gap: empty row (Archmage binding flip)
    for g in range(2, 15):                  # lowest gap whose filling joins two runs
        if g not in s and g - 1 in s and g + 1 in s:
            return g, False
    runs = runs_of(sorted(s))
    longest = max(runs, key=lambda r: (len(r), -r[0]))   # tie: lower run (rules silent)
    if longest[-1] < 15:
        return longest[-1] + 1, False
    if longest[0] > 1:
        return longest[0] - 1, True         # rules gap: longest run already ends at 15
    return 15, True                         # row is 1-15 complete; duplicate rank


# --------------------------------------------------------------------------- #
# Configuration                                                                #
# --------------------------------------------------------------------------- #

@dataclass(frozen=True)
class Config:
    adjacency: int = 1           # keep-test width: kept if within N of any row card
    profile: str = "normal"      # m1..m4 (metronome: burn N Source/turn, no book) | slow | normal | fast
    difficulty: str = "adept"    # adept | archmage (Apprentice = adept score x0.75, applied in reporting)
    tithe_mode: str = "full"     # full | no_p2 (priority 2 never fires = perfect decoy bound) | none
                                 # | any (candidate fix: priority 2 hunts extensions of ANY spell)
    policy: str = "honest"       # honest | decoy (keep a capped 4-card Enchantment as largest spell)
    ench_extend: str = "match"   # match: any card of the Enchantment's rank qualifies (literal text)
                                 # open: only if the Enchantment is below its size cap
    drought_stack: str = "remove"  # remove (as written) | sweep: at the Drought the Rival flips its
                                   # remaining Stack through the keep test (candidate fix, not in v0.1)
    hoard: bool = False          # optional lever (section 8): tithed cards never return, +1 each

    def label(self) -> str:
        bits = [f"±{self.adjacency}", self.profile]
        if self.difficulty != "adept":
            bits.append(self.difficulty)
        if self.tithe_mode != "full":
            bits.append(f"tithe={self.tithe_mode}")
        if self.policy != "honest":
            bits.append(self.policy)
        if self.ench_extend != "match":
            bits.append(f"ench={self.ench_extend}")
        if self.drought_stack != "remove":
            bits.append(f"stack={self.drought_stack}")
        if self.hoard:
            bits.append("hoard")
        return " ".join(bits)


# --------------------------------------------------------------------------- #
# Player proxy                                                                 #
# --------------------------------------------------------------------------- #

class Spell:
    __slots__ = ("kind", "cards", "energy", "rank", "lo", "hi", "order")

    def __init__(self, kind, cards, order, energy=None, rank=None, lo=None, hi=None):
        self.kind, self.cards, self.order = kind, list(cards), order
        self.energy, self.rank, self.lo, self.hi = energy, rank, lo, hi

    @property
    def size(self) -> int:
        return len(self.cards)

    def score(self) -> int:
        return pts(self.kind, self.size)


class Player:
    """Greedy one-step player. Not a strong player: a consistent proxy for pacing and
    Array interaction. See SOLO_RIVAL_STAGE1.md, 'Player proxy'."""

    def __init__(self, profile: str, policy: str):
        self.profile, self.policy = profile, policy
        self.hand: list[tuple[int, int]] = []
        self.book: list[Spell] = []
        self.counters = 1
        self._order = 0

    # ---- book state ----
    def capacity(self) -> int:
        return 1 + sum(E_CAPACITY.get(s.size, 0) for s in self.book if s.kind == "E")

    def score(self) -> int:
        return sum(s.score() for s in self.book)

    def largest_spell(self) -> Spell | None:
        if not self.book:
            return None
        # rules silent on a tie of same size and type: earliest learned
        return max(self.book, key=lambda s: (s.size, PRIO[s.kind], -s.order))

    def _new(self, kind, cards, **kw) -> Spell:
        self._order += 1
        sp = Spell(kind, cards, self._order, **kw)
        self.book.append(sp)
        return sp

    def _take(self, cards):
        for c in cards:
            self.hand.remove(c)

    # ---- card evaluation (Collection, Transfiguration exchange, Tithe denial stat) ----
    def card_value(self, card, hand=None) -> float:
        hand = self.hand if hand is None else hand
        if card[0] == WILD:
            return 6.0
        e, r = card
        best = 0.0
        for s in self.book:
            if s.kind == "E" and s.rank == r and s.size < E_CAP:
                best = max(best, 9.0)
            elif s.kind == "P" and s.energy == e and r in (s.lo - 1, s.hi + 1):
                best = max(best, pts("P", s.size + 1) - s.score())
            elif s.kind == "T" and r in (s.lo - 1, s.hi + 1):
                best = max(best, pts("T", s.size + 1) - s.score())
            elif s.kind == "C" and s.energy == e:
                best = max(best, pts("C", s.size + 1) - s.score() + 0.5)
        nat = [c for c in hand if c[0] != WILD]
        same_rank = sum(1 for c in nat if c[1] == r)
        if same_rank >= 2:
            best = max(best, 7.0)
        elif same_rank == 1:
            best = max(best, 1.5)
        es = {c for c in nat if c[0] == e}
        lo = r
        while (e, lo - 1) in es:
            lo -= 1
        hi = r
        while (e, hi + 1) in es:
            hi += 1
        L = hi - lo + 1
        if L >= 3:
            best = max(best, pts("P", L) - (pts("P", L - 1) if L - 1 >= 3 else 0))
        elif L == 2:
            best = max(best, 2.0)
        ranks = {c[1] for c in nat}
        lo = r
        while lo - 1 in ranks:
            lo -= 1
        hi = r
        while hi + 1 in ranks:
            hi += 1
        if hi - lo + 1 >= 3:
            best = max(best, 2.5)
        if len(es) >= 2:
            best = max(best, 0.5)
        return best

    def _protected(self, nat) -> set:
        """Cards held back from Conjuration/Transfiguration fodder (pre-Drought)."""
        ranks = Counter(c[1] for c in nat)
        es = set(nat)
        prot = {c for c in nat if ranks[c[1]] >= 2 or (c[0], c[1] - 1) in es or (c[0], c[1] + 1) in es}
        for s in self.book:
            if s.kind == "E" and s.size < E_CAP:
                prot |= {c for c in nat if c[1] == s.rank}
        return prot

    def _decoy_blocks(self, drought: bool, kind: str, new_size: int, target: Spell | None = None) -> bool:
        """Decoy line: before the Drought keep a (capped) Enchantment as the largest spell,
        so Tithe priority 2 has nothing to hunt; grow everything once the Tithe stops."""
        if self.policy != "decoy" or drought or kind == "E":
            return False
        max_e = max((s.size for s in self.book if s.kind == "E"), default=0)
        if max_e < 3:
            return new_size > 3
        return new_size > (max_e - 1 if kind == "P" else max_e)

    # ---- learning ----
    def best_action(self, drought: bool):
        capw = 0.5 if drought else 3.0           # value of +1 counter
        wpen = 0.0 if drought else 2.0           # cost of spending a hoarded wild
        engine = 0.0 if drought else {"slow": 0.0, "normal": 1.5, "fast": 4.0}[self.profile]
        nat = [c for c in self.hand if c[0] != WILD]
        wilds = [c for c in self.hand if c[0] == WILD]
        nw = len(wilds)
        by_rank, by_e = defaultdict(list), defaultdict(list)
        for c in nat:
            by_rank[c[1]].append(c)
            by_e[c[0]].append(c)
        prot = set() if drought else self._protected(nat)
        best = [0.0, None]

        def offer(gain, fn, kind, size):
            if gain > best[0] and not self._decoy_blocks(drought, kind, size):
                best[0], best[1] = gain, fn

        # Enchantments: empower, then learn
        for s in self.book:
            if s.kind == "E" and s.size < E_CAP:
                add = by_rank[s.rank][:E_CAP - s.size]
                if not add and nw:
                    add = wilds[:1]
                if add:
                    new = s.size + len(add)
                    g = (pts("E", new) - s.score() + capw * (E_CAPACITY[new] - E_CAPACITY[s.size])
                         - wpen * sum(1 for c in add if c[0] == WILD))
                    offer(g, lambda s=s, add=add: self._grow(s, add), "E", new)
        for r, cs in list(by_rank.items()):
            for use_w in range(0, min(nw, 2) + 1):
                cards = cs[:E_CAP - use_w] + wilds[:use_w]
                if 3 <= len(cards) <= E_CAP and (use_w == 0 or len(cs) + use_w <= E_CAP):
                    g = pts("E", len(cards)) + capw * E_CAPACITY[len(cards)] - wpen * use_w
                    offer(g, lambda r=r, cards=cards: (self._take(cards), self._new("E", cards, rank=r)), "E", len(cards))

        # Perfect Transmutation from hand (optional single wild extends or bridges)
        for e, cs in by_e.items():
            rk = {c[1] for c in cs}
            runs = runs_of(sorted(rk))
            for run in runs:
                if len(run) >= 3:
                    cards = [(e, r) for r in run]
                    offer(pts("P", len(run)),
                          lambda e=e, run=run, cards=cards: (self._take(cards), self._new("P", cards, energy=e, lo=run[0], hi=run[-1])),
                          "P", len(run))
                if nw and len(run) >= 2:
                    lo, hi = (run[0], run[-1] + 1) if run[-1] < 15 else (run[0] - 1, run[-1])
                    cards = [(e, r) for r in run] + wilds[:1]
                    offer(pts("P", len(cards)) - wpen,
                          lambda e=e, lo=lo, hi=hi, cards=cards: (self._take(cards), self._new("P", cards, energy=e, lo=lo, hi=hi)),
                          "P", len(cards))
            if nw:
                for a, b in zip(runs, runs[1:]):
                    if b[0] - a[-1] == 2:
                        cards = [(e, r) for r in a + b] + wilds[:1]
                        offer(pts("P", len(cards)) - wpen,
                              lambda e=e, lo=a[0], hi=b[-1], cards=cards: (self._take(cards), self._new("P", cards, energy=e, lo=lo, hi=hi)),
                              "P", len(cards))

        # Transfiguration from hand (one card per rank, unprotected cards preferred)
        for run in runs_of(sorted(r for r, cs in by_rank.items() if cs)):
            if len(run) >= 3:
                cards = []
                for r in run:
                    opts = sorted(by_rank[r], key=lambda c: (c in prot, len(by_e[c[0]])))
                    cards.append(opts[0])
                g = pts("T", len(run)) - 0.75 * sum(1 for c in cards if c in prot)
                offer(g, lambda run=run, cards=cards: (self._take(cards), self._new("T", cards, lo=run[0], hi=run[-1])),
                      "T", len(run))

        # Conjuration from hand
        for e, cs in by_e.items():
            cards = [c for c in cs if c not in prot] + (wilds if drought else [])
            if len(cards) >= 3:
                offer(pts("C", len(cards)) + engine,
                      lambda e=e, cards=cards: (self._take(cards), self._new("C", cards, energy=e)),
                      "C", len(cards))

        # Empower Conjuration / Perfect Transmutation / Transfiguration
        for s in self.book:
            if s.kind == "C":
                add = [c for c in by_e[s.energy] if c not in prot] + (wilds if drought else [])
                if add:
                    new = s.size + len(add)
                    g = pts("C", new) - s.score() + (engine if s.size < 6 <= new else 0)
                    offer(g, lambda s=s, add=add: self._grow(s, add), "C", new)
            elif s.kind in "PT":
                add, lo, hi = [], s.lo, s.hi
                pool = set(by_e[s.energy]) if s.kind == "P" else None
                used = set()
                w_left = nw if drought else 0
                while True:
                    step = None
                    for r in (lo - 1, hi + 1):
                        if not 1 <= r <= 15:
                            continue
                        if s.kind == "P":
                            c = (s.energy, r)
                            if c in pool and c not in used:
                                step = (r, c)
                                break
                        else:
                            opts = [c for c in by_rank[r] if c not in used]
                            if opts:
                                step = (r, sorted(opts, key=lambda c: c in prot)[0])
                                break
                    if step is None and w_left:
                        r = hi + 1 if hi < 15 else lo - 1
                        if 1 <= r <= 15:
                            step = (r, ("W", w_left))
                            w_left -= 1
                    if step is None:
                        break
                    r, c = step
                    used.add(c)
                    add.append(c)
                    lo, hi = min(lo, r), max(hi, r)
                if add:
                    real = [c for c in add if c[0] != "W"]
                    real += wilds[:len(add) - len(real)]
                    new = s.size + len(real)
                    g = pts(s.kind, new) - s.score()
                    offer(g, lambda s=s, real=real, lo=lo, hi=hi: (self._grow(s, real), setattr(s, "lo", lo), setattr(s, "hi", hi)),
                          s.kind, new)
        return best[1] if best[0] > 0 else None

    def _grow(self, s: Spell, cards):
        self._take(cards)
        s.cards.extend(cards)

    def learn_phase(self, drought: bool):
        for _ in range(self.counters):
            fn = self.best_action(drought)
            if fn is None:
                return
            fn()


# --------------------------------------------------------------------------- #
# Game                                                                         #
# --------------------------------------------------------------------------- #

class Game:
    def __init__(self, cfg: Config, rng: random.Random):
        self.cfg, self.rng = cfg, rng
        archmage = cfg.difficulty == "archmage"
        stack = [(RIVAL_E, r) for r in range(1, 16)] + ([(WILD, 0)] * 2 if archmage else [])
        rng.shuffle(stack)
        deck = [(e, r) for e in range(4) if e != RIVAL_E for r in range(1, 16)]
        deck += [] if archmage else [(WILD, 0)] * 2
        rng.shuffle(deck)
        self.stack = stack
        self.ravening_burns = 3 if archmage else 2
        self.metronome = int(cfg.profile[1]) if cfg.profile.startswith("m") else 0
        self.player = Player(cfg.profile if not self.metronome else "slow", cfg.policy)
        self.player.hand = [deck.pop() for _ in range(7)]
        self.array = [deck.pop() for _ in range(5)]
        self.source = deck
        self.reserve: list = []
        self.rr: list = []                 # Released Reserve
        self.row: list[int] = []
        self.drought = False
        self.over = False
        self.round = 0
        self.st = Counter()
        self.keep_by_flip: list[int] = []  # 1 = kept, 0 = rejected, by flip index
        self.reject_cards: set = set()
        # binding: player discards lowest-value card; Rival reveals its first card
        p = self.player
        if not self.metronome:
            worst = min(p.hand, key=lambda c: p.card_value(c, [x for x in p.hand if x is not c]))
        else:
            worst = p.hand[0]
        p.hand.remove(worst)
        self.reserve.append(worst)
        self._rival_take(self.stack.pop())

    # ---- Source / Drought plumbing ----
    def _check_dry(self):
        if not self.source and not self.drought:
            self.drought = True
            self.st["rounds_pre"] = self.round
            self.st["stranded"] = sum(1 for c in self.stack if c[0] != WILD)
            self.st["row_at_drought"] = len(self.row)
            self.st["rejects_left_in_array"] = sum(1 for c in self.array if c in self.reject_cards)
            if self.cfg.drought_stack == "sweep":
                for c in reversed(self.stack):
                    if c[0] == WILD or any(abs(c[1] - x) <= self.cfg.adjacency for x in self.row):
                        self._rival_take(c)
                        self.st["sweep_kept"] += 1
            self.stack = []
            self.rr = self.array + self.reserve
            self.rng.shuffle(self.rr)
            self.array, self.reserve = [], []

    def draw_source(self):
        c = self.source.pop()
        self._check_dry()
        return c

    def refill(self):
        while len(self.array) < 5 and self.source and not self.drought:
            self.array.append(self.source.pop())
            self._check_dry()

    def burn(self):
        if self.source and not self.drought:
            self.reserve.append(self.source.pop())
            self._check_dry()

    # ---- the Rival ----
    def _rival_take(self, card):
        if card[0] == WILD:
            r, fb = declare_rival_wild(self.row)
            self.st["rival_wilds"] += 1
            self.st["wild_fallback"] += fb
        else:
            r = card[1]
        if r in self.row:
            self.st["dup_rank"] += 1
        self.row.append(r)

    def rival_turn(self):
        if self.drought:
            if not self.rr:
                self.over = True
                return
            c = self.rr.pop()
            if c[0] == RIVAL_E:
                self._rival_take(c)
                self.st["drought_void"] += 1
            elif c[0] == WILD:
                self._rival_take(c)
                self.st["drought_wild"] += 1
            if not self.rr:
                self.over = True
            return
        if self.stack:
            card = self.stack.pop()
            self.st["flips"] += 1
            if card[0] == WILD:
                keep = True
            else:
                keep = len(self.row) < 3 or any(abs(card[1] - x) <= self.cfg.adjacency for x in self.row)
            if len(self.row) >= 3 and card[0] != WILD:
                self.st["tested"] += 1
                self.st["tested_kept"] += keep
            self.keep_by_flip.append(int(keep))
            if keep:
                self._rival_take(card)
                self.st["keeps"] += 1
            else:
                self.array.append(card)
                self.reject_cards.add(card)
                self.st["rejects"] += 1
        else:
            self.st["ravening"] += 1
            for _ in range(self.ravening_burns - 1):
                self.burn()
            if self.drought:
                return
        self.tithe()
        self.refill()
        if self.drought:
            return
        self.burn()

    def _extends(self, s: Spell, c) -> bool:
        e, r = c
        if s.kind == "C":
            return e == s.energy
        if s.kind in "PT":                          # literal text: rank-adjacent, any energy
            return r in (s.lo - 1, s.hi + 1)
        return r == s.rank and (self.cfg.ench_extend == "match" or s.size < E_CAP)

    def tithe(self):
        if self.cfg.tithe_mode == "none" or not self.array:
            return
        arr = self.array
        key = lambda c: (c[1], -c[0])              # highest rank; ties Radiance first
        wilds = [c for c in arr if c[0] == WILD]
        if wilds:
            pick, lvl = wilds[0], 1
        else:
            cands = []
            ls = self.player.largest_spell() if self.cfg.tithe_mode in ("full", "any") else None
            if self.cfg.tithe_mode == "any":
                # candidate fix: the card that would extend ANY of your spells, largest spell first
                for s in sorted(self.player.book, key=lambda s: (s.size, PRIO[s.kind], -s.order), reverse=True):
                    cands = [c for c in arr if self._extends(s, c)]
                    if cands:
                        break
            elif ls is not None:
                cands = [c for c in arr if self._extends(ls, c)]
            if cands:
                pick, lvl = max(cands, key=key), 2
            else:
                pick, lvl = max(arr, key=key), 3
                if ls is not None and ls.kind == "E" and ls.size >= E_CAP:
                    self.st["p2_dead_capped_E"] += 1
        if not self.metronome and self.player.card_value(pick) >= 3:
            self.st["tithe_wanted"] += 1
        if pick in self.reject_cards:
            self.st["tithe_own_reject"] += 1
        self.st[f"tithe_p{lvl}"] += 1
        arr.remove(pick)
        if self.cfg.hoard:
            self.st["hoard"] += 1
        else:
            self.reserve.append(pick)

    # ---- the player ----
    def player_turn(self):
        p = self.player
        p.counters = p.capacity()               # gains land at the start of the next turn
        if self.drought:
            if not self.rr:
                self.over = True
                return
            p.hand.append(self.rr.pop())
            if not self.metronome:
                p.learn_phase(True)
            if not self.rr:
                self.over = True
            return
        self.round += 1
        if self.metronome:
            for _ in range(self.metronome):
                if self.drought:
                    break
                p.hand.append(self.draw_source())
            return
        # Collection: best Array card if clearly useful, else blind draw
        best = max(self.array, key=p.card_value, default=None)
        if best is not None and p.card_value(best) >= 3:
            self._take_array(best)
        else:
            p.hand.append(self.draw_source())
        if not self.drought and self.cfg.profile != "slow":
            self.cast_phase()
        p.learn_phase(self.drought)

    def _take_array(self, card):
        self.array.remove(card)
        self.player.hand.append(card)
        if card in self.reject_cards:
            self.st["rejects_taken"] += 1
        self.refill()

    def _discards(self, k):
        p = self.player
        nat = [c for c in p.hand if c[0] != WILD]
        if len(nat) < k:
            return None
        nat.sort(key=lambda c: p.card_value(c, [x for x in p.hand if x is not c]))
        return nat[:k]

    def cast_phase(self):
        p = self.player
        casts = p.counters
        order = sorted(p.book, key=lambda s: (s.kind not in "CP", -s.size))
        for s in order:
            if casts == 0 or self.drought:
                return
            if s.kind == "E":
                continue
            k = 2 if s.size == 3 else 1
            if s.kind in "CP":
                draw = 2 if s.size >= 6 else 1
                need = draw + (1 if s.kind == "P" else 0)
                if len(self.source) < need:
                    continue
                if s.kind == "P" and len([c for c in p.hand if c[0] != WILD]) + draw < k:
                    continue
                for _ in range(draw):
                    p.hand.append(self.draw_source())
                casts -= 1
                if s.kind == "C":
                    continue
            else:  # Transfiguration: only when worth it (fast profile: whenever legal)
                if not self.array:
                    continue
                best = max(self.array, key=p.card_value)
                d = self._discards(k)
                if d is None:
                    continue
                junk = max(p.card_value(c, [x for x in p.hand if x is not c]) for c in d)
                if self.cfg.profile != "fast" and (p.card_value(best) < 3 or junk > 1.5):
                    continue
                casts -= 1
            # Transfiguration exchange (also the PT's mandatory second half)
            d = self._discards(k)
            if d is None or not self.array:
                continue
            for c in d:
                p.hand.remove(c)
                self.reserve.append(c)
            self._take_array(max(self.array, key=p.card_value))

    # ---- driver ----
    def play(self) -> dict:
        turn = 0
        while not self.over:
            (self.player_turn if turn == 0 else self.rival_turn)()
            turn ^= 1
            if self.round > 200:
                raise RuntimeError("runaway game")
        sc, a, b, best = rival_score(self.row)
        sc += self.st["hoard"]
        out = dict(self.st)
        out.update(rival=sc, read_a=a, read_b=b, best=best, row=len(self.row),
                   player=self.player.score(), keep_by_flip=self.keep_by_flip,
                   p_e4=sum(1 for s in self.player.book if s.kind == "E" and s.size == 4),
                   p_e4_void=sum(1 for s in self.player.book if s.kind == "E" and s.size == 4
                                 and any(c[0] == RIVAL_E for c in s.cards)))
        return out


def simulate(cfg: Config, trials: int, seed: int) -> list[dict]:
    rng = random.Random(seed)
    return [Game(cfg, rng).play() for _ in range(trials)]


# --------------------------------------------------------------------------- #
# Reporting                                                                    #
# --------------------------------------------------------------------------- #

def is_base(cfg: Config) -> bool:
    """Rules as written (Adept, honest player); only adjacency and pace vary."""
    return cfg == Config(adjacency=cfg.adjacency, profile=cfg.profile)


def q(xs, p):
    xs = sorted(xs)
    return xs[min(len(xs) - 1, int(p * len(xs)))]


def mean(rs, k):
    return statistics.fmean(r.get(k, 0) for r in rs)


def summary_row(cfg: Config, rs: list[dict]) -> str:
    keeps = sum(r.get("keeps", 0) for r in rs)
    flips = sum(r.get("flips", 0) for r in rs)
    tk = sum(r.get("tested_kept", 0) for r in rs)
    tt = sum(r.get("tested", 0) for r in rs)
    riv = [r["rival"] for r in rs]
    cells = [
        cfg.label(),
        f"{mean(rs, 'rounds_pre'):.1f}",
        f"{keeps / max(flips, 1):.0%}",
        f"{tk / max(tt, 1):.0%}",
        f"{mean(rs, 'rejects'):.1f}",
        f"{q([r.get('rejects', 0) for r in rs], .1)}–{q([r.get('rejects', 0) for r in rs], .9)}",
        f"{mean(rs, 'stranded'):.1f}",
        f"{sum(1 for r in rs if r.get('ravening', 0)) / len(rs):.0%}",
        f"{mean(rs, 'row'):.1f}",
        f"{statistics.fmean(riv):.1f} ({q(riv, .1)}/{q(riv, .5)}/{q(riv, .9)})",
    ]
    return "| " + " | ".join(cells) + " |"


SUMMARY_HEAD = ("| Config | Rounds to Drought | Keep rate (all flips) | Keep rate (row ≥3) | Rejects/game | "
                "Rejects p10–p90 | Stack stranded | Ravening games | Final row | Rival score mean (p10/p50/p90) |\n"
                "|---|---|---|---|---|---|---|---|---|---|")


def length_table(rs_all: list[dict]) -> list[str]:
    buckets = defaultdict(list)
    for r in rs_all:
        L = r.get("rounds_pre", 0)
        b = "≤7" if L <= 7 else "8–9" if L <= 9 else "10–11" if L <= 11 else "12–13" if L <= 13 else "14+"
        buckets[b].append(r)
    lines = ["| Rounds before Drought | Games | Row at Drought | Final row | Rival mean | p10 | p50 | p90 | Apprentice mean (×0.75) |",
             "|---|---|---|---|---|---|---|---|---|"]
    for b in ("≤7", "8–9", "10–11", "12–13", "14+"):
        rs = buckets.get(b)
        if not rs:
            continue
        riv = [r["rival"] for r in rs]
        lines.append(f"| {b} | {len(rs)} | {mean(rs, 'row_at_drought'):.1f} | {mean(rs, 'row'):.1f} | "
                     f"{statistics.fmean(riv):.1f} | {q(riv, .1)} | {q(riv, .5)} | {q(riv, .9)} | "
                     f"{statistics.fmean(int(x * 0.75) for x in riv):.1f} |")
    return lines


def player_table(results) -> list[str]:
    lines = ["| Config | Player mean (p10/p50/p90) | Rival mean | Player win (Adept) | Win (Apprentice) | |margin| ≤15 | "
             "Tithe p1/p2/p3 per game | Tithed a wanted card | Rejects taken by player | Player 4-card E (with a Void) |",
             "|---|---|---|---|---|---|---|---|---|---|"]
    for cfg, rs in results:
        if cfg.profile.startswith("m"):
            continue
        pl = [r["player"] for r in rs]
        win = sum(1 for r in rs if r["player"] > r["rival"]) / len(rs)
        win_a = sum(1 for r in rs if r["player"] > int(r["rival"] * 0.75)) / len(rs)
        close = sum(1 for r in rs if abs(r["player"] - r["rival"]) <= 15) / len(rs)
        lines.append(
            f"| {cfg.label()} | {statistics.fmean(pl):.1f} ({q(pl, .1)}/{q(pl, .5)}/{q(pl, .9)}) | "
            f"{mean(rs, 'rival'):.1f} | {win:.0%} | {win_a:.0%} | {close:.0%} | "
            f"{mean(rs, 'tithe_p1'):.1f}/{mean(rs, 'tithe_p2'):.1f}/{mean(rs, 'tithe_p3'):.1f} | "
            f"{mean(rs, 'tithe_wanted'):.1f} | {mean(rs, 'rejects_taken'):.2f} | "
            f"{mean(rs, 'p_e4'):.2f} ({mean(rs, 'p_e4_void'):.2f}) |")
    return lines


def keep_curve(results, adjacency) -> str:
    agg = defaultdict(lambda: [0, 0])
    for cfg, rs in results:
        if cfg.adjacency != adjacency or not is_base(cfg):
            continue
        for r in rs:
            for i, k in enumerate(r["keep_by_flip"]):
                agg[i + 1][0] += k
                agg[i + 1][1] += 1
    return " · ".join(f"{i}:{agg[i][0] / agg[i][1]:.0%}" for i in sorted(agg) if agg[i][1] >= 200)


def report(trials: int, seed: int):
    t0 = time.time()
    profiles = ["m1", "m2", "m3", "m4", "slow", "normal", "fast"]
    configs = [Config(adjacency=a, profile=p) for a in (1, 2, 3) for p in profiles]
    configs += [Config(adjacency=a, profile=p, difficulty="archmage") for a in (1, 2) for p in ("slow", "normal", "fast")]
    exploit = [Config(profile="normal", policy=pol, tithe_mode=tm)
               for pol in ("honest", "decoy") for tm in ("full", "no_p2", "none") if not (pol == "decoy" and tm != "full")]
    exploit += [Config(profile="normal", policy="decoy", ench_extend="open"),
                Config(profile="fast", policy="decoy"), Config(profile="slow", policy="decoy")]
    exploit += [Config(profile=p, drought_stack="sweep") for p in ("slow", "normal", "fast")]
    exploit += [Config(profile=p, hoard=True) for p in ("slow", "normal", "fast")]
    exploit += [Config(profile="normal", tithe_mode="any"), Config(profile="normal", tithe_mode="any", policy="decoy")]
    results = []
    for i, cfg in enumerate(dict.fromkeys(configs + exploit)):
        results.append((cfg, simulate(cfg, trials, seed + i)))

    print(f"# Attuned Rival Stage 1 — trials {trials}/config, seed {seed}\n")
    print("## Rival behaviour by adjacency and pace profile (Adept unless noted)\n")
    print(SUMMARY_HEAD)
    for cfg, rs in results:
        if cfg.policy == "honest" and cfg.tithe_mode == "full" and cfg.ench_extend == "match":
            print(summary_row(cfg, rs))
    print("\nDrought intake per game (Rival draws from the Released Reserve): "
          + "; ".join(f"{cfg.label()} Void {mean(rs, 'drought_void'):.2f} + wild {mean(rs, 'drought_wild'):.2f}"
                      for cfg, rs in results if cfg.adjacency == 1 and cfg.profile == "normal"
                      and cfg.policy == "honest" and cfg.tithe_mode == "full"))
    print("\nWhere rejects go (per game, ±1 / ±2 normal, Adept): "
          + "; ".join(f"{cfg.label()}: {mean(rs, 'rejects'):.2f} rejected, {mean(rs, 'rejects_taken'):.2f} taken by player, "
                      f"{mean(rs, 'tithe_own_reject'):.2f} tithed by the Rival, {mean(rs, 'rejects_left_in_array'):.2f} still in Array at Drought"
                      for cfg, rs in results if cfg.profile == "normal" and cfg.adjacency in (1, 2)
                      and cfg.difficulty == "adept" and cfg.policy == "honest" and cfg.tithe_mode == "full"
                      and not cfg.hoard and cfg.drought_stack == "remove"))
    for a in (1, 2, 3):
        print(f"\n## Rival score by game length, ±{a} (Adept, all seven profiles pooled)\n")
        pooled = [r for cfg, rs in results if cfg.adjacency == a and is_base(cfg) for r in rs]
        print("\n".join(length_table(pooled)))
        print(f"\nKeep-rate curve by flip number (flip 1 = first flip after binding): {keep_curve(results, a)}")
    print("\n## Player proxy vs Rival, Tithe and exploit checks\n")
    print("\n".join(player_table(results)))
    rs_all = [r for _, rs in results for r in rs]
    gap = sum(1 for r in rs_all if r["best"] > r["rival"]) / len(rs_all)
    tie = sum(1 for r in rs_all if r["read_a"] == r["read_b"] and r["row"] >= 3) / len(rs_all)
    b_wins = sum(1 for r in rs_all if r["read_b"] > r["read_a"]) / len(rs_all)
    print(f"\nScoring readings (all games): reading (b) beats (a) in {b_wins:.1%}; a = b tie in {tie:.1%}; "
          f"a mixed partition beats max(a, b) in {gap:.1%}.")
    print(f"Rules-gap events per 1,000 games: wild declaration fallback "
          f"{1000 * sum(r.get('wild_fallback', 0) for r in rs_all) / len(rs_all):.1f}; duplicate rank in row "
          f"{1000 * sum(r.get('dup_rank', 0) for r in rs_all) / len(rs_all):.1f}; "
          f"Tithe p2 dead because largest spell is a capped 4-card Enchantment "
          f"{1000 * sum(r.get('p2_dead_capped_E', 0) for r in rs_all) / len(rs_all):.0f}.")
    print(f"\n_Elapsed {time.time() - t0:.1f}s, {len(results)} configs x {trials} games._")


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    r = sub.add_parser("report")
    r.add_argument("--trials", type=int, default=2000)
    r.add_argument("--seed", type=int, default=20261113)
    one = sub.add_parser("run")
    one.add_argument("--trials", type=int, default=2000)
    one.add_argument("--seed", type=int, default=20261113)
    for f, d in (("adjacency", 1), ("profile", "normal"), ("difficulty", "adept"), ("tithe_mode", "full"),
                 ("policy", "honest"), ("ench_extend", "match")):
        one.add_argument("--" + f.replace("_", "-"), type=type(d), default=d)
    a = ap.parse_args(argv)
    if a.cmd == "report":
        report(a.trials, a.seed)
    else:
        cfg = Config(adjacency=a.adjacency, profile=a.profile, difficulty=a.difficulty,
                     tithe_mode=a.tithe_mode, policy=a.policy, ench_extend=a.ench_extend)
        rs = simulate(cfg, a.trials, a.seed)
        print(SUMMARY_HEAD)
        print(summary_row(cfg, rs))
        print()
        print("\n".join(player_table([(cfg, rs)])))
    return 0


if __name__ == "__main__":
    sys.exit(main())
