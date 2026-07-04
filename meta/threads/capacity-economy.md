---
thread: capacity-economy
status: active
updated: 2026-07-03
goal: Make enchantment pursuit viable without collapsing Drought tension
next: Rig-test the round-trip counter redesign (+ partial-unlearn lever) so the combined capacity fix can be chosen on paper before the next live session
hypothesis: If the round-trip counter redesign (placing a counter casts a spell; picking one up pays for a learning action — Recall becomes the payment, not a step) is pre-validated in the solo rig alongside partial unlearn, then a single combined fix can be chosen on paper and the next live session spent confirming experience rather than exploring options.
---

# Capacity economy

## Where this stands

The capacity/Source economy is confirmed structurally broken (Sessions 1 and 3):
enchantment pursuit is non-viable (2–3 turn overhead; only 2 of 5 players learned one
in Session 3), and 4-card Unlimited Capacity collapsed Drought tension once acquired —
one root cause, two surfaces.

The deck-structure half is decided: **Option 2 adopted 2026-07-02 as an experiment**
(`meta/decisions/2026-07-02-echo-option-2-deck.md`) — 2–4p deck unchanged, Echo suit
added at 5–6p, enchantment ladder 3=+1/6, 4=+3/12, 5=UC/18. On 2026-07-03 Sam locked
the open enchantment tunable (**4-card = +3 counters**) and added **2 starting counters
at 5–6p**; these plus the Convergence purge are now propagated through the rulebook,
Scoring System Reference, GLOSSARY, and web reference. Still rig-chosen, not yet
live-validated. Remaining propagation: regenerate card exports (card-visuals thread,
now unblocked). Open tunables still to watch: 5–6p wild count 4 vs 6; conjuration
viability under suit dilution.

The counter-mechanic half is still open: the round-trip redesign is proposed but not
analysed, tested, or chosen (Sam confirmed 2026-07-03 it's still undecided). Start-2
was absorbed by Option 2's setup; Drought-cap and first-ench-free levers were
superseded by the ladder.

## Next playtest goal

Confirm the rig-chosen combination live at 5 players: enchantment uptake above 2 of 5,
no counter-mechanic confusion when taught from written rules alone, and
conjuration/transfiguration stability intact.

## Biggest risk

The capacity constraint may be load-bearing for the rest of the loop — fixing it could
destabilise conjurations/transfigurations or over-loosen the Drought. A deeper
structural rethink than the tested levers may be needed.

## Context needed to resume

- Rig: `simulation/` (assumptions + results documented alongside); the 2-player
  digital build's code is reusable for self-play.
- Analysis history: `_review/FIFTH_SUIT_ANALYSIS.md`, archived
  `_archive/TWO_VERSION_PROPOSAL.md`, `_review/OPUS_TASK_enchantment_system.md`.
- Sessions are ~2–3 weeks apart: model first, spend live sessions on experience only.
