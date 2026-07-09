---
title: Per-Deck Scoring Analysis (pre-combination)
type: analysis
updated: 2026-07-08
source: simulation/scoring_ev.py (part_a_pricing), + analytic difficulty from tools/scoring models/
thread: capacity-economy
status: analysis only — no combined table proposed yet (per Sam, 2026-07-08)
---

# Per-Deck Scoring Analysis

Separate per-deck view of what is over- or under-powered **before** collapsing to a single printed table. Both canon decks are priced **with wilds** (the `tools/scoring models/` workbooks dropped wilds — 60/75 — so their reach is rebuilt here from the rig). Seed 42, 10k game-trials + 50k hand-trials per player count; Deck A = mean of 2p/3p/4p, Deck B = mean of 5p/6p. Ratios are load-bearing; absolute reach is indicative (inherits `ASSUMPTIONS.md`).

## How to read it

- **reach** = probability a greedy agent can assemble the spell (chase ceiling).
- **canon** = current printed price (`rulebook/Scoring System Reference.md`).
- **fair** = canon ÷ (price/difficulty ratio) = the price that would make the spell neither over- nor under-paid for its difficulty.
- **ratio** = price ÷ difficulty-implied price. **>1 over-paid, <1 under-paid.**

### Scope / authority by size (important)

The rig's empirical pricing is only defined for **sizes 3–10** — at 11–15 reach ≈ 0, so implied price is undefined/noisy exactly where the Conj15≡PT15 identity and the concentration exploit live. So **sizes 3–10 are priced from the rig (below); sizes 11–15 from analytic difficulty** (combinatorial −ln P), shown separately per deck. The **low end (3–6) of the easy families is a floor artefact**: near-certain spells all collapse to the rig's ~baseline, and pure difficulty sends them to ~0 — neither is a real price. The low end must be set by design/utility, not by either difficulty model.

## Deck A — 2–4p — 4E × 1–15 + 2W (62 cards)

**Conjuration**

| size | reach | canon | fair | ratio | signal |
|---:|---:|---:|---:|---:|---|
| 3 | 1.000 | 3 | 10 | 0.31 | floor-artefact (trivial spell) |
| 4 | 1.000 | 4 | 10 | 0.41 | floor-artefact (trivial spell) |
| 5 | 0.990 | 6 | 10 | 0.61 | floor-artefact (trivial spell) |
| 6 | 0.913 | 9 | 10 | 0.89 | ≈ fair |
| 7 | 0.752 | 13 | 11 | 1.20 | ≈ fair |
| 8 | 0.568 | 18 | 13 | 1.44 | over |
| 9 | 0.413 | 24 | 16 | 1.53 | over |
| 10 | 0.295 | 31 | 22 | 1.44 | over |

**Transfiguration**

| size | reach | canon | fair | ratio | signal |
|---:|---:|---:|---:|---:|---|
| 3 | 0.998 | 5 | 10 | 0.51 | floor-artefact (trivial spell) |
| 4 | 0.977 | 7 | 10 | 0.71 | floor-artefact (trivial spell) |
| 5 | 0.928 | 10 | 10 | 1.00 | ≈ fair |
| 6 | 0.857 | 14 | 10 | 1.35 | over |
| 7 | 0.778 | 19 | 11 | 1.77 | **OVER ++** |
| 8 | 0.690 | 25 | 11 | 2.21 | **OVER ++** |
| 9 | 0.607 | 32 | 12 | 2.65 | **OVER ++** |
| 10 | 0.533 | 40 | 13 | 3.08 | **OVER ++** |

**Perfect Transmutation**

| size | reach | canon | fair | ratio | signal |
|---:|---:|---:|---:|---:|---|
| 3 | 0.901 | 7 | 10 | 0.69 | under |
| 4 | 0.728 | 10 | 11 | 0.90 | ≈ fair |
| 5 | 0.539 | 14 | 13 | 1.09 | ≈ fair |
| 6 | 0.378 | 19 | 16 | 1.18 | ≈ fair |
| 7 | 0.262 | 25 | 22 | 1.16 | ≈ fair |
| 8 | 0.178 | 32 | 31 | 1.02 | ≈ fair |
| 9 | 0.118 | 40 | 48 | 0.84 | ≈ fair |
| 10 | 0.076 | 49 | 77 | 0.64 | under |

**Enchantment**

| size | reach | canon | fair | ratio | signal |
|---:|---:|---:|---:|---:|---|
| 3 | 0.888 | 6 | 10 | 0.59 | under |
| 4 | 0.558 | 12 | 13 | 0.94 | ≈ fair |
| 5 | 0.000 | 18 | — | — | unreachable |

**High end (11–15) — analytic difficulty only, reach ≈ 0** (identity: Conj15 = PT15)

| size | Conj −lnP | TF −lnP | PT −lnP | canon Conj/TF/PT |
|---:|---:|---:|---:|---|
| 11 | 10.7 | 2.5 | 16.3 | 39/49/59 |
| 12 | 14.3 | 3.8 | 19.1 | 48/59/70 |
| 13 | 18.6 | 5.5 | 22.1 | 58/70/82 |
| 14 | 23.7 | 7.7 | 25.7 | 69/82/95 |
| 15 | 30.2 | 10.8 | 30.2 | 81/95/109 |

> Analytic shape: TF15 ≈ 11 vs Conj15 = PT15 = 30 — TF is the cheapest big spell; canon has Conj15=81 ≠ PT15=109 (identity violated) and TF15=95 (should be the *lowest*).

## Deck B — 5–6p — 5E × 1–15 + 4W (79 cards, Echo)

**Conjuration**

| size | reach | canon | fair | ratio | signal |
|---:|---:|---:|---:|---:|---|
| 3 | 1.000 | 3 | 9 | 0.35 | floor-artefact (trivial spell) |
| 4 | 0.983 | 4 | 9 | 0.46 | floor-artefact (trivial spell) |
| 5 | 0.815 | 6 | 9 | 0.66 | under |
| 6 | 0.491 | 9 | 10 | 0.88 | ≈ fair |
| 7 | 0.206 | 13 | 13 | 1.02 | ≈ fair |
| 8 | 0.065 | 18 | 17 | 1.04 | ≈ fair |
| 9 | 0.015 | 24 | 25 | 0.95 | ≈ fair |
| 10 | 0.002 | 31 | 41 | 0.76 | ≈ fair |

**Transfiguration**

| size | reach | canon | fair | ratio | signal |
|---:|---:|---:|---:|---:|---|
| 3 | 0.987 | 5 | 9 | 0.58 | floor-artefact (trivial spell) |
| 4 | 0.917 | 7 | 9 | 0.80 | ≈ fair |
| 5 | 0.798 | 10 | 9 | 1.10 | ≈ fair |
| 6 | 0.653 | 14 | 10 | 1.47 | over |
| 7 | 0.501 | 19 | 10 | 1.86 | **OVER ++** |
| 8 | 0.363 | 25 | 11 | 2.26 | **OVER ++** |
| 9 | 0.251 | 32 | 12 | 2.64 | **OVER ++** |
| 10 | 0.167 | 40 | 14 | 2.96 | **OVER ++** |

**Perfect Transmutation**

| size | reach | canon | fair | ratio | signal |
|---:|---:|---:|---:|---:|---|
| 3 | 0.730 | 7 | 9 | 0.75 | ≈ fair |
| 4 | 0.448 | 10 | 10 | 0.96 | ≈ fair |
| 5 | 0.205 | 14 | 13 | 1.10 | ≈ fair |
| 6 | 0.072 | 19 | 16 | 1.15 | ≈ fair |
| 7 | 0.021 | 25 | 23 | 1.11 | ≈ fair |
| 8 | 0.005 | 32 | 33 | 0.98 | ≈ fair |
| 9 | 0.001 | 40 | 48 | 0.84 | ≈ fair |
| 10 | 0.000 | 49 | 66 | 0.74 | under |

**Enchantment**

| size | reach | canon | fair | ratio | signal |
|---:|---:|---:|---:|---:|---|
| 3 | 0.827 | 6 | 9 | 0.67 | under |
| 4 | 0.431 | 12 | 11 | 1.14 | ≈ fair |
| 5 | 0.124 | 18 | 14 | 1.25 | over |

**High end (11–15) — analytic difficulty only, reach ≈ 0** (identity: Conj15 = PT15)

| size | Conj −lnP | TF −lnP | PT −lnP | canon Conj/TF/PT |
|---:|---:|---:|---:|---|
| 11 | 13.2 | 2.7 | 18.8 | 39/49/59 |
| 12 | 17.0 | 4.1 | 21.8 | 48/59/70 |
| 13 | 21.6 | 5.8 | 25.1 | 58/70/82 |
| 14 | 26.9 | 8.0 | 28.9 | 69/82/95 |
| 15 | 33.8 | 11.2 | 33.8 | 81/95/109 |

> Analytic shape: TF15 ≈ 11 vs Conj15 = PT15 = 34 — TF is the cheapest big spell; canon has Conj15=81 ≠ PT15=109 (identity violated) and TF15=95 (should be the *lowest*).

## Cross-deck synthesis

- **Transfiguration is over-paid in both decks and the overpayment grows with size** — ratio 1.8× (size 7) to ~3× (size 10), essentially deck-independent. The 5th energy (Echo) keeps long any-energy runs easy, so Deck B does **not** relieve it. This is the primary fix and a single flattened TF column serves both decks.
- **Perfect Transmutation is fair-to-*under* at the top** (ratio 0.6–0.7 at size 10) in both decks. It is not over-paid — keep PT's high end steep.
- **Conjuration** is ~1.4–1.5× over at sizes 8–10 **in Deck A only**; in Deck B those sizes are near-unbuildable (reach 0.002–0.07), so the Conj high end is a **2–4p-only tuning** and can be priced for Deck A without hurting Deck B.
- **Enchantment-5 / Unlimited Capacity** exists only in Deck B and prices **over** (ratio 1.25) — independent support for removing UC (F1).
- **Low end (3–6)** shows 'under' everywhere but that is the floor artefact, not real underpayment.

## Low-end rounding & ceiling (the granularity question)

Rounding a scaled curve to integers distorts small spells most (relative error ≈ 0.5/value). Two findings:

1. **Pure difficulty gives the low end no price** — every size 3–6 Conj/TF rounds to **0** at *any* ceiling 30→100. A value **floor** (a small spell's in-play worth, e.g. Conjuration's draw engine) is required before rounding is even meaningful.
2. Given a floor, **ceiling is a pure resolution knob**: at ceiling 30–50 low-value spells collide (your 0.6-vs-1.4 → both 1); nearer **100** they separate into distinct integers. If you want to keep the printed ceiling low, **half-point scores at the bottom** achieve the same separation. Recommendation: treat ceiling as a cap chosen for low-end resolution, i.e. lean high **or** allow half-points — don't anchor PT15.

## What a single combined table will imply (not proposed here)

The deck-specific hot spots don't collide, so one shared table can be near-fair to both: **flatten TF above ~size 6** (both decks), **keep PT steep** (both), **tune the Conj high end to Deck A** (irrelevant at Deck B), **handle UC separately** (remove). The only genuine cross-deck compromise is small.

## Reproduce

Deck A is `scoring_ev.py` as shipped (2p/3p/4p). Deck B was priced by adding 5p/6p on `DeckConfig(5,15,4)` via this driver (folding these two lines into `study_configs()` would make the standard `analyze` cover both decks):

```python
# from simulation/, imports the rig unchanged
import scoring_ev as se
from archmage_deck_sim import DeckConfig, Rules
for players,deck in [(5,DeckConfig(5,15,4)),(6,DeckConfig(5,15,4))]:
    pa = se.part_a_pricing(deck, players, Rules(), 10000, 50000, 42)
```

High-end (11–15) analytic difficulty from `tools/scoring models/archmage_scoring_m15_utility_model_v4_formula_corrected.xlsx` → `Final_Fixed_Tables` (−lnP). Note that workbook omits wilds; at 11–15 wilds barely change near-zero reach, so it is sound as the identity/shape anchor only.

## Limitations

Greedy identical non-opponent-aware agents; reach = chase ceiling not in-play attainment; rig prices sizes 3–10 only; 11–15 from a wild-free analytic model; low-end prices are design-set, not model-set.
