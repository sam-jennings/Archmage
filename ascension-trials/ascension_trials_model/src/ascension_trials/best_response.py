"""Exact, resolver-validated best-response oracles (VS3 — REQ-4, REQ-5, REQ-6).

This module is the shared home of the two best-response oracles this spec adds
(design §6): the **margin** oracle (implemented here, Task 6) and the **win**
oracle (an expected-sign ``scipy.optimize.milp``, filled by Task 7 — see the
``_best_response_win`` seam below). Both are reached through one stable entry
point, :func:`best_response`, so the double-oracle driver (VS4) never has to know
which utility or method produced a result.

Invariant that governs the whole module (design §1, Authority §1):
    **the resolver is the only payoff authority.** Every method here — the
    separability check, the exact-arithmetic dynamic program, the
    ``scipy.optimize.milp`` integer program, the exhaustive search — is a
    *search*. Its output is a candidate legal allocation that is only accepted
    after :func:`resolve_profile` (through :mod:`ascension_trials.memo`)
    independently recomputes its utility. The optimiser's internal objective is
    never reported as the result; :attr:`BestResponse.value_row_payoff` is always
    the resolver-recomputed value in the row-payoff convention (REQ-6.2).

Sign convention (design §3, REQ-6.1):
    all values are expressed in the **row-payoff convention** ``u_row(a, b) = u_A``
    (player A = row = seat ``"A"``, player B = column = seat ``"B"``). A **row**
    best response *maximises* ``sum_b y_b u_row(a, b)``; a **column** best response
    *minimises* ``sum_a x_a u_row(x_row=a, b)`` — implemented as a maximisation of
    the column player's own payoff ``-u_row`` and **negated** back to the
    row-payoff convention before it is reported (REQ-6.1). ``value_side_payoff``
    carries the acting side's own perspective (row: ``== value_row_payoff``;
    column: ``== -value_row_payoff``) and is never used as a bound un-negated.

Margin method selection (design §6.2, REQ-4):
    the margin ``u^M = r_A - r_B`` is a sum of per-Trial Recognition-Point awards.
    For a *fixed* two-player opponent each Trial's award depends only on that
    Trial's two entries, so the objective decomposes per Trial — **provided** no
    feature couples the decision across Trials. :func:`is_separable_margin` runs a
    **conservative** check (declare *coupled* whenever in doubt, Authority §4);
    when separable the oracle uses an **exact-arithmetic** dynamic program (or the
    equivalent ``scipy.optimize.milp`` knapsack IP), and when coupled it uses the
    exact **exhaustive** fallback on in-limit states (raising
    :class:`NonOptimalBestResponseError` on an intractable coupled state rather
    than emitting an unproven answer, NFR-4). Whatever the method, the assembled
    allocation is re-validated by the resolver, and a DP/knapsack optimum that
    disagrees with the resolver value (which would betray a mis-declared
    separability) raises :class:`BestResponseValidationError` (REQ-6.4).

Evidence classes (REQ-13, NFR-5):
    * :data:`EXACT_EXHAUSTIVE` — optimum proven by full enumeration (**exact**).
    * :data:`EXACT_DP` — optimum proven by an exact-arithmetic dynamic program
      (**exact**); valid only because the recurrence/objective use
      ``fractions.Fraction`` / ``int`` arithmetic, never floats (REQ-4.2).
    * :data:`NUMERICAL_MILP` — optimum found by a floating-point
      ``scipy.optimize.milp`` and certified within its gap tolerance
      (**numerical, certified — not exact**); searching the full space does not
      make a floating-point result exact (NFR-5).
"""

from __future__ import annotations

from dataclasses import dataclass
from fractions import Fraction
from typing import Iterable, Mapping, Optional

from . import legality
from .comparators import LOCAL_TRIAL_TOKENS
from .enumerate import DEFAULT_MAX_ALLOCATIONS, EnumerationLimitError, enumerate_allocations
from .matrix import COL_PLAYER, ROW_PLAYER
from .memo import ResolutionMemo
from .resolver import resolve_profile
from .schema import Allocation, Configuration, PlayerState, Trial

# --------------------------------------------------------------------------- #
# Evidence classes (REQ-13.2) and default tolerances (NFR-3)                    #
# --------------------------------------------------------------------------- #

EXACT_EXHAUSTIVE = "exact_exhaustive_best_response"
EXACT_DP = "exact_dp_best_response"
NUMERICAL_MILP = "numerical_milp_best_response_certified"

# Sides and utilities.
ROW = "row"
COLUMN = "column"
WIN = "win"
MARGIN = "margin"

# Validation / certificate tolerances. Exact methods compare exactly (rationals);
# these bound the numerical (MILP / mixture) comparisons only (NFR-3).
DEFAULT_ABS_TOL = 1e-9
DEFAULT_REL_TOL = 1e-9

# The pinned MILP backend (REQ-5.4, recorded in the certificate for the coupled /
# knapsack IP path). ``scipy.optimize.linprog`` is reserved for the continuous
# zero-sum LP and must never be used here.
MILP_BACKEND = "scipy.optimize.milp(method='highs')"


# --------------------------------------------------------------------------- #
# Errors (design §10)                                                          #
# --------------------------------------------------------------------------- #


class BestResponseValidationError(RuntimeError):
    """The optimiser's internal objective disagrees with the resolver (REQ-6.4).

    Raised when a candidate best response's optimiser value and the
    resolver-recomputed ``value_row_payoff`` differ. The comparison is **exact**
    (rational equality) whenever the optimiser objective is exact — a pure opponent
    with integer utility, or any exact-arithmetic method (exact DP, exhaustive) even
    over a mixture — and within tolerance only for the floating-point MILP over a
    mixture. For the margin DP/knapsack this is also the guard that a *mis-declared*
    separability cannot silently produce a wrong answer: if the per-Trial
    decomposition does not reconstruct the resolver's value on the assembled
    allocation, the result is refused, never emitted.
    """


class NonOptimalBestResponseError(RuntimeError):
    """Optimality is required but cannot be proven, and no exhaustive fallback fits.

    Raised when a coupled state is too large to enumerate exhaustively (the
    enumeration ceiling refuses it) so no exact best response can be certified —
    the honest failure NFR-4 demands, never an unproven "best" response.
    """


# --------------------------------------------------------------------------- #
# Opponent specification (design §4, §6.1)                                     #
# --------------------------------------------------------------------------- #


def _as_fraction(prob: object) -> Fraction:
    """Coerce a probability to an exact :class:`fractions.Fraction`.

    ``int``/``Fraction`` pass through exactly; a ``float`` is captured by its exact
    binary value (so the arithmetic downstream stays exact — the mixture is
    normalised to sum to one regardless).
    """
    if isinstance(prob, Fraction):
        return prob
    if isinstance(prob, int):
        return Fraction(prob)
    if isinstance(prob, float):
        return Fraction(prob)
    raise TypeError(f"probability must be int/float/Fraction, got {type(prob)!r}")


@dataclass(frozen=True)
class OpponentSpec:
    """A fixed opponent: a pure strategy or a mixture over strategies (design §4).

    ``support`` is a tuple of ``(allocation, probability)`` pairs whose
    probabilities are exact :class:`fractions.Fraction`\\s summing to one. For a
    row best response the opponent allocations are the **column** player's; for a
    column best response they are the **row** player's. The allocation objects'
    ``player_id`` is irrelevant — the oracle seats each allocation on the correct
    seat itself.
    """

    support: tuple[tuple[Allocation, Fraction], ...]

    @classmethod
    def pure(cls, allocation: Allocation) -> "OpponentSpec":
        """A pure opponent playing ``allocation`` with probability one."""
        return cls(((allocation, Fraction(1)),))

    @classmethod
    def mixture(cls, entries: Iterable[tuple[Allocation, object]]) -> "OpponentSpec":
        """A mixture from ``(allocation, probability)`` pairs (normalised to sum 1)."""
        pairs = [(alloc, _as_fraction(prob)) for alloc, prob in entries]
        if not pairs:
            raise ValueError("opponent mixture needs at least one allocation")
        total = sum((p for _, p in pairs), Fraction(0))
        if total <= 0:
            raise ValueError("opponent mixture probabilities must sum to a positive value")
        return cls(tuple((alloc, prob / total) for alloc, prob in pairs))

    @classmethod
    def uniform(cls, allocations: Iterable[Allocation]) -> "OpponentSpec":
        """A uniform mixture over ``allocations``."""
        allocs = list(allocations)
        if not allocs:
            raise ValueError("uniform mixture needs at least one allocation")
        prob = Fraction(1, len(allocs))
        return cls(tuple((alloc, prob) for alloc in allocs))

    @property
    def is_pure(self) -> bool:
        return len(self.support) == 1 and self.support[0][1] == 1

    @property
    def allocations(self) -> tuple[Allocation, ...]:
        return tuple(alloc for alloc, _ in self.support)


# --------------------------------------------------------------------------- #
# Certificate and result types (design §4)                                     #
# --------------------------------------------------------------------------- #


@dataclass(frozen=True)
class BestResponseCertificate:
    """Machine-checkable evidence bounding a best response's optimality (REQ-6.3).

    Fields follow design §4. ``solver_objective_bound`` is in the **row-payoff
    convention**: a row BR carries an **upper** bound on ``max_a u_row(a, y)``, a
    column BR a **lower** bound on ``min_b u_row(x, b)``. For the exact methods
    (exhaustive, exact DP) the bound coincides with the resolver-recomputed
    incumbent and the gap is zero; for the MILP the bound is the solver's certified
    objective bound and the gap/relative gap are its optimality certificate.
    """

    method: str  # "exhaustive" | "exact_dp" | "milp"
    optimal: bool  # True iff optimality is proven / certified within tolerance
    resolver_incumbent_value: float  # resolver-recomputed value of the incumbent (row-payoff)
    solver_objective_bound: float  # certified objective bound (row-payoff convention)
    absolute_optimality_gap: float  # |incumbent - bound|
    relative_mip_gap: Optional[float]  # MILP relative gap; None for exact methods
    solver_status: Optional[str]  # backend status, e.g. HiGHS "Optimal"
    tolerances: Mapping[str, float]
    proof: Mapping[str, object]  # method-specific, re-checkable witness (design §6.4)

    def to_dict(self) -> dict:
        return {
            "method": self.method,
            "optimal": self.optimal,
            "resolver_incumbent_value": self.resolver_incumbent_value,
            "solver_objective_bound": self.solver_objective_bound,
            "absolute_optimality_gap": self.absolute_optimality_gap,
            "relative_mip_gap": self.relative_mip_gap,
            "solver_status": self.solver_status,
            "tolerances": dict(self.tolerances),
            "proof": dict(self.proof),
        }


@dataclass(frozen=True)
class BestResponse:
    """A resolver-validated best response (design §4).

    ``value_row_payoff`` is authoritative (resolver-recomputed, row-payoff
    convention). ``allocation`` is an exact, legal allocation with explicit residue
    (REQ-4.5). ``certificate`` and ``evidence_class`` record how optimality was
    established (REQ-6.3, REQ-13).
    """

    side: str  # "row" (A) or "column" (B)
    utility: str  # "win" | "margin"
    opponent: OpponentSpec
    allocation: Allocation
    value_row_payoff: float  # AUTHORITATIVE: resolver-recomputed, row-payoff convention
    value_side_payoff: Optional[float]  # acting side's own perspective
    certificate: BestResponseCertificate
    evidence_class: str

    def to_dict(self) -> dict:
        return {
            "side": self.side,
            "utility": self.utility,
            "value_row_payoff": self.value_row_payoff,
            "value_side_payoff": self.value_side_payoff,
            "evidence_class": self.evidence_class,
            "certificate": self.certificate.to_dict(),
        }


# --------------------------------------------------------------------------- #
# Seat / utility helpers (design §3)                                           #
# --------------------------------------------------------------------------- #


def _acting_seat(side: str) -> str:
    return ROW_PLAYER if side == ROW else COL_PLAYER


def _opponent_seat(side: str) -> str:
    return COL_PLAYER if side == ROW else ROW_PLAYER


def _validate_states(states: Mapping[str, PlayerState]) -> None:
    if ROW_PLAYER not in states or COL_PLAYER not in states:
        raise ValueError(
            f"states must carry both seats {ROW_PLAYER!r} and {COL_PLAYER!r}; got {sorted(states)}"
        )


def _row_utility(
    config: Configuration,
    state_a: PlayerState,
    state_b: PlayerState,
    alloc_a: Allocation,
    alloc_b: Allocation,
    utility: str,
    resolve,
    player_count: int,
) -> int:
    """Resolver-recomputed **row** (player A) utility for a full profile (REQ-6.2)."""
    result = resolve(
        config,
        {ROW_PLAYER: state_a, COL_PLAYER: state_b},
        {ROW_PLAYER: alloc_a, COL_PLAYER: alloc_b},
        player_count,
    )
    if utility == WIN:
        return int(result.win_utility.get(ROW_PLAYER, 0))
    return int(result.margin_utility.get(ROW_PLAYER, 0))


def _expected_row_value(
    config: Configuration,
    states: Mapping[str, PlayerState],
    side: str,
    utility: str,
    candidate: Allocation,
    opponent: OpponentSpec,
    resolve,
    player_count: int,
) -> Fraction:
    """Exact expected **row-payoff** of ``candidate`` against ``opponent`` (REQ-6.2).

    The acting side is seated on its own seat and the opponent allocations on the
    opposing seat, so ``u_row`` is always read from player A's utility. Uses exact
    :class:`fractions.Fraction` arithmetic over the (rational) mixture weights.
    """
    state_a = states[ROW_PLAYER]
    state_b = states[COL_PLAYER]
    total = Fraction(0)
    for opp_alloc, prob in opponent.support:
        if side == ROW:
            u = _row_utility(config, state_a, state_b, candidate, opp_alloc, utility, resolve, player_count)
        else:
            u = _row_utility(config, state_a, state_b, opp_alloc, candidate, utility, resolve, player_count)
        total += prob * u
    return total


def _own_from_row(side: str, row_value: Fraction) -> Fraction:
    """Acting side's own objective from a row-payoff value (row: as-is; column: negate)."""
    return row_value if side == ROW else -row_value


# --------------------------------------------------------------------------- #
# Conservative separability check (design §6.2, REQ-4.2/4.3, Authority §4)      #
# --------------------------------------------------------------------------- #


@dataclass(frozen=True)
class SeparabilityResult:
    """The verdict of the conservative margin separability check (design §6.2)."""

    separable: bool
    reasons: tuple[str, ...]  # why it was declared coupled (empty when separable)

    def __bool__(self) -> bool:  # allow ``if separability:``
        return self.separable


def is_separable_margin(
    config: Configuration, player_count: int = 2
) -> SeparabilityResult:
    """Is the margin objective safely decomposable per Trial for this config?

    The margin ``r_A - r_B`` is always a sum of per-Trial awards, but a per-Trial
    dynamic program is valid **only** when nothing couples the decision across
    Trials (design §6.2). This check is deliberately **conservative** — it declares
    *coupled* whenever any of the following features is present, even if a given
    instance might turn out separable (Authority §4):

    * ``player_count != 2`` — the margin utility is a two-player quantity.
    * completion policy other than ``optional`` — MAXIMAL / FULL couple the whole
      allocation's legality across Trials (the residue of one Trial constrains
      another).
    * a Trial tiebreak that is **not** a preferred-local token — the historical
      ratio comparators (``legacy_focus`` etc.) deliberately divide by power
      *outside* the contested Trial (:mod:`ascension_trials.comparators`), so a
      Trial's award then depends on the cross-Trial allocation total.
    * ``suppress_lower_on_shared_first`` on any active Trial — a shared-award rule
      that reaches across placement groups.
    * an active final Spellbook tiebreak (any ``final_tiebreaks`` token other than
      ``shared``) — flagged coupled per Authority §4, even though the margin value
      itself is decided purely by summed Recognition Points.

    A separable verdict is still **verified** downstream: the DP-assembled
    allocation is re-validated by the resolver and any decomposition error raises
    :class:`BestResponseValidationError` (REQ-6.4), so this check only needs to be
    *sound* (never call a genuinely coupled config separable), which the
    conservative rules above guarantee.
    """
    reasons: list[str] = []
    if player_count != 2:
        reasons.append(f"player_count={player_count} (margin is a two-player utility)")
    if config.allocation.completion != "optional":
        reasons.append(
            f"completion policy {config.allocation.completion!r} couples allocation legality "
            "across Trials"
        )
    active = config.active_trials(player_count)
    allowed_tokens = LOCAL_TRIAL_TOKENS | {"shared"}
    for trial in active:
        non_local = [tok for tok in trial.trial_tiebreaks if tok not in allowed_tokens]
        if non_local:
            reasons.append(
                f"trial {trial.id!r} uses non-local tiebreak tokens {non_local} "
                "(cross-Trial / state-dependent)"
            )
        if trial.suppress_lower_on_shared_first:
            reasons.append(
                f"trial {trial.id!r} suppresses the lower place on a shared first (shared-award coupling)"
            )
    active_final = [tok for tok in config.final_tiebreaks if tok != "shared"]
    if active_final:
        reasons.append(
            f"active final Spellbook tiebreak {active_final} (Authority §4 conservative coupling)"
        )
    return SeparabilityResult(separable=not reasons, reasons=tuple(reasons))


# --------------------------------------------------------------------------- #
# Per-Trial candidate entries and their exact margin contribution              #
# --------------------------------------------------------------------------- #


@dataclass(frozen=True)
class _TrialEntry:
    """One candidate per-Trial entry for the acting side, with its exact score.

    ``normal`` maps domain -> positive count on this Trial; ``wild`` is the Wild
    on this Trial. ``usage`` is the resource consumption vector aligned to the DP's
    resource order, ``wild_usage`` the Wild consumption. ``g`` is the exact
    expected per-Trial margin contribution (acting − opponent), a
    :class:`fractions.Fraction`.
    """

    normal: tuple[tuple[str, int], ...]
    wild: int
    usage: tuple[int, ...]
    wild_usage: int
    g: Fraction

    @property
    def is_empty(self) -> bool:
        return not self.normal and self.wild == 0


def _domain_usage_combos(
    resource_names: tuple[str, ...], budgets: Mapping[str, int]
) -> list[dict[str, int]]:
    """Every per-domain count map with ``0 <= count[d] <= budgets[d]`` (deterministic)."""
    combos: list[dict[str, int]] = [{}]
    for dom in resource_names:
        expanded: list[dict[str, int]] = []
        for base in combos:
            for count in range(budgets[dom] + 1):
                nxt = dict(base)
                if count > 0:
                    nxt[dom] = count
                expanded.append(nxt)
        combos = expanded
    return combos


def _trial_contribution(
    config: Configuration,
    states: Mapping[str, PlayerState],
    side: str,
    trial: Trial,
    normal: dict[str, int],
    wild: int,
    opponent: OpponentSpec,
    resolve,
    player_count: int,
) -> Fraction:
    """Exact expected per-Trial margin contribution of one acting entry (design §6.2).

    Resolves a profile in which the acting side plays ``(normal, wild)`` **only on
    ``trial``** against each opponent allocation, reads the Recognition-Point award
    to the acting side and the opponent on that Trial, and returns the
    mixture-weighted difference ``sum_b y_b (award_acting - award_opp)``. Because a
    Trial's award depends only on that Trial's two entries (under the separability
    conditions), this isolated per-Trial award equals the award in the full
    allocation — an equality the caller re-verifies via the resolver.
    """
    acting_seat = _acting_seat(side)
    opp_seat = _opponent_seat(side)
    acting_alloc = Allocation(
        player_id=acting_seat,
        normal={trial.id: dict(normal)} if normal else {},
        wild={trial.id: wild} if wild else {},
    )
    total = Fraction(0)
    for opp_alloc, prob in opponent.support:
        allocations = {acting_seat: acting_alloc, opp_seat: opp_alloc}
        result = resolve(
            config,
            {ROW_PLAYER: states[ROW_PLAYER], COL_PLAYER: states[COL_PLAYER]},
            {ROW_PLAYER: allocations[ROW_PLAYER], COL_PLAYER: allocations[COL_PLAYER]},
            player_count,
        )
        tr = next((t for t in result.trial_results if t.trial_id == trial.id), None)
        award_acting = tr.rewards_awarded.get(acting_seat, 0) if tr is not None else 0
        award_opp = tr.rewards_awarded.get(opp_seat, 0) if tr is not None else 0
        total += prob * (award_acting - award_opp)
    return total


def _scored_trial_entries(
    config: Configuration,
    states: Mapping[str, PlayerState],
    side: str,
    trial: Trial,
    resource_names: tuple[str, ...],
    budgets: Mapping[str, int],
    wild_avail: int,
    opponent: OpponentSpec,
    resolve,
    player_count: int,
) -> list[_TrialEntry]:
    """All legal per-Trial acting entries (plus the skip entry) scored by margin."""
    entries: list[_TrialEntry] = []
    for normal in _domain_usage_combos(resource_names, budgets):
        for wild in range(wild_avail + 1):
            normal_total = sum(normal.values())
            if normal_total == 0 and wild == 0:
                # The "skip" choice: the acting side does not enter this Trial.
                legal = True
            else:
                legal, _reason = legality.entry_is_legal(
                    config, trial, dict(normal), player_count, wild=wild
                )
            if not legal:
                continue
            g = _trial_contribution(
                config, states, side, trial, normal, wild, opponent, resolve, player_count
            )
            entries.append(
                _TrialEntry(
                    normal=tuple(sorted(normal.items())),
                    wild=wild,
                    usage=tuple(normal.get(d, 0) for d in resource_names),
                    wild_usage=wild,
                    g=g,
                )
            )
    entries.sort(key=lambda e: (e.usage, e.wild_usage, e.normal))
    return entries


def _resources(
    config: Configuration, acting_state: PlayerState
) -> tuple[tuple[str, ...], dict[str, int], int]:
    """Resource order, per-domain budgets and the Wild budget for the acting side."""
    budgets = {d: p for d, p in sorted(acting_state.normal_power.items()) if p > 0}
    resource_names = tuple(budgets)
    wild_avail = acting_state.wild_power if config.wild.enabled else 0
    return resource_names, budgets, wild_avail


def _assemble_allocation(
    acting_seat: str,
    acting_state: PlayerState,
    active_trials: list[Trial],
    chosen: tuple[_TrialEntry, ...],
    resource_names: tuple[str, ...],
    budgets: Mapping[str, int],
    wild_avail: int,
) -> Allocation:
    """Assemble the acting side's full legal allocation with explicit residue (REQ-4.5)."""
    normal: dict[str, dict[str, int]] = {}
    wild: dict[str, int] = {}
    used: dict[str, int] = {d: 0 for d in resource_names}
    used_wild = 0
    for trial, entry in zip(active_trials, chosen):
        entry_normal = {d: c for d, c in entry.normal if c > 0}
        if entry_normal:
            normal[trial.id] = entry_normal
            for d, c in entry_normal.items():
                used[d] = used.get(d, 0) + c
        if entry.wild > 0:
            wild[trial.id] = entry.wild
            used_wild += entry.wild
    residue_normal = {
        d: budgets[d] - used.get(d, 0) for d in resource_names if budgets[d] - used.get(d, 0) > 0
    }
    residue_wild = max(wild_avail - used_wild, 0)
    return Allocation(
        player_id=acting_seat,
        normal=normal,
        wild=wild,
        residue_normal=residue_normal,
        residue_wild=residue_wild,
    )


# --------------------------------------------------------------------------- #
# Exact-arithmetic dynamic program (separable margin, REQ-4.2)                  #
# --------------------------------------------------------------------------- #


def _margin_dp(
    config: Configuration,
    states: Mapping[str, PlayerState],
    side: str,
    opponent: OpponentSpec,
    resolve,
    player_count: int,
) -> tuple[Allocation, Fraction, dict]:
    """Solve the separable margin best response by an exact-arithmetic DP (REQ-4.2).

    Chooses one legal entry per active Trial to maximise the summed exact per-Trial
    margin contribution, subject to the shared per-domain and Wild budgets (a
    bounded multi-dimensional integer knapsack). All arithmetic is
    :class:`fractions.Fraction` / ``int`` — that exactness is what earns the
    :data:`EXACT_DP` evidence class. Returns the assembled allocation, the exact
    **own** objective (acting side's expected margin) and a re-checkable proof.
    """
    acting_seat = _acting_seat(side)
    acting_state = states[acting_seat]
    active_trials = sorted(config.active_trials(player_count), key=lambda t: t.id)
    resource_names, budgets, wild_avail = _resources(config, acting_state)

    trial_entries = [
        _scored_trial_entries(
            config, states, side, trial, resource_names, budgets, wild_avail,
            opponent, resolve, player_count,
        )
        for trial in active_trials
    ]

    n_res = len(resource_names)
    memo_dp: dict[tuple, tuple[Fraction, tuple[_TrialEntry, ...]]] = {}

    def solve(idx: int, budget: tuple[int, ...]) -> tuple[Fraction, tuple[_TrialEntry, ...]]:
        if idx == len(active_trials):
            return (Fraction(0), ())
        key = (idx, budget)
        cached = memo_dp.get(key)
        if cached is not None:
            return cached
        best: Optional[tuple[Fraction, tuple[_TrialEntry, ...]]] = None
        for entry in trial_entries[idx]:
            if any(entry.usage[i] > budget[i] for i in range(n_res)):
                continue
            if entry.wild_usage > budget[n_res]:
                continue
            new_budget = tuple(budget[i] - entry.usage[i] for i in range(n_res)) + (
                budget[n_res] - entry.wild_usage,
            )
            sub_val, sub_choice = solve(idx + 1, new_budget)
            val = entry.g + sub_val
            if best is None or val > best[0]:
                best = (val, (entry,) + sub_choice)
        # The skip entry always fits, so ``best`` is never None.
        assert best is not None
        memo_dp[key] = best
        return best

    init_budget = tuple(budgets[d] for d in resource_names) + (wild_avail,)
    best_val, chosen = solve(0, init_budget)
    allocation = _assemble_allocation(
        acting_seat, acting_state, active_trials, chosen, resource_names, budgets, wild_avail
    )
    proof = {
        "separable": True,
        "resources": list(resource_names),
        "wild_budget": wild_avail,
        "per_trial_choice": {
            trial.id: {"normal": dict(entry.normal), "wild": entry.wild, "g": str(entry.g)}
            for trial, entry in zip(active_trials, chosen)
        },
        "dp_own_objective": str(best_val),
    }
    return allocation, best_val, proof


# --------------------------------------------------------------------------- #
# scipy.optimize.milp knapsack (separable margin IP, REQ-4.4)                   #
# --------------------------------------------------------------------------- #


def _margin_milp(
    config: Configuration,
    states: Mapping[str, PlayerState],
    side: str,
    opponent: OpponentSpec,
    resolve,
    player_count: int,
) -> tuple[Allocation, Fraction, dict, "MilpDiagnostics"]:
    """Solve the separable margin best response as a ``scipy.optimize.milp`` IP.

    A "small IP" alternative to the DP for the separable case (design §6.2): a
    binary entry-selection variable per (Trial, candidate entry), one
    choose-exactly-one constraint per Trial and one capacity constraint per
    resource (domain / Wild). The objective is the summed per-Trial margin
    contribution. The float HiGHS solve is a *search*: the selected entries are
    re-scored with exact :class:`fractions.Fraction` arithmetic and the assembled
    allocation is resolver-recomputed, so the reported value stays exact even
    though the evidence class is :data:`NUMERICAL_MILP` (not exact, NFR-5).
    """
    import numpy as np
    from scipy.optimize import Bounds, LinearConstraint, milp

    acting_seat = _acting_seat(side)
    acting_state = states[acting_seat]
    active_trials = sorted(config.active_trials(player_count), key=lambda t: t.id)
    resource_names, budgets, wild_avail = _resources(config, acting_state)

    trial_entries = [
        _scored_trial_entries(
            config, states, side, trial, resource_names, budgets, wild_avail,
            opponent, resolve, player_count,
        )
        for trial in active_trials
    ]

    # Flatten (trial_idx, entry_idx) -> variable column.
    var_of: dict[tuple[int, int], int] = {}
    columns: list[tuple[int, int]] = []
    for t_idx, entries in enumerate(trial_entries):
        for e_idx in range(len(entries)):
            var_of[(t_idx, e_idx)] = len(columns)
            columns.append((t_idx, e_idx))
    n_vars = len(columns)

    # Objective: maximise sum g*x  ->  minimise sum (-g)*x.
    c = np.zeros(n_vars, dtype=float)
    for (t_idx, e_idx), col in var_of.items():
        c[col] = -float(trial_entries[t_idx][e_idx].g)

    constraints = []
    # Choose exactly one entry per Trial.
    for t_idx, entries in enumerate(trial_entries):
        row = np.zeros(n_vars, dtype=float)
        for e_idx in range(len(entries)):
            row[var_of[(t_idx, e_idx)]] = 1.0
        constraints.append(LinearConstraint(row, 1.0, 1.0))
    # Capacity per resource (domain then Wild).
    for r_idx, dom in enumerate(resource_names):
        row = np.zeros(n_vars, dtype=float)
        for (t_idx, e_idx), col in var_of.items():
            row[col] = float(trial_entries[t_idx][e_idx].usage[r_idx])
        constraints.append(LinearConstraint(row, -np.inf, float(budgets[dom])))
    if wild_avail > 0:
        row = np.zeros(n_vars, dtype=float)
        for (t_idx, e_idx), col in var_of.items():
            row[col] = float(trial_entries[t_idx][e_idx].wild_usage)
        constraints.append(LinearConstraint(row, -np.inf, float(wild_avail)))

    integrality = np.ones(n_vars, dtype=int)
    bounds = Bounds(np.zeros(n_vars), np.ones(n_vars))
    res = milp(c, constraints=constraints, integrality=integrality, bounds=bounds)

    if not getattr(res, "success", False) or res.x is None:
        raise NonOptimalBestResponseError(
            f"margin MILP did not solve to optimality: status={getattr(res, 'status', None)}, "
            f"message={getattr(res, 'message', None)!r}"
        )

    x = np.asarray(res.x, dtype=float)
    chosen: list[_TrialEntry] = []
    for t_idx, entries in enumerate(trial_entries):
        picked = [e_idx for e_idx in range(len(entries)) if x[var_of[(t_idx, e_idx)]] > 0.5]
        if len(picked) != 1:
            raise NonOptimalBestResponseError(
                f"margin MILP selected {len(picked)} entries on trial index {t_idx} (expected 1)"
            )
        chosen.append(entries[picked[0]])

    own_value = sum((entry.g for entry in chosen), Fraction(0))
    allocation = _assemble_allocation(
        acting_seat, acting_state, active_trials, tuple(chosen), resource_names, budgets, wild_avail
    )

    # HiGHS diagnostics. The dual bound is on the MINIMISATION objective (-own);
    # negate it to an upper bound on the own objective.
    dual_bound = getattr(res, "mip_dual_bound", None)
    own_upper_bound = -float(dual_bound) if dual_bound is not None else float(own_value)
    rel_gap = getattr(res, "mip_gap", None)
    diagnostics = MilpDiagnostics(
        status=str(getattr(res, "message", "")),
        success=bool(res.success),
        own_upper_bound=own_upper_bound,
        relative_gap=float(rel_gap) if rel_gap is not None else None,
        n_vars=n_vars,
    )
    proof = {
        "separable": True,
        "backend": MILP_BACKEND,
        "options": {"integrality": "binary", "presolve": "default"},
        "resources": list(resource_names),
        "wild_budget": wild_avail,
        "variables": n_vars,
        "mip_dual_bound": None if dual_bound is None else float(dual_bound),
        "per_trial_choice": {
            trial.id: {"normal": dict(entry.normal), "wild": entry.wild, "g": str(entry.g)}
            for trial, entry in zip(active_trials, chosen)
        },
    }
    return allocation, own_value, proof, diagnostics


@dataclass(frozen=True)
class MilpDiagnostics:
    status: str
    success: bool
    own_upper_bound: float
    relative_gap: Optional[float]
    n_vars: int


# --------------------------------------------------------------------------- #
# Exhaustive search (any margin case, in-limit, REQ-4.3)                        #
# --------------------------------------------------------------------------- #


def _margin_exhaustive(
    config: Configuration,
    states: Mapping[str, PlayerState],
    side: str,
    opponent: OpponentSpec,
    resolve,
    player_count: int,
    max_allocations: int,
) -> tuple[Allocation, Fraction, dict]:
    """Exact best response by full enumeration of the acting side's legal space.

    Enumerates every legal allocation (:func:`enumerate_allocations`), scores each
    by its exact expected row-payoff, and keeps the argmax of the acting side's own
    objective (row: maximise the row-payoff; column: maximise ``-row-payoff``).
    Deterministic tie-break: enumeration is canonically ordered and the first
    strict maximum wins (NFR-1). Raises :class:`EnumerationLimitError` (surfaced by
    the caller as :class:`NonOptimalBestResponseError`) when the space is too large.
    """
    acting_state = states[_acting_seat(side)]
    allocations = enumerate_allocations(
        config, acting_state, player_count, max_allocations=max_allocations
    )
    best_alloc: Optional[Allocation] = None
    best_own: Optional[Fraction] = None
    for candidate in allocations:
        row_value = _expected_row_value(
            config, states, side, MARGIN, candidate, opponent, resolve, player_count
        )
        own = _own_from_row(side, row_value)
        if best_own is None or own > best_own:
            best_own = own
            best_alloc = candidate
    assert best_alloc is not None and best_own is not None
    proof = {"candidates_enumerated": len(allocations)}
    return best_alloc, best_own, proof


# --------------------------------------------------------------------------- #
# Resolver re-validation + certificate assembly (design §6.1 steps 1–4)         #
# --------------------------------------------------------------------------- #


def _finalize_best_response(
    config: Configuration,
    states: Mapping[str, PlayerState],
    side: str,
    utility: str,
    opponent: OpponentSpec,
    candidate: Allocation,
    optimizer_own_objective: Fraction,
    *,
    method: str,
    evidence_class: str,
    solver_status: Optional[str],
    resolve,
    player_count: int,
    proof: dict,
    relative_mip_gap: Optional[float] = None,
    solver_objective_bound_own: Optional[float] = None,
    tolerances: Optional[Mapping[str, float]] = None,
) -> BestResponse:
    """Re-validate a candidate with the resolver and build the certified result.

    Implements design §6.1 steps 2–4: recompute ``u_row(candidate, opponent)`` with
    the resolver, set the authoritative ``value_row_payoff``, raise
    :class:`BestResponseValidationError` if the optimiser's objective disagrees
    beyond tolerance, and attach a :class:`BestResponseCertificate` in the
    row-payoff convention.
    """
    resolver_row = _expected_row_value(
        config, states, side, utility, candidate, opponent, resolve, player_count
    )
    resolver_own = _own_from_row(side, resolver_row)

    # Step 3 — optimiser vs resolver agreement (REQ-6.4). The comparison is **exact**
    # whenever the optimiser's own objective is an exact rational — a pure opponent
    # (integer utility) OR any exact-arithmetic method (exact DP, exhaustive), whose
    # objective is a ``fractions.Fraction`` assembled without floating point (REQ-4.2,
    # NFR-5). Only the floating-point MILP over a *mixture* is checked within tolerance;
    # tying the check's strictness to the exactness claim means an "exact" evidence
    # class cannot be emitted on a sub-tolerance decomposition error.
    method_is_exact = evidence_class in (EXACT_DP, EXACT_EXHAUSTIVE)
    exact_check = opponent.is_pure or method_is_exact
    if exact_check:
        if optimizer_own_objective != resolver_own:
            basis = "pure opponent" if opponent.is_pure else f"exact method {evidence_class!r}"
            raise BestResponseValidationError(
                f"{method} best response: optimiser own-objective {optimizer_own_objective} "
                f"!= resolver-recomputed {resolver_own} ({basis}, exact check)"
            )
    else:
        if abs(float(optimizer_own_objective) - float(resolver_own)) > DEFAULT_ABS_TOL:
            raise BestResponseValidationError(
                f"{method} best response: optimiser own-objective {float(optimizer_own_objective)} "
                f"!= resolver-recomputed {float(resolver_own)} beyond tolerance {DEFAULT_ABS_TOL}"
            )

    value_row = float(resolver_row)
    value_side = float(resolver_own)

    # Certificate objective bound in the ROW-PAYOFF convention (design §4):
    #   row BR    -> UPPER bound on max_a u_row(a, y)
    #   column BR -> LOWER bound on min_b u_row(x, b)
    if solver_objective_bound_own is None:
        # Exact methods: the bound coincides with the incumbent (gap 0).
        own_bound = float(resolver_own)
    else:
        own_bound = float(solver_objective_bound_own)
    solver_objective_bound = own_bound if side == ROW else -own_bound
    absolute_gap = abs(own_bound - float(resolver_own))
    optimal = absolute_gap <= DEFAULT_ABS_TOL and (
        relative_mip_gap is None or relative_mip_gap <= DEFAULT_REL_TOL
    )

    tol = dict(tolerances) if tolerances is not None else {
        "absolute": DEFAULT_ABS_TOL,
        "relative": DEFAULT_REL_TOL,
    }
    full_proof = dict(proof)
    full_proof["resolver_own_objective"] = str(resolver_own)
    full_proof["resolver_row_value"] = str(resolver_row)

    certificate = BestResponseCertificate(
        method=method,
        optimal=optimal,
        resolver_incumbent_value=value_row,
        solver_objective_bound=solver_objective_bound,
        absolute_optimality_gap=absolute_gap,
        relative_mip_gap=relative_mip_gap,
        solver_status=solver_status,
        tolerances=tol,
        proof=full_proof,
    )
    return BestResponse(
        side=side,
        utility=utility,
        opponent=opponent,
        allocation=candidate,
        value_row_payoff=value_row,
        value_side_payoff=value_side,
        certificate=certificate,
        evidence_class=evidence_class,
    )


# --------------------------------------------------------------------------- #
# Margin best response driver (REQ-4)                                          #
# --------------------------------------------------------------------------- #


def _best_response_margin(
    config: Configuration,
    states: Mapping[str, PlayerState],
    side: str,
    opponent: OpponentSpec,
    *,
    method: str,
    player_count: int,
    memo: ResolutionMemo,
    max_allocations: int,
) -> BestResponse:
    """Margin best response: separability-aware exact DP / IP / exhaustive (REQ-4)."""
    resolve = memo.resolve
    separability = is_separable_margin(config, player_count)

    if method == "auto":
        chosen = "dp" if separability.separable else "exhaustive"
    else:
        chosen = method

    if chosen == "dp":
        if not separability.separable:
            raise ValueError(
                "method='dp' requires a separable config; separability check reported coupled: "
                f"{separability.reasons}"
            )
        allocation, own, proof = _margin_dp(config, states, side, opponent, resolve, player_count)
        proof["separability_reasons"] = list(separability.reasons)
        return _finalize_best_response(
            config, states, side, MARGIN, opponent, allocation, own,
            method="exact_dp", evidence_class=EXACT_DP, solver_status="exact_dp_optimal",
            resolve=resolve, player_count=player_count, proof=proof,
        )

    if chosen == "milp":
        if not separability.separable:
            raise ValueError(
                "method='milp' here solves the separable knapsack IP; separability check "
                f"reported coupled: {separability.reasons}. Use method='exhaustive' for coupled states."
            )
        allocation, own, proof, diag = _margin_milp(
            config, states, side, opponent, resolve, player_count
        )
        proof["separability_reasons"] = list(separability.reasons)
        return _finalize_best_response(
            config, states, side, MARGIN, opponent, allocation, own,
            method="milp", evidence_class=NUMERICAL_MILP, solver_status=diag.status,
            resolve=resolve, player_count=player_count, proof=proof,
            relative_mip_gap=diag.relative_gap,
            solver_objective_bound_own=diag.own_upper_bound,
            tolerances={
                "absolute": DEFAULT_ABS_TOL,
                "relative": DEFAULT_REL_TOL,
                "milp_relative_gap": DEFAULT_REL_TOL,
            },
        )

    if chosen == "exhaustive":
        try:
            allocation, own, proof = _margin_exhaustive(
                config, states, side, opponent, resolve, player_count, max_allocations
            )
        except EnumerationLimitError as exc:
            raise NonOptimalBestResponseError(
                "margin best response cannot be certified: the coupled state's legal allocation "
                f"space exceeds the enumeration ceiling ({exc}); no exhaustive fallback fits"
            ) from exc
        proof["separable"] = separability.separable
        proof["separability_reasons"] = list(separability.reasons)
        return _finalize_best_response(
            config, states, side, MARGIN, opponent, allocation, own,
            method="exhaustive", evidence_class=EXACT_EXHAUSTIVE,
            solver_status="exhaustive_enumeration",
            resolve=resolve, player_count=player_count, proof=proof,
        )

    raise ValueError(f"unknown margin best-response method {method!r}")


# --------------------------------------------------------------------------- #
# Win best response — extension seam for Task 7 (design §6.3, REQ-5)            #
# --------------------------------------------------------------------------- #


def _best_response_win(
    config: Configuration,
    states: Mapping[str, PlayerState],
    side: str,
    opponent: OpponentSpec,
    *,
    method: str,
    player_count: int,
    memo: ResolutionMemo,
    max_allocations: int,
) -> BestResponse:
    """Win best response via the expected-sign ``scipy.optimize.milp`` (design §6.3, REQ-5).

    The win utility is a **global sign** (A's total Recognition Points versus B's,
    with the final Spellbook tiebreak deciding an RP tie), *not* an additive
    per-Trial quantity, so a per-domain dynamic program is prohibited as the
    primary oracle (REQ-5.1). The primary oracle is an expected-sign MILP
    (:func:`_win_milp`): binary win/tie/loss indicators for each opponent in the
    support, linked by big-M constraints to the sign of ``r_A(b) - r_B(b)`` and,
    on an RP tie, to the final-result tiebreak, over a feasible region that is
    exactly A's legal allocations (per-Trial legal-entry selection + ledger
    capacity). It maximises ``sum_b y_b (win_b - loss_b)`` in the acting side's own
    objective (row maximises, column maximises its own ``-u_row``).

    ``method`` routing (design §6.3, REQ-5.6, NFR-4):
      * ``"auto"`` — the MILP when the config is faithfully modelable
        (:func:`_win_milp_modelable`), otherwise the exact exhaustive fallback;
      * ``"milp"`` — force the MILP (requires a modelable config);
      * ``"exhaustive"`` — force exact enumeration.

    Whatever method is used the incumbent is re-validated by the resolver
    (:func:`_finalize_best_response`) and the reported value is the
    resolver-recomputed ``value_row_payoff``. When the MILP cannot certify
    optimality (non-optimal status or gap above tolerance) it does **not** emit an
    unproven "best": it falls back to exhaustive search on tractable states and
    raises :class:`NonOptimalBestResponseError` on intractable ones (REQ-5.6). The
    MILP result carries the :data:`NUMERICAL_MILP` evidence class — a full-space
    search does not make a floating-point optimum exact (NFR-5).
    """
    resolve = memo.resolve
    modelable, reasons = _win_milp_modelable(config, player_count)

    chosen = ("milp" if modelable else "exhaustive") if method == "auto" else method

    if chosen == "milp":
        if not modelable:
            raise ValueError(
                "method='milp' requires a MILP-modelable win config; the win-MILP modelability "
                f"check reported it non-modelable: {reasons}. Use method='exhaustive' for such states."
            )
        try:
            allocation, own, proof, diag = _win_milp(
                config, states, side, opponent, resolve, player_count
            )
        except _WinMilpUncertified as exc:
            return _win_fallback_exhaustive(
                config, states, side, opponent, resolve, player_count,
                max_allocations, milp_reason=str(exc),
            )
        proof["modelable"] = True
        proof["modelable_reasons"] = list(reasons)
        return _finalize_best_response(
            config, states, side, WIN, opponent, allocation, own,
            method="milp", evidence_class=NUMERICAL_MILP, solver_status=diag.status,
            resolve=resolve, player_count=player_count, proof=proof,
            relative_mip_gap=diag.relative_gap,
            solver_objective_bound_own=diag.own_upper_bound,
            tolerances={
                "absolute": DEFAULT_ABS_TOL,
                "relative": DEFAULT_REL_TOL,
                "milp_relative_gap": DEFAULT_REL_TOL,
            },
        )

    if chosen == "exhaustive":
        return _win_fallback_exhaustive(
            config, states, side, opponent, resolve, player_count,
            max_allocations, milp_reason=None,
        )

    raise ValueError(f"unknown win best-response method {method!r}")


# --------------------------------------------------------------------------- #
# Public entry point — the common contract (design §6.1)                       #
# --------------------------------------------------------------------------- #


def best_response(
    config: Configuration,
    states: Mapping[str, PlayerState],
    side: str,
    utility: str,
    opponent: OpponentSpec,
    *,
    method: str = "auto",
    player_count: int = 2,
    memo: Optional[ResolutionMemo] = None,
    max_allocations: int = DEFAULT_MAX_ALLOCATIONS,
) -> BestResponse:
    """Full-space, resolver-validated best response for one side and utility (design §6.1).

    Parameters
    ----------
    config, states
        The configuration and the two seated player states, ``states`` keyed by
        seat ``"A"`` (row) and ``"B"`` (column).
    side
        ``"row"`` (player A maximises ``u_row``) or ``"column"`` (player B
        minimises ``u_row``, reported negated to the row-payoff convention).
    utility
        ``"margin"`` (implemented here) or ``"win"`` (Task 7 seam).
    opponent
        The fixed opposing strategy or mixture (an :class:`OpponentSpec`). For a
        row BR these are the column player's allocations; for a column BR the row
        player's.
    method
        ``"auto"`` (separable → exact DP, coupled → exhaustive), or an explicit
        ``"dp"`` / ``"milp"`` / ``"exhaustive"``.
    memo
        An injectable :class:`~ascension_trials.memo.ResolutionMemo`; a fresh one
        is created if omitted (it only affects speed — never output, REQ-8.5).
    max_allocations
        Enumeration ceiling for the exhaustive path (NFR-4).

    Returns a :class:`BestResponse` whose ``value_row_payoff`` is the
    resolver-recomputed value (authoritative) and whose certificate records the
    optimality basis. Raises :class:`BestResponseValidationError` on an
    optimiser-vs-resolver disagreement and :class:`NonOptimalBestResponseError`
    when optimality cannot be certified with no exhaustive fallback.
    """
    if side not in (ROW, COLUMN):
        raise ValueError(f"side must be {ROW!r} or {COLUMN!r}, got {side!r}")
    if utility not in (WIN, MARGIN):
        raise ValueError(f"utility must be {WIN!r} or {MARGIN!r}, got {utility!r}")
    _validate_states(states)
    if not opponent.support:
        raise ValueError("opponent must have a non-empty support")

    memo = memo or ResolutionMemo()

    if utility == MARGIN:
        return _best_response_margin(
            config, states, side, opponent,
            method=method, player_count=player_count, memo=memo, max_allocations=max_allocations,
        )
    return _best_response_win(
        config, states, side, opponent,
        method=method, player_count=player_count, memo=memo, max_allocations=max_allocations,
    )


# --------------------------------------------------------------------------- #
# Win best-response support — expected-sign MILP (design §6.3, REQ-5)          #
# --------------------------------------------------------------------------- #


class _WinMilpUncertified(RuntimeError):
    """Internal signal: the win MILP did not certify optimality (design §6.3).

    Raised inside :func:`_win_milp` on a non-optimal solver status, a relative MIP
    gap above tolerance, or a malformed incumbent. The driver catches it and falls
    back to exhaustive search (tractable) or raises
    :class:`NonOptimalBestResponseError` (intractable) — the win MILP never emits an
    unproven "best" response (REQ-5.6, NFR-4). It is never surfaced to callers.
    """


@dataclass(frozen=True)
class WinMilpDiagnostics:
    """HiGHS backend diagnostics for one win-MILP solve (REQ-5.4, NFR-3)."""

    status: str
    success: bool
    own_upper_bound: float  # certified UPPER bound on the acting side's own objective
    relative_gap: Optional[float]
    n_vars: int
    n_entry_vars: int
    tie_sign: int


def _win_milp_modelable(
    config: Configuration, player_count: int
) -> tuple[bool, tuple[str, ...]]:
    """May the win objective be faithfully modelled as a per-Trial-decomposed MILP?

    The expected-sign MILP (:func:`_win_milp`) expresses each player's Recognition-
    Point total as a **linear** function of per-Trial entry choices, and the RP-tie
    outcome as a **constant** from the final tiebreak. That is exact only when
    (conservatively, mirroring the margin separability rules, Authority §4):

    * ``player_count == 2`` — win is a two-player sign;
    * completion policy is ``optional`` — then the per-Trial legal-entry-selection
      feasible region is *exactly* the legal allocation space (MAXIMAL / FULL couple
      legality across Trials, so the region would not match);
    * every active Trial's tiebreaks are preferred-local tokens (or ``shared``) — a
      historical ratio token reads power *outside* the contested Trial, so a Trial's
      award would not decompose per Trial;
    * the final tiebreak chain does not use ``first_place_trial_count`` — that token
      reads the *allocation-dependent* count of outright first places, so the RP-tie
      outcome would not be a constant. The other final tokens
      (``total_normal_power``, ``spell_count``, ``largest_spell``, ``shared``) are
      state-based and allocation-independent, so they model cleanly.

    A non-modelable config is not a failure: the oracle simply uses the exact
    exhaustive fallback (REQ-5.6). When modelable, the model's soundness and
    completeness are re-checked against exhaustive search on tractable fixtures
    (REQ-7.1), and resolver re-validation guards every returned incumbent (REQ-6.4).
    """
    reasons: list[str] = []
    if player_count != 2:
        reasons.append(f"player_count={player_count} (win is a two-player sign)")
    if config.allocation.completion != "optional":
        reasons.append(
            f"completion policy {config.allocation.completion!r} couples legality across "
            "Trials, so per-Trial entry selection would not match the legal space"
        )
    allowed_tokens = LOCAL_TRIAL_TOKENS | {"shared"}
    for trial in config.active_trials(player_count):
        non_local = [tok for tok in trial.trial_tiebreaks if tok not in allowed_tokens]
        if non_local:
            reasons.append(
                f"trial {trial.id!r} uses non-local tiebreak tokens {non_local} "
                "(a Trial's award would not decompose per Trial)"
            )
    if "first_place_trial_count" in config.final_tiebreaks:
        reasons.append(
            "final tiebreak 'first_place_trial_count' is allocation-dependent "
            "(the RP-tie outcome would not be a constant)"
        )
    return (not reasons, tuple(reasons))


def _final_tie_sign(
    config: Configuration, state_a: PlayerState, state_b: PlayerState
) -> int:
    """The final result for row A on an exact Recognition-Point tie (design §6.3).

    Replicates the resolver's final-tiebreak chain (:func:`resolver._resolve_final`)
    for the RP-tied case, returning ``+1`` (A takes sole first), ``0`` (shared
    first), or ``-1`` (A is second). Only reached for MILP-modelable configs, whose
    final tokens are state-based; ``sole_first_count`` is passed as ``0`` because the
    allocation-dependent ``first_place_trial_count`` token is excluded by
    :func:`_win_milp_modelable`.
    """
    from .comparators import FinalTiebreakContext, final_token_value

    chain = config.final_tiebreaks or ["shared"]
    ctx_a = FinalTiebreakContext(state=state_a, sole_first_count=0)
    ctx_b = FinalTiebreakContext(state=state_b, sole_first_count=0)
    for token in chain:
        if token == "shared":
            return 0
        va = final_token_value(token, ctx_a)
        vb = final_token_value(token, ctx_b)
        if va > vb:
            return 1
        if va < vb:
            return -1
    return 0


def _win_legal_trial_entries(
    config: Configuration,
    trial: Trial,
    resource_names: tuple[str, ...],
    budgets: Mapping[str, int],
    wild_avail: int,
    player_count: int,
) -> list[_TrialEntry]:
    """Every legal per-Trial entry for the acting side (plus the skip entry).

    Mirrors the enumeration in :func:`_scored_trial_entries` but carries no margin
    score (``g == 0``) — win scoring is per-opponent and done separately. Entries
    are deterministically ordered (NFR-1) and reused by :func:`_assemble_allocation`
    (which reads only ``.normal`` and ``.wild``).
    """
    entries: list[_TrialEntry] = []
    for normal in _domain_usage_combos(resource_names, budgets):
        for wild in range(wild_avail + 1):
            normal_total = sum(normal.values())
            if normal_total == 0 and wild == 0:
                legal = True  # the "skip" choice: no entry on this Trial
            else:
                legal, _reason = legality.entry_is_legal(
                    config, trial, dict(normal), player_count, wild=wild
                )
            if not legal:
                continue
            entries.append(
                _TrialEntry(
                    normal=tuple(sorted(normal.items())),
                    wild=wild,
                    usage=tuple(normal.get(d, 0) for d in resource_names),
                    wild_usage=wild,
                    g=Fraction(0),
                )
            )
    entries.sort(key=lambda e: (e.usage, e.wild_usage, e.normal))
    return entries


def _trial_award_pair(
    config: Configuration,
    states: Mapping[str, PlayerState],
    side: str,
    trial: Trial,
    entry: _TrialEntry,
    opp_alloc: Allocation,
    resolve,
    player_count: int,
) -> tuple[int, int]:
    """Recognition Points to (row seat A, column seat B) on ``trial`` for one entry.

    Resolves a profile in which the acting side plays ``entry`` **only on
    ``trial``** against the fixed opponent allocation, and reads the Trial's
    ``rewards_awarded`` for both seats. Under the modelability conditions a Trial's
    award depends only on that Trial's two entries, so this isolated per-Trial award
    equals the award in the full allocation — the summed totals ``r_A``/``r_B`` are
    therefore exactly linear in the per-Trial entry choice (design §6.3). Always
    returns ``(award_to_A, award_to_B)`` regardless of the acting side.
    """
    acting_seat = _acting_seat(side)
    opp_seat = _opponent_seat(side)
    normal = {d: c for d, c in entry.normal if c > 0}
    acting_alloc = Allocation(
        player_id=acting_seat,
        normal={trial.id: normal} if normal else {},
        wild={trial.id: entry.wild} if entry.wild else {},
    )
    allocations = {acting_seat: acting_alloc, opp_seat: opp_alloc}
    result = resolve(
        config,
        {ROW_PLAYER: states[ROW_PLAYER], COL_PLAYER: states[COL_PLAYER]},
        {ROW_PLAYER: allocations[ROW_PLAYER], COL_PLAYER: allocations[COL_PLAYER]},
        player_count,
    )
    tr = next((t for t in result.trial_results if t.trial_id == trial.id), None)
    if tr is None:
        return 0, 0
    return (
        int(tr.rewards_awarded.get(ROW_PLAYER, 0)),
        int(tr.rewards_awarded.get(COL_PLAYER, 0)),
    )


def _win_milp(
    config: Configuration,
    states: Mapping[str, PlayerState],
    side: str,
    opponent: OpponentSpec,
    resolve,
    player_count: int,
) -> tuple[Allocation, Fraction, dict, WinMilpDiagnostics]:
    """Expected-sign win best response via ``scipy.optimize.milp`` (design §6.3, REQ-5).

    Feasible region: one legal entry per active Trial (binary selection) with a
    ledger-capacity constraint per resource — exactly A's legal allocations. For
    each opponent ``b`` in the support the RP difference ``diff_b = r_A(b) - r_B(b)``
    is linear in the entry selection; binary win/tie/loss indicators are linked to
    ``diff_b`` and the final-tie sign by big-M constraints. Objective: maximise
    ``sum_b y_b (win_b - loss_b)`` in the acting side's own convention (row: as-is;
    column: its own ``-u_row``). Never uses ``scipy.optimize.linprog`` (REQ-5.4).
    """
    import numpy as np
    from scipy.optimize import Bounds, LinearConstraint, milp

    acting_seat = _acting_seat(side)
    acting_state = states[acting_seat]
    active_trials = sorted(config.active_trials(player_count), key=lambda t: t.id)
    resource_names, budgets, wild_avail = _resources(config, acting_state)
    n_res = len(resource_names)

    trial_entries = [
        _win_legal_trial_entries(
            config, trial, resource_names, budgets, wild_avail, player_count
        )
        for trial in active_trials
    ]

    # Entry-selection variable columns: var_of[(trial_idx, entry_idx)] -> column.
    var_of: dict[tuple[int, int], int] = {}
    for t_idx, entries in enumerate(trial_entries):
        for e_idx in range(len(entries)):
            var_of[(t_idx, e_idx)] = len(var_of)
    n_entry_vars = len(var_of)

    support = list(opponent.support)
    n_opp = len(support)

    # Per (opponent, trial, entry) row-payoff contribution coeff = award_A - award_B,
    # and a per-opponent bound Mb[k] >= |diff_k| for the big-M linking constraints.
    coeff: list[list[list[int]]] = []
    Mb: list[int] = []
    for opp_alloc, _prob in support:
        per_trial: list[list[int]] = []
        mk = 0
        for trial, entries in zip(active_trials, trial_entries):
            row_diffs: list[int] = []
            max_abs = 0
            for entry in entries:
                aw_a, aw_b = _trial_award_pair(
                    config, states, side, trial, entry, opp_alloc, resolve, player_count
                )
                d = aw_a - aw_b
                row_diffs.append(d)
                max_abs = max(max_abs, abs(d))
            per_trial.append(row_diffs)
            mk += max_abs
        coeff.append(per_trial)
        Mb.append(mk)

    tie_sign = _final_tie_sign(config, states[ROW_PLAYER], states[COL_PLAYER])
    sign = 1 if side == ROW else -1
    # Row outcome thresholds: A wins iff diff >= wth; A loses iff diff <= lth.
    if tie_sign == 0:
        wth, lth, has_tie = 1, -1, True   # RP tie -> shared (A ties)
    elif tie_sign > 0:
        wth, lth, has_tie = 0, -1, False  # RP tie -> A wins via final tiebreak
    else:
        wth, lth, has_tie = 1, 0, False   # RP tie -> A loses via final tiebreak

    # Outcome-indicator columns per opponent.
    win_col: dict[int, int] = {}
    tie_col: dict[int, int] = {}
    loss_col: dict[int, int] = {}
    n_vars = n_entry_vars
    for k in range(n_opp):
        win_col[k] = n_vars; n_vars += 1
        if has_tie:
            tie_col[k] = n_vars; n_vars += 1
        loss_col[k] = n_vars; n_vars += 1

    # Objective: maximise sum_k p_k*sign*(win_k - loss_k) -> minimise its negation.
    c = np.zeros(n_vars, dtype=float)
    for k, (_opp, prob) in enumerate(support):
        ps = float(prob) * sign
        c[win_col[k]] = -ps
        c[loss_col[k]] = ps

    constraints = []
    # (1) exactly one entry per Trial.
    for t_idx, entries in enumerate(trial_entries):
        row = np.zeros(n_vars, dtype=float)
        for e_idx in range(len(entries)):
            row[var_of[(t_idx, e_idx)]] = 1.0
        constraints.append(LinearConstraint(row, 1.0, 1.0))
    # (2) ledger capacity per resource (domains then Wild).
    for r_idx, dom in enumerate(resource_names):
        row = np.zeros(n_vars, dtype=float)
        for (t_idx, e_idx), col in var_of.items():
            row[col] = float(trial_entries[t_idx][e_idx].usage[r_idx])
        constraints.append(LinearConstraint(row, -np.inf, float(budgets[dom])))
    if wild_avail > 0:
        row = np.zeros(n_vars, dtype=float)
        for (t_idx, e_idx), col in var_of.items():
            row[col] = float(trial_entries[t_idx][e_idx].wild_usage)
        constraints.append(LinearConstraint(row, -np.inf, float(wild_avail)))

    def _diff_row(k: int) -> "np.ndarray":
        """Row vector of diff_k = sum_{t,e} (award_A - award_B) x[t,e] over all vars."""
        r = np.zeros(n_vars, dtype=float)
        for t_idx in range(len(active_trials)):
            for e_idx in range(len(trial_entries[t_idx])):
                r[var_of[(t_idx, e_idx)]] += float(coeff[k][t_idx][e_idx])
        return r

    # (3) win + [tie] + loss = 1 and (4) big-M links tying the indicators to diff_k.
    #     These fully DETERMINE the indicators from diff_k (exactly one is feasible),
    #     so the solver cannot claim an outcome the Recognition Points do not earn.
    for k in range(n_opp):
        sum_row = np.zeros(n_vars, dtype=float)
        sum_row[win_col[k]] = 1.0
        sum_row[loss_col[k]] = 1.0
        if has_tie:
            sum_row[tie_col[k]] = 1.0
        constraints.append(LinearConstraint(sum_row, 1.0, 1.0))

        mk = Mb[k]
        m_win = mk + abs(wth) + 1
        m_loss = mk + abs(lth) + 1
        # win_k=1 => diff_k >= wth :  diff_k - m_win*win_k >= wth - m_win
        rw = _diff_row(k)
        rw[win_col[k]] += -m_win
        constraints.append(LinearConstraint(rw, wth - m_win, np.inf))
        # loss_k=1 => diff_k <= lth :  diff_k + m_loss*loss_k <= lth + m_loss
        rl = _diff_row(k)
        rl[loss_col[k]] += m_loss
        constraints.append(LinearConstraint(rl, -np.inf, lth + m_loss))
        if has_tie:
            m_tie = mk + 1
            # tie_k=1 => diff_k == 0 (two half-constraints).
            ru = _diff_row(k)
            ru[tie_col[k]] += m_tie
            constraints.append(LinearConstraint(ru, -np.inf, float(m_tie)))
            rlo = _diff_row(k)
            rlo[tie_col[k]] += -m_tie
            constraints.append(LinearConstraint(rlo, float(-m_tie), np.inf))

    integrality = np.ones(n_vars, dtype=int)
    bounds = Bounds(np.zeros(n_vars), np.ones(n_vars))
    res = milp(c, constraints=constraints, integrality=integrality, bounds=bounds)

    # Certification gate (REQ-5.6): only an optimal status within the MIP-gap
    # tolerance may be emitted; anything else signals the caller to fall back.
    if not getattr(res, "success", False) or res.x is None or getattr(res, "status", None) != 0:
        raise _WinMilpUncertified(
            f"non-optimal status={getattr(res, 'status', None)} "
            f"message={getattr(res, 'message', None)!r}"
        )
    rel_gap = getattr(res, "mip_gap", None)
    if rel_gap is not None and rel_gap > DEFAULT_REL_TOL:
        raise _WinMilpUncertified(
            f"relative MIP gap {rel_gap} exceeds tolerance {DEFAULT_REL_TOL}"
        )

    x = np.asarray(res.x, dtype=float)
    chosen: list[_TrialEntry] = []
    chosen_e_idx: list[int] = []
    for t_idx, entries in enumerate(trial_entries):
        picked = [e_idx for e_idx in range(len(entries)) if x[var_of[(t_idx, e_idx)]] > 0.5]
        if len(picked) != 1:
            raise _WinMilpUncertified(
                f"trial index {t_idx} selected {len(picked)} entries (expected 1)"
            )
        chosen_e_idx.append(picked[0])
        chosen.append(entries[picked[0]])

    allocation = _assemble_allocation(
        acting_seat, acting_state, active_trials, tuple(chosen),
        resource_names, budgets, wild_avail,
    )

    # Exact own objective from the chosen entries (integer diff, rational mixture).
    own = Fraction(0)
    per_opponent: dict[str, dict] = {}
    for k, (_opp, prob) in enumerate(support):
        diff = sum(coeff[k][t_idx][chosen_e_idx[t_idx]] for t_idx in range(len(active_trials)))
        outcome = 1 if diff >= wth else (-1 if diff <= lth else 0)
        own += prob * sign * outcome
        per_opponent[str(k)] = {"diff": diff, "row_outcome": outcome, "prob": str(prob)}

    # HiGHS dual bound is a lower bound on the MINIMISED objective (-own); negate it
    # to a certified UPPER bound on the acting side's own objective (design §6.4).
    dual_bound = getattr(res, "mip_dual_bound", None)
    own_upper_bound = -float(dual_bound) if dual_bound is not None else float(own)
    diagnostics = WinMilpDiagnostics(
        status=str(getattr(res, "message", "")),
        success=True,
        own_upper_bound=own_upper_bound,
        relative_gap=float(rel_gap) if rel_gap is not None else None,
        n_vars=n_vars,
        n_entry_vars=n_entry_vars,
        tie_sign=tie_sign,
    )
    proof = {
        "backend": MILP_BACKEND,
        "options": {"integrality": "binary", "presolve": "default"},
        "resources": list(resource_names),
        "wild_budget": wild_avail,
        "variables": n_vars,
        "entry_variables": n_entry_vars,
        "opponent_support_size": n_opp,
        "final_tie_sign": tie_sign,
        "thresholds": {"win_ge": wth, "loss_le": lth, "has_tie_region": has_tie},
        "mip_dual_bound": None if dual_bound is None else float(dual_bound),
        "per_opponent_outcome": per_opponent,
        "per_trial_choice": {
            trial.id: {"normal": dict(entry.normal), "wild": entry.wild}
            for trial, entry in zip(active_trials, chosen)
        },
    }
    return allocation, own, proof, diagnostics


def _win_exhaustive(
    config: Configuration,
    states: Mapping[str, PlayerState],
    side: str,
    opponent: OpponentSpec,
    resolve,
    player_count: int,
    max_allocations: int,
) -> tuple[Allocation, Fraction, dict]:
    """Exact win best response by full enumeration of the acting side's legal space.

    Scores every legal allocation by its exact expected row-payoff win value
    (``+1``/``0``/``-1`` per opponent, mixture-weighted) and keeps the argmax of the
    acting side's own objective (row: maximise; column: maximise ``-u_row``).
    Deterministic: enumeration is canonically ordered and the first strict maximum
    wins (NFR-1). Raises :class:`EnumerationLimitError` (surfaced as
    :class:`NonOptimalBestResponseError`) when the space exceeds the ceiling.
    """
    acting_state = states[_acting_seat(side)]
    allocations = enumerate_allocations(
        config, acting_state, player_count, max_allocations=max_allocations
    )
    best_alloc: Optional[Allocation] = None
    best_own: Optional[Fraction] = None
    for candidate in allocations:
        row_value = _expected_row_value(
            config, states, side, WIN, candidate, opponent, resolve, player_count
        )
        own = _own_from_row(side, row_value)
        if best_own is None or own > best_own:
            best_own = own
            best_alloc = candidate
    assert best_alloc is not None and best_own is not None
    proof = {"candidates_enumerated": len(allocations), "method": "exhaustive_win"}
    return best_alloc, best_own, proof


def _win_fallback_exhaustive(
    config: Configuration,
    states: Mapping[str, PlayerState],
    side: str,
    opponent: OpponentSpec,
    resolve,
    player_count: int,
    max_allocations: int,
    *,
    milp_reason: Optional[str],
) -> BestResponse:
    """Run the exact exhaustive win oracle, or raise if the state is intractable.

    Used both as the direct ``method='exhaustive'`` path and as the MILP's fallback
    when it cannot certify optimality (``milp_reason`` set). On an over-limit legal
    space it raises :class:`NonOptimalBestResponseError` — never an unproven "best"
    (REQ-5.6, NFR-4).
    """
    try:
        allocation, own, proof = _win_exhaustive(
            config, states, side, opponent, resolve, player_count, max_allocations
        )
    except EnumerationLimitError as exc:
        detail = (
            f"the win MILP did not certify optimality ({milp_reason}) and "
            if milp_reason is not None
            else ""
        )
        raise NonOptimalBestResponseError(
            "win best response cannot be certified: "
            f"{detail}the legal allocation space exceeds the enumeration ceiling "
            f"({exc}); no exhaustive fallback fits"
        ) from exc
    if milp_reason is not None:
        proof["milp_fallback_reason"] = milp_reason
    return _finalize_best_response(
        config, states, side, WIN, opponent, allocation, own,
        method="exhaustive", evidence_class=EXACT_EXHAUSTIVE,
        solver_status="exhaustive_enumeration",
        resolve=resolve, player_count=player_count, proof=proof,
    )
