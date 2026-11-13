"""Task 2 integration smoke test.

Verifies the package is importable through the configured pytest harness
(``pyproject.toml`` sets ``pythonpath = ["src"]``). This is deliberately NOT a
VS1 acceptance test: schema, eligibility, power and resolver behaviour are
covered by the acceptance suite in Task 12. Its only job is to prove that the
repository/package integration from Task 2 keeps the package importable.
"""

import importlib

CORE_MODULES = (
    "schema",
    "config_loader",
    "spellbook",
    "power",
    "scoring",
    "eligibility",
    "legality",
    "resolver",
    "canonical",
    "provenance",
)


def test_package_imports_and_exposes_version():
    pkg = importlib.import_module("ascension_trials")
    assert pkg.__version__


def test_core_modules_import():
    for name in CORE_MODULES:
        importlib.import_module(f"ascension_trials.{name}")
