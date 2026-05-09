---
title: Decision Log
type: decision-log
updated: 2026-05-02
updated_by: claude
---

# Decision Log

> Chronological log of design decisions. Newest at top. Maintained by the `aa-decision-recorder` skill (planned).

---

## 2026-05-02 — Restructure project into minimal Claude-maintained layer

**Change:** Replaced the `md structure files/` folder (HOME, SOURCE_OF_TRUTH, CURRENT_STATE, DECISION_LOG, PLAYTEST_LOG, PROJECT, 6 MOCs) with five working files at the project root: PROJECT.md, STATE.md, BACKLOG.md, DECISIONS.md, PLAYTESTS.md. Deleted `Issues/` and `_templates/` folders. Resolved source-of-truth ambiguities for rulebook, glossary, scoring, visual system, card renderer, and pitch.

**Why:** The old structure was built for a human curator and required Sam to manually maintain dashboards, MOCs, and issue notes. Most files were stale (references to v2.6 vs v2.8 rulebooks, three competing visual system files, dangling `[[Issues/...]]` links, `card-design-combined.html` referenced but not present). Sam wants Claude as curator, with skills updating state as a side-effect of doing the actual work.

**Stage:** Stage 3 — workflow infrastructure, not game design.

**Affected:** Project root layout, PROJECT.md, deletion of `md structure files/`, `Issues/`, `_templates/`, and the eval HTML files at root. New files: STATE.md, BACKLOG.md, DECISIONS.md, PLAYTESTS.md.

**Status:** Done. Skills to be built next.
