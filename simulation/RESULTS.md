---
title: Deck Configuration Decision — Simulation Results
type: analysis
created: 2026-07-02
relates_to:
  - "[[ASSUMPTIONS]]"
  - "[[STATE]]"
  - "[[Archmage Ascension - Complete Rulebook]]"
---

# Deck Configuration Decision — Option 1 vs Option 2

10,000 games per configuration, `archmage_deck_sim.py`, seeds 42/43/44. All values
with 95% CIs; raw data in `results/*.csv`. Ladder used everywhere (including the Live
baseline): 3-card = +1 counter, 4-card = +2, 5-card = UC. Read ASSUMPTIONS.md before
trusting absolute numbers; between-configuration comparisons are the robust part.

**Options tested**

| | 2–4 players | 5–6 players |
|---|---|---|
| Option 1 | 5E × 1–12 + 2W (62) | 5E × 1–16 + 4W (84) |
| Option 2 | 4E × 1–15 + 2W (62) — *current live deck* | 5E × 1–15 + 4W (79) — *Echo* |
| Live baseline | 4E × 1–15 + 2W (62) | 4E × 1–20 + 4W (84) |

## Primary comparison (tier 4 = +2, 4 wilds at 5–6p)

Per-player rates unless marked "games". UC draws = personal post-deal draws at the moment the 5th card lands.

| Config | UC (games) | UC (players) | UC draws | T3+ | T4+ | T5 | Open-hand 3+ energy | Conj. learned | Turns/player pre-Drought |
|---|---|---|---|---|---|---|---|---|---|
| **Opt1 2p** | 97.3% ±0.3 | 75.1% ±0.6 | 15.2 | 100% | 98.1% | 75.1% | 58.2% ±0.7 | 75.3% ±0.6 | 13.0 ±0.1 |
| **Opt1 3p** | 77.7% ±0.8 | 35.7% ±0.5 | 10.2 | 98.9% | 81.2% | 35.7% | 58.3% | 66.5% | 8.2 |
| **Opt1 4p** | 50.2% ±1.0 | 15.2% ±0.4 | 6.7 | 92.9% | 54.4% | 15.2% | 57.9% | 58.0% | 5.4 |
| **Opt1 5p** | 66.4% ±1.0 | 17.4% ±0.4 | 8.4 | 88.5% | 52.2% | 17.4% | 57.4% | 74.5% | 6.0 |
| **Opt1 6p** | 42.6% ±1.0 | 8.3% ±0.2 | 6.1 | 77.5% | 35.0% | 8.3% | 57.6% | 67.4% | 4.4 |
| **Opt2 2p** | — (4E) | — | — | 99.2% | 85.9% | — | 77.5% ±0.6 | 94.4% ±0.3 | 10.7 |
| **Opt2 3p** | — | — | — | 91.1% | 53.5% | — | 77.0% | 88.4% | 7.1 |
| **Opt2 4p** | — | — | — | 75.8% | 29.0% | — | 77.8% | 80.5% | 4.8 |
| **Opt2 5p** | 64.0% ±1.0 | 16.7% ±0.3 | 7.5 | 88.2% | 51.6% | 16.7% | 56.9% | 69.6% | 5.5 |
| **Opt2 6p** | 43.0% ±1.0 | 8.4% ±0.3 | 5.4 | 76.8% | 34.5% | 8.4% | 57.1% | 62.1% | 4.0 |
| *Live 2p* | — | — | — | 99.1% | 85.5% | — | 77.1% | 94.4% | 10.7 |
| *Live 3p* | — | — | — | 91.3% | 53.1% | — | 77.3% | 88.3% | 7.1 |
| *Live 4p* | — | — | — | 75.5% | 28.9% | — | 77.5% | 80.7% | 4.8 |
| *Live 5p* | — | — | — | 71.7% | 32.2% | — | 76.1% | 90.6% | 5.4 |
| *Live 6p* | — | — | — | 59.4% | 20.4% | — | 75.7% | 84.8% | 4.0 |

Opening-hand figures cross-checked against exact closed-form values: 5E×12+2W = 58.23%,
4E×15+2W = 77.25%, 5E×15+4W = 56.85% — sim matches all three within noise.

## The five questions, answered

**1. UC completion (Option 1 at 2p).** Hypothesis confirmed almost exactly: 75.1% of
players complete UC at 2 players (97.3% of games contain one), on average 15 draws into
a ~25-draw game — UC would be routine, not legendary, and the late game collapses.
Even at 3p it's 36% of players. Option 1 re-introduces the fixed problem.

**2. Enchantment uptake at 5–6p.** Both options deliver the intended lift over the
live 4E×20 deck. T3+ at 5p: 88% (either option) vs 72% live; at 6p: 77% vs 59%.
T4+ roughly +20 points at both counts. Option 1 and Option 2 are statistically
indistinguishable from each other at 5–6p on every enchantment metric — the 16th rank
buys nothing here.

**3. Conjuration viability (suit dilution).** Confirmed but survivable. Adding the 5th
energy at 5–6p drops opening-hand 3+-of-one-energy from ~76% to ~57% and
conjurations-learned from 90.6%→69.6% (5p) and 84.8%→62.1% (6p). Conjuration stays a
majority path but is meaningfully scarcer — worth watching live. (Option 1 is 4–5
points better than Option 2 here; nowhere near enough to offset its 2–4p damage.)

**4. 2–4p regression check.** Option 2 is the live deck by construction and the sim
agrees: across t3+, t4+, open-hand, conjuration and pacing at 2, 3 and 4 players, all
two-proportion z-scores vs the independently-seeded Live baseline fall between −1.7
and +2.3 (none significant at α=0.01); pacing differs by <0.01 turns. Pass.
Option 1 fails the same check catastrophically: T4+ uptake balloons (86→98% at 2p,
29→54% at 4p), UC appears where it structurally couldn't, conjuration drops ~15–20
points, and 2p games run ~2.3 turns/player longer.

**5. Pacing.** Option 2 at 5–6p: 5.5 / 4.0 pre-Drought turns per player — essentially
identical to the live 84-card deck (5.4 / 4.0) despite being 5 cards smaller, because
diluted conjurations fire less often. Option 1's 12-rank deck slows 2p noticeably
(13.0 vs 10.7) — matched sets come so easily that big conjurations get cannibalised.

## Tunables

**4-card tier: +2 vs +3 counters.** No measurable effect on any completion metric at
any player count under either option (every difference within the 95% CI). The binding
constraint on uptake is card availability, not learning actions — by the time the
extra counter arrives the engine is already running. Decide this on scoring/feel
grounds; it does not interact with the deck decision.

**5–6p wilds: 4 vs 6.** A big lever, and it pushes the wrong way for UC rarity:
6 wilds roughly doubles per-player UC (5p: 16.7%→29.5%; 6p: 8.4%→15.8%; game-level
64%→88% and 43%→69%) and lifts T4+ by ~13 points, while diluting natural suits
(open-hand conjuration −3.5 points). Identical effect on both options. **Keep 4 wilds**
— with 6, UC at 5p approaches Option 1's broken 3p number.

## Verdict

**Option 2, with 4 wilds; the +2/+3 question is free and can be decided on scoring
elegance.**

Against your four criteria: Option 2 has zero 2–4p regression (by construction,
verified); it lifts 5–6p enchantment uptake by 17–20 points at every tier; UC at 5–6p
lands at 8–17% of players (roughly one per game at 5p, just under half of games at 6p)
— rare and earned, arriving ~7.5 draws in, typically late-game; conjuration dilution is
real but leaves conjuration a 62–70% majority path. Option 1 is dominated: it buys
statistically nothing at 5–6p over Option 2 and breaks 2–4p in exactly the way you
suspected (75% UC at 2p) plus ways you didn't list (conjuration and pacing shifts at
all of 2–4p).

**Watch live:** the two soft spots the model flags for the next 5–6p playtest are
conjuration scarcity (does 62% at 6p still *feel* viable?) and 6p pre-Drought length
(~4 turns per player before the Drought — short; players who whiff early may feel the
game end before they start).

## Reproducing / extending

```
python archmage_deck_sim.py compare --trials 10000 --seed 42 --csv results/matrix_base.csv
python archmage_deck_sim.py compare --trials 10000 --seed 43 --tier4-counters 3 --csv results/matrix_t4p3.csv
python archmage_deck_sim.py compare --trials 10000 --seed 44 --wilds56 6 --csv results/matrix_w6.csv
```

Any other deck shape: `run --energies E --ranks R --wilds W --players P`. Same seed →
identical output. `--rows a:b` reruns a slice of the matrix without changing seeds.
