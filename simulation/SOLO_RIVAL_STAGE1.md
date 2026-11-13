---
title: Attuned Rival — Stage 1 sim results and assumptions
type: reference
created: 2026-11-13
updated: 2026-11-13
relates_to:
  - "[[Solo Mode - The Attuned Rival (v0.1)]]"
  - "[[Archmage Ascension - Complete Rulebook]]"
---

# Attuned Rival — Stage 1 sim (rulebook v3.2)

Script: `simulation/solo_rival_sim.py` (standard library, one seeded RNG per config).
Reproduce: `python solo_rival_sim.py report --trials 2000 --seed 20261113` (41 configs x
2,000 games; one CPU core, about 2 minutes on an idle machine, longer when it is busy).
Same seed gives byte-identical tables (checked).

## Headline numbers (Adept, rules as written, ±1 unless noted)

| Pace profile | Rounds to Drought | Keep rate (row ≥3) | Rejects/game (p10–p90) | Stack stranded | Rival score mean (p10/p50/p90) | Player proxy mean | Player wins |
|---|---|---|---|---|---|---|---|
| slow (never casts) | 13.8 | 52% | 5.5 (3–8) | 0.6 | 54.7 (38/50/79) | 65.5 | 67% |
| normal | 9.7 | 47% | 3.9 (2–6) | 4.8 | 23.0 (5/20/47) | 71.1 | 92% |
| fast | 9.2 | 44% | 3.6 (2–6) | 5.5 | 17.7 (5/16/31) | 72.1 | 96% |
| normal, ±2 | 9.3 | 73% | 1.8 (0–4) | 5.2 | 26.4 (7/20/50) | 69.9 | 90% |
| normal, ±3 | 9.1 | 87% | 0.8 (0–3) | 5.4 | 28.8 (13/24/50) | 68.4 | 86% |

Keep rate over all flips (the first two are automatic): ±1 58%, ±2 79%, ±3 90%. Keep-rate
curve at ±1 rises from 38% (flip 3) to 68% (flip 13) as the row widens.

Rival score by game length (±1, all seven profiles pooled, 14,000 games):

| Rounds before Drought | ≤7 | 8–9 | 10–11 | 12–13 | 14+ |
|---|---|---|---|---|---|
| Final row | 6.2 | 7.3 | 8.9 | 12.1 | 11.8 |
| Rival mean (p10/p90) | 9.2 (2/18) | 14.3 (5/24) | 24.6 (13/39) | 58.8 (38/85) | 53.4 (35/79) |

The curve is as steep as §8–9 of the draft intends (about 6x from short to long games). The
14+ bucket sits below 12–13 because a Rival that rejects a lot also slows the clock (a keep
costs the Source an extra refill card), so the longest games are the ones with thin rows.
At ±2 the same buckets read 12 / 20 / 29 / 66 / 57.

## What the sim says about the open questions

- **Q1 adjacency.** ±2 adds only ~3 points at normal pace but halves the rejects (1.8 per
  game, often 0). It does not fix strength. Keep ±1.
- **Q2 score band.** The Adept Rival is too weak. At normal pace it averages 23 (p90 47)
  against the draft's own expected player books of ~35–55, and the player proxy (~71) beats
  it 92% of the time. Only a player who never casts (slow profile) faces a Rival in the
  band (55).
- **Q4 reject supply.** ±1 gives 3.9 rejects per game (2–6), inside the 3–6 target. But
  the scavenge prize is barely felt: of 3.9 rejects the player takes 0.55, the Rival's own
  Tithe buries 2.05, and 1.26 sit in the Array at the Drought. A 4-card Enchantment holding
  a Void card happens in 0.24 games.
- **Q5 tie between readings.** Harmless, confirmed (equal in 9% of games). Reading (b) beats
  (a) in 49%; no mixed split of runs ever beats max(a, b), so the two-reading rule loses
  nothing.
- **Pace dial (§5.2, §12).** Rushing is dominant. From slow to fast the Rival falls 55 → 18
  while the player proxy rises 65 → 72. The Ravening (§6) almost never fires (6% of slow
  games, 0% otherwise), so slow play is never punished. There is no "when do I want the
  Drought?" trade-off: always as soon as possible.

## The decoy-largest-spell exploit (Q3)

Not dominant in the sim, because the Tithe is a weak lever overall:

| Variant (±1, normal) | Player mean | Rival mean | Player wins | Tithe p2 per game |
|---|---|---|---|---|
| As written | 71.1 | 23.0 | 92% | 2.2 |
| Perfect decoy bound (p2 never fires) | 73.4 | 22.5 | 92% | 0 |
| No Tithe at all | 80.0 | 30.5 | 91% | 0 |
| Decoy line (keep a capped 4-card Enchantment as largest spell until the Drought) | 56.3 | 26.7 | 87% | 1.1 |
| Tithe hunts extensions of ANY spell (candidate wording) | 70.8 | 21.6 | 93% | 4.4 |

A perfect shield is worth about +2 points; the concrete decoy line costs the player ~15
points (holding every spell at 3–4 cards until the Drought is expensive). An honest player
already gets the shield for free about once per game: at 4 cards the tie order
(PT > E > T > C) makes a capped 4-card Enchantment the "largest spell", and nothing can
extend it. The KILL criterion "shielding dominant" is not met. The Void-Conjuration decoy the
draft names was not modelled (too rare: the player takes 0.55 rejects per game).

## Difficulty and levers

- **Apprentice (×0.75)** makes an already-weak Rival weaker (normal-pace win 97%).
- **Archmage** does not raise difficulty: the Rival scores less (19.4 vs 23.0), because its
  wilds use up flips and no wilds reach it in the Drought; the player loses ~9 points (no
  wilds). Win rate unchanged (93%).
- **Hoard** costs the player ~14 points but the Rival gains almost nothing (win 86%).
- **Hasten** (not simulated) shortens the game, and by the length curve above that makes
  the Rival *weaker*, not stronger. It points the wrong way as a difficulty lever.
- **Candidate fix "sweep"** (at the Drought the remaining Stack is flipped through the keep
  test instead of removed): Rival 53.6 at normal pace, player wins 68%, but pace barely
  matters any more (slow 61 vs fast 53), so it removes the strand race. It shows the size
  of the gap (~30 points), not the answer.

## Rules gaps the sim had to fill (fallbacks are flagged in the code)

- §7 wild declaration: no rule when the longest run already ends at 15 (sim: extend low
  end), for equally long runs (sim: lower run), or for an empty row (Archmage binding
  wild; sim: 8). About 5 fallbacks per 100 games.
- A wild declared onto a gap and the natural Void card of that rank arriving later gives a
  duplicate rank in the row (~10 per 100 games). The sim scores the duplicate in the
  Conjuration remainder.
- Tithe priority 2: "rank adjacent to either end" of a PT — the sim counts off-energy cards
  (literal reading). Same-size, same-type ties for "largest spell" are unspecified (sim:
  earliest learned). "Would extend" vs "matching the rank" of a capped Enchantment: no
  measurable difference.

## Assumptions and what the sim does NOT model

Modelled: 47-card player deck (Void removed), 7-card hand, 5-card Array, 35-card Source,
binding, 1 starting counter, Enchantment capacity +1/+3 from the next turn, 2–4p
Enchantment cap of 4, Conjuration/PT draws (+1/+2), Transfiguration exchanges, the v3.2
Source-emptying rule (casting stops, Learning goes on; a cast needs enough Source for its
full effect), flexible wilds (energy-free in Conjurations and Enchantments, a fixed number
in sequences), the Rival's Flip/Tithe/refill/Burn, Ravening, Stack removal at the Drought,
the Rival's Drought draws, max-of-two-readings scoring, Archmage, Hoard.

- **The player proxy is a greedy one-step bot**, not a strong or a human player. It learns
  the best immediate spell or empower, hoards wilds for Enchantments, takes an Array card
  only when clearly useful, and has no Reshape or Unlearn. Its scores (~70) are above the
  draft's ~35–55 guess. No v3.2 session log has final books to check it against (sessions
  1–4 predate the v3.1 table), so the Rival is judged against both benchmarks. It fails
  both at normal pace.
- **Pace profiles are crude.** "slow" never casts; "fast" adds Conjuration engines. A
  real player who slows down deliberately would still cast, so the slow row overstates how
  much a patient human feeds the Rival.
- **Metronome profiles (m1–m4)** burn 1–4 Source cards a turn and build nothing. They only
  isolate the Rival's length curve.
- No hand limit (none in the rulebook). Tables clamp sizes above 15 to the 15 row.
- The player does not read the Rival: no deliberate denial grabs, no counting the Stack, no
  baiting. Those are the Stage 2 deviations the live test measures.
- Upkeep time, teachability and fun are not modelled.
