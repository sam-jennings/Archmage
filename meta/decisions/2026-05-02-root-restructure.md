---
title: Restructure project into minimal Claude-maintained layer
type: decision
date: 2026-05-02
status: superseded
superseded_by: 2026-07-03-working-system-v2.md
---

# 2026-05-02 — Restructure project into minimal Claude-maintained layer

**Change:** Replaced `md structure files/` (HOME, SOURCE_OF_TRUTH, CURRENT_STATE,
DECISION_LOG, PLAYTEST_LOG, PROJECT, 6 MOCs) with five working files at the project
root: PROJECT.md, STATE.md, BACKLOG.md, DECISIONS.md, PLAYTESTS.md. Deleted `Issues/`
and `_templates/`. Resolved source-of-truth ambiguities for rulebook, glossary,
scoring, visual system, card renderer, and pitch.

**Why:** The old structure required Sam to manually maintain dashboards, MOCs, and
issue notes; most were stale. Sam wants Claude as curator.

**Outcome:** Directionally right (agent as curator) but the four-file ontology still
assumed a human reader and had no drift detection — diagnosed in the working-system
review and replaced by working-system v2 on 2026-07-03. Sources-of-truth resolution
survives (now in `meta/manifest.yml`).

## Propagation

- [x] All items completed 2026-05-02; layer replaced 2026-07-03.
