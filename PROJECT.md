---
title: Archmage Ascension — Project Overview
type: project-orientation
updated: 2026-07-06
---

# Archmage Ascension

A competitive tabletop card game (rulebook v2.8, Stage 3 — Core Loop Testing).
Wizards build patterns in their Spellbook from four energy types — Radiance, Void,
Flux, Aether (plus Echo in 5–6 player decks, under test) — racing the depleting
Source to become the Renewer when it runs dry.

> **Title.** Final name chosen 2026-07-16: **Arcane Drought** (DR-NAME resolved — see
> `meta/decisions/2026-07-16-dr-name-arcane-drought.md`). "Archmage Ascension" stays as
> the working title on repo surfaces until the one-pass rename, still gated with the
> pitch (DR-PITCH / F14). End-narrative already reworked: the winner is the **Renewer**
> who breaks the Arcane Drought (`rulebook/Story.md`).

**The hook (protected — DR-HOOK, 2026-07-06):** *It's rummy where your melds stay alive
as spell engines — but every spell you cast burns down the shared Source, and when it
runs dry your Spellbook becomes the proof that decides who can renew the world's magic.*
Standing rule: no change may make this hook less visible at the table. See
`meta/decisions/2026-07-06-protect-the-hook.md`.

**Target player:** strategy gamers who enjoy a 30–60 minute tactical card game with
the wizard/spell-building fantasy — building combos and patterns toward an escalating
payoff, constructing something rather than optimising numbers.

**Core experience:** arranging components into spells (Conjuration, Transfiguration,
Enchantment, Perfect Transmutation), watching the Spellbook grow, and the climactic
Drought ending.

## For the agent

- **How this project runs:** `meta/process.md` — the single source of process truth.
- **Session brief:** run `node meta/checks/check.mjs` — orientation is computed, never stored.
- **Layout:** declared in `meta/manifest.yml`. **Canon:** `meta/canon.yml`.
- Work threads: `meta/threads/`. To-do list: `meta/QUEUE.md`. Decisions: `meta/decisions/`.
- Sam never hand-edits `meta/` — maintenance is the agent's job, as a side-effect of work.
