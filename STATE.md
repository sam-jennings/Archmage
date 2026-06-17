---
title: Current State
type: state
updated: 2026-06-04
updated_by: aa-state-keeper
---

# Current State

## Stage

**Stage 3 — Core Loop Testing**

The game is playable end-to-end. The job right now is to confirm that the central player actions create the intended experience — that players understand what they're doing, that the loop generates tension and meaningful choices, and that all four spell types are viable paths. Session 3 surfaced that one of the four core pleasures (Enchantment) is structurally unreachable, so the game is still squarely in core-loop work — not polish, not pitch, not a second platform.

## Target player

Strategy gamers who enjoy a 30–60 minute tactical card game with thematic integration — the wizard / spell-building fantasy. Specifically players who like building combos and patterns toward an escalating payoff, not abstract optimisers. They want to feel like they're constructing something, not just optimising numbers.

## Core experience

Building patterns of magical components into your Spellbook over the course of the game, racing the depleting Source toward the moment when the magic itself converges on the most powerful wizard. The pleasure is in arranging components into spells (Conjuration, Transfiguration, Enchantment, Perfect Transmutation), watching your Spellbook grow, and the climactic Drought ending.

## Current problem

The capacity / Source economy makes Enchantment pursuit non-viable — it costs a 2–3 turn overhead to free up learning capacity, so most players never learn an enchantment at all (only 2 of 5 in Session 3); this is a structural design problem, not communication. Secondary, still unresolved: the counter refresh rule is not comprehensible from the written rules alone.

## Current hypothesis

If the enchantment-capacity economy is modelled analytically first (turn-budget per player vs Source depletion vs the opportunity cost of each spell path), then the best candidate fix — e.g. partial unlearning — can be identified and pre-validated on paper before committing a live session to it.

## Next playtest goal

Confirm whether the analytically-chosen capacity fix (likely partial unlearn) lets players pursue enchantments without multi-turn overhead — measured by enchantment uptake rising above 2 of 5 in a 5-player game — without breaking conjuration/transfiguration stability.

## Biggest current risk

The capacity system may need a deeper structural rethink than a single lever (partial unlearn) can deliver — i.e. the constraint that makes enchantments scarce may be load-bearing for the rest of the loop, so fixing it could destabilise conjurations/transfigurations.

## Not doing yet

- Final card art (Anti-Drift Rule 2 — polish deferred while the core loop is still being clarified)
- The 2-player digital build *as a shippable product* (deferred — but a rough solo self-play rig built from it IS in scope, see working approach below)
- Pitch sheet revisions (game must be stable first)
- Expansion development (Ascension Trials etc.)
- Content additions / new card types incl. a fifth suit (Anti-Drift Rule 1: don't add content to fix a structural gap)
- Rulebook full polish pass (Stage 6 work)
- Steal-cards or conflict mechanics (scope addition without evidence of core loop working)

## Working approach (between sessions)

Sessions are ~2–3 weeks apart, so between-session time goes to analytical and solo work, not live testing:

- **Model first, then test** — resolve structural/numbers questions (capacity economy, Source depletion by player count, score-table extension, 4-card Drought cap) on paper or in a model; spend live playtests only on confirming *experience*.
- **Self-play rig** — build a rough solo simulator (can reuse the 2-player digital code) to run many enchantment-economy experiments per week instead of one every three weeks. Self-playtesting is the currently-neglected discipline being added.
