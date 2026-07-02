---
title: Deck Simulation Rig — Model Assumptions
type: reference
created: 2026-07-02
relates_to:
  - "[[Archmage Ascension - Complete Rulebook]]"
  - "[[STATE]]"
---

# Deck Simulation Rig — Model Assumptions

`archmage_deck_sim.py` models a full game per trial: deal → binding discard → turns
(Collection / Casting / Learning) → Drought → Released Reserve depletion. Everything
below is what the model does and does not capture. Sanity-check the strategy section
against real play before trusting completion-rate numbers to the percentage point —
relative comparisons between configurations are far more robust than absolute values.

## Rules modelled (from Rulebook v2.8 + the STATE.md parked ladder)

- 7-card opening hand, 5-card Array, 1-card binding discard per player before turn 1.
- Collection: take 1 from Array (replaced from Source) or draw 1 blind — either way
  the Source shrinks by exactly 1, so the Array choice never changes pacing.
- Conjuration cast: +1 draw (3–5 cards) / +2 draws (6+). Cast once per turn per spell,
  casts limited by counters (all spells with UC).
- Enchantment ladder **as proposed, not as printed**: 3-card = +1 counter,
  4-card = +2 counters total (tunable to +3), 5-card = Unlimited Capacity.
  Max one card per energy *in the deck being used*; a wild is declared as an in-deck
  energy, so a 4-energy deck caps at tier 4 and can never produce UC.
  The Live baseline rows are also run under this ladder so that deck effects are
  isolated from the (separately decided) ladder change.
- Capacity: start 1 counter; counters gate casts and learning actions per turn;
  Recall means casting does not consume learning capacity.
- Drought: triggers the instant the Source empties; Array + Reserve shuffle into the
  Released Reserve; 1 draw + learning only (no casting); last Released card drawn →
  that player finishes their learning, then the game ends.
- Optional `--uc-drought-cap N` limits a UC player's Drought learning actions
  (STATE.md's "Unlimited with Drought cap" lever). Default: uncapped.

## Player strategy (the part that drives all completion rates)

Every player runs the same greedy set-collector heuristic:

1. **Collection** — take an Array card only if it clearly helps: it's a wild, it fills
   an empower slot on a book enchantment, or it gives a 3rd distinct energy to a value
   pair in hand. Otherwise draw blind from the Source.
2. **Casting** — always cast every conjuration allowed (free card advantage), biggest
   first.
3. **Learning priority** — empower an enchantment (natural card first) → learn a new
   enchantment (formed with all distinct energies available at its value) → learn a
   conjuration → grow a conjuration to 6+ (only when the +2 draw upgrade is reachable).
4. **Enchantment/conjuration competition** — cards are "reserved" for enchantment work
   when their value has 2+ distinct energies in hand or matches a book enchantment;
   conjurations are built only from unreserved cards. This is the interaction effect
   that makes Monte Carlo necessary.
5. **Wilds** — hoarded; spent only to fill an enchantment's 4th or 5th slot, or (during
   the Drought only) to complete a 3rd. Never discarded at binding.
6. **Binding discard** — each player discards their lowest-heuristic-value card.

## Known simplifications

- **Transfiguration and Perfect Transmutation are not pursued.** They mainly affect
  pacing (each cast pulls 1 extra Source card via the Array refill) and score, not the
  matched-value/suit-count questions this rig answers. Pre-drought pace is therefore a
  slight *overestimate* (real games with active transfigurers hit Drought a bit sooner),
  equally biased across all configurations.
- **No Reshape/Unlearn** — the agent never restructures, so uptake numbers are mildly
  conservative everywhere.
- **No scoring / no opponent-aware play** — players don't hate-draft the Array or race
  each other; they optimise their own book only.
- **All players identical** — no skill spread.
- "Draws" = cards added to hand after the initial deal (Collection + conjuration
  bonuses + Drought draws). The opening 7 are not counted as draws.

## Verification performed

- Opening-hand conjuration probability cross-checked against an exact closed-form
  hypergeometric calculation (`exact-check` subcommand) — matches within Monte Carlo
  noise for every deck.
- Same seed → byte-identical output (single `random.Random(seed)` drives everything).
- Option 2 at 2–4p uses the literal Live deck config, run at a different seed, as the
  regression check.

## Extending the rig

Deck shape lives in `DeckConfig`, every rule/tunable in `Rules`, strategy in the
`Game._try_*` / `_card_score` methods. New questions (rank-range changes, hand size,
different ladders, alternative strategies) are parameter changes or one new method —
not a rewrite.
