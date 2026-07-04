# Product

**Archmage Ascension** is a competitive tabletop card game (currently rulebook v2.8). Wizards build patterns in their Spellbook from four energy types (Radiance, Void, Flux, Aether — plus Echo in 5–6 player decks, under test) and race a depleting Source, ascending to Archmage when the Source runs dry.

## What this repository is

This is primarily a **game-design repository**, not a software product. Its main output is the game itself: rules, card designs, board components, and the design decisions behind them. Supporting software (web reference tools, a digital build, a simulation rig) exists to serve the design process and players — it is not the deliverable.

- **Target player:** strategy gamers who enjoy a 30–60 minute tactical card game with a wizard / spell-building theme. They want to feel like they are constructing combos and patterns toward an escalating payoff, not optimising abstract numbers.
- **Core experience:** arranging magical components into spells (Conjuration, Transfiguration, Enchantment, Perfect Transmutation), watching the Spellbook grow, and the climactic Drought ending.
- **Current stage:** Stage 3 — Core Loop Testing. The game is playable end-to-end; the work is confirming the core loop creates the intended experience.

## How to work here

All process rules live in **`meta/process.md`** — read it; the steering files add
nothing (see `working-system.md`). Highlights, for orientation only:

- Session brief = `node meta/checks/check.mjs` (computed, never stale).
- Per-thread context in `meta/threads/`; the only to-do list is `meta/QUEUE.md`.
- Decisions are captured same-turn in `meta/decisions/` with propagation checklists.
- **Advise, don't gate:** surface stage/priority tradeoffs in a line or two, then do
  what the user asks. Maintenance of `meta/` is the agent's job, never the user's.
- Keep designer-only tools (`tools/`) out of player-facing material.
