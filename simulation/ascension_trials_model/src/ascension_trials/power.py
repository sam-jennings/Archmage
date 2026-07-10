"""Spellbook -> Trials domain power F_C(S) derivation (design §5.0, §5.1.2/§5.1.3).

This module owns the F_C(S) code path only. It derives per-domain Trials power
and Wild from a configuration's data-driven Trials power profile, and never reads
the standard scoring reference (that is q(S), owned by ``scoring.py``). Keeping the
two paths separate is what makes standard scoring and Trials power independent
(REQ-3.10/REQ-3.11).

The two required profiles are data-driven, not hard-coded:
  - trials_power_v28 (current candidate): piecewise (n; round_half_up(1.5n); 2n)
  - hybrid_2n_minus_3 (experimental):     linear 2n-3
plus a bounded Enchantment scale and Wild-Magic generation.
"""

from __future__ import annotations

import ast
import operator
from decimal import ROUND_HALF_UP, Decimal

from .schema import (
    Configuration,
    IndependentScore,
    PlayerState,
    Spellbook,
    StandardSpellPower,
)

# Safe arithmetic evaluator for power expressions in the single variable ``n``.
_BIN_OPS = {
    ast.Add: operator.add,
    ast.Sub: operator.sub,
    ast.Mult: operator.mul,
    ast.Div: operator.truediv,
    ast.Pow: operator.pow,
}
_UNARY_OPS = {ast.UAdd: operator.pos, ast.USub: operator.neg}


def _eval_node(node: ast.AST, n: int) -> float:
    if isinstance(node, ast.Expression):
        return _eval_node(node.body, n)
    if isinstance(node, ast.Constant):
        if not isinstance(node.value, (int, float)):
            raise ValueError(f"non-numeric constant in power expression: {node.value!r}")
        return float(node.value)
    if isinstance(node, ast.Name):
        if node.id != "n":
            raise ValueError(f"unknown variable in power expression: {node.id!r}")
        return float(n)
    if isinstance(node, ast.BinOp) and type(node.op) in _BIN_OPS:
        return _BIN_OPS[type(node.op)](_eval_node(node.left, n), _eval_node(node.right, n))
    if isinstance(node, ast.UnaryOp) and type(node.op) in _UNARY_OPS:
        return _UNARY_OPS[type(node.op)](_eval_node(node.operand, n))
    raise ValueError(f"unsupported expression element: {ast.dump(node)}")


def eval_power_expression(expression: str, n: int) -> float:
    return _eval_node(ast.parse(expression, mode="eval"), n)


def _to_int(value: float, rounding: str | None) -> int:
    if rounding == "half_up":
        return int(Decimal(str(value)).quantize(Decimal("1"), rounding=ROUND_HALF_UP))
    if rounding in (None, "none"):
        rounded = round(value)
        if abs(value - rounded) > 1e-9:
            raise ValueError(f"non-integer power {value} requires an explicit rounding policy")
        return int(rounded)
    raise ValueError(f"unknown rounding policy: {rounding!r}")


def standard_spell_power(config: Configuration, size: int) -> int:
    """Power contributed by a Conjuration / Transfiguration / Perfect Transmutation."""
    ssp: StandardSpellPower = config.power_formula.standard_spell_power
    if ssp.type == "linear":
        if not ssp.expression:
            raise ValueError("linear standard_spell_power missing expression")
        return _to_int(eval_power_expression(ssp.expression, size), ssp.rounding)
    if ssp.type == "piecewise":
        for seg in ssp.segments:
            if (seg.min_size is None or size >= seg.min_size) and (
                seg.max_size is None or size <= seg.max_size
            ):
                return _to_int(eval_power_expression(seg.expression, size), seg.rounding)
        raise ValueError(f"no power segment covers spell size {size}")
    raise ValueError(f"unknown standard_spell_power type: {ssp.type!r}")


def enchantment_power(config: Configuration, size: int) -> int:
    ep = config.power_formula.enchantment_power
    if ep.type == "spell_size":
        return size
    if ep.type == "table":
        if size not in ep.table:
            raise ValueError(f"enchantment size {size} not in configured table {sorted(ep.table)}")
        return ep.table[size]
    raise ValueError(f"unknown enchantment_power type: {ep.type!r}")


def _resolve_target_domain(target: str, spell) -> str:
    """A contribution target is either 'energy' (the spell's own energy domain)
    or a literal domain id."""
    if target == "energy":
        if not spell.energy_domain:
            raise ValueError(f"spell {spell.spell_id} routes to 'energy' but has no energy_domain")
        return spell.energy_domain
    return target


def profile_version_tag(config: Configuration) -> str:
    """Identifier recorded as F_C(S) provenance on a derived state.

    Formats the Trials-power-profile as ``"<profile>@<version>"`` (or just the
    profile id when no version string is declared), e.g. ``trials_power_v28@2.8``
    or ``hybrid_2n_minus_3@0.1-experimental``.
    """
    pf = config.power_formula
    return f"{pf.profile}@{pf.version}" if pf.version else pf.profile


def derive_player_state(
    spellbook: Spellbook,
    config: Configuration,
    independent_score: IndependentScore | None = None,
    power_profile_version: str | None = None,
    player_id: str | None = None,
    provenance_type: str = "synthetic-controlled",
    provenance_source_id: str | None = None,
) -> PlayerState:
    """Derive Trials domain power F_C(S), Wild and tiebreak statistics.

    This is the F_C(S) code path only: it reads the configuration's Trials power
    profile and never touches the standard scoring reference (design §5.0, layering
    rules). Standard Recognition Points q(S) are computed independently by
    ``scoring.py`` and passed in via ``independent_score`` when a fully provenanced
    state is wanted; leaving it ``None`` records "q(S) not computed" explicitly.
    """
    normal = {d.id: 0 for d in config.domains}
    wild = 0
    contributions = config.power_formula.contributions
    ench_wild_sizes = set(config.power_formula.enchantment_wild_sizes)

    for spell in spellbook.spells:
        contrib = contributions.get(spell.type)
        if contrib is None:
            raise ValueError(f"no contribution rule for spell type {spell.type!r}")
        for target, formula_name in contrib.targets.items():
            if formula_name == "standard_spell_power":
                pw = standard_spell_power(config, spell.size)
            elif formula_name == "enchantment_power":
                pw = enchantment_power(config, spell.size)
            else:
                raise ValueError(f"unknown contribution formula {formula_name!r}")
            dom = _resolve_target_domain(target, spell)
            if dom not in normal:
                raise ValueError(f"spell {spell.spell_id} contributes to undeclared domain {dom!r}")
            normal[dom] += pw
        wild += contrib.wild
        if spell.type == "enchantment" and spell.size in ench_wild_sizes:
            wild += 1

    sizes = [s.size for s in spellbook.spells]
    type_counts: dict[str, int] = {}
    for s in spellbook.spells:
        type_counts[f"{s.type}_count"] = type_counts.get(f"{s.type}_count", 0) + 1
    tiebreak_stats = {
        "spell_count": len(spellbook.spells),
        "largest_spell": max(sizes) if sizes else 0,
        **type_counts,
    }

    return PlayerState(
        player_id=player_id or spellbook.spellbook_id,
        normal_power=normal,
        wild_power=wild,
        tiebreak_stats=tiebreak_stats,
        independent_score=independent_score or IndependentScore(),
        power_profile_version=power_profile_version or profile_version_tag(config),
        provenance_type=provenance_type,
        provenance_source_id=provenance_source_id or spellbook.spellbook_id,
    )
