---
title: F5 — Keep immediate game-end for now (seat-order fairness is a playtest watch)
type: decision
date: 2026-07-06
status: proposed
---

# 2026-07-06 — F5 Game-end procedure

Source: `_review/ARCHMAGE_SAM_DECISIONS_F3_F14_2026-07.md`, §F5.

## Decision

Keep the current **immediate-end** procedure: when the Released Reserve is depleted, the
contest immediately ends and play proceeds to final evaluation. Do **not** switch to
finish-the-round solely because of theoretical seat-order unfairness.

This is **not** SAM-NOW closed — it is reframed to an open **playtest watch**. Seat-order
unfairness can be ignored unless a specific player count / deck configuration produces a
low average number of turns *and* players experience the ending as unfair.

## Playtest requirement (before any rule change)

Test the worst-case configuration: 6 players, Echo deck, Ascension Trials
active/available, current Source / Released Reserve structure. Track per player:
pre-Drought turns, Drought turns, who triggers the end, whether anyone feels denied a
meaningful final turn, and whether the result plausibly changes if the round finished.

- **Keep immediate end** if players don't notice the edge, the final-turn difference
  isn't decisive, and immediate end improves tension.
- **Reopen finish-the-round** if multiple players call the end unfair, a player loses
  through a denied obvious final learning turn, 5–6p produces very low total turns, or AT
  makes the missing turn too consequential.

Deferred alternative wording (do **not** adopt yet): *"When the Released Reserve is
depleted, finish the current round so each player has had the same number of turns, then
proceed to final evaluation."*

## Canon delta

None — current rule (immediate end) stands.

## Propagation

- [x] `_review/DECISION_REGISTER_2026-07.md` F5 reframed to playtest-watch (2026-07-06)
- [ ] `simulation/ASSUMPTIONS.md` — note the worst-case turn-count test
- [ ] Playtest observation sheet — add the seat-order / turn-count metrics above
