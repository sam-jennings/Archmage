---
title: Ascension Trials consolidated into a dedicated ascension-trials/ folder
type: decision
date: 2026-07-13
status: canon
---

# 2026-07-13 — Ascension Trials consolidation

## Context

Both Kiro specs for Ascension Trials are finished: `ascension-trials-configuration-model`
(VS1+VS2, 25/25 tasks checked) and `ascension-trials-scalable-two-player-analysis`
(VS3+VS4, 11/11 tasks checked). No active spec work is in progress.

Since the 2026-07-10 housekeeping pass (`meta/decisions/2026-07-10-ascension-trials-housekeeping.md`),
AT material had grown further and re-accumulated clutter in two shared folders:

- `simulation/` had gained two large generated milestone-bundle folders,
  `AT_model_VS1_VS6_complete/` and `AT_model_VS3_VS4_complete/`, sitting as
  siblings of the live `ascension_trials_model/` package and of unrelated
  general-purpose analysis scripts (`archmage_deck_sim.py`, `scoring_ev.py`,
  etc.).
- `_review/` had grown to 8 numbered AT design-history docs (01–08), mixed in
  among ~25 unrelated review docs on entirely different topics.

Sam found both unintuitive: AT is a large, mature, active workstream (a full
Python analysis package, two completed Kiro specs, its own thread), not a
scattering of files that happen to share a folder with unrelated project work.

## Decision

With the Kiro work finished (removing the "don't disturb an in-progress task"
constraint that shaped the 2026-07-10 pass), consolidate everything AT-specific
into one dedicated top-level folder.

Executed 2026-07-13:

- `simulation/ascension_trials_model/` → `ascension-trials/ascension_trials_model/`
  (the live Python package, unchanged internally — confirmed safe because both
  `pyproject.toml`'s `pythonpath = ["src"]` and the code's own root-finding
  logic (`Path(__file__).resolve().parents[2]` in `cli.py`, `PKG.parent.parent`
  in `tests/test_vs1_acceptance.py`) are relative, not hardcoded strings, and
  the new location preserves the same nesting depth from the repo root.
  Verified: `pytest` run before and after the move both report identical
  results — 501 passed (the 8 files needing NumPy/SciPy couldn't run in this
  environment either way: sandbox Python is 3.10, the package requires 3.12+ —
  a pre-existing environment constraint, unrelated to this move).
- `_review/ASCENSION_TRIALS_01..08*.md` → `ascension-trials/design-history/`
  (all 8 numbered docs, kept together as the ongoing design trail they are).
- `simulation/AT_model_VS1_VS6_complete/` and `simulation/AT_model_VS3_VS4_complete/`
  → `_archive/` (both are generated milestone-export snapshots, superseded by
  the live package; see `_archive/README.md` for why each is superseded).
  `AT_model_VS1_VS6_complete/` had an accidental double-nested folder
  (`AT_model_VS1_VS6_complete/AT_model_VS1_VS6_complete/...`, likely from a zip
  extraction) — flattened on archiving.
- `.gitignore` updated for the package's new `outputs/` and `.venv/` paths.
- All cross-references updated by literal path substitution
  (`simulation/ascension_trials_model` → `ascension-trials/ascension_trials_model`,
  `_review/ASCENSION_TRIALS_0` → `ascension-trials/design-history/ASCENSION_TRIALS_0`)
  across `meta/QUEUE.md`, `meta/threads/ascension-trials.md`, the F8 and
  at-entry-model decision files, `meta/manifest.yml`, `web-apps/config.js`,
  `_review/2P_STRATEGIC_DEPTH_DEEP_DIVE_2026-07.md`, both `.kiro/specs/ascension-trials-*`
  folders (path-string-only edits — no task/checkbox/content changes; both
  specs are finished so this carries none of the mid-task risk from the
  2026-07-10 pass), and every file within `ascension-trials/` itself (self-
  references between the docs, configs, fixtures, and source that moved
  together). JSON files spot-checked for validity after edit; all valid.
- The 2026-07-10 decision file is **not** rewritten — it remains an accurate
  historical record of the 2026-07-10 state, with a forward pointer added to
  this decision.

## Canon delta

None. Structural/housekeeping move only; no `meta/canon.yml` fields affected.

## Propagation

- [x] `_archive/README.md` — entry added for both archived bundle folders.
- [x] `meta/manifest.yml` — `ascension-trials/` added to `folders:`; purposes
      updated for `ascension-trials/`, `ascension-trials/ascension_trials_model/`,
      `ascension-trials/design-history/`.
- [x] `meta/threads/ascension-trials.md` — rewritten to reflect the current
      state (both specs finished, three locations not four, next step is
      playtest selection not implementation).
- [x] `meta/decisions/2026-07-10-ascension-trials-housekeeping.md` — forward
      pointer added; body left as historical record.
- [x] All cross-references (see list above) — path substitution applied and
      spot-checked.
- [x] Verification — `node meta/checks/check.mjs` clean of AT-related flags;
      `pytest` passes identically (501) before and after the move.

## Note for next session

Same two loose ends as the 2026-07-10 decision, still not fixed (out of scope
both times — content judgment calls, not mechanical path fixes):
`meta/QUEUE.md` cites a nonexistent `expansion/Ascension Trials Configuration Model.docx`,
and QUEUE.md's Deferred section still lists Ascension Trials among parked
Stage-4+ expansion concepts, contradicting the standing F8 decision.
