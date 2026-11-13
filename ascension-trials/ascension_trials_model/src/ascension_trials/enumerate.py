"""Small-state allocation enumeration (VS2 — REQ-10; design §8; impl spec §8, §13).

Exhaustively and deterministically enumerate every *legal* allocation of a single
player state under a configuration, for the small two-player states VS2 analyses.
An allocation is enumerated when:

  * every source ledger reconciles exactly (``allocated + residue == available``);
    this holds by construction because each domain's available power is distributed
    over the active Trials plus one explicit residue bucket (REQ-4.2/4.3);
  * every Trial entry it places is legal (:func:`legality.entry_is_legal`) — an
    allocation containing an illegal entry is not a legal allocation (design §8.1
    step 5); and
  * it satisfies the configured completion policy — OPTIONAL keeps any legal
    residue, FULL keeps only zero-residue allocations, MAXIMAL keeps only maximal
    allocations (no residual unit can be legally added; REQ-4.4/4.5).

Determinism (NFR-1): domains and Trials are processed in sorted id order, weak
compositions are generated in a fixed lexicographic order, and the returned list
is sorted by :func:`canonical.canonical_allocation_key`. Exact duplicates (which
can only arise from explicit-zero collapse) are removed by that key (design §9.1
static normalization).

Failure visibility (NFR-4, REQ-10.4/10.5): the exact allocation count is estimated
in closed form *before* materializing anything, and enumeration refuses to run when
the estimate exceeds a configured ceiling by raising :class:`EnumerationLimitError`.
It never silently falls back to sampling.
"""

from __future__ import annotations

from dataclasses import dataclass
from math import comb
from typing import Iterable, Iterator, Optional

from . import legality
from .canonical import canonical_allocation_key
from .schema import Allocation, Configuration, PlayerState, Trial

# Default ceiling on the number of legal allocations enumerated for one state.
# The impl-spec matrix ceiling (§13.2) is 10,000 collapsed classes; enumeration is
# allowed a larger raw ceiling because static duplicates and strategic collapse
# still reduce the eventual matrix. Callers may override it explicitly.
DEFAULT_MAX_ALLOCATIONS = 200_000


class EnumerationLimitError(RuntimeError):
    """Raised when an exact enumeration would exceed the configured ceiling.

    Carries the estimated count and the limit so the caller can report the refusal
    explicitly (NFR-4). Enumeration never silently substitutes sampling (REQ-10.5).
    """

    def __init__(self, estimate: int, limit: int, detail: str = "") -> None:
        self.estimate = estimate
        self.limit = limit
        msg = (
            f"exact enumeration refused: estimated {estimate} allocations exceeds "
            f"the configured ceiling of {limit}"
        )
        if detail:
            msg += f" ({detail})"
        super().__init__(msg)


# --------------------------------------------------------------------------- #
# Weak compositions                                                            #
# --------------------------------------------------------------------------- #


def weak_compositions(total: int, parts: int) -> Iterator[tuple[int, ...]]:
    """Yield every length-``parts`` tuple of non-negative ints summing to ``total``.

    Deterministic lexicographic (descending-first-part) order. ``parts`` must be
    >= 1; ``total`` must be >= 0. There are ``C(total + parts - 1, parts - 1)``
    such tuples.
    """
    if parts < 1:
        raise ValueError("parts must be >= 1")
    if total < 0:
        raise ValueError("total must be >= 0")
    if parts == 1:
        yield (total,)
        return
    for head in range(total, -1, -1):
        for rest in weak_compositions(total - head, parts - 1):
            yield (head,) + rest


# --------------------------------------------------------------------------- #
# Size estimation and limits (REQ-10.4, NFR-4)                                 #
# --------------------------------------------------------------------------- #


def _active_trials(config: Configuration, player_count: Optional[int]) -> list[Trial]:
    trials = config.active_trials(player_count) if player_count is not None else list(config.trials)
    return sorted(trials, key=lambda t: t.id)


@dataclass(frozen=True)
class EnumerationEstimate:
    """A pre-materialization size/memory estimate for an enumeration (REQ-10.4).

    ``upper_bound`` is the exact number of *candidate* allocations before legality
    and completion filtering — the product over each source (every normal domain
    and Wild) of ``C(available + trials, trials)`` weak compositions over the
    active Trials plus one residue bucket. It is an exact upper bound on the number
    of legal allocations, computed in closed form without generating anything.
    """

    trials: int
    per_source: dict[str, int]
    upper_bound: int
    approx_bytes: int

    def exceeds(self, limit: int) -> bool:
        return self.upper_bound > limit


def estimate_allocation_count(
    config: Configuration,
    state: PlayerState,
    player_count: Optional[int] = None,
) -> EnumerationEstimate:
    """Closed-form candidate-count and rough memory estimate (no generation)."""
    trials = _active_trials(config, player_count)
    t = len(trials)
    per_source: dict[str, int] = {}
    upper = 1
    # Each source distributes its available units over t Trials + 1 residue bucket,
    # i.e. weak compositions of `available` into (t + 1) parts.
    for dom in sorted({d.id for d in config.domains} | set(state.normal_power)):
        available = state.normal_power.get(dom, 0)
        count = comb(available + t, t)  # C(available + (t+1) - 1, (t+1) - 1)
        per_source[dom] = count
        upper *= count
    wild_available = state.wild_power
    if config.wild.enabled:
        wild_count = comb(wild_available + t, t)
        per_source["wild"] = wild_count
        upper *= wild_count
    # Rough memory estimate: each retained Allocation plus its canonical key costs
    # on the order of (t+1) * (domains) small python ints/tuples. Use a generous
    # per-allocation byte estimate for the pre-check.
    approx_bytes = upper * (256 + 64 * (t + 1) * max(1, len(config.domains)))
    return EnumerationEstimate(
        trials=t, per_source=per_source, upper_bound=upper, approx_bytes=approx_bytes
    )


# --------------------------------------------------------------------------- #
# Enumeration                                                                  #
# --------------------------------------------------------------------------- #


def _domain_distributions(
    available: int, trials: list[Trial]
) -> list[tuple[dict[str, int], int]]:
    """All (per-Trial amount map, residue) placements of ``available`` for one domain."""
    out: list[tuple[dict[str, int], int]] = []
    t = len(trials)
    for comp in weak_compositions(available, t + 1):
        by_trial = {trials[i].id: comp[i] for i in range(t) if comp[i] > 0}
        residue = comp[t]
        out.append((by_trial, residue))
    return out


def _wild_distributions(available: int, trials: list[Trial]) -> list[tuple[dict[str, int], int]]:
    out: list[tuple[dict[str, int], int]] = []
    t = len(trials)
    for comp in weak_compositions(available, t + 1):
        by_trial = {trials[i].id: comp[i] for i in range(t) if comp[i] > 0}
        residue = comp[t]
        out.append((by_trial, residue))
    return out


def _build_allocation(
    player_id: str,
    domain_placements: dict[str, tuple[dict[str, int], int]],
    wild_placement: tuple[dict[str, int], int],
    trials: list[Trial],
) -> Allocation:
    """Assemble an Allocation from per-domain and Wild placements."""
    normal: dict[str, dict[str, int]] = {}
    residue_normal: dict[str, int] = {}
    for dom, (by_trial, residue) in domain_placements.items():
        for tid, amount in by_trial.items():
            normal.setdefault(tid, {})[dom] = amount
        if residue > 0:
            residue_normal[dom] = residue
    wild_by_trial, wild_residue = wild_placement
    wild = {tid: amount for tid, amount in wild_by_trial.items() if amount > 0}
    return Allocation(
        player_id=player_id,
        normal=normal,
        wild=wild,
        residue_normal=residue_normal,
        residue_wild=wild_residue,
    )


def _all_entries_legal(
    config: Configuration,
    allocation: Allocation,
    player_count: Optional[int],
) -> bool:
    """True iff every Trial the allocation touches is a legal entry (design §8.1)."""
    trial_map = config.trial_map()
    for trial_id in allocation.trials_touched():
        trial = trial_map.get(trial_id)
        if trial is None:
            return False
        legal, _reason = legality.entry_is_legal(
            config,
            trial,
            allocation.normal_on(trial_id),
            player_count,
            wild=allocation.wild_on(trial_id),
        )
        if not legal:
            return False
    return True


def _satisfies_completion(
    config: Configuration,
    state: PlayerState,
    allocation: Allocation,
    player_count: Optional[int],
) -> bool:
    """True iff the allocation satisfies the configured completion policy (REQ-4.4)."""
    policy = config.allocation.completion
    if policy == "optional":
        return True
    if policy == "full":
        # Every source ledger must be fully spent (zero residue). Over-allocation
        # is impossible here because placements never exceed available.
        normal_residue = sum(allocation.residue_normal.values())
        return normal_residue == 0 and allocation.residue_wild == 0
    if policy == "maximal":
        return legality.is_maximal_allocation(state, allocation, config, player_count)
    # Unknown policy: refuse to guess (NFR-4). Treated as no allocation qualifying.
    return False


def enumerate_allocations(
    config: Configuration,
    state: PlayerState,
    player_count: Optional[int] = None,
    *,
    max_allocations: int = DEFAULT_MAX_ALLOCATIONS,
) -> list[Allocation]:
    """Every legal allocation of ``state`` under ``config``, in canonical order.

    Raises :class:`EnumerationLimitError` when the closed-form candidate estimate
    exceeds ``max_allocations`` (REQ-10.4, NFR-4). The result is deterministic and
    de-duplicated by canonical allocation key (design §9.1).
    """
    estimate = estimate_allocation_count(config, state, player_count)
    if estimate.exceeds(max_allocations):
        raise EnumerationLimitError(
            estimate.upper_bound,
            max_allocations,
            detail=f"{estimate.trials} active Trials, per-source counts {estimate.per_source}",
        )

    trials = _active_trials(config, player_count)
    domain_ids = sorted({d.id for d in config.domains} | set(state.normal_power))

    # Per-domain candidate placements (list of (by_trial, residue)).
    domain_options: dict[str, list[tuple[dict[str, int], int]]] = {
        dom: _domain_distributions(state.normal_power.get(dom, 0), trials) for dom in domain_ids
    }
    wild_options = (
        _wild_distributions(state.wild_power, trials)
        if config.wild.enabled
        else [({}, state.wild_power)]
    )

    seen: set = set()
    results: list[Allocation] = []
    for combo in _product_over_domains(domain_ids, domain_options):
        for wild_placement in wild_options:
            allocation = _build_allocation(state.player_id, combo, wild_placement, trials)
            if not _all_entries_legal(config, allocation, player_count):
                continue
            if not _satisfies_completion(config, state, allocation, player_count):
                continue
            key = canonical_allocation_key(config, state, allocation)
            if key in seen:
                continue
            seen.add(key)
            results.append(allocation)

    results.sort(key=lambda a: canonical_allocation_key(config, state, a))
    return results


def _product_over_domains(
    domain_ids: list[str],
    domain_options: dict[str, list[tuple[dict[str, int], int]]],
) -> Iterator[dict[str, tuple[dict[str, int], int]]]:
    """Deterministic Cartesian product of per-domain placements, keyed by domain id."""
    if not domain_ids:
        yield {}
        return
    head, *tail = domain_ids
    for placement in domain_options[head]:
        for rest in _product_over_domains(tail, domain_options):
            combined = {head: placement}
            combined.update(rest)
            yield combined


# --------------------------------------------------------------------------- #
# Maximal-allocation view (REQ-10.3)                                           #
# --------------------------------------------------------------------------- #


def enumerate_maximal_allocations(
    config: Configuration,
    state: PlayerState,
    player_count: Optional[int] = None,
    *,
    max_allocations: int = DEFAULT_MAX_ALLOCATIONS,
) -> list[Allocation]:
    """The subset of legal allocations that are maximal (REQ-4.5, REQ-10.3).

    Maximality is evaluated exactly regardless of the configured completion policy,
    so this can be reported alongside the legal count even for OPTIONAL states.
    """
    legal = enumerate_allocations(config, state, player_count, max_allocations=max_allocations)
    return [
        a for a in legal if legality.is_maximal_allocation(state, a, config, player_count)
    ]


def count_legal_and_maximal(
    config: Configuration,
    state: PlayerState,
    player_count: Optional[int] = None,
    *,
    max_allocations: int = DEFAULT_MAX_ALLOCATIONS,
) -> tuple[int, int]:
    """(legal count, maximal count) for one state (REQ-10, design metrics §16)."""
    legal = enumerate_allocations(config, state, player_count, max_allocations=max_allocations)
    maximal = sum(
        1 for a in legal if legality.is_maximal_allocation(state, a, config, player_count)
    )
    return len(legal), maximal


def normal_totals_by_trial(
    config: Configuration,
    allocation: Allocation,
    player_count: Optional[int] = None,
) -> tuple[int, ...]:
    """Per-active-Trial total normal power (summed over domains), in Trial-id order.

    A compact, human-readable strategy descriptor for single-domain toy configs
    (e.g. A3/A4 render as ``(a, b)`` / ``(a, b, c)``). Determinism per NFR-1.
    """
    trials = _active_trials(config, player_count)
    return tuple(sum(allocation.normal_on(t.id).values()) for t in trials)


def find_allocation_by_normal_totals(
    config: Configuration,
    allocations: Iterable[Allocation],
    totals: tuple[int, ...],
    player_count: Optional[int] = None,
) -> Optional[Allocation]:
    """Return the enumerated allocation whose per-Trial normal totals match ``totals``.

    Used by single-domain fixtures (A3/A4) to locate a named strategy such as
    ``(4, 0)`` or ``(0, 1, 1)`` without depending on enumeration order.
    """
    for a in allocations:
        if normal_totals_by_trial(config, a, player_count) == tuple(totals):
            return a
    return None
