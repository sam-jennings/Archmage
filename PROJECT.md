---
title: Archmage Ascension - Project Overview
type: project-orientation
updated: 2026-05-02
---

# Archmage Ascension - Project Overview

A competitive card game where wizards build patterns in their Spellbook from four energy types (Radiance, Void, Flux, Aether) to ascend to Archmage when the Source runs dry. Currently at rulebook v2.8, in **Stage 3 — Core Loop Testing**.

This file is Claude's orientation guide. Read this first in any session.

---

## How to work in this project

**Working files at the project root** (these are the live state — Claude maintains them, Sam reads them):

- `STATE.md` — current stage, problem, hypothesis, what's not being worked on
- `BACKLOG.md` — open tasks and decisions, prioritised
- `DECISIONS.md` — chronological log of design decisions made
- `PLAYTESTS.md` — index of playtest sessions, newest at top
- `playtests/` — one detail file per session

**Sam should never have to manually edit STATE/BACKLOG/DECISIONS/PLAYTESTS.** Skills update them as a side-effect of doing other work.

**Course knowledge** (read-only reference):
- `course-knowledge/Game Design Execution System.md` — weekly loop, decision engine, stage gates, anti-drift rules. The single most important reference.
- `course-knowledge/Board Game Design Knowledge Base.md` — synthesised reference across all 16 lessons.
- `course-knowledge/Lesson 01-16 ...` — individual lessons for deep dives.

**Rulebook and game content** — `rulebook/` contains:
- `Archmage Ascension - Complete Rulebook.md` — current rulebook (v2.8). Single source of truth.
- `GLOSSARY.md` — terminology.
- `Scoring System Reference.md` — Recognition Points table.
- `Ascension Trials.md` — advanced variant.
- `Story.md` — lore.

---

## Folder layout

```
Archmage Ascension/
├── PROJECT.md                              ← this file (orientation)
├── STATE.md                                ← live game state
├── BACKLOG.md                              ← tasks + decisions
├── DECISIONS.md                            ← decision log
├── PLAYTESTS.md                            ← playtest index
├── Playtest Guide - New Player Session.md  ← reusable session guide
├── playtests/                              ← session detail files
│
├── rulebook/                               ← rulebook + glossary + scoring + trials + lore
├── card-design/                            ← card visuals (HTML renderer + assets)
│   ├── playtable.html                      ← main card renderer
│   ├── playtable-mobile.html               ← mobile variant
│   ├── VISUAL_SYSTEM.md                    ← visual design system
│   ├── art/                                ← energy art (svg generators + assets)
│   ├── connectors/                         ← connection-strip variants
│   ├── lib/                                ← cards.js + tokens.css
│   └── export-cs3/                         ← Component Studio export
│
├── art/                                    ← raw art assets (energy artwork, card layers, ref boards, design system zip)
│
├── web-apps/                               ← player-facing tools
│   ├── archmage-reference.html             ← quick reference
│   ├── trials-multiplayer.html             ← trials simulator
│   └── archmage-theme.css
│
├── pitch/                                  ← pitch materials
│   └── archmage_pitch_sheet.html
│
├── tools/                                  ← designer-only analysis tools
│   └── optimiser/                          ← spellbook scoring optimiser (designer use only — NOT for player reference)
│
├── course-knowledge/                       ← read-only design course material
└── skills/                                 ← .skill files (archmage-card-designer, archmage-rulebook-manager, board-game-designer, playtest-organiser)
```

**Note on `art/` vs `card-design/`:** `card-design/` is the live HTML renderer + JS art generators that produce cards on the fly. `art/` holds raw imagery — reference photos, energy artwork specs, card layer PNGs, the design system zip, and any Claude-generated card boards. The renderer references `card-design/art/assets/` for live use; `art/` is the off-line library.

---

## What this project's skills do

**Project-state skills** (planned — see `structure-and-skills-plan.md` if it still exists, otherwise the plan now lives in this file's history):
- `aa-state-keeper` — keeps STATE.md current
- `aa-next-action` — answers "what should I do next?"
- `aa-backlog-curator` — maintains BACKLOG.md
- `aa-playtest-planner` — turns the current hypothesis into a session plan
- `aa-playtest-runner` — processes raw session notes into structured logs and backlog updates
- `aa-decision-recorder` — logs decisions through the course's Decision Engine

**Domain skills** (already installed):
- `archmage-rulebook-manager` — operates on `rulebook/`
- `archmage-card-designer` — operates on `card-design/`
- `board-game-designer` — meta-skill that knows the course material

---

## Working rules for Claude

1. **Read `STATE.md` at the start of every session.** It tells you the current stage, problem, and hypothesis. Tailor advice to where the project is, not where it could be.
2. **Read `BACKLOG.md` before suggesting work.** Don't invent tasks that already exist or are de-prioritised.
3. **Apply stage-aware filtering.** In Stage 3, content/art/pitch work is deferred. Surface this if Sam asks for it.
4. **Apply the course's anti-drift rules** (Game Design Execution System §9). Especially: don't add content to fix boredom, don't polish what's still being redesigned, don't change three things at once.
5. **Update STATE/BACKLOG/DECISIONS/PLAYTESTS as a side-effect.** Sam shouldn't have to ask.
6. **Don't surface designer-only tools (e.g. `tools/optimiser/`) in player-facing material.**

---

## Reality check (resolved 2026-05-02)

Earlier project documents (`md structure files/`, `Issues/`, the original `PROJECT.md`) tracked source-of-truth ambiguities that no longer exist. For the record:

- **Rulebook:** single source — `rulebook/Archmage Ascension - Complete Rulebook.md` (v2.8). Older versions are no longer kept in this folder.
- **Glossary:** single source — `rulebook/GLOSSARY.md`.
- **Scoring:** single source — `rulebook/Scoring System Reference.md`. Designer optimiser at `tools/optimiser/` references it for balance analysis only.
- **Visual system:** single source — `card-design/VISUAL_SYSTEM.md`.
- **Card renderer:** single source — `card-design/playtable.html` (mobile variant: `playtable-mobile.html`).
- **Pitch:** single source — `pitch/archmage_pitch_sheet.html`.
- **Story/lore:** single source — `rulebook/Story.md`.
