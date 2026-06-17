# Opus Task: Enchantment System — Accessibility and End-Game Balance
*Created: 2026-05-07 — self-contained brief, no mid-task feedback required*

---

## What you are

You are a senior board game designer specialising in card game systems and end-game dynamics. You have been handed a working prototype with a single mechanic — the Enchantment system — that is failing in two opposite directions at the same time: it is too hard to acquire during normal play, and too powerful once acquired at end-game. Your job is to diagnose both failure modes precisely, determine whether they have a common root cause or are independent problems, and produce a coherent set of recommendations that fixes both without introducing new imbalance. All source material you need is included below. Do not ask for clarification — reason through ambiguities yourself.

---

## The game: Archmage Ascension (summary)

A 2–7 player card game. Players build a *Spellbook* — a tableau of learned spells — by drawing from a central deck (The Source) and arranging cards into four spell types:

- **Conjuration** — 3+ cards of the same energy type. When cast: draw bonus cards from The Source.
- **Transfiguration** — 3+ cards with sequential values (any energies). When cast: exchange cards with The Array.
- **Enchantment** — 3–4 cards of the same value (different energies). *Always active, never cast.* Permanently increases capacity (see below).
- **Perfect Transmutation** — 3+ sequential cards of the same energy. When cast: both Conjuration and Transfiguration effects (mandatory).

**Turn structure:**
1. Collection — Draw 1 from The Source OR take 1 from The Array (5 face-up cards).
2. Casting — Place counters on spells to activate them. Cast up to [counter count] spells, or all spells if Unlimited Capacity.
3. Recall — Pick up all counters from cast spells, return to pool.
4. Learning — Use those same counters to Learn/Empower/Reshape/Unlearn spells (1 counter per action).

**Counter system:** Counters represent *capacity*, not a depletable resource — they are recovered every turn via the Recall step. Everyone starts with 1 counter. Gaining capacity requires learning Enchantments (see below).

**The Drought:** When The Source empties, the game enters its final phase. The Array and discard pile (Arcane Reserve) merge into the Released Reserve. Casting is disabled — only Collection (draw 1) and Learning occur. The game ends when the Released Reserve is also depleted. Players score Recognition Points from their Spellbook at game end.

---

## The Enchantment mechanic in full

### What Enchantments do

Enchantments are the only way to increase capacity. They are always active once learned — no casting required.

- **3-card Enchantment**: +1 counter permanently. Also grants +1 learning action per turn and +1 casting slot per turn.
- **4-card Enchantment**: Unlimited Capacity. Player takes the Unlimited Capacity marker; all their counters are set aside. Can cast *all* spells and perform *unlimited* learning actions.

If a 3-card Enchantment is broken apart (via Reshape or Unlearn): lose 1 counter permanently (until rebuilt).
If a 4-card Enchantment is broken apart: return the Unlimited Capacity marker; retrieve your counters (revert to previous counter count).

### Enchantment scoring

| Size | Points |
|------|--------|
| 3 cards | 6 pts |
| 4 cards | 15 pts |

*(Enchantments cap at 4 cards — one per value, 4 possible energies.)*

For comparison, other spell types at similar sizes:
| Size | Conjuration | Transfiguration | Perfect Transmutation |
|------|-------------|-----------------|----------------------|
| 3 | 3 pts | 5 pts | 7 pts |
| 4 | 4 pts | 7 pts | 10 pts |
| 5 | 6 pts | 10 pts | 14 pts |
| 6 | 9 pts | 14 pts | 19 pts |

A 4-card Enchantment (15 pts) scores more than any other 4-card spell type and roughly equivalent to a 5-card Conjuration or a 6-card Transfiguration — *plus* it gives Unlimited Capacity for the rest of the game.

### How to acquire an Enchantment

Enchantments require 3–4 cards sharing the *same value* but *different energies* (e.g., Radiance-7, Void-7, Flux-7). Collecting matching-value cards is fundamentally at odds with how the other three spell types reward cards:

- Conjuration rewards collecting same-energy cards.
- Transfiguration rewards collecting sequential-value cards.
- Perfect Transmutation rewards collecting sequential same-energy cards.

To pivot to an Enchantment from an existing Spellbook, a player typically must: (a) hold matching-value cards in hand without building other spells with them, or (b) break apart an existing spell to free cards for an Enchantment — which, if that spell was a Conjuration, Transfiguration, or Perfect Transmutation, costs a learning action to unlearn plus a learning action to re-learn the Enchantment.

If the player wants to maintain their existing spells while adding an Enchantment, they need additional learning capacity — which they only get *from* Enchantments. This creates a bootstrapping problem: to get learning capacity, you need an Enchantment; to learn an Enchantment, you need learning capacity.

---

## Failure Mode 1: Enchantments are too hard to acquire

### Playtest evidence

**Session 1 (2026-05-01, 2 players, first external playtest):**
- Both players focused on building out Conjurations and Transfigurations — the spell types that reward the natural flow of drawing and collecting.
- No detail on enchantment uptake specifically, but both players *did* have 4-card Enchantments by the Drought — suggesting they acquired them eventually but likely at a significant opportunity cost.

**Session 3 (2026-05-03, 5 players):**
- Only 2 out of 5 players learned any Enchantment across the entire game.
- All 5 players reported feeling constrained by learning capacity.
- Sam (who knows the rules perfectly) needed a 2-turn workaround to acquire a single Enchantment: unlearned a 4-card Conjuration → re-learned it as a 3-card Conjuration on the next turn → learned the Enchantment the following turn (using the card freed from the original Conjuration). Two turns of overhead for one Enchantment.
- One player said it felt "impossible" to focus on Enchantments given competing values from Conjurations and Transfigurations.
- Assessment: "This is not a rulebook explanation failure — Sam understood the rules perfectly and still needed 2 extra turns. The mechanic itself is not rewarding enchantment pursuit."

**Current hypothesis (Sam's):**
> If partial unlearning is permitted (any number of components from a spell can be taken back without unlearning the whole spell, as long as the Spellbook remains valid), then players at 5-player count will be able to pursue Enchantments without multi-turn overhead, and enchantment uptake will increase.

**Relevant rule — current Unlearn action:**
> Dissolve one spell completely, returning its components to your hand. Components can't be learned into new spells until your next turn. Each Unlearn action targets one spell and costs 1 counter.

Note: Whether partial unlearning (returning some but not all components of a spell) is currently permitted is explicitly ambiguous — this surfaced mid-play in Session 3 and was not resolved.

---

## Failure Mode 2: Enchantments collapse end-game dynamics at the Drought

### The intended experience

The Drought is meant to be a tense final phase where players are racing to optimise their Spellbooks under time pressure — the last chance to arrange components for maximum score before the game ends.

### What actually happened

**Session 1 (2026-05-01, 2 players):**
- Both players had 4-card Enchantments (Unlimited Capacity) when the Drought triggered.
- This turned the Drought into a slow card-by-card collection with no meaningful decisions — players took one card at a time, and the spellbook organisation tension the Drought was designed to create simply did not materialise.
- Assessment: "4-card enchantments at Drought may be overpowered — effectively neutralised Phase 2 dynamics."
- "Both players stalled Phase 2, deferred spellbook organisation to the last turn."

*(Session 3 ended at Source depletion before the Drought was observed, so only Session 1 data is available for Drought dynamics.)*

### Why Unlimited Capacity collapses the Drought

During the Drought:
- Casting is disabled.
- Players draw 1 card per turn from the Released Reserve.
- Players use their counter-based Learning capacity to act on each card as they draw it.

With Unlimited Capacity, a player can perform unlimited learning actions on each drawn card. This means there is no tension in the Drought at all — every card can be optimally slotted, every possible arrangement can be tested, and no decisions need to be deferred. The constraint that was supposed to create pressure (limited learning actions) is removed by the very mechanic that took the most effort to build.

The paradox: Enchantments are the hardest thing to build, but once built, they remove all meaningful end-game decisions.

---

## Your task

These two failure modes look opposite but may share a root cause. Treat them as a system-level problem first, then address each individually.

### Step 1: Identify whether these are independent problems or one problem

The two failure modes are:
- A. Enchantments are too costly to acquire (underutilised in normal play).
- B. Enchantments are too powerful once acquired (trivialise the Drought).

Reason through whether these could be caused by the same underlying design flaw, or whether they are genuinely independent. Consider:

1. Does the high power level of 4-card Enchantments (Unlimited Capacity) justify — and perhaps intentionally explain — why acquiring them should be difficult? Is the difficulty by design, and is the real problem just that the difficulty is *wrong in kind* (requires a specific multi-turn workaround) rather than wrong in magnitude?
2. Could the scoring value of Enchantments (15 pts for a 4-card, exceeding all other 4-card spell types) be contributing to both problems — making them feel worth the costly acquisition path while simultaneously making the end-game outcome lopsided?
3. Is the bootstrapping problem (need capacity to get capacity) a design flaw, an intended challenge, or a mathematical accident of how the system was built?

State your conclusion: one root cause or two independent problems. This determines your solution strategy — a single intervention vs two separate fixes.

### Step 2: Diagnose Failure Mode 1 in detail

Answer: **Why is Enchantment pursuit systematically underrewarded in normal play?**

Work through each potential cause:

1. **Card acquisition friction** — Matching-value cards require holding cards "off-strategy" relative to Conjurations and Transfigurations. How severe is this compared to other games with divergent build paths? Is this expected friction for a meaningful sub-strategy, or pathological friction that blocks the path entirely?

2. **The bootstrapping problem** — You need capacity to learn, but you get capacity from Enchantments. Trace the earliest-possible turn at which a player starting from scratch (1 counter, 7 cards in hand) could theoretically learn their first Enchantment. How many turns does this realistically take given the competing pressures? Compare this to how many turns a player can spend building Conjurations/Transfigurations in the same window.

3. **The Unlearn overhead** — Current Unlearn requires dissolving a whole spell. At 5 players, Source depletion is faster, so the multi-turn cost of pivoting is proportionally higher. Is partial unlearning (Sam's hypothesis) the right lever, or would it introduce new problems — specifically, could partial unlearn make Conjurations and Transfigurations too easy to dismantle opportunistically?

4. **Opportunity cost vs. competitive pressure** — At 5 players, more components leave the Source per round. Does this make it harder to accumulate matching-value cards before the window closes?

State which cause(s) you believe are primary and which are secondary.

### Step 3: Produce a solution for Failure Mode 1

Evaluate at minimum the following three options. You may add others.

**Option A: Introduce partial unlearning**
Allow players to take back any subset of a spell's components (as long as the remaining cards still form a valid spell, or all remaining cards return to hand). Evaluate: does this solve the overhead problem? Does it undermine Conjuration/Transfiguration stability (could players opportunistically strip components mid-game without losing the spell)? What exactly would the rule say?

**Option B: Reduce the first Enchantment's acquisition barrier**
A targeted rule that makes the *first* Enchantment easier to learn — for example, allowing a player to learn an Enchantment using components currently in an existing spell without first unlearning it (a special Learn variant). This would treat first Enchantment as an "unlock" action rather than a full pivot. Evaluate: does this create an exploitable exception? Does it break the economy of learning actions?

**Option C: Change how Enchantment components are acquired**
Rather than requiring a player to hold matching-value cards against the grain of normal play, introduce a rule that makes Enchantment acquisition a natural side-effect of normal play — for example, allowing any spell to be "promoted" to an Enchantment if a matching-value card can be added to extend it into a new arrangement. Evaluate: does this create a clear path without removing the challenge? Is it too confusing as a rule?

For each option: state whether you recommend it, and why or why not. Then state your recommended solution (which may combine elements) and provide the exact rule text for it.

### Step 4: Diagnose Failure Mode 2 in detail

Answer: **Why does Unlimited Capacity trivialise the Drought rather than create a satisfying payoff?**

Work through:

1. **The casting / learning asymmetry during Drought** — The Drought disables Casting but not Learning. This means a player *without* Unlimited Capacity still has a meaningful constraint (limited learning actions per card drawn). What is the specific decision the Drought is supposed to force — and what does Unlimited Capacity remove from that decision?

2. **The timing of Enchantment acquisition** — If Enchantments are hard to get (Failure Mode 1), by what point in the game do players typically acquire them? If most players get their 4-card Enchantment near the end of the Source (as seen in Session 1), does Unlimited Capacity actually provide much benefit during normal play before the Drought? Or is the Unlimited Capacity benefit mostly being realised *during the Drought itself*, which is what makes it feel overpowered there?

3. **Scoring at end-game** — A 4-card Enchantment scores 15 pts *plus* provides Unlimited Capacity for the Drought. Is the combination of score value *and* Drought advantage making Enchantments too dominant at end-game even if they're hard to acquire?

4. **Is this a problem of the Drought mechanic or the Enchantment mechanic?** — Could the fix be on the Drought side (e.g., Unlimited Capacity behaves differently during the Drought) rather than on the Enchantment side?

### Step 5: Produce a solution for Failure Mode 2

Evaluate at minimum the following three options:

**Option A: Cap Unlimited Capacity during the Drought**
During the Drought, Unlimited Capacity reverts to a fixed number of learning actions (e.g., 3 or 4). The Unlimited Capacity marker remains — this doesn't penalise the achievement — but the unlimited benefit is Drought-specific. Evaluate: does a player who worked hard to get Unlimited Capacity feel robbed? What cap value preserves tension without feeling punishing?

**Option B: Change when the Drought triggers**
Instead of triggering when The Source empties, the Drought triggers at a threshold (e.g., the last N cards of The Source are revealed as the "Drought warning"). This shortens the Drought phase and reduces the window in which Unlimited Capacity is dominant. Evaluate: does this create prediction problems (players need to count the deck)? Does it adequately address the collapse of Drought dynamics?

**Option C: Change what the Drought's constraint is**
Instead of Learning being the Drought constraint, introduce a different kind of tension — for example, limiting how many total cards a player may have in their Spellbook at game end (a "capacity ceiling" the Drought forces players to optimize within). Evaluate: is this too complex to introduce mid-game? Does it interact well with counter-based capacity?

State your recommended solution with exact rule text for any new or modified rules.

### Step 6: Integration — do the fixes conflict?

After solving both failure modes, check your solutions against each other:

1. If you recommended partial unlearning (Option A from Step 3), does that change how likely players are to hold 4-card Enchantments at the Drought? Does it make the Drought problem better or worse?
2. Does your Drought fix change the calculus of whether pursuing Enchantments is worth it in normal play? Could it accidentally make Enchantments *less* worth pursuing?
3. Is there a single change that addresses both failure modes simultaneously — for example, a change to how 4-card Enchantments work that makes them more accessible *and* less dominant?
4. Are there any scoring table adjustments implied by your recommendations? If the power of 4-card Enchantments is being reduced, should the 15-point score be reconsidered?

### Step 7: Playtest recommendation

Write two one-paragraph playtest briefs — one per failure mode — specifying what to change before the session, what behaviour to observe, and what result would confirm the fix worked or failed. Make them concrete enough to use without further context.

---

## Constraints

- Do not add new spell types, card types, or game mechanics. The scope is the Enchantment system only — its acquisition path, its Drought behaviour, and its scoring value.
- Your solutions must work at both 2-player and 5-player counts. At 2 players the Source depletes slower; at 5 players faster. Any fix that only works at one count is not acceptable.
- Do not assume any changes to the counter system or turn-stage tracker — those are being addressed separately. Your solutions must be compatible with the existing counter and turn structure.
- Write all proposed rule text in clear, direct language suitable for a player reference card. No passive voice, no jargon, no hedging.
- The Drought is a designed feature that should feel like a climax, not a coda. Any solution that eliminates meaningful Drought decisions is not acceptable even if it fixes the balance problem.

---

## Output format

Deliver your response in seven clearly labelled sections following the step structure above. Lead each section with your conclusion, then show your reasoning. Present all proposed rule text in clearly formatted blocks, distinct from analysis. Do not truncate reasoning for brevity — this is a deep diagnostic task.
