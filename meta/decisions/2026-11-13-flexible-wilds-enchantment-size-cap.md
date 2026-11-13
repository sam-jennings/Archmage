---
title: Flexible wilds — declare only a number, only in sequences; Enchantment max 4 at 2–4p
type: decision
date: 2026-11-13
status: proposed
---

# 2026-11-13 — Flexible wilds; Enchantment size cap by player count

Source: DM thread with Sam, 2026-11-13 (answer to review brief 2,
`meta/review-briefs-2026-11.md`). Sam: "In a 2-4p game, enchantments can still be max
size 4. I think this would be obvious to most players and doesn't need a detailed
explanation. So no need to declare wilds in enchantments. Decided."

**Status note:** decided by Sam. Held as `proposed` only because the rulebook is under
test as v3.1 (`2026-07-09-v3-1-scoring-economy-bump.md`, status `experiment`): the
rulebook text changes in the rulebook pass after the v3.1 confirm/kill, so the v3.0
rollback stays clean. Gameplay at 2–4p is unchanged (the 4-card ceiling is the same),
so the confirm/kill session is not affected. Flip to `canon` when the text lands.

**Supersedes** the wild-declaration-scope rulings of
`2026-07-06-f6-wild-scope-and-max-size.md` (declare energy + value in all spell types;
deck-present energies only). F6's max-spell-size-15 ruling stands.

## Decision

- **A wild is whatever the spell needs.** No energy is ever declared.
- **Only in sequences** (Transfiguration, Perfect Transmutation) does a wild declare its
  **number**, fixed while that spell exists; it is declared again if the spell is
  broken down and rebuilt. Empowering does not redeclare it.
- **Conjuration and Enchantment:** nothing is declared. The wild takes the spell's
  energy (Conjuration) or number (Enchantment).
- **Enchantment size cap by player count:** 2–4 players **max 4 components**;
  5–6 players (Echo deck) **max 5**. Stated plainly, no deck-composition explanation.
  This replaces the "a wild can only be a deck-present energy" mechanism that kept the
  5-card Enchantment out of 2–4p games.

## Why

Simpler to teach: the declaration exists only where the number actually changes what
the spell is. The 2–4p ceiling is kept by a visible size limit instead of an indirect
rule about energies.

## Canon delta

Applied to `meta/canon.yml` this turn:
- `wild_rule` rewritten to the flexible form (pending rulebook text).
- `enchantment_ladder` annotation: 5-card tier is 5–6p only **by size cap** (2–4p max 4).

## Propagation

- [x] `meta/canon.yml` — wild_rule + enchantment_ladder annotation (2026-11-13)
- [x] `2026-07-06-f6-wild-scope-and-max-size.md` — supersession banner on the wild-scope
  rulings; its two open wild-wording items moved here (2026-11-13)
- [x] `meta/review-briefs-2026-11.md` — brief 2 marked decided (2026-11-13)
- [ ] `meta/QUEUE.md` — the F6 wild-wording P1 retargeted to this decision, demoted to
  the post-confirm/kill rulebook pass
- [ ] Complete Rulebook — Components (wild cards) + each spell type: replace the
  Enchantment-only "Wild-declaration rule" with the flexible rule; add "max 4 components
  at 2–4 players, max 5 at 5–6 players" to Enchantment requirements (after v3.1
  confirm/kill)
- [ ] `rulebook/Scoring System Reference.md`, `rulebook/GLOSSARY.md` — wild / Enchantment
  wording, if they carry the old declaration rule
- [ ] `web-apps/archmage-reference.html`, `web-apps/player-reference.html`, the v2 player
  site rules pages, and the hand checker (`tests/hand-checker/`) — wild handling and the
  2–4p Enchantment cap
- [ ] Board / reference card text, next time they are regenerated (F14 export hold applies)
