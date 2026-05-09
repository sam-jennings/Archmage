# Archmage Ascension — Rules Summary (for game implementation)

## Setup (2-player)
- Deck: 4 suits × values 1-15 = 60 cards + 2 wilds = **62 cards**
- Suits: Radiance, Void, Flux, Aether
- Deal 7 cards each
- Place 5 face-up = **The Array**
- Remaining face-down = **The Source**
- Each player starts with **1 counter**
- **The Opening**: each player simultaneously discards 1 card to **Arcane Reserve**

## Spell Types
1. **Conjuration** — 3+ same suit, any values. Cast: draw +1 (3-5 cards) / +2 (6+) from Source.
2. **Transfiguration** — 3+ consecutive values, any suits. Cast: discard 2→take 1 from Array (3 cards) / discard 1→take 1 (4+).
3. **Enchantment** — 3-4 same value, different suits. Always active. 3-card = +1 counter. 4-card = unlimited capacity.
4. **Perfect Transmutation** — 3+ consecutive values, all same suit. Cast: BOTH conjuration + transfiguration effects.

## Turn (Normal)
1. **Collection**: draw 1 from Source OR take 1 from Array (replace from Source)
2. **Casting**: cast up to (counter count) spells. Place counter on each. Resolve effects immediately. Each spell once per turn.
3. **Recall**: pick all counters back up
4. **Learning**: spend counters. Actions: LEARN (place new spell), EMPOWER (add cards to existing), RESHAPE (rebuild any/all), UNLEARN (return spell to hand). 1 counter each. Unlimited = no cost.

## The Drought
- Triggers when Source empties
- Array + Reserve shuffle into **Released Reserve**
- Modified turn: Collection (1 from Reserve) → Learning. NO casting.
- Game ends when Reserve depletes.

## Scoring (Recognition Points)
| Size | Conj | Trans | PerfT | Ench |
|------|------|-------|-------|------|
| 3    | 3    | 5     | 7     | 6    |
| 4    | 4    | 7     | 10    | 15   |
| 5    | 6    | 10    | 14    | —    |
| 6    | 9    | 14    | 19    | —    |
| 7    | 13   | 19    | 25    | —    |
| 8+   | (continues; scale up to 15) |

Tiebreaker: most spells → most cards in largest spell.

## UI Phases
1. Title screen
2. Opening (each player discards 1)
3. Main loop (collection → casting → recall → learning, alternating)
4. Drought (collection → learning)
5. Final evaluation / scoring screen
