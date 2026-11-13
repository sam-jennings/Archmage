---
title: Archmage Ascension — Rules Summary
type: reference
updated: 2026-11-13
---

# Archmage Ascension — Rules Summary (for game implementation)

Implements rulebook **v3.2** (2-player). Source of truth: `rulebook/Archmage Ascension - Complete Rulebook.md`.

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
3. **Enchantment** — 3-4 same value, different suits (max 4 components at 2-4 players). Always active. 3-card = +1 counter (scores 4). 4-card = +3 counters (scores 10).
4. **Perfect Transmutation** — 3+ consecutive values, all same suit. Cast: BOTH conjuration + transfiguration effects.

**Wilds (flexible):** a wild never declares an energy. In a sequence (Transfiguration, Perfect Transmutation) it declares only a number, when the spell is learned; that number stays fixed while the spell exists (Empower keeps it) and is declared again only when the spell is rebuilt by Reshape. In a Conjuration or Enchantment a wild declares nothing — it takes the spell's energy or value. (The build picks the lowest valid number automatically; the player cannot choose it yet.)

## Turn (Normal)
1. **Collection**: draw 1 from Source OR take 1 from Array (replace from Source)
2. **Casting**: cast up to (counter count) spells. Place counter on each. Resolve effects immediately. Each spell once per turn. A Conjuration is castable only if the Source holds its full draw; a Perfect Transmutation only if it holds the draw plus the Array refill. No spell half-resolves.
3. **Recall**: pick all counters back up
4. **Learning**: spend counters. Actions: LEARN (place new spell), EMPOWER (add cards: extend a spell, grow an Enchantment to the next size, or convert one spell type to another — including into or out of an Enchantment), RESHAPE (rebuild — 1 counter per spell broken), UNLEARN (return 1+ components from one spell; partial OK; returned components may be learned again the same turn). 1 counter each.

**Enchantment capacity timing:** gains (learning, growing or converting into an Enchantment) apply from the start of your next turn; losses (making one smaller, taking it apart, or converting it into another type) apply immediately, and you can't make the loss unless you can pay the action + absorb the loss now.

## The Drought
- Triggers the instant the Source empties — on a Collection draw, a Conjuration draw, or an Array refill (Collection or Transfiguration exchange). The current choice/effect finishes first.
- Array + Reserve shuffle into **Released Reserve**
- If it happens mid-Casting: cast nothing more, Recall, go straight to Learning.
- Modified turn: Collection (1 from Reserve) → Learning. NO casting.
- Game ends when Reserve depletes. (The build lets the player who draws the last card finish that turn's Learning; the rulebook's "immediately ends" is ambiguous on this — see decision `2026-07-06-f5-game-end-procedure.md`.)

## Scoring (Recognition Points)
| Size | Conj | Trans | PerfT | Ench |
|------|------|-------|-------|------|
| 3    | 0    | 3     | 5     | 4    |
| 4    | 1    | 4     | 11    | 10   |
| 5    | 2    | 5     | 18    | —    |
| 6    | 3    | 7     | 24    | —    |
| 7    | 7    | 8     | 31    | —    |
| 8+   | (continues; scale up to 15 — see `rulebook/Scoring System Reference.md`) |

Tiebreaker: most spells → most cards in largest spell.

## UI Phases
1. Title screen
2. Opening (each player discards 1)
3. Main loop (collection → casting → recall → learning, alternating)
4. Drought (collection → learning)
5. Final evaluation / scoring screen

## Tests
`npm test` (Node's built-in runner) — `tests/rules-v3-2.test.mjs` covers the v3.2 rules above.
