---
thread: capacity-economy
status: active
updated: 2026-07-09
goal: Make enchantment pursuit viable without collapsing Drought tension
next: **v3.1 is APPLIED and under-test — the next step is the live confirm/kill playtest.** The vnext-scoring-economy bundle was applied to canon as rulebook **v3.1** via the Kiro spec `.kiro/specs/v3-1-scoring-economy/` (governing decision `meta/decisions/2026-07-09-v3-1-scoring-economy-bump.md`, status `experiment`) and is held **under-test** pending one live session. Run the **v3.1 confirm/kill playtest** (see "## Next playtest goal"): CONFIRM if Transfiguration is still worth playing, the end-game concentration ("T15") play is controlled, low-end scores read sensibly as integers, and enchantment pursuit / UC-removal feels good → Task 19 flips the governing decision to `canon`. KILL if play is worse than v3.0 (a new dominant exploit, TF dead, enchantments still non-viable) or Sam prefers a different shape → run the §7 rollback (restore the `_archive/*-v3.0-2026-07-09/` copies, reset `canon.yml` to v3.0, set the decision `reverted`). A byte-exact v3.0 rollback is READY in `_archive` (authoritative file list in `_archive/README.md`; procedure in the governing decision). Counter round-trip / F1 is **fixed as current counters** for this bump (no gauge/round-trip change; not a blocker).
hypothesis: If the round-trip counter redesign (placing a counter casts a spell; picking one up pays for a learning action — Recall becomes the payment, not a step) is pre-validated in the solo rig alongside partial unlearn, then a single combined fix can be chosen on paper and the next live session spent confirming experience rather than exploring options.
---

# Capacity economy

## v3.1 applied (under-test) — 2026-07-09

The vnext-scoring-economy bundle **shipped as rulebook v3.1** and is held **under-test**.
It was executed end-to-end via the Kiro spec `.kiro/specs/v3-1-scoring-economy/`; governing
decision `meta/decisions/2026-07-09-v3-1-scoring-economy-bump.md` (status `experiment`).
**Canon is now v3.1 (under-test), no longer v3.0.** What landed: the rebalanced score table
(Conj15 = PT15 = 100, TF15 = 48, C3 = 0 floor, Enchantment 4/10/16), Unlimited Capacity
removed with a finite +1/+3/+5 ladder, RESHAPE = one counter per spell broken, partial
UNLEARN with proportional capacity loss, the F3 "cannot afford action + loss → blocked" gate,
and the EMPOWER conversion restriction.

The next step is the **live confirm/kill playtest** (criteria in "## Next playtest goal").
**CONFIRM** → Task 19 flips the governing decision to `canon`, drops the `under-test` markers,
and retires the experiment folder. **KILL** → run the §7 rollback: restore the byte-exact v3.0
copies from `_archive/*-v3.0-2026-07-09/` (authoritative list in `_archive/README.md`), reset
`meta/canon.yml` to v3.0, and set the governing decision `reverted`. Rollback does not rely on
git (OneDrive workspace).

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

**2p strategic-depth line opened (2026-07-09, conversation).** The array-cadence
observations above are one phenomenon: at 2p the Array decongests, base-collection is
free/safe, and the Transfiguration/Array subsystem goes dormant. Sam's direction is to
**combine a base-scaling rule (Array size = f(players) / staleness flush) with a 2p
variant (neutral drafter / denial action)** and explore it later with analysis +
playtesting; the expansion route is set aside for this specific problem. Full brief:
`_review/2P_STRATEGIC_DEPTH_ARRAY_CONTENTION_2026-07.md`; tracked as a P2 in QUEUE.
Does not change this thread's `next` (still the vnext-scoring-economy experiment);
sequence the 2p-depth work after that lands.

**Scope widened + deep dive (2026-07-09, later same day).** Sam lifted the Trials
exclusion and put expansions in scope. Full-scope exploration:
`_review/2P_STRATEGIC_DEPTH_DEEP_DIVE_2026-07.md` — audits the four interaction
channels at 2p (Array dead; perfect info wasted; Source clock alive but invisible;
both endgames predictable) and proposes the **Rival's Gambit** 2p package:
Array=3 + Living-Array take-rule, Trials as 2p default endgame (5 trials, Minimum
Claim), **Veiled Power** (secret hand cards add domain power at the Trials — turns
the already-hidden hand into the uncertainty that fixes 2p Trials predictability),
optional take-and-bury denial + Source-tranche clock legibility. Rig plan includes a
trials-predictability metric. Still exploration only; sequence after vnext, and model
the Veiled-Power × candidate-score-table coupling before any live session.
**Decided 2026-07-09:** Trials developed for 2p but NOT the default endgame (some
players don't enjoy it); Veiled Power is an optional Trials rule. Base 2p mode
stands on the contention layer alone
(`meta/decisions/2026-07-09-2p-trials-not-default.md`).

**Scoring-EV analysis complete (2026-07-08):** built `simulation/scoring_ev.py` per
`.kiro/specs/scoring-ev-analysis/`; outputs `simulation/SCORING_EV.md` +
`results/scoring_ev.json` (deterministic, seed 42, 10k/50k trials). Findings:
- **The exploit is the unbounded Reshape, not primarily the table.** At 2p an
  unbounded end-game Reshape adds **+40 pts** over the as-played book and lands on a
  Transfiguration in **85%** of games. A single-Reshape **size cap ~6 removes ≥80% of
  the spike without any table change** (cap6 +0.1, cap8 +0.8, cap10 +5.7). Cost-scaling
  by counters is ineffective — players hold ~5.5 counters at game end, enough to pay
  for a big Reshape anyway.
- **A standalone TF-vs-PT pricing inversion also exists** at every player count: a
  7-card Transfiguration is easier to reach than a 5-card PT yet scores +5, and TF's
  price/implied-rarity ratio climbs with size while PT's stays ~1.
- **Recommendation:** bound the end-game Reshape (size cap = clean, table-free lever)
  + optionally a small Transfiguration re-price for the residual inversion. Now a
  `[decide]` in QUEUE; nothing shipped to canon. Two as-built rig refinements (exact
  conjuration-value tracking; import fix) are synced into the spec.

**Scoring + economy rebalance — EXPLORED 2026-07-08, held in experiment `vnext-scoring-economy` (NOT canon).**
Per-deck analysis (`simulation/PER_DECK_ANALYSIS_2026-07.md`, priced WITH wilds, both decks) found
Transfiguration over-paid 1.8–3× vs difficulty in BOTH decks, PT fair-to-under at the top, and
Conjuration's high end only matters at 2–4p. A candidate single table (ceiling Conj15=PT15=100,
TF promoted to ~½ / TF15=55, ≥1 floor) + a Reshape-cost rule were built
and rig-checked (Part B: promoted TF halves the 2p exploit +40→+20; a size-8 cap PROXY → ~+5 — not
the actual per-spell-counter rule, which 2026-07-09 testing shows is a weak bound; see below). **These are
candidates only — bundled with the enchantment/UC capacity change in
`meta/experiments/vnext-scoring-economy/` for a single version bump IF Sam decides to playtest.
Canon is untouched.** Supersedes the earlier "size-cap, table-free" recommendation above (Sam
rejected all Reshape-bounding options; the fix moved to the score table).

**vnext bundle rig-tested (2026-07-09).** Ran the current candidate table + ladder +1/+3/+5
(UC removed) + a **"reshape costs one counter per spell broken"** rule through `scoring_ev.py`
(`simulation/SCORING_EV_vnext.md`, all 5 player counts; RECORD log has the detail). Two findings
for the open questions: (1) **the table fixes the "T15" problem** — with only the table swapped
(canon→candidate, same economy/seed), the 2p end-game reshape drops +47→+27 and its
Transfiguration-share falls 89%→44%; no family replaces TF as a single over-rewarded target, and
Part A shows no TF-vs-PT inversion. (2) **This reshape-cost rule is a weak bound**: it barely
undercuts a free reshape because the +1/+3/+5 ladder leaves players with more counters than spells
(2p 7.0 vs 6.0; can break the whole book in 63–81% of games), so "one counter per spell" rarely
stops full consolidation. (The "~+5" figure in earlier notes was a size-8 absolute-cap proxy, not
this rule.) Absolute +pts are inflated ceilings (greedy agent banks ~0-value small
conjurations under the new low end); the robust signals are the TF-share collapse and the Part A
fix. `next` unchanged (keep iterating the bundle).

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

**v3.1 confirm/kill playtest.** Play a live session on the applied v3.1 rules and judge against
the confirm criteria:
- **Transfiguration is still worth playing** live (not merely an end-game Reshape target).
- **The end-game concentration ("T15") play is controlled** — no new dominant exploit replaces it.
- **Low-end scores read sensibly as integers** (C3 = 0 floor, every other spell ≥ 1).
- **Enchantment pursuit / UC-removal feels good** — under the new finite +1/+3/+5 ladder,
  enchantment uptake rises **above 2 of 5** (the Session 3 low-water mark) and the Drought stays
  tense without Unlimited Capacity.

Run at **5 players** where possible (this folds in the prior 5-player goal): watch enchantment
uptake, that there is no counter-mechanic confusion when taught from written rules alone,
conjuration/transfiguration stability, and contention/blocking at higher counts.

**CONFIRM** → flip the governing decision to `canon` (Task 19). **KILL** (play worse than v3.0,
TF dead, enchantments still non-viable, or Sam prefers a different shape) → run the §7 rollback
(restore the `_archive` v3.0 set, reset `canon.yml`, set the decision `reverted`).

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
