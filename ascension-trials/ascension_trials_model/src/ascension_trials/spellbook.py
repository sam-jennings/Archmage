"""Spellbook validation (spec v1.1 §5.1)."""

from __future__ import annotations

from .schema import SPELL_TYPES, Configuration, Spellbook, ValidationResult

# Spell types that must name an energy domain.
_ENERGY_TYPES = frozenset({"conjuration", "perfect_transmutation"})


def validate_spellbook(spellbook: Spellbook, config: Configuration) -> ValidationResult:
    result = ValidationResult()
    energy_domain_ids = {d.id for d in config.domains if d.domain_class == "energy"}
    seen: set[str] = set()

    for spell in spellbook.spells:
        if spell.spell_id in seen:
            result.error(f"duplicate spell id {spell.spell_id!r}")
        seen.add(spell.spell_id)

        if spell.type not in SPELL_TYPES:
            result.error(f"spell {spell.spell_id}: unknown type {spell.type!r}")
        if spell.size <= 0:
            result.error(f"spell {spell.spell_id}: size must be a positive integer")

        if spell.type in _ENERGY_TYPES:
            if not spell.energy_domain:
                result.error(f"spell {spell.spell_id}: {spell.type} requires an energy_domain")
            elif spell.energy_domain not in energy_domain_ids:
                result.error(
                    f"spell {spell.spell_id}: energy_domain {spell.energy_domain!r} "
                    "is not a declared energy domain"
                )
        elif spell.energy_domain:
            result.error(
                f"spell {spell.spell_id}: {spell.type} must not declare an energy_domain"
            )

    return result
