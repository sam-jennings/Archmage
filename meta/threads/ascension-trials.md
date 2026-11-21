---
thread: ascension-trials
status: parked
updated: 2026-11-16
goal: Reconcile and implement the Ascension Trials configuration model (advanced endgame variant) through the approved Kiro spec, without losing test-functional playability of the current rules.
next: **PARKED 2026-11-13 (Sam, brief 6C, confirmed explicitly): hold all Ascension Trials playtests until v3.1 is confirmed or rolled back.** On resume: Sam picks candidate(s) from `ascension-trials/design-history/ASCENSION_TRIALS_07_CANDIDATE_SHORTLIST_2026-07-11.md` and schedules the playtests (C1 "Coherent Claim" recommended: flat Minimum Claim 3 all counts, +1 baseline Wild, TM/EM 7, Focused at 2p, local tiebreaks; C4 "Archspell Bold" is the one-variable follow-up). Selection-plan Stages 0–5 were executed 2026-07-11 in scratch harnesses on the committed package (no source touched): 2p exact screening, realistic sampler, seeded 3–6p S1 simulation — findings F1–F8 in the shortlist file. Standing model status unchanged: VS1+VS2+VS2-C approved (milestone commit per `docs/VS2C_MILESTONE_VERIFICATION.md`); VS3 complete awaiting review; VS4 stop-for-review; VS5/VS6 out of scope (and per the selection plan, VS5 stays a spreadsheet, VS6 a single seeded script). Sampler assumptions should be spot-checked against 3–5 real final books from session logs before trusting Stage-4/5 frequencies.
hypothesis: The hybrid rebuild (secret allocation retained, 2n-3 power formula, Enchantments 4/8/12, 7 trials) resolves D-AT1; D-AT2 (PT double-count) and D-AT3 (RP tuning) remain open, gated on a live 5-6p + AT playtest.
---

# Ascension Trials

## Rulings made while parked - 2026-11-16 (still PARKED)

Sam answered the rules-gaps brief items 5–8, all A
(`meta/decisions/2026-11-16-rules-gaps-rulings-1-8.md`). **These rulings were made while the
thread is parked; they do not unpark it, and no Trials playtest is scheduled.**

- **5A** — any 5–6 player Trials game uses candidate **C1 "Coherent Claim"**; the draft
  stays a 2–5 player historical text (`rulebook/Ascension Trials.md`, now 2.9).
- **6A** — Echo is a fifth power domain (same formula).
- **7A** — Complete Mastery is in play at 5–6 players, with the Echo deck.
- **8A** — each Enchantment of 4 or more components grants +1 wild power.

Applied: Trials text (banner, Echo row, 7th Trial heading, 7-player column dropped, 4+
Enchantment bonus), companion `rulesets/current-draft.js` (Echo + 4+ Enchantment options on
by default, model config untouched), `rulesets/index.js` (`RULESET_FOR_5_6` = C1, no global
default), tests; F8 checklist boxes 1, 2, 3, 5, 6 ticked. Still open on F8: energy
terminology, the Unlimited Capacity compatibility note, and the brief's Trials items 11–16
(Group 3). The "wild magic" → "Wild power" rename is item 13 and was **not** applied.

## Where this stands

Per F8 (`meta/decisions/2026-07-06-f8-ascension-trials-reconcile.md`), Ascension
Trials is an **active workstream**, not a parked expansion — it's the advanced
endgame variant, far enough into development that it warrants its own thread
rather than living under the parked `expansions` thread.

Three locations, three distinct jobs:
- **Rules (canon):** `rulebook/Ascension Trials.md` (v2.9, working-draft, under
  reconciliation; 2–5p historical text per ruling 5A).
- **Design history / proposals:** `ascension-trials/design-history/` — the numbered
  ASCENSION_TRIALS_01–08 docs: entry-cap rebuild (superseded), hybrid rebuild
  proposal, critique, the adversarial math review of the config model, the VS2
  lab audit, the configuration selection plan, and the candidate shortlist +
  appendix. D-AT1 resolved 2026-07-06 (secret allocation retained, entry-cap
  rejected — `meta/decisions/2026-07-06-at-entry-model-secret-allocation.md`).
  D-AT2/D-AT3 still open, gated on a live playtest.
- **Implementation:** `ascension-trials/ascension_trials_model/` (Python analysis
  package) + two Kiro specs at `.kiro/specs/ascension-trials-configuration-model/`
  (VS1+VS2, all 25 tasks checked) and
  `.kiro/specs/ascension-trials-scalable-two-player-analysis/` (VS3+VS4, all 11
  tasks checked). **Both specs are finished — no active Kiro work in progress.**

**Housekeeping (2026-07-10):** a root `Ascension Trials/` folder had accumulated
duplicates and stale forks; cleaned up, following the disposition table in the
package's `docs/README.md`. Full detail:
`meta/decisions/2026-07-10-ascension-trials-housekeeping.md`.

**Consolidation (2026-07-13):** with both Kiro specs finished, AT material was
pulled out of `simulation/` and `_review/` (where it read as clutter mixed among
unrelated docs) into this single top-level `ascension-trials/` folder — the
Python package moved from `simulation/ascension_trials_model/` to
`ascension-trials/ascension_trials_model/` (verified: pytest still passes
identically from the new location), and the 8 numbered `_review/` docs moved to
`ascension-trials/design-history/`. Two generated milestone-bundle folders that
had appeared in `simulation/` (`AT_model_VS1_VS6_complete/`,
`AT_model_VS3_VS4_complete/`) were archived to `_archive/` — both were
point-in-time snapshots superseded by the live package. Full detail:
`meta/decisions/2026-07-13-ascension-trials-consolidation.md`.

## Context needed to resume

- **Parked 2026-11-13 (brief 6C, Sam confirmed explicitly). Resume trigger: the v3.1
  confirm/kill is decided** (decision `meta/decisions/2026-07-09-v3-1-scoring-economy-bump.md`
  flips to `canon` or `reverted`) — v3.1 changes the scores Trials reads from, so no Trials
  playtest before then.
- **Recommended first pick: C1 "Coherent Claim"** — flat Minimum Claim 3 at all counts,
  +1 baseline Wild at the Trials, TM/EM 7, Focused at 2p, local tiebreaks. Known caveat:
  worst-case tie rate 10.3% vs the ≤5% target.
- **Follow-up: C4 "Archspell Bold"** — changes one variable from C1; run after C1, not
  alongside it.
- **Shortlist file:** `ascension-trials/design-history/ASCENSION_TRIALS_07_CANDIDATE_SHORTLIST_2026-07-11.md`
  (appendix `ASCENSION_TRIALS_08_SHORTLIST_APPENDIX_2026-07-11.md`; candidate JSONs in
  `ascension-trials/ascension_trials_model/configs/candidates/`). The QUEUE item sits in
  Deferred with this reason.
- If v3.1 is rolled back to v3.0, re-check the shortlist's sampler assumptions against the
  restored score table before scheduling.

- The Kiro specs are the source of truth for implementation status — read
  `task-1-reconciliation.md` in each spec folder for the honest per-module
  verdict. Both specs are fully checked off, but "complete" per the spec's own
  status rule still means "acceptance tests pass," not "polished."
- Two loose ends noted but not fixed across the 2026-07-10 and 2026-07-13
  cleanups (see the decision files' "Note for next session" sections): a stale
  QUEUE.md reference to a nonexistent
  `expansion/Ascension Trials Configuration Model.docx`, and QUEUE.md's
  Deferred section still miscategorizing AT as a parked Stage-4+ expansion
  concept (contradicts F8).
- Immediate next step is the playtest selection from
  `ascension-trials/design-history/ASCENSION_TRIALS_07_CANDIDATE_SHORTLIST_2026-07-11.md`
  (see `next:` in this file's front-matter) — not further Kiro/implementation work.

## VS2-C correction pass (2026-07-10)

VS1 and VS2 were built and approved (the spec's Tasks 1–25; completion reports in
`ascension-trials/ascension_trials_model/docs/`). A narrow adversarial audit of the VS2
laboratory (`ascension-trials/design-history/ASCENSION_TRIALS_05_VS2_LAB_AUDIT_2026-07-10.md`) accepted the
exact engine but found blocking defects **D1–D7 in the derived-metrics/reporting
layer**. The bounded **VS2-C** pass fixed all seven:

- **D1** margin VOI now implements VOI_M with the canonical column mixture
  (**A4: 8.0 → 4.5167**); **D2** real G4/G5 counterability gates over R and E^0.01
  (win-through-RP condition); **D3** the hard-gate table drops the unconditional
  set-size PASS rows and gains real G4/G5/G7 gates; **D4** equilibrium-weighted tie /
  chain-decided metrics; **D5** genuine-merge fixture A19 (9 legal → 6 classes);
  **D6** `strict_dominators_of` rename + corrected C1 prose ("(4,0) never loses; an
  uncounterable pure strategy exists"); **D7** per-Trial shared rate from resolver
  traces (fixture A20).

Full suite **456 passed**; VS2 modules **78 passed** under `-W error`; A3/A5 now fail
the appropriate gates; A3–A6 reports regenerated. **Status: VS2-C gate APPROVED
2026-07-10** (VS2 completion report §13.6); the VS1+VS2+VS2-C work is committed as a
deliberate milestone. VS3 (as