---
title: Ascension Trials root-folder housekeeping executed manually (ahead of Kiro Task 14)
type: decision
date: 2026-07-10
status: canon
---

> **Superseded by a further move (2026-07-13):** everything this decision placed in
> `simulation/ascension_trials_model/docs/` has since moved again to
> `ascension-trials/ascension_trials_model/docs/` — see
> `meta/decisions/2026-07-13-ascension-trials-consolidation.md`. This file is left
> as-written below as an accurate historical record of the 2026-07-10 state; do not
> edit the paths in the body text to match the current layout.

# 2026-07-10 — Ascension Trials root-folder housekeeping

## Context

AT material had sprawled across five locations: `rulebook/` (canon rules),
`_review/` (proposal/critique/adversarial-review docs), a new root `Ascension
Trials/` folder (duplicates of the `_review/` docs, plus versioned config-model
and Kiro-implementation-spec snapshots, plus a stale forked copy of the
`.kiro/specs/ascension-trials-configuration-model/` spec, plus a duplicate of
the rulebook file), `simulation/ascension_trials_model/` (the real implementation),
and `.kiro/specs/ascension-trials-configuration-model/` (the canonical spec).

The root folder was already flagged by `check.mjs` as an undeclared folder.
Crucially, its cleanup was **already planned** — `simulation/ascension_trials_model/docs/README.md`
contained a fully worked-out disposition table (written as prep for Kiro spec
Task 14: "Complete VS1 repository housekeeping"), and code already depended on
it: `src/ascension_trials/__init__.py`'s docstring pointed at
`docs/ASCENSION_TRIALS_CONFIGURATION_MODEL_V2_1.md`, a path that only resolved
once that plan was carried out.

## Decision

Sam asked to run this housekeeping now rather than wait for Kiro to reach Task
14 in its own sequence, and to follow the pre-written disposition table exactly
(not a competing structure), since it required zero edits to already-checked-off
Task 1/2 deliverables and resolved references that were already dangling.

Executed 2026-07-10:
- `ASCENSION_TRIALS_CONFIGURATION_MODEL_V2_1.md`, `ASCENSION_TRIALS_KIRO_IMPLEMENTATION_SPEC_V1_1.md`
  → moved to `simulation/ascension_trials_model/docs/` (current normative sources).
- `ASCENSION_TRIALS_CONFIGURATION_MODEL.md`, `ASCENSION_TRIALS_CONFIGURATION_MODEL_V2.md`,
  `ASCENSION_TRIALS_KIRO_IMPLEMENTATION_SPEC.md` → moved to `_archive/` (superseded snapshots).
- `ASCENSION_TRIALS_01..04*.md` (root copies) → deleted; confirmed byte-identical
  to the existing `_review/` copies, which remain the sole copies.
- `Ascension Trials Rules.md` → deleted; confirmed byte-identical to
  `rulebook/Ascension Trials.md`, which remains the sole canon rules copy.
- `ascension-trials-configuration-model-spec/` (stale fork of
  `.kiro/specs/ascension-trials-configuration-model/`, already diverged) → deleted.
- Root `Ascension Trials/` folder removed entirely (now empty).

**`.kiro/specs/ascension-trials-configuration-model/` was left completely
untouched** — no content edits, no checkbox changes — since Sam is mid-spec
there and didn't want the next task's context disturbed. Task 14 in `tasks.md`
stays unchecked; when Kiro/Sam reaches it, the physical moves are already done,
so what remains is verification (run repository checks, confirm the checker is
clean) rather than the moves themselves.

## Canon delta

None. This is a structural/housekeeping move, not a rules or scoring change.
No `meta/canon.yml` fields affected.

## Propagation

- [x] `simulation/ascension_trials_model/docs/README.md` — updated to reflect
      the executed disposition (was written as a plan; now a historical record
      + status note), local links fixed.
- [x] `simulation/ascension_trials_model/README.md` — dropped "Task 14" deferral
      language.
- [x] `_archive/README.md` — added entry for the three archived snapshots.
- [x] `meta/manifest.yml` — no entry needed (root folder never declared, now
      doesn't exist; confirmed via checker).
- [x] `meta/threads/ascension-trials.md` — created as its own active thread
      (previously AT had no dedicated thread; it doesn't belong under the
      parked `expansions` thread since F8 already declared it an active
      workstream).
- [x] `.kiro/specs/ascension-trials-configuration-model/tasks.md` Task 14 —
      verified 2026-07-10 (Kiro Task 14): the physical moves above are confirmed
      in place (both `_V*_1` docs under `simulation/ascension_trials_model/docs/`,
      the three superseded snapshots in `_archive/`, the root `Ascension Trials/`
      folder gone), all cross-references resolve, `node meta/checks/check.mjs`
      reports no undeclared-root-folder / structure warning, and the VS1 pytest
      suite passes (378 passed). Task 14 checkbox ticked.

## Note for next session

`meta/QUEUE.md` line (Master-plan chain section) cites
`expansion/Ascension Trials Configuration Model.docx` — that file does not
exist anywhere in the repo (verified by search). Likely a stale reference from
before the model was written up as the `.md` snapshots. Not fixed here (out of
scope of this housekeeping pass; a content-accuracy question, not a path broken
by this move) — flagged for whoever next touches that QUEUE line.

Separately, `meta/QUEUE.md`'s Deferred section still lists "Ascension Trials"
among parked Stage-4+ expansion concepts, which contradicts the standing F8
decision (`2026-07-06-f8-ascension-trials-reconcile.md`) that AT is an active,
not parked, workstream. Also not fixed here — flagged, since it's a content
judgment call, not a mechanical path fix.
