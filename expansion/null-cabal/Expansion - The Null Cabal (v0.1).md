---
title: Expansion - The Null Cabal (v0.1)
type: expansion-ruleset
status: shelf-ready-untested
version: 0.1
created: 2026-07-16
salvaged_from: "[[old-expansion-thread-review]] §2a"
relates_to:
  - "[[EXPANSION_INDEX]]"
  - "[[Expansion Concepts - Player Interaction]]"
  - "[[Archmage Ascension - Complete Rulebook]]"
  - "[[Ascension Trials]]"
---

# The Null Cabal — v0.1 Rules

*Someone at the table does not want an Archmage at all.*

Hidden traitor for **3–6 players**. One player is secretly of the **Cabal**, pursuing a conditional agenda — not collapse, but a *shaped* ending. Deduction runs through the **Veils**: three anonymous, simultaneous contributions of magic that the whole table then reads like tea leaves. One formal vote decides whether the Cabal is unmasked before the Drought.

> **Status:** shelf-ready on paper, untested. Owns the one axis nothing else in the line touches: **trust and interpretation**. Not playable at 2 (structurally — no deduction space); the box says so plainly.

## Fit: why its own module

- **Not inside The Conclave** (player-interaction concept C): the Conclave gives *everyone* hidden agendas and open negotiation; the Cabal gives *one* player a hidden role and everyone else a hunt. Both at once is agenda soup. Standing ruling if both ever exist: **Cabal replaces the Conclave's hidden-agenda deck — never both.**
- **Not waiting on The Convergence** (co-op): co-op-with-traitor is the classic pairing, but Convergence is an unbuilt sketch. The Cabal is designed to run on the **base competitive game**, with a co-op face specified later as one chapter of Convergence's design (agenda: "the Convergence fails by exactly one demand").
- **Not standalone-with-Weather:** the old thread wrapped the traitor in a randomness module for cover. Dropped with Arcane Weather itself — cover here comes from the Veils' anonymity, not from noise.

**Throughline owned: trust — who is playing the same game you are.**

## Design rules (binding)

1. **Hidden information never modifies math** (combination governance rule 3): the Cabalist has no secret costs, values, or exceptions. Every rule below applies identically to every player; only the *agenda* is secret.
2. **No player elimination, no destruction, no direct score attacks.** The Cabalist shapes outcomes through ordinary legal play plus anonymous Veil choices.
3. **Fixed vote windows only.** No open accusations at any other time (the old thread's one unambiguous lesson: uncontrolled accusation = kingmaking and spam).
4. **Suit-agnostic, count-agnostic wording**; agenda thresholds are printed per player count.
5. **Wrong-vote penalties are never turn- or action-loss** (double feel-bad); the cost of a miss is that the hunt is over and the Cabal breathes easier.
6. **Caps scale down** (governance rule 2): while the Cabal is active — max **1 School**, max **1 active Mastery Seal** per player; Spell Duels Tiers 3+ not recommended.

---

## Components

- 6 **Role cards** (1 Cabal, 5 Loyal — deal player-count cards, one always the Cabal).
- 10 **Agenda cards** (8 base + 2 Trials-keyed).
- 3 **Veil divider cards** (shuffled into the Source).
- 6 sets of **vote tokens** (one per player, numbered).
- 1 **Broken Circle** marker (records a failed vote).
- 1 rules/timing reference card.

## Setup

1. Deal one face-down Role card per player; look secretly.
2. The Cabalist (privately, eyes-closed step) draws **2 Agenda cards, keeps 1** face-down.
3. Split the Source into rough thirds; shuffle one **Veil divider** into each third.
4. Play the base game as normal.

## The Veils — the deduction engine

When a Veil divider surfaces from the Source (set it aside; the revealer finishes their action first):

1. **Every player simultaneously selects 1 card from hand** and passes it face-down to the start player.
2. The start player shuffles the pile blind and **reveals it as a group** — the Veil.
3. The table may talk. Nothing is binding.
4. The revealed cards are **banished** (removed from the game — never into the Reserve; see B2).

That's the entire mechanism. Loyal players are choosing which card they can spare; the Cabalist is (usually) feeding their agenda. The Veil is anonymous but **arithmetically constrained**: claims of "I gave a 3" have to survive the visible total across three Veils. Deduction here is done with sums and suits, not vibes — which is what makes it work at 3 players.

## The Vote

**One formal vote, at Drought start** (5–6p: an additional optional vote immediately after the second Veil — majority may call it or pass).

- Simultaneous and secret: each player points a vote token at a player (or abstains); reveal together.
- **Conviction:** an absolute majority of votes lands on the Cabalist → they reveal their role **and their agenda is dead** — they cannot win. Play continues to normal evaluation; the Cabalist plays out the Drought as a spoiler-in-the-open.
- **Miss:** majority on a loyal player, or no majority → place the **Broken Circle** marker. The hunt is over; no further votes (including the 5–6p extra). Nothing else happens — the miss *is* the cost (design rule 5).

## Winning

- **Cabal victory (sole winner):** at evaluation, the agenda is satisfied AND the Cabalist was never convicted. This outranks all RP.
- **Otherwise:** the normal winner wins — highest RP **among loyal players**. The Cabalist's own RP never wins the game; the role is all-or-nothing (see B4 and its open question).

## The eight Agendas

Thresholds printed per player count on each card; all publicly checkable at evaluation.

| # | Agenda | Satisfied if |
|---|---|---|
| 1 | **The Sum of Silence** | total value across the three Veils ≥ the printed threshold |
| 2 | **The Hollow Offering** | total value across the three Veils ≤ the printed threshold |
| 3 | **The Drowned Colour** | across all Veils, cards of a single energy number ≥ the printed count |
| 4 | **The Single Note** | across all Veils, 3+ cards share one value |
| 5 | **The Diminished Crown** | the highest loyal score is ≤ the printed cap |
| 6 | **The Levelled Field** | the gap between the top two loyal scores is ≤ 2 RP |
| 7 | **The Starving Books** | no Spellbook (any player's) contains a spell of 6+ components |
| 8 | **The Wasted Wild** | at evaluation, no wild sits in the winning Spellbook |
| T1 | *(Trials only)* **The Failed Trials** | no player completes more than one Trial |
| T2 | *(Trials only)* **The Hollow Ascension** | the winner completes zero Trials |

Agendas 1–4 are **Veil-keyed** (the Cabalist feeds them directly, and every contribution risks leaving arithmetic fingerprints). Agendas 5–8 are **table-keyed** (the Cabalist plays crooked in the open game — denying Array cards, talking builds down — with the Veils as their only anonymous outlet and biggest bluff: a Cabalist with a table agenda *wants* to Veil like a loyalist).

## At 3 players (the hard count, fully specified)

- One vote only, at Drought start — never earlier (delayed certainty, salvaged from the old thread).
- Conviction requires **2 votes on the Cabalist** (a majority of the table, Cabalist voting too).
- Only agendas **1–4 and 7–8** are dealt (5–6 degenerate when "the loyal players" is two people).
- The three-card Veil reveal is maximally readable — which is the point: at 3p the deduction must be arithmetic, because behavioral reads collapse into a coin flip.

---

## Iteration log — bugs found and fixed before v0.1

- **B1 — The sabotage-menu traitor was physically unworkable.** The old thread's Misbind/Obscure/Withhold verbs require secretly manipulating shared piles at a physical table — impossible to do undetected, and any "eyes closed" ritual per round is miserable. **Fix:** all hidden influence routes through one mechanism (the Veil) that is *procedurally* anonymous, plus ordinary crooked play. The Cabalist never touches anything secretly.
- **B2 — Veiled cards into the Arcane Reserve lengthened the Drought.** 3 cards × players is a real clock swing (the exact trap as Last Rites B1). **Fix:** Veiled cards are banished after the reveal.
- **B3 — "Was that sabotage or the weather?"** The old thread bought deniability with a randomness module. Dropped (conflicts with the design spine). **Fix:** deniability comes from anonymity-with-constraints instead — stronger, because loyal players *choose* what noise to make, and lying about your contribution is a skill, not a dice roll.
- **B4 — A Cabalist who can also win on RP holds a strictly better role.** **Fix:** all-or-nothing. Cost: a Cabalist whose agenda dies early may check out. Mitigated — thresholds are checkable only at evaluation, so agendas rarely *provably* die early — and flagged as the headline open question.
- **B5 — Wrong-vote penalties punished engagement.** The old thread's "accuser skips Collection / Cabal gains a free sabotage" punishes the exact behaviour the module exists for. **Fix:** design rule 5 — a miss simply ends the hunt (Broken Circle). Fear of wasting the *only* vote is deterrent enough.
- **B6 — Collection denial made Veil contributions solvable.** If loyalists always Veil their lowest card, sums are predictable and the Cabalist is exposed by residue. Partially true — and *good* (that's the game) — but pure-junk contributions needed one counter-pressure: **agendas 2 and 4 exist precisely so that "everyone dumps junk" is itself exploitable** (a low-sum agenda loves your junk; a matched-value agenda loves predictability). The agenda mix keeps naive loyal strategies unsafe.
- **B7 — Continuous accusations (any time) reintroduced kingmaking.** Kept the old thread's fixed-window insight; extended it: a *failed* vote also closes all future windows, so the table can't grind suspicion turn after turn.
- **B8 — Two Cabalists at 6p parked.** Team-traitor variance is a different design problem; v0.1 is always exactly one. Parked, not cut.
- **B9 — Echo/suit-named agendas failed the compatibility test.** "The Drowned Colour" was originally "≥ N Void cards." Reworded to "a single energy"; thresholds per count. All ten agendas verified suit-agnostic.

## Open questions (for the playtest)

- **Does arithmetic deduction converge?** Across three Veils, do tables actually narrow to the Cabalist at better than chance — especially at 3p? (Measure: conviction rate vs. player count; target somewhere near 50–60%.)
- **Is the all-or-nothing Cabalist dead weight late** once they believe the agenda is lost? (B4 — if yes, add a consolation: an unconvicted Cabalist with a failed agenda scores their RP normally.)
- **Are table-keyed agendas (5–8) too passive** given the base game's low interaction? The Cabalist's levers there are Array denial and table talk only. If they can't move the needle, cut to Veil-keyed agendas + Trials riders.
- **Veil cost feel:** is giving up 3 cards over a game acceptable to loyal players, or does it read as a tax?
- Does one vote create enough drama, or does the table want the 5–6p extra window at every count?

## Scaling 3–6

Role and vote components scale by count; agenda thresholds are printed per count (design rule 4). The Echo extension changes nothing (agendas are suit-agnostic; a five-energy Drowned Colour is the same sentence). **No 2-player mode exists or is planned** — deduction needs a third mind.

## Cross-module notes

- **Trials:** fully compatible; two dedicated agendas (T1/T2). Trials' public objectives give the Cabalist more to sabotage socially.
- **Schools / Rituals & Seals:** compatible under the scaled-down caps (design rule 6).
- **Spell Duels:** Tiers 1–2 compatible (duels give the Cabalist open teeth — watch whether that's *too* useful); Tiers 3+ not recommended under suspicion load.
- **Last Rites:** compatible; the vote lands at Drought start, immediately before the Rites race begins — deliberately the same beat. Watch total ceremony time at that moment.
- **The Convergence (future):** the intended second home — co-op traitor is one design chapter there, reusing Roles and Veils with demand-keyed agendas.
