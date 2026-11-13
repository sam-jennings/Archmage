---
title: Ascension Trials — folder index
type: package-docs
updated: 2026-07-13
---

# Ascension Trials

The advanced endgame variant for Archmage Ascension. This folder holds the
implementation and design-history material; two things deliberately stay
outside it, referenced rather than copied (single source of truth,
`meta/process.md` §5):

- **Rules (canon):** `rulebook/Ascension Trials.md` — lives with the rest of
  the rulebook, same as every other rules document.
- **Kiro specs:** `.kiro/specs/ascension-trials-configuration-model/` (VS1+VS2,
  finished — 25/25 tasks) and `.kiro/specs/ascension-trials-scalable-two-player-analysis/`
  (VS3+VS4, finished — 11/11 tasks) — Kiro's own spec storage convention.

## What's here

- **`ascension_trials_model/`** — the live Python analysis package (VS1–VS4).
  `pyproject.toml`, `src/ascension_trials/`, `tests/`, `configs/` (incl.
  `candidates/` — the finalist configs from the shortlist), `fixtures/`,
  `outputs/` (generated, gitignored), and `docs/` (the current normative
  model + Kiro-implementation-spec versions, plus the VS1/VS2/VS2-C/VS3
  completion reports).
- **`design-history/`** — the numbered design trail, in order: `01` entry-cap
  rebuild (superseded) → `02` hybrid rebuild proposal → `03` critique → `04`
  adversarial review of the config model → `05` VS2 lab audit → `06`
  configuration selection plan → `07` candidate shortlist (**current — pick a
  candidate and schedule playtests**) → `08` shortlist appendix (transparency
  detail).

## How this got here

Two consolidation passes, both logged as decisions:
`meta/decisions/2026-07-10-ascension-trials-housekeeping.md` (root-folder
cleanup, mid-Kiro-spec) and `meta/decisions/2026-07-13-ascension-trials-consolidation.md`
(this folder's creation, once both Kiro specs finished — pulled AT material
out of `simulation/` and `_review/`, where it read as clutter).

Full current status, next action, and context: `meta/threads/ascension-trials.md`.
