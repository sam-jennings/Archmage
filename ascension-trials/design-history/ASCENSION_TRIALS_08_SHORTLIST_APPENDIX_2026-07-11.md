---
title: Ascension Trials — Shortlist Appendix (decisions, candidate space, outputs, finalist configs)
type: design-review
date: 2026-07-11
status: reference appendix to the candidate shortlist
relates_to:
  - "ascension-trials/design-history/ASCENSION_TRIALS_07_CANDIDATE_SHORTLIST_2026-07-11.md"
  - "ascension-trials/ascension_trials_model/configs/candidates/ (the three loadable finalist JSONs)"
purpose: Full transparency on the executed pipeline — every decision by stage, the starting candidate space, exactly what was and wasn't changed in V2_1, the raw outputs of each model layer, how the realistic samples were used, and the complete finalist configurations.
---

# Shortlist Appendix

## A. Decisions made at each stage

All decisions below were made **by delegation** ("complete these stages for me") and
are **proposed, not canon** — each is yours to overturn. None has a decision file yet;
adopting a candidate after playtest is the moment for §3 capture.

**Stage 0 (yardsticks).**
- D0.1 Adopt V2_1's provisional targets verbatim as the screening yardsticks (list in §C).
- D0.2 Dominance-reachability target expressed as a percentile of the *sampled* gap
  distribution rather than a fixed number (gap data in §E).

**Stage 1 (skeleton — frozen, removed from the search space).**
- D1.1 Power formula 2n−3; Enchantment scale 4/8/12; PT = energy + transformation
  + 1 Wild with the file-03 nerf held behind its trigger. (Basis: file-03 §1 analysis;
  not re-screened.)
- D1.2 **Tiebreak family = local tokens** (total power → normal power → breadth on
  multi-source trials → shared full). Ratio tokens (efficiency/commitment) rejected
  without further testing on prior *proof*: they violate optimal monotonicity
  (review 04 §6.5; fixture A7 in the committed test suite).
- D1.3 Coherency by construction: F and domains identical at all counts; trial lists
  are subsets of one master list; every domain ≥2 sinks at every count; **no
  count-varying resolution semantics** (this rule later forced the floor decision, §A
  Stage 3).
- D1.4 Trial lists: hybrid rebuild §6 **plus Focused Power at 2p** (file-03's 2p bump,
  satisfying the ≥2-sinks rule at 2p).
- D1.5 Trial of the Archspell not skeleton: per-spell constraints are outside the
  model's state space → carried as unscreened candidate C4 only.

**Stage 2 (candidate space).** D2.1 Screen axes in factored bundles, not full
cross-product runs (§B).

**Stage 3 (2p exact screening decisions, from the outputs in §D).**
- D3.1 **Reject printed-RP floors at every count** — fails counterability at 2p
  (turtle), locks ~62% of books out of EM (finding F1).
- D3.2 **Reject count-varying floors** (best-per-count would be 0 at 2p, 5 at 3p+)
  because of D1.3; **adopt flat Minimum Claim 3** for the recommended candidate as the
  coherent compromise (F2+F3).
- D3.3 **Add "+1 baseline Wild" as a candidate rule** — invented during screening when
  Wild proved to be the counterability mechanism at locked mirrors (F4). New rule, not
  in any prior document.
- D3.4 Champion's Mark = optional 2p module (deepens VOI, repairs nothing — F5);
  attached to C2/C3, not C1.
- D3.5 TM/EM 8→7 adopted in C1/C3 on file-03's pricing argument; screening was
  gate-neutral on it (F6) so it stays a playtest question.

**Stage 4/5.** D4.1 Sampler assumptions declared provisional pending session-log
spot-check. D5.1 6p second place kept, flagged borderline (F7). D5.2 Focused/CM dead
rates partly attributed to agent limits, not condemned (F8).

**Stage 6 (yours).** Which candidate(s) to table, in which order; every D above is
open to reversal on feel.

## B. Starting candidate space

After Stage 1 froze the skeleton, the open axes were:

| Axis | Options | How screened |
|---|---|---|
| Minimum Claim floor | none / 3 / 5 / printed-RP | Z1 exact parity screen, one axis run per value |
| Baseline Wild | +0 / +1 | Z2 exact screen (wild 0 vs 1 at locked mirrors) |
| Champion's Mark (2p) | off / +4 | exact extended-matrix overlay on Z1+Z2 |
| TM/EM first-place RP | 8 (hybrid) / 7 (file-03) | Z2 exact (gate-level), deferred to playtest |
| 6p second place | on / off | Stage-5 sim (destination analysis) |

Notional full cross-product: 4 × 2 × 2 × 2 × 2 = **64 configurations**. Because the
axes proved independent at gate level, they were screened as ~14 factored runs (§D)
instead of 64 full runs, then recombined into the four shortlist candidates. Fixed by
prior evidence, not searched: tiebreak family, trial lists, all Stage-1 items.

## C. What was (and wasn't) changed in V2_1

**Nothing in the V2_1 document was edited.** Its provisional numbers were adopted
verbatim as Stage-0 yardsticks: tie budget ≤5% shared / ≤5% chain-decided / ≤10%
per-trial shared; counter margin ≥1 RP always and ≥ r_min for 90%; depth floor ≥3
distinct equilibrium-mass plans, normalized entropy ≥0.60, median counter distance ≥2;
VOI within [r_min, 40% of pool]; multiplayer health table §17.3.

**Numbers added by this pass (new, candidate-level, not V2_1 amendments):**
Minimum Claim value **3**; baseline Wild **+1**; Champion's Mark **+4** (inherited
from file-03, now with exact screening evidence); Focused-at-2p first place **7**.

**Measured deviations from V2_1 targets, carried openly rather than hidden:**
1. C1's parity tie rate on the worst-case fungible screen is **10.3% vs the ≤5%
   target**. The screen (one fungible domain, mirror books) is the maximum-collision
   case; shaped real books should tie less. If playtests confirm >5% felt-tie rate,
   either C1's floor drops to 0 (=C3) or the V2_1 target moves — that's a §19-class
   decision for you.
2. Floor-0 VOI = 8.4 on a 21-RP pool = exactly the 40% band ceiling (C3 flagged
   borderline-high scouting value).
3. Normalized entropy at floor 3 = 0.54 vs the ≥0.60 target on the same worst-case
   screen (same caveat as 1).

## D. Outputs by model layer

**VS1 (resolver).** Used as the outcome oracle in every run below; no new outputs.

**VS2/VS2-C (exact laboratory) — Stage 3 outputs.** All exact exhaustive + numerical
LP; parity states; seeds fixed.

| Run (state, config) | legal | collapsed | R | c1 | g5 | eq-tie | support | norm.entropy | margin-VOI |
|---|---|---|---|---|---|---|---|---|---|
| Z1 floor 0 (fungible 10; 8/7/6) | 286 | 286 | 286 | ✓ | ✓ | 3.2% | 34 | 0.62* | 8.38 |
| Z1 floor 3 | 74 | 74 | 74 | ✓ | ✓ | 10.3% | 11 | 0.54 | 8.04 |
| Z1 floor 5 | 22 | 22 | 22 | ✓ | ✓ | 33.3% | 3 | 0.36 | 2.67 |
| Z1 floor RP(8/7/6) | 13 | 13 | **1** | **✗ turtle (10,0,0)** | ✗ | ~100% | 1 | 0.0 | 0.0 |
| Z1 floor RP @ budget 12 | 19 | 19 | **1** | **✗ turtle (12,0,0)** | ✗ | ~100% | 1 | 0.0 | — |
| Z1 floor 5 @ budget 12 | 43 | 43 | 43 | ✓ | ✓ | 17.3% | 7 | 0.49 | — |
| Z2a locked mirror, 3 trials (E4/T4, wild 0) | 125 | 89 | 80 | **✗ home-dump unbeatable** | ✗ | ~100% | 1 | 0.0 | — |
| Z2b locked mirror, 4 trials (E3/T3, wild 0) | 148 | 104 | 96 | **✗ home-dump unbeatable** | ✗ | ~100% | 4 | 0.30 | — |
| Z2b + **1 Wild** | 484 | 196 | 196 | **✓** | ✓ | 41%† | 6 | 0.33 | 9.49 |
| Z2b, Mastery RP 8 (vs 7), wild 1 | 484 | 196 | 196 | ✓ | ✓ | — | — | — | — |
| Z2b + Mark(+4), wild 0 [overlay] | — | 416 ext. | — | **✗ 4 unbeaten remain** | — | ~100% | 2 | 0.11 | 3.0 |
| Z1 floor 0 + Mark(+4) [overlay] | — | 858 ext. | — | ✓ (0 unbeaten) | — | 3.2% | 34 | 0.52* | **12.31** |

\* LP-vertex mixture (canonical entropy solve too slow at that dimension — labelled).
† tiny-budget tie inflation; scale limitation declared.

**VS3 (asymmetric states + BR oracles).** **Not invoked.** Every screened state was
small enough for exhaustive matrices, and all screening was at parity. The honest gap
this leaves: **no strength-path (Δ>0) screening was run** — contestable-range and
dominance-threshold curves per candidate are the natural next model task (VS3's
asymmetric support exists for exactly this).

**VS4 (double oracle).** Not built and **not needed** for these runs — no state
exceeded exact enumeration. Remains gated behind its stop-for-review spec.

**VS5 (cross-count ranking).** Per the plan, executed as judgement + this appendix's
tables, not software: per-count vetoes (D3.1) and worst-count-first reasoning
(the 2p worst case drove the floor decision). No cross-count averaging anywhere.

**VS6 (multiplayer).** Executed as the plan's demoted form — one seeded script
(S1 populations, 4–5 heuristic kinds, exact-given-profile resolution):

| count, floor | tables | uncontested awards | squat wins (≤2 power) | EM dead | CM dead | Harmony dead | 6p 2nd→leaders |
|---|---|---|---|---|---|---|---|
| 3p, 0 | 250 | 30.3% | 9.6% | 4.4% | — | — | — |
| 3p, 5 | 250 | 32.1% | **0%** | 23.2% | — | — | — |
| 5p, 0 | 200 | 27.7% | 8.3% | 6.0% | 63% | 79% | — |
| 5p, 5 | 200 | 23.7% | **0%** | 16.0% | 65% | 83% | — |
| 6p, 0 | 150 | 25.2% | 8.3% | 2.7% | 58% | 79% | **52%** |
| 6p, 5 | 150 | 22.2% | **0%** | 14.0% | 51% | 79% | **41%** |

Contender-coverage lower bound ≈ 1.0–1.1 everywhere (weak candidate set — reported as
unmeasured, not as bad). CM/Harmony dead rates are partly agent artifacts (F8);
Focused at floor 5 was 100% dead purely by agent construction — ignore that cell.

## E. How realistic spellbook samples were used

Generator: 4,000 books per count from declared assumptions (3–6 spells; type mix
45/25/20/10 conjuration/transfiguration/enchantment/PT; length-spell sizes 3–8
weighted small; enchantments 3–4, plus 5 at 5–6p; energies uniform; Echo at 5–6p).
Seed 20260711. **Assumptions are mine, not measured — spot-check against 3–5 real
final books before trusting any frequency below.**

Used for four things:
1. **Scale calibration of the exact screens** — median m ≈ 30, per-domain medians
   (max energy 9, transformation 9, enchantment 4) set the Z1 budgets (10–12) so floor
   effects were tested at realistic magnitudes, not toy ones.
2. **Floor lockout rates** — share of books that can legally enter each trial under
   each floor (EM: 38% at floor 7–8, ~38% at 5 vs 100% at 0–3, because enchantment
   power arrives in 4/8 chunks; Purity: 65% at 8, 89% at 5; TM: 56–63%). This is what
   killed printed-RP floors beyond the 2p turtle.
3. **Wild-zero rate (42%)** — the load-bearing number behind the +1 baseline Wild rule.
4. **Gap distribution** (|Δm| median 9, p90 23) — the yardstick that contestable
   ranges and dominance thresholds must sit inside; also feeds D0.2.
Plus: the same generator produced every table in the VS6 sim (§D).

**Not used for:** strategic adaptation (books don't build toward the Trials),
standard-score q pairing, or any structural (theorem-level) claim.

## F. Full finalist configurations

Loadable JSONs (validated: load + 2p/5p smoke resolves):
`ascension-trials/ascension_trials_model/configs/candidates/candidate_c1_coherent_claim.json`,
`candidate_c2_guarded_table.json`, `candidate_c3_open_skies.json`. Two rules ride in
`notes` because the schema cannot express them (baseline Wild, Champion's Mark).

Shared by all candidates: 2n−3 length-spell power; Enchantment 4/8/12; PT → full power
to its energy + Transformation, +1 Wild; Wild +1 per 4/5-card Enchantment; Wild only
on trials with ≥1 normal power, never satisfies requirements/floors, tiebreak-invisible;
trial lists — 2p: Purity, TM, EM, Focused, Universal; 3p: +nothing (same as 2p);
4p: +Harmony; 5–6p: +Complete Mastery; shared-full ties; trial tiebreaks: total power
→ normal power → breadth (Harmony/Universal/CM only) → shared full; final chain: most
trial firsts → total normal power → spell count → largest spell → shared; 6p second
place: 3/2/3/3/3/2/4 per hybrid §9 (suppressed when first is shared).

| Knob | **C1 Coherent Claim** | **C2 Guarded Table** | **C3 Open Skies** | **C4 Archspell Bold** |
|---|---|---|---|---|
| Minimum Claim (all counts) | **3** | **5** | **none** | 3 |
| Baseline Wild | **+1 every player** | none | +1 every player | +1 |
| Champion's Mark (2p) | off | **+4** | **+4** | off |
| Purity / Harmony / Universal 1st | 8 / 6 / 6 | 8 / 6 / 6 | 8 / 6 / 6 | 8 / 6 / 6 |
| TM / EM 1st | **7 / 7** | 8 / 8 | 7 / 7 | 7 / 7 |
| Focused 1st (2p–6p) | 7 | 7 | 7 | **replaced** |
| Complete Mastery 1st (5–6p) | 9 | 9 | 9 | 9 |
| Trial swap | — | — | — | **Focused → Archspell (one spell's power only), RP 7** |
| Screening status | full (F1–F8) | full | full | **unscreened** (per-spell constraint outside model state) |
| Known measured risks | 10.3% worst-case parity ties | 33% parity ties, EM lockout at 5–6p, Mark carries 2p | 8–10% of 3p+ awards are ≤2-power squats | all of C1's plus unmeasured Archspell |

C4 is C1 with exactly one change, so a single playtest isolates the Archspell variable.
