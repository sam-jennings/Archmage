---
title: Playtest Plan Templates — The Schools & The Last Rites
type: playtest-session-templates
status: template-gated
created: 2026-07-02
relates_to:
  - "[[Expansion - The Schools (v0.1)]]"
  - "[[Expansion - The Last Rites (v0.1)]]"
  - "[[STATE]]"
---

# Playtest Plan Templates — Schools & Last Rites

> **Why templates, not scheduled sessions:** STATE.md's current hypothesis is the round-trip counter fix, and the stage gate parks all expansion testing until the base loop is locked. These two plans are written in the standard session-plan format so that when the gate lifts, each can be copied into `playtests/YYYY-MM-DD-session-N.md` (date + number filled by aa-playtest-planner) with zero redesign. **Each is a single-variable session: the only change from a baseline game is the presence of one module.** Do not run them in the same session as each other, or as any base-game fix validation (Anti-Drift Rule 6).
>
> **Prerequisite for both:** counter-economy fix validated live; a fresh baseline game logged on the final base rules (both plans measure deltas against it). Recommended order: Schools first (lighter, and it piggybacks a re-confirmation of the base loop), Last Rites next session.

---

# Plan A — The Schools v0.1

---
title: Session N — YYYY-MM-DD (planned)
type: playtest-session
date: YYYY-MM-DD
players: 4 (experienced)
version: base vX.Y + Schools v0.1
goal: Does asymmetric identity make games more distinct without distorting the base loop?
status: planned
---

## Goal
Does giving each player a School (talent + lean) cause visibly different strategies between players — without any talent warping the base economy or any lean deciding the game by itself?

## Hypothesis being tested
If each player has one always-on effect-modifier and one flat scoring lean, then players will pursue visibly different Spellbook shapes and report higher replay interest, while completed-spell counts, enchantment uptake, and game length stay within noise of the baseline game.

## Variable being tested
Presence of the Schools module. Nothing else — base rules exactly as the validated baseline.

## Test stage (course §12)
Local Iteration (experienced players, known base game).

## Mechanics → Experience (course §11)
- **Mechanic:** market-drafted School card; talent always on; lean at evaluation.
- **What players do:** pick an identity in reverse turn order, then bend their normal build toward it.
- **Decision created:** "do I build what my hand says, or what my School rewards?" — plus the draft read ("what does taking Ashbinders tell them about me?").
- **Emotion:** ownership ("I'm the Gravewright") and table-reading.
- **Risk:** one talent dominates (watch Ashbinders); leans decide the winner instead of colouring play; identity ignored entirely (card picked, never referenced again).
- **Why needed:** replayability — the base loop is the same every game; Schools is the cheapest variance the line can add.

## Pre-session checklist
- [ ] 8 School cards printed (talent + lean + Drought-dormancy line)
- [ ] Market rule on one reference strip (count+2, reverse turn order)
- [ ] Baseline metrics sheet to hand: completed spells/player, enchantment uptake, session length, winning score
- [ ] Score sheet with a separate "lean RP" column (so lean contribution is measurable)

## What to watch for
### Confusion signals
- A player forgets their talent for 3+ consecutive turns (identity isn't felt → talent too subtle)
- Anyone re-reads a School card more than twice after turn 3
- Rules questions about talent/base interaction (esp. Chronomancer timing, Lucent wild-flip)

### Engagement signals
- Players reference Schools in table talk ("of course the Archivist has it")
- Draft takes visible thought; someone picks *against* their neighbour rather than for themselves
- Two players with similar hands build clearly different Spellbooks

### Pacing signals
- Setup +3 min max (the draft); turns within ±10% of baseline; evaluation +2 min max (leans are one addition each)

## What success looks like
Four visibly different Spellbook shapes at game end that players attribute to their Schools unprompted; lean RP contributes but doesn't decide (winner's lean ≤ ~15% of their total); all baseline metrics within noise; at least one player asks to try a different School next time — that sentence is the module's entire commercial thesis.

## What failure looks like
Schools are picked and forgotten (talents invisible), or one School wins by an obvious talent margin (Ashbinders flag), or the winner is decided by lean arithmetic rather than play, or base metrics move (any talent secretly touching the economy = design-rule breach, back to paper).

## What NOT to look at this session
- School-vs-School fine balance (reason: needs many sessions; today is "does identity fit at all")
- Trials riders (reason: separate variable — run Schools with standard evaluation first)
- Duel quirks / any cross-module content (reason: Duels is its own test track)

## Mid-game check-in question
"Without looking — what's your School, and what has it changed about how you're playing?"

## Post-game debrief (course §13)
1. What was your favourite part?
2. What was your least favourite part?
3. What confused you?
4. Was it fun? Why or why not?
5. If you played again tomorrow, would you want the same School or a different one — and why?

---

# Plan B — The Last Rites v0.1

---
title: Session N — YYYY-MM-DD (planned)
type: playtest-session
date: YYYY-MM-DD
players: 4 (experienced)
version: base vX.Y + Last Rites v0.1
goal: Does a visible Rite row give the Drought real decisions — and does it reach back to shape play before the Drought?
status: planned
---

## Goal
Does the Rite row turn the Drought from a quiet count-up into a contested third act ("strip the engine or keep the pattern?"), and — the design's central promise — does its all-game visibility change decisions *before* the Source empties?

## Hypothesis being tested
If eight public, once-each, banish-costed Rites become performable during the Drought, then players will (a) make at least some pre-Drought choices in service of a planned Rite, and (b) describe the Drought as a decision space rather than an epilogue — without the game's end-timing drifting (all costs banish; only the voluntary Long Dusk touches the clock).

## Variable being tested
Presence of the Last Rites module. Nothing else.

## Test stage (course §12)
**Solo Dry Run first** (mandatory, before the live table): one self-played 2-hand game focused only on the Drought — verify every Rite resolves cleanly, check the two-per-player cap against real Drought length, confirm Transposition's validity check is workable in practice. Then: Local Iteration at 4.

## Mechanics → Experience (course §11)
- **Mechanic:** face-up Rite row, inert until Drought; banish costs; once-each, max 2/player, 1/turn.
- **What players do:** plan toward a Rite all game, then race for it in the Drought — paying with the very magic they built.
- **Decision created:** disassembly ("this spell is worth more sundered than scored?"), timing ("rite now or draw one more turn?"), denial (Silence).
- **Emotion:** end-times gravity; the agony of burning your own work; race tension.
- **Risk:** row ignored until the Drought (promise (a) fails); Drought too short for Rites to breathe; first-seat-after-trigger advantage (iteration-log B3); Ash as a degenerate last-turn dump.
- **Why needed:** the Drought is the title moment and the flattest stretch — no other box owns the ending.

## Pre-session checklist
- [ ] Solo dry run completed and logged (see Test stage) — do not book the table before this
- [ ] 8 Rite cards printed with costs, Trials riders omitted for this session
- [ ] Binding markers, ±1 markers, 8 Performed markers, banished-pile card
- [ ] Baseline Drought data to hand: how many Drought turns per player the base game produces at 4p (from baseline session)
- [ ] A Drought-seat log column (who acted 1st/2nd/3rd/4th after the trigger vs. Rite RP earned — bug B3's measure)

## What to watch for
### Confusion signals
- "Can I still Learn if I rite?" asked more than once (the separate-allowance rule isn't landing)
- Transposition validity check takes over a minute or produces an argument
- Anyone banishing to the wrong pile / trying to pay Rites into the Released Reserve

### Engagement signals
- **The headline:** any pre-Drought sentence like "I'm saving these for the Binding" — promise (a), the reach-back, observed live
- Players lean in when the Source is nearly empty (the trigger becomes an event, not an administrative moment)
- A genuine race: two players wanting the same Rite, one getting there first, visible reaction
- Someone agonises over Sundering a real spell — and does it

### Pacing signals
- Drought lengthens by no more than ~1–2 turns/player vs. baseline (Long Dusk aside — log who accepts it and why)
- Rite resolution < 60 seconds each
- End-timing: game ends within 1 round of when the baseline Reserve size predicts (verifies B1's banish fix in practice)

## What success looks like
At least two players make a visible pre-Drought decision in service of a Rite; during the Drought every player performs at least one Rite and at least one contested race occurs; the table describes the ending as "an act, not an epilogue" in the debrief; end-timing matches the baseline prediction; Rite RP by Drought-seat position shows no stark first-seat sweep.

## What failure looks like
The row is scenery until the Drought and Rites are then executed as an obvious point-conversion checklist (no race, no reach-back) — the module is a scoring appendix, refuted as designed. Or: Drought-seat position predicts Rite RP almost deterministically (B3's residual risk is real → move to wave-unlock or per-round rite limits). Or: end-timing drifts despite banish costs (something is touching the clock — find it).

## What NOT to look at this session
- Trials riders (reason: separate variable; run with standard evaluation)
- Rite cost fine-tuning (reason: today is structural — do Rites *belong*; tune numbers only if the structure passes)
- Schools cross-module interactions, incl. Gravewright/Grave-Song (reason: modules must pass solo before pairing)
- 2p and 6p scaling (reason: 4p first; scarcity questions are their own sessions)

## Mid-game check-in question
(Asked *before* the Drought, around mid-Source:) "Is anything in your hand or Spellbook there because of the Rite row? Which card, which Rite?"

## Post-game debrief (course §13)
1. What was your favourite part?
2. What was your least favourite part?
3. What confused you?
4. Was it fun? Why or why not?
5. Compare this ending to the base game's ending in one sentence each — which game would you rather finish, and why?

---

## After each session

Paste notes and say "log the playtest" (aa-playtest-runner). If either module passes its structural question, the follow-up sessions in priority order: Schools balance pass (rotate Schools, same table) → Rites at 2p and 6p (scarcity) → the **pairing session** (Schools + Rites together; watch item: Gravewright × Grave-Song).
