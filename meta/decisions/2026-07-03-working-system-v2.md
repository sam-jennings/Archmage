---
title: Adopt working-system v2 (meta/ + checker; retire four-file layer)
type: decision
date: 2026-07-03
status: canon
---

# 2026-07-03 — Adopt working-system v2

**Change:** Replaced STATE.md/BACKLOG.md/DECISIONS.md/PLAYTESTS.md and the six
`aa-*` skills with the `meta/` system: per-thread context files, one QUEUE,
per-decision files with propagation checklists, machine-checkable canon and
manifest, experiments with baseline revert kits, and `meta/checks/check.mjs` as
drift detection + computed session brief. Process logic lives once in
`meta/process.md`; Cowork (`aa-system` skill) and Kiro (steering + hooks) are
pointer-only adapters.

**Why:** Diagnosis in the working-system review (2026-07-03, archived): every
mechanism that depended on "remember to update X" rotted; problems A–H all traced to
upkeep-by-discipline. v2's invariant: every capture rule has a matching detection
rule. Design doc archived at `_archive/WORKING_SYSTEM_DESIGN.md`.

**Canon delta:** none (process change, not game content).

## Propagation

- [x] meta/ core built (process.md, manifest.yml, canon.yml, QUEUE.md, check.mjs)
- [x] STATE.md → PROJECT.md identity + threads/ + QUEUE Deferred
- [x] BACKLOG.md → QUEUE.md
- [x] DECISIONS.md → meta/decisions/ (one file each; Echo decision got checklist + experiment record)
- [x] PLAYTESTS.md dropped (session front-matter is the index)
- [x] PROJECT.md rewritten as ~20-line orientation
- [x] Kiro steering rewritten as pointers; hooks added
- [x] Old working files + resolved review docs → _archive/
- [x] Claude auto-memory updated to point at the new system
- [x] Sam: install `skills/aa-system.skill` in Cowork and remove the six `aa-*` skills (Settings → Capabilities) — confirmed installed 2026-07-03
