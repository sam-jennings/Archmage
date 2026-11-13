---
title: VS1 + VS2 + VS2-C Milestone — Session Verification Log
type: spec-report
spec: ascension-trials-configuration-model
scope: VS1 + VS2 + VS2-C (milestone close)
updated: 2026-07-10
status: recorded
---

# VS1 + VS2 + VS2-C Milestone — Session Verification Log

This is the session verification log referenced by `VS2_COMPLETION_REPORT.md` §12 and
§13.6. It records the deliberate milestone commit and the **from-committed-state**
reproduction of the gate commands. It is written **after** the milestone commit (so it
carries that commit's own hash) and is a post-commit record; it is intentionally not
part of the committed milestone tree.

## Milestone commit

- **Hash:** `688c7ee077ab6a1822505a1cb507dd5bba4985bc`
- **Short:** `688c7ee`
- **Branch:** `v3.1-scoring-economy`
- **Parent:** `8b605f0` — the VS1+VS2 milestone commit ("Ascension Trials configuration
  model: VS1+VS2 milestone (approved)"), itself on top of `71cad20` (rulebook v3.1
  under-test).
- **Subject:** `Ascension Trials model: VS2-C correction pass milestone (approved)`
- **Files:** 20 changed, 2365 insertions(+), 108 deletions(-).

### Commit scope (deliberate)

The commit captures the **complete VS1 + VS2 + VS2-C ascension-trials deliverable** and
its governing artifacts:

- `ascension-trials/ascension_trials_model/` — full package (VS2-C source, tests, new toy
  configs `interchangeable_5_3.json` / `second_place_collision.json`, new fixtures A19
  / A20, updated `docs/VS2_COMPLETION_REPORT.md`);
- `ascension-trials/design-history/ASCENSION_TRIALS_04_CONFIG_MODEL_ADVERSARIAL_REVIEW_2026-07-10.md` and
  `ascension-trials/design-history/ASCENSION_TRIALS_05_VS2_LAB_AUDIT_2026-07-10.md` (the audits driving VS2-C);
- `meta/decisions/2026-07-10-ascension-trials-housekeeping.md`;
- `meta/threads/ascension-trials.md` (campsite update: VS2-C approved).

Unrelated in-flight work from other threads was **deliberately left uncommitted** so the
milestone stays a clean, single-concern record: rulebook v3.1 wording / GLOSSARY edits,
the web reference overhaul (`web-apps/archmage-reference.html`,
`web-apps/player-reference/player-reference.html`, `web-apps/archmage-tokens.css`), the
`expansion/` restructuring, the `2026-07-10-retire-dissolve-terminology.md` decision, and
the mixed `meta/{QUEUE,canon,manifest,threads/expansions,threads/rules-and-teaching}` and
`meta/experiments/vnext-scoring-economy/RECORD.md` edits. None of those are part of the
ascension-trials milestone.

## Environment

CPython 3.13.5 (matches `VS2_COMPLETION_REPORT.md`; NumPy 2.3.3 / SciPy 1.16.0 pinned in
`requirements.lock`).

## From-committed-state reproduction

All commands run from the committed HEAD `688c7ee`.

### 1. Full suite — `python -m pytest -q`

Run from `ascension-trials/ascension_trials_model/`:

```
456 passed in 129.09s (0:02:09)
```

Exit code `0`. Reproduces the `456 passed` recorded in the report (378 VS1 preserved +
VS2 including the 13 VS2-C regressions).

### 2. VS2 warnings-as-errors

Run from `ascension-trials/ascension_trials_model/`:

```
python -m pytest tests/test_enumeration.py tests/test_matrix_collapse.py \
  tests/test_dominance.py tests/test_equilibrium.py \
  tests/test_vs2_reports.py tests/test_vs2_acceptance.py \
  -W error::UserWarning -W error::RuntimeWarning -q
```

```
78 passed in 127.13s (0:02:07)
```

Exit code `0`. No NumPy/SciPy `UserWarning`/`RuntimeWarning` is promoted to a failure —
the solvers are clean under warnings-as-errors.

### 3. Working-system checker — `node meta/checks/check.mjs`

Run from the project root. Exit code `1` (the checker returns non-zero whenever any flag
is present). The flags are exactly the two **pre-existing, benign** ones already
documented in `VS2_COMPLETION_REPORT.md` §10.3 and §10.4 — **no new flag was introduced
by this milestone**:

- `[structure] undeclared folder at root: .venv/` — local IDE-created virtualenv,
  gitignored, not part of the deliverable (§10.3).
- `[decisions] 2026-07-06-at-entry-model-secret-allocation.md: 1 open propagation item`
  — pre-existing, unrelated to this spec (§10.4).

The `ascension-trials` thread line in the brief now reads "VS2-C ... complete and
APPROVED", confirming the campsite update landed.

## Result

The committed milestone `688c7ee` reproduces every VS2/VS2-C gate command exactly:
`456 passed`, `78 passed` under `-W error`, and a checker state carrying only the two
known-benign pre-existing flags. VS3–VS6 remain unstarted; VS3+VS4 are scoped for review
in `.kiro/specs/ascension-trials-scalable-two-player-analysis/`.
