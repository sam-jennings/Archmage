"""Load and validate configurations, Spellbooks, states and allocations from data.

JSON in, dataclasses out (spec v1.1 §5, §6). No configuration-specific code
branches: every candidate ruleset is described entirely by its data file.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from .schema import (
    ACCEPTED_FINAL_TIEBREAK_TOKENS,
    ACCEPTED_TRIAL_TIEBREAK_TOKENS,
    COMPLETION_POLICIES,
    CONTRIBUTION_FORMULAS,
    DEFAULT_TIEBREAK_STATS,
    ENCHANTMENT_POWER_TYPES,
    ENTRY_FLOOR_SCOPES,
    FINAL_TIEBREAK_TOKENS,
    FINAL_TOKEN_REQUIRED_STAT,
    ILLEGAL_TRIAL_ENTRY_ACTIONS,
    INFEASIBLE_FULL_FALLBACKS,
    MALFORMED_ALLOCATION_ACTIONS,
    OVERALLOCATED_DOMAIN_ACTIONS,
    OVERALLOCATED_WILD_ACTIONS,
    RATIO_TOKENS,
    ROUNDING_MODES,
    SOURCE_COUNT_UNIVERSES_FIXED,
    SPELL_TYPES,
    STANDARD_POWER_TYPES,
    TIE_AWARD_TYPES,
    TRIAL_TIEBREAK_TOKENS,
    Allocation,
    AllocationRules,
    Configuration,
    Contribution,
    CountBound,
    Domain,
    Eligibility,
    EnchantmentPower,
    EntryFloor,
    IndependentScore,
    InvalidationPolicy,
    PlayerState,
    PowerFormula,
    PowerSegment,
    SourceCount,
    Spell,
    Spellbook,
    StandardSpellPower,
    TieAward,
    Trial,
    ValidationResult,
    WildRules,
    canonical_final_tiebreak,
    canonical_trial_tiebreak,
)
from .provenance import is_valid_provenance

VALID_PROFILES = frozenset(
    {"trials_power_v28", "legacy_v28", "hybrid_2n_minus_3", "declarative"}
)


# --------------------------------------------------------------------------- #
# Parsing                                                                      #
# --------------------------------------------------------------------------- #


def _count_bound(raw: Any) -> CountBound:
    raw = raw or {}
    return CountBound(minimum=int(raw.get("minimum", 0)), maximum=_opt_int(raw.get("maximum")))


def _opt_int(value: Any) -> int | None:
    return None if value is None else int(value)


def _parse_eligibility(raw: dict[str, Any]) -> Eligibility:
    raw = raw or {}
    sc_raw = raw.get("source_count")
    source_count = None
    if sc_raw:
        source_count = SourceCount(
            universe=sc_raw["universe"],
            minimum=int(sc_raw.get("minimum", 0)),
            maximum=_opt_int(sc_raw.get("maximum")),
        )
    return Eligibility(
        allowed_domain_ids=list(raw.get("allowed_domain_ids", [])),
        allowed_domain_classes=list(raw.get("allowed_domain_classes", [])),
        forbidden_domain_ids=list(raw.get("forbidden_domain_ids", [])),
        forbidden_domain_classes=list(raw.get("forbidden_domain_classes", [])),
        source_count=source_count,
        required_class_counts={
            k: _count_bound(v) for k, v in (raw.get("required_class_counts") or {}).items()
        },
        required_domain_counts={
            k: _count_bound(v) for k, v in (raw.get("required_domain_counts") or {}).items()
        },
    )


def _parse_trial(raw: dict[str, Any]) -> Trial:
    rewards_raw = (raw.get("rewards") or {}).get("by_player_count", {})
    rewards = {int(k): {rk: int(rv) for rk, rv in v.items()} for k, v in rewards_raw.items()}
    ef = raw.get("entry_floor") or {}
    ta = raw.get("tie_award") or {}
    return Trial(
        id=raw["id"],
        active_player_counts=[int(x) for x in raw.get("active_player_counts", [])],
        eligibility=_parse_eligibility(raw.get("eligibility", {})),
        trial_tiebreaks=[
            canonical_trial_tiebreak(t) for t in raw.get("trial_tiebreaks", [])
        ],
        entry_floor=EntryFloor(value=int(ef.get("value", 0)), scope=ef.get("scope", "normal")),
        tie_award=TieAward(type=ta.get("type", "shared_full")),
        rewards_by_player_count=rewards,
        suppress_lower_on_shared_first=bool(raw.get("suppress_lower_on_shared_first", False)),
    )


def _parse_standard_power(raw: dict[str, Any]) -> StandardSpellPower:
    segments = [
        PowerSegment(
            expression=seg["expression"],
            min_size=_opt_int(seg.get("min_size")),
            max_size=_opt_int(seg.get("max_size")),
            rounding=seg.get("rounding"),
        )
        for seg in raw.get("piecewise", [])
    ]
    return StandardSpellPower(
        type=raw["type"],
        segments=segments,
        expression=raw.get("expression"),
        rounding=raw.get("rounding"),
    )


def _parse_contribution(raw: dict[str, Any]) -> Contribution:
    targets = {}
    wild = 0
    for key, value in raw.items():
        if key == "wild":
            wild = int(value)
        else:
            targets[key] = value
    return Contribution(targets=targets, wild=wild)


def _parse_power_formula(raw: dict[str, Any]) -> PowerFormula:
    ench_raw = raw.get("enchantment_power", {})
    table = {int(k): int(v) for k, v in (ench_raw.get("table") or {}).items()}
    return PowerFormula(
        profile=raw["profile"],
        standard_spell_power=_parse_standard_power(raw["standard_spell_power"]),
        enchantment_power=EnchantmentPower(type=ench_raw.get("type", "spell_size"), table=table),
        contributions={
            k: _parse_contribution(v) for k, v in (raw.get("contributions") or {}).items()
        },
        enchantment_wild_sizes=[int(x) for x in raw.get("enchantment_wild_sizes", [])],
        version=str(raw.get("version", "")),
        experimental=bool(raw.get("experimental", False)),
    )


def _parse_allocation_rules(raw: dict[str, Any]) -> AllocationRules:
    raw = raw or {}
    inv = raw.get("invalidation") or {}
    return AllocationRules(
        completion=raw.get("completion", "maximal"),
        residue_allowed=bool(raw.get("residue_allowed", True)),
        infeasible_full_fallback=raw.get("infeasible_full_fallback", "reject"),
        invalidation=InvalidationPolicy(
            illegal_trial_entry=inv.get("illegal_trial_entry", "ignore_entry"),
            overallocated_domain=inv.get("overallocated_domain", "invalidate_entries_using_domain"),
            overallocated_wild=inv.get("overallocated_wild", "invalidate_entries_using_wild"),
            malformed_allocation=inv.get("malformed_allocation", "reject_profile"),
        ),
    )


def config_from_dict(raw: dict[str, Any]) -> Configuration:
    wild_raw = raw.get("wild", {})
    return Configuration(
        id=raw["id"],
        version=str(raw["version"]),
        power_formula=_parse_power_formula(raw["power_formula"]),
        domains=[
            Domain(id=d["id"], domain_class=d["class"], symmetry_group=d.get("symmetry_group"))
            for d in raw.get("domains", [])
        ],
        trials=[_parse_trial(t) for t in raw.get("trials", [])],
        wild=WildRules(
            enabled=wild_raw.get("enabled", True),
            can_enter_alone=wild_raw.get("can_enter_alone", False),
            requires_legal_normal_entry=wild_raw.get("requires_legal_normal_entry", True),
            counts_as_source=wild_raw.get("counts_as_source", False),
            can_satisfy_source_minimum=wild_raw.get("can_satisfy_source_minimum", False),
            can_break_source_maximum=wild_raw.get("can_break_source_maximum", False),
            included_in_primary_total=wild_raw.get("included_in_primary_total", True),
            included_in_tiebreaks=wild_raw.get("included_in_tiebreaks", False),
        ),
        allocation=_parse_allocation_rules(raw.get("allocation", {})),
        final_tiebreaks=[
            canonical_final_tiebreak(t)
            for t in (raw.get("final_result") or {}).get("final_tiebreaks", [])
        ],
        supported_player_counts=[int(x) for x in raw.get("supported_player_counts", [])],
        rounding_mode=(raw.get("rounding") or {}).get("mode", "half_up"),
        declared_tiebreak_stats=list(
            raw.get("declared_tiebreak_stats", DEFAULT_TIEBREAK_STATS)
        ),
        historical_candidate=bool(raw.get("historical_candidate", False)),
        stale_by_design=bool(raw.get("stale_by_design", False)),
        notes=list(raw.get("notes", [])),
    )


def load_configuration(path: str | Path) -> Configuration:
    with open(path, "r", encoding="utf-8") as fh:
        return config_from_dict(json.load(fh))


# --------------------------------------------------------------------------- #
# Spellbook / state / allocation loaders                                       #
# --------------------------------------------------------------------------- #


def spellbook_from_dict(raw: dict[str, Any]) -> Spellbook:
    return Spellbook(
        spellbook_id=raw["spellbook_id"],
        spells=[
            Spell(
                spell_id=s["spell_id"],
                type=s["type"],
                size=int(s["size"]),
                energy_domain=s.get("energy_domain"),
            )
            for s in raw.get("spells", [])
        ],
    )


def state_from_dict(raw: dict[str, Any]) -> PlayerState:
    score_raw = raw.get("independent_score") or {}
    prov = raw.get("provenance") or {}
    return PlayerState(
        player_id=raw["player_id"],
        normal_power={k: int(v) for k, v in (raw.get("normal_power") or {}).items()},
        wild_power=int(raw.get("wild_power", 0)),
        tiebreak_stats={k: int(v) for k, v in (raw.get("tiebreak_stats") or {}).items()},
        independent_score=IndependentScore(
            value=_opt_int(score_raw.get("value")),
            # accept both the current "scoring_version" key and the legacy "version" key
            scoring_version=score_raw.get("scoring_version") or score_raw.get("version"),
            content_hash=score_raw.get("content_hash"),
        ),
        power_profile_version=raw.get("power_profile_version"),
        provenance_type=prov.get("type", "synthetic-controlled"),
        provenance_source_id=prov.get("source_id"),
    )


def allocation_from_dict(raw: dict[str, Any]) -> Allocation:
    residue = raw.get("residue") or {}
    return Allocation(
        player_id=raw["player_id"],
        normal={
            t: {d: int(p) for d, p in doms.items()} for t, doms in (raw.get("normal") or {}).items()
        },
        wild={t: int(p) for t, p in (raw.get("wild") or {}).items()},
        residue_normal={d: int(p) for d, p in (residue.get("normal") or {}).items()},
        residue_wild=int(residue.get("wild", 0)),
    )


# --------------------------------------------------------------------------- #
# Configuration validation (spec v1.1 §7.1 step 1)                             #
# --------------------------------------------------------------------------- #


def validate_configuration(config: Configuration) -> ValidationResult:
    result = ValidationResult()
    if not config.id:
        result.error("configuration missing id")
    if not config.version:
        result.error("configuration missing version")

    if config.power_formula.profile not in VALID_PROFILES:
        result.error(f"unknown power profile: {config.power_formula.profile!r}")

    domain_ids = {d.id for d in config.domains}
    domain_classes = {d.domain_class for d in config.domains}
    if len(domain_ids) != len(config.domains):
        result.error("duplicate domain ids")

    # Final tiebreaks
    for tok in config.final_tiebreaks:
        if tok not in FINAL_TIEBREAK_TOKENS:
            result.error(f"unrecognized final tiebreak token: {tok!r}")

    # State closure (model §4 "state-closed"; design §7.2): a final tiebreak that
    # reads a player-state statistic must have that statistic declared available,
    # otherwise the configuration asks for a fact no state can supply.
    declared_stats = set(config.declared_tiebreak_stats)
    for tok in config.final_tiebreaks:
        stat = FINAL_TOKEN_REQUIRED_STAT.get(tok)
        if stat is not None and stat not in declared_stats:
            result.error(
                f"final tiebreak {tok!r} requires player-state statistic {stat!r}, "
                f"which is not declared available (declared_tiebreak_stats="
                f"{sorted(declared_stats)})"
            )

    # Allocation completion
    if config.allocation.completion not in COMPLETION_POLICIES:
        result.error(f"unknown completion policy: {config.allocation.completion!r}")

    seen_trials: set[str] = set()
    for trial in config.trials:
        if trial.id in seen_trials:
            result.error(f"duplicate trial id: {trial.id}")
        seen_trials.add(trial.id)

        for tok in trial.trial_tiebreaks:
            if tok not in TRIAL_TIEBREAK_TOKENS:
                result.error(f"trial {trial.id}: unrecognized tiebreak token {tok!r}")
            if tok in RATIO_TOKENS:
                result.warn(
                    f"trial {trial.id}: ratio tiebreak {tok!r} is a historical convention "
                    "expected to expose monotonicity failures (model §8.1)"
                )
        if trial.trial_tiebreaks and trial.trial_tiebreaks[-1] != "shared":
            result.warn(f"trial {trial.id}: tiebreak chain does not terminate in 'shared'")

        _validate_eligibility(config, trial, domain_ids, domain_classes, result)
        _validate_eligibility_contradictions(config, trial, result)

    return result


def _validate_eligibility(config, trial, domain_ids, domain_classes, result) -> None:
    elig = trial.eligibility
    for did in elig.allowed_domain_ids + elig.forbidden_domain_ids:
        if did not in domain_ids:
            result.error(f"trial {trial.id}: references unknown domain id {did!r}")
    for dom in elig.required_domain_counts:
        if dom not in domain_ids:
            result.error(f"trial {trial.id}: required_domain_counts unknown domain {dom!r}")
    for cls in (
        elig.allowed_domain_classes
        + elig.forbidden_domain_classes
        + list(elig.required_class_counts.keys())
    ):
        if cls not in domain_classes:
            result.error(f"trial {trial.id}: references unknown domain class {cls!r}")
    sc = elig.source_count
    if sc is not None:
        uni = sc.universe
        if uni.startswith("class:"):
            if uni.split(":", 1)[1] not in domain_classes:
                result.error(f"trial {trial.id}: source_count universe unknown class {uni!r}")
        elif uni not in ("allowed", "all_normal"):
            result.error(f"trial {trial.id}: invalid source_count universe {uni!r}")


def _eligible_source_domains(config: Configuration, elig: Eligibility) -> list[Domain]:
    """Domains that could legally be a positive normal source under this predicate's
    allow/forbid filters (counts ignored). Used only for contradiction detection."""
    out: list[Domain] = []
    for d in config.domains:
        if elig.allowed_domain_ids and d.id not in elig.allowed_domain_ids:
            continue
        if elig.allowed_domain_classes and d.domain_class not in elig.allowed_domain_classes:
            continue
        if d.id in elig.forbidden_domain_ids:
            continue
        if d.domain_class in elig.forbidden_domain_classes:
            continue
        out.append(d)
    return out


def _validate_eligibility_contradictions(
    config: Configuration, trial: Trial, result: ValidationResult
) -> None:
    """Reject decidably self-contradictory eligibility predicates (REQ-2.6).

    Only statically-decidable contradictions are flagged; predicates that merely
    happen to be unsatisfiable by a particular allocation are the resolver's
    concern, not the schema's.
    """
    elig = trial.eligibility
    tid = trial.id

    # (1) A domain (or class) that is both allowed and forbidden can never be used.
    for did in sorted(set(elig.allowed_domain_ids) & set(elig.forbidden_domain_ids)):
        result.error(f"trial {tid}: domain {did!r} is both allowed and forbidden")
    for cls in sorted(set(elig.allowed_domain_classes) & set(elig.forbidden_domain_classes)):
        result.error(f"trial {tid}: domain class {cls!r} is both allowed and forbidden")

    # (2) source_count minimum above its maximum.
    sc = elig.source_count
    if sc is not None and sc.maximum is not None and sc.minimum > sc.maximum:
        result.error(
            f"trial {tid}: source_count minimum {sc.minimum} exceeds maximum {sc.maximum}"
        )

    # (3) required per-class / per-domain count bound with minimum above maximum.
    for cls, b in elig.required_class_counts.items():
        if b.maximum is not None and b.minimum > b.maximum:
            result.error(
                f"trial {tid}: required_class_counts[{cls!r}] minimum {b.minimum} "
                f"exceeds maximum {b.maximum}"
            )
    for dom, b in elig.required_domain_counts.items():
        if b.maximum is not None and b.minimum > b.maximum:
            result.error(
                f"trial {tid}: required_domain_counts[{dom!r}] minimum {b.minimum} "
                f"exceeds maximum {b.maximum}"
            )

    # Universe of domains that could still be a positive source after filters.
    eligible = _eligible_source_domains(config, elig)
    eligible_ids = {d.id for d in eligible}
    eligible_classes = {d.domain_class for d in eligible}

    requires_a_source = (
        (sc is not None and sc.minimum > 0)
        or any(b.minimum > 0 for b in elig.required_class_counts.values())
        or any(b.minimum > 0 for b in elig.required_domain_counts.values())
    )

    # (4) The allow/forbid filters admit no domain at all, yet a source is required.
    if not eligible and requires_a_source:
        result.error(
            f"trial {tid}: eligibility requires at least one source but its "
            f"allow/forbid filters admit no domain"
        )

    # (5) A required domain with minimum>0 is excluded by the allow/forbid filters.
    for dom, b in elig.required_domain_counts.items():
        if b.minimum > 0 and dom in config.domain_map() and dom not in eligible_ids:
            result.error(
                f"trial {tid}: required_domain_counts requires >= {b.minimum} of "
                f"domain {dom!r}, but the allow/forbid filters exclude it"
            )

    # (6) A required class with minimum>0 has no admissible domain.
    for cls, b in elig.required_class_counts.items():
        if b.minimum > 0 and cls not in eligible_classes:
            result.error(
                f"trial {tid}: required_class_counts requires >= {b.minimum} source(s) "
                f"of class {cls!r}, but no admissible domain has that class"
            )

    # (7) source_count universe class:<c> with minimum>0 is unreachable after filters.
    if sc is not None and sc.minimum > 0 and sc.universe.startswith("class:"):
        target = sc.universe.split(":", 1)[1]
        if target not in eligible_classes:
            result.error(
                f"trial {tid}: source_count universe {sc.universe!r} requires >= "
                f"{sc.minimum} source(s) of class {target!r}, but no admissible domain "
                f"has that class"
            )

    # (8) Distinct sources forced by per-class minima exceed the source maximum.
    # Classes are disjoint, so the sum of class minima is a sound lower bound on the
    # number of distinct sources; compare it against a maximum that counts them all.
    if sc is not None and sc.maximum is not None:
        if sc.universe in ("all_normal", "allowed"):
            min_distinct = sum(b.minimum for b in elig.required_class_counts.values())
            if min_distinct > sc.maximum:
                result.error(
                    f"trial {tid}: per-class minima require >= {min_distinct} distinct "
                    f"source(s) but source_count maximum is {sc.maximum}"
                )
        elif sc.universe.startswith("class:"):
            target = sc.universe.split(":", 1)[1]
            b = elig.required_class_counts.get(target)
            if b is not None and b.minimum > sc.maximum:
                result.error(
                    f"trial {tid}: required_class_counts[{target!r}] minimum {b.minimum} "
                    f"exceeds source_count maximum {sc.maximum} for universe {sc.universe!r}"
                )


# --------------------------------------------------------------------------- #
# Strict structural validation of a raw configuration mapping (REQ-1.4)        #
# --------------------------------------------------------------------------- #
# Unknown fields, unknown enum tokens and missing required fields must produce
# explicit errors rather than being silently dropped by the lenient parser.

_CONFIG_KEYS = frozenset(
    {
        "id",
        "version",
        "historical_candidate",
        "stale_by_design",
        "supported_player_counts",
        "rounding",
        "power_formula",
        "domains",
        "wild",
        "trials",
        "allocation",
        "final_result",
        "declared_tiebreak_stats",
        "notes",
    }
)
_ROUNDING_KEYS = frozenset({"mode"})
_POWER_FORMULA_KEYS = frozenset(
    {
        "profile",
        "version",
        "experimental",
        "standard_spell_power",
        "enchantment_power",
        "contributions",
        "enchantment_wild_sizes",
    }
)
_STANDARD_POWER_KEYS = frozenset({"type", "piecewise", "expression", "rounding"})
_PIECEWISE_SEG_KEYS = frozenset({"expression", "min_size", "max_size", "rounding"})
_ENCHANTMENT_POWER_KEYS = frozenset({"type", "table"})
_DOMAIN_KEYS = frozenset({"id", "class", "symmetry_group"})
_WILD_KEYS = frozenset(
    {
        "enabled",
        "can_enter_alone",
        "requires_legal_normal_entry",
        "counts_as_source",
        "can_satisfy_source_minimum",
        "can_break_source_maximum",
        "included_in_primary_total",
        "included_in_tiebreaks",
    }
)
_TRIAL_KEYS = frozenset(
    {
        "id",
        "active_player_counts",
        "eligibility",
        "entry_floor",
        "tie_award",
        "rewards",
        "trial_tiebreaks",
        "suppress_lower_on_shared_first",
    }
)
_ELIGIBILITY_KEYS = frozenset(
    {
        "allowed_domain_ids",
        "allowed_domain_classes",
        "forbidden_domain_ids",
        "forbidden_domain_classes",
        "source_count",
        "required_class_counts",
        "required_domain_counts",
    }
)
# Undefined generic predicates the model forbids in VS1/VS2 (model §4.1, design §4.3).
_ELIGIBILITY_BANNED_KEYS = ("custom", "mode")
_SOURCE_COUNT_KEYS = frozenset({"universe", "minimum", "maximum"})
_COUNT_BOUND_KEYS = frozenset({"minimum", "maximum"})
_ENTRY_FLOOR_KEYS = frozenset({"value", "scope"})
_TIE_AWARD_KEYS = frozenset({"type"})
_REWARDS_KEYS = frozenset({"by_player_count"})
_ALLOCATION_KEYS = frozenset(
    {"completion", "residue_allowed", "infeasible_full_fallback", "invalidation"}
)
_INVALIDATION_KEYS = frozenset(
    {"illegal_trial_entry", "overallocated_domain", "overallocated_wild", "malformed_allocation"}
)
_FINAL_RESULT_KEYS = frozenset({"final_tiebreaks"})


def _reject_unknown_keys(raw: dict, allowed, path: str, result: ValidationResult) -> None:
    for key in raw:
        if key not in allowed:
            result.error(f"{path}: unknown field {key!r}")


def _require_present(raw: dict, required, path: str, result: ValidationResult) -> None:
    for key in required:
        if key not in raw or raw[key] is None:
            result.error(f"{path}: missing required field {key!r}")


def _check_universe(universe: Any, path: str, result: ValidationResult) -> None:
    if not isinstance(universe, str):
        result.error(f"{path}.universe must be a string")
        return
    if universe in SOURCE_COUNT_UNIVERSES_FIXED:
        return
    if universe.startswith("class:") and len(universe) > len("class:"):
        return
    result.error(f"{path}.universe: invalid value {universe!r}")


def _check_action(value: Any, allowed, path: str, result: ValidationResult) -> None:
    if value is not None and value not in allowed:
        result.error(f"{path}: unknown action {value!r} (allowed: {sorted(allowed)})")


def _validate_power_formula_dict(raw: Any, result: ValidationResult) -> None:
    if raw is None:
        return  # a missing required power_formula is reported at the top level
    if not isinstance(raw, dict):
        result.error("power_formula must be a mapping")
        return
    _reject_unknown_keys(raw, _POWER_FORMULA_KEYS, "power_formula", result)
    _require_present(raw, ("profile", "standard_spell_power"), "power_formula", result)
    profile = raw.get("profile")
    if profile is not None and profile not in VALID_PROFILES:
        result.error(f"power_formula.profile: unknown value {profile!r}")

    ssp = raw.get("standard_spell_power")
    if isinstance(ssp, dict):
        _reject_unknown_keys(ssp, _STANDARD_POWER_KEYS, "power_formula.standard_spell_power", result)
        st = ssp.get("type")
        if st is not None and st not in STANDARD_POWER_TYPES:
            result.error(f"power_formula.standard_spell_power.type: unknown value {st!r}")
        pw = ssp.get("piecewise")
        if pw is not None:
            if not isinstance(pw, list):
                result.error("power_formula.standard_spell_power.piecewise must be a list")
            else:
                for i, seg in enumerate(pw):
                    seg_path = f"power_formula.standard_spell_power.piecewise[{i}]"
                    if not isinstance(seg, dict):
                        result.error(f"{seg_path} must be a mapping")
                    else:
                        _reject_unknown_keys(seg, _PIECEWISE_SEG_KEYS, seg_path, result)
    elif ssp is not None:
        result.error("power_formula.standard_spell_power must be a mapping")

    ench = raw.get("enchantment_power")
    if ench is not None:
        if not isinstance(ench, dict):
            result.error("power_formula.enchantment_power must be a mapping")
        else:
            _reject_unknown_keys(ench, _ENCHANTMENT_POWER_KEYS, "power_formula.enchantment_power", result)
            et = ench.get("type")
            if et is not None and et not in ENCHANTMENT_POWER_TYPES:
                result.error(f"power_formula.enchantment_power.type: unknown value {et!r}")

    contribs = raw.get("contributions")
    if contribs is not None:
        if not isinstance(contribs, dict):
            result.error("power_formula.contributions must be a mapping")
        else:
            for stype, cmap in contribs.items():
                if stype not in SPELL_TYPES:
                    result.error(f"power_formula.contributions: unknown spell type {stype!r}")
                if isinstance(cmap, dict):
                    for target, formula in cmap.items():
                        if target == "wild":
                            continue
                        if formula not in CONTRIBUTION_FORMULAS:
                            result.error(
                                f"power_formula.contributions[{stype!r}][{target!r}]: "
                                f"unknown formula {formula!r}"
                            )


def _validate_domains_dict(raw: Any, result: ValidationResult) -> None:
    if raw is None:
        return
    if not isinstance(raw, list):
        result.error("domains must be a list")
        return
    for i, d in enumerate(raw):
        if not isinstance(d, dict):
            result.error(f"domains[{i}] must be a mapping")
            continue
        _reject_unknown_keys(d, _DOMAIN_KEYS, f"domains[{i}]", result)
        _require_present(d, ("id", "class"), f"domains[{i}]", result)


def _validate_eligibility_dict(raw: Any, path: str, result: ValidationResult) -> None:
    if raw is None:
        return
    if not isinstance(raw, dict):
        result.error(f"{path} must be a mapping")
        return
    for banned in _ELIGIBILITY_BANNED_KEYS:
        if banned in raw:
            result.error(
                f"{path}: undefined generic predicate {banned!r} is not allowed "
                "(declarative predicates only; model §4.1)"
            )
    _reject_unknown_keys(raw, _ELIGIBILITY_KEYS, path, result)

    sc = raw.get("source_count")
    if sc is not None:
        if not isinstance(sc, dict):
            result.error(f"{path}.source_count must be a mapping")
        else:
            _reject_unknown_keys(sc, _SOURCE_COUNT_KEYS, f"{path}.source_count", result)
            if "universe" not in sc or sc["universe"] is None:
                result.error(f"{path}.source_count: missing required field 'universe'")
            else:
                _check_universe(sc["universe"], f"{path}.source_count", result)

    for field_name in ("required_class_counts", "required_domain_counts"):
        bounds = raw.get(field_name)
        if bounds is None:
            continue
        if not isinstance(bounds, dict):
            result.error(f"{path}.{field_name} must be a mapping")
            continue
        for key, bound in bounds.items():
            if not isinstance(bound, dict):
                result.error(f"{path}.{field_name}[{key!r}] must be a mapping")
            else:
                _reject_unknown_keys(bound, _COUNT_BOUND_KEYS, f"{path}.{field_name}[{key!r}]", result)

    for field_name in (
        "allowed_domain_ids",
        "allowed_domain_classes",
        "forbidden_domain_ids",
        "forbidden_domain_classes",
    ):
        value = raw.get(field_name)
        if value is not None and not isinstance(value, list):
            result.error(f"{path}.{field_name} must be a list")


def _validate_trial_dict(raw: Any, path: str, result: ValidationResult) -> None:
    if not isinstance(raw, dict):
        result.error(f"{path} must be a mapping")
        return
    _reject_unknown_keys(raw, _TRIAL_KEYS, path, result)
    _require_present(raw, ("id", "active_player_counts", "trial_tiebreaks"), path, result)

    _validate_eligibility_dict(raw.get("eligibility"), f"{path}.eligibility", result)

    ef = raw.get("entry_floor")
    if ef is not None:
        if not isinstance(ef, dict):
            result.error(f"{path}.entry_floor must be a mapping")
        else:
            _reject_unknown_keys(ef, _ENTRY_FLOOR_KEYS, f"{path}.entry_floor", result)
            scope = ef.get("scope")
            if scope is not None and scope not in ENTRY_FLOOR_SCOPES:
                result.error(f"{path}.entry_floor.scope: unknown value {scope!r}")

    ta = raw.get("tie_award")
    if ta is not None:
        if not isinstance(ta, dict):
            result.error(f"{path}.tie_award must be a mapping")
        else:
            _reject_unknown_keys(ta, _TIE_AWARD_KEYS, f"{path}.tie_award", result)
            ta_type = ta.get("type")
            if ta_type is not None and ta_type not in TIE_AWARD_TYPES:
                result.error(f"{path}.tie_award.type: unknown value {ta_type!r}")

    rewards = raw.get("rewards")
    if rewards is not None:
        if not isinstance(rewards, dict):
            result.error(f"{path}.rewards must be a mapping")
        else:
            _reject_unknown_keys(rewards, _REWARDS_KEYS, f"{path}.rewards", result)

    toks = raw.get("trial_tiebreaks")
    if toks is not None:
        if not isinstance(toks, list):
            result.error(f"{path}.trial_tiebreaks must be a list")
        else:
            for tok in toks:
                if tok not in ACCEPTED_TRIAL_TIEBREAK_TOKENS:
                    result.error(f"{path}.trial_tiebreaks: unknown token {tok!r}")


def _validate_allocation_dict(raw: Any, result: ValidationResult) -> None:
    if raw is None:
        return
    if not isinstance(raw, dict):
        result.error("allocation must be a mapping")
        return
    _reject_unknown_keys(raw, _ALLOCATION_KEYS, "allocation", result)
    comp = raw.get("completion")
    if comp is not None and comp not in COMPLETION_POLICIES:
        result.error(f"allocation.completion: unknown value {comp!r}")
    fallback = raw.get("infeasible_full_fallback")
    if fallback is not None and fallback not in INFEASIBLE_FULL_FALLBACKS:
        result.error(f"allocation.infeasible_full_fallback: unknown value {fallback!r}")
    inv = raw.get("invalidation")
    if inv is not None:
        if not isinstance(inv, dict):
            result.error("allocation.invalidation must be a mapping")
        else:
            _reject_unknown_keys(inv, _INVALIDATION_KEYS, "allocation.invalidation", result)
            _check_action(
                inv.get("illegal_trial_entry"),
                ILLEGAL_TRIAL_ENTRY_ACTIONS,
                "allocation.invalidation.illegal_trial_entry",
                result,
            )
            _check_action(
                inv.get("overallocated_domain"),
                OVERALLOCATED_DOMAIN_ACTIONS,
                "allocation.invalidation.overallocated_domain",
                result,
            )
            _check_action(
                inv.get("overallocated_wild"),
                OVERALLOCATED_WILD_ACTIONS,
                "allocation.invalidation.overallocated_wild",
                result,
            )
            _check_action(
                inv.get("malformed_allocation"),
                MALFORMED_ALLOCATION_ACTIONS,
                "allocation.invalidation.malformed_allocation",
                result,
            )


def _validate_final_result_dict(raw: Any, result: ValidationResult) -> None:
    if raw is None:
        return
    if not isinstance(raw, dict):
        result.error("final_result must be a mapping")
        return
    _reject_unknown_keys(raw, _FINAL_RESULT_KEYS, "final_result", result)
    toks = raw.get("final_tiebreaks")
    if toks is not None:
        if not isinstance(toks, list):
            result.error("final_result.final_tiebreaks must be a list")
        else:
            for tok in toks:
                if tok not in ACCEPTED_FINAL_TIEBREAK_TOKENS:
                    result.error(f"final_result.final_tiebreaks: unknown token {tok!r}")


def validate_config_dict(raw: dict[str, Any]) -> ValidationResult:
    """Strict structural validation of a raw configuration mapping (REQ-1.4).

    Rejects unknown fields, unknown enum tokens and incomplete required fields
    *before* parsing, so typos and undefined ``custom`` predicates surface as
    explicit errors instead of being silently dropped by the lenient parser.
    Semantic checks that need the parsed model (contradictory eligibility, state
    closure, cross-references) live in :func:`validate_configuration`.
    """
    result = ValidationResult()
    if not isinstance(raw, dict):
        result.error(f"configuration must be a mapping, got {type(raw).__name__}")
        return result

    _reject_unknown_keys(raw, _CONFIG_KEYS, "configuration", result)
    _require_present(
        raw, ("id", "version", "power_formula", "domains", "trials"), "configuration", result
    )

    rounding = raw.get("rounding")
    if rounding is not None:
        if not isinstance(rounding, dict):
            result.error("rounding must be a mapping")
        else:
            _reject_unknown_keys(rounding, _ROUNDING_KEYS, "rounding", result)
            mode = rounding.get("mode")
            if mode is not None and mode not in ROUNDING_MODES:
                result.error(f"rounding.mode: unknown value {mode!r}")

    _validate_power_formula_dict(raw.get("power_formula"), result)
    _validate_domains_dict(raw.get("domains"), result)

    wild = raw.get("wild")
    if wild is not None:
        if not isinstance(wild, dict):
            result.error("wild must be a mapping")
        else:
            _reject_unknown_keys(wild, _WILD_KEYS, "wild", result)

    trials = raw.get("trials")
    if trials is not None:
        if not isinstance(trials, list):
            result.error("trials must be a list")
        else:
            for i, trial in enumerate(trials):
                _validate_trial_dict(trial, f"trials[{i}]", result)

    _validate_allocation_dict(raw.get("allocation"), result)
    _validate_final_result_dict(raw.get("final_result"), result)

    for key in ("declared_tiebreak_stats", "supported_player_counts", "notes"):
        value = raw.get(key)
        if value is not None and not isinstance(value, list):
            result.error(f"{key} must be a list")

    return result


def validate_config_document(raw: dict[str, Any]) -> ValidationResult:
    """Full configuration validation: strict structure (REQ-1.4) then semantics.

    Runs :func:`validate_config_dict` on the raw mapping and, only if it is
    structurally sound enough to parse, merges the semantic checks from
    :func:`validate_configuration` (contradictory eligibility REQ-2.6, state
    closure, token vocabulary, cross-references). This is the single entry point
    tests and callers should prefer for a JSON/dict configuration.
    """
    result = validate_config_dict(raw)
    if not result.valid:
        return result
    try:
        config = config_from_dict(raw)
    except (KeyError, TypeError, ValueError) as exc:  # defensive: structural pass slipped through
        result.error(f"configuration could not be parsed: {exc}")
        return result
    result.merge(validate_configuration(config))
    return result
