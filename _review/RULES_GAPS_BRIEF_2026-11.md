---
title: Rules-gaps rulings brief (Nov 2026)
type: review-brief
date: 2026-11-16
status: items 1–8 decided 2026-11-16 (all A; applied as rulebook v3.3, meta/decisions/2026-11-16-rules-gaps-rulings-1-8.md); items 9–17 awaiting Sam (recommendations only; nothing from Group 3 applied)
sources: web-apps/v2/REPORT_1.md §6, REPORT_2.md §4, REPORT_3.md §3
rules-read-against: rulebook v3.2 (canon 2026-11-13)
---

# Rules gaps: 17 rulings for Sam

> **Status 2026-11-16:** Sam answered **1A 2A 3A 4A 5A 6A 7A 8A**. Applied as rulebook v3.3
> (`meta/decisions/2026-11-16-rules-gaps-rulings-1-8.md`). **Group 3 (items 9–17) is still
> open** — nothing below item 8 has been applied. Line numbers below are the v3.2 ones.

Reply with numbers and letters, e.g. "1A 2A 4B". The recommended option is always **A**, so
"all A" accepts everything. I recommend; you decide. Nothing in the rulebook, `meta/` or
`web-apps/v2/` was touched.

**How I read the prompt.** It was written on the morning of 13 Nov, when v3.1 was still under
confirm/kill. That afternoon you approved the bundle as **v3.2**. So:

- Line numbers below are in the **v3.2** rulebook.
- "Defer until after the confirm/kill" no longer applies. I still prefer rulings that only
  clarify, because the first v3.2 playtest is meant to check how the approved rules feel, and
  they should not shift underneath it. Group 3 is now "the next rulebook pass".
- Four of the reported gaps are **already closed by v3.2** and need no decision (listed at the end).

None of the recommendations touches the protected hook.

**One thing to do before the French session, whatever you answer:** the pack in
`_review/FR_6P_SESSION_2026-08/` is written for v3.1 (session plan line 7 and 53). Wilds,
same-turn re-learning after Unlearn and the Source timing all changed in v3.2.

---

## Group 1: decide before the French six-player session

### 1. Unlearn: what may stay behind (Report 2, A + B)

- **Unclear:** line 341 says what stays "must still form a valid spell, or the whole spell comes
  apart". Line 345 says a single component "may only" come off the end of a run. Take the middle
  card out of a run and the two lines give different answers (whole spell returns / not allowed).
  And take Flux 6 out of Flux 4-5-6-7-8: what stays (4, 5, 7, 8) is a valid Conjuration, which
  line 341 allows and line 345 forbids. Session 3: several players asked about Unlearn scope.
- **Options:**
  - **A. One rule.** What stays must be a valid spell, of any type. If it would not be, the whole
    spell returns to your hand. Delete the "ends only" sentence; it becomes a consequence.
  - B. Same type only. What stays must be a valid spell of the same type, so runs shed ends only.
  - C. Leave it as the digital build plays today: one card from the middle is refused, but two
    or more are allowed if a valid spell stays. Two rules, and they disagree with each other.
- **Model (shared hand checker, every way to take cards from one spell):**

  | Spell | Ways to take some cards | Same type stays | Another type stays | Nothing valid stays |
  |---|:-:|:-:|:-:|:-:|
  | 5-card Perfect Transmutation | 30 | 5 | 10 (a Conjuration) | 15 |
  | 7-card Perfect Transmutation | 126 | 14 | 84 | 28 |
  | 5-card Transfiguration | 30 | 5 | 0 | 25 |
  | 7-card Transfiguration | 126 | 14 | 0 | 112 |
  | 4-card Enchantment | 14 | 4 | 0 | 10 |

  So the type question only ever comes up for same-energy spells. A mixed-energy run never
  leaves another spell behind (a 7-run minus its middle card leaves two runs, which is not one
  spell). Under A the 5-card PT has 15 legal partial Unlearns, under B it has 5.
- **Effect on play:** the only real difference is pulling a card from inside a Perfect
  Transmutation. Under A that is 1 counter and leaves a Conjuration (5-card PT, 18 points,
  becomes a 4-card Conjuration, 1 point). Under B the same result costs 2 counters (Unlearn the
  whole spell, Learn the Conjuration, legal in one turn since v3.2). The other direction also
  exists: Void 2, 5, 6, 7, 9 minus the 2 and the 9 leaves Void 5-6-7, a Perfect Transmutation
  (2 points becomes 5). I found no degenerate line under either.
- **Recommend A.** One sentence to teach, no special case for runs, and it matches Empower,
  which may already change a spell's type (line 326).
- **Rulebook wording** (replaces lines 341 and 345):
  > Return one or more components from a single spell to your hand. What stays must still be a
  > valid spell. It may be a different type: take the middle out of a Perfect Transmutation and
  > a Conjuration stays. If what would stay is not a valid spell, the whole spell returns to
  > your hand. Wilds that stay in a run keep their number.
- **Phone (19 words):** Take back any components from one spell. What stays must be a valid
  spell, or it all comes back.
- **Balance:** clarifies only. Against the digital build it is worth 1 counter in a rare line
  that costs the player points.
- **Changes when decided:** rulebook lines 341, 345; `rulebook/GLOSSARY.md` Unlearn entry;
  `web-apps/v2/data/rules.v3.2.js` (Unlearn details); `learn/explainers/unlearn.js` (statuses
  `retype` and `conflict` stop being flagged) and strings `retypeNote`, `retypeMiddleNote`,
  `middleNote`; `tests/explainer.unlearn.test.mjs`; digital build
  `web-apps/archmage-ascension/game/state.js` lines 407–423 and its test.

### 2. Capacity timing: one sentence for every case (Report 2, C + D + "waiting turn")

- **Unclear:** lines 216–218 list verbs (gains from "learning or empowering", losses from
  "Unlearn or Reshape"). Four cases fall between them:
  1. Empower an Enchantment 3 → 4, then Unlearn back to 3 in the same turn. Is there a loss?
     You never held the extra capacity.
  2. A Reshape that builds or grows an Enchantment (line 337 covers only making one smaller).
  3. While a grown Enchantment's extra capacity is waiting, does the old capacity stay? Never said.
  4. An Empower that turns an Enchantment into another spell. Possible only with two wilds
     (Void 7 + wild + wild as an Enchantment, add Void 9: no longer an Enchantment). No line
     covers the loss.
  Also line 218 gives the action cost as "(1)", but a Reshape costs one per spell broken down.
- **Options:**
  - **A. Compare before and after.** After any learning action, compare the capacity your
    Enchantments gave before it with what they give after. More: the extra arrives next turn.
    Less: lost now, and you need room for it. Capacity that has not arrived yet is cancelled,
    never charged.
  - B. Charge each Enchantment by the ladder. Every shrink costs the ladder difference even if
    that capacity had not arrived; in a Reshape each Enchantment broken is lost now and each one
    built waits a turn.
- **Effect on play:** under B, case 1 costs two actions plus 2 capacity the player never had,
  and a Reshape that swaps one Enchantment for another of the same size drops capacity for a
  turn. Under A neither happens. A never lets a player use more capacity in a turn than they
  started it with, so the reason for F3 (no spending a gain the turn you make it, no using an
  Enchantment you just broke) still holds.
- **Models disagree today:** the v2 explainer plays case 1 as A (and flags it). The digital
  build's Unlearn plays it as B (`state.js` line 431 charges the ladder difference). The digital
  build's Reshape already nets before and after, as in A.
- **Recommend A.**
- **Rulebook wording** (replaces lines 216–218):
  > Whenever a learning action changes your Enchantments, compare the capacity they gave you
  > before the action with the capacity they give after it.
  > - **More:** the extra becomes available from the start of your next turn. Until then you
  >   keep what you already had.
  > - **Less:** you lose the difference immediately.
  > - Capacity that has not arrived yet is never a loss. If you make an Enchantment smaller
  >   before its new capacity arrives, that capacity simply never arrives.
  >
  > This applies to every learning action: Learn, Empower, Reshape and Unlearn.
  > **Affordability gate:** you may not take an action that loses capacity unless you can pay
  > the action's full counter cost and absorb the loss from the counters you have available.
- **Phone (15 words):** More capacity arrives next turn. Less is lost now, and you need room
  for it.
- **Balance:** clarifies only.
- **Changes when decided:** rulebook lines 202, 216–218, 337, 348; GLOSSARY Capacity and
  Enchantment entries; `rules.v3.2.js` (`capacity.timing`); `learn/explainers/capacity-timing.js`
  and string `pendingNote`; `tests/explainer.capacity-timing.test.mjs`; digital build `state.js`
  Unlearn loss (line 431) and its test.

### 3. Is a spell's type chosen, or set by its cards? (Report 1 conflict 2, and behind item 1)

- **Unclear:** Void 5-6-7 fits three definitions: Conjuration (line 128, 0 points),
  Transfiguration (line 139 "any energies", 3 points) and Perfect Transmutation (line 169,
  5 points). The glossary disagrees with the spell section (line 441 "different energies",
  line 439 "not sequential"). Nothing says whether the owner picks. The models allow picking:
  the v2 checker takes a preferred type and the digital build takes an optional `type`.
  Flexible wilds made this sharper: Void 7 + wild + wild is a legal Perfect Transmutation, a
  legal Enchantment of 7s (+1 counter) and a legal Conjuration, and no declaration tells them
  apart any more.
- **Options:**
  - **A. The cards decide.** If they fit more than one type, the spell is the most specific
    one: a same-energy sequence is always a Perfect Transmutation. Only a spell with two or more
    wilds can still be read two ways; its owner names it when learning it, and it stays that
    until rebuilt.
  - B. The owner always chooses the type when learning.
- **Effect on play:** B lets a player hold Void 5-6-7 as a "Conjuration" to draw 1 card each
  turn without the Perfect Transmutation's forced exchange (draw 1, discard 2, take 1), and
  adds a declaration the table has to remember for every same-energy run. A has nothing to
  remember except in the two-wild case.
- **Recommend A.**
- **Rulebook wording** (new, at the top of Spell Types, after line 122):
  > A spell's type is set by its components, not chosen. If they fit more than one type, it is
  > the most specific: a same-energy sequence is always a Perfect Transmutation. Only a spell
  > holding two or more wilds can still be read two ways. Say which spell it is when you learn
  > it; it stays that spell until you rebuild it.

  Glossary: line 439 → "3+ components of the same energy (they need not be sequential)";
  line 441 → "3+ sequential components, any energies".
- **Phone (14 words):** The cards decide the spell's type. A same-energy run is always a
  Perfect Transmutation.
- **Balance:** clarifies only (it is how the score table and the checker's default already work).
- **Changes when decided:** rulebook Spell Types intro, glossary lines 439 and 441; GLOSSARY.md;
  `rules.v3.2.js` spell notes; no v2 behaviour change (the checker's default is already "best
  type"); digital build: the optional `type` on Learn and Reshape is honoured only for
  two-wild spells.

---

## Group 2: decide before any Drought-heavy or 5–6 player session

### 4. The last card of the Released Reserve (Report 2, I)

- **Unclear:** line 403: when the Released Reserve is depleted "the contest immediately ends".
  The last card is drawn in Collection, so read strictly the player who draws it gets no
  Learning Phase and the card is dead.
- **Options:**
  - **A. Finish the turn.** The player who draws the last card completes their Learning Phase,
    then the contest ends.
  - B. Strict. The contest ends on the draw.
  - C. Finish the round, so everyone has had the same number of turns (F5's deferred wording).
- **Effect on play:** under B the last card of every game is wasted and one player's final
  Learning is skipped. A is what the digital build already plays (`RULES_SUMMARY.md` line 41).
  C changes game length and is exactly what F5 says not to adopt before the 6-player
  worst-case test.
- **Recommend A.** It settles the wording and leaves the F5 seat-order watch open.
- **Rulebook wording** (replaces line 403):
  > When a player draws the last card of the Released Reserve, they finish that turn, including
  > their Learning Phase. Then the contest ends. Proceed to the final evaluation.
- **Phone (12 words):** Whoever draws the last card finishes their turn. Then the game ends.
- **Balance:** clarifies only.
- **Changes when decided:** rulebook line 403 and glossary line 435; `rules.v3.2.js`
  (`drought.end`); `learn/explainers/drought.js` end frame and string `endNote`;
  `tests/explainer.drought.test.mjs`; `RULES_SUMMARY.md` line 41 (drop the "ambiguous" aside);
  a note on `meta/decisions/2026-07-06-f5-game-end-procedure.md`.

### 5. Which Trials rules does a 5–6 player table use? (Report 3, items 1 and 3 together)

- **Unclear:** `rulebook/Ascension Trials.md` is still the v2.8 draft. It has no Echo power
  (lines 60–69), no 6-player rewards (line 127 leaves them unresolved) and "5–7 players"
  (line 94). It cannot run a 6-player game without someone inventing a reward table.
  Note: brief 6C parked Trials "until v3.1 is confirmed or rolled back". Your approval on
  13 Nov met that condition, so the thread can resume when you want it to.
- **Options:**
  - **A. Use a candidate package (C1) for any 5–6 player Trials game.** The draft stays a
    2–5 player historical text until a package replaces it.
  - B. Patch the draft: add Echo, extend Complete Mastery, write 6-player rewards.
- **Model (Trials engine, one sample 5-player book: Echo Conjuration 5, Void Conjuration 4,
  Transfiguration 4, Enchantment 5):** the draft counts 13 normal power and reports the Echo
  spell's 8 as unplaceable, with 0 Wild power. With the "count Echo" option it counts 21. C1
  counts 29 and 2 Wild power (its own formula), and already has Echo, Complete Mastery at 5 and
  6 (9, and 9 / 4 at six) and 6-player rewards.
- **Recommend A.** B means designing a 6-player reward table for rules you have already
  shortlisted replacements for.
- **Wording:** none in the rulebook yet. Phone (10 words): At 5–6 players, play Trials with
  the Coherent Claim package.
- **Balance:** Trials only. No effect on the base game.
- **Changes when decided:** `web-apps/v2/trials/rulesets/index.js` (`DEFAULT_RULESET_ID`, or a
  5–6 player default); `meta/threads/ascension-trials.md`; F8 checklist.

### 6. Echo is a fifth energy domain in Trials (Report 3, item 1)

- **Unclear:** Trials line 60–69 lists four energy powers. F8's first checklist item (add Echo
  Power) is unticked.
- **Options:** **A. Yes, same formula as the other energies.** B. No.
- **Recommend A.** Every candidate does this; B makes Echo Conjurations worth nothing in Trials.
- **Rulebook wording** (Trials, new row in Power Domains):
  > Echo Power | Echo Conjuration spell lengths (5–6 player games)
- **Phone (9 words):** Echo counts as a fifth energy in the Trials.
- **Balance:** Trials only; changes the draft, clarifies the candidates.
- **Changes when decided:** `rulebook/Ascension Trials.md` lines 60–69; `rulesets/current-draft.js`
  (`echo_domain` option becomes the default); `trials/tests/rulesets.test.mjs`; F8 box 1.

### 7. Complete Mastery: which player counts (Report 3, item 3)

- **Unclear:** Trials line 94 says "5–7 players". F8 lists three choices (5 only, 5–6, all Echo
  games). Under canon the Echo deck is the 5–6 player deck, so the last two are the same thing.
- **Options:** **A. 5–6 players: it comes with the Echo deck.** B. 5 players only.
- **Recommend A.** One boundary to remember (the same one as the deck), and it matches every
  candidate. The draft only has a 5-player reward for it, which is another reason for 5A.
- **Rulebook wording:** heading at Trials line 94 → "7th Trial (5–6 players, with the Echo deck)".
- **Phone (10 words):** Complete Mastery is in play whenever the Echo deck is.
- **Balance:** Trials only.
- **Changes when decided:** Trials lines 94, 115–127 (drop the 7-player column); F8 boxes 2 and 5.

### 8. Wild power from Enchantments (Report 3, item 5)

- **Unclear:** Trials lines 77–79 and 104 give +1 for a "4-component Enchantment". The
  5-component Enchantment did not exist when that was written.
- **Options:** **A. +1 for an Enchantment of 4 or more.** B. Exactly 4 only. C. +1 at 4, +2 at 5.
- **Effect on play:** under B, growing an Enchantment from 4 to 5 loses the bonus (the sample
  book in item 5 gets 0 Wild power from its 5-card Enchantment in the draft). C adds a new
  number nobody has screened.
- **Recommend A.** It is what the candidates do.
- **Rulebook wording:** "Each Enchantment of 4 or more components grants +1 Wild power."
- **Phone (10 words):** An Enchantment of 4 or more gives +1 Wild power.
- **Balance:** Trials only; changes the draft at 5–6 players, clarifies the candidates.
- **Changes when decided:** Trials lines 77–79, 104; `rulesets/current-draft.js`
  (`enchantment_wild_sizes: [4, 5]`); `trials/tests/power.test.mjs`; F8 box 6.

---

## Group 3: can wait for the next rulebook pass

### 9. Reshape: what counts as "broken down" (Report 2, E)

- **Unclear:** line 334: "one counter per spell broken down". Moving one component from spell
  X into spell Y: is that one spell broken down, or two?
- **Options:**
  - **A. Only broken-down spells take part, and they are broken down completely.** Moving a
    component from X to Y means breaking both: 2 counters. This is what the digital build and
    the explainer already do.
  - B. Pay one counter for each spell you take components out of. Spells that only receive are
    free: 1 counter.
- **Effect on play:** under B, breaking one 3-card spell and feeding its cards into three other
  spells costs 1 counter (4 under A). That loosens the Reshape price v3.1 set to stop the
  Session 4 last-turn restructure.
- **Recommend A now.** B is a balance change. Raise it again only if the first v3.2 playtest
  says Reshape feels too expensive.
- **Rulebook wording** (replaces lines 333–334):
  > Break down one or more spells completely and rebuild all of their components into valid
  > spells. Only the spells you break down take part: a spell you have not broken down neither
  > gives nor receives components. Costs one counter per spell broken down.
- **Phone (17 words):** Only broken-down spells take part. One counter for each. Every component
  must end in a valid spell.
- **Balance:** A clarifies only. B changes balance.
- **Changes when decided:** rulebook lines 333–334; `rules.v3.2.js` Reshape details;
  `learn/explainers/reshape.js` and string `moveNote`; `tests/explainer.reshape.test.mjs`.
  Digital build: none under A.

### 10. A spell made only of wilds (new; exposed by flexible wilds)

- **Unclear:** "a wild is whatever the spell needs" (line 78). The 5–6 player deck has 4 wilds,
  so three or four wilds could be offered as a spell with no real card in it. The rulebook is
  silent. The shared checker finds no spell in a wilds-only hand.
- **Options:** **A. Every spell needs at least one card that is not a wild.** B. Wilds-only
  spells are legal (the owner names the type, per item 3).
- **Recommend A.** It matches the checker, and under B four wilds are a 10-point Enchantment
  with +3 counters that takes no building.
- **Rulebook wording** (Components, after line 78): "Every spell needs at least one component
  that is not a wild."
- **Phone (8 words):** Every spell needs at least one non-wild card.
- **Balance:** clarifies only. Cannot come up at 2–4 players (2 wilds).
- **Changes when decided:** rulebook line 78 area; `rules.v3.2.js` wild notes; a named test in
  `tests/hand-checker.equivalence.test.mjs` (behaviour is already there).

### 11. Trials: replace the standard score, or add to it? (Report 3, item 6)

- **Unclear:** Trials line 28: "Instead of using *only* the standard final evaluation". Line 38:
  "Most Recognition Points wins". The v2 rules data says Trials replace the standard score.
- **Options:** **A. Replace.** B. Add the two together.
- **Effect on play:** the draft's whole Trials pool is 30 to 47 points. One 10-card Perfect
  Transmutation scores 56 on the standard table and a 15-card one scores 100. Under B the
  Trials would rarely decide a game.
- **Recommend A.**
- **Rulebook wording** (Trials line 28): delete "only", so it reads "Instead of using the
  standard final evaluation, players calculate power…".
- **Phone (9 words):** With Trials, only Trials points count. No standard scoring.
- **Balance:** Trials only; clarifies.
- **Changes when decided:** Trials line 28. v2 companion: none.

### 12. Trials: a tie on final points (Report 3, item 7)

- **Unclear:** the draft has tiebreaks inside one trial (lines 131–136) but none for the final
  result. The candidates have a chain.
- **Options:** **A. Use the candidates' chain in every package:** most trials won outright,
  then most normal power, then most spells, then largest spell, then shared. B. Tied players
  share the place.
- **Recommend A.**
- **Rulebook wording:** "If players tie on Recognition Points: most trials won outright, then
  most normal power, then most spells, then the largest spell. Still tied: they share the win."
- **Phone (16 words):** Tied? Most trials won outright, then most power, most spells, largest
  spell. Then share the win.
- **Balance:** Trials only.
- **Changes when decided:** Trials, new section after line 136; `rulesets/current-draft.js`;
  `trials/tests/resolver.test.mjs`.

### 13. The name of the Trials' flexible power (Report 3, item 13)

- **Unclear:** the Trials rules call it "wild magic". The v2 vocabulary check bans that
  two-word name from player-facing files, because it was the old name for the wild card's effect.
- **Options:** **A. Rename it "Wild power" in the Trials rules.** B. Keep the old name and add
  an exception to the check.
- **Recommend A.** It sits beside "Void Power", "Transformation Power" and the rest, and the
  companion already says it.
- **Phone:** no rule text. The term is "Wild power".
- **Balance:** none.
- **Changes when decided:** Trials lines 75, 79, 102–109; `rulebook/GLOSSARY.md` if listed.

### 14. Energy Harmony at 2–3 players (Report 3, item 14)

- **Unclear:** the draft offers Energy Harmony at every player count. The candidates offer it
  at 4 and up.
- **Options:** **A. No separate ruling: it follows the package you pick** (C1: 4 and up).
  B. Rule now that it is offered at every count in every package.
- **Recommend A.** Which trials are on the list at each count is balance, and it was screened
  per package.
- **Balance:** Trials only; B changes screened packages.
- **Changes when decided:** none under A.

### 15. Champion's Mark details (Report 3, item 10)

Only matters if you pick C2 or C3 (both use it at 2 players). C1 and C4 do not have it.

- **Unclear:** whether marking is compulsory, whether you may mark a trial you did not enter,
  and whether a shared win pays.
- **Options:** **A. Optional; mark a trial you are entering; a shared win pays.** B. Compulsory.
- **Recommend A.** Marking a trial you have not entered can never pay, so allowing it only
  adds a way to make a mistake. The C2 note already says a shared win counts.
- **Rulebook wording:** "You may secretly mark one Trial you are entering. If you win it,
  alone or shared, gain +4 Recognition Points."
- **Phone (14 words):** You may mark one Trial you enter. Win it, even shared, for +4 points.
- **Balance:** Trials only.
- **Changes when decided:** the companion's Champion's Mark screen (today: any active trial).

### 16. Trial of the Archspell and a Perfect Transmutation (Report 3, item 11)

Only matters if you pick C4.

- **Unclear:** a Perfect Transmutation "can fight here from either of its domains, but its
  Spell Power is the cap". May it mix both domains?
- **Options:** **A. Either domain or a mix, total capped at the spell's power** (what the
  companion does). B. One domain only.
- **Recommend A.** The cap is the rule that matters (a 5-component one brings at most 7, not
  14). B adds a restriction with no effect on the total.
- **Rulebook wording:** "A Perfect Transmutation may pay from its energy power, its
  Transformation power, or both. The total may not exceed that spell's power."
- **Phone (16 words):** A Perfect Transmutation pays from either domain or both, up to its own
  power. Never double.
- **Balance:** Trials only.
- **Changes when decided:** none in the companion under A.

### 17. Wording clean-up with no ruling in it (Report 1 conflicts 5, 12, 13; small items)

- **Options:** **A. Do all of these in the next rulebook pass.** B. Leave them.
  - Title and ending: the rulebook still says Archmage and "ascends" (lines 2, 18, 28–40, 409,
    492). Already decided (Arcane Drought, the Renewer); waiting on the rename pass, which is
    gated with the pitch and F14.
  - Line 488 restates the ladder as differences. Correct, but a second place to keep in step.
  - Lines 243–246 and 306–309 list "1 counter = 1 spell, 2 counters = 2…". Say it once.
  - Line 346: returned components "can be learned into a new spell straight away". Say "used
    again straight away" so nobody asks whether Empower counts.
  - Line 71: "one of the four energies" should allow for Echo.
- **Balance:** none.

---

## Already closed by v3.2 (no decision needed)

| Report item | Closed by |
|---|---|
| R1 conflict 3, R2 G: where the wild rule lives | v3.2 Components, lines 78–80 |
| R1 conflict 4, R2 F: must a wild in an Enchantment be a new energy? | Size cap, line 154 (max 4 at 2–4 players, 5 at 5–6); a wild needs no energy |
| R2 H: the Source emptying mid-turn | Lines 261, 272, 283, 296, 368. One known gap is in the simulation, not the rule (`simulation/ASSUMPTIONS.md`) |
| R2 small item: returned components and "next turn" | A4 amended, line 346 |

The v2 site no longer shows "Rulebook unclear" at those points. It still shows it for items 1,
2, 4 and 9. `node --test` in `web-apps/v2/`: 157 pass, 0 fail, 1 skipped (run before reasoning).

---

## Answer template

```
1A 2A 3A 4A 5A 6A 7A 8A 9A 10A 11A 12A 13A 14A 15A 16A 17A
```

## QUEUE line to mirror this file (listed here, not added)

```
- [P1] [decide] [thread:rules-and-teaching] **Rules-gaps rulings brief** (`_review/RULES_GAPS_BRIEF_2026-11.md`, 2026-11-16) — 17 rulings from the v2 build's gap tables, read against v3.2; Sam answers "1A 2B …". Items 1–3 (Unlearn scope, capacity timing, spell type) before the French six-player session; 4–8 (last Reserve card, Trials at 5–6p) before any Drought-heavy or 5–6p session; 9–17 in the next rulebook pass. Each answer becomes a `meta/decisions/` file with a §3a version bump.
```

## Symptoms of something deeper

- **The rulebook never says what makes a spell the type it is.** Item 3 is the root of item 1
  and of the glossary conflict. Flexible wilds removed the declaration that used to pin the
  type of a wild-heavy spell, so this got worse in v3.2, not better.
- **Capacity timing is written as a list of verbs.** Every new verb interaction (Empower then
  Unlearn, Reshape that grows, Empower that converts) opens a new gap. Item 2A replaces the list
  with one before-and-after comparison.
- **Dropping A6 rested on "there is no way to convert an Enchantment".** That is true except
  with two wilds: the checker accepts Void 7 + wild + wild + Flux 7 as a 4-card Enchantment, so
  a spell learned as something else can be Empowered into one. Rare, and item 2A covers the
  capacity side. Worth knowing the premise is not strictly true.
- **The Trials text is two rule versions behind.** Items 5–8 and 11–14 are all the same
  problem: patching the v2.8 draft point by point costs more than picking a package.
- **The models have drifted from each other.** The v2 explainers and the digital build give
  different answers on items 1 and 2. Whatever you rule, both need the same change in the same pass.
