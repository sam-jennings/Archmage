---
title: Rulebook v3.1 — scoring & economy bump (vnext bundle)
type: decision
status: experiment
date: 2026-07-09
spec: .kiro/specs/v3-1-scoring-economy/
supersedes-consider: 2026-07-06-f3-enchantment-timing.md, F4 (enchantment scoring), F6 (UC-5-6p clause)
---

# Decision — apply the vnext scoring/economy bundle as rulebook v3.1

## Change
Replace rulebook v3.0 with **v3.1**, applying the `vnext-scoring-economy` bundle as one atomic bump,
held **under-test** pending a live playtest, with a guaranteed §3a rollback to v3.0.

Locked content (Sam, 2026-07-09):
- **Score table** — full v3.1 values (design §1); Conj-15 = PT-15 = 100; Conj-3 = 0; TF flattened
  (TF-15 = 48); Enchantment **4 / 10 / 16**.
- **Enchantment ladder** — counters **+1 / +3 / +5**; **Unlimited Capacity removed**; casting becomes
  "cast up to [capacity] spells"; Recall applies to all.
- **RESHAPE** — one counter per spell broken.
- **UNLEARN** — may be partial (return 1+ components from one spell; remainder valid or dissolve);
  enchantment capacity loss proportional (5→4 −2, 4→3 −2, 3→dissolve −1).
- **F3 timing** — enchantment gains next turn, losses immediate, **"cannot afford action + loss →
  blocked"** gate.
- **EMPOWER** — may not convert into or out of an Enchantment.

Full detail, propagation map, and execution steps: **`.kiro/specs/v3-1-scoring-economy/`**
(requirements → design → tasks). Numbers mirror `meta/experiments/vnext-scoring-economy/proposed/`.

## Why
Fixes the Transfiguration over-pricing / end-game concentration exploit (the "T15" problem) at the
table-level, removes the unbounded Unlimited-Capacity state, and makes RESHAPE/UNLEARN cost track
what they tear down. Analysis: `simulation/SCORING_EV_vnext.md`.

## Status
`experiment` (under-test) — execution has begun; the bundle is being applied as v3.1 and held
under-test pending a live playtest. Flip to `canon` on playtest PASS; to `reverted` on FAIL.

## Canon delta (APPLIED 2026-07-09)
- `meta/canon.yml`: `rulebook_version: v3.0 → v3.1`; rewrite `enchantment_ladder` (+1/+3/+5, scores
  4/10/16, UC removed, 5-card 5–6p only); `retired_terms` += `Unlimited Capacity` (added **last**,
  after all scanned occurrences are purged); both `versioned_files` bumped to `version: v3.1`.
- **Applied (Phase 4 / spec task 13):** `canon.yml` now reads `rulebook_version: v3.1`, the
  `enchantment_ladder` fact is rewritten to the +1/+3/+5 · 4/10/16 form (UC removed), and
  `retired_terms` includes `Unlimited Capacity`; both `versioned_files` (`Archmage Ascension -
  Complete Rulebook.md`, `Scoring System Reference.md`) now carry `version: v3.1`.

## Propagation (high-level — detailed checklist is the spec's tasks.md)
- [x] Phase 0 — archive v3.0 byte-exact to `_archive/…-v3.0-2026-07-09/` + README index (all changed files)
- [x] Phase 1 — markdown: Scoring Reference, Complete Rulebook, GLOSSARY, RULES_SUMMARY
- [x] Phase 2 — html: `archmage-reference.html`, `player-reference.html`
- [x] Phase 3 — code: `web-apps/archmage-ascension/game/state.js` + `*.jsx` (+ tests)
- [x] Phase 4 — canon machinery: `scoring_ev.py` mirror, then `canon.yml` (version, ladder, retired term)
- [x] Phase 5 — decisions: update F3 / supersede F4 / mark F6 UC-clause superseded (done — spec task 15)
- [x] Phase 6 — verify: `check.mjs` clean, `scoring_ev.py selfcheck` passes, identity spot-check (verified — spec task 16: `check.mjs` versioning + vocab clean, `scoring_ev.py selfcheck` passes exit 0)

## Rollback procedure (reversibility — Requirement 7)
Git is not relied on (OneDrive). The **authoritative list of archived v3.0 files is
`_archive/README.md`** (the "pre-v3.1 baseline" block) — the archived set grew during execution
beyond the original plan: it now covers `game/engine.js` and `game/ai.js` (archived in Task 9) and
`web-apps/tests/hand-checker/golden-master.snapshot.json` (archived in Task 11), in addition to the
two rulebook files, `GLOSSARY.md`, `RULES_SUMMARY.md`, both html references, `game/state.js`, the four
`.jsx` (`app`, `play`, `spell-tableau`, `title`), and `simulation/scoring_ev.py`. To revert v3.1 → v3.0:

a. Copy every `_archive/<basename>-v3.0-2026-07-09/` copy back over its live file (full, current list
   in `_archive/README.md` — treat that index as authoritative, not this summary).
b. Reset `canon.yml`: `rulebook_version: v3.0`, restore the v3.0 `enchantment_ladder` fact, and drop
   `Unlimited Capacity` from `retired_terms` (canon.yml is not archived — this is a targeted edit,
   per design §7.3).
c. Remove the `status: under-test` markers from the changed rule files.
d. Set this decision `status: reverted`.
e. Run `node meta/checks/check.mjs` to confirm the versioned files read v3.0.

## Related decisions
- **F3** (`2026-07-06-f3-enchantment-timing.md`): the "cannot afford → blocked" gate is chosen here,
  superseding that file's "reduce remaining actions / last-action legal" principle; folded into v3.1.
- **F4** (enchantment scoring 6/12/18): superseded — its "UC is the reward, keep points low" basis is
  void once UC is removed; v3.1 sets 4/10/16.
- **F6**: the "Unlimited Capacity is 5–6p-only" clause is superseded (no UC at all); its max-size-15
  and wild rulings stand.
