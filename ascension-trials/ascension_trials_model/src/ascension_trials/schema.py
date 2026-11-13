"""Core data model for the Ascension Trials analysis engine.

Mirrors ASCENSION_TRIALS_CONFIGURATION_MODEL_V2_1.md (§4, §5, §8, §9) and the
Kiro implementation spec v1.1 (§5). Everything here is plain data; behaviour
lives in power.py / eligibility.py / resolver.py.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Optional

# --------------------------------------------------------------------------- #
# Controlled vocabularies (spec v1.1 §5.4, §5.5, §8)                           #
# --------------------------------------------------------------------------- #

SPELL_TYPES = frozenset(
    {"conjuration", "transfiguration", "perfect_transmutation", "enchantment"}
)

# --------------------------------------------------------------------------- #
# Tiebreak-token reconciliation (see requirements REQ-8 vs normative source)   #
# --------------------------------------------------------------------------- #
# requirements.md front-matter declares
#   normative_source: ASCENSION_TRIALS_CONFIGURATION_MODEL_V2_1.md
# so where the requirements-doc token spellings disagree with the normative
# model (§8.1/§8.2) and the Kiro implementation spec (§5.4/§5.5), the normative
# spelling is canonical. The reconciliation is:
#
#   * The normative model §8.1 recognises TWO ratio *conventions*, each kept
#     under two provenance-separate token names (model §8.1, spec §5.4/§7.4):
#       - capacity ratio   -> `legacy_utilization`, `hybrid_efficiency`
#       - commitment ratio -> `legacy_focus`, `hybrid_commitment`
#     Design §6.1-§6.4, however, gives all four DISTINCT numerator/denominator
#     definitions (utilization != efficiency, focus != commitment). Design §16
#     makes the pre-spec implementation provisional until the acceptance tests
#     pass, so Task 8 implements the design §6 DISTINCT denominators; the model
#     §8.1 pairing survives only as provenance, not as a shared formula. The
#     authoritative per-token numerator/denominator lives in
#     `comparators.RATIO_SEMANTICS`; the executable comparators are in
#     `comparators.py`. requirements' `efficiency_ratio`/`commitment_ratio` are
#     accepted as aliases (below) that canonicalize to the normative token names.
#   * requirements' generic spellings
#       utilization_ratio / focus_ratio / efficiency_ratio / commitment_ratio
#     and the final token `first_place_trial_wins`
#     are accepted as aliases that canonicalize to the normative tokens, so a
#     config authored against requirements.md still validates (REQ-8 tokens are
#     represented, not dropped).
#   * `breadth` IS genuinely absent from the normative §8.1 list but is required
#     by REQ-8.1 and given a distinct definition in design §5.3/§6.5 ("count of
#     distinct qualifying normal domains represented on the Trial"). It is a
#     distinct integer-count comparator (NOT a ratio, NOT an alias), so it is
#     added to the canonical vocabulary as a first-class token.

# Canonical Trial-tiebreak tokens. Ratio tokens compare as exact rationals.
TRIAL_TIEBREAK_TOKENS = frozenset(
    {
        "total_power",
        "normal_power",
        "qualifying_source_count",
        "breadth",  # REQ-8.1 / design §6.5; omitted by model §8.1, added here
        "legacy_utilization",
        "legacy_focus",
        "hybrid_efficiency",
        "hybrid_commitment",
        "shared",
    }
)

# requirements.md (REQ-8.1) spellings -> canonical normative token.
TRIAL_TIEBREAK_ALIASES = {
    "utilization_ratio": "legacy_utilization",
    "focus_ratio": "legacy_focus",
    "efficiency_ratio": "hybrid_efficiency",
    "commitment_ratio": "hybrid_commitment",
}

# Integer-count comparators (higher is better); neither is a ratio.
COUNT_TOKENS = frozenset({"qualifying_source_count", "breadth"})

# Historical ratio tokens grouped by their model-§8.1 *provenance* convention.
# NOTE: under design §6 (implemented in comparators.py) each of the four tokens
# has its own DISTINCT denominator; these two groupings are retained only as the
# model-§8.1 provenance pairing and are NOT used to compute comparator values.
CAPACITY_RATIO_TOKENS = frozenset({"legacy_utilization", "hybrid_efficiency"})
COMMITMENT_RATIO_TOKENS = frozenset({"legacy_focus", "hybrid_commitment"})
# All historical ratio tokens (used only to flag them as historical on load).
RATIO_TOKENS = CAPACITY_RATIO_TOKENS | COMMITMENT_RATIO_TOKENS

# Every spelling a config file may legally use for a Trial tiebreak.
ACCEPTED_TRIAL_TIEBREAK_TOKENS = TRIAL_TIEBREAK_TOKENS | frozenset(TRIAL_TIEBREAK_ALIASES)

# Final-result tiebreak tokens (model §8.2).
FINAL_TIEBREAK_TOKENS = frozenset(
    {
        "first_place_trial_count",
        "total_normal_power",
        "spell_count",
        "largest_spell",
        "shared",
    }
)

# requirements.md (REQ-8.2) spelling -> canonical normative token.
FINAL_TIEBREAK_ALIASES = {
    "first_place_trial_wins": "first_place_trial_count",
}
ACCEPTED_FINAL_TIEBREAK_TOKENS = FINAL_TIEBREAK_TOKENS | frozenset(FINAL_TIEBREAK_ALIASES)


def canonical_trial_tiebreak(token: str) -> str:
    """Map a requirements-doc alias to its canonical normative Trial token."""
    return TRIAL_TIEBREAK_ALIASES.get(token, token)


def canonical_final_tiebreak(token: str) -> str:
    """Map a requirements-doc alias to its canonical normative final token."""
    return FINAL_TIEBREAK_ALIASES.get(token, token)


# State closure (model §4 "state-closed"; §5.2 typical τ fields; design §7.2):
# each final token consumes at most one player-state statistic. Tokens absent
# from this map read Trial results (`first_place_trial_count`) or the always
# derived normal-power vector (`total_normal_power`), so they impose no
# tiebreak-stat closure requirement.
FINAL_TOKEN_REQUIRED_STAT = {
    "spell_count": "spell_count",
    "largest_spell": "largest_spell",
}
# τ statistics the power-derivation layer supplies by default (model §5.2).
DEFAULT_TIEBREAK_STATS = ("spell_count", "largest_spell")

COMPLETION_POLICIES = frozenset({"optional", "maximal", "full"})
INFEASIBLE_FULL_FALLBACKS = frozenset({"reject", "residue"})
SOURCE_COUNT_UNIVERSES_FIXED = frozenset({"allowed", "all_normal"})  # + "class:<c>"

# Invalidation action vocabularies (model §4.2, spec §5.2). Canonical spellings
# match the Kiro implementation spec and the loader defaults.
ILLEGAL_TRIAL_ENTRY_ACTIONS = frozenset({"ignore_entry", "invalidate_entry"})
OVERALLOCATED_DOMAIN_ACTIONS = frozenset({"invalidate_entries_using_domain"})
OVERALLOCATED_WILD_ACTIONS = frozenset({"invalidate_entries_using_wild", "drop_wild"})
MALFORMED_ALLOCATION_ACTIONS = frozenset({"reject_profile"})

TIE_AWARD_TYPES = frozenset({"shared_full", "divided", "none"})
ENTRY_FLOOR_SCOPES = frozenset({"normal", "total"})
STANDARD_POWER_TYPES = frozenset({"piecewise", "linear"})
ENCHANTMENT_POWER_TYPES = frozenset({"spell_size", "table"})
CONTRIBUTION_FORMULAS = frozenset({"standard_spell_power", "enchantment_power"})
ROUNDING_MODES = frozenset({"half_up", "half_even", "floor", "ceiling", "truncate"})


# --------------------------------------------------------------------------- #
# Validation result                                                            #
# --------------------------------------------------------------------------- #


@dataclass
class ValidationResult:
    valid: bool = True
    errors: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)

    def error(self, msg: str) -> None:
        self.valid = False
        self.errors.append(msg)

    def warn(self, msg: str) -> None:
        self.warnings.append(msg)

    def merge(self, other: "ValidationResult") -> None:
        if not other.valid:
            self.valid = False
        self.errors.extend(other.errors)
        self.warnings.extend(other.warnings)


# --------------------------------------------------------------------------- #
# Configuration pieces                                                         #
# --------------------------------------------------------------------------- #


@dataclass(frozen=True)
class Domain:
    id: str
    domain_class: str
    symmetry_group: Optional[str] = None


@dataclass
class CountBound:
    minimum: int = 0
    maximum: Optional[int] = None


@dataclass
class SourceCount:
    universe: str  # "allowed" | "all_normal" | "class:<domain_class>"
    minimum: int = 0
    maximum: Optional[int] = None


@dataclass
class Eligibility:
    allowed_domain_ids: list[str] = field(default_factory=list)
    allowed_domain_classes: list[str] = field(default_factory=list)
    forbidden_domain_ids: list[str] = field(default_factory=list)
    forbidden_domain_classes: list[str] = field(default_factory=list)
    source_count: Optional[SourceCount] = None
    required_class_counts: dict[str, CountBound] = field(default_factory=dict)
    required_domain_counts: dict[str, CountBound] = field(default_factory=dict)


@dataclass
class EntryFloor:
    value: int = 0
    scope: str = "normal"  # "normal" | "total"


@dataclass
class TieAward:
    type: str = "shared_full"  # "shared_full" | "divided" | "none"


@dataclass
class Trial:
    id: str
    active_player_counts: list[int]
    eligibility: Eligibility
    trial_tiebreaks: list[str]
    entry_floor: EntryFloor = field(default_factory=EntryFloor)
    tie_award: TieAward = field(default_factory=TieAward)
    # rewards[player_count] -> {"first": int, "second": int, ...}
    rewards_by_player_count: dict[int, dict[str, int]] = field(default_factory=dict)
    # 6p rule: a shared first suppresses the lower-place award on that Trial.
    suppress_lower_on_shared_first: bool = False

    def is_active(self, player_count: int) -> bool:
        return player_count in self.active_player_counts


@dataclass
class WildRules:
    enabled: bool = True
    can_enter_alone: bool = False
    requires_legal_normal_entry: bool = True
    counts_as_source: bool = False
    can_satisfy_source_minimum: bool = False
    can_break_source_maximum: bool = False
    included_in_primary_total: bool = True
    included_in_tiebreaks: bool = False


@dataclass
class PowerSegment:
    """One branch of a piecewise power formula. Bounds are inclusive; None = open."""

    expression: str
    min_size: Optional[int] = None
    max_size: Optional[int] = None
    rounding: Optional[str] = None  # None | "half_up"


@dataclass
class StandardSpellPower:
    type: str  # "piecewise" | "linear"
    segments: list[PowerSegment] = field(default_factory=list)
    expression: Optional[str] = None
    rounding: Optional[str] = None  # applied to a "linear" expression if set


@dataclass
class EnchantmentPower:
    type: str  # "spell_size" | "table"
    table: dict[int, int] = field(default_factory=dict)


@dataclass
class Contribution:
    """Per spell-type contribution. targets maps a target selector to a formula.

    Target selector: "energy" (route to the spell's own energy_domain) or a
    literal domain id. Value: "standard_spell_power" | "enchantment_power".
    `wild` is a flat Wild grant per spell of this type (e.g. Perfect Transmutation).
    """

    targets: dict[str, str] = field(default_factory=dict)
    wild: int = 0


@dataclass
class PowerFormula:
    # ``profile`` is the Trials-power-profile identifier (design §5.1.2/§5.1.3):
    #   "trials_power_v28"   -> current candidate (v2.8 rulebook formula, experimental=False)
    #   "hybrid_2n_minus_3"  -> experimental candidate (2n-3 family, experimental=True)
    #   "legacy_v28"         -> retained alias for the v2.8 piecewise family
    #   "declarative"        -> generic data-driven profile
    profile: str
    standard_spell_power: StandardSpellPower
    enchantment_power: EnchantmentPower
    contributions: dict[str, Contribution] = field(default_factory=dict)
    enchantment_wild_sizes: list[int] = field(default_factory=list)
    # Provenance of F_C(S): the Trials-power-profile version and whether this profile
    # is an experimental candidate (must never be mistaken for canon / standard scoring).
    version: str = ""
    experimental: bool = False


@dataclass
class InvalidationPolicy:
    illegal_trial_entry: str = "ignore_entry"
    overallocated_domain: str = "invalidate_entries_using_domain"
    overallocated_wild: str = "invalidate_entries_using_wild"
    malformed_allocation: str = "reject_profile"


@dataclass
class AllocationRules:
    completion: str = "maximal"  # optional | maximal | full
    residue_allowed: bool = True
    infeasible_full_fallback: str = "reject"  # reject | residue
    invalidation: InvalidationPolicy = field(default_factory=InvalidationPolicy)


@dataclass
class Configuration:
    id: str
    version: str
    power_formula: PowerFormula
    domains: list[Domain]
    trials: list[Trial]
    wild: WildRules = field(default_factory=WildRules)
    allocation: AllocationRules = field(default_factory=AllocationRules)
    final_tiebreaks: list[str] = field(default_factory=list)
    supported_player_counts: list[int] = field(default_factory=list)
    rounding_mode: str = "half_up"
    # τ statistics the derived player states are declared to provide. Final
    # tiebreak tokens that read a statistic (model §8.2) must be a subset of
    # this set or the configuration is not state-closed (model §4, design §7.2).
    declared_tiebreak_stats: list[str] = field(
        default_factory=lambda: list(DEFAULT_TIEBREAK_STATS)
    )
    historical_candidate: bool = False
    stale_by_design: bool = False
    notes: list[str] = field(default_factory=list)

    # -- lookups -------------------------------------------------------------
    def domain_map(self) -> dict[str, Domain]:
        return {d.id: d for d in self.domains}

    def domain_class(self, domain_id: str) -> Optional[str]:
        d = self.domain_map().get(domain_id)
        return d.domain_class if d else None

    def trial_map(self) -> dict[str, Trial]:
        return {t.id: t for t in self.trials}

    def active_trials(self, player_count: int) -> list[Trial]:
        return [t for t in self.trials if t.is_active(player_count)]


# --------------------------------------------------------------------------- #
# Spellbook + player state + allocation                                        #
# --------------------------------------------------------------------------- #


@dataclass
class Spell:
    spell_id: str
    type: str
    size: int
    energy_domain: Optional[str] = None


@dataclass
class Spellbook:
    spellbook_id: str
    spells: list[Spell] = field(default_factory=list)


@dataclass
class IndependentScore:
    """Standard Recognition Points q(S) together with its provenance.

    q(S) is the standard, non-Trials Spellbook score. It is computed on a code
    path fully independent of Trials domain power F_C(S) (design §5.0): it is
    derived by ``scoring.py`` from the current scoring reference, never from a
    Trials power profile. ``scoring_version`` and ``content_hash`` pin the exact
    reference used so the score cannot silently drift onto an obsolete table
    (REQ-3.3, REQ-3.4, REQ-3.10). ``value is None`` means q(S) has not been
    computed for this state.
    """

    value: Optional[int] = None
    scoring_version: Optional[str] = None  # standard scoring-reference version, e.g. "v3.1"
    content_hash: Optional[str] = None  # SHA-256 of the loaded/adapted scoring reference


@dataclass
class PlayerState:
    player_id: str
    normal_power: dict[str, int] = field(default_factory=dict)
    wild_power: int = 0
    tiebreak_stats: dict[str, int] = field(default_factory=dict)
    independent_score: IndependentScore = field(default_factory=IndependentScore)
    # Provenance of F_C(S): the Trials-power-profile version used to derive
    # ``normal_power``/``wild_power``. Recorded separately from the q(S)
    # provenance carried by ``independent_score`` so the two are independently
    # auditable (REQ-3.10).
    power_profile_version: Optional[str] = None
    provenance_type: str = "synthetic-controlled"
    provenance_source_id: Optional[str] = None

    def total_normal_power(self) -> int:
        return sum(self.normal_power.values())


@dataclass
class Allocation:
    player_id: str
    # normal[trial_id][domain_id] = power
    normal: dict[str, dict[str, int]] = field(default_factory=dict)
    # wild[trial_id] = power
    wild: dict[str, int] = field(default_factory=dict)
    # residue is recorded explicitly; the resolver also recomputes it.
    residue_normal: dict[str, int] = field(default_factory=dict)
    residue_wild: int = 0

    def trials_touched(self) -> set[str]:
        return set(self.normal.keys()) | set(self.wild.keys())

    def normal_on(self, trial_id: str) -> dict[str, int]:
        return {d: p for d, p in self.normal.get(trial_id, {}).items() if p != 0}

    def wild_on(self, trial_id: str) -> int:
        return self.wild.get(trial_id, 0)
