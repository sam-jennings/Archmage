"""Trial and final-result tiebreak comparators (design §5.3, §6; REQ-8).

Each tiebreak token maps to exactly ONE pure comparator (design §5.3). A
comparator turns a single contender into a comparable value; the resolver
separates two contenders by comparing their values with the natural ordering
(higher ranks first). Ratio comparators return :class:`fractions.Fraction` so
comparison is exact rational arithmetic (REQ-8.3); count/power comparators
return ``int``.

There are two branches, per design §6 and REQ-8.6:

* **PREFERRED-LOCAL** tokens — ``total_power``, ``normal_power``,
  ``qualifying_source_count``, ``breadth`` — read ONLY the contested Trial's
  entry. They are handed a :class:`TrialLocalView`, which carries nothing but the
  contested Trial's own numbers, so they *structurally cannot* read power outside
  the Trial. That is the guarantee REQ-8.6 demands, enforced by construction
  rather than by convention.

* **HISTORICAL** ratio tokens — ``legacy_utilization``, ``legacy_focus``,
  ``hybrid_efficiency``, ``hybrid_commitment`` — deliberately divide by power
  *outside* the contested Trial (domain capacity, normal power on other Trials,
  total Spellbook power). That non-locality is precisely what makes them fail
  monotonicity, so they are labelled historical (REQ-8.5) and receive the full
  :class:`TrialTiebreakContext`.

Ratio numerator/denominator definitions follow **design §6.1–§6.5 with DISTINCT
denominators**, NOT the normative-model §8.1 collapsed reading (which folds
utilization↔efficiency and focus↔commitment into two shared conventions). Design
§16 makes the existing implementation provisional until the acceptance tests
pass, so the distinct §6 denominators are authoritative here. Every ratio's
numerator and denominator is documented in :data:`RATIO_SEMANTICS` (REQ-8.4).
"""

from __future__ import annotations

from dataclasses import dataclass
from fractions import Fraction
from typing import Callable, Mapping

from .eligibility import qualifying_source_count, qualifying_source_domains
from .schema import Configuration, PlayerState, Trial

# --------------------------------------------------------------------------- #
# Token classification (design §5.3; REQ-8.6)                                  #
# --------------------------------------------------------------------------- #

#: Preferred-local Trial tokens — read only the contested Trial (REQ-8.6).
LOCAL_TRIAL_TOKENS = frozenset(
    {"total_power", "normal_power", "qualifying_source_count", "breadth"}
)
#: Historical ratio Trial tokens — deliberately non-local (REQ-8.5).
HISTORICAL_TRIAL_TOKENS = frozenset(
    {"legacy_utilization", "legacy_focus", "hybrid_efficiency", "hybrid_commitment"}
)


# --------------------------------------------------------------------------- #
# Comparator contexts                                                          #
# --------------------------------------------------------------------------- #


@dataclass(frozen=True)
class TrialLocalView:
    """Everything a PREFERRED-LOCAL comparator is allowed to read: the contested
    Trial's entry, and nothing else (REQ-8.6).

    There is deliberately no player state, no other-Trial data and no Spellbook
    total here — a local comparator that wanted to divide by power outside the
    Trial simply could not reach it.
    """

    config: Configuration
    trial: Trial
    normal_on: Mapping[str, int]  # domain -> POSITIVE normal power on THIS Trial
    normal_total: int  # legal normal power on THIS Trial (Wild excluded)
    total_power: int  # legal normal + legal Wild on THIS Trial


@dataclass(frozen=True)
class TrialTiebreakContext:
    """Full context for HISTORICAL ratio comparators.

    In addition to the local view it exposes the player's derived state
    (per-domain capacities and total normal Spellbook power) and the player's
    total normal power allocated across *all* Trials — the out-of-Trial
    quantities the historical ratios divide by (design §6.1–§6.4).
    """

    local: TrialLocalView
    state: PlayerState
    allocated_normal_total: int  # player's positive normal allocated across ALL Trials (§6.2)


@dataclass(frozen=True)
class FinalTiebreakContext:
    """Context for a final-result comparator (design §5.3 final tokens; §8.2).

    ``sole_first_count`` is the number of outright (non-shared) first-place Trial
    awards the player holds — a resolved-Trial fact, not a player-state statistic.
    """

    state: PlayerState
    sole_first_count: int


# --------------------------------------------------------------------------- #
# Ratio helper                                                                 #
# --------------------------------------------------------------------------- #


def _ratio(numerator: int, denominator: int, token: str, ctx: TrialTiebreakContext) -> Fraction:
    """Exact rational value with an explicit zero-denominator guard.

    A zero (or negative) denominator is invalid input and must not arise for a
    legal normal entry (impl spec §7.4); we fail loudly rather than silently
    producing a bogus comparison (NFR-4).
    """
    if denominator <= 0:
        raise ValueError(
            f"{token}: non-positive denominator ({denominator}) on trial "
            f"{ctx.local.trial.id!r} for player {ctx.state.player_id!r}; a ratio "
            f"tiebreak requires a legal normal entry with positive denominator"
        )
    return Fraction(numerator, denominator)


# --------------------------------------------------------------------------- #
# PREFERRED-LOCAL comparators (design §6.5 breadth; REQ-8.6)                    #
# --------------------------------------------------------------------------- #


def local_total_power(view: TrialLocalView) -> int:
    """Legal normal + legal Wild on this Trial (model §8.1). Trial-local."""
    return view.total_power


def local_normal_power(view: TrialLocalView) -> int:
    """Legal normal power on this Trial, Wild excluded (model §8.1). Trial-local."""
    return view.normal_total


def local_qualifying_source_count(view: TrialLocalView) -> int:
    """Positive normal sources counted by the Trial's declared counting universe
    (model §8.1). Trial-local: depends only on this Trial's entry and the Trial's
    own predicate."""
    return qualifying_source_count(view.config, view.trial, view.normal_on)


def local_breadth(view: TrialLocalView) -> int:
    """Count of distinct qualifying normal domains represented on this Trial
    (design §6.5). Trial-local: counts this Trial's own positive normal domains
    that pass the Trial's allow/forbid filters."""
    return len(qualifying_source_domains(view.config, view.trial, view.normal_on))


# --------------------------------------------------------------------------- #
# HISTORICAL ratio comparators (design §6.1–§6.4; labelled historical REQ-8.5) #
# --------------------------------------------------------------------------- #


def historical_legacy_utilization(ctx: TrialTiebreakContext) -> Fraction:
    """§6.1 Utilization ratio (HISTORICAL).

    numerator   = normal power on this Trial from **qualifying used** domains
    denominator = total available capacity of those **same qualifying used** domains

    Restricting to qualifying-used domains is what distinguishes utilization from
    efficiency (§6.3), which divides by the capacity of *all* represented domains.
    """
    view = ctx.local
    qdoms = qualifying_source_domains(view.config, view.trial, view.normal_on)
    numerator = sum(view.normal_on.get(d, 0) for d in qdoms)
    denominator = sum(ctx.state.normal_power.get(d, 0) for d in qdoms)
    return _ratio(numerator, denominator, "legacy_utilization", ctx)


def historical_hybrid_efficiency(ctx: TrialTiebreakContext) -> Fraction:
    """§6.3 Efficiency ratio (HISTORICAL).

    numerator   = normal power on this Trial
    denominator = total capacity of the normal domains **represented** on this Trial

    Uses every domain used positively on the Trial (qualifying or not), which is
    what distinguishes it from utilization (§6.1).
    """
    view = ctx.local
    represented = [d for d, p in view.normal_on.items() if p > 0]
    numerator = view.normal_total
    denominator = sum(ctx.state.normal_power.get(d, 0) for d in represented)
    return _ratio(numerator, denominator, "hybrid_efficiency", ctx)


def historical_legacy_focus(ctx: TrialTiebreakContext) -> Fraction:
    """§6.2 Focus ratio (HISTORICAL).

    numerator   = normal power on this Trial
    denominator = player's total normal power **allocated across all Trials**

    The denominator is an allocation quantity (what the player actually placed on
    Trials), which is what distinguishes focus from commitment (§6.4), whose
    denominator is the player's total normal Spellbook power.
    """
    numerator = ctx.local.normal_total
    denominator = ctx.allocated_normal_total
    return _ratio(numerator, denominator, "legacy_focus", ctx)


def historical_hybrid_commitment(ctx: TrialTiebreakContext) -> Fraction:
    """§6.4 Commitment ratio (HISTORICAL).

    numerator   = normal power on this Trial
    denominator = player's total normal **Spellbook** power (all derived domains)

    The denominator is the player's whole normal power (allocated or not), which
    is what distinguishes commitment from focus (§6.2).
    """
    numerator = ctx.local.normal_total
    denominator = ctx.state.total_normal_power()
    return _ratio(numerator, denominator, "hybrid_commitment", ctx)


# --------------------------------------------------------------------------- #
# Final-result comparators (design §5.3; model §8.2)                           #
# --------------------------------------------------------------------------- #


def final_first_place_trial_count(ctx: FinalTiebreakContext) -> int:
    """Number of outright (non-shared) first-place Trial awards (model §8.2).
    Reads resolved Trial placements, not a player-state statistic."""
    return ctx.sole_first_count


def final_total_normal_power(ctx: FinalTiebreakContext) -> int:
    """Sum of all normal domain power in the derived state (model §8.2)."""
    return ctx.state.total_normal_power()


def final_spell_count(ctx: FinalTiebreakContext) -> int:
    """``tau.spell_count`` from the derived player state (model §8.2)."""
    return ctx.state.tiebreak_stats.get("spell_count", 0)


def final_largest_spell(ctx: FinalTiebreakContext) -> int:
    """``tau.largest_spell`` from the derived player state (model §8.2)."""
    return ctx.state.tiebreak_stats.get("largest_spell", 0)


# --------------------------------------------------------------------------- #
# Registries + dispatch                                                        #
# --------------------------------------------------------------------------- #

_LOCAL_TRIAL_COMPARATORS: dict[str, Callable[[TrialLocalView], int]] = {
    "total_power": local_total_power,
    "normal_power": local_normal_power,
    "qualifying_source_count": local_qualifying_source_count,
    "breadth": local_breadth,
}

_HISTORICAL_TRIAL_COMPARATORS: dict[str, Callable[[TrialTiebreakContext], Fraction]] = {
    "legacy_utilization": historical_legacy_utilization,
    "legacy_focus": historical_legacy_focus,
    "hybrid_efficiency": historical_hybrid_efficiency,
    "hybrid_commitment": historical_hybrid_commitment,
}

_FINAL_COMPARATORS: dict[str, Callable[[FinalTiebreakContext], int]] = {
    "first_place_trial_count": final_first_place_trial_count,
    "total_normal_power": final_total_normal_power,
    "spell_count": final_spell_count,
    "largest_spell": final_largest_spell,
}

#: Documented numerator/denominator for every ratio token (REQ-8.4/8.5).
RATIO_SEMANTICS: dict[str, dict[str, object]] = {
    "legacy_utilization": {
        "historical": True,
        "design_section": "6.1",
        "numerator": "normal power on this Trial from qualifying used domains",
        "denominator": "total available capacity of those same qualifying used domains",
    },
    "legacy_focus": {
        "historical": True,
        "design_section": "6.2",
        "numerator": "normal power on this Trial",
        "denominator": "player's total normal power allocated across all Trials",
    },
    "hybrid_efficiency": {
        "historical": True,
        "design_section": "6.3",
        "numerator": "normal power on this Trial",
        "denominator": "total capacity of normal domains represented on this Trial",
    },
    "hybrid_commitment": {
        "historical": True,
        "design_section": "6.4",
        "numerator": "normal power on this Trial",
        "denominator": "player's total normal Spellbook power",
    },
}


def is_local_token(token: str) -> bool:
    """True for a preferred-local Trial token (reads only the contested Trial)."""
    return token in _LOCAL_TRIAL_COMPARATORS


def is_historical_token(token: str) -> bool:
    """True for a historical ratio Trial token (reads power outside the Trial)."""
    return token in _HISTORICAL_TRIAL_COMPARATORS


def trial_token_value(token: str, ctx: TrialTiebreakContext):
    """Value of ``token`` for one contender.

    Preferred-local tokens are evaluated against ``ctx.local`` alone — they never
    touch ``ctx.state`` or ``ctx.allocated_normal_total`` — which is how locality
    (REQ-8.6) is enforced structurally. Historical ratio tokens receive the full
    context.
    """
    local_fn = _LOCAL_TRIAL_COMPARATORS.get(token)
    if local_fn is not None:
        return local_fn(ctx.local)
    hist_fn = _HISTORICAL_TRIAL_COMPARATORS.get(token)
    if hist_fn is not None:
        return hist_fn(ctx)
    raise ValueError(f"unknown trial tiebreak token {token!r}")


def final_token_value(token: str, ctx: FinalTiebreakContext) -> int:
    """Value of a final-result ``token`` for one player (excludes ``shared``)."""
    fn = _FINAL_COMPARATORS.get(token)
    if fn is None:
        raise ValueError(f"unknown final tiebreak token {token!r}")
    return fn(ctx)
