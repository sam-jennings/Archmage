---
title: Source-emptying mid-turn timing (rulebook v3.2)
type: decision
date: 2026-07-06
status: canon
---

# 2026-07-06 — Source-emptying timing

> **CANON 2026-11-13** — approved by Sam (item B8) and written into rulebook v3.2 via
> `2026-11-13-v3-2-designer-approval.md`: master rule in The Drought, per-effect rulings in the
> Casting Phase spell effects. PT uses the "cleanest rule" below (castable only if the Source can
> complete both effects); the not-recommended edge case was not adopted.

Source: `_review/ARCHMAGE_SAM_DECISIONS_F3_F14_2026-07.md`, "Source-emptying timing mid-turn".

New ruling not previously tracked as a fork. Originally recorded as a **proposed rulebook
patch**.

## Recommended master timing rule

> If a draw from the Source or a replacement from the Source empties it, complete the
> current Collection choice or spell effect. Then immediately begin the Drought. The
> active player skips any remaining Casting and continues with Learning under Drought
> rules.

Principle: complete the current **atomic action**, then trigger the Drought immediately.
No additional spell casts after the Source is empty.

## Per-effect rulings

- **Collection from Source:** take the final card, Source empty, Drought begins, skip Casting.
- **Take from Array:** take the chosen card, replace the slot with the final Source card,
  Source empty, Drought begins, skip Casting.
- **Conjuration:** castable only if the Source holds enough cards for the full draw. If the
  draw empties the Source, finish drawing, then Drought immediately; no further spells.
- **Transfiguration:** castable while the Array exists. If its Array replacement empties the
  Source, complete the exchange + replacement, then Drought immediately; no further spells.
- **Perfect Transmutation:** castable only if **both** mandatory effects can fully resolve
  (Conjuration draw **and** Transfiguration exchange incl. any required Array replacement).
  Recommended cleanest rule: PT is illegal unless the Source can complete both; if resolving
  it empties the Source, complete the full spell, then Drought immediately.

**Direct answer:** once the Source is empty the Drought begins and the Array collapses into
the Released Reserve — there is no window where the Source is empty but the Array still
accepts new Transfiguration / PT casts. A Transfiguration *may be the action that empties
the Source* via replacement; PT must not partially resolve.

**Edge case (not recommended):** allowing a PT to leave an Array slot unreplaced when the
Source empties mid-resolution — more exceptions, avoid unless playtest drama outweighs
cleanliness.

## Canon delta

Applied 2026-11-13: `meta/canon.yml` gains `source_emptying` (master rule + Conj/PT castability).

## Propagation

- [x] `meta/QUEUE.md` — tracked as an open [decide] rules item (2026-07-06); closed 2026-11-13
- [x] Rulebook — Casting Phase / End-of-the-Drought: add the master timing rule + per-effect rulings (v3.2, 2026-11-13; also in both classic web references, the v2 rules data and the Drought explainer)
- [x] `simulation/ASSUMPTIONS.md` — align Source-depletion handling if the sim models it (2026-11-13: the sim already stops casting when the Source empties; one noted gap, a 6+ Conjuration may still draw the last single card)
