---
title: Rule explainers — which, and why (Prompt 2)
type: design-brief
created: 2026-11-12
rules: v3.1 (under test)
---

# Explainers brief

Written before building. Ranking = (how often players get it wrong, on the evidence) ×
(how much an interactive model beats prose). Evidence is the four logged sessions, the
P1 `[rules]` items in `meta/QUEUE.md`, and the decisions of 2026-07-06 and 2026-07-17.
The French six-player session has not been run, so there are no tier tallies yet.

## Chosen

| # | Explainer | Evidence | Why interactive | The one "aha" |
|---|---|---|---|---|
| 1 | **Counters through a turn** (`turn-counters`) | Sessions 1, 2, 3: counter refresh confused players "even after repeated explanation and reading"; standing P1. Session 4: understood at once from a screen. | The rule is a movement: counters go onto spells, come back, get spent again. Prose describes it; tapping it shows it. | Cast one spell or all of them: after the Recall you hold every counter again. |
| 2 | **When capacity changes** (`capacity-timing`) | Session 1 flagged the timing gap; P1 (F3). The affordability gate is new in v3.1 and has never been seen by a player. | It is arithmetic across two turns with a "can I afford it?" test. A sandbox lets a player find the block themselves. | Gains wait for next turn. Losses hit now, and you need room for them. |
| 3 | **Taking components back** (`unlearn`) | Session 3: "does unlearning require taking back all cards … or any number?" asked by several players, unresolved at the table. | Tap the components you want back; the remainder is checked live by the hand checker. | One counter, one spell, any number of components — as long as what is left is still a spell. |
| 4 | **Declaring a wild** (`wild-declaration`) | Session 4: "do you need a wild card to make a 5-card Enchantment?"; P1 (F6), propagation still open. | The rule only bites over time: declare, then try to Empower, then rebuild. Player count changes the Enchantment answer. | The wild is whatever you said it was until the spell is rebuilt. At 2–4 players there is no fifth energy for it to be. |
| 5 | **The Drought** (`drought`) | The game's protected hook; session 1's player "didn't notice any thematic arc"; two unwritten timing questions (source-emptying, F5). | Piles changing size is spatial. A scrubbable timeline shows where the last deck comes from. | The discard pile you fed all game becomes the last deck. Spells stop; Enchantments do not. |

## Worked example instead of an interaction

| # | Topic | Why not a full interaction |
|---|---|---|
| 6 | **Reshape** (`reshape`) | Session 4's finding was that Reshape was too *strong*, not that it was misread; v3.1 answered with the per-spell cost. A free drag-and-drop rebuild on a phone would be the largest build in this set for the weakest evidence. A three-step worked example shows the two things players need: the cost counts spells broken, and a rebuild that strands components is not allowed. |

## Rejected

- **Spell types at a glance.** Play › Check already is the interactive model: enter cards,
  see every spell with its effect and points, with the 5-component Enchantment scoped to
  5–6 players. A second copy would compete with it.
- **The Array / the Opening / Collection choices.** No session records confusion here, the
  board prints it, and it is a single either/or. The Opening's purpose is covered inside
  the Drought explainer, where it pays off.
- **Enchantment effect timing as part of #1.** Kept separate: #1 is "counters are not
  spent", #2 is "capacity changes late or early". Merging them is how the printed card
  became unreadable.
- **Array Attunement.** Proposed, not applied, and deliberately kept out of the v3.1
  baseline. An explainer would teach a rule that may never exist.

## Shape

Each explainer is a small state machine with no DOM in it (`init`, `actions`, `apply`),
so a node test can walk it. A shared engine draws any of them: a stage of real card chips
and counters, one plain caption per step (the text equivalent, announced to screen
readers), the choices as buttons, Back and Start again. Legality comes from the shared
hand checker and every number from the rules data. They mount behind a "Show me"
disclosure next to the rule in Rules and in Play, and are listed in Learn.

Where modelling a rule exposed a gap or a contradiction, the explainer says so in a
"Rulebook unclear" note at that step instead of choosing silently. Those are listed in
`REPORT_2.md`.
