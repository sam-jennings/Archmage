---
title: F6 — Max spell size 15; wild declaration scope (all spell types, fixed)
type: decision
date: 2026-07-06
status: proposed
---

# 2026-07-06 — F6 Wild scope and maximum spell size

Source: `_review/ARCHMAGE_SAM_DECISIONS_F3_F14_2026-07.md`, §F6 + Unlimited Capacity ruling.

**Reverses the Decision Register's prior F6 recommendation** (which was: extend the
Conjuration score table to 16–17). Sam's decision caps configuration size at **15**.

## Decision

- **Maximum spell / configuration size is 15.** Do **not** extend Conjuration scoring to
  16 or 17. The score table remains capped at 15. Wilds may substitute inside valid
  configurations but cannot push a spell beyond the natural 1–15 rank span.
- **Wild declaration scope (all spell types):**
  - A wild is declared (energy + value) when it becomes part of a learned spell.
  - The declaration is **fixed while that spell exists**.
  - Empowering a spell does **not** let you redeclare existing wilds.
  - If a spell is dissolved and later rebuilt, its wilds are declared again as part of
    the new spell.
  - A wild may only be declared as an energy **present in the current deck**. It cannot
    represent an extra, unavailable energy.

## Unlimited Capacity availability (coupled ruling)

> **SUPERSEDED (2026-07-09, v3.1) — this UC-availability clause only.** The **v3.1 scoring
> & economy bump** (`meta/decisions/2026-07-09-v3-1-scoring-economy-bump.md`) **removes
> Unlimited Capacity entirely.** The 5-component Enchantment no longer grants UC; it now
> grants a finite **+5 counters (score 16)** on the v3.1 ladder. It **remains 5–6p / Echo
> only** for the same deck-composition reason given below — a wild can only stand for an
> energy present in the current deck, so a five-distinct-energy Enchantment is only
> reachable once a fifth energy (Echo) exists. (The `meta/canon.yml enchantment_ladder`
> annotation was updated to the v3.1 form in the bump's Task 13.)
>
> **F6's other rulings STAND, unchanged and NOT superseded:** the **maximum-spell-size-15**
> ruling (no 16–17 Conjuration column) and the **wild-declaration-scope** rulings (below)
> are unaffected by v3.1 — only this Unlimited-Capacity-availability clause is superseded.

Because a wild can only be a deck-present energy, a **5-component Enchantment** (five
matching values across five distinct legal energies) is only reachable when a fifth
energy exists — i.e. **5–6p / Echo only**. In 2–4p (four energies) the ceiling is a
4-component Enchantment; Unlimited Capacity is **not** reachable at 2–4p under this rule.

Kept as 5–6p-only **for now**, flagged as an open design question for playtests: do 2–4p
players feel denied a promised top tier? Any rulebook example showing a 2–4p player
reaching a 5-card Enchantment / Unlimited Capacity is **stale** and must be deleted or
marked 5–6p-only (folded into the propagation below).

## Canon delta

Applied to `meta/canon.yml` this turn:
- `wild_rule` expanded: declaration required in all spell types, fixed while the spell
  exists, redeclared only on rebuild, deck-present energies only.
- `max_spell_size: 15` added.
- `enchantment_ladder` annotated: 5-card Enchantment / Unlimited Capacity is 5–6p-only.

## Propagation

- [x] `meta/canon.yml` — wild_rule scope, max_spell_size, UC-is-5–6p note (2026-07-06)
- [x] `_review/DECISION_REGISTER_2026-07.md` F6 reframed (cap 15, no 16–17) (2026-07-06)
- [x] `meta/QUEUE.md` — score-table P1 re-reframed from "extend to 16–17" to "confirm cap 15" (2026-07-06)
- [ ] Rulebook Components / Wild Cards — move wild-declaration rule out of Enchantment-only, add one example per spell type (Conjuration / Transfiguration / Enchantment / Perfect Transmutation)
- [ ] Rulebook — delete/mark-5–6p-only any 2–4p example reaching a 5-card Enchantment / UC
- [ ] Scoring System Reference — confirm max size 15 (no 16–17 column)
- [ ] `web-apps/archmage-reference.html` — wild scope wording (covers sizes 3–15)

Per-spell-type example wording is recorded in the source addendum, §F6.
