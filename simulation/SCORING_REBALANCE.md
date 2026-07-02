---
title: Scoring Rebalance — Deck Configuration Options 1 & 2
type: analysis
created: 2026-07-02
relates_to:
  - "[[RESULTS]]"
  - "[[ASSUMPTIONS]]"
  - "[[Scoring System Reference]]"
---

# Scoring Rebalance for the Option 1 / Option 2 Decks

**Question.** The Recognition Points table is assumed perfectly balanced for 3–4
players on the live 4E×1–15+2W deck. How should scores change when spell-completion
probabilities shift under the Option 1 / Option 2 deck configurations?

**Method.** `scoring_rebalance_stats.py` (wraps the unmodified sim rig) — 10,000
games per configuration, seed 42, logging end-of-game spellbook composition
(enchantment tiers, conjuration sizes). Transfiguration and Perfect Transmutation
are not pursued by the sim agent, so they are covered by a strategy-free hand-model
Monte Carlo (50,000 hands per config, hand size drawn from each config's empirical
cards-seen distribution, wilds fully flexible). Hand-model values are chase
ceilings — only *ratios between configurations* are meaningful. Raw data:
`results/scoring_stats.json`. Anchor = mean of live-deck 3p and 4p.

**Chosen framing** (per Sam, 2026-07-02): one shared printed table across all
configs; Enchantment-5 priced on full rarity; Option 2 analysed fully, Option 1
sketched.

---

## Verdict

**Keep the current table unchanged and add one entry: Enchantment 5 = 26 points.**

| Size | Conjuration | Transfiguration | Perfect Transmutation | Enchantment |
|:---:|:---:|:---:|:---:|:---:|
| 3 | 3 | 5 | 7 | 6 |
| 4 | 4 | 7 | 10 | 15 |
| 5 | 6 | 10 | 14 | **26 (new)** |
| 6+ | *(unchanged)* | *(unchanged)* | *(unchanged)* | — |

That the rest of the table survives is not laziness — it is what the numbers say.
The Option 2 five-energy deck changes *which* spells get easier or harder in two
opposing ways (deck structure vs. fewer cards seen per player), and for three of
the four spell families these nearly cancel.

---

## Why the table survives (Option 2, 5–6p vs 3–4p anchor)

Per player, Opt2 5–6p average vs anchor average:

| Metric | Anchor (3–4p) | Opt2 5–6p | Ratio |
|---|---:|---:|---:|
| Enchantment T3+ | 83.6% | 82.7% | ×0.99 |
| Enchantment T4+ | 41.1% | 43.2% | ×1.05 |
| Enchantment T5 (UC) | — | 12.5% | new |
| Cards seen / player | 19.1 | 15.5 | ×0.81 |

**Enchantments — no change needed.** The 5th energy makes each tier easier per
card seen (5 copies per value instead of 4), but 5–6 players see fewer cards each.
These cancel almost exactly: tier-3 and tier-4 attainment land within 1–5% of the
anchor, well inside table-granularity. **Ench-3 = 6 and Ench-4 = 15 remain
correctly priced.**

**Transfiguration — no change needed.** Sequences need *values*, and per-value
density barely moves (4/62 = 6.5% → 5/79 = 6.3%); higher wild density (3.2%→5.1%)
actually makes long runs slightly easier at matched cards seen (deck effect ×1.04
at k=5 up to ×1.3 at k=9). Player count pulls the other way at 6p; net effect is a
mild rarity increase for long runs — the premium column stays premium.

**Perfect Transmutation — no change needed.** Suit dilution hurts (each exact card
is 1/79 not 1/62) but doubled wild density compensates: deck effect at matched
cards seen is ×1.2–1.6 *easier*, and the 6p cards-seen penalty pulls it back to
roughly anchor rarity. A wash within table granularity.

**Conjuration — no change, but on the watch-list.** This is the one real
casualty of the 5th energy. Same-suit piles thin out and enchantment work
competes harder for cards:

| Player has conj ≥ n | 3 | 4 | 5 | 6 |
|---|---:|---:|---:|---:|
| Opt2 5–6p / anchor | ×0.78 | ×0.48 | ×0.29 | ×0.25 |

Sounds dramatic, but in points it isn't: expected score from a player's biggest
conjuration falls from 3.2 to 2.2 — a ~1-point gap against typical totals an
order of magnitude larger, because practical conjurations score in the 3–9 range
anyway. Conjuration's real payout is the draw engine, which is untouched. Bumping
the column to compensate would misprice 2–4p (where the table is perfect) to fix
a ~3% distortion at 5–6p. **Playtest flag:** if 5–6p conjuration *feels* pointless
as a scoring path, the correct micro-lever is shifting conjuration increments from
(n−3) to (n−2) per size step — do not touch the 2–4p-sensitive sizes 3–4.

---

## Enchantment 5 = 26 (full rarity pricing)

T5 attainment: 16.7% (5p), 8.3% (6p), avg 12.5% → **3.45× rarer than Ench-4**
(which stays at its anchor-correct 15).

Naive proportional pricing (15 × 3.45 ≈ 52) would be wrong *by the table's own
convention*: every cast column already prices rarity sub-proportionally. Fitting
price ∝ P^−β to the anchor data gives β ≈ 0.45 for both the Conjuration and PT
columns independently — the table consistently pays about the square root of
rarity. Four table-consistent methods:

| Method | Price |
|---|---:|
| Ench column, β = 0.45 | 26.2 |
| Ench column, β = 0.50 | 27.9 |
| Placement of P = 12.5% on the PT rarity curve | 21.5 |
| Placement of P = 12.5% on the Conjuration rarity curve | 25.9 |

Median → **26**. Tuning band 24–28 (26 is slightly rich at 5p, slightly cheap at
6p; 25 is fine if a rounder number reads better). Note this deliberately ignores
UC's engine value per the chosen framing — if playtests show the Ench-5 player
winning through UC *and* banking 26, the first lever is down toward 21 (the
PT-curve estimate), not the ladder itself.

---

## Option 1 sketch (directional only)

**No static score table can rebalance Option 1 at 2–4p.** The failure is spread,
not level: T4+ runs 98% (2p) / 81% (3p) / 55% (4p) against the 41% anchor, and T5
runs 75% / 36% / 15%. A price correct at 4p is broken at 2p in the same deck. If
Option 1 is ever revisited, the directional shape would be: Enchantment column
roughly halved (≈ 4 / 9 / 18 at 4p — still wrong at 2–3p), Conjuration increments
raised one step (suit density 12/62; conj-3+ falls to 58–75% vs 84% anchor), and
the table truncated at size 12 (no rank 13+ exists; sequence rows 13–15 are dead
print). At 5–6p Option 1 behaves identically to Option 2 (within noise on every
metric), so the shared-table conclusion above applies unchanged there. This all
reinforces the RESULTS.md verdict: the problem with Option 1 is the deck, not the
prices.

---

## Reproduce

```
python scoring_rebalance_stats.py --trials 10000 --hand-trials 50000 \
    --seed 42 --json results/scoring_stats.json
```

Caveats inherit from ASSUMPTIONS.md: greedy identical agents, no
Transfiguration/PT pursuit in the full-game sim (hence the hand-model), no
opponent-aware play. Ratios robust, absolutes indicative.
