---
title: Two-track development model (fast solo loop + slow validation loop)
type: decision
date: 2026-07-06
status: canon
---

# 2026-07-06 — Two-track development model

**Change:** Replace the master plan's linear phase model (safe hygiene → stranger
validation → implementation-*after*-evidence) with **two parallel tracks running at
different clock speeds**:

- **Track A — the fast loop (solo, continuous).** Analysis, brainstorming, design
  iteration, simulation, the digital build, and *provisional* rulebook/mechanics
  changes. Runs as often as there are working sessions. This is where bold, coherent
  redesigns are made and de-risked between playtests.
- **Track B — the slow loop (opportunity-driven).** Stranger validation sessions. Rare;
  each one tests whatever Track A has converged on and returns confirm / kill / redirect.

**The gate is redrawn.** It no longer blocks the *act* of changing reversible
artifacts. It blocks only:
1. **Irreversible or paid commitments** on unvalidated rules — physical print runs
   (`export-printenbind/`), mass export regeneration, committing to a physical SKU.
   (Chain Anti-Drift Rule 2 and fork F14 stand unchanged.)
2. **Labelling anything "validated"** without a logged table result. Provisional
   changes ride as `status: experiment` with a frozen revert baseline, exactly like the
   Echo decision.

**Why:** Playtest opportunities are rare; solo work is frequent. Gating all
implementation behind a scarce event starves the fast loop and wastes the rare sessions
on trivial deltas. When feedback is scarce, each session should carry the *most*
information — which means testing a bold, coherent version, not a parameter tweak. This
inverts the review chain's linear "hold implementation until strangers play" stance,
which conflated three different things into one bucket.

**What is preserved from the review chain** (its genuine cautions, now stated
narrowly):
- No paid prints / irreversible spend on provisional rules (unchanged).
- **One coherent hypothesis per session.** Bold means *replace a whole subsystem*
  (e.g. the entire capacity model), not turn ten unrelated knobs — so a rare result
  stays interpretable.
- **No re-running the identical failed approach.** The counter-prose loop (three
  rewrites of a mechanic three analyses call structurally hostile) is still waste. Bold
  *different* changes are the opposite of that and are encouraged.
- Nothing is tagged `stranger-validated` without a logged session; provisional
  adoptions stay `experiment` until then.

**Instruments explicitly promoted to Track A** (the chain under-valued both):
- **Simulation rig** — revived as a pre-screen for bold mechanics (e.g. "does deleting
  the shared budget collapse the game into 3-turn conjuration sprints?" — the exact risk
  the design review named for the Capacity Gauge). It can't see fun/teach, but it can
  kill degenerate mechanics before they reach a scarce table.
- **Digital build** (`web-apps/archmage-ascension/`) — reframed from "gated
  implementation detail" to the primary rapid self-playtest instrument and a path to
  *remote* stranger testing (which directly attacks playtest scarcity). No longer
  last-in-line; it is Track A tooling. (Its ladder/capacity logic still follows the
  chosen design, not the reverse.)

**Canon delta (game content):** none. This is a process/method change.

**Supersedes:** the linear three-phase framing in `_review/MASTER_PLAN_2026-07.md` §4
and the "hold all implementation until stranger evidence" stance in
`_review/IMPLEMENTATION_QUEUE_2026-07.md` and `_review/KIRO_HANDOFF_2026-07.md` — those
are narrowed to the redrawn gate above. The Decision Register's closure *lanes*
(SAM-NOW / STRANGER / KIRO-LATER) still hold; STRANGER-lane items are Track B's job and
do not block Track A.

**Companion doc:** operational recruitment/logistics for Track B live in
`_review/STRANGER_RECRUITMENT_AND_LOGISTICS_2026-07.md` (the "how to get strangers" half
the evidence plan skipped).

## Propagation

- [x] `_review/MASTER_PLAN_2026-07.md` — amendment banner + §3/§4 reframed to two tracks (2026-07-06)
- [x] `_review/STRANGER_RECRUITMENT_AND_LOGISTICS_2026-07.md` — created (2026-07-06)
- [x] `_review/README.md` — index thesis + doc list updated for the two-track model (2026-07-06)
- [x] `_review/IMPLEMENTATION_QUEUE_2026-07.md` — amendment banner narrowing the gate (2026-07-06)
- [x] `_review/KIRO_HANDOFF_2026-07.md` — amendment banner narrowing the gate (2026-07-06)
- [x] `meta/QUEUE.md` — decision + logistics doc linked; two-track note added (2026-07-06)
