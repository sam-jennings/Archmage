---
title: Ascension Trials Model — docs pointer
type: package-docs
updated: 2026-07-10
---

> **Housekeeping update (2026-07-10):** the moves this file describes as "deferred
> to Task 14" have been carried out manually — see
> `meta/decisions/2026-07-10-ascension-trials-housekeeping.md`. The two `_V*_1`
> docs now live in this folder; the root `Ascension Trials/` folder is gone. Kiro
> Task 14 in `.kiro/specs/ascension-trials-configuration-model/tasks.md` has now
> been verified from Kiro's side — repository checks show no undeclared-root-folder
> / structure warning and the VS1 pytest suite passes (378 passed) — and its
> checkbox is ticked.

# Ascension Trials Model — documentation

This folder is the package's documentation home in the approved layout
(design.md §3). To avoid a drifting second source of truth (structure steering;
process.md §5), the specification is **referenced here, not copied**.

## Canonical specification (single source of truth)

The approved Kiro spec lives at the repository root under `.kiro/`:

- [requirements.md](<../../../.kiro/specs/ascension-trials-configuration-model/requirements.md>) — REQ-1..REQ-15 and NFRs
- [design.md](<../../../.kiro/specs/ascension-trials-configuration-model/design.md>) — architecture, schema, testing strategy
- [tasks.md](<../../../.kiro/specs/ascension-trials-configuration-model/tasks.md>) — implementation plan
- [task-1-reconciliation.md](<../../../.kiro/specs/ascension-trials-configuration-model/task-1-reconciliation.md>) — existing-code reconciliation (authoritative implementation status)

Do not copy these into the package; edit them in `.kiro/specs/...`.

## Normative sources (model + implementation spec)

The current versions live in this folder:

- [ASCENSION_TRIALS_CONFIGURATION_MODEL_V2_1.md](ASCENSION_TRIALS_CONFIGURATION_MODEL_V2_1.md)
- [ASCENSION_TRIALS_KIRO_IMPLEMENTATION_SPEC_V1_1.md](ASCENSION_TRIALS_KIRO_IMPLEMENTATION_SPEC_V1_1.md)

`README.md` and `src/ascension_trials/__init__.py` point at
`docs/ASCENSION_TRIALS_CONFIGURATION_MODEL_V2_1.md` — that reference now resolves.

## Root-folder housekeeping — executed 2026-07-10

This section is kept as a historical record of the disposition table used (Task 2
established the layout and references only; the actual moves below were then run
manually rather than waiting for Task 14, per Sam's direction — see
`meta/decisions/2026-07-10-ascension-trials-housekeeping.md`):

| Source (root `Ascension Trials/`) | Destination | Rationale | Status |
|---|---|---|---|
| `ASCENSION_TRIALS_CONFIGURATION_MODEL_V2_1.md` | `simulation/ascension_trials_model/docs/` | current normative model | done |
| `ASCENSION_TRIALS_KIRO_IMPLEMENTATION_SPEC_V1_1.md` | `simulation/ascension_trials_model/docs/` | current implementation spec | done |
| `ASCENSION_TRIALS_CONFIGURATION_MODEL.md`, `ASCENSION_TRIALS_CONFIGURATION_MODEL_V2.md`, `ASCENSION_TRIALS_KIRO_IMPLEMENTATION_SPEC.md` | `_archive/` | superseded earlier versions | done |
| `ASCENSION_TRIALS_01_ENTRY_CAP_REBUILD_SUPERSEDED_2026-07-06.md`, `ASCENSION_TRIALS_02_HYBRID_REBUILD_PROPOSAL_2026-07-06.md`, `ASCENSION_TRIALS_03_HYBRID_REBUILD_CRITIQUE_2026-07-06.md`, `ASCENSION_TRIALS_04_CONFIG_MODEL_ADVERSARIAL_REVIEW_2026-07-10.md` | deleted (byte-identical duplicates of the existing `_review/` copies) | proposals / critiques / adversarial review already lived in `_review/` | done |
| `Ascension Trials Rules.md` | deleted | confirmed byte-identical to `rulebook/Ascension Trials.md`; that's the sole authoritative copy | done |
| `ascension-trials-configuration-model-spec/` (requirements/design/tasks copies) | deleted | superseded by the canonical `.kiro/specs/...` copies | done |

Cross-references repaired as part of this pass:
- `meta/decisions/2026-07-06-f8-ascension-trials-reconcile.md` and
  `meta/decisions/2026-07-06-at-entry-model-secret-allocation.md` already pointed
  at `_review/ASCENSION_TRIALS_0{1,2,3}_...` — those paths needed no change since
  the `_review/` copies were never moved, only the root duplicates were removed.
- This folder's "Normative sources" links (above) now resolve locally.
- `simulation/ascension_trials_model/README.md` updated to drop the "Task 14"
  deferral language.
- The root folder is gone, so no `Ascension Trials/` entry was ever needed in
  `meta/manifest.yml`, and the `[structure] undeclared folder at root` checker
  warning is cleared.
