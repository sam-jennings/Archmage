---
thread: ascension-trials
status: active
updated: 2026-07-10
goal: Reconcile and implement the Ascension Trials configuration model (advanced endgame variant) through the approved Kiro spec, without losing test-functional playability of the current rules.
next: VS1, VS2 and the **VS2-C correction pass are complete and APPROVED** (VS2 completion report §12 + §13.6, approved 2026-07-10). The VS1+VS2+VS2-C work is captured as a deliberate milestone commit (hash + from-committed-state reproduction in `simulation/ascension_trials_model/docs/VS2C_MILESTONE_VERIFICATION.md`). VS3 and VS4 are now scoped in a **new** Kiro spec `.kiro/specs/ascension-trials-scalable-two-player-analysis/` (asymmetric states + exact best-response oracles = VS3; double oracle = VS4). That spec is **stop-for-review**: do NOT implement VS3/VS4 until its requirements/design/tasks are approved. VS5 (cross-count ranking) and VS6 (multiplayer) remain out of scope entirely.
hypothesis: The hybrid rebuild (secret allocation retained, 2n-3 power formula, Enchantments 4/8/12, 7 trials) resolves D-AT1; D-AT2 (PT double-count) and D-AT3 (RP tuning) remain open, gated on a live 5-6p + AT playtest.
---

# Ascension Trials

## Where this stands

Per F8 (`meta/decisions/2026-07-06-f8-ascension-trials-reconcile.md`), Ascension
Trials is an **active workstream**, not a parked expansion — it's the advanced
endgame variant, far enough into development that it warrants its own thread
rather than living under the parked `expansions` thread.

Four locations, four distinct jobs:
- **Rules (canon):** `rulebook/Ascension Trials.md` (v2.8, working-draft, under
  reconciliation).
- **Design history / proposals:** `_review/ASCENSION_TRIALS_01..04*.md` — entry-cap
  rebuild (superseded), hybrid rebuild proposal, critique, and the adversarial
  math review of the config model. D-AT1 resolved 2026-07-06 (secret allocation
  retained, entry-cap rejected — `meta/decisions/2026-07-06-at-entry-model-secret-allocation.md`).
  D-AT2/D-AT3 still open, gated on a live playtest.
- **Implementation:** `simulation/ascension_trials_model/` (Python analysis
  package) + `.kiro/specs/ascension-trials-configuration-model/` (the approved
  Kiro spec — requirements, design, tasks, task-1 reconciliation note). Tasks 1
  ("Reconcile existing implementation") and 2 ("Finalize package and repository
  integration") are checked off; Task 3 onward is schema/code work.

**Housekeeping (2026-07-10):** a root `Ascension Trials/` folder had
accumulated duplicates and stale forks (see
`meta/decisions/2026-07-10-ascension-trials-housekeeping.md` for full detail).
Cleaned up manually, ahead of the spec's own Task 14, following the disposition
table already written in `simulation/ascension_trials_model/docs/README.md`.
The `.kiro/specs/...` folder itself was left completely untouched throughout —
no risk to the in-progress spec work.

## Context needed to resume

- The Kiro spec is the source of truth for implementation status — read
  `task-1-reconciliation.md` for the honest per-module verdict (several modules
  are "implemented but unverified"; nothing is "complete" until acceptance
  tests pass, per the spec's own status rule).
- Task 14 ("Complete VS1 repository housekeeping") is unchecked in `tasks.md`
  even though the physical moves it described are now done — it still needs a
  verification pass (run repository checks, confirm clean) before being ticked.
- Two loose ends noted but not fixed during the 2026-07-10 cleanup (see the
  decision file's "Note for next session"): a stale QUEUE.md reference to a
  nonexistent `expansion/Ascension Trials Configuration Model.docx`, and
  QUEUE.md's Deferred section still miscategorizing AT as a parked Stage-4+
  expansion concept (contradicts F8).

## VS2-C correction pass (2026-07-10)

VS1 and VS2 were built and approved (the spec's Tasks 1–25; completion reports in
`simulation/ascension_trials_model/docs/`). A narrow adversarial audit of the VS2
laboratory (`_review/ASCENSION_TRIALS_05_VS2_LAB_AUDIT_2026-07-10.md`) accepted the
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
deliberate milestone. VS3 (asymmetric states + exact best-response oracles) and VS4
(double oracle) are scoped in the new spec
`.kiro/specs/ascension-trials-scalable-two-player-analysis/` and are **stop-for-review**
before any implementation. VS5–VS6 remain out of scope.
