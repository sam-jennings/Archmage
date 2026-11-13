"""State provenance vocabulary (model v2.1 §5.2)."""

from __future__ import annotations

from enum import Enum


class Provenance(str, Enum):
    """Permitted provenance values for a derived player state."""

    SYNTHETIC_CONTROLLED = "synthetic-controlled"
    SYNTHETIC_ADVERSARIAL = "synthetic-adversarial"
    PLAYTEST_IMPORT = "playtest-import"
    SIMULATOR_IMPORT = "simulator-import"


PERMITTED_PROVENANCE = frozenset(p.value for p in Provenance)


def is_valid_provenance(value: str) -> bool:
    return value in PERMITTED_PROVENANCE
