---
title: Proposed score table (vnext) — CANDIDATE, not canon
type: proposal
experiment: vnext-scoring-economy
updated: 2026-07-08
---

# Proposed Recognition Points table (candidate)

**Not canon.** This is the current candidate: a **single shared table used by both decks**
(4-energy and 5-energy), derived from the utility scoring model. Derivation and input sets:
`meta/experiments/vnext-scoring-economy/utility-model-input-sets.md`. Machine form:
`shared_table` block in `tools/scoring models/recorded_target_tables.json` (regenerate with
`record_target_tables.py`).

## Current canon (v3.0), for comparison

| size | Conj | TF | PT | Ench |
|---:|---:|---:|---:|---:|
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

## Proposed (candidate) — shared across both decks

| size | Conj | TF | PT | Ench |
|---:|---:|---:|---:|---:|
| 3 | 0 | 3 | 5 | 4 |
| 4 | 1 | 4 | 11 | 10 |
| 5 | 2 | 5 | 18 | 16 |
| 6 | 3 | 7 | 24 | — |
| 7 | 7 | 8 | 31 | — |
| 8 | 13 | 10 | 39 | — |
| 9 | 20 | 13 | 47 | — |
| 10 | 29 | 16 | 56 | — |
| 11 | 38 | 20 | 65 | — |
| 12 | 50 | 25 | 74 | — |
| 13 | 63 | 31 | 85 | — |
| 14 | 79 | 38 | 97 | — |
| 15 | 100 | 48 | 100 | — |

Enchantment sizes 3–4 apply to both decks; **size 5 applies to the 5-energy deck only**
(a 4-energy deck can't build a 5-card Enchantment). Enchantment values are **provisional**
(see Open items).

## Design rules
- **Ceiling = 100**, with the identity **Conj15 = PT15 = 100** (a 15-card Conjuration IS a
  15-card Perfect Transmutation).
- **C3 = 0 floor**: the 3-card Conjuration is the zero point. Every other spell rounds to
  ≥ 1, and **each column is strictly increasing** with size (no ties).
- **One shared table for both decks.** It is co-fit from the two decks' difficulty models:
  matched as closely as possible up to size ~9 (per-deck error ≤ ±1 across the common
  end-game sizes), then weighted toward the **4-energy deck** (the more common, 2–4 player
  configuration) as size rises. PT15 = 100 comes from the 4E deck; the 5E deck's ceiling is
  relaxed (its size-15 spells aren't realistically achievable, so they aren't the anchor).
- **PT steep** (fair-to-under at the top by difficulty); **Conjuration convex** (earned).
- **TF ≈ ½ of PT at the top (TF15 = 48)** — above its ~⅓ raw build-difficulty: a deliberate
  subsidy so Transfiguration stays worth playing live.
- **Enchantment ≈ +6 per size (4 / 10 / 16)**, decoupled from the in-play utility discount so
  it grows with size rather than flattening; integers, no half-points.

## Supersedes
Replaces the earlier candidate (flat low-end Conj 1,1,2,2; TF15 = 55; Enchantment left at
canon values). Changes: C3 pulled to 0 with a strictly-increasing low end; a single shared
table now serves both decks; TF top eased to 48; Enchantment repriced to 4/10/16.

## Open / to eyeball before adoption
- **Enchantment magnitude** — 4/10/16 is provisional; its final shape is tied to the open
  Unlimited-Capacity / capacity-ladder reprice (`enchantment-capacity.md`).
- **Mid-range deck divergence** — a 7–8 card Conjuration is genuinely harder in the 5E deck,
  so the shared value is off by ≤ 1 point per deck there. Confirm it feels fair in live
  scoring at both player counts.
- **TF ½-of-PT premium (48)** — couples to the RESHAPE rule (`reshape-rule.md`): promoting
  TF re-opens the concentration exploit that RESHAPE closes.
