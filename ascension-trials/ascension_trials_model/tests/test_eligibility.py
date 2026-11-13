"""Task 5 — declarative, conjunctive Trial eligibility evaluation (REQ-2, REQ-6).

Every named predicate below is encoded ONLY from declared schema fields (allowed
IDs/classes, source-count universe + min/max, required per-class/per-domain count
ranges); there is no custom-code predicate (REQ-2.4). Definitions are transcribed
from the normative model §4.1 and the Kiro implementation spec §5.3 — the expected
verdicts are source-backed, not reverse-engineered from the engine (REQ-9.4):

  * Energy Purity   — allowed class ``energy``; sources over ``class:energy`` == 1.
  * Energy Harmony  — allowed class ``energy``; sources over ``class:energy`` >= 2.
  * Transformation  — required domain ``transformation`` >= 1; all others forbidden.
  * Enchantment     — required domain ``enchantment`` >= 1; all others forbidden.
  * Focused Power   — sources over ``all_normal`` == 1.
  * Universal Power — sources over ``all_normal`` >= 2.
  * Complete Mastery— required_class_counts {energy>=1, transformation>=1, enchantment>=1}.

Wild Magic is never a source (model §4.3; REQ-2.3, REQ-6.2/6.3): it cannot satisfy a
minimum source count and cannot legalize a mono / exact-one entry. Because the source
universe is computed over positive NORMAL domains only, ``evaluate_entry_with_wild``
returns the same verdict for any amount of attached Wild.
"""

from __future__ import annotations

import itertools

import pytest

from ascension_trials import eligibility
from ascension_trials.config_loader import config_from_dict, validate_config_document
from ascension_trials.schema import Configuration

# --------------------------------------------------------------------------- #
# Domain universe (rulebook energy types + the transformation/enchantment      #
# domains). Four energy-class domains let us distinguish the source-count      #
# universes cleanly.                                                           #
# --------------------------------------------------------------------------- #

DOMAINS = [
    {"id": "radiance", "class": "energy"},
    {"id": "void", "class": "energy"},
    {"id": "flux", "class": "energy"},
    {"id": "aether", "class": "energy"},
    {"id": "transformation", "class": "transformation"},
    {"id": "enchantment", "class": "enchantment"},
]


# --------------------------------------------------------------------------- #
# Named eligibility predicates — encoded declaratively (model §4.1, spec §5.3) #
# --------------------------------------------------------------------------- #

ENERGY_PURITY = {
    "allowed_domain_classes": ["energy"],
    "source_count": {"universe": "class:energy", "minimum": 1, "maximum": 1},
}
ENERGY_HARMONY = {
    "allowed_domain_classes": ["energy"],
    "source_count": {"universe": "class:energy", "minimum": 2},
}
TRANSFORMATION = {
    "allowed_domain_ids": ["transformation"],
    "required_domain_counts": {"transformation": {"minimum": 1}},
}
ENCHANTMENT = {
    "allowed_domain_ids": ["enchantment"],
    "required_domain_counts": {"enchantment": {"minimum": 1}},
}
FOCUSED_POWER = {
    "source_count": {"universe": "all_normal", "minimum": 1, "maximum": 1},
}
UNIVERSAL_POWER = {
    "source_count": {"universe": "all_normal", "minimum": 2},
}
# Model §4.1 form: purely per-class minima, no source_count needed.
COMPLETE_MASTERY = {
    "required_class_counts": {
        "energy": {"minimum": 1},
        "transformation": {"minimum": 1},
        "enchantment": {"minimum": 1},
    },
}
# Kiro spec §5.3 form: the same predicate with the implied distinct-source floor
# made explicit. It must accept/reject exactly the same source sets.
COMPLETE_MASTERY_SPEC_53 = {
    "source_count": {"universe": "all_normal", "minimum": 3},
    "required_class_counts": {
        "energy": {"minimum": 1},
        "transformation": {"minimum": 1},
        "enchantment": {"minimum": 1},
    },
}

NAMED_PREDICATES = {
    "energy_purity": ENERGY_PURITY,
    "energy_harmony": ENERGY_HARMONY,
    "transformation": TRANSFORMATION,
    "enchantment": ENCHANTMENT,
    "focused_power": FOCUSED_POWER,
    "universal_power": UNIVERSAL_POWER,
    "complete_mastery": COMPLETE_MASTERY,
    "complete_mastery_spec_53": COMPLETE_MASTERY_SPEC_53,
}


# --------------------------------------------------------------------------- #
# Builders                                                                     #
# --------------------------------------------------------------------------- #


def _raw_config(eligibility_block: dict) -> dict:
    return {
        "id": "elig_test",
        "version": "1.0",
        "power_formula": {
            "profile": "declarative",
            "standard_spell_power": {"type": "linear", "expression": "n"},
        },
        "domains": DOMAINS,
        "trials": [
            {
                "id": "t",
                "active_player_counts": [2],
                "eligibility": eligibility_block,
                "trial_tiebreaks": [
                    "total_power",
                    "normal_power",
                    "qualifying_source_count",
                    "shared",
                ],
            }
        ],
    }


def make_config(eligibility_block: dict) -> Configuration:
    return config_from_dict(_raw_config(eligibility_block))


def check(config: Configuration, entry: dict[str, int], wild: int = 0) -> tuple[bool, list[str]]:
    """Evaluate the single Trial's source predicate, with optional attached Wild."""
    return eligibility.evaluate_entry_with_wild(config, config.trials[0], entry, wild)


def is_legal(config: Configuration, entry: dict[str, int], wild: int = 0) -> bool:
    return check(config, entry, wild)[0]


# --------------------------------------------------------------------------- #
# The declarative encodings are self-consistent (REQ-2.4, REQ-2.6)            #
# --------------------------------------------------------------------------- #


@pytest.mark.parametrize("name", sorted(NAMED_PREDICATES))
def test_named_predicate_configuration_validates(name):
    """Each named predicate is representable declaratively and non-contradictory."""
    result = validate_config_document(_raw_config(NAMED_PREDICATES[name]))
    assert result.valid, " || ".join(result.errors)
    # No opaque predicate is used anywhere (REQ-2.4).
    assert "custom" not in NAMED_PREDICATES[name]
    assert "mode" not in NAMED_PREDICATES[name]


# --------------------------------------------------------------------------- #
# Energy Purity — allowed energy; exactly one energy source (REQ-2.1/2.2/2.5)  #
# --------------------------------------------------------------------------- #


def test_energy_purity_qualifies_single_energy_source():
    cfg = make_config(ENERGY_PURITY)
    assert is_legal(cfg, {"void": 5})
    assert is_legal(cfg, {"radiance": 1})


def test_energy_purity_rejects_two_energy_sources():
    """Exact-one maximum over class:energy (REQ-2.1)."""
    cfg = make_config(ENERGY_PURITY)
    ok, reasons = check(cfg, {"void": 3, "radiance": 2})
    assert not ok
    assert any("class:energy" in r and "1" in r for r in reasons)


def test_energy_purity_rejects_non_energy_source():
    """A non-energy source fails the allow-list (REQ-2.1)."""
    cfg = make_config(ENERGY_PURITY)
    ok, reasons = check(cfg, {"transformation": 4})
    assert not ok
    assert any("allowed_domain_classes" in r for r in reasons)


# --------------------------------------------------------------------------- #
# Energy Harmony — allowed energy; at least two energy sources                 #
# --------------------------------------------------------------------------- #


def test_energy_harmony_qualifies_two_energy_sources():
    cfg = make_config(ENERGY_HARMONY)
    assert is_legal(cfg, {"void": 3, "radiance": 2})
    assert is_legal(cfg, {"void": 1, "radiance": 1, "flux": 1})


def test_energy_harmony_rejects_single_energy_source():
    cfg = make_config(ENERGY_HARMONY)
    ok, reasons = check(cfg, {"void": 9})
    assert not ok
    assert any("class:energy" in r and ">= 2" in r for r in reasons)


def test_energy_harmony_rejects_non_energy_second_source():
    """A transformation 'second source' does not help: it fails the allow-list and
    is not counted toward the two-energy minimum (conjunction, REQ-2.5)."""
    cfg = make_config(ENERGY_HARMONY)
    ok, reasons = check(cfg, {"void": 3, "transformation": 2})
    assert not ok
    assert any("allowed_domain_classes" in r for r in reasons)
    assert any("class:energy" in r and ">= 2" in r for r in reasons)


# --------------------------------------------------------------------------- #
# Transformation / Enchantment — required domain, all others forbidden         #
# --------------------------------------------------------------------------- #


def test_transformation_qualifies_transformation_only():
    cfg = make_config(TRANSFORMATION)
    assert is_legal(cfg, {"transformation": 6})


def test_transformation_rejects_other_domain_present():
    cfg = make_config(TRANSFORMATION)
    ok, reasons = check(cfg, {"transformation": 6, "void": 1})
    assert not ok
    assert any("void" in r and "allowed_domain_ids" in r for r in reasons)


def test_transformation_rejects_when_absent():
    cfg = make_config(TRANSFORMATION)
    ok, reasons = check(cfg, {"void": 2})
    assert not ok
    assert any("transformation" in r for r in reasons)


def test_enchantment_qualifies_enchantment_only():
    cfg = make_config(ENCHANTMENT)
    assert is_legal(cfg, {"enchantment": 4})


def test_enchantment_rejects_other_domain_present():
    cfg = make_config(ENCHANTMENT)
    ok, reasons = check(cfg, {"enchantment": 4, "aether": 2})
    assert not ok
    assert any("aether" in r and "allowed_domain_ids" in r for r in reasons)


# --------------------------------------------------------------------------- #
# Focused / Universal Power — source count over all_normal                     #
# --------------------------------------------------------------------------- #


def test_focused_power_qualifies_single_source_any_class():
    cfg = make_config(FOCUSED_POWER)
    assert is_legal(cfg, {"void": 5})
    assert is_legal(cfg, {"transformation": 5})
    assert is_legal(cfg, {"enchantment": 5})


def test_focused_power_rejects_two_sources():
    cfg = make_config(FOCUSED_POWER)
    ok, reasons = check(cfg, {"void": 2, "transformation": 1})
    assert not ok
    assert any("all_normal" in r and "<= 1" in r for r in reasons)


def test_focused_power_rejects_empty_entry():
    cfg = make_config(FOCUSED_POWER)
    ok, reasons = check(cfg, {})
    assert not ok
    assert any("all_normal" in r and ">= 1" in r for r in reasons)


def test_universal_power_qualifies_two_or_more_sources():
    cfg = make_config(UNIVERSAL_POWER)
    assert is_legal(cfg, {"void": 2, "transformation": 1})
    assert is_legal(cfg, {"void": 1, "radiance": 1, "enchantment": 1})


def test_universal_power_rejects_single_source():
    cfg = make_config(UNIVERSAL_POWER)
    ok, reasons = check(cfg, {"void": 9})
    assert not ok
    assert any("all_normal" in r and ">= 2" in r for r in reasons)


# --------------------------------------------------------------------------- #
# Complete Mastery — declarative per-class minima (REQ-2.4, MATH-6)            #
# --------------------------------------------------------------------------- #


def test_complete_mastery_qualifies_one_of_each_class():
    cfg = make_config(COMPLETE_MASTERY)
    assert is_legal(cfg, {"void": 2, "transformation": 3, "enchantment": 1})
    # Extra energy sources are fine (no maximum declared).
    assert is_legal(cfg, {"void": 2, "radiance": 1, "transformation": 3, "enchantment": 1})


@pytest.mark.parametrize(
    "entry, missing",
    [
        ({"transformation": 3, "enchantment": 1}, "energy"),
        ({"void": 2, "enchantment": 1}, "transformation"),
        ({"void": 2, "transformation": 3}, "enchantment"),
    ],
)
def test_complete_mastery_rejects_missing_class(entry, missing):
    """Conjunction: satisfying two of three class minima is not enough (REQ-2.5)."""
    cfg = make_config(COMPLETE_MASTERY)
    ok, reasons = check(cfg, entry)
    assert not ok
    assert any(missing in r for r in reasons)


def test_complete_mastery_two_forms_agree():
    """The model §4.1 form and the spec §5.3 form (explicit all_normal>=3) accept and
    reject exactly the same source sets."""
    a = make_config(COMPLETE_MASTERY)
    b = make_config(COMPLETE_MASTERY_SPEC_53)
    sample_entries = [
        {"void": 2, "transformation": 3, "enchantment": 1},  # qualifies
        {"void": 2, "transformation": 3},  # missing enchantment
        {"void": 2, "enchantment": 1},  # missing transformation
        {"transformation": 3, "enchantment": 1},  # missing energy
        {},  # empty
        {"void": 1, "radiance": 1, "transformation": 1, "enchantment": 1},  # 4 sources
    ]
    for entry in sample_entries:
        assert is_legal(a, entry) == is_legal(b, entry), entry


# --------------------------------------------------------------------------- #
# Conjunction — some-but-not-all constraints => rejected (REQ-2.5)             #
# --------------------------------------------------------------------------- #


def test_conjunction_allow_list_pass_but_count_fail():
    """Energy Purity: an all-energy set passes the allow-list yet still fails the
    exact-one count when two energy sources are present."""
    cfg = make_config(ENERGY_PURITY)
    # allow-list satisfied (both energy), count constraint violated (2 > 1).
    ok, reasons = check(cfg, {"void": 3, "radiance": 2})
    assert not ok
    assert all("allowed_domain_classes" not in r for r in reasons)  # allow-list OK
    assert any("class:energy" in r for r in reasons)  # count NOT ok


def test_conjunction_count_ok_but_allow_list_fail():
    """Energy Harmony: two sources present (a naive count) but one is out-of-class,
    so both the allow-list and the in-class minimum fail."""
    cfg = make_config(ENERGY_HARMONY)
    ok, reasons = check(cfg, {"void": 2, "transformation": 2})
    assert not ok
    assert any("allowed_domain_classes" in r for r in reasons)


# --------------------------------------------------------------------------- #
# Source-count universe correctness: all_normal vs allowed vs class:<id>       #
# --------------------------------------------------------------------------- #


def test_source_count_universe_distinguishes_all_normal_allowed_and_class():
    """For a mixed source set, the three universes count different domains."""
    cfg = make_config(ENERGY_HARMONY)  # allow-list = energy class
    elig = cfg.trials[0].eligibility
    sources = ["void", "radiance", "transformation", "enchantment"]

    def count(universe: str) -> int:
        return eligibility.count_sources_in_universe(cfg, elig, universe, sources)

    assert count("all_normal") == 4  # every positive normal domain
    assert count("allowed") == 2  # only those passing the energy allow-list
    assert count("class:energy") == 2  # void, radiance
    assert count("class:transformation") == 1
    assert count("class:enchantment") == 1


def test_qualifying_source_count_uses_declared_universe():
    """The tiebreak helper counts in the Trial's declared universe (class:energy)."""
    cfg = make_config(ENERGY_HARMONY)
    trial = cfg.trials[0]
    # 2 energy + 1 non-energy -> class:energy universe counts 2.
    assert eligibility.qualifying_source_count(
        cfg, trial, {"void": 2, "radiance": 1, "transformation": 5}
    ) == 2


def test_unknown_universe_is_rejected():
    cfg = make_config(ENERGY_HARMONY)
    with pytest.raises(ValueError):
        eligibility.count_sources_in_universe(
            cfg, cfg.trials[0].eligibility, "everything", ["void"]
        )


# --------------------------------------------------------------------------- #
# Wild is never a source (model §4.3; REQ-2.3, REQ-6.2/6.3) — A10a/b/c         #
# --------------------------------------------------------------------------- #


def test_wild_only_entry_is_illegal():
    """A10a: 0 normal + Wild never qualifies — Wild is not a source."""
    for pred in (FOCUSED_POWER, ENERGY_HARMONY, ENERGY_PURITY, COMPLETE_MASTERY):
        cfg = make_config(pred)
        assert not is_legal(cfg, {}, wild=1)
        assert not is_legal(cfg, {}, wild=99)


def test_wild_does_not_satisfy_source_minimum():
    """A10b: one energy source + Wild does not meet Energy Harmony's two-source floor."""
    cfg = make_config(ENERGY_HARMONY)
    ok, reasons = check(cfg, {"void": 3}, wild=5)
    assert not ok
    assert any("class:energy" in r and ">= 2" in r for r in reasons)


def test_wild_does_not_legalize_universal_power():
    """One normal source + Wild still fails an all_normal>=2 requirement."""
    cfg = make_config(UNIVERSAL_POWER)
    assert not is_legal(cfg, {"void": 3}, wild=10)


def test_wild_safe_on_mono_source_entry():
    """A10c: one energy source + Wild is legal on Energy Purity, and does NOT break
    the exact-one maximum — Wild is not counted as a second source."""
    cfg = make_config(ENERGY_PURITY)
    assert is_legal(cfg, {"void": 3}, wild=5)
    # Source count remains one regardless of Wild.
    assert eligibility.qualifying_source_count(cfg, cfg.trials[0], {"void": 3}) == 1


def test_wild_does_not_break_focused_exact_one():
    """Focused Power (exactly one all_normal source) stays legal with attached Wild."""
    cfg = make_config(FOCUSED_POWER)
    assert is_legal(cfg, {"transformation": 4}, wild=50)


@pytest.mark.parametrize("name", sorted(NAMED_PREDICATES))
@pytest.mark.parametrize(
    "entry",
    [
        {},
        {"void": 3},
        {"void": 3, "radiance": 2},
        {"void": 2, "transformation": 3, "enchantment": 1},
        {"transformation": 4},
    ],
)
def test_wild_never_changes_the_verdict(name, entry):
    """Bounded-exhaustive: for every named predicate, sample entry and Wild amount,
    the verdict equals the normal-only verdict (Wild is never a source)."""
    cfg = make_config(NAMED_PREDICATES[name])
    trial = cfg.trials[0]
    baseline = eligibility.evaluate_entry(cfg, trial, entry)
    for wild in range(0, 6):
        assert eligibility.evaluate_entry_with_wild(cfg, trial, entry, wild) == baseline


# --------------------------------------------------------------------------- #
# Determinism (NFR-1): verdict independent of repetition and dict order        #
# --------------------------------------------------------------------------- #


def test_evaluation_is_repeatable():
    cfg = make_config(COMPLETE_MASTERY)
    entry = {"void": 2, "transformation": 3, "enchantment": 1}
    first = check(cfg, entry)
    for _ in range(5):
        assert check(cfg, entry) == first


def test_verdict_independent_of_source_insertion_order():
    """All permutations of the same logical entry give an identical verdict and the
    same set of reasons — no dependence on dict iteration order."""
    cfg = make_config(COMPLETE_MASTERY)
    items = [("void", 2), ("radiance", 1), ("transformation", 3)]  # missing enchantment
    verdicts = set()
    reason_sets = set()
    for perm in itertools.permutations(items):
        ok, reasons = check(cfg, dict(perm))
        verdicts.add(ok)
        reason_sets.add(frozenset(reasons))
    assert verdicts == {False}
    assert len(reason_sets) == 1
