---
title: Expansion - The Schools (v0.2)
type: expansion-ruleset
status: shelf-ready-untested
version: 0.2
created: 2026-07-02
updated: 2026-11-13
base_rules: rulebook v3.2
relates_to:
  - "[[Expansion Directions - Post-Echo Exploration]]"
  - "[[Archmage Ascension - Complete Rulebook]]"
  - "[[Ascension Trials]]"
  - "[[Expansion - The Last Rites (v0.1)]]"
---

# The Schools — v0.2 Rules

*No two wizards were trained the same way.*

Asymmetric player identities: each wizard is a graduate of a School, granting one always-on **Talent** and one endgame **Lean**. Modular, opt-in, one card per player.

> **Status (2026-11-13):** v0.2, refreshed on paper against **rulebook v3.2**. Untested. Being developed together with The Last Rites (Sam's pick, 2026-11-13); each module is tested alone first, then together. Neither rides on the first v3.2 base-game playtest.

## Changelog

- **v0.2 (2026-11-13)** — every card re-checked line by line against rulebook v3.2 (score table with the 3-card Conjuration at 0, Enchantment ladder +1/+3/+5 scoring 4/10/16 and size cap, next-turn capacity gains and the affordability gate, RESHAPE at one counter per spell, partial UNLEARN with same-turn re-learn, EMPOWER conversions, flexible wilds, Source-emptying timing, Echo deck at 5–6p).
  - **Rewritten Talents:** The Menders (their old talent is now the base rule), The Lucent Order (flexible wilds), The Gravewrights (the old talent did nothing: the Arcane Reserve is shuffled when the Drought begins).
  - **Re-priced Leans:** The Depthseekers (+2 per Conjuration of 6+, was +1 per Conjuration: a 3-card Conjuration now scores 0); The Lucent Order (capped at +4, because the 5–6p deck has more wilds).
  - **Clarified for v3.2:** Archivists, Harmonists and Depthseekers when the Source is nearly empty; Chronomancers when the Source runs dry mid-Casting; Harmonists' Lean ignores wilds (they have no energy); Talents that name a spell type do not cover Perfect Transmutation.
  - **New:** design rules 6–7, the "Interactions with The Last Rites" section, iteration-log entries C1–C9.
- **v0.1 (2026-07-02)** — first full ruleset; nine bugs fixed on paper (B1–B9 below). Byte-exact copy in `_archive/Expansion - The Schools (v0.1).md-v0.1-2026-11-13/`; history in git.

## Design rules (binding on every School, present and future)

1. **No Talent touches counters, capacity, or the number of learning/casting actions.** Talents modify *effects*, never the action economy. In v3.2 terms: no Talent changes the Enchantment ladder or the size cap (max 4 components at 2–4 players, 5 at 5–6), when gained capacity arrives (start of your next turn), the immediate capacity loss, the affordability gate ("cannot afford → blocked"), or what a learning action costs (RESHAPE stays one counter per spell broken down).
2. **No School names an energy.** (The standing compatibility rule: identical play at 2–4p without Echo and 5–6p with it.) Suit-agnostic wording only: "one energy of your choice," "each distinct energy," etc.
3. **Every Talent is checkable at a glance** — printed on the card, zero memory, no once-per-game tracking except where a physical marker is specified.
4. **Every Lean is flat arithmetic** — "+N RP per X," never percentages, never conditionals-on-conditionals.
5. **A Lean may not reward a resource any Last Rites card converts to points** (cross-module rule from [[Expansion Directions - Post-Echo Exploration]] Part 2 — currently: nothing may score cards-in-hand, which Rite of Ash owns).
6. **Spell types are read literally.** A Talent or Lean that names Conjuration or Transfiguration means that spell type only; a Perfect Transmutation is its own type and is not covered (even though its cast uses both effects).
7. **A Talent only changes what it says.** Every base rule still applies around it — castability (a spell you can't resolve in full can't be cast), the Source-emptying rule, wild numbers in sequences. Expansion governance rule 5 also applies: if two persistent effects (from any modules) could modify the same draw or exchange, the owner picks one.

---

## Components

- 8 **School cards** (talent + lean printed on each, plus the Drought line).
- 8 matching **reference strips** (optional; the card is the reference).

Plays on paper cards beside one printed base set; no new base components.

## Setup — the School market

After determining start player, before dealing hands:

1. Reveal **player count + 2** School cards as a face-up market (2p: 4 … 6p: all 8).
2. In **reverse turn order**, each player picks one School from the market.
3. Return the rest to the box. Your School is public all game.

*Why a market, not a deal:* dealing 2-keep-1 to each player needs 12 cards at 6p and gives no information about rivals' options; a public market of N+2 scales to every count with one rule, and picking in reverse turn order hands the compensation to the players who act last (see iteration log, bug B2).

---

## The eight Schools

| School | Talent (always on) | Lean (at evaluation) |
|---|---|---|
| **The Ashbinders** | When you cast a **3-component Transfiguration**, its exchange is **discard 1 → take 1** (as for 4+ components). | +1 RP per Transfiguration in your Spellbook. |
| **The Depthseekers** | When you cast a **Conjuration of 6+ components**, you **may draw 3** instead of 2. (Castable only if the Source holds the number you choose.) | **+2 RP per Conjuration of 6+ components** in your Spellbook. |
| **The Archivists** | When you draw from the Source in Collection, **draw 2, keep 1, return the other** to the top *or* bottom of the Source. If the Source holds only 1 card, draw it normally. | +2 RP if your Spellbook contains 4 or more spells (any type or size). |
| **The Chronomancers** | At the start of your turn you may **delay your Collection pick** until after your whole Casting phase (before Recall). If the Source runs dry during that Casting, your delayed pick becomes your Drought draw: 1 card from the Released Reserve. | +2 RP if your Spellbook contains a spell of 5+ components. |
| **The Menders** | When you **Unlearn**, you may **swap one returned component for one card in the Array** (yours goes into the Array, theirs into your hand; no refill). | +1 RP per distinct spell **type** in your Spellbook (max +4). |
| **The Harmonists** | Whenever the Array slot you took a card from is refilled (your Collection pick, or your Transfiguration / Perfect Transmutation exchange), **look at the top 2** of the Source, put one in the slot and return the other on top. If the Source holds only 1 card, refill normally. | +1 RP per distinct **energy** among the components in your Spellbook (max = number of energies in the deck). Wilds have no energy and don't count. |
| **The Lucent Order** | When you **Empower** and the spell is a sequence afterwards (Transfiguration or Perfect Transmutation), you **may declare its wilds' numbers again**. The spell must be valid afterwards. | **+2 RP per wild** in your Spellbook (**max +4**). |
| **The Gravewrights** | When the Drought begins, **before the shuffle**, look through the Arcane Reserve and **set one card aside** face down. Your next Collection draw is that card instead of a draw from the Released Reserve. | +2 RP if your largest spell is larger than every other player's largest spell (no tie; count actual components). |

**Drought line (printed on every card):** *if the rule's object no longer exists, the talent sleeps.* See "Drought handling" below for which talents sleep.

**Trials riders (only when playing with [[Ascension Trials]]):** each School card carries one line, e.g. Ashbinders — *win Transformation-trial ties*; Harmonists — *win Harmony-trial ties*; the rest analogous, always tie-breaking only, never power. *Not refreshed in v0.2: Ascension Trials is parked (F8); revisit when it resumes.*

---

## Rulings per School (v3.2)

- **Ashbinders.** Talent unchanged; v3.2 exchange rates are still "3 cards: discard 2 → take 1; 4+: discard 1 → take 1". Applies to Transfigurations only, not the exchange inside a Perfect Transmutation (design rule 6). The Array refill after the exchange may empty the Source — legal in v3.2; the Drought then begins and you cast nothing more this turn. Lean kept at +1: with a 3-card Transfiguration now scoring 3, +1 is a bigger share of a small Transfiguration than before, and that is intended — this School exists to make Transfigurations worth building, which is the v3.2 watch point.
- **Depthseekers.** "May" is new: if the Source holds exactly 2 cards, you can still cast the Conjuration for the base 2. Perfect Transmutation draws are not covered (rule 6). The extra card per cast speeds up the Source a little — a clock watch item, unchanged from v0.1. **Lean re-priced** (see C2).
- **Archivists.** Collection draw only (not Conjuration draws). If the Source holds exactly 2, you draw both and return one, so the Source does not run dry. A 0-point 3-card Conjuration still counts as a spell for the Lean. Lean unchanged.
- **Chronomancers.** "Declare at turn start" kept as a public announcement before anything else happens. The pick happens after the whole Casting phase, before Recall (v0.1 B7). Source-emptying: if a spell empties the Source during that Casting, the Drought begins, Casting ends, and your delayed pick is taken under Drought rules (1 from the Released Reserve), then Recall and Learning. Lean unchanged.
- **Menders.** **Talent rewritten** (see C1): v3.2 lets every player re-learn returned components the same turn, so the old talent was empty. The swap works with partial UNLEARN (one end card from a run, or any cards from a Conjuration or Enchantment). It does not change the UNLEARN cost (1 counter), the immediate capacity loss, or the affordability gate — an UNLEARN you can't afford stays blocked. One swap per UNLEARN. Lean unchanged: a 0-point 3-card Conjuration still counts as a type; the 2–4p Enchantment cap doesn't affect it.
- **Harmonists.** Wording now says when the talent fires: any refill of a slot *you* emptied (Collection, Transfiguration or Perfect Transmutation). Another player's refills are not yours. If the refill takes the Source's last card, the Drought begins after the refill as normal. **Lean clarified:** v3.2 wilds never have an energy, so they add nothing to the Harmonist count. Max +4 at 2–4p, +5 at 5–6p (Echo), by the printed wording.
- **Lucent Order.** **Talent rewritten** (see C3). In v3.2 RESHAPE already lets you declare a rebuilt sequence's wild numbers again, and EMPOWER does not. The talent therefore only touches EMPOWER: you may change wild numbers when you add cards to a sequence (for example 5-6-W(7)-8: add a real 7 and the wild becomes 9 → 5-6-7-8-9). Wilds still never declare an energy, and the talent does nothing for Conjurations or Enchantments (their wilds declare nothing). It also covers an EMPOWER that converts a spell into a sequence. The v0.1 flip marker is gone: every use costs an EMPOWER and a card from hand. No talent lifts the Enchantment size cap. **Lean re-priced** (see C4).
- **Gravewrights.** **Talent rewritten** (see C5). Only the Arcane Reserve is searched, not the Array cards that join it. Clock-neutral: the set-aside card leaves the Released Reserve and replaces one draw from it, so the total number of Drought draws is the same. If the Drought begins on your own turn, the card is your Collection draw next turn. If the game ends before that draw, the card is not drawn. Lean unchanged in number; "count actual components" added (see Interactions, guard G1). Flagged for Sam: see open question 2.

---

## Interactions with The Last Rites

Checked against every Rite in [[Expansion - The Last Rites (v0.1)]] (that file is not changed here).

**Guard rules (print on the Schools reference strip when both modules are used):**

- **G1 — Leans read the Spellbook as it physically stands.** At evaluation a Lean counts actual components and the spell types as built. Rite markers don't change what a Lean counts: Final Pattern's "+1 component" and Transposition's ±1 value are scoring effects of their Rites, not changes to the spell. A sundered spell is gone and counts for nothing; banished cards are gone. (Affects Chronomancers 5+, Depthseekers 6+, Gravewrights' largest spell, Menders' types, Ashbinders' Transfigurations, Lucent's wilds, Harmonists' energies.)
- **G2 — The Gravewright card is not a Released Reserve draw.** Rite of the Grave-Song does not change the draw that uses the set-aside card (governance rule 5: one modifier per draw); it applies to the Gravewright's later draws as normal.

**Gravewright × Grave-Song (the July audit's watch item).** In v0.1 the tension was that a Gravewright could bury a card in the Arcane Reserve and later find it through Grave-Song. That never worked: the base Drought shuffles the Arcane Reserve with the Array, so top/bottom placement is lost — the v0.1 talent did nothing at all (C5). In v0.2 the Gravewright picks one card at the Drought start. Grave-Song is an ongoing filter on Drought draws. A Gravewright who also performs Grave-Song has the best Drought draws at the table, but it costs a School pick plus one of their two Rites, and G2 stops the two stacking on one draw. **Accepted, still a watch item** for the pairing session.

**Other contacts:**

| Rite | School contact | Ruling |
|---|---|---|
| Binding | Lucent (Empower), Menders (Unlearn) | A bound spell can't be Empowered or Unlearned, so neither talent can touch it. No guard needed. |
| Final Pattern | Size-keyed Leans | G1: the Lean uses the real size. |
| Ash | Design rule 5 | No Lean scores cards in hand. Clean. |
| Grave-Song | Gravewrights; Archivists | G2. Archivists' talent sleeps in the Drought (no Source), so it never stacks with Grave-Song. |
| Transposition | Type-keyed Leans; Lucent | G1: types as built. A ±1 marker may sit on a wild; the Lucent Lean still counts it as a wild. |
| Sundering | Ashbinders, Menders, Depthseekers Leans | The sundered spell stops counting toward the Lean — a real trade-off, no guard needed. |
| Silence | — | No contact. |
| Long Dusk | Gravewrights | Cards added later don't affect the set-aside card (it was taken before the shuffle). |

Recommendations for the Last Rites file (not edited here) are in the v0.2 hand-off report: update its Schools cross-reference (its "Gravewrights pre-seed the Reserve" note describes a talent that no longer exists), and say whether a Transposition shift can change a spell's *type* at evaluation.

---

## Iteration log — bugs found and fixed before v0.1

- **B1 — Free-action talents violate the protected economy.** First drafts included "Reshape once per turn as a free action" and "one free Learn after a PT." Both grant learning actions — exactly the coupling design rule 1 exists to prevent (and the same trap flagged as Q2 in the Spell Duels doc). **Fix:** cut; every talent now modifies an effect or a choice, never the action count.
- **B2 — Deal-2-keep-1 doesn't scale.** 2 per player = 12 cards at 6p (roster is 8), and blind deals can hand one player two duds. **Fix:** public market of count+2, reverse-turn-order pick — scales 2–6, adds a first strategic read of the table, and compensates late seats.
- **B3 — Energy-named schools failed the compatibility test.** A "Voidcaller" school is broken text the moment Echo enters (or reads as privileged among five suits). **Fix:** design rule 2; all eight rosters re-worded suit-agnostically.
- **B4 — Archivists' filter accelerated the Source clock.** Original: "draw 2, keep 1, discard 1 to the Arcane Reserve" — every Archivist Collection burned the Source 2× and inflated the future Released Reserve. **Fix:** the unkept card returns to the Source (top or bottom); clock-neutral, still a strong filter.
- **B5 — Hand-scoring lean collided with Last Rites.** Original Archivist lean: "+1 RP per 3 components in hand." Stacks with Rite of Ash (hand → points) into a hoarding strategy both modules would separately reward. **Fix:** cross-module design rule 5; Archivists' lean re-keyed to spell count.
- **B6 — Gravewright talent was invisible/forgettable.** Original: "you may look at the top card of the Arcane Reserve at any time" — zero decisions, pure fiddle. **Fix (v0.1):** placement control (top/bottom). *Superseded in v0.2 — see C5: the Drought shuffle erased that placement.*
- **B7 — Chronomancer timing created an information paradox.** "Collect after Casting" originally allowed collecting *mid*-Casting (after seeing Conjuration draws, before casting more). **Fix:** declare the delay at turn start; the pick happens after the whole Casting phase, before Recall.
- **B8 — Lucent Order enabled a shapeshifting engine.** Unrestricted "wilds may change on any Reshape" let one wild re-count toward a new pattern every single turn. **Fix (v0.1):** once per wild per game, marked physically by rotating the card. *Superseded in v0.2 — see C3.*
- **B9 — Leans vs. the moving score table.** Leans were kept flat and small (≤ +5 swing) so retuning is a number change, not a redesign. *v0.2: the table is now frozen in v3.2 and every Lean was re-checked against it (C2, C4, C8).*

## Iteration log — v0.2 refresh against rulebook v3.2

- **C1 — Menders' talent became the base rule.** v3.2 (A4, amended by Sam) lets anyone learn returned components again the same turn; "usable immediately" no longer did anything. **Fix:** new talent — an UNLEARN may swap one returned component with an Array card. It changes an effect, not the action count (rule 1); it's clock-neutral (no refill, nothing goes to the Reserve); it sleeps in the Drought. Weaker than a 4+ Transfiguration's exchange (that costs one counter and keeps the spell; this one costs a counter and shrinks a spell).
- **C2 — Depthseekers' Lean turned a dead spell into points.** v3.2 scores a 3-card Conjuration at 0 on purpose. "+1 per Conjuration" made every 3-card Conjuration worth 1 to this School and invited spamming small Conjurations. **Fix:** "+2 per Conjuration of 6+ components" — the same threshold as the Talent (one number on the card). Counting each big Conjuration rewards several large Conjurations over one huge one, which suits the v3.2 aim against end-game concentration. Usual range +2 to +4, the same as v0.1.
- **C3 — Lucent Order talent clashed with flexible wilds.** v3.2 wilds never declare an energy; in sequences they declare a number, which RESHAPE already lets you change. The v0.1 talent ("change once on Reshape or Empower") was half base rule and half undefined. **Fix:** the talent only lets EMPOWER declare a sequence's wild numbers again. The once-per-wild marker is dropped: v0.1 B8's every-turn engine is now priced by the base game (RESHAPE costs a counter per spell; each EMPOWER costs a counter and a card).
- **C4 — Lucent Lean grew with the Echo deck.** The 5–6p deck (canon in v3.2) has 4 wilds (6 still a tunable) against 2 at 2–4p, so "+2 per wild" could reach +8 or +12 for a hoarder. **Fix:** max +4, the same ceiling the 2–4p deck allows and the same as the Menders' cap.
- **C5 — Gravewright talent did nothing.** The Drought begins by shuffling the Arcane Reserve with the Array, so top/bottom placement in the Reserve could never matter, and the Gravewright × Grave-Song "pre-seed" synergy (v0.1 B6, July audit) could not happen. **Fix:** one pick from the Arcane Reserve at the Drought start, set aside as your next Collection draw. Clock-neutral, one decision, and the "what you throw away comes back" identity rewards discards (Transfiguration exchanges) all game. Guard G2 added for Grave-Song.
- **C6 — Source-emptying edge cases.** v3.2 rule: finish the current choice or effect, then the Drought begins; Conjuration and Perfect Transmutation can be cast only if the Source can complete them. **Fixes:** Depthseekers' extra draw is optional ("may"), and castability uses the number chosen; Archivists and Harmonists fall back to the normal draw/refill when only 1 card is left; Chronomancers' delayed pick becomes the Drought draw.
- **C7 — Wilds have no energy.** Harmonists' Lean counted "energies appearing" in the Spellbook; under v3.2 a wild has none. **Fix:** stated on the card.
- **C8 — Leans re-checked against the v3.2 table, no change needed:** Ashbinders +1 per Transfiguration (bigger share of a small Transfiguration, intended); Archivists +2 for 4+ spells; Chronomancers +2 for a 5+ spell; Menders +1 per type (max +4); Gravewrights +2 for the largest spell (see open question 2); Harmonists (see open question 4).
- **C9 — Spell types read literally (rule 6) and the base rules apply around every talent (rule 7).** v0.1 never said whether "Conjurations" and "Transfigurations" covered the matching half of a Perfect Transmutation. v0.2 says they don't.

## Open questions for Sam (design, paper)

1. **Menders' new talent** (Array swap on UNLEARN) — or the alternative: "when you RESHAPE, freed components that fit no rebuilt spell may go back to your hand instead of blocking the RESHAPE". The alternative makes one action do the work of RESHAPE + UNLEARN, closer to the line that design rule 1 draws, so the swap is recommended.
2. **Gravewrights' Lean** (+2 if your largest spell is the largest at the table) rewards concentration, which v3.2 works against, and has nothing to do with the new graveyard talent. Keep it for v0.2's first test, or re-key it (for example to Transfigurations, whose exchanges feed the Reserve)?
3. **Depthseekers' Lean** — +2 per Conjuration of 6+ (recommended), or the smaller change "+1 per Conjuration of 4+ components"?
4. **Harmonists' Lean is almost automatic** — most Spellbooks touch all four energies, so it's a near-free +4 (+5 at 5–6p). Keep it as the "easy" School, or tighten it (for example "distinct energies among your Conjurations and Perfect Transmutations")?
5. **Harmonists' talent on spell exchanges** — v0.1 said "when you take from the Array", read here as including Transfiguration / Perfect Transmutation exchanges. Confirm, or limit it to the Collection pick.
6. **Perfect Transmutation excluded** from the Ashbinders and Depthseekers talents (rule 6, the literal reading). Confirm.

## Open balance questions (for the playtest, not for paper)

- Are Talents or Leans the dominant half? (Intent: Talents ≈ 70% of a School's value — identity should be felt during play, not at the count-up.)
- Ashbinders' talent is the only one that changes a *cost* — is discard-1-take-1 on 3-card Transfigurations simply the best talent in the roster? (In v3.2, it is also a direct read on whether Transfigurations get built.)
- Do public Schools create useful table-reading ("she's Gravewright, watch the Reserve") or just noise?
- 2p: market of 4, pick 2-then-1 — does the first pick decide too much head-to-head?
- Only Lucent Order and Gravewrights act in the Drought — do the other six feel absent at the end?

## Scaling 2–6

Nothing scales except the market (count+2; at 6p all 8 Schools are offered). At 5–6p (Echo deck) the Harmonist Lean cap self-adjusts by its printed wording; the Lucent Lean is capped at +4 at every count; the Enchantment size cap (4 at 2–4p, 5 at 5–6p) applies to every School unchanged. All talents verified suit-count-agnostic (design rule 2).

## Drought handling

One printed line on every card: *"if the rule's object no longer exists, the talent sleeps."* Checked line by line for v3.2:

- **Sleep in the Drought:** Ashbinders and Depthseekers (no Casting), Archivists (no Source), Chronomancers (no Casting phase to delay past), Harmonists (no Array, no Source), Menders (no Array to swap with).
- **Live in the Drought:** Lucent Order (EMPOWER still exists) and Gravewrights (fires as the Drought begins).
- **Mid-turn start:** if the Source runs dry during your Casting, the v3.2 rule applies to every School: finish the current effect, cast nothing more, go to Learning under Drought rules. Chronomancers: see their ruling.
- **Leans** are unaffected; they score at evaluation as normal.
