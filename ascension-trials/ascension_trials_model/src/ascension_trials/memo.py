"""Memoized resolution wrapper (VS3 — REQ-8, NFR-2; design §7).

A pure, injectable cache over :func:`resolve_profile`. The cache key is a
deterministic content hash of the **complete normalized semantic resolver
input** — the full configuration *content* (not merely its ``id``/``version``),
both player states, both allocations, the row/column role assignment and the
player count — so two keys collide **iff** the resolver inputs are genuinely
identical, and the key stays correct even if a configuration file is edited
**without** a version bump (REQ-8.1).

The signature is built from exactly the normalized, sorted structures the
resolver folds into its own audit hash (``normalized_state`` /
``normalized_allocation`` from :mod:`ascension_trials.canonical`), extended with
the full configuration content. Because the resolver is pure and deterministic
(NFR-2), a cache hit returns the **identical** :class:`ResolutionResult` — same
trace, same audit hash (REQ-8.2).

The memo is injectable and disabling it changes only performance, never output
(REQ-8.5): memoization is never a correctness dependency. Cache hit rate and
wall-clock runtime are exposed as **diagnostics only** (REQ-8.4); they never feed
back into any result.

Routing existing code through the cache is transparent: the wrapper's
:meth:`ResolutionMemo.resolve` has the same signature as :func:`resolve_profile`,
so a caller (the payoff-matrix builder, the double-oracle driver) can substitute
it for the direct resolver with no other change.
"""

from __future__ import annotations

import dataclasses
import time
from dataclasses import dataclass, field
from typing import Callable, Iterable, Mapping, Optional

from .canonical import deterministic_hash, normalized_allocation, normalized_state
from .resolver import ResolutionResult, resolve_profile
from .schema import Allocation, Configuration, PlayerState

# A resolver callable with the exact signature of ``resolve_profile``.
ResolveFn = Callable[..., ResolutionResult]


# --------------------------------------------------------------------------- #
# Canonical resolver-input signature (REQ-8.1)                                 #
# --------------------------------------------------------------------------- #


def config_content(config: Configuration) -> dict:
    """Full, order-independent content view of a configuration (REQ-8.1).

    ``dataclasses.asdict`` walks every nested dataclass, list and map, so the
    resulting structure captures **every output-affecting configuration field** —
    not just ``id``/``version``. Hashing it means the memo key changes whenever the
    configuration *content* changes, even without a version bump.
    """
    return dataclasses.asdict(config)


def normalized_resolver_input(
    config: Configuration,
    states: Mapping[str, PlayerState],
    allocations: Mapping[str, Allocation],
    player_count: Optional[int],
    *,
    config_signature: Optional[str] = None,
) -> dict:
    """The complete normalized semantic resolver input (design §7).

    Mirrors exactly the normalization the resolver folds into its audit hash:
    players ordered by id, each state via :func:`normalized_state`, each allocation
    via :func:`normalized_allocation` (using the resolver's empty-allocation default
    for a player that supplied none). The configuration is represented by its full
    content signature (or a pre-computed ``config_signature``), and by
    ``player_count`` (defaulting to the player total, exactly as the resolver does).

    The row/column role assignment is captured implicitly: swapping which state is
    keyed ``A`` versus ``B`` changes the per-player normalized structures, hence the
    key.
    """
    player_ids = sorted(states)
    pc = player_count if player_count is not None else len(states)
    if config_signature is None:
        config_signature = deterministic_hash(config_content(config))
    return {
        "config_signature": config_signature,
        "player_count": pc,
        "states": {pid: normalized_state(states[pid]) for pid in player_ids},
        "allocations": {
            pid: normalized_allocation(allocations.get(pid, Allocation(player_id=pid)))
            for pid in player_ids
        },
    }


def resolver_input_key(
    config: Configuration,
    states: Mapping[str, PlayerState],
    allocations: Mapping[str, Allocation],
    player_count: Optional[int] = None,
    *,
    config_signature: Optional[str] = None,
) -> str:
    """Deterministic content-hash key for a resolver input (REQ-8.1, NFR-1)."""
    signature = normalized_resolver_input(
        config, states, allocations, player_count, config_signature=config_signature
    )
    return deterministic_hash(signature)


# --------------------------------------------------------------------------- #
# The injectable cache (REQ-8.2, REQ-8.5, NFR-2)                               #
# --------------------------------------------------------------------------- #


@dataclass
class ResolutionMemo:
    """An injectable, pure cache over :func:`resolve_profile` (REQ-8, NFR-2).

    ``resolve_fn`` is the underlying resolver (defaults to the pure
    :func:`resolve_profile`); it is called only on a cache miss. Set ``enabled`` to
    ``False`` to bypass the cache entirely — output is then byte-for-byte identical
    to calling the resolver directly, because the same ``resolve_fn`` is invoked
    (REQ-8.5). ``hits``/``misses`` are diagnostics only (REQ-8.4).
    """

    resolve_fn: ResolveFn = resolve_profile
    enabled: bool = True
    _cache: dict[str, ResolutionResult] = field(default_factory=dict, repr=False)
    # Full-content config hashes, cached by object identity for speed while a strong
    # reference is retained so the id cannot be recycled onto a different config.
    _config_signatures: dict[int, tuple[Configuration, str]] = field(
        default_factory=dict, repr=False
    )
    hits: int = 0
    misses: int = 0

    # -- key derivation ------------------------------------------------------
    def _config_signature(self, config: Configuration) -> str:
        """Full-content config hash, memoized by object identity (REQ-8.1).

        Configurations are treated as immutable for a memo's lifetime (NFR-2). A
        configuration file edited without a version bump loads as a **new** object
        with a new identity, so its content is re-hashed and the key changes — the
        stale-key hazard REQ-8.1 warns about cannot occur.
        """
        cached = self._config_signatures.get(id(config))
        if cached is not None:
            return cached[1]
        signature = deterministic_hash(config_content(config))
        self._config_signatures[id(config)] = (config, signature)
        return signature

    def key(
        self,
        config: Configuration,
        states: Mapping[str, PlayerState],
        allocations: Mapping[str, Allocation],
        player_count: Optional[int] = None,
    ) -> str:
        return resolver_input_key(
            config,
            states,
            allocations,
            player_count,
            config_signature=self._config_signature(config),
        )

    # -- resolution ----------------------------------------------------------
    def resolve(
        self,
        config: Configuration,
        states: Mapping[str, PlayerState],
        allocations: Mapping[str, Allocation],
        player_count: Optional[int] = None,
    ) -> ResolutionResult:
        """Resolve, returning the cached identical result on a hit (REQ-8.2).

        Signature matches :func:`resolve_profile`, so this is a drop-in replacement.
        """
        if not self.enabled:
            self.misses += 1
            return self.resolve_fn(config, states, allocations, player_count)
        cache_key = self.key(config, states, allocations, player_count)
        cached = self._cache.get(cache_key)
        if cached is not None:
            self.hits += 1
            return cached
        self.misses += 1
        result = self.resolve_fn(config, states, allocations, player_count)
        self._cache[cache_key] = result
        return result

    # Callable form so a ``ResolutionMemo`` can be dropped in wherever a bare
    # ``resolve_profile`` reference is expected.
    __call__ = resolve

    # -- diagnostics (REQ-8.4) ----------------------------------------------
    @property
    def lookups(self) -> int:
        return self.hits + self.misses

    @property
    def hit_rate(self) -> float:
        return self.hits / self.lookups if self.lookups else 0.0

    @property
    def size(self) -> int:
        """Number of distinct resolver inputs cached."""
        return len(self._cache)

    def clear(self) -> None:
        self._cache.clear()
        self._config_signatures.clear()
        self.hits = 0
        self.misses = 0

    def diagnostics(self) -> dict:
        return {
            "enabled": self.enabled,
            "hits": self.hits,
            "misses": self.misses,
            "lookups": self.lookups,
            "hit_rate": self.hit_rate,
            "distinct_inputs_cached": self.size,
        }


# --------------------------------------------------------------------------- #
# Runtime / hit-rate diagnostics (REQ-8.4 — diagnostics only)                  #
# --------------------------------------------------------------------------- #

# One resolver profile: (config, states, allocations, player_count).
Profile = tuple[
    Configuration, Mapping[str, PlayerState], Mapping[str, Allocation], Optional[int]
]


@dataclass(frozen=True)
class RuntimeComparison:
    """Wall-clock and hit-rate diagnostics for memoized vs direct resolution.

    Diagnostics only (REQ-8.4): these figures never influence any resolver output
    or downstream metric.
    """

    profiles: int
    direct_seconds: float
    memoized_seconds: float
    hits: int
    misses: int
    hit_rate: float
    distinct_inputs_cached: int

    @property
    def speedup(self) -> Optional[float]:
        if self.memoized_seconds <= 0:
            return None
        return self.direct_seconds / self.memoized_seconds

    def to_dict(self) -> dict:
        return {
            "profiles": self.profiles,
            "direct_seconds": self.direct_seconds,
            "memoized_seconds": self.memoized_seconds,
            "hits": self.hits,
            "misses": self.misses,
            "hit_rate": self.hit_rate,
            "distinct_inputs_cached": self.distinct_inputs_cached,
            "speedup": self.speedup,
        }


def resolution_diagnostics(
    profiles: Iterable[Profile],
    *,
    resolve_fn: ResolveFn = resolve_profile,
    memo: Optional[ResolutionMemo] = None,
) -> RuntimeComparison:
    """Resolve a batch of profiles directly and via a memo, timing both (REQ-8.4).

    ``profiles`` is an iterable of ``(config, states, allocations, player_count)``
    tuples. Both paths return identical results (the memo only caches), so the
    reported timings and hit rate are strictly informational — disabling
    memoization changes only these numbers, never a result (REQ-8.5).
    """
    batch = list(profiles)
    memo = memo or ResolutionMemo(resolve_fn=resolve_fn)
    memo.clear()

    start = time.perf_counter()
    for config, states, allocations, pc in batch:
        resolve_fn(config, states, allocations, pc)
    direct_seconds = time.perf_counter() - start

    start = time.perf_counter()
    for config, states, allocations, pc in batch:
        memo.resolve(config, states, allocations, pc)
    memoized_seconds = time.perf_counter() - start

    return RuntimeComparison(
        profiles=len(batch),
        direct_seconds=direct_seconds,
        memoized_seconds=memoized_seconds,
        hits=memo.hits,
        misses=memo.misses,
        hit_rate=memo.hit_rate,
        distinct_inputs_cached=memo.size,
    )
