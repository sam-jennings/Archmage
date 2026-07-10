"""Shared VS2 test helpers: locate the package root and load committed fixtures.

Not a test module (no ``test_`` prefix). VS2 test modules import these helpers to
load the toy configs (``configs/toy/``) and the committed VS2 adversarial fixtures
(``fixtures/adversarial/``) as data, so every oracle is sourced from a file rather
than an inline literal (REQ-9.4).
"""

from __future__ import annotations

import json
from pathlib import Path

from ascension_trials.config_loader import config_from_dict, load_configuration, state_from_dict
from ascension_trials.schema import Configuration, PlayerState

PACKAGE_ROOT = Path(__file__).resolve().parent.parent
ADVERSARIAL = PACKAGE_ROOT / "fixtures" / "adversarial"

# The committed VS2 fixtures authored for Tasks 16-24.
VS2_FIXTURES = {
    "A3": ADVERSARIAL / "a3_turtle.json",
    "A4": ADVERSARIAL / "a4_counter_cycle.json",
    "A5": ADVERSARIAL / "a5_tie_fest.json",
    "A6": ADVERSARIAL / "a6_counterable_poor.json",
    "A15": ADVERSARIAL / "a15_equivalence_inflation.json",
    "MATH-13": ADVERSARIAL / "math13_weak_not_strict.json",
    "MATH-14": ADVERSARIAL / "math14_equilibrium_mass.json",
}


def load_vs2_fixture(fixture_id: str) -> dict:
    return json.loads(VS2_FIXTURES[fixture_id].read_text(encoding="utf-8"))


def load_referenced_config(fixture: dict, key: str = "config_ref") -> Configuration:
    return load_configuration(PACKAGE_ROOT / fixture[key])


def config_from_fixture_inline(fixture: dict, key: str = "inflated_config") -> Configuration:
    return config_from_dict(fixture[key])


def state_from_fixture(fixture: dict, key: str = "state") -> PlayerState:
    return state_from_dict(fixture[key])
