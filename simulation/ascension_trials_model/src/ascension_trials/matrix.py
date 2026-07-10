"""Two-player payoff matrices and strategic-equivalence collapse (VS2).

Covers REQ-11 (strategic equivalence) and REQ-12 (exhaustive payoff matrices).

Payoff matrices (design §11; impl spec §11.1)
    :func:`build_two_player_payoff_matrix` resolves every (row-allocation,
    column-allocation) pair with the VS1 resolver and stores, per cell, the row
    player's win utility ``u^W ∈ {-1,0,1}``, RP-margin utility ``u^M = r_A - r_B``,
    the final-tie flag, and the row player's per-Trial award signature. Construction
    is exhaustive and integer-exact (REQ-12.2). Cell utilities come only from the
    resolver, so the matrix inherits the resolver's determinism and symmetry.

    When both players share the same state and strategy list (symmetric self-play —
    every VS2 toy fixture), a single resolve of (i, j) fills both cell (i, j) from
    player A's outcome and cell (j, i) from player B's outcome, halving the work.
    This relies only on the resolver's proven player-relabelling symmetry (REQ-7.3,
    fixture A1); it is disabled for asymmetric inputs.

Strategic-equivalence collapse (design §9.2; impl spec §9.2)
    :func:`collapse_strategies` groups strategies whose *complete* row and column
    behaviour vectors are identical — win payoff, margin payoff, final-tie flag and
    Trial-award vector against every opponent — and keeps one representative per
    class with a representative→members map. Because an unenterable Trial changes no
    behaviour vector, adding one leaves the collapsed class count and every derived
    metric unchanged (fixture A15 / MATH-12).

Memory guards (REQ-12, impl spec §13.2)
    Matrix dimensions and a byte estimate are checked before any array is
    materialized; an over-ceiling request raises :class:`MatrixLimitError` rather
    than silently degrading (NFR-4).
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional, Sequence

import numpy as np

from .canonical import canonical_allocation_key
from .resolver import resolve_profile
from .schema import Allocation, Configuration, PlayerState

# Ceilings (impl spec §13.2): up to 10,000 row classes and 10,000 column classes.
MAX_MATRIX_DIM = 10_000
# Rough memory ceiling for the exact matrix (win + margin + tie + signatures).
MAX_MATRIX_BYTES = 512 * 1024 * 1024

# Deterministic player ids for the two-player resolve (A sorts before B).
ROW_PLAYER = "A"
COL_PLAYER = "B"


class MatrixLimitError(RuntimeError):
    """Raised when an exact payoff matrix would exceed the configured ceiling.

    Enumeration/matrix construction never silently samples when a ceiling is hit
    (REQ-10.5, NFR-4); it refuses and reports the estimate.
    """

    def __init__(self, rows: int, cols: int, detail: str = "") -> None:
        self.rows = rows
        self.cols = cols
        msg = f"exact payoff matrix refused: {rows}x{cols}"
        if detail:
            msg += f" ({detail})"
        super().__init__(msg)


@dataclass(frozen=True)
class PayoffMatrix:
    """Exhaustive two-player payoff matrix over fixed row/column strategy lists.

    All numeric fields are integer-exact (REQ-12). ``win`` and ``margin`` are
    ``int`` ndarrays of shape ``(rows, cols)`` giving the ROW player's utility;
    ``final_tie`` is a bool ndarray; ``row_award_signatures[i][j]`` is the row
    player's per-Trial Recognition-Point award tuple (sorted Trial-id order) in
    cell (i, j).
    """

    row_strategy_ids: tuple[str, ...]
    column_strategy_ids: tuple[str, ...]
    win: np.ndarray
    margin: np.ndarray
    final_tie: np.ndarray
    row_award_signatures: tuple[tuple[tuple[int, ...], ...], ...]
    trial_ids: tuple[str, ...]
    row_allocations: tuple[Allocation, ...] = field(default=(), repr=False)
    column_allocations: tuple[Allocation, ...] = field(default=(), repr=False)

    @property
    def shape(self) -> tuple[int, int]:
        return (len(self.row_strategy_ids), len(self.column_strategy_ids))


# --------------------------------------------------------------------------- #
# Strategy identity                                                            #
# --------------------------------------------------------------------------- #


def strategy_id(config: Configuration, state: PlayerState, allocation: Allocation) -> str:
    """A stable, order-independent string id for an allocation strategy (NFR-1)."""
    key = canonical_allocation_key(config, state, allocation)
    # key = (player_id, normal-tuple, wild-tuple); drop the player id so the id is
    # about the *strategy*, not who plays it.
    _pid, normal, wild = key
    normal_part = "|".join(
        f"{tid}:{{{','.join(f'{d}={p}' for d, p in doms)}}}" for tid, doms in normal
    )
    wild_part = "|".join(f"{tid}={p}" for tid, p in wild)
    return f"N[{normal_part}];W[{wild_part}]"


def _award_signature(trial_results, player_id: str, trial_ids: Sequence[str]) -> tuple[int, ...]:
    """Row player's per-Trial Recognition-Point award, in sorted Trial-id order."""
    by_trial = {tr.trial_id: tr.rewards_awarded.get(player_id, 0) for tr in trial_results}
    return tuple(by_trial.get(tid, 0) for tid in trial_ids)


# --------------------------------------------------------------------------- #
# Matrix construction                                                          #
# --------------------------------------------------------------------------- #


def _check_matrix_limits(rows: int, cols: int) -> None:
    if rows > MAX_MATRIX_DIM or cols > MAX_MATRIX_DIM:
        raise MatrixLimitError(
            rows, cols, detail=f"dimension ceiling is {MAX_MATRIX_DIM} per side"
        )
    # win + margin (int64) + tie (bool) ~ 8 + 8 + 1 bytes per cell, plus signature
    # tuples. Use a generous ~64 bytes/cell estimate for the pre-check.
    approx = rows * cols * 64
    if approx > MAX_MATRIX_BYTES:
        raise MatrixLimitError(
            rows, cols, detail=f"estimated {approx} bytes exceeds ceiling {MAX_MATRIX_BYTES}"
        )


def _symmetric_inputs(
    config: Configuration,
    state_a: PlayerState,
    state_b: PlayerState,
    ids_a: tuple[str, ...],
    ids_b: tuple[str, ...],
) -> bool:
    """True when the two players present identical states and strategy lists."""
    return (
        ids_a == ids_b
        and state_a.normal_power == state_b.normal_power
        and state_a.wild_power == state_b.wild_power
    )


def build_two_player_payoff_matrix(
    config: Configuration,
    state_a: PlayerState,
    state_b: PlayerState,
    allocations_a: Sequence[Allocation],
    allocations_b: Sequence[Allocation],
    player_count: int = 2,
) -> PayoffMatrix:
    """Build the exhaustive two-player payoff matrix (REQ-12.2).

    Rows index ``allocations_a`` (player A), columns index ``allocations_b``
    (player B); each cell holds player A's win / margin utility, the final-tie flag
    and A's Trial-award signature. Strategy lists are used exactly as supplied (the
    caller sorts them; enumeration already returns canonical order), so output is
    deterministic (NFR-1).
    """
    rows = len(allocations_a)
    cols = len(allocations_b)
    _check_matrix_limits(rows, cols)

    row_ids = tuple(strategy_id(config, state_a, a) for a in allocations_a)
    col_ids = tuple(strategy_id(config, state_b, b) for b in allocations_b)

    trial_ids = tuple(sorted(t.id for t in config.active_trials(player_count)))

    win = np.zeros((rows, cols), dtype=np.int64)
    margin = np.zeros((rows, cols), dtype=np.int64)
    final_tie = np.zeros((rows, cols), dtype=bool)
    row_sigs: list[list[tuple[int, ...]]] = [[() for _ in range(cols)] for _ in range(rows)]

    symmetric = _symmetric_inputs(config, state_a, state_b, row_ids, col_ids)

    def _fill(i: int, j: int, result) -> None:
        win[i, j] = result.win_utility.get(ROW_PLAYER, 0)
        margin[i, j] = result.margin_utility.get(ROW_PLAYER, 0)
        pr = result.player_results.get(ROW_PLAYER)
        final_tie[i, j] = bool(pr.shared_first) if pr is not None else False
        row_sigs[i][j] = _award_signature(result.trial_results, ROW_PLAYER, trial_ids)

    if symmetric:
        for i in range(rows):
            for j in range(i, cols):
                result = resolve_profile(
                    config,
                    {ROW_PLAYER: state_a, COL_PLAYER: state_b},
                    {ROW_PLAYER: allocations_a[i], COL_PLAYER: allocations_b[j]},
                    player_count=player_count,
                )
                _fill(i, j, result)
                if i != j:
                    # Cell (j, i): row plays strategy j, column plays strategy i.
                    # By player-relabelling symmetry (REQ-7.3) this equals player
                    # B's outcome in the same resolve.
                    win[j, i] = result.win_utility.get(COL_PLAYER, 0)
                    margin[j, i] = result.margin_utility.get(COL_PLAYER, 0)
                    pr_b = result.player_results.get(COL_PLAYER)
                    final_tie[j, i] = bool(pr_b.shared_first) if pr_b is not None else False
                    row_sigs[j][i] = _award_signature(
                        result.trial_results, COL_PLAYER, trial_ids
                    )
    else:
        for i in range(rows):
            for j in range(cols):
                result = resolve_profile(
                    config,
                    {ROW_PLAYER: state_a, COL_PLAYER: state_b},
                    {ROW_PLAYER: allocations_a[i], COL_PLAYER: allocations_b[j]},
                    player_count=player_count,
                )
                _fill(i, j, result)

    return PayoffMatrix(
        row_strategy_ids=row_ids,
        column_strategy_ids=col_ids,
        win=win,
        margin=margin,
        final_tie=final_tie,
        row_award_signatures=tuple(tuple(row) for row in row_sigs),
        trial_ids=trial_ids,
        row_allocations=tuple(allocations_a),
        column_allocations=tuple(allocations_b),
    )


# --------------------------------------------------------------------------- #
# Strategic-equivalence collapse (REQ-11.1, REQ-11.2; design §9.2)             #
# --------------------------------------------------------------------------- #


@dataclass(frozen=True)
class CollapseResult:
    """The behavioural strategic-equivalence collapse of a symmetric payoff matrix.

    ``classes`` maps each representative strategy id to the sorted list of member
    ids (REQ-11.2). ``matrix`` is the reduced payoff matrix over one representative
    per class (rows and columns in the same representative order). ``representative_of``
    maps every original strategy id to its representative.
    """

    classes: dict[str, list[str]]
    representative_of: dict[str, str]
    matrix: PayoffMatrix

    @property
    def class_count(self) -> int:
        return len(self.classes)


def _behaviour_signature(matrix: PayoffMatrix, index: int) -> tuple:
    """Complete row+column behaviour of one strategy (design §9.2).

    Two strategies are strategically equivalent iff this signature matches: their
    win payoff, margin payoff, final-tie flag and Trial-award vector are identical
    against every opponent, both as the row player and as the column player.
    """
    n_cols = matrix.win.shape[1]
    n_rows = matrix.win.shape[0]
    row_behaviour = tuple(
        (
            int(matrix.win[index, j]),
            int(matrix.margin[index, j]),
            bool(matrix.final_tie[index, j]),
            matrix.row_award_signatures[index][j],
        )
        for j in range(n_cols)
    )
    col_behaviour = tuple(
        (
            int(matrix.win[r, index]),
            int(matrix.margin[r, index]),
            bool(matrix.final_tie[r, index]),
            matrix.row_award_signatures[r][index],
        )
        for r in range(n_rows)
    )
    return (row_behaviour, col_behaviour)


def collapse_strategies(matrix: PayoffMatrix) -> CollapseResult:
    """Collapse strategically-equivalent strategies of a symmetric matrix (REQ-11).

    Requires a square symmetric matrix whose row and column strategy lists are the
    same set in the same order (as produced for self-play by
    :func:`build_two_player_payoff_matrix`). Groups strategies by complete
    behaviour signature, keeps the lexicographically-smallest id as representative,
    and rebuilds the reduced matrix over representatives.
    """
    if matrix.row_strategy_ids != matrix.column_strategy_ids:
        raise ValueError(
            "strategic collapse requires a symmetric matrix (row ids == column ids)"
        )
    n = len(matrix.row_strategy_ids)

    signature_to_members: dict[tuple, list[int]] = {}
    for i in range(n):
        sig = _behaviour_signature(matrix, i)
        signature_to_members.setdefault(sig, []).append(i)

    # Representative = member with the lexicographically-smallest strategy id.
    reps: list[int] = []
    classes: dict[str, list[str]] = {}
    representative_of: dict[str, str] = {}
    for members in signature_to_members.values():
        member_ids = sorted(matrix.row_strategy_ids[m] for m in members)
        rep_id = member_ids[0]
        rep_index = next(m for m in members if matrix.row_strategy_ids[m] == rep_id)
        reps.append(rep_index)
        classes[rep_id] = member_ids
        for mid in member_ids:
            representative_of[mid] = rep_id

    reps.sort(key=lambda idx: matrix.row_strategy_ids[idx])
    rep_ids = tuple(matrix.row_strategy_ids[idx] for idx in reps)
    k = len(reps)

    win = np.zeros((k, k), dtype=np.int64)
    margin = np.zeros((k, k), dtype=np.int64)
    final_tie = np.zeros((k, k), dtype=bool)
    sigs: list[list[tuple[int, ...]]] = [[() for _ in range(k)] for _ in range(k)]
    for a, ia in enumerate(reps):
        for b, ib in enumerate(reps):
            win[a, b] = matrix.win[ia, ib]
            margin[a, b] = matrix.margin[ia, ib]
            final_tie[a, b] = matrix.final_tie[ia, ib]
            sigs[a][b] = matrix.row_award_signatures[ia][ib]

    reduced = PayoffMatrix(
        row_strategy_ids=rep_ids,
        column_strategy_ids=rep_ids,
        win=win,
        margin=margin,
        final_tie=final_tie,
        row_award_signatures=tuple(tuple(row) for row in sigs),
        trial_ids=matrix.trial_ids,
        row_allocations=tuple(matrix.row_allocations[idx] for idx in reps)
        if matrix.row_allocations
        else (),
        column_allocations=tuple(matrix.column_allocations[idx] for idx in reps)
        if matrix.column_allocations
        else (),
    )
    return CollapseResult(
        classes=classes, representative_of=representative_of, matrix=reduced
    )
