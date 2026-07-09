---
title: Experiment — Echo / Option 2 deck structure
type: experiment
decision: meta/decisions/2026-07-02-echo-option-2-deck.md
started: 2026-07-02
status: running
---

# Experiment: Echo / Option 2 deck structure

**Testing:** Option 2 deck structure + enchantment ladder (see decision file).

**Confirm criteria (next live 5-player session):** enchantment uptake above 2 of 5
players; no counter-mechanic confusion when taught from written rules alone;
conjuration/transfiguration stability intact.

**Kill criteria:** conjuration becomes non-viable under suit dilution at 5–6p, or
uptake doesn't improve, or 2–4p play regresses in any way (it shouldn't — deck is
untouched there).

**Files to be touched (copy each into `baseline/` BEFORE first edit):** the
propagation list in the decision file — rulebook (3 files), web reference,
card-design core (6 files), digital build (8 files), planning docs (2 files).

**Revert:** copy `baseline/` contents back over the touched files, set the decision
to `reverted`, remove Echo from canon.yml (restore Convergence to nothing — the term
stays retired either way), note why here.

**On confirm:** set decision to `canon`, mark canon.yml ladder/deck lines as canon
(drop "under test"), delete this folder.

## Progress log

- 2026-07-03 — Baselines captured in `baseline/` before first edit: `rulebook/Archmage
  Ascension - Complete Rulebook.md`, `rulebook/Scoring System Reference.md`,
  `rulebook/GLOSSARY.md`, `web-apps/archmage-reference.html`. (The Convergence purge
  files were NOT baselined — the term stays retired regardless of Option-2's outcome,
  so that change is permanent.) Also baselined + updated `web-apps/player-reference/
  player-reference.html` (Quick Reference Card — beyond the original checklist, but it
  carried the full old ladder).
- 2026-07-03 — Sam settled the enchantment tunable: **4-card = +3 counters** (not +2),
  and added **2 starting counters at 5–6 players**. Written through the four doc files
  above. Scores unchanged (6/12/18). Deck structure (Echo, 79 cards) still awaits live
  5-player validation — only the counter values + starting-counter rule are locked.
- 2026-07-06 — **Revert-path integrity flag (A8).** `baseline/rulebook/GLOSSARY.md`
  (9642 bytes) is **truncated** — it ends mid-entry at "Unlimited Capacity Ma", the same
  cutoff found in the live file and in the very first git commit (`abe6aed`). The tail
  was lost before the project entered version control, so this baseline is NOT a clean
  recovery source and a straight revert would restore a broken GLOSSARY. The live file's
  tail was reconstructed 2026-07-06 (the "Unlimited Capacity Marker" entry, from adjacent
  canon). **If Echo is ever reverted:** after copying the baseline back, re-apply that
  reconstructed tail (adjusted to the pre-Echo 4-component UC ladder) — or re-baseline
  GLOSSARY now as a deliberate follow-up. Other baseline files verified present and
  non-truncated. The other confirmed-truncated file this session was live GLOSSARY only.
