---
title: F8 — Do NOT park Ascension Trials; reconcile enough for 5–6p Echo testing
type: decision
date: 2026-07-06
status: proposed
---

# 2026-07-06 — F8 Ascension Trials status

Source: `_review/ARCHMAGE_SAM_DECISIONS_F3_F14_2026-07.md`, §F8.

**Reverses the Decision Register's prior F8 recommendation** (park wholesale as a Stage-5
expansion). Some playtesters specifically value the game *because* of this endgame, and
5–6p Echo testing is incomplete if the preferred advanced endgame cannot run.

## Decision

Ascension Trials stays an **active workstream**. Goal is **test-functional
reconciliation**, not polish — updated just enough to support current 5–6p Echo tests,
without becoming a full expansion-development branch.

## AT reconciliation checklist (test-functional minimum, before 5–6p Echo + AT)

**Update 2026-07-06:** Sam asked for a ground-up rebuild rather than a patch. The current
primary proposal is `_review/ASCENSION_TRIALS_02_HYBRID_REBUILD_PROPOSAL_2026-07-06.md`
(secret allocation retained, new `2n−3` power formula, Enchantments 4/8/12, seven Trials).
It is being reviewed alongside `_review/ASCENSION_TRIALS_03_HYBRID_REBUILD_CRITIQUE_2026-07-06.md`
(concrete fix proposals — Minimum Claim floor, 2p list bump, Champion's Mark, Trial of
the Archspell, TM/EM repricing). The earlier entry-cap variant at
`_review/ASCENSION_TRIALS_01_ENTRY_CAP_REBUILD_SUPERSEDED_2026-07-06.md` is superseded
(D-AT1, 2026-07-06). None overwrite the live rules; adoption is gated on a 5–6p + AT
playtest and its own decision file. Open sub-decisions: D-AT2/D-AT3 in file 01 §7 and the
critique's tiered fix package (smallest viable vs bolder) in file 03 §7.

- [ ] Add **Echo Power** as a fifth energy domain (Echo Conjuration spell lengths, standard power formula)
- [ ] Remove / hide / explicitly mark stale the **7-player** support
- [ ] Define **6p reward splits** if 6p AT is being tested
- [ ] Align energy terminology with the current game (Radiance / Void / Flux / Aether / Echo)
- [ ] Rule on whether **Complete Mastery** is 5p-only, 5–6p, or all Echo games (AT-specific decision — do not settle silently in a cleanup pass)
- [ ] Confirm wild-magic and 4-component Enchantment bonuses behave under the current ladder
- [ ] Add compatibility note: Unlimited Capacity is 5–6p-only (see F6)

## Canon delta

None yet — AT is a variant; reconciliation edits land against the checklist above.

## Propagation

- [x] `rulebook/Ascension Trials.md` — status-note banner added (annotation, not rewrite) (2026-07-06)
- [x] `_review/DECISION_REGISTER_2026-07.md` F8 reframed (active, not park) (2026-07-06)
- [x] `meta/QUEUE.md` — AT item reframed from park/reconcile-ceiling to active test-functional reconciliation (2026-07-06)
- [ ] `rulebook/Ascension Trials.md` — work the reconciliation checklist above
- [ ] `web-apps/trials-multiplayer.html` — align once AT text reconciled
- [x] `web-apps/trials-multiplayer.html` + new `web-apps/config.js` — **crash-fix only** (2026-07-07). App threw `Cannot read properties of undefined (reading 'filter')` on entering the voting phase because the HTML expected a `config.js` (`GameConfig`) that had never been committed. Restored to functional against the **live** rulebook — 6 standard trials + Complete Mastery (5+p), RP table 2–5p. **Deliberately omitted (still F8-gated):** Echo as fifth energy, 6p/7p 1st-2nd splits (rulebook flags them unresolved), and everything from the hybrid rebuild pair (`_review/ASCENSION_TRIALS_02_HYBRID_REBUILD_PROPOSAL_2026-07-06.md` + `..._03_HYBRID_REBUILD_CRITIQUE_2026-07-06.md`). Full "align" (this line above) still to do.

Open sub-question (do not silently decide): Complete Mastery availability by player count.
