---
title: Solo Mode — The Attuned Rival (v0.1)
type: expansion-concept
status: draft
updated: 2026-07-19
---

# Solo Mode — The Attuned Rival (v0.1)

> **What this is.** The base-box solo mode: a rules-driven automa (no new cards) that
> occupies a rival's seat in the standard 2–4p game, targeting the "1–4 players" line on
> the box. Direction decided 2026-07-19
> (`meta/decisions/2026-07-19-solo-attuned-rival-direction.md`). This ruleset is v0.1 —
> untested, numbers provisional, tuning gated on the v3.1 confirm/kill outcome.
>
> **What this is not.** The deep solo/co-op experience stays with the co-op expansion
> direction (audit #9, The Convergence — demand deck, system-as-opponent, co-op face).
> This module is deliberately a *competitive race*, preserving the base game's structure.

---

## 1. Design intent

In multiplayer, rivals put four pressures on the player: they **burn the Source**
(clock), they **contest the Array** (denial), they **set a visible standard** (the
race), and they **threaten the endgame timing**. A solo mode succeeds if all four
survive at near-zero upkeep, and fails the moment a turn plays out identically whether
the automa exists or not.

**Standing test for every rule in this document:** *does the Rival's state ever change
what the player does this turn?* Anything that never does is a metronome and gets cut.

What solo does better than multiplayer — and what this design leans into — is
**outwitting a known rule**. The Rival never makes decisions; every one of its moves is
forced by a visible priority. The player's pleasure is reading the machine: counting its
stack, predicting its rejects, baiting its denial, and timing the Drought against its
progress.

The Rival requires no judgment calls, takes ~15 seconds per turn, and its entire brain
fits on one reference card: **Flip. Tithe. Burn.**

---

## 2. Product position

- **Home:** base box. Publishers read "solo mode included" as a base-game feature
  (the Wingspan model — the Automa ships in the box, expansions extend it), not as
  expansion content. Box line becomes **1–4 players**.
- **Count-gating:** solo is 1p — the standing Echo compatibility rule ("identical at
  2–4p and 5–6p") is satisfied vacuously, same precedent as The Schism at 2p. Second
  count-gated module in the line; the rule's phrasing revisit flagged in the Schism doc
  now applies to two modules.
- **Extension story (future):** an "Echo-attuned Rival" variant could ship with the
  5–6p extension — the Rival runs the Echo suit while the player keeps all four base
  energies and both wilds. Strictly richer player market; gives the extension a solo
  selling point. Not in v0.1 scope.
- **DR-HOOK compliance:** casting still burns the shared Source (now the Rival burns it
  too); the Spellbook remains the proof at evaluation. Hook visibility unchanged at 1p.

---

## 3. Components and setup

Components: the standard 2–4p deck (62 cards), standard counters, one Rival reference
card (to be produced; rules below fit one card). Nothing else.

Setup:

1. **Attune the Rival.** Choose one energy for the Rival — default **Void**. Remove all
   15 cards of that energy from the deck and shuffle them face down: this is the
   **Rival's Stack**. (Suits are symmetric, so the choice is flavour, not mechanics.)
2. **Build your game.** Shuffle the remaining 47 cards (three energies × 1–15, plus
   both wilds). Deal yourself 7 cards. Place 5 face up as the Array. The rest, face
   down, is the Source (35 cards).
3. **Binding.** You discard 1 card from hand to the Arcane Reserve, as normal. The
   Rival reveals the top card of its Stack and places it face up in front of itself —
   the first card of the **Rival's Spellbook**, a single row kept sorted ascending by
   rank.
4. You take 1 counter (standard 2–4p base capacity). You go first.

Turn cycle: **your full normal turn** (Collection, Casting, Learning — every base rule
unchanged) → **the Rival's turn** (three fixed steps) → repeat.

---

## 4. The Rival's turn — Flip, Tithe, Burn

### Step 1 — FLIP

Reveal the top card of the Rival's Stack.

- **Keep it** — insert it into the Rival's row, sorted — if the row has **fewer than 3
  cards**, or the card's rank is **within 1** of any card already in the row.
- **Otherwise reject it:** place it face up in the Array (the Array temporarily holds 6).

The Stack holds every rank of the Rival's energy exactly once, so its future is fully
countable: any rank not in its row and not yet seen is still coming, and whether it will
be kept or rejected is predictable from the row's current shape.

### Step 2 — TITHE

The Rival moves one Array card to the Arcane Reserve, chosen by strict priority:

1. **A wild**, if any is in the Array.
2. Else, a card that **would extend your largest spell** — same energy as that
   Conjuration, rank adjacent to either end of that Transfiguration or Perfect
   Transmutation, or matching the rank of that Enchantment. If several qualify, the
   highest rank.
3. Else, the **highest rank** in the Array.

Tiebreaks: equal ranks → energy order **Radiance → Void → Flux → Aether**. "Your
largest spell" = most components; tie → Perfect Transmutation > Enchantment >
Transfiguration > Conjuration.

**After the Tithe, if the Array holds fewer than 5 cards, refill from the Source.**
(So a turn where the Rival kept its flip costs the Source an extra card — its growth
strains the world.)

### Step 3 — BURN

Move the top card of the Source, face up, to the Arcane Reserve.

That is the whole automa. No dice, no decisions, no bookkeeping.

---

## 5. What changes for you (the decision audit)

Applying the standing test — the concrete decisions the Rival's state creates:

1. **Denial enters your Collection phase.** Its rejects sit in the Array where its own
   Tithe can bury them next turn (occasionally it buries its own castoff — it would
   rather reconsume its energy than let you have it). Grab what you need before the
   machine does. Wilds are always Tithe priority 1: take them fast or lose them.
2. **The pace dial is yours.** Every Conjuration cast and Array take burns the Source —
   and every Source card burned is a card the Rival never flips. Rushing the Drought
   **strands its Stack** (see §7) and caps its row; slowing down grows both books. The
   central strategic axis of the mode: *when do you want the Drought?* — restored from
   multiplayer, but now under your control and against a countable opponent.
3. **Scavenge planning.** 4-card Enchantments need one card of the Rival's energy at
   the matching rank — obtainable only as its rejects or via a wild. Which ranks can
   still be rejected is computable from its row shape. The base capacity ladder's top
   tier becomes a contested prize instead of breaking (the failure mode that rules out
   a plain 3-energy solo deck).
4. **Largest-spell shielding.** Your largest spell defines what the Rival denies. The
   order you LEARN and EMPOWER changes what it hunts — including deliberately growing a
   spell to redirect its Tithe. (Degeneracy risk flagged in §13.)
5. **Foreseeable endgame.** Its Stack size is public; the Ravening (§6) and the Drought
   can both be counted ahead. Timing your final Reshape/Learn window is plannable in a
   way multiplayer never allows — the solo-specific pleasure.

---

## 6. The Ravening (Stack exhaustion)

If the Rival's Stack is empty at the start of its turn and the Source is not, the FLIP
step is replaced by a second BURN. The Rival's Work is complete, and it turns on the
world — burning the Source at 2 per turn until the Drought.

Slow play therefore closes its own window: the full Work (a big row) comes packaged
with an accelerating clock.

---

## 7. The Drought

Trigger and base procedure unchanged (Array + Reserve shuffle into the Released
Reserve; the pending Source-emptying timing patch, decision
`2026-07-06-source-emptying-timing.md`, applies as in the base game).

Two solo-specific rules:

- **The moment the Drought begins, the Rival's remaining Stack is removed from the
  game** — the unclaimed energy scatters. This is what makes the pace dial real: the
  player can race the Drought to strand the Rival's future.
- **The Rival's Drought turn:** draw 1 card from the Released Reserve.
  - Its energy → insert into its row.
  - A wild → keep it: declare it (per the standard wild rule) to fill the lowest-rank
    gap whose filling joins two of its runs; if no such gap, declare it as extending
    its longest run at the high end. The declaration is fixed.
  - Anything else → remove from the game.

Everything the Rival tithed comes flooding back in the Released Reserve — including
wilds it buried, which may now serve it. The player's Drought turns are unchanged
(draw 1, Learning phase). The contest ends when the Released Reserve is empty.

---

## 8. Final evaluation

Score your Spellbook with the standard evaluation, unchanged.

Score the Rival's row as the **better of two readings** (its row is all one energy, so
both are legal Spellbook readings on the real table — no new scoring machinery):

- **(a)** the entire row as **one Conjuration** of its size;
- **(b)** each maximal run of 3+ consecutive ranks as a **Perfect Transmutation**, plus
  the remaining cards as one Conjuration if 3+ remain.

The Conjuration column's curve does the balance work automatically: a starved row of 7
scores ~7–10, a fat row of 12 scores 50. The Rival's threat scales with exactly the
thing the player controls — game length.

**You win if your total exceeds the Rival's. On a tie, the Rival ascends** — the
Drought goes unbroken by your hand.

### Difficulty

| Level | Rule |
|---|---|
| Apprentice | Rival's final score ×0.75, round down |
| Adept (standard) | As written |
| Archmage | Both wilds shuffle into the Rival's Stack at setup (a flipped wild is always kept; declared per the §7 wild rule) — the player's deck has none — and the Ravening burns 3 |

Optional levers (any level): **Hoard** — tithed cards go face down under the Rival
instead of the Reserve, never return, and add +1 each to its total. **Hasten** — BURN
is 2 from the start of the game.

---

## 9. Worked example

Rival = Void. Binding seed: Void 8.

Turns 1–2: flips Void 3, Void 12 — row under 3 cards, both kept. Row {3, 8, 12}.
Turn 3: flips Void 5 — not within 1 of anything. **Rejected to the Array** (a rank-5
Enchantment in your book is now one Collection away from its 4-card tier — but the
Rival's next Tithe knows that too). Turn 4: flips Void 7 — adjacent to 8, kept.
Turn 5: flips Void 13 — adjacent to 12, kept. Row {3, 7, 8, 12, 13}.

A fast game ends around here plus a couple of keeps: row {3, 7, 8, 9, 12, 13, 14} —
reading (a) Conjuration-7 = 7; reading (b) PT(7-9) + PT(12-14) = 5 + 5 = 10.
**Rival: 10.**

A slow game gives it the fuller Work: row {3, 4, 5, 7, 8, 9, 12, 13, 14, 15} —
reading (a) Conjuration-10 = **29**; reading (b) 5 + 5 + 11 = 21. **Rival: 29**, and it
spent the late game Ravening 2 Source per turn.

Same rules, ~3× the score, driven entirely by the player's pacing.

---

## 10. Production form — the deck brain (later)

The rules brain above is v0.1's test vehicle: zero components, fully deterministic,
maximally bait-able. If the chassis confirms, production form is a **12–15 card Rival
deck** (the format publishers recognise; the Wingspan difficulty model of swapping
cards in/out):

- each card resolves one Rival turn: a keep-test override for FLIP, a Tithe priority
  variant, a Burn count, and occasionally a special (lock an Array slot for a round,
  a one-off double Flip, a peek);
- 2–3 optional private **Renewal goal** cards for the player (pattern objectives) for
  directional texture — kept deliberately clear of the co-op direction's demand-deck
  space.

Nothing in v0.1 depends on this; it is listed so the rules brain isn't over-fitted in
ways a deck can't later encode.

---

## 11. Fit analysis

- **Vs. the co-op direction (audit #9).** No overlap by design: this is a race with no
  demands, no co-op face, no difficulty-curve-per-count problem. If that box ships, the
  two solo experiences coexist as different products (race vs. survival).
- **Vs. The Schism.** The rejected Severance chassis (player severs shares, automa
  claims by rule) is parked as the Schism's natural 1–2p extension — noted in QUEUE.
  **Tithe** is deliberately reused here with the Schism's meaning (a forced card to the
  Reserve) per combination-governance rule 4 (shared effect templates).
- **Combination governance (EXPANSION_INDEX rules 1–5).** Compliant: no rules contact
  with other modules; no hidden information; no persistent modifiers, so the
  one-modifier cap is untouched. Solo is a mode, not a stackable module — combining it
  with content modules (Schools, Foci) is future work and out of v0.1 scope.
- **v3.1 dependency.** All score-facing behaviour rides the live table. If v3.1 is
  killed and v3.0 restored, the chassis survives unchanged; only §8's example numbers
  and difficulty multipliers need re-deriving.

---

## 12. Design rationale (why these rules)

- **Why remove a whole energy?** It gives the Rival a legible identity, makes its row a
  legal one-energy Spellbook (free scoring), turns the player's market into a 3-energy
  game *without* breaking the Enchantment ladder (rejects + wilds keep the 4-card tier
  reachable as a prize), and makes its future fully countable (15 known ranks).
- **Why flip only one card per turn?** So the Stack (15) outlasts the typical game
  (~9–11 rounds), keeping the strand-the-Stack race live in every game. Flip-2-keep-1
  variants exhaust the Stack by round 8 and kill the pace dial.
- **Why does its growth cost the Source?** A keep leaves the Array short after the
  Tithe, forcing a refill — so the Rival's good turns accelerate the clock, mirroring
  how a thriving opponent burns the Source faster in multiplayer.
- **Why score max(one Conjuration, runs-as-PTs)?** It reuses the player's own scoring
  literacy, needs no new table, and the Conjuration curve's superlinearity makes game
  length itself the difficulty dial.

---

## 13. Open questions

1. **Adjacency width.** Keep-test at ±1 (current) vs ±2. ±2 keeps more and builds
   gappy clusters that reliably consolidate (every rank exists exactly once in the
   Stack), but may starve the reject/scavenge supply. Sim question.
2. **Score band.** Is the Adept Rival competitive with real player books (~35–55 under
   v3.1 in early solo play)? Calibrate multipliers from sim + the first live sessions;
   cross-check against final books in `playtests/` session logs.
3. **Largest-spell shielding degeneracy.** Can the player trivialise the Tithe by
   maintaining a decoy largest spell (e.g. a cheap Conjuration in the Rival's own
   energy, making it bury its own rejects)? If dominant, add a Tithe priority clause.
4. **Reject supply.** Are ~3–6 rejects per game enough for the 4-card Enchantment prize
   dynamic to be felt? If starved, widen adjacency (fewer keeps ≠ more rejects — the
   opposite) or reject on a second condition.
5. **Tie between (a) and (b) readings** at evaluation is possible and harmless (equal
   scores); no rule needed — confirm.
6. **Does solo teach well?** Secondary use as a teach/practice mode for the 2–4p game —
   worth watching, not designing for.

---

## 14. Test plan

**Stage 1 — sim (Track A, before any live session).** A scratch script in
`simulation/` conventions: model Flip/keep/Tithe/Burn against a simple player proxy
across pace profiles. Outputs: Rival score distribution by game length, reject count
per game, keep-rate curve, sensitivity to ±1/±2 adjacency. An afternoon's work; settles
open questions 1, 2, 4 before a card is ever dealt.

**Stage 2 — live solo confirm/kill.** Solo sessions need no scheduling — they are free
capacity — but sequence *after* the v3.1 confirm/kill playtest (the score table is a
confounder; one-variable discipline).

- **CONFIRM if:** Rival turn ≤ 20 seconds by session 2; the player deviates from their
  solitaire-optimal line ≥ 3 times per game *because of Rival state* (denial grabs,
  pace shifts, scavenge timing); session fits 30–45 minutes; the Rival finishes within
  ~15 points of the player by game 3 at Adept.
- **KILL if:** the Rival is ignorable (0–1 deviations per game); upkeep exceeds ~45
  seconds; or the shielding line (open question 3) proves dominant and unfixable with
  one priority clause.

On CONFIRM: promote to v0.2, spec the reference card, revisit the deck brain. On KILL:
fall back to the Severance chassis (parked with the Schism) before abandoning base-box
solo.

---

## 15. Iteration log

- **v0.1 (2026-07-19).** Initial ruleset, from the solo-mode exploration
  (2026-07-19 conversation): flip-driven "Shadow Mage" chassis judged too passive by
  Sam (automa state never changed player decisions); reframed as three chassis × two
  brains; Attuned Rival on the rules brain selected. Key same-day design moves:
  flip-2-keep-1 dropped for flip-1 (preserves the strand race); denial recast as the
  Tithe with Reserve return (Drought texture); the row scored as
  max(Conjuration, PT-runs) on the real table after checking v3.1 values — no bespoke
  scoring machinery; growth-costs-the-Source refill rule added.
