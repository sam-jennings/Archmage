---
title: Array Attunement — Collection-phase Array take requires a built Transfiguration
type: decision
date: 2026-07-17
status: proposed
---

# 2026-07-17 — Array Attunement (TF-gated Array access)

Source: conversation 2026-07-17. Sam explored "Array only via Transfiguration, no
standard collection take"; the pure version was rejected (bootstrap paradox,
enchantment-uptake suppression, dead early Array, punitive card-negative sole channel).
Sam pre-committed to the recommended middle-ground pending test ("I will go with your
recommendation") but is explicitly **less certain of this than the rest of v3.1** — keep
it separately revertible and OUT of the v3.1 confirm/kill baseline.

## Decision

**Rule (one sentence):** During the Collection Phase you may take from the Array (free,
refill from Source) **only if you have at least one Transfiguration or Perfect
Transmutation in your Spellbook**; otherwise you must draw from the Source.

- TF/PT **cast** effects (exchange rates) are unchanged.
- Attunement is checked at the moment of taking; losing your last TF/PT (Reshape,
  Unlearn, conversion) removes it immediately.
- Theme: the Array is the Academy's stable framework *for* transformations — a wizard
  must demonstrate transformation mastery to use its regulated channel.

## Alternatives considered

- **Pure TF-only Array** (original idea): rejected — see Source above.
- **Priced take** (Array take costs discard 1, everyone): keeps universal access but
  taxes the game's most intuitive action and shifts the whole hand economy under an
  under-test v3.1.
- **Priced take + TF exchange buff**: two knobs at once; re-inflates TF utility right
  after v3.1 cut its score column.
- **TF exchange buff only** (e.g. 4+: take 2 discard 1): no gate, doesn't make TF get
  built during play, risks re-inflation.
- **Chosen — Attunement license**: one sentence of rules; makes a small TF worth
  building early (the actual P1 problem — "TF is never built during play"); once
  attuned the game plays exactly as today, so v3.1's economy analysis stays valid;
  softest bootstrap (a 3-run from 7 starting cards + blind draws is reachable in a few
  turns); trivially revertible.

Known costs to watch: a passive effect on a castable spell blurs the Enchantment
identity ("always active" is the Enchantment category); pre-attunement turns are
blind-draw only — watch early-game feel and enchantment uptake before first TF.

## Test plan (gates adoption)

Do **NOT** fold into the v3.1 confirm/kill baseline — TF viability is a v3.1 confirm
criterion and must be read unconfounded. Sequence:

1. Play the v3.1 confirm/kill session **clean** (current rules).
2. Flip this rule for the second half of that session, or a follow-on session.

**CONFIRM** if players build a TF during play (not only as an end-game Reshape target),
pre-attunement turns don't feel stalled, and enchantment uptake isn't suppressed.
**KILL** if openings feel luck-locked, the license reads as a token toll with no
strategic content, or teaching cost exceeds benefit.

## Canon delta

None yet — nothing applied. Adoption is a rulebook version bump under §3a (archive
pre-edit copies, bump `version:`, update `canon.yml` rulebook_version) and flips this
decision to `experiment`/`canon` per outcome.

## Propagation (on adoption only — do not tick before the rule is applied)

- [ ] `rulebook/Archmage Ascension - Complete Rulebook.md` — Collection Phase, The
      Array component description, Transfiguration "what it represents" note
- [ ] `rulebook/GLOSSARY.md` — Array entry (+ Attunement wording if the term is used)
- [ ] `web-apps/archmage-reference.html` — Collection-phase text
- [ ] Printed reference card — fold into the pending legibility redesign
      (rules-and-teaching); F14 export hold still applies
- [ ] `Playtest Guide - New Player Session.md` — collection teaching script
- [ ] `meta/canon.yml` — version bump per §3a
