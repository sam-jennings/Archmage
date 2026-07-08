# Implementation Plan: Scoring-EV Analysis

## Overview

Build `simulation/scoring_ev.py` as an analysis layer over the existing rig to answer Q1 (is the score table mispriced?) and Q2 (is the end-game exploit the table or the unbounded Reshape?). Part A prices each spell family/size against Hand_Model reach-probabilities and flags inversions. Part B adds behavior-preserving end-pool capture to the rig, a best-single-spell evaluator, and a four-variant Reshape comparison. Outputs are `results/scoring_ev.json` and `SCORING_EV.md`. Reuse `archmage_deck_sim` and `scoring_rebalance_stats` by import; do not copy their code or change their behavior.

## Tasks

- [ ] 1. Scaffold `scoring_ev.py` with the canon-checked score table and CLI
  - Create `simulation/scoring_ev.py`; import `DeckConfig, Rules, Game, WILD, _max_run_with_wilds` from `archmage_deck_sim` and `hand_model, sim_composition` from `scoring_rebalance_stats`
  - Add the `SCORE[family][size]` constant matching `rulebook/Scoring System Reference.md`, plus `assert_matches_canon()` run at import (fail fast on drift)
  - Add CLI (`--trials`, `--hand-trials`, `--seed`, `--json`) and JSON/Markdown emit skeletons, mirroring the existing rig's argparse/`_emit` style
  - _Requirements: 1.2, 6.1, 6.4_

- [ ] 2. Part A — static pricing audit
  - [ ] 2.1 Compute reach-probabilities per family/size from existing outputs
    - Pull `tf_run_ge`, `pt_run_ge`, `suit_ge` from `hand_model`; `ench_tier_ge` from `sim_composition`; condition on the config's `seen_hist`
    - _Requirements: 1.1_
  - [ ] 2.2 Fit β and compute implied prices + inversion detection
    - Fit `price ∝ P^-β` per family (β ≈ 0.45–0.50, anchored at a trusted mid-size); compute `implied_price` and `price_over_implied`
    - Flag every Inversion; always evaluate and report the TF-7 (19) vs PT-5 (14) named case
    - Emit the per-config `family, size, table_price, reach_p, implied_price, ratio, inversion` table
    - _Requirements: 1.3, 1.4, 1.5, 1.6_

- [ ] 3. Part B1 — behavior-preserving end-pool instrumentation
  - Add `Game.end_pools()` returning each player's Realisable_Pool (naturals Counter, energy_counts, wilds, `built_score`) reconstructed from spellbook + hand at game end
  - Keep it additive: no change to agent decisions, pacing, or existing outputs; document the conjuration value-tracking approximation
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 4. Part B2 — best-single-spell evaluator
  - Implement `best_single_spell(pool, ranks, energies_in_deck)` across all four families using `_max_run_with_wilds`, respecting max size 15 and Enchantment cap 5
  - Add self-checks: PT-5 = 14, TF-7 = 19; per-family monotonicity; PT ≥ TF ≥ Conjuration at equal size
  - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 5. Property test — evaluator correctness (Properties 1 & 2)
  - **Property 1: Score table matches canon** — assert embedded `SCORE` equals the documented canonical values
  - **Property 2: Evaluator reproduces the datum and family ordering** — over generated pools, assert canonical scoring, the PT-5/TF-7 values, monotonicity, and PT ≥ TF ≥ Conjuration at equal size; ≥100 iterations
  - **Validates: Requirements 1.2, 3.3, 3.4**

- [ ] 6. Part B3–B4 — Reshape variants and aggregation
  - Implement `reshape_variants(pool, counters)` for `unbounded`, `size_capped[C∈{6,8,10}]`, `cost_scaled` (counter-budget bounded, degrade to largest affordable), `no_reshape`
  - Aggregate per config/variant: mean + distribution of end score, Marginal_Reshape_Points vs `no_reshape`, winning-family mix, Reshaped-Transfiguration share
  - _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] 7. Property test — Reshape ordering and behavior preservation (Properties 3 & 4)
  - **Property 3: Instrumentation is behavior-preserving** — at a fixed seed, existing rig outputs match the uninstrumented rig; `built_score` equals the as-played spellbook score
  - **Property 4: Bounded ≤ unbounded, no_reshape is the floor** — over generated pools/budgets, assert `no_reshape ≤ size_capped[C] ≤ unbounded` and `cost_scaled ≤ unbounded`; ≥100 iterations
  - **Validates: Requirements 2.3, 2.4, 4.1, 4.3**

- [ ] 8. Checkpoint — evaluator + instrumentation verified
  - Ensure all self-checks and property tests pass; confirm determinism (same seed → byte-identical JSON). Ask the user if questions arise.
  - _Requirements: 6.2_

- [ ] 9. Run configs and write `SCORING_EV.md`
  - Run primary (2p, `4×15+2W`) and secondary (3p, 4p) configs; write `results/scoring_ev.json`
  - Write `SCORING_EV.md`: pricing-audit table, Reshape-variant comparison, and the Q2 recommendation (economy fix alone vs economy + minimal re-price), with inherited ASSUMPTIONS limitations and the ratio-robustness caveat
  - _Requirements: 5.1, 5.2, 5.3, 6.3, 6.5_

- [ ] 10. Final checkpoint and tracking
  - Confirm outputs, determinism, and self-checks; campsite the `capacity-economy` thread with the finding; if a scoring/Reshape change is chosen, log it under `meta/decisions/` (process §3) and update the coupled P1s in `meta/QUEUE.md`
  - _Requirements: 5.1, 5.2_

## Notes

- Reuse-by-import only; `archmage_deck_sim.py` and `scoring_rebalance_stats.py` behavior must not change (Req 6.4). The only edit to the rig is additive end-pool capture (Task 3).
- Ratios between families and variants are the load-bearing output; absolute probabilities are indicative (inherited from `ASSUMPTIONS.md`).
- v1 uses a greedy "best single spell" evaluator; multi-spell pool partitioning is a documented future refinement.
- This spec informs a decision but is not itself canon — any adopted score/Reshape change is captured under `meta/decisions/` and propagated to `meta/QUEUE.md` + `meta/canon.yml` per process §3.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1", "3", "4"] },
    { "id": 2, "tasks": ["2.2", "5", "6", "7"] },
    { "id": 3, "tasks": ["8"] },
    { "id": 4, "tasks": ["9"] },
    { "id": 5, "tasks": ["10"] }
  ]
}
```
