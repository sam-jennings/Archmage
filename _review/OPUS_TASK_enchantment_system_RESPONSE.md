# Enchantment System — Accessibility & End-Game Balance: Analysis & Recommendations
*Response to OPUS_TASK_enchantment_system.md — written 2026-05-07*

---

## Step 1 — One root cause or two independent problems

**Conclusion: One primary root cause, with one structural amplifier. Treat as a single design problem with two surfaces.**

The two failure modes are not independent. They share a single design fault:

> **The 4-card Enchantment is the only payoff in the game whose magnitude is unbounded ("Unlimited Capacity") rather than scaled.** Every other progression in Archmage is incremental — one more counter, one more cast slot, one more learning action, one more point. The 4-card Enchantment alone breaks that pattern by replacing a finite quantity with an infinity.

That single design choice causes both observed failures:

1. **It explains the acquisition cost.** When a payoff is unbounded, no acquisition cost can be calibrated against it. The design has tried to balance the unbounded payoff with a costly, against-the-grain acquisition path (matching values across energies, breaking existing spells). That balancing instinct is correct in principle, but it has nowhere to stop, so it has overshot — the cost feels punitive in normal play because the reward it is paying for is uncomputably large.
2. **It explains the Drought collapse.** The Drought's only constraint is *limited learning actions per drawn card*. Unlimited Capacity literally removes that single constraint. The mechanic that ends the game is structurally answered by the mechanic that the same player has just acquired. The two are designed against each other and the Enchantment wins.

**The bootstrapping problem (need capacity to learn Enchantments, but Enchantments give you capacity) is a separate but reinforcing flaw.** It is not the same problem — bootstrapping would still bite even if the 4-card payoff were finite. But it amplifies the acquisition difficulty, especially at higher player counts, and contributes to Failure Mode 1 in its own right.

So the diagnosis is:

- **Primary root cause:** the binary `+1 counter → Unlimited` jump at the 4th card. Both failure modes flow from this.
- **Secondary structural fault:** the bootstrapping loop (capacity gates capacity-acquisition).
- **Tertiary contextual factor:** scaling of opportunity cost at 5p, where the Source depletes faster.

This matters strategically because it tells me to look for a single intervention at the 4-card level, then add targeted relief for the bootstrap. A naive fix that only made Enchantments cheaper would create a Drought catastrophe; a naive fix that only weakened the Drought benefit would make the costly acquisition feel worse. The two halves must move together.

---

## Step 2 — Diagnosis of Failure Mode 1

**Conclusion: The acquisition path is choked by *two compounding* costs — bootstrap (capacity gates capacity) and Unlearn overhead (whole-spell dissolution). The card-friction cost is intentional and correct; the other two are pathological. At 5p, the Source-depletion clock makes both costs worse.**

### 1. Card acquisition friction — *intentional, do not weaken*

Matching-value cards across different energies are orthogonal to Conjuration (same energy) and Transfiguration (sequential values), and even more orthogonal to Perfect Transmutation (sequential same-energy). This *is* the strategic friction that makes Enchantment a genuine alternative path rather than a free pile-on. Compare to Race for the Galaxy's military vs. consume-trade builds, or Concordia's specialist vs. generalist routes — the friction is the strategy.

A reasonable amount of card friction is the price of a meaningful sub-strategy. The evidence supports that this part is working: in Session 1 (2 players, slower clock), both players *did* eventually build 4-card Enchantments. The friction was navigable. The problem is what surrounds it.

### 2. The bootstrapping problem — *primary cause, structural*

Trace the earliest path:

- **Turn 0:** 7 cards in hand, 1 counter, 0 spells learned. Counter must serve both the (disabled) Cast phase and the Learning phase.
- **Best-case turn 1:** Player drew exactly 3 matching-value cards in their opening 7. Probability of this in a 5-energy 1–10 deck ≈ low single digits. They could spend their 1 counter to learn an Enchantment. *Realistic? No — players will almost never see this hand.*
- **Realistic turn 1:** Player has *some* useful clusters. The marginal best play is almost always to learn a 3-card Conjuration or Transfiguration if any is available — these provide *immediate, repeatable* utility (draw bonus, Array exchange). Learning an Enchantment first means you have a passive +1 counter and nothing to *do* with it for at least a turn or two.
- **Turns 2–N:** Now the bootstrap bites. The player has 1 counter. Every turn it goes to either Casting or Learning, never both meaningfully. To learn an Enchantment, they need to (a) hold matching-value cards in hand without learning them into another spell, (b) spend their single learning action on the Enchantment instead of growing an existing spell or casting a useful one. Each turn they choose Enchantment-prep over an alternative, they fall behind on board state.

**By contrast**, a Conjuration-focused player has zero bootstrap problem: every learning action grows a spell that pays off the *next* turn (cast it, draw bonus cards). Each turn compounds. The Enchantment-focused player has to *wait* for compounding to begin.

This is a textbook negative-feedback design: the path to capacity *requires* capacity. The only way out is the player choosing to absorb several disadvantaged turns before the system pays them back. Most players, especially first-timers, won't do this, and won't even realise it's a viable route.

### 3. Unlearn overhead — *secondary cause, fixable*

The current Unlearn rule dissolves a whole spell. This makes the natural pivot ("I already have a 4-card Conjuration on the table that includes a useful matching-value card; can I peel one card off it to start an Enchantment?") cost two full turns and *destroy the spell*. Sam's 2-turn workaround in Session 3 is evidence that the rules-correct path is pathological even for an expert.

If partial unlearning were permitted, the same pivot becomes: 1 turn to free a card from a 4-card spell (now a 3-card spell, intact), 1 turn to learn the Enchantment with the freed card. Same number of turns Sam used — but the existing Conjuration *survives* as a 3-card, salvaging most of its score and effect. The pivot stops feeling like self-sabotage.

The risk people raise about partial unlearn is that it would let players opportunistically strip components from spells without losing the spell. I'll address that risk in Step 3 — the answer is to keep the counter cost and the next-turn delay, which preserves the cost structure while fixing the all-or-nothing penalty.

### 4. 5p opportunity-cost — *contextual amplifier*

At 5 players, the Source empties roughly 2.5× faster than at 2 players, and there are 5 hands competing for matching-value cards rather than 2. This compresses the window in which a player can accumulate matching-value cards before the Drought triggers. In Session 3 (5p), only 2 of 5 players acquired any Enchantment, vs Session 1 (2p) where both players got 4-card Enchantments.

The 5p effect is real but secondary. It would not by itself produce the failure mode if the bootstrap and Unlearn costs were milder.

### Primary vs secondary

- **Primary (must fix):** Unlearn overhead (Cause 3). It is the most actionable lever and the one Sam already correctly identified.
- **Co-primary (must fix):** Bootstrap (Cause 2). Without addressing this, even cheap Unlearn won't help the player in turns 1–3 who has nothing to unlearn yet.
- **Intentional, leave alone:** Card friction (Cause 1).
- **Will resolve as a side-effect of fixing the above:** 5p opportunity cost (Cause 4).

---

## Step 3 — Solution for Failure Mode 1

**Conclusion: Adopt Option A (partial unlearning) as the structural fix, plus a small bootstrap-relief rule that lets the Recall step's first counter retrieval double as a learning action *if and only if* it is being used to learn the player's first Enchantment. Reject Option B (one-time first-Enchantment exception) and Option C (promotion mechanic) as proposed.**

### Evaluation of Option A — Partial Unlearning

**Recommended.** This is the right structural lever.

- **Does it solve the overhead?** Yes — partially. Pivoting no longer destroys the source spell. A 4-card Conjuration becomes a 3-card Conjuration, not a hand of components. Score is preserved, the spell remains castable next turn.
- **Does it undermine Conjuration/Transfiguration stability?** Risk exists, but it is bounded by three constraints I will keep:
  1. The action still costs 1 counter (Learning capacity is finite).
  2. Returned components cannot be re-learned the same turn (no zero-cost shuffles).
  3. The remaining cards must still form a *valid* spell of the same type (no orphaning a Transfiguration into 2 sequential cards).
  Under those constraints, partial unlearn is not a free optimisation tool — it is a costed pivot tool. A player who partially unlearns is paying the same counter cost as a full Unlearn but trading less spell value for it. That is a strictly less-disruptive option and correctly priced.
- **Does it work at 2p and 5p?** Yes. The cost is per-action, not per-game, so it scales with the existing turn structure rather than with the Source clock.

### Evaluation of Option B — First-Enchantment exception

**Reject.** A one-time exception that lets a player learn an Enchantment using cards still in another spell is an exploitable rules edge: the player gets two spells worth of value from one set of cards for one action. Even scoped to "first Enchantment only," it is an unintuitive carve-out that is hard to explain at the table, hard to track ("did Aisha already use her freebie?"), and creates a feel-bad moment for late-game players who learned their first Enchantment by the costly path. It also doesn't help the player who is on their *second* Enchantment — which is exactly the Drought-bound 4-card case.

### Evaluation of Option C — Promotion mechanic

**Reject as proposed.** The proposal — extending an existing spell into a new arrangement — fights the card requirements of the spell types. Conjuration is *same energy*; Enchantment is *same value, different energies*. There is no card you can add to a Conjuration to make it an Enchantment, because the existing Conjuration cards share an energy. The only structural promotion that *would* work is from a Transfiguration (sequential values, any energy) to an Enchantment (same value, any energy) — and those are also disjoint in card requirements.

The only working version of "promotion" would be Reshape-style: rearrange existing tableau cards into a different valid spell layout. That already overlaps with the existing Reshape action and would need extensive scoping to avoid corner cases. Not worth the rules complexity.

### Bootstrap relief — additional small rule

Partial unlearn alone doesn't fix the player who is staring at three matching-value cards in hand on turn 2 with one counter and no existing spell to peel from. The bootstrap is a turns-1-to-3 problem and is structurally upstream of any Unlearn rule.

The least invasive lever is to make the Recall→Learning sequence on turn 1 (or first-Enchantment turn) carry a small bonus that helps a player who is investing in capacity rather than in immediate spell value. The rule below adds one extra Learning action *only* in the turn the player learns their first Enchantment, and *only* if they are using it to learn that Enchantment. It is one-shot per game, easy to track (the Enchantment itself is the marker), and only useful to players actually pursuing the strategy.

### Recommended rule text

> **Partial Unlearn (replaces current Unlearn).**
> For 1 counter, return any number of components from one of your spells to your hand. The remaining components on the table must either form a valid spell of the same type, or all be returned (fully dissolving the spell). Components returned this way may not be learned, empowered, or reshaped into any spell until your next turn.

> **First Enchantment relief.**
> The first time during the game you learn an Enchantment, that Learn action costs 0 counters instead of 1. This applies only to the action that creates your first 3-card Enchantment, and only once per game.

The first rule is the structural fix. The second is the bootstrap relief — small, scoped, self-limiting (it cannot be re-used to build a 4-card Enchantment because the 4-card is built by Empower, not by re-learning).

### Why this combination

- The partial unlearn rule does the heavy lifting for mid-game pivots.
- The first-Enchantment relief gets early-game players over the bootstrap hump without a free-payoff exception that would carry through the whole game.
- Together they preserve the intentional card-acquisition friction (Step 2 Cause 1) and only lower the costs that were pathological.
- Both rules are short enough to fit on a player aid card.

---

## Step 4 — Diagnosis of Failure Mode 2

**Conclusion: The Drought has exactly one constraint — limited learning actions per drawn card — and Unlimited Capacity removes exactly that constraint. The collapse is not a coincidence; the Enchantment payoff and the Drought constraint are designed in the same currency, with the former unbounded against the latter. Compounding this, the Enchantment's score advantage and its Drought advantage stack into a single end-game payoff that no other spell type can match.**

### 1. The casting/learning asymmetry during the Drought

The Drought disables Casting and keeps Learning. The intended design tension is:

> "You drew a card. You can learn it, empower a spell with it, reshape your tableau around it, or pass on it. You cannot do all of these; choose."

That tension exists *only* if Learning is rate-limited. Rate-limit comes from counters: you have N counters, you can do N learning actions per turn. A player without an Enchantment has 1 counter (1 action). A 3-card Enchantment player has 1 counter + 1 bonus action = 2 actions. A 4-card Enchantment player with Unlimited Capacity has *as many actions as they want*.

So the intended Drought decision — *which arrangement to commit to* — is removed entirely for the UC player. Every drawn card can be tested in every position. There is nothing to defer, nothing to triage, nothing to regret. The mechanic doesn't degrade gracefully under UC; it goes from constraint to non-constraint at the moment of crossing the 3→4 threshold.

This is the single most diagnosable design fault in the system: **the Drought's primary constraint is exactly what UC removes.** The two are dimensionally identical.

### 2. The timing of acquisition

Session 1 evidence: both players had 4-card Enchantments *when the Drought triggered*. They built across the whole Phase 1 and reached 4-card mostly toward its end. This means:

- Most of Phase 1 was played *without* UC for both players.
- UC's benefit was realised primarily *during* the Drought (Phase 2).
- Therefore, UC is being implicitly *priced* by its Drought value, not its Phase 1 value.

This is the worst possible pricing posture: the cost is paid in Phase 1 (where the player gets little benefit from UC), and the benefit is realised in Phase 2 (where it is overwhelming). Players don't experience UC as a tool they wielded for a long stretch — they experience it as an end-game lever that suddenly trivialises everything.

In Session 1's 2-player game, this lopsidedness was masked because both players had it. But it would still produce the "deferred all spellbook organisation to the last turn" pattern observed: with UC, it is *correct* to defer, because there is no cost to doing so.

### 3. Scoring stacks with the capacity benefit

A 4-card Enchantment scores 15 points (the highest 4-card payout in the game) *and* grants UC. By contrast:

- 4-card Conjuration: 4 pts, draws bonus cards (negated by the Drought disabling Casting).
- 4-card Transfiguration: 7 pts, exchanges with the Array (negated; the Array is gone in the Drought).
- 4-card Perfect Transmutation: 10 pts, both above effects (both negated).

In the Drought, every other 4-card spell's *active* effect is gone. Only Enchantment's effect (UC) survives, and it survives in a context where it is dominant. That means the 15-pt score is being earned in the same window in which the *only* active mechanical advantage left in the game is also active — a double-payoff window.

### 4. Drought-side fix or Enchantment-side fix?

Should the change be on the Drought side or the Enchantment side?

- **Drought-side fixes** affect every player, including those who never built an Enchantment. They risk punishing the non-UC player for the UC player's existence. They also risk weakening a phase that, for non-UC players, already works correctly — Session 1's non-UC dynamic is fine in principle.
- **Enchantment-side fixes** target the precise interaction that breaks. They affect only players who chose this strategy, and they affect them only in the phase where the imbalance shows up.

Conclusion: the fix belongs on the Enchantment side, specifically scoped to UC's behaviour during the Drought.

---

## Step 5 — Solution for Failure Mode 2

**Conclusion: Adopt Option A (cap UC during the Drought) at *3* learning actions per turn, and reduce the 4-card Enchantment score from 15 → 12 points to reflect the smaller Drought advantage. Reject Option B (early Drought trigger) and Option C (capacity ceiling) — both attack the wrong layer.**

### Evaluation of Option A — Cap UC during the Drought

**Recommended.** Targeted, dimensionally correct, preserves the achievement.

- **Cap value.** I recommend 3 actions per turn during the Drought, not 4 or 5. Reasoning:
  - A non-UC player has 1 counter = 1 learning action per turn.
  - A 3-card Enchantment player has 2 learning actions per turn (1 counter + 1 bonus from the Enchantment).
  - At 3 actions, the UC player has *one more* action than the 3-card Enchantment player. Meaningful but not overwhelming.
  - At 3 actions, the UC player must still triage: not every drawn card can be optimally placed; not every reshape can be tested. The Drought decision survives.
  - At 4+ actions, the player is back to "do whatever you want" because most Drought turns won't surface more than 3 useful actions per drawn card anyway.
- **Does the player feel robbed?** No, if the framing is right. The Unlimited Capacity marker stays. The player still gets unlimited capacity through all of Phase 1. They earned a permanent capacity unlock plus a 12-pt scoring bonus plus 3 learning actions per Drought turn (3× a baseline player). That is a substantial reward for the hardest build in the game. The cap is targeted at the specific phase where unlimited becomes a non-decision.
- **2p vs 5p compatibility.** Same rule, both counts. A 2p game with one UC player no longer has a Drought trivialised by the marker; a 5p game with the rare UC player still rewards the achievement without breaking the phase for everyone.

### Evaluation of Option B — Earlier Drought trigger

**Reject.** This is a Drought-side fix that doesn't address the actual problem. Triggering the Drought earlier shortens the dominant window but doesn't change the dynamic inside it — UC still trivialises the (now shorter) phase. It also introduces card-counting overhead ("how many cards left in the Source?") that players already struggle with, and shortens a phase that for non-UC players is the climax of the game.

### Evaluation of Option C — Capacity ceiling at end-game

**Reject.** A new constraint — total cards in Spellbook capped at game-end — is interesting in the abstract but is the wrong mechanism here. It penalises *all* players for one player's Enchantment. It introduces a new global rule mid-game (the brief specifically warns against this). It interacts oddly with how scoring already works (you'd be telling players to *not* learn cards toward the end, which is the opposite of the Drought's intended push). And it doesn't actually neutralise UC: a UC player will still use their unlimited learning to optimise their tableau within the new ceiling more effectively than a 1-counter player.

### Recommended rule text

> **Drought Capacity Cap.**
> During the Drought, Unlimited Capacity grants 3 learning actions per turn instead of unlimited. Players keep the Unlimited Capacity marker and continue to ignore the counter pool for Casting (which is disabled during the Drought regardless).

> **Updated 4-card Enchantment scoring.**
> A 4-card Enchantment scores **12 points** (down from 15).

The score adjustment is small but deliberate. It keeps the 4-card Enchantment as the highest-scoring 4-card spell (12 vs. 10 for Perfect Transmutation), which is correct given that it is also the hardest to build and the most strategically distinctive. But it closes the runaway gap between Enchantment and PT at the same size, which was the most visible scoring imbalance in the table.

### Why this combination

- The cap addresses the dimensional fault (UC vs. Drought constraint are in the same currency) by bounding UC inside the constraint.
- The score adjustment addresses the stacked-payoff problem (15 pts + dominant Drought benefit = double payoff) by trimming the score side of the stack.
- Both changes are local to the Enchantment system as the brief required.
- Neither change weakens the Phase 1 experience of having UC.

---

## Step 6 — Integration: do the fixes conflict?

**Conclusion: The two solutions reinforce each other, with one deliberate offset I'll call out below. The combined system is more accessible *and* more balanced. No additional changes needed beyond the scoring trim already proposed in Step 5.**

### 1. Does partial unlearning increase 4-card Enchantments at the Drought?

Yes, marginally. If acquisition is easier, more players will reach 4-card. That would have made the Drought collapse worse under the old rules. Under the new rules with the Drought UC cap, it is fine — more players reach the achievement, but the achievement no longer breaks Phase 2. This is the right direction.

### 2. Does the Drought UC cap reduce Enchantment motivation?

A little, in a precise way: the marginal utility of going from 3-card to 4-card during the late game is reduced because the Drought benefit is now bounded. But:

- The 3-card → 4-card path still grants unlimited capacity through *all of Phase 1* (unchanged).
- The 4-card still scores 12 points, twice the 3-card's 6.
- The 4-card still grants 3 actions per Drought turn — meaningfully more than the 2 a 3-card holder gets.
- The "Unlimited Capacity moment" — the dramatic flip of the marker, the setting aside of the counter pool — survives unchanged.

So the strategy remains attractive in normal play, where the bulk of the benefit was always being earned. The Drought-only adjustment doesn't dampen the Phase 1 fantasy.

### 3. Is there a single change that fixes both modes?

Tempting candidates:

- **Replace Unlimited Capacity with "+3 capacity"** would address both. But it loses the emotional payoff of the Unlimited marker (a designed climax) and changes the player's relationship to the counter pool throughout Phase 1. Net negative on game feel.
- **Add a cost to *using* UC each turn** (e.g., discard a card per learning action above N). Adds rules complexity and a new resource interaction.
- **Allow 4-card Enchantment to be built incrementally with no Unlearn cost** (a structural acquisition fix that could justify the dominant Drought payoff). But it doesn't help the bootstrap and would make UC even more common at the Drought.

None of these is cleaner than the two-rule fix proposed (partial unlearn + Drought cap). The two failure modes appear at different layers — acquisition (rules friction) and end-game (mechanical constraint) — and a pair of small layer-specific rules is the right shape of fix.

### 4. Implied scoring adjustments

Already addressed: 4-card Enchantment 15 → 12. No other scoring changes implied.

A note on Conjuration scoring, which the brief did not ask about but which the analysis surfaces: 4-card Conjuration scores only 4 pts and its active effect is negated in the Drought. It looks weak by comparison with the post-fix Enchantment scoring. That is out of scope for this task, but worth flagging for the next pass.

---

## Step 7 — Playtest recommendations

**Brief 1 — Failure Mode 1 (acquisition).**
Before the session, adopt the partial-unlearn rule and the first-Enchantment relief rule. Run a 5-player game. Track three specific behaviours: (a) for each player, the number of turns between their first matching-value card pair entering hand and their first 3-card Enchantment being learned — target ≤ 2 turns of overhead vs. the cost of a normal Learn; (b) the proportion of players who learn ≥ 1 Enchantment by the Drought — target ≥ 4 of 5, vs. the current 2 of 5; (c) any instance of a player using partial unlearn purely to game scoring (peeling a high-value component from a spell to redeploy it elsewhere) — flag if observed. Confirm the fix worked if (a) and (b) hit target *and* (c) does not occur or occurs at most once per game per player. Confirm the fix failed if uptake is unchanged, or if partial unlearn becomes a default tactic rather than a pivot tool.

**Brief 2 — Failure Mode 2 (Drought collapse).**
Before the session, adopt the Drought UC cap (3 actions per turn) and the updated 4-card Enchantment score of 12. Run a 2-player game where at least one player is encouraged toward the Enchantment path so a 4-card Enchantment is in play at the Drought. Watch for two specific observations: (a) does the UC player make non-trivial *choices* during each Drought turn — i.e., visibly skip a placement, defer a reshape, or settle for a sub-optimal arrangement because they ran out of actions? Target: at least one such choice per Drought turn. (b) Does the UC player still feel rewarded for reaching 4-card — measured by post-game self-report rather than in-game behaviour? Target: subjective satisfaction with the Enchantment investment, no "I worked hard for that and got nothing" framing. Confirm the fix worked if the UC player triages each turn *and* doesn't feel cheated; confirm the fix failed if the Drought still plays as deferred-everything-to-last-turn or if the player reports the UC payoff feels insulting given the build cost.

---

## Summary of proposed rule changes

For the player aid:

> **Partial Unlearn.** For 1 counter, return any number of components from one of your spells to your hand. The remaining components must either form a valid spell of the same type, or all be returned (fully dissolving the spell). Components returned this way may not be learned, empowered, or reshaped into any spell until your next turn.

> **First Enchantment.** The first time you learn an Enchantment in the game, that Learn action costs 0 counters. Once per game.

> **Drought Capacity Cap.** During the Drought, Unlimited Capacity grants 3 learning actions per turn instead of unlimited. The Unlimited Capacity marker is unchanged.

> **4-card Enchantment scoring.** 4-card Enchantments score 12 points (was 15).

No other rules are touched. The counter system, turn structure, casting, and Drought trigger conditions are unchanged.
