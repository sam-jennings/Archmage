"""Shared fixtures for Task 4 (Spellbook input, q(S) and F_C(S)).

Loads the committed Maya worked-example Spellbook and the two Trials power
profiles from ``fixtures/worked_examples/`` so every test sources its inputs
from data, not from inline literals.
"""

from __future__ import annotations

import json
from pathlib import Path

import pytest

from ascension_trials import scoring
from ascension_trials.config_loader import config_from_dict, spellbook_from_dict

FIXTURES = Path(__file__).resolve().parent.parent / "fixtures" / "worked_examples"


def load_fixture(name: str) -> dict:
    return json.loads((FIXTURES / name).read_text(encoding="utf-8"))


@pytest.fixture
def maya_spellbook():
    return spellbook_from_dict(load_fixture("maya_spellbook.json"))


@pytest.fixture
def v28_raw():
    return load_fixture("trials_power_v28.json")


@pytest.fixture
def hybrid_raw():
    return load_fixture("hybrid_2n_minus_3_experimental.json")


@pytest.fixture
def v28_config(v28_raw):
    return config_from_dict(v28_raw)


@pytest.fixture
def hybrid_config(hybrid_raw):
    return config_from_dict(hybrid_raw)


@pytest.fixture(scope="session")
def scoring_ref():
    return scoring.load_scoring_reference()
