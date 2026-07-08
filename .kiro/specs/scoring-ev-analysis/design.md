# Design Document

## Overview

The scoring-EV analysis is a new Python module, `simulation/scoring_ev.py`, that answers two coupled questions raised by Session 4: is the Recognition Points table mispriced (Q1), and is the observed end-game exploit caused by the table or by the unbounded Reshape (Q2)? It is built as a thin analysis layer on top of the existing rig — it imports and reuses `archmage_deck_sim.py` and `scoring_rebalance_stats.py` without changing their behavior, and it writes results in the same style as the existing `SCORING_REBALANCE.md` analysis.

The design has three pieces:

1. **Part A — static pricing audit.** Turn the Hand_Model's reach-probabilities into a difficulty proxy and price each spell family/size against it, flagging difficulty-vs-reward inversions. This is a pure post-processing layer over data the rig already produces.
2. **Part B — end-game Reshape EV.** Add additive instrumentation to the rig to capture each player's end-game realisable pool, build a "best single spell from a pool" evaluator, and compare four Reshape rules on identical seeded games.
3. **Emit.** A machine-readable `results/scoring_ev.json` and a written `SCORING_EV.md` with the Q2 recommendation.

The load-bearing insight the design encodes: the Hand_Model's reach-probability measures *whether the cards to make a spell were seen* — which is exactly the pool a Reshape draws on. That makes it the right difficulty proxy for the end-game question, and it explains why a 7-long any-energy run (Transfiguration) is easier than a 5-long same-energy run (Perfect Transmutation) despite scoring higher.

### Goals

- Quantify, per config, where the score table's payout inverts difficulty (Part A).
- Quantify how many points the unbounded Reshape adds over "what was actually built," and which family it converts into, under four candidate rules (Part B).
- Produce a clear recommendation: economy fix alone, or economy fix plus a minimal re-price.
- Deterministic, self-checking, reproducible; reuses the existing rig verbatim.

### Non-Goals

- No change to the player agent's strategy, pacing, or existing rig outputs.
- No multi-spell partition optimisation of a pool in v1 (greedy "best single spell" only; documented as a future refinement).
- No change to canon (score table, rules) — this analysis *informs* a later decision; any adopted change is logged separately under `meta/decisions/` (process §3).
- No 5–6p analysis in v1 beyond an optional pass once 2–4p is settled.

## Reuse Analysis (what already exists)

Confirmed by reading `archmage_deck_sim.py`, `scoring_rebalance_stats.py`, and `ASSUMPTIONS.md`.

| Dependency | Source | Reuse |
|---|---|---|
| `DeckConfig`, `Rules`, `Game`, `Player`, `WILD` | `archmage_deck_sim` | Import; `Game` gets additive end-pool capture (Req 2) |
| `_max_run_with_wilds(values, wilds, ranks)` | `archmage_deck_sim` | Import; used by the evaluator for TF/PT runs |
| `sim_composition(...)` → `ench_tier_ge`, `seen_hist` | `scoring_rebalance_stats` | Import; Enchantment reach + cards-seen distribution |
| `hand_model(...)` → `tf_run_ge`, `pt_run_ge`, `suit_ge` | `scoring_rebalance_stats` | Import; TF/PT/Conjuration reach-probabilities for Part A |
| β ≈ 0.45 rarity convention | `SCORING_REBALANCE.md` | Reused method for Implied_Price |

Missing (the build): the pricing layer (Part A), end-pool instrumentation (Part B1), the pool evaluator (Part B2), the Reshape variants (Part B3–B4), and the emit.

## Canonical score table (source: `rulebook/Scoring System Reference.md`)

Embedded as a module constant with a load-time assertion so drift from canon fails fast. Enchantment caps at size 5 (5–6p only).

| Size | Conjuration | Transfiguration | Perfect Transmutation | Enchantment |
|:---:|:---:|:---:|:---:|:---:|
| 3 | 3 | 5 | 7 | 6 |
| 4 | 4 | 7 | 10 | 12 |
| 5 | 6 | 10 | 14 | 18 |
| 6 | 9 | 14 | 19 | — |
| 7 | 13 | 19 | 25 | — |
| 8 | 18 | 25 | 32 | — |
| 9 | 24 | 32 | 40 | — |
| 10 | 31 | 40 | 49 | — |
| 11 | 39 | 49 | 59 | — |
| 12 | 48 | 59 | 70 | — |
| 13 | 58 | 70 | 82 | — |
| 14 | 69 | 82 | 95 | — |
| 15 | 81 | 95 | 109 | — |

## Architecture

```
simulation/
├── archmage_deck_sim.py         (+ additive end-pool capture on Player/Game — Req 2)
├── scoring_rebalance_stats.py   (imported unchanged: hand_model, sim_composition)
├── scoring_ev.py                (NEW — the analysis)
│     SCORE            = {...}  + assert_matches_canon()
│     part_a_pricing(config)    → reach P, β fit, implied price, inversions
│     best_single_spell(pool)   → (family, size, score)          [reuses _max_run_with_wilds]
│     reshape_variants(pool, counters) → {variant: (family,size,score)}
│     part_b_reshape(config)    → per-variant mean/dist, marginal pts, family mix
│     main()                    → run configs, write JSON + MD
├── results/scoring_ev.json      (NEW output)
└── SCORING_EV.md                (NEW written analysis + recommendation)
```

Randomness flows through seeded `random.Random`, exactly like the existing rig, so the determinism invariant (Req 6.2) holds.

## Components and Interfaces

### Component 1: Score table + canon guard

Module constant `SCORE[family][size] -> points` holding the table above, plus `assert_matches_canon()` run at import that raises if any value differs. Docstring cites `rulebook/Scoring System Reference.md` as the source of truth — this is a *checked mirror*, not a parallel source (manifest `sources_of_truth` unaffected).

### Component 2: Part A — pricing audit

```text
part_a_pricing(config) -> list[row]
  row = { family, size, table_price, reach_p, implied_price, price_over_implied, inversion }
```

- Reach_Probability: from `hand_model` (`tf_run_ge`, `pt_run_ge`, `suit_ge`) for TF/PT/Conjuration; from `sim_composition`'s `ench_tier_ge` for Enchantment. Conditioned on the config's own `seen_hist` (already handled inside `hand_model`).
- β fit: per family, fit `price ∝ P^-β` on the column at sizes the table is trusted at (2–4p canon deck), anchored on a mid-size; reuse the SCORING_REBALANCE approach (β ≈ 0.45–0.50).
- `implied_price = anchor_price × (P_anchor / reach_p)^β`.
- Inversion flag: set when a lower-priced entry has a strictly lower reach-probability than a higher-priced one across the audited set (i.e., paying more for the easier spell). The named TF-7 (19) vs PT-5 (14) case is always evaluated and reported.

### Component 3: Part B1 — end-pool instrumentation

Add to `Player`: a method/derived accessor returning the Realisable_Pool. Because `Player` uses `__slots__`, add one slot (e.g. `banked` if needed) or reconstruct the pool at game end from existing structures:

- Enchantment cards: `en["value"]` × `en["energies"]` (naturals) + `en["wild_used"]` wilds.
- Conjuration cards: `cj["n"]` cards of `cj["energy"]` (values are not individually tracked by the rig; for pool purposes model them as `n` cards of that energy — sufficient for Conjuration/one-energy counting, and a documented approximation for run reconstruction).
- Hand: `hand_vals` / `hand_energy` naturals + `wilds`.

Expose `Game.end_pools() -> list[Pool]` where `Pool = { naturals: Counter[(energy,value)], energy_counts: Counter[energy], wilds: int, built_score: int }`. `built_score` is the as-played spellbook score (for the `no_reshape` baseline). Capture must not alter agent decisions (Req 2.3) — it reads final state only.

Note on the Conjuration value-tracking approximation: the rig stores conjuration size, not the specific values, so exact PT/TF run reconstruction from cards currently inside conjurations is approximate. v1 documents this; if it materially affects results, a follow-up can extend the rig to retain conjuration card values (additive, behavior-preserving).

### Component 4: Part B2 — best-single-spell evaluator

```text
best_single_spell(pool, ranks, energies_in_deck) -> { family, size, score }
```

- Transfiguration: `size = min(_max_run_with_wilds(all_values, wilds, ranks), 15)`.
- Perfect Transmutation: `size = min(max over energies of _max_run_with_wilds(values_of_energy, wilds, ranks), 15)`.
- Conjuration: `size = min(max energy_count + wilds, 15)`.
- Enchantment: `size = min(distinct energies at the best shared value + wilds, energies_in_deck, 5)`; only ≥3 counts.
- Score each via `SCORE`, ignoring sizes < 3; return the max-scoring family. Self-checks: PT-5 = 14, TF-7 = 19 (Req 3.3); per-family monotonicity and PT ≥ TF ≥ Conjuration at equal size (Req 3.4).

### Component 5: Part B3–B4 — Reshape variants

```text
reshape_variants(pool, counters) -> { variant_key: { family, size, score } }
```

- `unbounded`: `best_single_spell(pool)` (size ≤ 15).
- `size_capped[C]`: best spell computed with an extra size cap `C` (recompute runs/piles clamped at C); one entry per C ∈ {6, 8, 10}.
- `cost_scaled`: the produced spell's size costs counters at a fixed rate (e.g. 1 counter per K cards, K a parameter, default per the round-trip counter model); if the player's end-game `counters` cannot pay for the Best_Single_Spell, fall back to the largest affordable spell.
- `no_reshape`: `pool.built_score` — the as-played spellbook.

`part_b_reshape(config)` runs the instrumented Rig for `trials` games, and for each player computes all variants, aggregating: mean and distribution of end score, Marginal_Reshape_Points vs `no_reshape`, winning-family mix, and share of games whose top score is a Reshaped Transfiguration.

### Component 6: Emit

- `results/scoring_ev.json`: `{ config_key: { part_a: [...], part_b: {...}, meta: {seed, trials, hand_trials, deck} } }`.
- `SCORING_EV.md`: pricing-audit table (Part A), Reshape-variant comparison (Part B), the Q2 recommendation (Req 5), and the inherited limitations. Mirrors the `SCORING_REBALANCE.md` format.

## Data Models

```text
EnergyId       = int            # 0..energies-1, or WILD (-1)
Card           = (EnergyId, value:int)
Pool           = { naturals: Counter[Card], energy_counts: Counter[EnergyId],
                   wilds: int, built_score: int }
Family         = 'conjuration' | 'transfiguration' | 'perfect' | 'enchantment'
SpellResult    = { family: Family, size: int, score: int }
PricingRow     = { family, size, table_price, reach_p, implied_price,
                   price_over_implied, inversion: bool }
VariantResult  = { variant: str, mean: float, dist: {...},
                   marginal_pts: float, family_mix: {Family: float},
                   reshaped_tf_share: float }
```

## Error Handling

- **Score-table drift**: `assert_matches_canon()` raises at import if the embedded table diverges from the documented canonical values (Req 1.2) — fail fast, no silent mispricing.
- **Self-check failure**: the PT-5 = 14 / TF-7 = 19 anchor and monotonicity checks run at start; a mismatch aborts with a clear message (Req 3.3, 3.4).
- **Empty / sub-size pool**: `best_single_spell` returns a null result (size 0, score 0) when no family reaches size 3; downstream treats it as score 0, not an error.
- **cost_scaled underfunded**: when counters cannot pay for the best spell, degrade to the largest affordable spell rather than failing.
- **Determinism**: one seeded RNG per run; JSON keys emitted in sorted order so output is byte-stable (Req 6.2).

## Testing Strategy

The analysis is deterministic Python over a seeded simulation, so verification is by self-checking assertions, determinism, and closed-form/known-value cross-checks rather than a UI test harness. This matches the existing rig's `exact-check`/determinism approach in `ASSUMPTIONS.md`.

- **Known-value checks** (EXAMPLE): the evaluator reproduces the canonical table at named points — PT-5 = 14, TF-7 = 19 (+5 gap), Conjuration-3 = 3, Enchantment-3 = 6.
- **Determinism check** (SMOKE): two runs at the same seed produce byte-identical `results/scoring_ev.json`.
- **Behavior-preservation check** (SMOKE): the instrumented Rig reproduces a pre-instrumentation `compare` output at a fixed seed (Req 2.4).
- **Property checks**: exercise the evaluator and variant logic over generated pools; ≥100 iterations each. Where feasible, generate pools directly (not only via full games) to stress runs, piles, and wild-filling.

Generators:
- `genPool`: random multiset of `(energy, value)` over `energies × ranks` plus 0–4 wilds; targeted variants biased toward long same-energy runs, long any-energy runs, big one-energy piles, and shared-value sets.

## Correctness Properties

### Property 1: Score table matches canon

*For* the embedded `SCORE` table, every (family, size) value equals the corresponding entry in `rulebook/Scoring System Reference.md`; any divergence raises at import.

**Validates: Requirements 1.2**

### Property 2: Evaluator reproduces the observed datum and family ordering

*For any* pool, `best_single_spell` scores each family via the canonical table; in particular a pool admitting a 5-card Perfect Transmutation scores it 14 and one admitting a 7-card Transfiguration scores it 19, and for equal size the family scores satisfy Perfect_Transmutation ≥ Transfiguration ≥ Conjuration, with each family's score non-decreasing in size.

**Validates: Requirements 3.3, 3.4**

### Property 3: Instrumentation is behavior-preserving

*For any* seed, the end-pool capture leaves every pre-existing Rig output (completion rates, pace, draws) unchanged from the uninstrumented rig, and the Realisable_Pool's `built_score` equals the score of the spellbook the agent actually built.

**Validates: Requirements 2.3, 2.4**

### Property 4: Bounded Reshape never exceeds unbounded, no_reshape is the floor

*For any* pool and counter budget, the end-game score satisfies `no_reshape ≤ size_capped[C] ≤ unbounded` for every cap `C`, and `cost_scaled ≤ unbounded`; equivalently the Marginal_Reshape_Points are non-negative and largest for `unbounded`.

**Validates: Requirements 4.1, 4.3**

### Property 5: Determinism

*For any* fixed seed, two runs of the Analysis_Script produce byte-identical Results_JSON.

**Validates: Requirements 6.2**
