# Requirements Document

## Introduction

Session 4 (2026-07-06, reconciled 2026-07-08) surfaced a coupled scoring/economy problem in Archmage Ascension. A player Reshaped a 5-card Perfect Transmutation (14 points) into a 7-card Transfiguration (19 points) on the final turn, gaining +5 — against the designer's intuition that similar-size Transfigurations and Perfect Transmutations should score alike. Transfiguration was never built during normal play at 2 players; it existed only as an end-game conversion target, made free by the rule that one counter buys a single unbounded Reshape.

This feature adds a **scoring-EV analysis** to the existing Python simulation rig (`simulation/`) that answers two questions on paper before the next live session:

- **Q1 (pricing):** Does the Recognition Points table pay each spell family in proportion to how hard that size is to reach, or are there difficulty-vs-reward inversions?
- **Q2 (economy):** How much of the observed exploit is caused by the score *table* versus the *unbounded Reshape*? Does bounding Reshape alone remove the distortion, or is re-pricing also required?

The analysis reuses the existing rig and its strategy-free hand-model; it does not change how the simulation's player agent behaves. Q2 is the decision-relevant output: if an economy fix flattens the exploit, the score table (trusted at 2–4 players) can be left untouched.

## Glossary

- **Rig**: The existing Monte Carlo simulation `simulation/archmage_deck_sim.py`.
- **Hand_Model**: The strategy-free sampler in `simulation/scoring_rebalance_stats.py` that estimates reach-probabilities for sequence spells the Rig's agent does not pursue.
- **Spell_Family**: One of Conjuration, Transfiguration, Perfect_Transmutation, Enchantment.
- **Score_Table**: The canonical Recognition Points table in `rulebook/Scoring System Reference.md` (the source of truth), mapping (Spell_Family, size) to points.
- **Reach_Probability**: `P_f(k)`, the probability that a player's seen cards can form a spell of family `f` at size `≥ k`, as estimated by the Hand_Model (`tf_run_ge`, `pt_run_ge`, `suit_ge`) or, for Enchantment, by the Rig's end-of-game tier attainment (`ench_tier_ge`).
- **Implied_Price**: A price derived from Reach_Probability under the table's established rarity convention (`price ∝ P^-β`, β ≈ 0.45–0.50, from `simulation/SCORING_REBALANCE.md`).
- **Inversion**: A pair of (family, size) entries where the Score_Table pays more for the spell that is *easier* to reach (higher Reach_Probability).
- **Realisable_Pool**: At game end, the full multiset of a player's `(energy, value)` cards plus wild count, aggregated across their spellbook spells, hand, and banked cards — the material a Reshape could restructure.
- **Best_Single_Spell**: The highest-scoring single spell (any family, size ≤ max_spell_size = 15) that can be formed from a Realisable_Pool under the Score_Table.
- **Reshape_Variant**: One of the end-game Reshape rules being compared — `unbounded`, `size_capped`, `cost_scaled`, `no_reshape` (defined in Requirement 4).
- **Marginal_Reshape_Points**: For a Reshape_Variant, the mean end-game score minus the `no_reshape` baseline score on the same games — the magnitude of the exploit.
- **Config**: A (player count, DeckConfig) pair under study; primary is 2 players on the canon 2–4p deck `4 energies × ranks 1–15 + 2 wilds`.
- **Analysis_Script**: The new `simulation/scoring_ev.py`.
- **Results_JSON**: `simulation/results/scoring_ev.json`.
- **Analysis_Doc**: `simulation/SCORING_EV.md`, the written findings.

## Requirements

### Requirement 1: Static pricing audit (Q1)

**User Story:** As the designer, I want each spell family and size priced against how hard it is to reach, so that I can see where the score table's payout inverts difficulty.

#### Acceptance Criteria

1. THE Analysis_Script SHALL compute Reach_Probability `P_f(k)` for each Spell_Family and size using the existing Hand_Model outputs (Transfiguration, Perfect_Transmutation, Conjuration) and the Rig's tier attainment (Enchantment).
2. THE Analysis_Script SHALL load the Score_Table values matching `rulebook/Scoring System Reference.md` and SHALL fail fast if its embedded copy does not match those canonical values.
3. THE Analysis_Script SHALL compute an Implied_Price per (Spell_Family, size) using the rarity convention `price ∝ P^-β`, fitting β per family against the column, anchored on a size the table is trusted at.
4. THE Analysis_Script SHALL detect and report every Inversion, where the Score_Table pays more for a higher-Reach_Probability spell than a lower-Reach_Probability one.
5. THE Analysis_Script SHALL explicitly evaluate and report the Transfiguration-size-7 versus Perfect_Transmutation-size-5 comparison as a named case.
6. THE Analysis_Script SHALL emit, per Config, a table of `family, size, table_price, reach_probability, implied_price, price_over_implied_ratio, inversion_flag`.

### Requirement 2: End-game pool instrumentation (Q2 foundation)

**User Story:** As the designer, I want the simulation to record what each player could restructure at game end, so that the Reshape exploit can be modelled without changing how players behave.

#### Acceptance Criteria

1. THE Rig SHALL, at game end, expose each player's Realisable_Pool as a multiset of `(energy, value)` natural cards plus a wild count.
2. THE Realisable_Pool SHALL aggregate the cards committed to spellbook spells, the cards in hand, and any banked cards.
3. THE instrumentation SHALL NOT change the player agent's decisions, pacing, or any existing Rig output (it is additive capture only).
4. WHEN the same seed is used, THE instrumented Rig SHALL produce the same existing outputs as before instrumentation.

### Requirement 3: Best-single-spell evaluator

**User Story:** As the designer, I want to know the highest-scoring spell a pool could become, so that I can measure what an unbounded Reshape yields.

#### Acceptance Criteria

1. THE Analysis_Script SHALL compute, for any Realisable_Pool, the Best_Single_Spell across all four Spell_Families, returning its family, size, and score.
2. THE evaluator SHALL respect the canon rules: max_spell_size = 15; Transfiguration is a consecutive-value run across any energies; Perfect_Transmutation is a consecutive-value run within one energy; Conjuration is a same-energy pile; Enchantment is distinct energies sharing one value (capped at size 5, reachable only at 5–6 players); wilds fill gaps or slots.
3. THE evaluator SHALL score 5-card Perfect_Transmutation as 14 and 7-card Transfiguration as 19, reproducing the observed +5 gap, and SHALL assert this as a self-check.
4. THE evaluator's score for a family SHALL be monotonically non-decreasing in size, and SHALL satisfy Perfect_Transmutation ≥ Transfiguration ≥ Conjuration at equal size.

### Requirement 4: Reshape-variant comparison (Q2)

**User Story:** As the designer, I want end-game scores compared across candidate Reshape rules on identical games, so that I can tell whether the exploit is the table or the unbounded Reshape.

#### Acceptance Criteria

1. THE Analysis_Script SHALL compute each player's end-game score under four Reshape_Variants on the same seeded games:
   - `unbounded`: one Reshape rebuilds the pool into the Best_Single_Spell (current rule).
   - `size_capped`: the Reshaped spell is limited to size ≤ C, swept over C ∈ {6, 8, 10}.
   - `cost_scaled`: Reshape consumes counters in proportion to the produced spell's size, bounded by the player's actual end-game counter budget.
   - `no_reshape`: the spellbook is scored as actually built during play (baseline).
2. THE Analysis_Script SHALL report, per Config and Variant, the mean end-game score and its distribution.
3. THE Analysis_Script SHALL report, per Variant, the Marginal_Reshape_Points relative to `no_reshape`.
4. THE Analysis_Script SHALL report, per Variant, the mix of winning Spell_Families and the share of games whose top score is a Reshaped Transfiguration.

### Requirement 5: Recommendation

**User Story:** As the designer, I want a plain recommendation, so that I can choose the smallest fix.

#### Acceptance Criteria

1. THE Analysis_Doc SHALL state whether `size_capped` or `cost_scaled` alone brings the family mix and Marginal_Reshape_Points back near `no_reshape` without changing the Score_Table.
2. IF the Inversion persists under a bounded Reshape, THEN THE Analysis_Doc SHALL recommend the smallest Score_Table change (informed by the Implied_Price) that removes the flagged Inversions.
3. THE Analysis_Doc SHALL carry the ratio-robustness caveat: absolute probabilities are indicative, ratios between families and Variants are the load-bearing output.

### Requirement 6: Reproducibility and outputs

**User Story:** As the designer, I want deterministic, self-checking outputs in the rig's existing format, so that results are trustworthy and re-runnable.

#### Acceptance Criteria

1. THE Analysis_Script SHALL run from the `simulation/` directory via a single documented command and SHALL write both Results_JSON and Analysis_Doc.
2. WHEN run twice with the same seed, THE Analysis_Script SHALL produce byte-identical Results_JSON.
3. THE Analysis_Script SHALL analyse the primary Config (2 players, `4×15+2W`) and the secondary Configs (3 and 4 players, same deck).
4. THE Analysis_Script SHALL NOT modify `archmage_deck_sim.py` or `scoring_rebalance_stats.py` in ways that change their existing behavior or outputs; shared code SHALL be imported, not copied.
5. THE Analysis_Doc SHALL record the model limitations inherited from `simulation/ASSUMPTIONS.md` (greedy identical non-opponent-aware agents; Hand_Model reach values are chase ceilings; greedy single-spell evaluator in v1).
