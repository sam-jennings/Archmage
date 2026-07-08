---
thread: capacity-economy
status: active
updated: 2026-07-08
goal: Make enchantment pursuit viable without collapsing Drought tension
next: Build the scoring-EV analysis per the spec `.kiro/specs/scoring-ev-analysis/` — price each spell family against reach-probability (Part A) and compare end-game Reshape variants (Part B) to decide whether the TF/PT + Reshape exploit is an economy fix or a re-price. Then rig-test the round-trip counter redesign (+ partial-unlearn lever).
hypothesis: If the round-trip counter redesign (placing a counter casts a spell; picking one up pays for a learning action — Recall becomes the payment, not a step) is pre-validated in the solo rig alongside partial unlearn, then a single combined fix can be chosen on paper and the next live session spent confirming experience rather than exploring options.
---

# Capacity economy

## Where this stands

The capacity/Source economy is confirmed structurally broken (Sessions 1 and 3):
enchantment pursuit is non-viable (2–3 turn overhead; only 2 of 5 players learned one
in Session 3), and 4-card Unlimited Capacity collapsed Drought tension once acquired —
one root cause, two surfaces.

**Session 4 (2026-07-06, 2p, new player) added three findings:**
- **+1/+3 Enchantment counter values felt right** — positive datum for the ladder at 2p.
- **Two overpowered end-game strategies surfaced** (now P1 in QUEUE): (A) one counter buys
  a single *unbounded* Reshape, so a counter-poor player can restructure their whole
  Spellbook cheaply on the final Drought turn; (B) a **15-card Transfiguration** was easier
  to build than a ~13-card PT, won the game, and was assembled *reactively on the last turn
  with no planning* — Transfiguration difficulty/scoring looks mispriced vs PT.
- **Counter-mechanism-necessity signal:** the new player tracked capacity fine and
  questioned whether physical counters are needed — one data point toward the F1 Capacity
  Gauge arm. (Comprehension itself was a non-issue for her via the online reference — see
  rules-and-teaching thread.)

**Session 4 addendum (2026-07-08, Sam's further notes) added two more findings:**
- **Transfiguration is an end-game Reshape target, not a live strategy.** Neither player
  built a Transfiguration during play (at 2p the array cadence makes it unnecessary); it only
  appeared on the final turn via Reshape. This **resolves** the earlier "never cast" vs
  "15-card Transfiguration dominated" apparent conflict — both are true, seen from different
  angles — and **couples the "Transfiguration vs PT balance" and "End-game Reshape economy"
  P1s into a single mechanism:** an unbounded 1-counter Reshape makes a large Transfiguration
  free at end-game, and the score table then pays it more than a hard PT. Concrete datum:
  Reshaping a 5-card PT into a 7-card Transfiguration gained +5 points, against the intuition
  that similar-size PT and Transfiguration score alike — a difficulty→reward ordering question
  for the scoring-EV analysis.
- **Interaction scales with player count.** Round 1 was parallel with no conflict; Round 2
  had heavy clashing (a blocking Conjuration stopped a PT extension). Open question: is the
  game more interesting at higher counts? Fold into the 5-player validation (watch
  contention/blocking, not only enchantment uptake). A strategy that looks dominant at 2p
  (no interaction) may already be regulated by blocking at 4–5p.

**Scoring-EV analysis spec ready (2026-07-08):** `.kiro/specs/scoring-ev-analysis/`
(requirements + design + tasks) defines the on-paper method for the coupled TF-vs-PT +
Reshape P1s. Part A audits the score table against hand-model reach-probabilities (validates
Sam's datum: 5-card PT = 14 → 7-card TF = 19 = +5, an inversion). Part B instruments the
end-of-game pool and compares Reshape variants (unbounded / size-capped / cost-scaled /
no-reshape) to answer whether the exploit is the table or the unbounded Reshape. Next step is
to build `simulation/scoring_ev.py` per the spec's task breakdown; queued as a P1.

The deck-structure half is decided: **Option 2 adopted 2026-07-02 as an experiment**
(`meta/decisions/2026-07-02-echo-option-2-deck.md`) — 2–4p deck unchanged, Echo suit
added at 5–6p, enchantment ladder 3=+1/6, 4=+3/12, 5=UC/18. On 2026-07-03 Sam locked
the open enchantment tunable (**4-card = +3 counters**) and added **2 starting counters
at 5–6p**; these plus the Convergence purge are now propagated through the rulebook,
Scoring System Reference, GLOSSARY, and web reference. Still rig-chosen, not yet
live-validated. Remaining propagation: regenerate card exports (card-visuals thread,
now unblocked). Open tunables still to watch: 5–6p wild count 4 vs 6; conjuration
viability under suit dilution.

The counter-mechanic half is still open: the round-trip redesign is proposed but not
analysed, tested, or chosen (Sam confirmed 2026-07-03 it's still undecided). Start-2
was absorbed by Option 2's setup; Drought-cap and first-ench-free levers were
superseded by the ladder.

## Next playtest goal

Confirm the rig-chosen combination live at 5 players: enchantment uptake above 2 of 5,
no counter-mechanic confusion when taught from written rules alone, and
conjuration/transfiguration stability intact.

## Biggest risk

The capacity constraint may be load-bearing for the rest of the loop — fixing it could
destabilise conjurations/transfigurations or over-loosen the Drought. A deeper
structural rethink than the tested levers may be needed.

## Context needed to resume

- Rig: `simulation/` (assumptions + results documented alongside); the 2-player
  digital build's code is reusable for self-play.
- Analysis history: `_review/FIFTH_SUIT_ANALYSIS.md`, archived
  `_archive/TWO_VERSION_PROPOSAL.md`, `_review/OPUS_TASK_enchantment_system.md`.
- Sessions are ~2–3 weeks apart: model first, spend live sessions on experience only.
