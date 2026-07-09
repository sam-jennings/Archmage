---
title: Rulebook v3.1 — Scoring & Economy Bump — Tasks
type: spec-tasks
spec: v3-1-scoring-economy
experiment: vnext-scoring-economy
updated: 2026-07-09
status: proposed
---

# Tasks — Rulebook v3.1 (Scoring & Economy)

Execute in order. Phase 0 (archive) must complete before any file in Phases 1–4 is edited. Do not
start until Sam gives the go — this file is the plan produced under the spec workflow.

## Phase 0 — Archive & guardrails (reversibility first)

- [x] 1. Confirm working tree is clean/committed as the v3.0 baseline, then archive v3.0 byte-exact.
  - Copy each canon-bearing file to `_archive/<basename>-v3.0-2026-07-09/` before editing: the two
    rulebook files, `rulebook/GLOSSARY.md`, both html references, and the digital-build files to be
    touched.
  - Add an index block to `_archive/README.md` naming the set, date, and "pre-v3.1 baseline".
  - _Requirements: 7.1, 7.2_
- [x] 2. Set the governing decision to `experiment` (under-test) and add `status: under-test`
  front-matter to each rule file about to change.
  - _Requirements: 7.4_

## Phase 1 — Markdown (source of truth)

- [x] 3. `rulebook/Scoring System Reference.md`: replace the table with the v3.1 values (design §1),
  enchantment 4/10/16; bump `version:` front-matter to v3.1.
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 8.2, 8.4_
- [x] 4. `rulebook/Archmage Ascension - Complete Rulebook.md`: apply all rule edits and bump
  `version:` to v3.1.
  - LEARN: enchantment grants +1/+3/+5, scores 4/10/16; remove the 5-card→UC marker line.
  - EMPOWER: restrict conversion to Conj/TF/PT only — no conversion into/out of Enchantment.
  - RESHAPE: one counter per spell broken; proportional enchantment capacity loss.
  - UNLEARN: allow partial (return 1+ components from one spell; remainder valid or dissolve);
    proportional enchantment loss (5→4 −2, 4→3 −2, 3→dissolve −1); end-only for runs.
  - Casting: "cast up to [capacity] spells"; Recall applies to all; fix the Drought/action clause.
  - F3 timing: gains next turn, losses immediate, "cannot afford action + loss → blocked" + worked
    [8,8,8,8] example (design §5).
  - Remove every Unlimited Capacity reference and the capacity examples that assume it.
  - _Requirements: 1.1, 2.1, 2.2, 2.4, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 8.2, 8.4_
- [x] 5. `rulebook/GLOSSARY.md`: remove/replace "Unlimited Capacity"; update Magical Capacity,
  Enchantment, RESHAPE, UNLEARN, EMPOWER entries to v3.1.
  - _Requirements: 2.1, 2.5, 8.2_
- [x] 6. `web-apps/archmage-ascension/RULES_SUMMARY.md`: mirror the rule changes.
  - _Requirements: 8.1, 8.2_

## Phase 2 — HTML references

- [x] 7. `web-apps/archmage-reference.html`: score table, enchantment ladder, reshape/unlearn/empower
  wording, UC removal.
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 6.2, 8.1, 8.2_
- [x] 8. `web-apps/player-reference/player-reference.html`: same updates.
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 6.2, 8.1, 8.2_

## Phase 3 — Code / digital build

- [x] 9. `web-apps/archmage-ascension/game/state.js`: score values; enchantment ladder +1/+3/+5;
  remove UC state; reshape (per-spell), partial unlearn + proportional loss, empower restriction; F3
  timing (gain next turn, immediate loss, affordability gate).
  - _Requirements: 1.1, 2.1, 3.1, 4.1, 4.3, 5.1, 5.2, 5.3, 6.2, 8.1, 8.2_
- [x] 10. `web-apps/archmage-ascension/game/*.jsx` (`app`, `play`, `spell-tableau`, `title`): scoring
  display, UC UI removal, action wiring.
  - _Requirements: 2.1, 8.1, 8.2_
- [x] 11. Update/rerun any affected tests (e.g. `web-apps/tests/hand-checker` golden master) if they
  encode scores.
  - _Requirements: 8.5_

## Phase 4 — Canon machinery & sim mirror

- [x] 12. `simulation/scoring_ev.py`: set the `SCORE` dict and `assert_matches_canon()` anchors to
  v3.1; confirm `python scoring_ev.py selfcheck` passes.
  - _Requirements: 1.6, 8.5_
- [x] 13. `meta/canon.yml`: `rulebook_version: v3.1`; rewrite `enchantment_ladder`; then (last, after
  Phases 1–3 purge UC) add `Unlimited Capacity` to `retired_terms`.
  - _Requirements: 2.5, 8.3, 8.4_

## Phase 5 — Decisions

- [x] 14. Finalise `meta/decisions/2026-07-09-v3-1-scoring-economy-bump.md`: tick propagation boxes as
  edits land; record the rollback procedure; status stays `experiment` (under-test) pending playtest.
  - _Requirements: 9.1, 7.3_
- [x] 15. Update F3 (`2026-07-06-f3-enchantment-timing.md`) to the "cannot afford → blocked" gate;
  supersede F4 (enchantment scores); mark F6's UC-only clause superseded.
  - _Requirements: 9.2, 9.3, 9.4_

## Phase 6 — Verify

- [x] 16. Run `node meta/checks/check.mjs`: versioned files == v3.1, "Unlimited Capacity" absent from
  scanned content, no open propagation boxes on the governing decision; resolve any flags.
  - _Requirements: 8.5_
- [x] 17. Spot-check: table identity (Conj-15 = PT-15 = 100) and strictly-increasing columns; read the
  rulebook UNLEARN / F3 / EMPOWER sections against design §4–§6.
  - _Requirements: 1.3, 1.4, 4.1, 5.3, 6.2_
- [x] 18. Update the `capacity-economy` thread (campsite) and note in the experiment RECORD that v3.1
  is applied and under-test, with the playtest confirm/kill criteria and the rollback pointer.
  - _Requirements: 7.3, 7.4_

## Post-playtest (not part of the bump execution)

- [~] 19. On playtest PASS: set the governing decision `canon`, remove `under-test` markers, retire
  the `vnext-scoring-economy` experiment folder (§4). On FAIL: run the §7 rollback and set the
  decision `reverted`.
  - _Requirements: 7.3_
