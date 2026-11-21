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

---

## Stage 1b — tuning levers (2026-11-13)

Reproduce: `python solo_rival_sim.py stage1b --trials 2000 --seed 20261114` (17 levers x 3
pace profiles x 2,000 games; one core, ~4–5 minutes on the shared machine). The refactor
that added the levers gives output identical to the Stage 1 version when they are off
(checked on three configs).

Targets (from Sam): Adept Rival ~35–55 at normal pace, player win ~55–70%, slow play
punished, fast play not strictly best. Levers simulated:

- **Drought flip, top N:** when the Drought begins, flip the top N leftover Stack cards
  through the normal keep test (kept cards join the row); remove the rest as written.
- **Earlier/bigger Ravening:** the Ravening starts when the Source (or the Stack) falls to a
  threshold. While Ravening, the Rival flips 2 (or 3) cards a turn, each through the keep
  test. "burn 2" keeps the written extra Burn; "burn 1" drops it (no extra clock pressure).

| Lever | Rival slow (p10–p90) | Rival normal (p10–p90) | Rival fast (p10–p90) | Player win slow / normal / fast | Keep rate (normal) | Drought-flip keeps | Rejects/game (normal) | Pace spread (Rival slow − fast) | Fast strictly best? |
|---|---|---|---|---|---|---|---|---|---|
| Baseline (as written) | 53.8 (38–74) | 22.5 (5–47) | 18.1 (5–31) | 68% / 93% / 97% | 58% | 0.0 | 3.9 | +35.7 | yes |
| (a) Drought flip, top 2 | 61.5 (38–97) | 32.3 (11–56) | 27.5 (11–50) | 56% / 86% / 90% | 58% | 1.1 | 3.9 | +34.0 | yes |
| (a) Drought flip, top 3 | 61.0 (38–97) | 38.0 (16–65) | 33.6 (13–56) | 56% / 83% / 87% | 58% | 1.6 | 3.9 | +27.4 | yes |
| (a) Drought flip, top 4 | 62.1 (38–97) | 43.6 (20–74) | 40.4 (18–65) | 53% / 78% / 81% | 58% | 2.1 | 3.9 | +21.8 | yes |
| (a) Drought flip, top 6 | 61.4 (38–97) | 51.5 (29–79) | 50.2 (29–79) | 56% / 72% / 73% | 58% | 2.9 | 3.8 | +11.3 | no |
| (b) Ravening at Stack ≤5, flip 2 | 62.2 (38–97) | 25.6 (5–56) | 20.9 (5–39) | 52% / 89% / 92% | 58% | 0.0 | 4.0 | +41.3 | yes |
| (b) Ravening at Source ≤10, flip 2, burn 2 | 63.0 (38–97) | 34.6 (13–63) | 28.7 (11–50) | 50% / 85% / 89% | 59% | 0.0 | 4.5 | +34.3 | yes |
| (b) Ravening at Source ≤15, flip 2, burn 2 | 62.4 (38–97) | 39.7 (16–65) | 34.9 (13–63) | 49% / 79% / 83% | 59% | 0.0 | 4.9 | +27.5 | yes |
| (b) Ravening at Source ≤12, flip 2, burn 1 | 63.2 (38–97) | 40.2 (16–65) | 34.5 (13–63) | 53% / 81% / 84% | 59% | 0.0 | 4.9 | +28.8 | yes |
| (b) Ravening at Source ≤15, flip 2, burn 1 | 62.7 (38–97) | 44.8 (20–74) | 39.8 (18–65) | 54% / 78% / 81% | 59% | 0.0 | 5.1 | +22.9 | yes |
| (c) top 3 + Ravening ≤15 flip 2 burn 1 | 62.4 (38–97) | 55.9 (29–85) | 53.6 (29–85) | 55% / 68% / 70% | 59% | 0.9 | 5.2 | +8.8 | yes (by 2 pts) |
| (c) top 3 + Ravening ≤15 flip 3 burn 1 | 62.0 (38–97) | 58.6 (35–85) | 58.4 (31–85) | 53% / 66% / 66% | 59% | 0.1 | 5.6 | +3.6 | no |
| **(c) top 4 + Ravening ≤12 flip 2 burn 1** | 62.8 (38–97) | **56.2 (29–85)** | 54.5 (29–85) | 53% / **69%** / 70% | 59% | 1.4 | 4.9 | +8.3 | no |
| (d) leftover Stack shuffled into the Released Reserve | 59.1 (38–85) | 41.4 (20–63) | 38.6 (20–63) | 59% / 85% / 87% | 58% | 0.0 | 3.9 | +20.5 | no |
| Adept (c top 4 + ≤12) + Hoard | 58.3 (37–87) | 53.7 (33–77) | 53.1 (32–75) | 35% / 54% / 55% | 58% | 1.3 | 5.0 | +5.1 | no |
| Adept (c top 4 + ≤12) + ±2 adjacency | 86.6 (63–100) | 81.5 (52–100) | 79.5 (50–100) | 17% / 32% / 38% | 82% | 2.3 | 2.1 | +7.0 | yes |
| top 6 + Ravening ≤18 flip 2 burn 1 | 62.1 (38–97) | 58.0 (31–85) | 57.4 (31–85) | 53% / 67% / 69% | 59% | 0.8 | 5.3 | +4.7 | no |

"Fast strictly best" = the fast win rate is more than 2 points above both normal and slow.
The player proxy averages ~70–73 at normal pace in every row except Hoard (57.5).

### What the levers do

- **Neither lever alone is enough.** (a) alone needs top 6 to reach the band; at top 2–4
  rushing is still strictly best. (b) alone tops out at ~45 at normal pace, and keeping the
  extra Burn ("burn 2") makes it weaker, because the faster clock cuts the Rival's own
  turns.
- **The Stack-triggered Ravening is useless**: the Stack is rarely down to 5 before the
  Drought except in slow games, so it only feeds the slow Rival (+41 pace spread).
- **Combined, they hit the target.** The Ravening grows the row before the Drought in every
  game, and the Drought flip charges the player for whatever the rush stranded. Slow play
  stays the worst choice (53% win vs 69–70%), normal and fast are level, and the pace spread
  drops from +36 to +8.
- **The Rival saturates around 56–58.** A one-energy row built by the keep test rarely goes
  past 11–12 cards, so piling on more Rival levers barely moves it (top 6 + ≤18: 58.0).
  The only levers that move the win rate further are Hoard (it lowers the player's score)
  and ±2 adjacency (a cliff: 69% → 32%).
- Scattering the leftover Stack into the Released Reserve (d) helps less than a capped
  flip; the player draws half of it.

### Recommended change (proposal; not applied)

**(c) top 4 + Ravening at Source ≤12, flip 2, burn 1.** In rules terms:

1. *Ravening (replaces §6).* From the start of the Rival's turn on which the Source holds
   12 or fewer cards, the Rival flips **2** cards each turn instead of 1, each through the
   keep test. It still Tithes once and Burns once. If its Stack runs out, it simply skips
   the Flip.
2. *The Drought (amends §7).* The moment the Drought begins, flip the top **4** cards of
   the Rival's remaining Stack through the keep test; kept cards join its row. Then remove
   the rest of the Stack from the game.

Result at normal pace: Rival 56.2 (29–85), player win 69%. Slow 53%, fast 70%. Pace spread
+8 (was +36). Upkeep cost: a second flip in the last few turns and up to 4 flips at the
Drought, all forced, with no new decisions.

Caveats: the Rival mean sits just above the 35–55 band because the win-rate target is
measured against the proxy (~72). If real v3.2 books come in nearer the draft's 35–55, top
2–3 and Source ≤10 would be the starting point instead. The three pace profiles are a
crude stand-in for a human choosing the Drought's timing.

### Difficulty table, re-derived from levers (no multipliers)

| Level | Rule | Rival normal (p10–p90) | Player win slow / normal / fast |
|---|---|---|---|
| Apprentice | Ravening at Source ≤12, flip 2 — **no Drought flip** | 40.2 (16–65) | 53% / 81% / 84% |
| Adept (standard) | Apprentice **+ Drought flip, top 4** | 56.2 (29–85) | 53% / 69% / 70% |
| Archmage | Adept **+ Hoard** (tithed cards go under the Rival, never return, +1 each) | 53.7 (33–77) | 35% / 54% / 55% |

- The steps are about 15 win-rate points apart. Apprentice keeps the old pace lesson
  (rushing pays), which suits a teaching level.
- ±2 adjacency is too steep for a standard level (32%). Keep it as an optional "Grand
  Archmage" challenge.
- The draft's ×0.75 multiplier, the wilds-in-Stack Archmage and Hasten are all dropped.
  Hasten weakens the Rival, and the wilds-in-Stack Archmage did not raise difficulty
  (Stage 1).
