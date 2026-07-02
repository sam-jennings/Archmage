# Fifth Suit — Analytical Effects
*Written 2026-07-02. Supports the parked Stage 4+ fifth-suit decision (see STATE.md "Not doing yet"). Model: exact hypergeometric/DP calculations on deck compositions; wilds, Array selection, and conjuration bonus draws excluded (they affect all configs roughly uniformly — see Caveats).*

## Configurations compared

| Config | Deck | Source @5p | Turns/player @5p | Turns/player @7p |
|---|---|---|---|---|
| Current 5–7p: 4 suits × 20 ranks + 4w | 84 | 39 | 7.8 | 3.3 |
| Fifth suit, keep ranks: 5 × 20 + 4w | 104 | 59 | 11.8 | 6.1 |
| **Fifth suit, same size: 5 × 16 + 4w** | **84** | **39** | **7.8** | **3.3** |
| Fifth suit: 5 × 15 + 4w | 79 | 34 | 6.8 | 2.6 |
| Fifth suit: 5 × 18 + 4w | 94 | 49 | 9.8 | 4.7 |

Source = deck − 7×players (hands) − 5 (Array) − players (binding). Turns/player is an upper bound — conjuration bonus draws shorten it.

## Finding 1 — Naive fifth suit (5×20) breaks pacing

+20 cards = +51% turns per player at 5p (7.8 → 11.8). That pushes a 5p game well past the 30–60 min target. **The elegant move is to trade ranks for suits: 5 × 16 = 80 + 4w = 84 — identical deck size, identical pacing.**

## Finding 2 — Acquisition gains come mostly from rank compression, not the suit itself

| Config | P(pair in opening 7) | P(triple in opening 7) | P(3rd copy in next 10 personal draws, holding a pair) |
|---|---|---|---|
| Current 4×20 | 0.600 | 0.033 | 0.257 |
| 5×20 | 0.622 | 0.041 | 0.292 |
| **5×16** | **0.719** | **0.063** | **0.362** |

Adding the suit alone (+1 out per value) improves the 3-card chase by ~14%. Compressing 20 → 16 ranks improves it by ~41% and nearly doubles opening triples. If the goal is enchantment accessibility, the rank count is the bigger lever — which also means **a cheaper experiment exists without any fifth suit: run 5–7p on 4×15 or a 4×16-ish deck and see if acquisition alone fixes uptake** (4×15's pair/triple odds: 0.727 / 0.058 — nearly identical to 5×16).

## Finding 3 — The fifth suit roughly doubles 4-card completion → makes the Drought problem worse without the ladder

With 4 suits, completing a 4-card enchantment from 3 needs the *exact* missing energy (1 out). With 5 suits it needs *any* of 2 remaining energies:

| Holding 3 of a value, P(complete 4th) in 10 personal draws | |
|---|---|
| Current 4×20 (1 out) | 0.137 |
| 5×16 (2 outs) | 0.257 (≈1.9×) |

Under current rules (4 cards = Unlimited Capacity), the fifth suit would make UC substantially more common at the Drought. **The fifth suit is only safe with the ladder: 3 = +1 counter, 4 = +2, 5 = Unlimited (Drought-capped).** Conveniently, a 5-card enchantment (all 5 energies, 1 out at the end: P = 0.137 over 10 draws) has *exactly* the structural difficulty of today's 4-card — the pinnacle stays as hard as it is now, and the mid tiers become genuine strategy.

## Finding 4 — The cost: conjuration and Perfect Transmutation get harder

P(3+ cards of one energy in opening 7): 0.827 (4 suits) → 0.640 (any 5-suit config). Suit dilution is ~−19pp regardless of rank count. Same-energy runs (PT) are hit hardest. Expect the meta to shift away from conjuration — which Opus already flagged as under-scored. A conjuration scoring buff likely rides along with the fifth suit. Transfiguration is roughly neutral: fewer ranks makes sequences slightly denser/easier, offsetting nothing it lost.

## Finding 5 — 7-player is already broken without the fifth suit

Current 4×20 gives 3.3 turns/player at 7p (before conjuration draws shorten it further). That's not a game. Options: (a) 5×18 = 94 cards → 4.7 turns/player at 7p, 9.8 at 5p (long); (b) 5×20 → 6.1 at 7p but 11.8 at 5p; (c) declare the game 2–6p. **No single deck serves both 5p pacing and 7p viability — if 7p support is real, it probably needs its own deck spec, and the fifth suit is the natural vehicle.**

## Recommendation (unchanged: Stage 4+, not now)

- If/when adopted: **5 × 16 + 4 wilds for 5–6p** (same pacing as today, big acquisition gain), ladder mandatory, conjuration score buff likely needed, 7p gets its own spec or is dropped.
- Before then: the current test cycle (round-trip counters + capacity levers) proceeds on the 4-suit deck. If uptake is still low at 5p after the structural fixes, test **rank compression alone (4×15 for 5p)** before reaching for the fifth suit — it delivers most of the acquisition benefit with zero new content.

## Caveats

- Wilds excluded (2 or 4). They disproportionately help enchantments in all configs; ignoring them understates uptake uniformly.
- Array selection excluded — players choose from 5 face-up cards, which raises all chase probabilities; relative comparisons hold.
- Conjuration bonus draws excluded — they shorten games ~20–40% in all configs; the pacing *ratios* between configs hold.
- "Personal draws" model: you access ~1 card/turn; competition from other players is implicit in the unseen-deck denominator.
