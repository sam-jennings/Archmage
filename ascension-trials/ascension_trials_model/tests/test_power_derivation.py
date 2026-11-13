"""Task 4 — Trials domain power F_C(S) derivation (REQ-3.1, REQ-3.2, REQ-3.5-3.9).

All expected values are source-backed, never reverse-engineered from code (REQ-9.4):

  * Current candidate v2.8 (design §5.1.2, rulebook/Ascension Trials.md):
        Maya -> Void 14, Aether 9, Transformation 17, Enchantment 4, Wild 2
  * Experimental 2n-3 (design §5.1.3, matches source A16):
        Maya -> Void 11, Aether 9, Transformation 16, Enchantment 8, Wild 2
  * A17 formula comparison: legacy 5-card = 8 (half-up), hybrid 5-card = 7,
        hybrid Enchantment table 4/8/12.
  * MATH-4 2n-3 table: 3->3, 4->5, 5->7, 6->9, 7->11, 10->17.
"""

from __future__ import annotations

import pytest

from ascension_trials.config_loader import config_from_dict, validate_config_document
from ascension_trials.power import (
    derive_player_state,
    enchantment_power,
    profile_version_tag,
    standard_spell_power,
)
from ascension_trials.schema import Spell, Spellbook

# Source-backed oracles (full domain vectors including the zero energies).
MAYA_V28 = {"void": 14, "flux": 0, "radiance": 0, "aether": 9, "transformation": 17, "enchantment": 4}
MAYA_V28_WILD = 2
# A16 worked example (docs/ASCENSION_TRIALS_KIRO_IMPLEMENTATION_SPEC_V1_1.md §A16).
MAYA_A16 = {"void": 11, "flux": 0, "radiance": 0, "aether": 9, "transformation": 16, "enchantment": 8}
MAYA_A16_WILD = 2


# --------------------------------------------------------------------------- #
# The profile fixtures are well-formed configurations                          #
# --------------------------------------------------------------------------- #


def test_profile_fixtures_validate(v28_raw, hybrid_raw):
    assert validate_config_document(v28_raw).valid
    assert validate_config_document(hybrid_raw).valid


# --------------------------------------------------------------------------- #
# Maya oracles (REQ-3.8, REQ-3.9)                                              #
# --------------------------------------------------------------------------- #


def test_maya_current_candidate_v28_oracle(maya_spellbook, v28_config):
    state = derive_player_state(maya_spellbook, v28_config)
    assert state.normal_power == MAYA_V28
    assert state.wild_power == MAYA_V28_WILD


def test_maya_experimental_2n3_oracle_matches_A16(maya_spellbook, hybrid_config):
    state = derive_player_state(maya_spellbook, hybrid_config)
    assert state.normal_power == MAYA_A16
    assert state.wild_power == MAYA_A16_WILD


# --------------------------------------------------------------------------- #
# A17 — formula comparison                                                     #
# --------------------------------------------------------------------------- #


def test_a17_five_card_standard_power(v28_config, hybrid_config):
    assert standard_spell_power(v28_config, 5) == 8  # 1.5 * 5 = 7.5 -> half-up 8
    assert standard_spell_power(hybrid_config, 5) == 7  # 2*5 - 3 = 7


@pytest.mark.parametrize("size,expected", [(3, 4), (4, 8), (5, 12)])
def test_a17_hybrid_enchantment_table(hybrid_config, size, expected):
    assert enchantment_power(hybrid_config, size) == expected


# --------------------------------------------------------------------------- #
# MATH-4 — the 2n-3 profile's standard-spell-power table                       #
# --------------------------------------------------------------------------- #


@pytest.mark.parametrize(
    "size,expected", [(3, 3), (4, 5), (5, 7), (6, 9), (7, 11), (10, 17)]
)
def test_math4_2n_minus_3_table(hybrid_config, size, expected):
    assert standard_spell_power(hybrid_config, size) == expected


# --------------------------------------------------------------------------- #
# v2.8 piecewise size multiplier (rulebook/Ascension Trials.md Power Formula)  #
# --------------------------------------------------------------------------- #


@pytest.mark.parametrize(
    "size,expected",
    [(3, 3), (4, 4), (5, 8), (6, 9), (7, 14), (8, 16), (10, 20)],
)
def test_v28_piecewise_multiplier(v28_config, size, expected):
    # x1.0 for 3-4; x1.5 half-up for 5-6 (5 -> 8, 6 -> 9); x2.0 for 7+.
    assert standard_spell_power(v28_config, size) == expected


# --------------------------------------------------------------------------- #
# Perfect Transmutation and Enchantment special contributions (REQ-3.6)        #
# --------------------------------------------------------------------------- #


def test_perfect_transmutation_contributes_energy_and_transformation_and_wild(v28_config):
    book = Spellbook("pt_only", [Spell("pt", "perfect_transmutation", 6, "aether")])
    state = derive_player_state(book, v28_config)
    assert state.normal_power["aether"] == 9  # energy domain gets formula power
    assert state.normal_power["transformation"] == 9  # and so does Transformation
    assert state.wild_power == 1  # +1 Wild granted


def test_v28_enchantment_wild_only_at_size_4(v28_config):
    four = Spellbook("e4", [Spell("e", "enchantment", 4)])
    three = Spellbook("e3", [Spell("e", "enchantment", 3)])
    assert derive_player_state(four, v28_config).wild_power == 1
    assert derive_player_state(three, v28_config).wild_power == 0


def test_hybrid_enchantment_wild_at_sizes_4_and_5(hybrid_config):
    for size in (4, 5):
        book = Spellbook(f"e{size}", [Spell("e", "enchantment", size)])
        assert derive_player_state(book, hybrid_config).wild_power == 1
    three = Spellbook("e3", [Spell("e", "enchantment", 3)])
    assert derive_player_state(three, hybrid_config).wild_power == 0


# --------------------------------------------------------------------------- #
# F_C(S) provenance recorded on the derived state (REQ-3.10)                   #
# --------------------------------------------------------------------------- #


def test_power_profile_version_recorded(maya_spellbook, v28_config, hybrid_config):
    assert derive_player_state(maya_spellbook, v28_config).power_profile_version == (
        "trials_power_v28@2.8"
    )
    assert derive_player_state(maya_spellbook, hybrid_config).power_profile_version == (
        "hybrid_2n_minus_3@0.1-experimental"
    )
    assert profile_version_tag(v28_config) == "trials_power_v28@2.8"


# --------------------------------------------------------------------------- #
# Determinism (REQ-3.2) — exhaustive over a representative Spellbook set        #
# --------------------------------------------------------------------------- #

_SAMPLE_BOOKS = [
    Spellbook("b0", []),
    Spellbook("b1", [Spell("c", "conjuration", 7, "void")]),
    Spellbook(
        "b2",
        [
            Spell("c", "conjuration", 5, "flux"),
            Spell("t", "transfiguration", 6),
            Spell("e", "enchantment", 4),
            Spell("p", "perfect_transmutation", 6, "aether"),
        ],
    ),
    Spellbook("b3", [Spell("e", "enchantment", 3), Spell("e2", "enchantment", 4)]),
]


@pytest.mark.parametrize("book", _SAMPLE_BOOKS, ids=lambda b: b.spellbook_id)
def test_power_derivation_is_deterministic(book, v28_config, hybrid_config):
    for config in (v28_config, hybrid_config):
        first = derive_player_state(book, config)
        second = derive_player_state(book, config)
        assert first.normal_power == second.normal_power
        assert first.wild_power == second.wild_power
        assert first.tiebreak_stats == second.tiebreak_stats


# --------------------------------------------------------------------------- #
# Monotonic-size sanity — standard spell power never decreases with size        #
# --------------------------------------------------------------------------- #


def test_standard_power_non_decreasing_in_size(v28_config, hybrid_config):
    for config in (v28_config, hybrid_config):
        powers = [standard_spell_power(config, n) for n in range(3, 16)]
        assert all(b >= a for a, b in zip(powers, powers[1:])), powers
