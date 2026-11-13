# Ascension Trials Model

Deterministic analysis model for comparing **Ascension Trials** configurations
(the advanced endgame variant of Archmage Ascension).

The canonical specification is the Kiro spec at
`.kiro/specs/ascension-trials-configuration-model/`; the normative model and
implementation-spec sources are indexed from [`docs/README.md`](docs/README.md)
and now live physically in `docs/` (root-folder housekeeping, 2026-07-10 — see
`meta/decisions/2026-07-10-ascension-trials-housekeeping.md`). The Kiro spec
itself is still **referenced, not copied**, to keep a single source of truth.

The model represents rulesets as **data** (see `configs/`) and never hard-codes a
preferred configuration. It resolves any fixed state + allocation profile
deterministically and verifies the adversarial fixtures from the review.

## Status

VS1 is **complete and approved** (gate approved 2026-07-10 — see
`docs/VS1_COMPLETION_REPORT.md`). **VS2 is in progress.** The authoritative task
plan is `tasks.md` in the spec folder; the Task 1 reconciliation note
(`.kiro/specs/ascension-trials-configuration-model/task-1-reconciliation.md`)
records the original per-module reconciliation.

VS1 delivered (all acceptance tests green): the configuration / Spellbook /
player-state / allocation schemas and JSON loader; standard scoring q(S) and
Trials domain power F_C(S) as independent, separately-provenanced code paths;
declarative conjunctive eligibility; the deterministic resolver with audit trace;
the six committed configurations (`configs/`); the ten source-backed VS1 fixtures
(`fixtures/`); the acceptance suite (`tests/`); and the CLI / deterministic
reports.

**VS2 (in progress)** adds the small-state exact laboratory: allocation
enumeration, strategic-equivalence collapse, two-player payoff matrices,
true strict-dominance elimination, the numerical zero-sum LP (SciPy HiGHS,
labelled `numerical_lp`) and the maximum-entropy canonical equilibrium
(labelled `numerical_convex`). VS3–VS6 remain out of scope.

## Running the tests

VS1 has **no third-party runtime dependency**. You only need `pytest`:

```bash
cd ascension-trials/ascension_trials_model
python -m pytest
```

Tests import the package straight from `src/` (configured via
`pyproject.toml [tool.pytest.ini_options] pythonpath`), so no install step is
required for VS1. This runs the full VS1 acceptance suite plus the per-module
unit suites. **VS2 tests additionally require NumPy and SciPy** (see VS2 setup
below).

## Generating fixture reports (Task 13)

```bash
python -m ascension_trials.reports        # writes JSON + Markdown to outputs/
```

`outputs/` is git-ignored. VS1 report generation is delivered via the CLI (see
`docs/VS1_COMPLETION_REPORT.md`). VS2 adds exact-laboratory and equilibrium
sections to the reports.

## VS2 setup

VS2 (enumeration, dominance, LP and equilibrium) requires NumPy and SciPy, pinned
in `requirements.lock`:

```bash
python -m pip install -r requirements.lock   # numpy + scipy (pinned)
```
