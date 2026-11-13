"""Canonical ordering and deterministic hashing (spec v1.1 §3.5, §9.1, §18).

All ordering is explicit and sorted; nothing relies on dict/set iteration order.
"""

from __future__ import annotations

import hashlib
import json
from typing import Any

from .schema import Allocation, Configuration, PlayerState


def canonical_json(obj: Any) -> str:
    """Deterministic JSON: sorted keys, compact separators, stable float repr."""
    return json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=True, default=str)


def deterministic_hash(obj: Any) -> str:
    return hashlib.sha256(canonical_json(obj).encode("utf-8")).hexdigest()


def normalized_state(state: PlayerState) -> dict:
    """Order-independent, fully-provenanced view of a player state (design §7.1, §7.11).

    Every map is emitted in sorted-key order so the serialized state never depends
    on dict/hash iteration order (NFR-1). This is one of the six components hashed
    into the deterministic audit hash, so it carries the full state — normal power
    F_C(S), Wild, tiebreak statistics, and both q(S) and F_C(S) provenance.
    """
    score = state.independent_score
    return {
        "player_id": state.player_id,
        "normal_power": {d: p for d, p in sorted(state.normal_power.items())},
        "wild_power": state.wild_power,
        "tiebreak_stats": {k: v for k, v in sorted(state.tiebreak_stats.items())},
        "independent_score": {
            "value": score.value,
            "scoring_version": score.scoring_version,
            "content_hash": score.content_hash,
        },
        "power_profile_version": state.power_profile_version,
        "provenance": {
            "type": state.provenance_type,
            "source_id": state.provenance_source_id,
        },
    }


def normalized_allocation(allocation: Allocation) -> dict:
    """Order-independent view of an allocation (design §7.1, §7.11).

    Trials and domains are emitted in sorted order and zero entries dropped, so two
    allocations differing only by explicit zeros or key order serialize (and hash)
    identically. Residue is recorded exactly as declared — never repaired here.
    """
    normal = {
        trial_id: {d: p for d, p in sorted(allocation.normal[trial_id].items()) if p != 0}
        for trial_id in sorted(allocation.normal)
        if any(p != 0 for p in allocation.normal[trial_id].values())
    }
    wild = {t: p for t, p in sorted(allocation.wild.items()) if p != 0}
    residue_normal = {d: p for d, p in sorted(allocation.residue_normal.items()) if p != 0}
    return {
        "player_id": allocation.player_id,
        "normal": normal,
        "wild": wild,
        "residue_normal": residue_normal,
        "residue_wild": allocation.residue_wild,
    }


def canonical_allocation_key(
    config: Configuration, state: PlayerState, allocation: Allocation
) -> tuple:
    """A hashable, order-independent description of an allocation.

    Domains and Trials are emitted in sorted order; zero entries are dropped so
    that descriptions differing only by explicit zeros collapse together.
    """
    normal = tuple(
        (
            trial_id,
            tuple(
                sorted(
                    (dom, power)
                    for dom, power in allocation.normal.get(trial_id, {}).items()
                    if power != 0
                )
            ),
        )
        for trial_id in sorted(allocation.normal)
        if any(p != 0 for p in allocation.normal.get(trial_id, {}).values())
    )
    wild = tuple(
        (trial_id, power) for trial_id, power in sorted(allocation.wild.items()) if power != 0
    )
    return (state.player_id, normal, wild)
