"""Declarative, conjunctive Trial eligibility (model v2.1 §4.1, §5.3).

A normal source is a domain with positive normal power on the Trial. Wild Magic
is never a source. Every populated predicate must hold; empty fields impose no
restriction. There is no ambiguous ``mode``.
"""

from __future__ import annotations

from .schema import Configuration, CountBound, Eligibility, Trial


def _sources(normal_entry: dict[str, int]) -> list[str]:
    return [dom for dom, power in normal_entry.items() if power > 0]


def _passes_allow_list(elig: Eligibility, dom: str, dom_class: str | None) -> bool:
    if elig.allowed_domain_ids and dom not in elig.allowed_domain_ids:
        return False
    if elig.allowed_domain_classes and dom_class not in elig.allowed_domain_classes:
        return False
    return True


def count_sources_in_universe(
    config: Configuration, elig: Eligibility, universe: str, sources: list[str]
) -> int:
    dmap = config.domain_map()
    if universe == "all_normal":
        return len(sources)
    if universe == "allowed":
        return sum(
            1 for d in sources if _passes_allow_list(elig, d, dmap[d].domain_class if d in dmap else None)
        )
    if universe.startswith("class:"):
        target = universe.split(":", 1)[1]
        return sum(1 for d in sources if d in dmap and dmap[d].domain_class == target)
    raise ValueError(f"invalid source_count universe: {universe!r}")


def _check_bound(count: int, bound: CountBound) -> bool:
    if count < bound.minimum:
        return False
    if bound.maximum is not None and count > bound.maximum:
        return False
    return True


def evaluate_entry(
    config: Configuration, trial: Trial, normal_entry: dict[str, int]
) -> tuple[bool, list[str]]:
    """Return (legal, reasons). Reasons are empty iff the entry is legal.

    This evaluates only the declared *source* predicates. Entry floors, Wild
    rules and inactive-trial checks are handled by the resolver.
    """
    elig = trial.eligibility
    dmap = config.domain_map()
    sources = _sources(normal_entry)
    reasons: list[str] = []

    for dom in sources:
        dom_class = dmap[dom].domain_class if dom in dmap else None
        if dom not in dmap:
            reasons.append(f"unknown domain {dom!r}")
            continue
        if elig.allowed_domain_ids and dom not in elig.allowed_domain_ids:
            reasons.append(f"domain {dom!r} not in allowed_domain_ids")
        if elig.allowed_domain_classes and dom_class not in elig.allowed_domain_classes:
            reasons.append(f"domain class {dom_class!r} not in allowed_domain_classes")
        if dom in elig.forbidden_domain_ids:
            reasons.append(f"domain {dom!r} is forbidden")
        if dom_class in elig.forbidden_domain_classes:
            reasons.append(f"domain class {dom_class!r} is forbidden")

    if elig.source_count is not None:
        sc = elig.source_count
        count = count_sources_in_universe(config, elig, sc.universe, sources)
        if count < sc.minimum:
            reasons.append(
                f"needs >= {sc.minimum} sources in {sc.universe}, found {count}"
            )
        if sc.maximum is not None and count > sc.maximum:
            reasons.append(
                f"allows <= {sc.maximum} sources in {sc.universe}, found {count}"
            )

    for cls, bound in elig.required_class_counts.items():
        count = sum(1 for d in sources if d in dmap and dmap[d].domain_class == cls)
        if not _check_bound(count, bound):
            reasons.append(
                f"class {cls!r} source count {count} outside "
                f"[{bound.minimum}, {bound.maximum}]"
            )

    for dom, bound in elig.required_domain_counts.items():
        present = 1 if normal_entry.get(dom, 0) > 0 else 0
        if not _check_bound(present, bound):
            reasons.append(
                f"domain {dom!r} presence {present} outside [{bound.minimum}, {bound.maximum}]"
            )

    return (len(reasons) == 0, reasons)


def evaluate_entry_with_wild(
    config: Configuration,
    trial: Trial,
    normal_entry: dict[str, int],
    wild_power: int = 0,
) -> tuple[bool, list[str]]:
    """Eligibility of a Trial entry carrying ``wild_power`` Wild Magic.

    Wild is never a source (model §4.3; REQ-2.3, REQ-6.2/6.3): it cannot satisfy
    a minimum source count, cannot supply a required class or domain, and cannot
    break an exact-one / mono-source maximum. Source legality therefore depends
    only on the positive *normal* sources, so the verdict is identical to
    :func:`evaluate_entry` on ``normal_entry`` alone for every ``wild_power``.

    ``wild_power`` is accepted (and deliberately ignored for source purposes) so
    callers and tests can state "Wild is attached to this entry" explicitly and
    confirm it changes nothing. Whether Wild may sit on the Trial at all, and
    dropping Wild attached to an entry that turns out illegal, are the resolver's
    concern (spec §7.3), not the eligibility predicate's.
    """
    return evaluate_entry(config, trial, normal_entry)


def qualifying_source_count(config: Configuration, trial: Trial, normal_entry: dict[str, int]) -> int:
    """Positive normal sources counted by the Trial's declared counting universe
    (used by the ``qualifying_source_count`` tiebreak, model §8.1)."""
    sources = _sources(normal_entry)
    universe = trial.eligibility.source_count.universe if trial.eligibility.source_count else "all_normal"
    return count_sources_in_universe(config, trial.eligibility, universe, sources)


def _domain_qualifies(elig: Eligibility, dom: str, dom_class: str | None) -> bool:
    """True when a positive normal domain passes the Trial's allow/forbid filters,
    i.e. could legally stand as a source on this Trial (counts and floors aside)."""
    if not _passes_allow_list(elig, dom, dom_class):
        return False
    if dom in elig.forbidden_domain_ids:
        return False
    if dom_class in elig.forbidden_domain_classes:
        return False
    return True


def qualifying_source_domains(
    config: Configuration, trial: Trial, normal_entry: dict[str, int]
) -> list[str]:
    """Distinct positive normal domains on the Trial that pass its allow/forbid
    filters — the *qualifying* domains of design §6.5 (``breadth``) and §6.1
    (``legacy_utilization``). Returned sorted for determinism (NFR-1).

    This "allow-list" notion of qualifying is deliberately distinct from
    :func:`qualifying_source_count`, which counts within the Trial's declared
    source-count *universe* (``all_normal`` / ``allowed`` / ``class:<c>``). The
    two coincide when the counting universe is ``allowed`` or unconstrained, and
    diverge when the universe is class-restricted (e.g. a Trial that admits two
    domain classes but counts sources only within one of them).
    """
    dmap = config.domain_map()
    elig = trial.eligibility
    out: list[str] = []
    for dom in _sources(normal_entry):
        dom_class = dmap[dom].domain_class if dom in dmap else None
        if _domain_qualifies(elig, dom, dom_class):
            out.append(dom)
    return sorted(out)
