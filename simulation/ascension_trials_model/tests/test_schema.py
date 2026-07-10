"""Task 3 — configuration schema completion and validation tests.

Covers REQ-1 (data-driven representation + explicit validation errors),
REQ-2 (declarative eligibility, incl. contradiction detection and Complete
Mastery), REQ-5 (invalidation vocabulary) and REQ-8 (tiebreak vocabulary and
the requirements-vs-normative token reconciliation).

Configs are built as plain dicts and fed through ``config_from_dict`` /
``validate_config_document`` so the suite is self-contained (committed config
JSON files are authored later, in Task 10).
"""

from __future__ import annotations

import pytest

from ascension_trials import schema
from ascension_trials.config_loader import (
    config_from_dict,
    validate_config_dict,
    validate_config_document,
    validate_configuration,
)


# --------------------------------------------------------------------------- #
# Fixtures / builders                                                          #
# --------------------------------------------------------------------------- #


def base_config() -> dict:
    """A minimal, fully valid hybrid configuration used as the mutation base."""
    return {
        "id": "test_cfg",
        "version": "1.0",
        "supported_player_counts": [2, 3, 4],
        "rounding": {"mode": "half_up"},
        "power_formula": {
            "profile": "hybrid_2n_minus_3",
            "standard_spell_power": {"type": "linear", "expression": "2*n-3"},
            "enchantment_power": {"type": "table", "table": {"3": 4, "4": 8, "5": 12}},
            "contributions": {
                "conjuration": {"energy": "standard_spell_power"},
                "transfiguration": {"transformation": "standard_spell_power"},
                "perfect_transmutation": {
                    "energy": "standard_spell_power",
                    "transformation": "standard_spell_power",
                    "wild": 1,
                },
                "enchantment": {"enchantment": "enchantment_power"},
            },
        },
        "domains": [
            {"id": "radiance", "class": "energy"},
            {"id": "void", "class": "energy"},
            {"id": "transformation", "class": "transformation"},
            {"id": "enchantment", "class": "enchantment"},
        ],
        "wild": {
            "enabled": True,
            "requires_legal_normal_entry": True,
            "counts_as_source": False,
            "included_in_primary_total": True,
            "included_in_tiebreaks": False,
        },
        "trials": [
            {
                "id": "energy_purity",
                "active_player_counts": [2, 3, 4],
                "eligibility": {
                    "allowed_domain_classes": ["energy"],
                    "source_count": {"universe": "class:energy", "minimum": 1, "maximum": 1},
                },
                "entry_floor": {"value": 0, "scope": "normal"},
                "tie_award": {"type": "shared_full"},
                "rewards": {"by_player_count": {"2": {"first": 6, "second": 0}}},
                "trial_tiebreaks": [
                    "total_power",
                    "normal_power",
                    "qualifying_source_count",
                    "shared",
                ],
            }
        ],
        "allocation": {
            "completion": "maximal",
            "residue_allowed": True,
            "infeasible_full_fallback": "reject",
            "invalidation": {
                "illegal_trial_entry": "ignore_entry",
                "overallocated_domain": "invalidate_entries_using_domain",
                "overallocated_wild": "invalidate_entries_using_wild",
                "malformed_allocation": "reject_profile",
            },
        },
        "final_result": {
            "final_tiebreaks": [
                "first_place_trial_count",
                "total_normal_power",
                "spell_count",
                "largest_spell",
                "shared",
            ]
        },
    }


def set_single_trial_tiebreaks(raw: dict, tokens: list[str]) -> dict:
    raw["trials"] = [
        {
            "id": "t",
            "active_player_counts": [2],
            "eligibility": {"source_count": {"universe": "all_normal", "minimum": 1}},
            "trial_tiebreaks": tokens,
        }
    ]
    return raw


def errors_text(result) -> str:
    return " || ".join(result.errors)


# --------------------------------------------------------------------------- #
# Valid configurations                                                         #
# --------------------------------------------------------------------------- #


def test_base_config_is_valid():
    result = validate_config_document(base_config())
    assert result.valid, errors_text(result)
    assert result.errors == []


def test_validate_configuration_accepts_parsed_base():
    config = config_from_dict(base_config())
    result = validate_configuration(config)
    assert result.valid, errors_text(result)


def test_minimal_required_only_config_is_valid():
    raw = {
        "id": "min",
        "version": "1",
        "power_formula": {
            "profile": "declarative",
            "standard_spell_power": {"type": "linear", "expression": "n"},
        },
        "domains": [{"id": "radiance", "class": "energy"}],
        "trials": [],
    }
    result = validate_config_document(raw)
    assert result.valid, errors_text(result)


def test_legacy_piecewise_power_profile_is_valid():
    """The historical v2.8 baseline shape (piecewise, half-up) validates (REQ-1.3)."""
    raw = base_config()
    raw["power_formula"] = {
        "profile": "legacy_v28",
        "standard_spell_power": {
            "type": "piecewise",
            "piecewise": [
                {"expression": "n", "max_size": 4},
                {"expression": "1.5*n", "min_size": 5, "max_size": 6, "rounding": "half_up"},
                {"expression": "2*n", "min_size": 7},
            ],
        },
        "enchantment_power": {"type": "spell_size"},
    }
    result = validate_config_document(raw)
    assert result.valid, errors_text(result)


# --------------------------------------------------------------------------- #
# Enumerated token sets are accepted (REQ-8)                                   #
# --------------------------------------------------------------------------- #


def test_all_canonical_trial_tiebreak_tokens_accepted():
    raw = base_config()
    tokens = [
        "total_power",
        "normal_power",
        "qualifying_source_count",
        "breadth",
        "legacy_utilization",
        "legacy_focus",
        "hybrid_efficiency",
        "hybrid_commitment",
        "shared",
    ]
    assert set(tokens) == set(schema.TRIAL_TIEBREAK_TOKENS)
    set_single_trial_tiebreaks(raw, tokens)
    result = validate_config_document(raw)
    assert result.valid, errors_text(result)


def test_all_final_tiebreak_tokens_accepted():
    raw = base_config()
    tokens = [
        "first_place_trial_count",
        "total_normal_power",
        "spell_count",
        "largest_spell",
        "shared",
    ]
    assert set(tokens) == set(schema.FINAL_TIEBREAK_TOKENS)
    raw["final_result"]["final_tiebreaks"] = tokens
    result = validate_config_document(raw)
    assert result.valid, errors_text(result)


def test_requirements_trial_aliases_accepted_and_canonicalized():
    """REQ-8 spellings validate and canonicalize to the normative tokens."""
    raw = base_config()
    set_single_trial_tiebreaks(
        raw,
        ["utilization_ratio", "focus_ratio", "efficiency_ratio", "commitment_ratio", "breadth", "shared"],
    )
    result = validate_config_document(raw)
    assert result.valid, errors_text(result)

    config = config_from_dict(raw)
    assert config.trials[0].trial_tiebreaks == [
        "legacy_utilization",
        "legacy_focus",
        "hybrid_efficiency",
        "hybrid_commitment",
        "breadth",
        "shared",
    ]


def test_requirements_final_alias_accepted_and_canonicalized():
    raw = base_config()
    raw["final_result"]["final_tiebreaks"] = ["first_place_trial_wins", "shared"]
    result = validate_config_document(raw)
    assert result.valid, errors_text(result)

    config = config_from_dict(raw)
    assert config.final_tiebreaks == ["first_place_trial_count", "shared"]


@pytest.mark.parametrize("completion", sorted(schema.COMPLETION_POLICIES))
def test_completion_policies_accepted(completion):
    raw = base_config()
    raw["allocation"]["completion"] = completion
    result = validate_config_document(raw)
    assert result.valid, errors_text(result)


@pytest.mark.parametrize("universe", ["all_normal", "allowed", "class:energy"])
def test_source_count_universes_accepted(universe):
    raw = base_config()
    raw["trials"][0]["eligibility"] = {"source_count": {"universe": universe, "minimum": 1}}
    result = validate_config_document(raw)
    assert result.valid, errors_text(result)


def test_invalidation_action_vocabulary_accepted():
    raw = base_config()
    raw["allocation"]["invalidation"]["overallocated_wild"] = "drop_wild"
    raw["allocation"]["invalidation"]["illegal_trial_entry"] = "invalidate_entry"
    result = validate_config_document(raw)
    assert result.valid, errors_text(result)


# --------------------------------------------------------------------------- #
# Complete Mastery is declarative (REQ-2.4)                                    #
# --------------------------------------------------------------------------- #


def test_complete_mastery_declarative_is_valid():
    raw = base_config()
    raw["trials"][0] = {
        "id": "complete_mastery",
        "active_player_counts": [2, 3, 4],
        "eligibility": {
            "source_count": {"universe": "all_normal", "minimum": 3},
            "required_class_counts": {
                "energy": {"minimum": 1},
                "transformation": {"minimum": 1},
                "enchantment": {"minimum": 1},
            },
        },
        "trial_tiebreaks": ["total_power", "shared"],
    }
    result = validate_config_document(raw)
    assert result.valid, errors_text(result)
    # No custom predicate is present anywhere in the eligibility block.
    assert "custom" not in raw["trials"][0]["eligibility"]


# --------------------------------------------------------------------------- #
# Explicit validation errors (REQ-1.4)                                         #
# --------------------------------------------------------------------------- #


def test_unknown_top_level_field_rejected():
    raw = base_config()
    raw["mystery_field"] = True
    result = validate_config_document(raw)
    assert not result.valid
    assert "unknown field 'mystery_field'" in errors_text(result)


def test_unknown_nested_field_rejected():
    raw = base_config()
    raw["trials"][0]["eligibility"]["typo_key"] = []
    result = validate_config_document(raw)
    assert not result.valid
    assert "unknown field 'typo_key'" in errors_text(result)


def test_missing_required_field_rejected():
    raw = base_config()
    del raw["version"]
    result = validate_config_document(raw)
    assert not result.valid
    assert "missing required field 'version'" in errors_text(result)


def test_missing_required_power_formula_field_rejected():
    raw = base_config()
    del raw["power_formula"]["profile"]
    result = validate_config_document(raw)
    assert not result.valid
    assert "missing required field 'profile'" in errors_text(result)


def test_unknown_power_profile_token_rejected():
    raw = base_config()
    raw["power_formula"]["profile"] = "made_up_profile"
    result = validate_config_document(raw)
    assert not result.valid
    assert "profile" in errors_text(result)


def test_unknown_trial_tiebreak_token_rejected():
    raw = base_config()
    set_single_trial_tiebreaks(raw, ["total_power", "made_up_ratio", "shared"])
    result = validate_config_document(raw)
    assert not result.valid
    assert "made_up_ratio" in errors_text(result)


def test_unknown_final_tiebreak_token_rejected():
    raw = base_config()
    raw["final_result"]["final_tiebreaks"] = ["not_a_token", "shared"]
    result = validate_config_document(raw)
    assert not result.valid
    assert "not_a_token" in errors_text(result)


def test_unknown_completion_policy_rejected():
    raw = base_config()
    raw["allocation"]["completion"] = "eventually"
    result = validate_config_document(raw)
    assert not result.valid
    assert "completion" in errors_text(result)


def test_unknown_invalidation_action_rejected():
    raw = base_config()
    raw["allocation"]["invalidation"]["overallocated_domain"] = "silently_clip"
    result = validate_config_document(raw)
    assert not result.valid
    assert "silently_clip" in errors_text(result)


# --------------------------------------------------------------------------- #
# Undefined generic `custom` behaviour is rejected (REQ-1.4 / task item 2)     #
# --------------------------------------------------------------------------- #


def test_custom_eligibility_predicate_rejected():
    raw = base_config()
    raw["trials"][0]["eligibility"]["custom"] = "some_python_callback"
    result = validate_config_document(raw)
    assert not result.valid
    assert "custom" in errors_text(result)


def test_mode_eligibility_predicate_rejected():
    raw = base_config()
    raw["trials"][0]["eligibility"]["mode"] = "any"
    result = validate_config_document(raw)
    assert not result.valid
    assert "mode" in errors_text(result)


# --------------------------------------------------------------------------- #
# Cross-reference and universe errors (REQ-2)                                  #
# --------------------------------------------------------------------------- #


def test_unknown_domain_id_reference_rejected():
    raw = base_config()
    raw["trials"][0]["eligibility"] = {"allowed_domain_ids": ["ghost_domain"]}
    result = validate_config_document(raw)
    assert not result.valid
    assert "ghost_domain" in errors_text(result)


def test_unknown_domain_class_reference_rejected():
    raw = base_config()
    raw["trials"][0]["eligibility"] = {"allowed_domain_classes": ["mystery_class"]}
    result = validate_config_document(raw)
    assert not result.valid
    assert "mystery_class" in errors_text(result)


def test_invalid_source_count_universe_rejected():
    raw = base_config()
    raw["trials"][0]["eligibility"] = {"source_count": {"universe": "everything", "minimum": 1}}
    result = validate_config_document(raw)
    assert not result.valid
    assert "universe" in errors_text(result)


# --------------------------------------------------------------------------- #
# State closure for final tiebreaks (REQ-7 step 1 / design §7.2)               #
# --------------------------------------------------------------------------- #


def test_final_tiebreak_requiring_unavailable_statistic_rejected():
    raw = base_config()
    raw["declared_tiebreak_stats"] = ["spell_count"]  # largest_spell not supplied
    raw["final_result"]["final_tiebreaks"] = ["largest_spell", "shared"]
    result = validate_config_document(raw)
    assert not result.valid
    assert "not declared available" in errors_text(result)
    assert "largest_spell" in errors_text(result)


def test_final_tiebreak_state_closure_passes_when_declared():
    raw = base_config()
    raw["declared_tiebreak_stats"] = ["spell_count", "largest_spell"]
    raw["final_result"]["final_tiebreaks"] = ["spell_count", "largest_spell", "shared"]
    result = validate_config_document(raw)
    assert result.valid, errors_text(result)


# --------------------------------------------------------------------------- #
# Contradictory eligibility predicates (REQ-2.6)                               #
# --------------------------------------------------------------------------- #


def test_min_sources_greater_than_max_rejected():
    raw = base_config()
    raw["trials"][0]["eligibility"] = {
        "source_count": {"universe": "all_normal", "minimum": 3, "maximum": 1}
    }
    result = validate_config_document(raw)
    assert not result.valid
    assert "exceeds maximum" in errors_text(result)


def test_domain_both_allowed_and_forbidden_rejected():
    raw = base_config()
    raw["trials"][0]["eligibility"] = {
        "allowed_domain_ids": ["radiance"],
        "forbidden_domain_ids": ["radiance"],
    }
    result = validate_config_document(raw)
    assert not result.valid
    assert "both allowed and forbidden" in errors_text(result)


def test_count_bound_min_greater_than_max_rejected():
    raw = base_config()
    raw["trials"][0]["eligibility"] = {
        "required_class_counts": {"energy": {"minimum": 2, "maximum": 1}}
    }
    result = validate_config_document(raw)
    assert not result.valid
    assert "exceeds maximum" in errors_text(result)


def test_required_class_excluded_by_allowed_classes_rejected():
    raw = base_config()
    raw["trials"][0]["eligibility"] = {
        "allowed_domain_classes": ["energy"],
        "required_class_counts": {"transformation": {"minimum": 1}},
    }
    result = validate_config_document(raw)
    assert not result.valid
    assert "transformation" in errors_text(result)


def test_required_domain_excluded_by_allow_list_rejected():
    raw = base_config()
    raw["trials"][0]["eligibility"] = {
        "allowed_domain_ids": ["radiance"],
        "required_domain_counts": {"transformation": {"minimum": 1}},
    }
    result = validate_config_document(raw)
    assert not result.valid
    assert "transformation" in errors_text(result)


def test_per_class_minima_exceed_source_maximum_rejected():
    """Complete-Mastery-shaped predicate capped below its distinct-source floor."""
    raw = base_config()
    raw["trials"][0]["eligibility"] = {
        "source_count": {"universe": "all_normal", "minimum": 1, "maximum": 1},
        "required_class_counts": {
            "energy": {"minimum": 1},
            "transformation": {"minimum": 1},
            "enchantment": {"minimum": 1},
        },
    }
    result = validate_config_document(raw)
    assert not result.valid
    assert "distinct" in errors_text(result)


def test_source_count_class_universe_unreachable_rejected():
    raw = base_config()
    # No domain of class 'transformation' passes an energy-only allow-list.
    raw["trials"][0]["eligibility"] = {
        "allowed_domain_classes": ["energy"],
        "source_count": {"universe": "class:transformation", "minimum": 1},
    }
    result = validate_config_document(raw)
    assert not result.valid
    assert "class:transformation" in errors_text(result)


# --------------------------------------------------------------------------- #
# validate_config_dict is purely structural (no crash on partial input)        #
# --------------------------------------------------------------------------- #


def test_validate_config_dict_reports_multiple_structural_errors():
    raw = {"id": "x"}  # missing version, power_formula, domains, trials
    result = validate_config_dict(raw)
    assert not result.valid
    text = errors_text(result)
    assert "version" in text
    assert "power_formula" in text
    assert "domains" in text
    assert "trials" in text


def test_non_mapping_configuration_rejected():
    result = validate_config_document([1, 2, 3])  # type: ignore[arg-type]
    assert not result.valid
    assert "mapping" in errors_text(result)
