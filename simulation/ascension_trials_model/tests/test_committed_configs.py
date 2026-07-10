"""Task 10 - the six committed configurations load and validate (REQ-1, REQ-9).

Every committed configuration under ``configs/`` must be a well-formed,
schema-valid document: ``validate_config_document`` returns ``valid`` with no
errors. This test also pins the two attribution facts Task 10 is careful about:

  * ``baseline_v28_stale`` carries the historical-candidate / stale-by-design
    metadata (REQ-9.3) and drops 7-player support, yet its power profile is the
    current candidate ``trials_power_v28`` (experimental: false) - its staleness
    is in the reward economy / 7-player structure, not its power math
    (design 5.0 reconciliation note);
  * ``hybrid_rebuild`` is the rebuild candidate and references the experimental
    ``hybrid_2n_minus_3`` profile, which stays marked experimental: true so it can
    never be mistaken for canon or for the standard scoring table q(S).

NOTE: the CLI ``validate-config`` command is wired up in Task 13. Until then we
validate the committed files directly through the loader entry point
``validate_config_document``, which is exactly what that command will call.
"""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from ascension_trials.config_loader import config_from_dict, validate_config_document

CONFIGS = Path(__file__).resolve().parent.parent / "configs"

# The six committed configurations (REQ-9.1).
COMMITTED_CONFIGS = [
    "baseline_v28_stale.json",
    "hybrid_rebuild.json",
    "toy/turtle_5_3.json",
    "toy/cycle_5_4_3.json",
    "toy/tie_fest_5_5.json",
    "toy/equal_4_4_4.json",
]


def _load_raw(rel_path: str) -> dict:
    return json.loads((CONFIGS / rel_path).read_text(encoding="utf-8"))


@pytest.mark.parametrize("rel_path", COMMITTED_CONFIGS)
def test_committed_config_validates(rel_path):
    """Each committed config is structurally + semantically valid, no errors."""
    raw = _load_raw(rel_path)
    result = validate_config_document(raw)
    assert result.valid, f"{rel_path} failed validation: {result.errors}"
    assert result.errors == [], f"{rel_path} produced errors: {result.errors}"


@pytest.mark.parametrize("rel_path", COMMITTED_CONFIGS)
def test_committed_config_parses_and_roundtrips_id(rel_path):
    """The validated document parses into a Configuration with a matching id."""
    raw = _load_raw(rel_path)
    config = config_from_dict(raw)
    assert config.id == raw["id"]
    assert config.version == str(raw["version"])


def test_all_six_committed_configs_present():
    """All six REQ-9.1 files exist exactly (two top-level + four toy)."""
    for rel_path in COMMITTED_CONFIGS:
        assert (CONFIGS / rel_path).is_file(), f"missing committed config: {rel_path}"


def test_baseline_historical_and_stale_metadata():
    """baseline_v28_stale marks the REQ-9.3 metadata and excludes 7-player play."""
    config = config_from_dict(_load_raw("baseline_v28_stale.json"))
    assert config.historical_candidate is True
    assert config.stale_by_design is True
    # No executable 7-player support (REQ-9.3): support stops at 6.
    assert 7 not in config.supported_player_counts
    assert config.supported_player_counts == [2, 3, 4, 5, 6]
    # The metadata notes must record the four REQ-9.3 statements + no-canon framing.
    joined = " ".join(config.notes).lower()
    assert "historical candidate" in joined
    assert "stale by design" in joined
    assert "7-player" in joined or "7 player" in joined
    assert "canon" in joined


def test_baseline_power_profile_is_current_candidate_not_stale():
    """Design 5.0: baseline's power math is the current candidate, NOT stale."""
    config = config_from_dict(_load_raw("baseline_v28_stale.json"))
    assert config.power_formula.profile == "trials_power_v28"
    assert config.power_formula.experimental is False


def test_baseline_uses_historical_ratio_tiebreaks():
    """The historical ratio tiebreaks are present and flagged as historical.

    The loader emits a warning (not an error) for each historical ratio token, so
    the config stays valid while its historical semantics are preserved as-is.
    """
    raw = _load_raw("baseline_v28_stale.json")
    result = validate_config_document(raw)
    assert result.valid
    assert result.warnings, "baseline should warn that its ratio tiebreaks are historical"
    config = config_from_dict(raw)
    all_tokens = {tok for trial in config.trials for tok in trial.trial_tiebreaks}
    assert "legacy_utilization" in all_tokens
    assert "legacy_focus" in all_tokens


def test_hybrid_rebuild_is_experimental_candidate():
    """hybrid_rebuild references the experimental 2n-3 profile and is not historical."""
    config = config_from_dict(_load_raw("hybrid_rebuild.json"))
    assert config.power_formula.profile == "hybrid_2n_minus_3"
    assert config.power_formula.experimental is True
    # It is a candidate under analysis, never canon / never historical-stale.
    assert config.historical_candidate is False
    assert config.stale_by_design is False


def test_profile_experimental_flags_baseline_false_hybrid_true():
    """The crux attribution: v28 profile experimental False, hybrid True."""
    baseline = config_from_dict(_load_raw("baseline_v28_stale.json"))
    hybrid = config_from_dict(_load_raw("hybrid_rebuild.json"))
    assert baseline.power_formula.experimental is False
    assert hybrid.power_formula.experimental is True
