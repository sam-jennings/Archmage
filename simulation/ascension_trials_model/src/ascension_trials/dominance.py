"""Iterated strict-dominance elimination and weak-dominance diagnostics (VS2).

Implements REQ-11.3–11.7 and impl spec §10 on a win-utility matrix (the ROW
player's payoff; the column player minimizes it).

True strict dominance (impl spec §10.1)
    Row ``r`` is strictly dominated by row ``r'`` iff ``win[r', c] > win[r, c]`` for
    *every* surviving column ``c`` — a strict ``>`` in every column, never the weak
    ``>=`` formula. The column player's definition is the mirror: column ``c`` is
    strictly dominated by ``c'`` iff ``win[r, c'] < win[r, c]`` for every surviving
    row ``r`` (a lower row payoff is better for the column player).

Iteration (impl spec §10.2)
    Each round compares only currently-surviving strategies, removes *all* strictly
    dominated rows and columns simultaneously, and repeats to a fixed point. The
    fixed point is order-independent because "strictly dominated against the current
    survivor set" does not depend on the order strategies are examined (REQ-11.6).
    Every removal records its round and a dominator.

Weak dominance (impl spec §10.3) is reported separately by
:func:`diagnose_weak_dominance` and never feeds the reasonable set ``R`` (REQ-11.4):
a strategy is weakly dominated when another is ``>=`` everywhere with at least one
strict improvement.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional, Sequence

import numpy as np


@dataclass(frozen=True)
class Elimination:
    """One removed strategy: its index/id, the round it fell, and a dominator."""

    index: int
    strategy_id: Optional[str]
    round: int
    dominated_by_index: int
    dominated_by_id: Optional[str]


@dataclass
class DominanceResult:
    """Result of iterated true strict-dominance elimination (REQ-11).

    ``surviving_rows`` / ``surviving_cols`` are the reasonable strategy indices for
    each player after reaching the fixed point; ``removed_rows`` / ``removed_cols``
    record each eliminated strategy with its round and dominator (impl spec §10.2).
    ``rounds`` is the number of elimination rounds performed.
    """

    surviving_rows: list[int]
    surviving_cols: list[int]
    removed_rows: list[Elimination] = field(default_factory=list)
    removed_cols: list[Elimination] = field(default_factory=list)
    rounds: int = 0
    row_ids: tuple[str, ...] = ()
    col_ids: tuple[str, ...] = ()

    @property
    def reasonable_row_ids(self) -> list[str]:
        return [self.row_ids[i] for i in self.surviving_rows] if self.row_ids else []

    @property
    def reasonable_col_ids(self) -> list[str]:
        return [self.col_ids[i] for i in self.surviving_cols] if self.col_ids else []


def _strict_row_dominator(
    win: np.ndarray, r: int, survivors_rows: Sequence[int], survivors_cols: Sequence[int]
) -> Optional[int]:
    """Return a surviving row that strictly dominates row ``r``, or None.

    ``r'`` strictly dominates ``r`` iff ``win[r', c] > win[r, c]`` for every
    surviving column ``c``. Deterministic: returns the smallest-index dominator.
    """
    cols = list(survivors_cols)
    for rp in sorted(survivors_rows):
        if rp == r:
            continue
        if all(win[rp, c] > win[r, c] for c in cols):
            return rp
    return None


def _strict_col_dominator(
    win: np.ndarray, c: int, survivors_rows: Sequence[int], survivors_cols: Sequence[int]
) -> Optional[int]:
    """Return a surviving column that strictly dominates column ``c``, or None.

    For the column player (who minimizes the row payoff), ``c'`` strictly dominates
    ``c`` iff ``win[r, c'] < win[r, c]`` for every surviving row ``r``.
    """
    rows = list(survivors_rows)
    for cp in sorted(survivors_cols):
        if cp == c:
            continue
        if all(win[r, cp] < win[r, c] for r in rows):
            return cp
    return None


def eliminate_strictly_dominated(
    win: np.ndarray,
    row_ids: Sequence[str] = (),
    col_ids: Sequence[str] = (),
) -> DominanceResult:
    """Iterated true strict-dominance elimination to a fixed point (REQ-11.3/11.5/11.6)."""
    win = np.asarray(win)
    n_rows, n_cols = win.shape
    surviving_rows = list(range(n_rows))
    surviving_cols = list(range(n_cols))
    result = DominanceResult(
        surviving_rows=surviving_rows,
        surviving_cols=surviving_cols,
        row_ids=tuple(row_ids),
        col_ids=tuple(col_ids),
    )

    round_no = 0
    while True:
        round_no += 1
        row_dominators: dict[int, int] = {}
        for r in surviving_rows:
            dom = _strict_row_dominator(win, r, surviving_rows, surviving_cols)
            if dom is not None:
                row_dominators[r] = dom
        col_dominators: dict[int, int] = {}
        for c in surviving_cols:
            dom = _strict_col_dominator(win, c, surviving_rows, surviving_cols)
            if dom is not None:
                col_dominators[c] = dom

        if not row_dominators and not col_dominators:
            round_no -= 1
            break

        # Remove all dominated strategies simultaneously this round (REQ-11.5).
        for r in sorted(row_dominators):
            dom = row_dominators[r]
            result.removed_rows.append(
                Elimination(
                    index=r,
                    strategy_id=result.row_ids[r] if result.row_ids else None,
                    round=round_no,
                    dominated_by_index=dom,
                    dominated_by_id=result.row_ids[dom] if result.row_ids else None,
                )
            )
        for c in sorted(col_dominators):
            dom = col_dominators[c]
            result.removed_cols.append(
                Elimination(
                    index=c,
                    strategy_id=result.col_ids[c] if result.col_ids else None,
                    round=round_no,
                    dominated_by_index=dom,
                    dominated_by_id=result.col_ids[dom] if result.col_ids else None,
                )
            )
        surviving_rows = [r for r in surviving_rows if r not in row_dominators]
        surviving_cols = [c for c in surviving_cols if c not in col_dominators]

    result.surviving_rows = surviving_rows
    result.surviving_cols = surviving_cols
    result.rounds = round_no
    return result


# --------------------------------------------------------------------------- #
# Strict-beater query (fixture A3: "(4,0) has zero strict beaters")            #
# --------------------------------------------------------------------------- #


def strict_row_dominators_of(win: np.ndarray, index: int) -> list[int]:
    """Every row that strictly dominates row ``index`` over ALL columns (REQ-11.3).

    A "strict beater" of a strategy is a row that beats it in every column. An
    empty list means the strategy is not strictly dominated by any single strategy.
    """
    win = np.asarray(win)
    n_rows, n_cols = win.shape
    cols = range(n_cols)
    out = []
    for rp in range(n_rows):
        if rp == index:
            continue
        if all(win[rp, c] > win[index, c] for c in cols):
            out.append(rp)
    return out


# --------------------------------------------------------------------------- #
# Weak-dominance diagnostics (impl spec §10.3; REQ-11.4, REQ-11.7)             #
# --------------------------------------------------------------------------- #


@dataclass(frozen=True)
class WeakDominance:
    """A weakly-but-reported dominance relation (diagnostic only, never feeds R)."""

    dominated_index: int
    dominated_id: Optional[str]
    dominator_index: int
    dominator_id: Optional[str]
    player: str  # "row" | "column"
    strict: bool  # True if it also happens to be strict (for contrast)


def diagnose_weak_dominance(
    win: np.ndarray,
    row_ids: Sequence[str] = (),
    col_ids: Sequence[str] = (),
) -> list[WeakDominance]:
    """Report weak dominance for both players (impl spec §10.3; REQ-11.4/11.7).

    Row ``r`` is weakly dominated by ``r'`` iff ``win[r', c] >= win[r, c]`` for all
    columns with at least one strict ``>``. Column ``c`` is weakly dominated by
    ``c'`` iff ``win[r, c'] <= win[r, c]`` for all rows with at least one strict
    ``<``. Each relation is flagged ``strict`` when it is also a strict domination,
    so the diagnostic distinguishes weak-but-not-strict from strict (REQ-11.7).
    This output is never used to compute the reasonable set.
    """
    win = np.asarray(win)
    n_rows, n_cols = win.shape
    out: list[WeakDominance] = []

    for r in range(n_rows):
        for rp in range(n_rows):
            if rp == r:
                continue
            ge_all = all(win[rp, c] >= win[r, c] for c in range(n_cols))
            some_gt = any(win[rp, c] > win[r, c] for c in range(n_cols))
            if ge_all and some_gt:
                strict = all(win[rp, c] > win[r, c] for c in range(n_cols))
                out.append(
                    WeakDominance(
                        dominated_index=r,
                        dominated_id=row_ids[r] if row_ids else None,
                        dominator_index=rp,
                        dominator_id=row_ids[rp] if row_ids else None,
                        player="row",
                        strict=strict,
                    )
                )

    for c in range(n_cols):
        for cp in range(n_cols):
            if cp == c:
                continue
            le_all = all(win[r, cp] <= win[r, c] for r in range(n_rows))
            some_lt = any(win[r, cp] < win[r, c] for r in range(n_rows))
            if le_all and some_lt:
                strict = all(win[r, cp] < win[r, c] for r in range(n_rows))
                out.append(
                    WeakDominance(
                        dominated_index=c,
                        dominated_id=col_ids[c] if col_ids else None,
                        dominator_index=cp,
                        dominator_id=col_ids[cp] if col_ids else None,
                        player="column",
                        strict=strict,
                    )
                )

    return out
