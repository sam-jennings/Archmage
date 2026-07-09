---
title: Proposed enchantment / Unlimited Capacity change (vnext) — DECIDED, folded into v3.1 spec
type: proposal
experiment: vnext-scoring-economy
updated: 2026-07-09
status: decided (2026-07-09) — see .kiro/specs/v3-1-scoring-economy/
---

# Proposed enchantment / capacity change (candidate — DECIDED 2026-07-09)

**Not canon yet** — decided and folded into the v3.1 spec (`.kiro/specs/v3-1-scoring-economy/`);
applied to canon via the version bump. This was decision (1) of the scoring/Reshape cluster.

## Decided (Sam, 2026-07-09)
- **Remove Unlimited Capacity.** Cleaner; no infinite free learning actions; makes the RESHAPE
  rule and the score table bite as intended.
- **Ladder → +1 / +3 / +5 counters** for 3/4/5-card Enchantment (5-card grants +5 counters
  instead of Unlimited Capacity — **+5 confirmed over +4**). 5-card stays 5–6p/Echo-only (F6).
- **Enchantment score column → 4 / 10 / 16** (down from 6/12/18). Enchantment's real payment is the
  capacity ladder; the earlier "E3 may be 0/1" floor was weighed and set at 4/10/16.

## Why it's in the bundle
Removing UC changes the action economy the RESHAPE rule and the score-table validation assume,
and the Enchantment reprice only makes sense against the rebalanced columns. So it ships in the
same version bump, not separately.

## Resolved (2026-07-09)
- Enchantment score values: **4 / 10 / 16** (final).
- 5-card counter grant: **+5** (confirmed over +4).
- F1 interaction: **F1 is fixed as the current counter mechanic** for this version bump (no
  gauge/round-trip change), so it is not a blocker. A future counter redesign would be its own version.
