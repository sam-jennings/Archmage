"""Two-player payoff matrices and strategic-equivalence collapse (VS2).

Covers REQ-11 (strategic equivalence) and REQ-12 (exhaustive payoff matrices).

Payoff matrices (design §11; impl spec §11.1; VS3 REQ-1)
    :func:`build_two_player_payoff_matrix` resolves every (row-allocation,
    column-allocation) pair with the VS1 resolver and stores, per cell, the row
    player's win utility ``u^W ∈ {-1,0,1}``, RP-margin utility ``u^M = r_A - r_B``,
    the final-tie flag, and the row player's per-Trial award signature. Construction
    is exhaustive and integer-exact (REQ-12.2). Cell utilities come only from the
    resolver, so the matrix inherits the resolver's determinism and symmetry.

    The matrix is **rectangular** in general (VS3 REQ-1.3): player A and player B
    may hold different states and different-sized legal allocation spaces, and every
    one of the ``m×n`` cells is then filled by an independent resolver call.

    When — and only when — both players present states that resolve identically and
    the same strategy list (genuine parity, ``A == B``; every VS2 toy fixture is
    self-play), a single resolve of (i, j) fills both cell (i, j) from player A's
    outcome and cell (j, i) from player B's outcome, halving the work. This relies
    only on the resolver's proven player-relabelling symmetry (REQ-7.3, fixture A1);
    it is **disabled for asymmetric inputs** (VS3 REQ-1.3). Parity is decided on the
    full resolver-relevant state signature (normal power, Wild power AND tiebreak
    statistics), so two states with equal power but different final-tiebreak stats —
    a genuinely asymmetric game under an active final Spellbook tiebreak — correctly
    take the full per-cell path, never the antisymmetry short-cut.

    Every resolved cell is checked for two-player zero-sum (``u_B == -u_A`` for win
    and margin, read from the resolver, not assumed) and a
    :class:`ZeroSumViolationError` is raised on any violation (REQ-1.4, NFR-4);
    :func:`verify_two_player_zero_sum` offers a standalone check with an additional
    seat-swap cross-check for asymmetric-state validation.


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


class ZeroSumViolationError(RuntimeError):
    """Raised when a resolved cell is not two-player zero-sum (REQ-1.4, NFR-4).

    Both the win game and the margin game must satisfy ``u_B == -u_A`` in every
    cell, read from the resolver (never assumed from antisymmetry, which holds only
    at parity). A violation means the resolver returned a non-zero-sum two-player
    outcome — a consistency error surfaced explicitly rather than silently stored.
    """

    def __init__(self, i: int, j: int, detail: str = "") -> None:
        self.i = i
        self.j = j
        msg = f"two-player zero-sum violated at cell ({i},{j})"
        if detail:
            msg += f": {detail}"
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
    # Per-cell, per-Trial shared-first flags taken straight from the resolver's
    # ``TrialResult.shared_first`` (design §7.8) — cell (i,j) carries a tuple of
    # booleans in ``trial_ids`` order. This is the audited source for per-Trial
    # shared-award rates (audit D7): a Trial is shared iff its first-place group
    # had more than one member, which is a resolver fact, never inferred from
    # award-value collisions.
    trial_shared_flags: tuple[tuple[tuple[bool, ...], ...], ...] = ()
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


def _trial_shared_signature(trial_results, trial_ids: Sequence[str]) -> tuple[bool, ...]:
    """Per-Trial shared-first flags, in sorted Trial-id order (audit D7).

    Read directly from :class:`~ascension_trials.resolver.TrialResult.shared_first`
    — a Trial-level fact (the first-place group had >1 member), identical for both
    players in a resolve, so cell (i, j) and its mirror (j, i) carry the same flags.
    """
    by_trial = {tr.trial_id: bool(tr.shared_first) for tr in trial_results}
    return tuple(by_trial.get(tid, False) for tid in trial_ids)


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


def _resolver_state_signature(state: PlayerState) -> tuple:
    """The part of a player state that can change resolver output (design §3).

    A two-player resolve reads only three things from each state: its per-domain
    normal power (ledger, over-allocation, and the historical ratio / total-normal
    tiebreak denominators), its Wild power, and its tiebreak statistics (the
    ``spell_count`` / ``largest_spell`` final-result comparators). Player id,
    provenance and the independent score q(S) never enter a resolve, so two states
    that agree on this signature resolve identically for every opponent. Zero
    entries are dropped to match the resolver's ``.get(key, 0)`` semantics, so
    ``{X: 0}`` and ``{}`` share a signature.
    """
    normal = tuple(sorted((d, p) for d, p in state.normal_power.items() if p != 0))
    tie = tuple(sorted((k, v) for k, v in state.tiebreak_stats.items() if v != 0))
    return (normal, state.wild_power, tie)


def _symmetric_inputs(
    config: Configuration,
    state_a: PlayerState,
    state_b: PlayerState,
    ids_a: tuple[str, ...],
    ids_b: tuple[str, ...],
) -> bool:
    """True only at genuine parity (A == B): identical strategy lists AND states
    that resolve identically.

    The antisymmetry fast-path (fill cell (j,i) from player B's outcome in the
    (i,j) resolve) is sound only when swapping the two seats is a symmetry of the
    game — i.e. the two players hold the same state and the same strategy list.
    REQ-1.3 forbids the short-cut whenever ``A != B``. An earlier version compared
    only ``normal_power`` / ``wild_power`` and would have wrongly taken the fast
    path for two states with equal power but different ``tiebreak_stats`` (a config
    with an active final Spellbook tiebreak makes such a game genuinely
    asymmetric). The full resolver-relevant signature closes that gap.
    """
    return ids_a == ids_b and _resolver_state_signature(state_a) == _resolver_state_signature(
        state_b
    )


def _assert_cell_zero_sum(result, i: int, j: int) -> None:
    """Assert the resolved cell is two-player zero-sum for win and margin (REQ-1.4).

    Reads both players' utilities from the resolver and checks ``u_B == -u_A`` for
    the win game and the margin game. This is the per-cell verification REQ-1.4
    requires; it never assumes antisymmetry (which holds only at parity), and it
    always holds for a valid two-player resolve, so on well-formed inputs it is a
    cheap, always-passing guard that fails loud (NFR-4) if the resolver ever
    returns a non-zero-sum two-player outcome.
    """
    win_a = int(result.win_utility.get(ROW_PLAYER, 0))
    win_b = int(result.win_utility.get(COL_PLAYER, 0))
    margin_a = int(result.margin_utility.get(ROW_PLAYER, 0))
    margin_b = int(result.margin_utility.get(COL_PLAYER, 0))
    if win_b != -win_a or margin_b != -margin_a:
        raise ZeroSumViolationError(
            i,
            j,
            f"u_A=(win={win_a}, margin={margin_a}) u_B=(win={win_b}, margin={margin_b}); "
            f"expected u_B == -u_A",
        )


def build_two_player_payoff_matrix(
    config: Configuration,
    state_a: PlayerState,
    state_b: PlayerState,
    allocations_a: Sequence[Allocation],
    allocations_b: Sequence[Allocation],
    player_count: int = 2,
    *,
    use_symmetry: bool = True,
    verify_zero_sum: bool = True,
) -> PayoffMatrix:
    """Build the exhaustive two-player payoff matrix (REQ-1, REQ-12.2).

    Rows index ``allocations_a`` (player A), columns index ``allocations_b``
    (player B); each cell holds player A's win / margin utility, the final-tie flag
    and A's Trial-award signature. Strategy lists are used exactly as supplied (the
    caller sorts them; enumeration already returns canonical order), so output is
    deterministic (NFR-1).

    The matrix is **rectangular** in general: ``allocations_a`` and
    ``allocations_b`` may differ in length and content when A and B hold different
    states (REQ-1.3). Every cell is then filled by an independent resolver call.
    The antisymmetry fast-path — resolve (i, j) once and mirror-fill (j, i) from
    player B's outcome — is used **only** at genuine parity (``state_a`` and
    ``state_b`` resolve identically and share a strategy list; REQ-1.3), never for
    asymmetric states. Set ``use_symmetry=False`` to force full per-cell resolution
    even at parity (used by the byte-identical memoization proofs and the
    double-oracle deviation columns, where a single materialised cell is wanted).

    When ``verify_zero_sum`` is set (the default), every resolved cell is checked
    for two-player zero-sum (``u_B == -u_A`` for win and margin, read from the
    resolver) and a :class:`ZeroSumViolationError` is raised on any violation
    (REQ-1.4, NFR-4). The check adds no extra resolves.

    Per-side matrix/memory ceilings apply to ``m`` (rows) and ``n`` (columns)
    independently; an over-limit request raises :class:`MatrixLimitError` and is
    never silently sampled (REQ-1.6, NFR-4).
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
    shared_flags: list[list[tuple[bool, ...]]] = [[() for _ in range(cols)] for _ in range(rows)]

    symmetric = use_symmetry and _symmetric_inputs(config, state_a, state_b, row_ids, col_ids)

    def _fill(i: int, j: int, result) -> None:
        win[i, j] = result.win_utility.get(ROW_PLAYER, 0)
        margin[i, j] = result.margin_utility.get(ROW_PLAYER, 0)
        pr = result.player_results.get(ROW_PLAYER)
        final_tie[i, j] = bool(pr.shared_first) if pr is not None else False
        row_sigs[i][j] = _award_signature(result.trial_results, ROW_PLAYER, trial_ids)
        shared_flags[i][j] = _trial_shared_signature(result.trial_results, trial_ids)

    if symmetric:
        for i in range(rows):
            for j in range(i, cols):
                result = resolve_profile(
                    config,
                    {ROW_PLAYER: state_a, COL_PLAYER: state_b},
                    {ROW_PLAYER: allocations_a[i], COL_PLAYER: allocations_b[j]},
                    player_count=player_count,
                )
                if verify_zero_sum:
                    _assert_cell_zero_sum(result, i, j)
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
                    # Per-Trial shared-first is a Trial-level property of the same
                    # resolve, identical for the mirror cell (audit D7).
                    shared_flags[j][i] = shared_flags[i][j]
    else:
        for i in range(rows):
            for j in range(cols):
                result = resolve_profile(
                    config,
                    {ROW_PLAYER: state_a, COL_PLAYER: state_b},
                    {ROW_PLAYER: allocations_a[i], COL_PLAYER: allocations_b[j]},
                    player_count=player_count,
                )
                if verify_zero_sum:
                    _assert_cell_zero_sum(result, i, j)
                _fill(i, j, result)

    return PayoffMatrix(
        row_strategy_ids=row_ids,
        column_strategy_ids=col_ids,
        win=win,
        margin=margin,
        final_tie=final_tie,
        row_award_signatures=tuple(tuple(row) for row in row_sigs),
        trial_ids=trial_ids,
        trial_shared_flags=tuple(tuple(row) for row in shared_flags),
        row_allocations=tuple(allocations_a),
        column_allocations=tuple(allocations_b),
    )


def verify_two_player_zero_sum(
    config: Configuration,
    state_a: PlayerState,
    state_b: PlayerState,
    allocations_a: Sequence[Allocation],
    allocations_b: Sequence[Allocation],
    player_count: int = 2,
    *,
    player_swap: bool = True,
) -> int:
    """Verify the full rectangular game is two-player zero-sum, cell by cell (REQ-1.4).

    For every cell ``(i, j)`` this resolves ``allocations_a[i]`` (seat A, ``state_a``)
    against ``allocations_b[j]`` (seat B, ``state_b``) and confirms ``u_B == -u_A``
    for both the win game and the margin game, reading **both** players' utilities
    from the resolver — the antisymmetry short-cut is never assumed (it holds only
    at parity).

    When ``player_swap`` is set (the default), each cell is additionally
    cross-checked against the seat-swapped resolve — ``allocations_b[j]`` on seat A
    with ``state_b``, ``allocations_a[i]`` on seat B with ``state_a`` — confirming
    the swapped seat-A row utility negates the original (``u_row(swap) == -u_A``).
    This exercises the resolver's player-relabelling symmetry (VS1 REQ-7.3) directly
    on asymmetric states rather than trusting it, at the cost of a second resolve per
    cell.

    Returns the number of cells verified; raises :class:`ZeroSumViolationError` on
    the first violation (NFR-4). Intended for asymmetric-state validation and tests;
    :func:`build_two_player_payoff_matrix` already verifies the within-resolve
    zero-sum inline (no seat swap) during construction.
    """
    checked = 0
    for i, alloc_a in enumerate(allocations_a):
        for j, alloc_b in enumerate(allocations_b):
            result = resolve_profile(
                config,
                {ROW_PLAYER: state_a, COL_PLAYER: state_b},
                {ROW_PLAYER: alloc_a, COL_PLAYER: alloc_b},
                player_count=player_count,
            )
            _assert_cell_zero_sum(result, i, j)
            if player_swap:
                swapped = resolve_profile(
                    config,
                    {ROW_PLAYER: state_b, COL_PLAYER: state_a},
                    {ROW_PLAYER: alloc_b, COL_PLAYER: alloc_a},
                    player_count=player_count,
                )
                win_a = int(result.win_utility.get(ROW_PLAYER, 0))
                margin_a = int(result.margin_utility.get(ROW_PLAYER, 0))
                swap_win = int(swapped.win_utility.get(ROW_PLAYER, 0))
                swap_margin = int(swapped.margin_utility.get(ROW_PLAYER, 0))
                if swap_win != -win_a or swap_margin != -margin_a:
                    raise ZeroSumViolationError(
                        i,
                        j,
                        f"player-swap mismatch: row(orig)=(win={win_a}, margin={margin_a}) "
                        f"row(swap)=(win={swap_win}, margin={swap_margin}); "
                        f"expected row(swap) == -row(orig)",
                    )
            checked += 1
    return checked


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


def _row_behaviour_signature(matrix: PayoffMatrix, index: int) -> tuple:
    """Row-side behaviour of one row strategy against the full column set (design §9.2).

    The row player's win payoff, margin payoff, final-tie flag and Trial-award
    vector as the row strategy ``index`` faces every column strategy. Two row
    strategies are strategically equivalent (row side) iff this vector matches
    (REQ-2.1); this is the row half of the VS2 square signature and the sole
    signature the per-side row collapse groups on for a rectangular game.
    """
    n_cols = matrix.win.shape[1]
    return tuple(
        (
            int(matrix.win[index, j]),
            int(matrix.margin[index, j]),
            bool(matrix.final_tie[index, j]),
            matrix.row_award_signatures[index][j],
        )
        for j in range(n_cols)
    )


def _col_behaviour_signature(matrix: PayoffMatrix, index: int) -> tuple:
    """Column-side behaviour of one column strategy against the full row set (design §9.2).

    The row player's win payoff, margin payoff, final-tie flag and Trial-award
    vector recorded in every cell of column ``index`` as it faces every row
    strategy. Two column strategies are strategically equivalent (column side) iff
    this vector matches (REQ-2.1); this is the column half of the VS2 square
    signature and the sole signature the per-side column collapse groups on for a
    rectangular game.
    """
    n_rows = matrix.win.shape[0]
    return tuple(
        (
            int(matrix.win[r, index]),
            int(matrix.margin[r, index]),
            bool(matrix.final_tie[r, index]),
            matrix.row_award_signatures[r][index],
        )
        for r in range(n_rows)
    )


def _behaviour_signature(matrix: PayoffMatrix, index: int) -> tuple:
    """Complete row+column behaviour of one strategy (design §9.2).

    Two strategies are strategically equivalent iff this signature matches: their
    win payoff, margin payoff, final-tie flag and Trial-award vector are identical
    against every opponent, both as the row player and as the column player. This is
    exactly the pair of the per-side signatures
    (:func:`_row_behaviour_signature`, :func:`_col_behaviour_signature`), so the
    square VS2 collapse and the rectangular per-side collapse share one signature
    definition (design §5.2, "collapse lives in ``matrix.py``").
    """
    return (
        _row_behaviour_signature(matrix, index),
        _col_behaviour_signature(matrix, index),
    )


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
    shared: list[list[tuple[bool, ...]]] = [[() for _ in range(k)] for _ in range(k)]
    have_shared = bool(matrix.trial_shared_flags)
    for a, ia in enumerate(reps):
        for b, ib in enumerate(reps):
            win[a, b] = matrix.win[ia, ib]
            margin[a, b] = matrix.margin[ia, ib]
            final_tie[a, b] = matrix.final_tie[ia, ib]
            sigs[a][b] = matrix.row_award_signatures[ia][ib]
            if have_shared:
                shared[a][b] = matrix.trial_shared_flags[ia][ib]

    reduced = PayoffMatrix(
        row_strategy_ids=rep_ids,
        column_strategy_ids=rep_ids,
        win=win,
        margin=margin,
        final_tie=final_tie,
        row_award_signatures=tuple(tuple(row) for row in sigs),
        trial_ids=matrix.trial_ids,
        trial_shared_flags=tuple(tuple(row) for row in shared) if have_shared else (),
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


# --------------------------------------------------------------------------- #
# Per-side strategic-equivalence collapse (REQ-2.1; design §5.2)               #
# --------------------------------------------------------------------------- #


@dataclass(frozen=True)
class PerSideCollapseResult:
    """Independent row-side and column-side strategic-equivalence collapse (REQ-2.1).

    For a rectangular game A and B hold different states, so the row strategies and
    column strategies are different sets that must collapse **separately**, each over
    its own behaviour vectors against the opposing strategy set (design §5.2):

    * ``row_classes`` maps each row representative id to the sorted list of member
      row ids; ``row_representative_of`` maps every row id to its representative.
    * ``column_classes`` / ``column_representative_of`` are the analogous column-side
      maps.
    * ``matrix`` is the reduced rectangular payoff matrix over one row representative
      per row class (rows) and one column representative per column class (columns),
      both in ascending representative-id order (NFR-1).

    At genuine parity (``A == B``: identical row/column strategy lists over states
    that resolve identically) the row and column maps coincide with each other and
    with the single VS2 :func:`collapse_strategies`, and ``matrix`` equals the VS2
    reduced matrix byte-for-byte (design §5.2; verified on the committed parity
    fixtures).
    """

    row_classes: dict[str, list[str]]
    row_representative_of: dict[str, str]
    column_classes: dict[str, list[str]]
    column_representative_of: dict[str, str]
    matrix: PayoffMatrix

    @property
    def row_class_count(self) -> int:
        return len(self.row_classes)

    @property
    def column_class_count(self) -> int:
        return len(self.column_classes)


def _collapse_one_side(
    strategy_ids: tuple[str, ...], signature_of
) -> tuple[dict[str, list[str]], dict[str, str], list[int]]:
    """Group one side's strategy indices by behaviour signature (REQ-2.1, NFR-1).

    ``signature_of(index)`` returns the side's behaviour vector for strategy
    ``index``. Returns ``(classes, representative_of, ordered_rep_indices)`` where the
    representative of each class is the member with the lexicographically-smallest
    strategy id and ``ordered_rep_indices`` is sorted by representative id, so the
    result is independent of dict/hash iteration order (NFR-1). This is the shared
    kernel of the square VS2 collapse, applied once per side.
    """
    signature_to_members: dict[tuple, list[int]] = {}
    for i in range(len(strategy_ids)):
        sig = signature_of(i)
        signature_to_members.setdefault(sig, []).append(i)

    reps: list[int] = []
    classes: dict[str, list[str]] = {}
    representative_of: dict[str, str] = {}
    for members in signature_to_members.values():
        member_ids = sorted(strategy_ids[m] for m in members)
        rep_id = member_ids[0]
        rep_index = next(m for m in members if strategy_ids[m] == rep_id)
        reps.append(rep_index)
        classes[rep_id] = member_ids
        for mid in member_ids:
            representative_of[mid] = rep_id

    reps.sort(key=lambda idx: strategy_ids[idx])
    return classes, representative_of, reps


def collapse_strategies_per_side(matrix: PayoffMatrix) -> PerSideCollapseResult:
    """Collapse rows and columns of a rectangular matrix independently (REQ-2.1).

    Rows are grouped by :func:`_row_behaviour_signature` (their behaviour against the
    full column set) and columns by :func:`_col_behaviour_signature` (their behaviour
    against the full row set), each retaining its own representative→members map. The
    reduced matrix is the submatrix over the row representatives (rows) and the column
    representatives (columns).

    This is the rectangular generalisation of :func:`collapse_strategies` and lives in
    the same module (no second collapse implementation elsewhere; design §12). Unlike
    :func:`collapse_strategies` it does **not** require a square symmetric matrix and
    never raises on rectangular input. At genuine parity it reproduces the VS2 single
    collapse exactly (the two per-side maps coincide and ``matrix`` is byte-identical
    to the VS2 reduced matrix).
    """
    row_ids = matrix.row_strategy_ids
    col_ids = matrix.column_strategy_ids

    row_classes, row_rep_of, row_reps = _collapse_one_side(
        row_ids, lambda i: _row_behaviour_signature(matrix, i)
    )
    col_classes, col_rep_of, col_reps = _collapse_one_side(
        col_ids, lambda j: _col_behaviour_signature(matrix, j)
    )

    kr = len(row_reps)
    kc = len(col_reps)
    win = np.zeros((kr, kc), dtype=np.int64)
    margin = np.zeros((kr, kc), dtype=np.int64)
    final_tie = np.zeros((kr, kc), dtype=bool)
    sigs: list[list[tuple[int, ...]]] = [[() for _ in range(kc)] for _ in range(kr)]
    shared: list[list[tuple[bool, ...]]] = [[() for _ in range(kc)] for _ in range(kr)]
    have_shared = bool(matrix.trial_shared_flags)
    for a, ia in enumerate(row_reps):
        for b, jb in enumerate(col_reps):
            win[a, b] = matrix.win[ia, jb]
            margin[a, b] = matrix.margin[ia, jb]
            final_tie[a, b] = matrix.final_tie[ia, jb]
            sigs[a][b] = matrix.row_award_signatures[ia][jb]
            if have_shared:
                shared[a][b] = matrix.trial_shared_flags[ia][jb]

    reduced = PayoffMatrix(
        row_strategy_ids=tuple(row_ids[idx] for idx in row_reps),
        column_strategy_ids=tuple(col_ids[idx] for idx in col_reps),
        win=win,
        margin=margin,
        final_tie=final_tie,
        row_award_signatures=tuple(tuple(row) for row in sigs),
        trial_ids=matrix.trial_ids,
        trial_shared_flags=tuple(tuple(row) for row in shared) if have_shared else (),
        row_allocations=tuple(matrix.row_allocations[idx] for idx in row_reps)
        if matrix.row_allocations
        else (),
        column_allocations=tuple(matrix.column_allocations[idx] for idx in col_reps)
        if matrix.column_allocations
        else (),
    )
    return PerSideCollapseResult(
        row_classes=row_classes,
        row_representative_of=row_rep_of,
        column_classes=col_classes,
        column_representative_of=col_rep_of,
        matrix=reduced,
    )
