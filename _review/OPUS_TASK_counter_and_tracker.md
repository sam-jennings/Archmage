# Opus Task: Counter Refresh Rule + Turn-Stage Tracker
*Created: 2026-05-07 — self-contained brief, no mid-task feedback required*

---

## What you are

You are a senior board game designer with deep expertise in game mechanics, rulebook clarity, and player cognition. You have been handed a working prototype with two confirmed design/communication problems. Your job is to diagnose both problems fully, determine whether each is a *communication failure* or a *design failure*, and deliver concrete, implementable solutions for both — without asking for clarification.

All source material you need is included below.

---

## The game: Archmage Ascension (summary)

A 2–7 player card game. Players build a *Spellbook* — a tableau of spell cards — by drawing from a central deck (The Source) and arranging components into four spell types: Conjuration (same energy), Transfiguration (sequential values), Enchantment (matching values), and Perfect Transmutation (sequential same-energy). The game ends when The Source depletes and a second "Released Reserve" pool is drawn out. Players score Recognition Points based on their Spellbook at game end.

**Turn structure (normal play):**
1. **Collection Phase** — Draw 1 card from The Source OR take 1 from The Array (5 face-up cards).
2. **Casting Phase** — Activate spells from your Spellbook by placing counters on them (1 counter per spell). Resolve effects immediately. Cast up to [your counter count] spells, or all of them if you have Unlimited Capacity.
3. **Recall** (transition step) — Pick up all counters from cast spells, return them to your pool.
4. **Learning Phase** — Use those same counters to perform Learn/Empower/Reshape/Unlearn actions (1 counter per action).

**Counters** represent *capacity*, not a depletable resource. You get them back every turn via the Recall step. Everyone starts with 1. You gain +1 by learning a 3-card Enchantment (permanently). A 4-card Enchantment gives Unlimited Capacity (special marker; counters set aside). You lose counters by breaking Enchantments apart.

---

## Problem 1: Counter refresh rule is persistently confusing

### Evidence from playtests

**Session 1 (2026-05-01, 2 players, first external playtest):**
- The player was a strategic type who deliberates carefully.
- The counter refresh rule (that counters used in Casting are picked up and reused in Learning) confused him *repeatedly* despite:
  - Verbal explanation from Sam
  - The rule appearing on the reference card
  - The rule appearing on the board
- The confusion persisted across the entire session — it was not resolved by re-explaining.
- Assessment: "Confusion survived explicit explanation + reading the rule on two surfaces. This is either a design problem (the rule is unintuitive) or a very serious clarity failure."
- Likely cause hypothesised: "Counter refresh rule may conflict with player mental models (counters as resources, not capacity)."

**Session 3 (2026-05-03, 5 players):**
- All 5 players felt constrained by learning capacity.
- Only 2 out of 5 players learned any enchantment at all across the entire game.
- Sam himself needed a 2-turn workaround just to create learning capacity for 1 enchantment: unlearned a 4-card conjuration → re-learned it as a 3-card conjuration → learned the enchantment the following turn.
- One player said it felt impossible to focus on enchantments given competing values from conjurations and transfigurations.
- Assessment: "The mechanic itself is not rewarding enchantment pursuit. This is not a rulebook explanation failure — Sam understood the rules perfectly and still needed 2 extra turns."

### Current hypothesis (Sam's)

> If the counter refresh rule is rewritten with a concrete turn-step example, new players will understand it without verbal explanation.

### Current risk (Sam's)

> The counter refresh rule may be unintuitive at a design level, not just a communication level — meaning a rewrite alone won't fix it and the mechanic itself needs rethinking.

### Relevant current rules text

**From the "Understanding Counters" section:**
> Counters are used TWICE each turn:
> 1. Casting Phase: Determine how many spells you can activate.
> 2. Recall (transition): Pick up all counters from your cast spells and return them to your pool. This physical act signals the phase change.
> 3. Learning Phase: Those same counters now determine how many learning actions you can perform.
>
> Important: Counters represent your capacity, not a spent resource — the Recall step returns them to full availability every turn.

**From the Learning Phase section:**
> **Recall (transition step):** Pick up all counters from your cast spells and return them to your pool. If you have unlimited capacity, skip this — your Unlimited Capacity marker is already in front of you and your counters remain set aside.
>
> Your counters now determine learning actions:
> - 1 counter = up to 1 learning action.
> - 2 counters = up to 2 learning actions.
> - Etc.

**From the Quick Reference:**
> Counter Tracking:
> - Start: 1 counter.
> - +1 per 3-component Enchantment learned.
> - 4-component Enchantment: take the Unlimited Capacity marker; set all counters aside.
> - -1 if 3-component Enchantment broken apart.
> - 4-component Enchantment broken apart: return the Unlimited Capacity marker; retrieve your counters.

---

## Problem 2: Players lose track of which turn stage they are in

### Evidence from playtests

**Session 1 (2026-05-01):**
- The same strategic player repeatedly forgot which stage he was on and whether he'd drawn a card yet.
- This happened on multiple turns throughout the session — not a one-off.
- Assessment in session notes: "Likely a turn-tracker or clearer stage-summary UX fix, not a design change."
- The turn has 4 stages, one of which (Recall) is a transition step rather than a "real" phase, which may add to ambiguity.

### Current turn summary (Quick Reference card):

> **Turn Summary (Normal Play):**
> 1. Collection: Draw 1 from Source OR take 1 from Array.
> 2. Casting: Cast spells one at a time, resolve effects immediately.
> 3. **Recall:** Pick up all counters from cast spells and return them to your pool.
> 4. Learning: Use counters for Learn/Empower/Reshape/Unlearn actions (1 counter each).

---

## Your task

Treat these as two interconnected problems within the same turn structure — your analysis of one should inform the other.

### Step 1: Diagnose Problem 1 (counter refresh rule)

Answer this question precisely: **Is the counter confusion a communication problem or a design problem?**

Use the following diagnostic framework:

- **Communication problem** = The mechanic is sound, but players form the wrong mental model because the language or framing misleads them. Fix: better wording, concrete example, or reframing.
- **Design problem** = The mechanic itself conflicts with how people reason about turn-based games, such that no amount of clear language will make it feel natural. Fix: change how the mechanic works.

To decide, reason through:

1. What mental model would a strategic player import from other games when they see "place a token on a card to activate it"? Does the current mechanic match or violate that model?
2. Is the "counter-as-capacity-not-resource" framing fundamentally difficult to hold because it violates a near-universal tabletop convention?
3. Does the Session 3 evidence (all players feeling constrained, Sam needing 2 extra turns even knowing the rules) point toward a design problem independent of communication?
4. Could a very clear rewrite + example resolve the confusion observed in Session 1 — or does the evidence suggest the confusion would persist regardless?

State your conclusion: communication problem, design problem, or both. Give your confidence level.

### Step 2: Produce a solution for Problem 1

**If communication problem (or primarily communication):**
- Rewrite the counter refresh rule from scratch — do not patch the existing text.
- Include a concrete turn-step example showing: start of turn (counters in pool), after Casting (counters on spells), after Recall (counters back in pool), during Learning (counters used for actions). Make the example vivid and walkable, not abstract.
- The rewrite should make the "capacity, not resource" framing land immediately for a player with no prior explanation.
- Where should this rewrite live — Quick Reference card, main rulebook, or both? Specify.

**If design problem (or primarily design):**
- Propose a redesign of the mechanic that preserves the *intent* (capacity that resets each turn, growing Enchantments) but removes the cognitive conflict.
- Evaluate at least two redesign options. For each: describe the change, explain what it preserves, explain what it loses, and state whether you recommend it.
- If redesign is needed, state what the minimum change is that would fix the confusion without disrupting the rest of the system.

**If both:** Address communication first, then redesign — with the understanding that the communication fix may need to be validated in a playtest before committing to a redesign.

### Step 3: Diagnose Problem 2 (turn-stage tracking)

The strategic player repeatedly forgot which stage he was on and whether he'd drawn a card yet.

Diagnose why this happens at a cognitive level:

1. The turn has 4 named stages (Collection, Casting, Recall, Learning) but Recall is a transition step, not a "real" phase with choices. Does this asymmetry make the turn structure harder to hold in memory?
2. The Recall step physically moves components (picking up counters) — does that action help or hurt stage orientation?
3. What happens to a deliberating player's working memory during the Casting phase (ordering spells, resolving effects)? Does that cognitive load make it harder to know which stage comes next?
4. Is the Collection phase (one simple draw action) memorable enough as an anchor for "start of turn"?

### Step 4: Produce a solution for Problem 2

Design a **Turn-Stage Tracker** — a physical aid or rule adjustment that helps players stay oriented. Consider these possible directions (you are not limited to them):

- A physical tracker card players keep in front of them
- A token or marker moved through stage indicators
- A mnemonic or verbal checkpoint baked into the rules
- A restructuring of the turn stages to reduce ambiguity (e.g., collapsing Recall into Casting or Learning)
- A visible shared tracker on the board

For your recommended solution:
- Describe exactly what it is and how it works
- Explain what format it should take (separate card, printed on the board, etc.)
- Explain how it handles the deliberating-player case specifically (someone who pauses mid-turn for a long time)
- State what components or print surfaces would need to change to accommodate it

### Step 5: Integration check

After solving both problems separately, step back and look at them together:

1. Does your counter rule fix affect how the turn stages feel or how players should navigate them? Does the tracker design need to reflect anything about the counter mechanic specifically?
2. Is there a single design intervention that addresses both problems — for example, a tracker that also makes the counter refresh visible?
3. Are there any conflicts or redundancies between your two solutions?

### Step 6: Playtest recommendation

Produce a one-paragraph next-playtest brief: what specific thing to test, what behaviour to observe, and what verdict would confirm that the fix worked or failed. Be concrete enough that someone running the session without further context could use it directly.

---

## Constraints

- Do not add new spell types, card types, or game mechanics. The scope is the counter system and the turn-tracker only.
- Do not assume art or graphic design is available — any physical tracker should work as a simple printed card or text-only reference.
- Do not propose solutions that require changing the 4-phase turn structure unless you conclude it is necessary after diagnosis.
- Your solutions must be compatible with 2–7 players and with both the normal-play and Drought turn structures.
- Write all proposed rule text in clear, direct language suitable for a player reference card — no jargon, no passive constructions, no hedging.

---

## Output format

Deliver your response in six clearly labelled sections following the step structure above. Under each section, lead with your conclusion, then show your reasoning. For any proposed rule text, present it in a formatted block clearly distinct from your analysis. Length should be whatever is required to be thorough — do not truncate reasoning to save space.
