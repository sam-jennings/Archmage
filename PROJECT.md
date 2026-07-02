---
title: Archmage Ascension - Project Overview
type: project-orientation
updated: 2026-07-02
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
├── index.html                              ← site landing page (hub linking to the web-apps)
├── STATE.md                                ← live game state
├── BACKLOG.md                              ← tasks + decisions
├── DECISIONS.md                            ← decision log
├── PLAYTESTS.md                            ← playtest index
├── Playtest Guide - New Player Session.md  ← reusable session guide
├── playtests/                              ← session detail files
│
├── rulebook/                               ← rulebook + glossary + scoring + trials + lore
├── board/                                  ← physical game components: A3 landscape board PDF + printable player reference cards (spell_ref, turn_ref)
├── card-design/                            ← card visuals (HTML renderer + art). Primary design: arcana + beacon (see card-design/VISUAL_SYSTEM.md)
│   ├── playtable.html                      ← main card renderer
│   ├── playtable-mobile.html               ← mobile variant
│   ├── VISUAL_SYSTEM.md                    ← visual design system (single source)
│   ├── art/arcana.js                       ← primary art variant (procedural SVG, all 5 currents + wild)
│   ├── connectors/beacon.js                ← primary connector (glowing orb at value Y)
│   ├── lib/                                ← cards.js + tokens.css
│   ├── export-cs3/                         ← Component Studio export (node project)
│   ├── export-printenbind/                 ← print-ready output (final bundles only; per-card PDFs gitignored)
│   ├── printenbind/                        ← printenbind session working files
│   ├── generated/                          ← generated review/style/production boards
│   ├── incoming/                           ← incoming layout sandboxes
│   └── snapshots/                          ← dated version snapshots (history)
│
├── art/                                    ← raw art library: energy artwork PNGs, card-layer PNGs, symbol sheets, energy symbol exports (svg + png)
│
├── web-apps/                               ← player-facing tools
│   ├── archmage-reference.html             ← detailed online rules (full reference)
│   ├── player-reference/                   ← quick-reference card for the table (phone-first)
│   │   └── player-reference.html
│   ├── trials-multiplayer.html             ← trials simulator
│   ├── spellbook-optimizer.html            ← player-facing spellbook optimiser
│   ├── archmage-theme.css
│   ├── REFERENCE_SITE_PLAN.md              ← plan for the player-facing reference site
│   └── archmage-ascension/                 ← 2-player digital build (React/Vite); rulebook copies live in its uploads/
│
├── pitch/                                  ← pitch materials
│   └── archmage_pitch_sheet.html
│
├── tools/                                  ← designer-only analysis tools
│   ├── optimiser/                          ← spellbook scoring optimiser (designer use only — NOT for player reference)
│   ├── economy_model.xlsx                  ← economy/balance model
│   └── aa-idea-refinery-eval-review.html   ← idea-refinery eval review
│
├── expansion/                              ← parked expansion concepts (do not develop until Stage 4+)
│   ├── EXPANSION_INDEX.md                  ← index and reading order
│   ├── Expansion Concepts - Player Interaction.md  ← master overview: A (Living Array), B (Spell Duels), C (Conclave)
│   ├── Expansion B - Spell Duels (Deep Dive).md    ← frequency-driven clash chassis
│   ├── Expansion B - Spell Duels Alternative (Resonance Gambits).md  ← safer baseline effects (recommended starting point)
│   ├── Expansion B - Spell Duels (Bold Effect Directions).md         ← bolder effect directions (Elemental Powers, Marks, Bend Magic)
│   ├── Expansion B - Spell Duels (Reconciled & Tiered).md            ← reconciled, tiered synthesis of the Spell Duels directions
│   └── Expansion Directions - Echo and the High Frequencies.md       ← Echo / high-frequency expansion direction
│
├── course-knowledge/                       ← read-only design course material
├── skills/                                 ← .skill files (10): six aa-* state skills + archmage-card-designer, archmage-rulebook-manager, board-game-designer, playtest-organiser
│
├── _review/                                ← unresolved work awaiting a decision; each item mirrored by a BACKLOG.md entry (should trend to empty)
└── _archive/                               ← superseded material kept for reference (gitignored; only grows)
```

**Note on `board/`, `art/`, and `card-design/`:**

- **`board/`** holds the physical game components — the A3 landscape game
  board PDF and the printable player-reference cards (`spell_ref.png`,
  `turn_ref.png`). Promoted to a top-level folder because the board is a
  key game component that the rulebook depends on.
- **`card-design/`** is the live HTML renderer and the procedural art that
  ships to print. Since the 2026-07-02 primary-design decision, `card-design/art/`
  contains only `arcana.js` (the chosen art) and `card-design/connectors/`
  contains only `beacon.js` (the chosen connector). Arcana is fully
  procedural — no bitmap assets — so `card-design/art/` no longer needs an
  `assets/` subfolder.
- **`art/`** is the raw off-line library: the energy artwork PNGs, card-layer
  PNGs, symbol sheets, and energy symbol exports (SVG + PNG). Nothing in
  `art/` is referenced by the live renderer.

---

## What this project's skills do

**Project-state skills** (built — live in `skills/`):
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
