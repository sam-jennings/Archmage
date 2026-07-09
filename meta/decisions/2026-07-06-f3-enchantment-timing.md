---
title: F3 — Enchantment effect timing (gains next turn, losses immediate)
type: decision
date: 2026-07-06
status: superseded
---

# 2026-07-06 — F3 Enchantment timing

Source: `_review/ARCHMAGE_SAM_DECISIONS_F3_F14_2026-07.md` (Sam's July register review).

**Principle DECIDED (2026-07-06); folded into rulebook v3.1 (2026-07-09).** The rulebook
wording was previously gated on F1 (counter/capacity structure). F1 is now **fixed as the
current counters** (Sam, 2026-07-09), so F3 is **no longer gated** — the gate rule below
was implemented across the rulebook (LEARN / EMPOWER / RESHAPE / UNLEARN + the capacity
explanation + a worked example), `rulebook/GLOSSARY.md`, both html references, and
`web-apps/archmage-ascension/game/state.js` as part of the **v3.1 scoring & economy bump**
(`meta/decisions/2026-07-09-v3-1-scoring-economy-bump.md`), which now owns this change and
holds it under-test.

## Decision (principle)

- Capacity **gained** from an Enchantment becomes available at the **start of the
  owner's next turn**. *(unchanged)*
- Capacity **lost** from reducing / dissolving / reshaping an Enchantment applies
  **immediately**.
- **Affordability gate:** a player may **not** reduce or dissolve an Enchantment unless
  they can pay the action's counter cost (1) **AND** absorb the immediate capacity loss
  from their currently-available counters. If they cannot afford the action **plus** the
  loss, the action is **blocked** ("cannot afford action + loss → blocked").

This supersedes the earlier loss principle ("the loss applies immediately, *only* by
reducing the player's remaining learning actions this turn … breaking on your last action
is legal"): the affordability gate is a single check made **before** the action resolves,
with no retroactive action-count bookkeeping.

## Why

Blocks the known exploit of learning an Enchantment and spending the newly gained
capacity in the same Learning Phase, while also stopping a player breaking an
Enchantment and still using its capacity for the rest of the turn — now enforced by the
affordability gate rather than by auditing already-spent actions.

## Canon delta

Owned by the **v3.1 scoring & economy bump**
(`meta/decisions/2026-07-09-v3-1-scoring-economy-bump.md`) — implemented there and held
**under-test**. The gate is written into the rulebook LEARN / EMPOWER / RESHAPE / UNLEARN
sections, the capacity explanation (with a worked [8,8,8,8] example), `rulebook/GLOSSARY.md`,
both html references, and `web-apps/archmage-ascension/game/state.js`; `meta/canon.yml`
carries the v3.1 enchantment ladder. If the v3.1 playtest fails, this reverts with v3.1
back to the pre-bump state (see the bump's rollback procedure).

## Propagation (implemented via the v3.1 bump, 2026-07-09)

- [x] Rulebook LEARN / EMPOWER / RESHAPE / UNLEARN sections (v3.1)
- [x] Rulebook capacity explanation (v3.1 — includes the worked affordability-gate example)
- [x] `rulebook/GLOSSARY.md` — Learn, Enchantment, Capacity entries (v3.1)
- [x] Reference card / player mat — both html references (v3.1)
- [x] `web-apps/archmage-ascension/game/state.js` (v3.1)
- [x] `_review/DECISION_REGISTER_2026-07.md` F3 status updated (2026-07-06)

Candidate wording variants (token world vs Capacity Gauge world) are recorded in the
source addendum, §F3.
