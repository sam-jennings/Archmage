---
title: F3 — Enchantment effect timing (gains next turn, losses immediate)
type: decision
date: 2026-07-06
status: proposed
---

# 2026-07-06 — F3 Enchantment timing

Source: `_review/ARCHMAGE_SAM_DECISIONS_F3_F14_2026-07.md` (Sam's July register review).

**Principle: DECIDED. Rulebook wording: gated by F1** (counter/capacity structure).
This file records the accepted principle; the text is not written into the rulebook
until F1's branch is known, so the propagation boxes stay open by design (status
`proposed` — checker-exempt).

## Decision (principle)

- Capacity **gained** from an Enchantment becomes available at the **start of the
  owner's next turn**.
- Capacity **lost** from breaking / reshaping / unlearning an Enchantment applies
  **immediately** — *only* by reducing the player's remaining learning actions this
  turn. Never undo an action already taken (no retroactive bookkeeping).
- Breaking an Enchantment on your last action is legal: the loss applies immediately
  but has no remaining action to reduce this turn; it affects future turns normally.

## Why

Blocks the known exploit of learning an Enchantment and spending the newly gained
capacity in the same Learning Phase, while also stopping a player breaking an
Enchantment and still using its capacity for the rest of the turn — without requiring
action-count auditing.

## Canon delta

None yet — this is a timing principle; the mechanical wording (counter vs Capacity
Gauge) is set once F1 resolves. `meta/canon.yml` unchanged.

## Propagation (gated on F1 — do not tick until F1 branch chosen)

- [ ] Rulebook LEARN / EMPOWER / RESHAPE / UNLEARN sections
- [ ] Rulebook capacity explanation
- [ ] `rulebook/GLOSSARY.md` — Learn, Enchantment, Capacity entries
- [ ] Reference card / player mat
- [ ] `web-apps/archmage-ascension/game/state.js` (after F1 + DR-STATE)
- [x] `_review/DECISION_REGISTER_2026-07.md` F3 status updated (2026-07-06)

Candidate wording variants (token world vs Capacity Gauge world) are recorded in the
source addendum, §F3.
