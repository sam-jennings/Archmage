---
title: Experiment opened — vnext scoring & economy bundle
type: decision
date: 2026-07-08
status: experiment
thread: capacity-economy
experiment: meta/experiments/vnext-scoring-economy/RECORD.md
---

# 2026-07-08 — Open experiment: vnext-scoring-economy

**Decision: treat the scoring/economy rebalance as a single experimental next-version bundle,
held OUT of canon until Sam decides it is ready to playtest, then applied via ONE version bump.**

This is **not** a canon change. It opens `meta/experiments/vnext-scoring-economy/` (see
RECORD.md), which bundles: (1) the rebalanced score table, (2) the RESHAPE "one spell per
action" redefinition, (3) the enchantment / Unlimited-Capacity change. Canon (rulebook v3.0)
is unchanged.

## Why an experiment, not piecemeal canon edits
The three changes interact (promoting Transfiguration re-opens the end-game concentration
exploit that the RESHAPE rule closes; removing Unlimited Capacity changes the action economy
both assume), so they must be evaluated and adopted together. Sam wants to keep iterating the
analysis and apply everything at once with a version bump if/when it is playtest-ready.

## Status
`status: experiment`. No propagation to canon until adoption. On adoption follow the
"On adoption" checklist in the RECORD (version bump + `versioned_files` lockstep + rulebook +
web + digital build), then set this decision to `canon` and archive the experiment folder.

## Note (self-correction)
An earlier attempt this session mistakenly wrote parts of this bundle into canon (the v3.0
scoring table, `canon.yml`, the rulebook RESHAPE wording, and two `status: canon` decision
files). All were reverted; canon was restored to v3.0; the work was relocated to the experiment.
No content was lost — the reverted material lives in `meta/experiments/vnext-scoring-economy/`.

## Propagation
- [x] Canon restored to v3.0 (scoring table, `canon.yml`, rulebook RESHAPE) — reverted (2026-07-08)
- [x] `meta/experiments/vnext-scoring-economy/` created (RECORD + `proposed/`) (2026-07-08)
- [x] `meta/QUEUE.md` + `meta/threads/capacity-economy.md` reframed from "adopted" to "experiment" (2026-07-08)
- [x] `meta/canon.yml` pointer comment + `.kiro/steering/active-experiments.md` pointer (2026-07-08)

(Adoption is a future action on Sam's go — tracked in the RECORD, deliberately not an open
checkbox here so it is not flagged as drift.)
