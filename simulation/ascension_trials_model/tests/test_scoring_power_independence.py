"""Task 4 — q(S) and F_C(S) are independent (REQ-3.10, REQ-3.11, REQ-3.7).

These four tests are the crux of the standard-scoring / Trials-power separation
(design §5.0). They prove that:

  1. changing the standard score table moves q(S) but leaves F_C(S) unchanged;
  2. changing the Trials power profile moves F_C(S) but leaves q(S) unchanged;
  3. each profile reproduces its own worked-example oracle, and the source-backed
     A16 example exercises the EXPERIMENTAL profile (not the current candidate);
  4. experimental profiles are clearly labelled and cannot be mistaken for canon
     or for the standard scoring table.
"""

from __future__ import annotations

from ascension_trials import scoring
from ascension_trials.power import derive_player_state
from ascension_trials.scoring import ScoringReference

# Source-backed oracles (see test_power_derivation.py for provenance).
MAYA_V28 = {"void": 14, "flux": 0, "radiance": 0, "aether": 9, "transformation": 17, "enchantment": 4}
MAYA_A16 = {"void": 11, "flux": 0, "radiance": 0, "aether": 9, "transformation": 16, "enchantment": 8}
MAYA_Q_S = 46


def _bumped_reference(ref: ScoringReference, delta: int) -> ScoringReference:
    """An adapted scoring table (every cell + delta) with distinct provenance."""
    table = {
        stype: {size: pts + delta for size, pts in sizes.items()}
        for stype, sizes in ref.table.items()
    }
    return ScoringReference(
        table=table, version=f"{ref.version}+bumped{delta}", content_hash="sha256:bumped", source="test"
    )


# --------------------------------------------------------------------------- #
# 1. Changing the standard score table changes q(S), not F_C(S)                #
# --------------------------------------------------------------------------- #


def test_changing_score_table_changes_q_not_F(maya_spellbook, v28_config, scoring_ref):
    f_before = derive_player_state(maya_spellbook, v28_config)
    q_before = scoring.score_spellbook(maya_spellbook, scoring_ref)

    alt = _bumped_reference(scoring_ref, 1000)
    q_after = scoring.score_spellbook(maya_spellbook, alt)
    f_after = derive_player_state(maya_spellbook, v28_config)

    # q(S) moved (4 spells, +1000 each) ...
    assert q_before == MAYA_Q_S
    assert q_after == MAYA_Q_S + 4000
    assert q_after != q_before
    # ... while F_C(S) is byte-for-byte unchanged.
    assert f_after.normal_power == f_before.normal_power == MAYA_V28
    assert f_after.wild_power == f_before.wild_power


# --------------------------------------------------------------------------- #
# 2. Changing the Trials power profile changes F_C(S), not q(S)                #
# --------------------------------------------------------------------------- #


def test_changing_power_profile_changes_F_not_q(
    maya_spellbook, v28_config, hybrid_config, scoring_ref
):
    f_v28 = derive_player_state(maya_spellbook, v28_config)
    f_hybrid = derive_player_state(maya_spellbook, hybrid_config)

    q_v28 = scoring.score_spellbook(maya_spellbook, scoring_ref)
    q_hybrid = scoring.score_spellbook(maya_spellbook, scoring_ref)

    # F_C(S) moved with the profile ...
    assert f_v28.normal_power == MAYA_V28
    assert f_hybrid.normal_power == MAYA_A16
    assert f_v28.normal_power != f_hybrid.normal_power
    # ... while q(S) is identical (it never reads the Trials power profile).
    assert q_v28 == q_hybrid == MAYA_Q_S


# --------------------------------------------------------------------------- #
# 3. Each profile reproduces its own oracle; A16 is the experimental profile    #
# --------------------------------------------------------------------------- #


def test_each_profile_reproduces_own_oracle_and_a16_is_experimental(
    maya_spellbook, v28_config, hybrid_config
):
    v28 = derive_player_state(maya_spellbook, v28_config)
    hybrid = derive_player_state(maya_spellbook, hybrid_config)

    assert (v28.normal_power, v28.wild_power) == (MAYA_V28, 2)
    assert (hybrid.normal_power, hybrid.wild_power) == (MAYA_A16, 2)

    # The A16 source vector is reproduced by the EXPERIMENTAL profile, and is NOT
    # what the current candidate derives.
    assert hybrid.normal_power == MAYA_A16
    assert hybrid_config.power_formula.experimental is True
    assert v28.normal_power != MAYA_A16


# --------------------------------------------------------------------------- #
# 4. Experimental profiles are labelled and cannot be mistaken for canon        #
# --------------------------------------------------------------------------- #


def test_experimental_profiles_are_labelled_and_not_canon(
    maya_spellbook, v28_config, hybrid_config, scoring_ref
):
    # The current candidate is not experimental; the 2n-3 family is.
    assert v28_config.power_formula.experimental is False
    assert hybrid_config.power_formula.experimental is True
    assert "experimental" in hybrid_config.power_formula.version

    # A power profile can never be confused with the standard scoring table:
    # q(S) provenance is the scoring reference version, F_C(S) provenance is the
    # power-profile tag, and the two namespaces are disjoint.
    q = scoring.independent_score(maya_spellbook, scoring_ref)
    state = derive_player_state(maya_spellbook, hybrid_config, independent_score=q)
    assert state.independent_score.scoring_version == "v3.1"
    assert state.power_profile_version == "hybrid_2n_minus_3@0.1-experimental"
    assert state.independent_score.scoring_version != state.power_profile_version


# --------------------------------------------------------------------------- #
# Provenance completeness — a state records BOTH q(S) and F_C(S) sources        #
# --------------------------------------------------------------------------- #


def test_derived_state_records_both_provenances(maya_spellbook, v28_config, scoring_ref):
    q = scoring.independent_score(maya_spellbook, scoring_ref)
    state = derive_player_state(maya_spellbook, v28_config, independent_score=q)
    # q(S) provenance
    assert state.independent_score.value == MAYA_Q_S
    assert state.independent_score.scoring_version == "v3.1"
    assert state.independent_score.content_hash == scoring_ref.content_hash
    # F_C(S) provenance
    assert state.power_profile_version == "trials_power_v28@2.8"
