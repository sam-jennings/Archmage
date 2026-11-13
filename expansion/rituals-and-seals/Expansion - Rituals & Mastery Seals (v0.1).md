---
title: Expansion - Rituals & Mastery Seals (v0.1)
type: expansion-ruleset
status: shelf-ready-untested
version: 0.1
created: 2026-07-16
salvaged_from: "[[old-expansion-thread-review]] §2d"
relates_to:
  - "[[EXPANSION_INDEX]]"
  - "[[Expansion - The Schools (v0.1)]]"
  - "[[Expansion - The Last Rites (v0.1)]]"
  - "[[Archmage Ascension - Complete Rulebook]]"
---

# Rituals & Mastery Seals — v0.1 Rules

*A School is how you were trained. A Seal is what you have become.*

Public **Rituals** — structural feats of Spellbook-building — grant persistent **Seals**: small always-on rules lenses that last exactly as long as the structure that earned them stands. Some Seals are **external** (they die with the Source); some are **internal** (they persist into the Drought). Modular, opt-in, non-exclusive: this is a personal mastery arc, not a race.

> **Status:** shelf-ready on paper, untested. Direct answer to the Session-4 strategic-depth brief (depth through expansions, base loop stays light).

## Fit: why its own module

Considered and rejected as a fold-in:

- **Into The Schools** — wrong axis. Schools are *dealt* identity (who you are at minute one); Seals are *earned* identity (what you become by playing). Merging doubles Schools' already-dominant dev cost (asymmetry balance) and blurs the one thing each does cleanly. They are natural **siblings** — same box family, strong cross-sell — not one module.
- **Into Overtones** — Overtones is "feat → claim a scarce scoring card" (exclusive, vertical, spends 16+). Rituals is "feat → hold a personal ability" (non-exclusive, horizontal, spends nothing). Same trigger grammar, opposite rewards; merging conflates prestige with mastery and drags scoring into a module that must not score.
- **Into Last Rites / Trials** — Rites spend structure at the end; Seals *hold* structure throughout; Trials owns evaluation and Seals never score. Adjacent, no overlap.

**Throughline owned: the mastery arc — earned in-game identity.** It is also the only module in the line that deepens the **Learning phase** itself. The internal/external Drought-persistence split (salvaged from the old thread) is a lever no other module uses.

## Design rules (binding on every Ritual, present and future)

1. **Seals never score.** No RP, no leans (Schools' device), no evaluation contact. Seals are rules lenses only.
2. **No Seal touches counters, capacity, or the number of learning/casting actions** (the protected economy — same as Schools rule 1).
3. **Suit-agnostic, count-agnostic wording** (the standing compatibility rule). Conditions that reference breadth are written self-scaling: *"all but one of the energies in the deck"* — 3-of-4 at 2–4p, 4-of-5 with Echo — never a number that means something different at five suits.
4. **No condition or effect uses values 16+** (Overtones' reserved space) or frequency bands (Spell Duels Tier 3's device).
5. **No Seal duplicates or strictly upgrades a School talent.** Checked line-by-line against the Schools v0.1 roster on every roster change.
6. **The cost is the structure.** A Seal is active only while its qualifying structure stands in your Spellbook. No claim fee, no banish (Last Rites' signature), no discard.

---

## Components

- 6 **Ritual cards** (face-up reference row).
- 36 **Seal chits** (6 designs × 6), double-sided: bright face = active, dark face = dormant.

## Setup

Place the 6 Ritual cards face-up beside the Array. They are live from turn one and public all game — like the Last Rites row, the visibility *is* the expansion: players shape what they build toward the Seals they want.

## Claiming, holding, and losing a Seal

- **Claim:** during your **Learning phase**, if your Spellbook satisfies a Ritual's condition, take its Seal chit and place it on (one of) the qualifying spell(s). No action cost (design rule 2), no limit per turn.
- **Non-exclusive:** any number of players may hold the same Seal.
- **Cap: max 2 active Seals per player** (**1** while any player-dynamic module — Null Cabal, future co-op — is active; combination governance rule 2 in [[EXPANSION_INDEX]]).
- **Integrity:** if the qualifying structure stops satisfying the condition (Reshape, Unlearn, Sundering, anything), flip the Seal dark — **dormant** — the moment it happens. Re-satisfy the condition on a later Learning phase to flip it back. Seals are never returned; only sleep.
- **Checkable at a glance:** the chit sits on the qualifying spell; anyone can verify the condition against that spell right now.

---

## The six Rituals

### External Seals — *"if the rule's object no longer exists, the Seal sleeps"* (dormant in the Drought)

| Ritual (condition, held in your Spellbook) | Seal (always on while held) |
|---|---|
| **The Unbroken Run** — one spell containing a sequence of 5+ consecutive values | **Seal of Continuity:** once per turn, before your Collection pick, you may return 1 card from hand to the **bottom of the Source**. *(Hand hygiene; clock-neutral by construction.)* |
| **The Spanning Arc** — one spell containing all but one of the energies in the deck | **Seal of Breadth:** when you cast a Transfiguration, you may claim from the **top of the Arcane Reserve** instead of the Array (the Array is untouched; nothing refills). *(Recycling spent magic — see B5 for the clock note.)* |
| **The Twin Pillars** — two spells of equal size (4+ components each) sharing no energy | **Seal of Symmetry:** once per turn, when you draw blind from the Source, you may reveal the card, return it to the **bottom**, and draw once more (keep the second, no further choice). |

### Internal Seals — persist into the Drought (always on, both acts)

| Ritual (condition) | Seal |
|---|---|
| **The Inward Turn** — 2+ Enchantments in your Spellbook | **Seal of the Inner Flame:** once per turn, before any blind draw (Source; Released Reserve in the Drought), you may peek at the top card. If you decline it, bury it at the bottom and draw the next blind. *(Max one draw-modifier per draw across all modules.)* |
| **The Threefold Voice** — a matched set of 3+ components of one value in one spell | **Seal of the Held Note:** when a cost or effect (any module) makes you discard from hand, you choose the destination pile's **top or bottom**. *(The internal cousin of the Gravewright talent — see B4.)* |
| **The Great Work** — one spell of 7+ components | **Seal of Magnitude:** when you Reshape, you may move the component between **any** two of your spells regardless of adjacency or position restrictions, provided both spells remain valid. ⚠ *wording must be verified against the v3.1 Reshape rule before printing.* |

**Trials riders:** none. Seals never contribute to domains, powers, or ties (design rule 1). One line on the box card: *"Seals are invisible to the Trials."*

---

## Iteration log — bugs found and fixed before v0.1

- **B1 — RP-granting Seals cut.** The old thread let Seals shade into mini-leans. Scoring is owned (base evaluation + Trials; leans are Schools' device). **Fix:** design rule 1; every effect re-expressed as a rules lens.
- **B2 — Claim costs re-coupled to the protected economy.** "Claiming a Seal costs a Learning action" (old thread) taxes low-capacity players exactly like Last Rites B2. A discard-to-Reserve fee instead touched the Drought clock. **Fix:** the structure *is* the cost (design rule 6) — holding shape you'd otherwise optimize away is a real, ongoing payment and the module's central tension.
- **B3 — First-come exclusivity duplicated the line's other arcs.** An exclusive Seal row is a public race — that's Overtones' arc (and Last Rites' endgame compression). **Fix:** non-exclusive; the module owns the *personal* arc.
- **B4 — Two Seals collided with School talents.** A draw-2-keep-1 Seal strictly shadowed the Archivists; a Reserve-placement Seal duplicated the Gravewrights. **Fix:** design rule 5; Symmetry became a costed reveal-and-redraw (weaker, different decision), Held Note became *defensive* placement (your forced discards, any pile) where Gravewrights control their *voluntary* Reserve traffic. Residual overlap flagged as the pairing's watch item.
- **B5 — Seal of Breadth eats the future Drought.** Each use removes one card from the Arcane Reserve → a marginally shorter Drought. Bounded (once per Transfiguration, one card each), but it is the module's only clock contact. **Accepted, flagged:** playtest measure — Reserve size at Drought start with/without an active Breadth player.
- **B6 — Band- and 16+-keyed conditions cut.** Early drafts used Low/Mid/High band feats (old thread's chassis). Bands are Spell Duels Tier 3's device and 16+ is Overtones' space. **Fix:** design rule 4; all conditions re-keyed to base pattern vocabulary (sequences, matched sets, spans, sizes).
- **B7 — Two Rituals cut for unverifiable rules contact.** "The Mirrored Work" (palindromic values) and "The Perfect Form" (condition keyed to casting a Perfect Transmutation) both depend on v3.1 pattern-legality and PT-resolution details not yet verified. **Parked** (below), not deleted — roster grows to 8 when the wording is checked.
- **B8 — Mid-turn integrity checking was fiddly.** "Flip the Seal the moment the structure breaks" is the rule, but opponents policing it mid-Reshape is noise. **Ruling:** integrity is self-reported at the moment of the change plus verified at evaluation; a Seal found dormant-in-fact at evaluation was dormant all along (no penalty — it just never applied). One sentence on the card.

### Parked Rituals (verify v3.1 wording, then develop)

- **The Mirrored Work** — a spell whose values read the same in both directions → a Reshape-flexibility seal.
- **The Perfect Form** — keyed to Perfect Transmutation resolution → a post-PT rebuild seal.

## Open questions (for the playtest)

- **Is holding structure a real cost?** If Spellbooks rarely restructure in practice, Seals are claim-once-keep-forever and rule 6 needs a fee after all. Measure: how often does a Seal actually go dormant?
- Is **2 active Seals** right, and does claiming produce Learning-phase AP?
- Does the public row shape early building (the design's promise), or do Seals get claimed incidentally?
- Seal of Breadth's clock contact (B5 measure).
- Do internal Seals make Enchantment investment (Inward Turn) feel *mandatory*?

## Scaling 2–6

Nothing scales. Conditions are self-scaling by wording (design rule 3); chit counts cover 6 players. At 5–6p the Spanning Arc asks for 4-of-5 energies — harder in absolute terms but on richer terrain; flagged for the 5p session, acceptable per the Convergence precedent in [[Expansion Directions - Post-Echo Exploration]].

## Cross-module notes

- **Schools:** the intended pairing (dealt identity + earned identity). Design rule 5 guards collisions; with both active, the *combined* cap is 2 (one School is fixed, so at most 2 Seals — unchanged) — revisit after testing.
- **Last Rites:** complementary by construction — Rites *spend* structure, Seals *hold* it, and the Drought becomes a three-way call: strip for Rites, hold for evaluation, or hold for internal Seals. Sundering a sealed spell flips its Seal dormant (structure gone). Binding a sealed spell is legal (markers are not changes).
- **Spell Duels / Null Cabal:** no rules contact. Cap drops to 1 Seal under Cabal (governance rule 2).
- **Trials:** invisible (rider above).
