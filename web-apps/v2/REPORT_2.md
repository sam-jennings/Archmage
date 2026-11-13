---
title: Web rebuild v2 — report 2 (interactive rule explainers)
type: report
created: 2026-11-12
rules: v3.1 (under test)
game_title: Arcane Drought
---

# Report 2 — rule explainers

Six explainers are built, tested and mounted next to their rules in Rules, behind "Show me"
in Play, and listed in Learn. Nothing outside `web-apps/v2/` was touched, nothing was
committed or pushed, and no rule or number was changed. Modelling the rules exposed nine
gaps or contradictions in the rulebook; they are in section 4 and are the main thing to
read here.

## 1. Which explainers, and why

Ranked by (how often players get it wrong, on the evidence) × (how much an interactive
model beats prose). Full reasoning is in `learn/EXPLAINERS_BRIEF.md`.

| # | Explainer | Evidence | The one "aha" | Mounted at |
|---|---|---|---|---|
| 1 | Counters through a turn | Sessions 1–3: counter refresh confused players after repeated explanation; standing P1. Session 4 understood it from a screen. | Cast one spell or all: after the Recall you hold every counter again. | Rules › Recall · Play › Turn |
| 2 | When capacity changes | Session 1 flagged the timing; P1 (F3). The affordability gate is new in v3.1 and unseen by any player. | Gains wait for next turn. Losses hit now, and you need room. | Rules › When capacity changes · Play › Counters and capacity |
| 3 | Taking components back | Session 3: "all cards or any number?", asked by several players, unresolved. | One counter, one spell, any number — if what is left is still a spell. | Rules and Play › Unlearn |
| 4 | Declaring a wild | Session 4: "do you need a wild to make a 5-card Enchantment?"; P1 (F6). | The wild is what you said until the spell is rebuilt. At 2–4 there is no fifth energy for it to be. | Rules › Wilds · Play › Spells |
| 5 | The Drought | The protected hook; session 1's player saw no arc; two unwritten timings. | The discard pile you fed all game becomes the last deck. | Rules and Play › Drought Turn |
| 6 | Reshape (worked example) | Session 4 found Reshape too strong, not misread. | The cost counts spells broken; a rebuild may not strand components. | Rules and Play › Reshape |

Explainer 3 was not on the prompt's candidate list. Session 3 put it there.

## 2. What I rejected

- **Spell types at a glance.** Play › Check already is the interactive model. A second one would compete with it.
- **The Array / the Opening / Collection.** No session records confusion; the board prints it. The Opening's purpose is shown inside the Drought explainer, where it pays off.
- **A free-form Reshape builder.** The largest build in the set for the weakest evidence. The worked example covers the two points that matter.
- **Array Attunement.** Proposed, not applied. An explainer would teach a rule that may never exist.
- **Animation.** Nothing animates beyond a 140 ms state change, and that is 0 ms under `prefers-reduced-motion`. Every step is a still picture plus a sentence.

## 3. What was built

```
web-apps/v2/
  REPORT_2.md
  learn/EXPLAINERS_BRIEF.md
  learn/explainers/
    engine.js            draws any explainer; the only file here that touches the DOM
    kit.js               shared pure helpers (classify via the hand checker, grants, costs)
    strings.en.js        explainer copy; no rule numbers
    explainers.css       frame and stage styles (tokens only)
    turn-counters.js  capacity-timing.js  unlearn.js  reshape.js  wild-declaration.js  drought.js
  tests/explainer.<id>.test.mjs   × 6
```

18 new files. Each explainer is a pure state machine (`init`, `actions`, `apply`, `facts`,
`stage`) with no DOM in it, which is what lets a node test walk it. Legality is always asked
of the shared hand checker (`kit.classify`); counts, costs, grants and points are read from
`data/current.js`. The example cards and the Drought's mid-game pile sizes are scenario
data and are labelled "Example numbers" on screen.

**Files from session 1 that I edited, for wiring only:**

| File | Change |
|---|---|
| `data/site.js` | Registered the six explainers in `mounts.explainers`; documented page-scoped slots (`play:…`, `rules:…`). |
| `assets/js/ui.js` | `explainerMount()` now renders "Show me" disclosures that load an explainer on first open; added `explainerDisclosure()`. |
| `assets/js/pages.js` | Learn lists the explainers; `learn/index.html#explainer-<id>` opens one. |
| `data/strings.en.js` | Four interface strings for the mount (Show me, loading, failed, the Learn intro line). |
| `sw.js` | Ten files added to the offline list; cache version bumped. |
| `package.json` | `test` script now runs every test file. |

Not edited: the rules data, the hand checker, `site.css`, any HTML file, the check tool.

### Verification done

- `node --test web-apps/v2/tests/*.test.mjs` → 98 pass, 0 fail (14 from session 1, 84 new). Each explainer test walks the canonical example at 2–4 and 5–6 players where the rule differs, asserts outcomes against the rules data, and checks every state has a caption with no unfilled placeholder.
- `node web-apps/v2/tools/check-rules-data.mjs` → 571 passed, 0 failed (it now also covers the new files: offline list, vocabulary).
- Headless Chrome at 375 px and 1280 px, dark and daylight: all six opened and clicked through in Learn; opened in place in Play and Rules. No console errors, no horizontal overflow; inside the explainers every control is named and every target is at least 44 px.
- Keyboard: Enter on an action works and focus stays on a sensible control; tapping a component keeps focus on that component.
- Player-count switch in Play re-starts an open explainer for the new deck (checked on the wild/Enchantment case: "stops at 4" at 2–4, "Echo is in this deck" at 5–6).
- Offline: with the network off, all six load and are styled.
- Size: the whole explainer set is 21 KB gzipped and loads only when a "Show me" is opened.
- **Not done:** a real phone, a real screen reader (captions use a polite live region, which is the standard approach, but I have not heard it read), and the French six-player results (no session file exists yet).

## 4. Rule ambiguities the modelling exposed

These are findings, not fixes. Where an explainer reaches one, it shows a "Rulebook
unclear" note at that step instead of choosing silently. Line numbers are in
`rulebook/Archmage Ascension - Complete Rulebook.md` (v3.1).

| # | Rule | What the rulebook says | The gap | Evidence | What the explainer does |
|---|---|---|---|---|---|
| A | **Unlearn from the middle of a run** | Line 331: the remainder "must still form a valid spell, or the whole spell comes apart". Line 335: a single component "may only" come off an end; "you cannot pull a component out of the middle". | Two outcomes for one move: not allowed, or allowed and the spell collapses. | Session 3: unlearn scope asked by several players, unresolved. | Flags it; states both readings; says "agree at the table". |
| B | **Unlearn that changes a spell's type** | Line 331 only asks for "a valid spell". Line 317 lets Empower convert types; nothing says so for Unlearn. | Take Flux 6 out of Flux 4-5-6-7-8 and what is left (4, 5, 7, 8) *is* a valid spell: a Conjuration. By line 331 that is fine; by line 335 it is forbidden. The checker found this, I did not expect it. | Same session 3 question. | Shows the Conjuration that results, and flags that the rulebook does not say whether Unlearn may change type. |
| C | **Shrinking an Enchantment whose gain has not arrived** | Lines 211–213: gains next turn, losses immediately, and the gate needs room for "the immediate capacity loss". | Empower 3 → 4 this turn, then step back to 3 the same turn: is there a loss? You never held the extra capacity. | None yet; nobody has played the gate. | Treats it as losing nothing now and says so in a note. |
| D | **Reshape that grows or creates an Enchantment** | Line 211 names "learning or empowering" as gains. Line 327 covers Reshape making one smaller. | A Reshape that makes an Enchantment bigger, or builds a new one, is not mentioned. By the principle the gain should wait a turn. | — | Not modelled; listed here. |
| E | **What counts as "broken down" in Reshape** | Line 325: "one counter per spell broken down". | Moving one component from spell A to spell B: one spell broken, or two? | Session 4: the last-turn giant Reshape that prompted the per-spell cost. | The worked example breaks both and flags the question. |
| F | **Wild in an Enchantment must be a new energy** | Line 157: a wild must be an energy in the deck; this "keeps 5-component Enchantments out of reach at 2-4 players". | That only holds if the wild cannot repeat an energy already in the Enchantment. Never stated. (Report 1, conflict 4.) | Session 4: "do you need a wild to make a 5-card Enchantment?" | Applies it, labelled "Implied, not stated". |
| G | **Where the wild rule lives** | Line 157 puts declaration under Enchantment only. Canon `wild_rule` and decision F6 say all spell types, fixed while the spell exists. F6 propagation is still open. | A player reading only the rulebook would not know a wild in a run is fixed. | F6. | Teaches the canon rule (run scene). |
| H | **The Source emptying mid-turn** | Line 356: "The instant The Source runs dry." Lines 261, 275: Conjuration draws from, and the Array refills from, the Source. | Nothing says what happens to the rest of Casting, or to a spell half-resolved. A ruling is proposed (`meta/decisions/2026-07-06-source-emptying-timing.md`) but not in the rulebook. | — | Flags it at the step where the Source empties and summarises the proposal as a proposal. |
| I | **The last card of the Released Reserve** | Line 391: when it is depleted "the contest immediately ends". | The last card is drawn in Collection. Read strictly, that player gets no Learning phase. F5 keeps the immediate end as a playtest watch but does not settle this. | F5 names "denied a meaningful final turn" as the thing to watch. | Flags it at the final step. |

Smaller ones, not shown in an explainer:

- **Line 336**: components taken back "can't be learned into new spells until your next turn". It does not say whether they may be used to Empower an existing spell this turn.
- **`meta/QUEUE.md` line 26** still describes F3 losses as "reducing only remaining learning actions this turn (never undo an action already taken)". The decision file and the rulebook now use the affordability gate. The queue line is stale.
- **Capacity during the waiting turn.** When a 3 grows to 4, the explainer keeps the old +1 available that turn. The rulebook implies this ("added capacity becomes available…") but never says the old capacity stays.

Choices I made in the models that you should know about: "free" capacity is capacity minus
learning actions already taken this turn; stepping an Enchantment down is modelled as an
Unlearn; the Drought's table size is the smallest for the chosen player group (2 or 5).

## 5. Three-question checks for the next playtest

Ask after the player has used the explainer, before they play the rule. A pass is two of
three right without help.

**1 · Counters through a turn**
1. You have 3 counters and cast one spell. How many learning actions do you get?
2. Can you cast your Enchantment?
3. You cast nothing this turn. Do you get extra learning actions?

**2 · When capacity changes**
1. You learn your first 3-component Enchantment now. How many actions do you have left *this* turn, and how many counters next turn?
2. Your capacity is 4 and you have taken one action. Can you take your 4-component Enchantment apart?
3. Same position: can you step it down to 3 instead? What is your capacity straight after?

**3 · Taking components back**
1. You want two components back from one spell. What does it cost?
2. You take one end off a 3-component run. What happens to the other two?
3. Can you play those components into a new spell this turn?

**4 · Declaring a wild**
1. Your run is 5, 6 and a wild you declared as 7. You draw a real 7. Can you Empower with it?
2. How could that wild ever become a 4?
3. Four players. You have all four 7s in an Enchantment and a wild in hand. Can it become a 5-component Enchantment? Why?

**5 · The Drought**
1. Where do the cards of the last draw pile come from?
2. During the Drought, which of your spells still do something?
3. What ends the game?

**6 · Reshape**
1. You break down three spells to rebuild them. What does it cost?
2. After rebuilding you have two components that fit nowhere. Is that allowed?
3. Can you add a card from your hand during a Reshape?

For the French session these map onto the tier grid: a tier-3 intervention on a rule that
has an explainer is the signal that the explainer failed.

## 6. What I would do next

1. **Settle A and B before the French session.** They are the same question (what may an Unlearn leave behind?) and it has already come up at a table once.
2. **Write H and I into the rulebook**, or mark them as known open points on the board. Both sit at the game's climax.
3. **Add a "your numbers" mode to explainer 2**: let a player enter their own capacity and Enchantment size mid-game and get the gate answer. The model already takes any state.
4. **Prompt 3 can reuse the engine** for the Trials allocation walkthrough: it is a state machine with hidden steps.
