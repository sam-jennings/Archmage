# Counter Refresh Rule + Turn-Stage Tracker — Analysis & Recommendations
*Response to OPUS_TASK_counter_and_tracker.md — written 2026-05-07*

---

## Step 1 — Diagnosis of Problem 1 (Counter Refresh Rule)

**Conclusion: Both, but primarily a design problem. Confidence: high (≈80%).**

A clearer rewrite would help, but the evidence — especially Session 3 — shows that even players who fully understand the rule struggle to *use* it in a way that feels rewarding. That is a design signal, not a communication signal.

### Reasoning

**1. The mental model players import.**
When a strategic player sees "place a token on a card to activate it," they reach for one of three near-universal patterns:

- **Tap-style status**: token/rotation marks a card as "used this turn," refreshes at start of next turn (Magic, most LCGs).
- **Worker placement**: workers placed on action spaces, retrieved at end of round (Lords of Waterdeep, Agricola).
- **Spent resource**: tokens are paid and returned to a general supply or burned (Splendor chips, Race for the Galaxy goods).

In *every* one of those patterns, the placed token does **one job** for the duration of its placement, and the refresh moment is **between turns or rounds**, not mid-turn. The Archmage counter does something almost no other game does: the same physical token serves as a capacity gauge, gets physically committed during Casting, gets retrieved mid-turn, and is then re-used in a different phase as a capacity gauge for a different decision. That is a triple violation of the imported mental model.

**2. The "capacity not resource" framing fights the components.**
"Capacity, not resource" only works if the components don't *behave* like a resource. But Archmage's counters absolutely behave like a resource: they leave your pool, they sit on cards, they have to be picked up. Telling players "these are capacity, not a resource" while they physically spend and reclaim them is asking them to override the evidence in front of their hands. Strategic players especially trust what their hands tell them. The Session 1 player's confusion *survived* explicit explanation on three surfaces because the components were teaching a different rule.

**3. Session 3 is the clinching evidence.**
- All five players felt constrained by capacity.
- Only two of five learned any Enchantment.
- Sam, who wrote the rules, needed a two-turn workaround to free up capacity for a single Enchantment.

This is not confusion — Sam understood the rules perfectly. It is the mechanic itself producing a bottleneck. Capacity is the gate to the only counter-growth path (Enchantments), and capacity is too scarce in the early game for anyone to walk through that gate. The mechanic is fighting its own incentive structure: you need capacity to learn Enchantments, but Enchantments are how you get capacity. The early-game player has one counter, two phases competing for it, and the path to growing it is the most expensive thing they can spend it on.

**4. Could a clean rewrite fix Session 1?**
Possibly, partially. A rewrite with a vivid worked example would probably reduce time-to-comprehension. But it would not change the fact that the components are doing two jobs in one turn, that the framing contradicts what the hands are doing, or that Session 3's bottleneck exists. The communication fix is necessary but not sufficient.

**Verdict.** Treat Problem 1 as a **design problem first**, with a **communication fix as a fallback** if the design redesign is rejected.

---

## Step 2 — Solution for Problem 1

I'll evaluate two redesign options and recommend one. A communication-only fallback is included at the end in case the redesigns are rejected.

### Option A — Capacity Gauge (recommended)

**Change.** Replace the physical pool of counters with a **Capacity Gauge** — a small printed dial or marker card that shows a number from 1 to 4, plus an "Unlimited" face. Each player has one in front of them. Counters are no longer placed on spells. They no longer move during the turn.

**How it works.**

- Game start: Capacity Gauge set to **1**.
- Learn a 3-card Enchantment: Capacity Gauge **+1** (max 4).
- Learn a 4-card Enchantment: flip to **Unlimited** face; the gauge is set aside.
- Break a 3-card Enchantment: Gauge **−1**.
- Break a 4-card Enchantment: flip back; reset gauge to whatever the rest of your spellbook supports.

Each turn:

- **Casting**: Activate up to [Capacity] spells. Resolve effects immediately. The gauge does not change.
- **Learning**: Perform up to [Capacity] Learn / Empower / Reshape / Unlearn actions. The gauge does not change.

The "Recall" transition step is **deleted** because nothing physical needs to be picked up.

**What it preserves.**
- Capacity grows by learning Enchantments.
- Capacity resets each turn (trivially — it never depleted in the first place).
- Two phases each gated by capacity.
- 3-card Enchantment = +1, 4-card = unlimited.
- Identical scoring and game-end behaviour.

**What it loses.**
- The tactile satisfaction of placing counters on spells.
- The visual record of "I activated these spells this turn." (Replaceable with a player turning cast spells 90° if a visual is wanted — but I would argue *no* visual is needed because effects resolve immediately and there's no end-of-turn cleanup that needs to know what was cast.)
- A bespoke component (the Capacity Gauge card or dial).

**Recommendation: yes.** This is the minimum change that removes both the conceptual conflict and the mid-turn dual-use. It also collapses the 4-phase turn into 3 phases, which directly addresses Problem 2 (see Step 3). The component cost is one printed card per player — well within the constraints.

### Option B — Decouple Casting from Counters

**Change.** Counters become a *Learning-only* resource. Casting limit is governed by something else (e.g., "cast up to 2 spells per turn, regardless of Spellbook size"). Counters never enter the Casting phase.

**What it preserves.**
- Physical counters and the tactile feel of using them.
- Learning capacity grows via Enchantments.

**What it loses.**
- The elegant unified rule "your counters tell you everything." Now there are two different caps, one of which is a flat number.
- The narrative reason for capacity to scale at all (the in-fiction case for capacity is "I am a more powerful mage" — that should affect spellcasting, not just learning).
- The Recall step is still needed for Learning, so the 4-phase turn structure stays.

**Recommendation: no, unless Option A is rejected.** It fixes the dual-use confusion but leaves the Recall stage in place (worse for Problem 2) and weakens the thematic coherence of "capacity grows with mastery."

### Option C — Communication-only fallback

If both redesigns are rejected and the existing mechanic must stand, here is a from-scratch rewrite. **Do not patch the existing text.**

#### Quick Reference card — replacement section

> **Counters: your turn capacity**
>
> Counters tell you how much you can do each turn. They are not spent or saved — every turn you have access to all of them.
>
> **Each turn:**
> 1. **Casting.** You may activate up to [counter count] spells. Place 1 counter on each spell you activate.
> 2. **Recall.** Pick up every counter you just placed and put it back in your pool. (This is a quick mechanical step — no decisions.)
> 3. **Learning.** With those same counters, perform up to [counter count] Learn / Empower / Reshape / Unlearn actions.
>
> **At end of turn**, your pool is full again, exactly as it started.

#### Main rulebook — replacement worked example

> **Worked example: a player with 2 counters.**
>
> *Start of turn.* Marta's pool: ●●. Spellbook: a 2-card Conjuration, a 3-card Transfiguration, and a 2-card Enchantment.
>
> *Collection.* She draws a card from The Source.
>
> *Casting.* She decides to activate the Conjuration and the Transfiguration. She places one counter on each spell. Pool: empty. Spells: ● and ●. Effects resolve immediately.
>
> *Recall.* She picks both counters up and returns them to her pool. Pool: ●●.
>
> *Learning.* She uses one counter to Empower a Conjuration (adding a card to it) and the other to Reshape (swap a card in a spell). Pool: empty.
>
> *End of turn.* Her counters return to her pool automatically. Next turn she will start with ●● again.
>
> Marta has used her two counters twice in one turn — once to limit her casting, once to limit her learning. That is normal. Counters always come back.

This is the best the language can do. It will probably reduce Session 1-style confusion. It will not address Session 3's bottleneck.

---

## Step 3 — Diagnosis of Problem 2 (Turn-Stage Tracking)

**Conclusion: Cognitive load + asymmetric stage structure + a forgettable opening anchor. Confidence: high.**

The deliberating player is not failing because the rules are unclear. He is failing because the structure of the turn does not give him persistent external anchors that survive long pauses.

### Reasoning

**1. Four stages, one of which is a transition.**
The asymmetry matters. When a player tries to remember "where am I in my turn?", they reach for the count: *first I draw, then I cast, then I... three? Or is three the picking-up bit?* Recall is procedural — it has no decision, no choice, no commitment. Players don't naturally count it as a stage but it is named and numbered like one. That mismatch between the listed structure (four named items) and the felt structure (two real decisions, with a tidy-up between) creates exactly the kind of "wait, where am I?" failure the strategic player kept hitting.

**2. The Recall action is helpful in the moment, but it is not a stage anchor.**
Picking up counters is a clear physical cue *while it is happening*. But it is over in two seconds. After Recall, the player is back to staring at their hand and their Spellbook with no persistent indicator of "I am now in Learning." The action is too brief to function as a memory anchor for the rest of that phase.

**3. Casting consumes working memory.**
A strategic player choosing spell order, evaluating effects, and tracking board state during Casting has their working memory fully loaded. When they emerge from Casting (and Recall, which barely registers), they often don't have a clear "I just finished phase 2" internal signal — they have a "okay, what was I doing?" signal. Without an external anchor, they default to the strongest cue available, which might be "I haven't drawn yet, right?" — i.e., they reset further than they should.

**4. Collection is too slim to anchor.**
"Draw 1 card" is a one-second action. It does not produce a strong "I have begun my turn" memory. Worse, choosing from The Array (5 face-up cards) involves the same kind of evaluation that happens during Casting and Learning, blurring the boundary between "I'm picking up my new card" and later strategic thinking. A deliberating player may *consider* their draw choice for 30 seconds and then forget whether they actually committed it.

The combination is what does the damage: a turn with one weak opening anchor, one heavy cognitive phase, one near-invisible transition, and one more decision phase. Without a persistent visual marker, the player has nothing to look at when their head comes back up from Casting.

---

## Step 4 — Solution for Problem 2

**Recommended: a per-player Turn Tracker card with a physical bead/token that players slide between stages as they progress.**

### What it is

A small landscape card (~5" wide × 2" tall) printed for each player. Three (or four, if Option A is rejected) labelled boxes left-to-right, with arrows between them. Each player has one glass bead, cube, or dedicated marker that they slide along the card.

### How it works

- **Start of turn.** Slide the bead to the leftmost box (Collection).
- **After drawing.** Slide the bead one box right (to Casting).
- **When you stop casting.** Slide the bead one box right (to Learning).
- **End of turn.** Bead stays where it is until your next turn, when you slide it back to the start.

The act of moving the bead is simultaneously the commitment ("I am done with Collection") and the indicator ("I am in Casting now"). The bead's position is the answer to "where am I?" at any moment. It does not degrade with cognitive load. A player who has been deliberating for three minutes can look at their bead and immediately know.

### Format

- A simple printed card. No art needed — it is text plus three boxes plus arrows. Black-and-white printable.
- Pair with any small marker the players already have (a glass bead, a coin, a meeple from another game, or a bespoke wooden disc if production allows).
- One per player.

If Option A (Capacity Gauge) is adopted, the tracker can share a card with the gauge — both belong on a "Player Mat" sized like a long playing card. This keeps the player's reference surface to one piece per player.

### Suggested layout (3-phase version)

```
┌──────────────┐  →  ┌──────────────┐  →  ┌──────────────┐
│  COLLECTION  │     │   CASTING    │     │   LEARNING   │
│ Draw 1 card  │     │ Activate up  │     │ Up to [cap]  │
│ from Source  │     │ to [capacity]│     │ Learn /      │
│ or Array.    │     │ spells.      │     │ Empower /    │
│              │     │              │     │ Reshape /    │
│              │     │              │     │ Unlearn.     │
└──────────────┘     └──────────────┘     └──────────────┘
```

### Suggested layout (4-phase fallback, if Option A rejected)

```
┌──────────┐ → ┌──────────┐ ╌╌ ┌──────────┐ → ┌──────────┐
│COLLECTION│   │ CASTING  │    │  RECALL  │   │ LEARNING │
└──────────┘   └──────────┘    └──────────┘   └──────────┘
```

The Recall box is rendered with a dashed border and a faint background to mark it visually as a transition, not a "real" stage. The arrow into it is dashed. This signals "this is a tidy-up step, not a decision" without removing it from the structure.

### How it handles the deliberating player

The whole point of the tracker is the deliberating-player case. The bead's position is a constant external memory that does not decay with thought. When a player surfaces from a long pause — five seconds, five minutes — they look at the tracker and see exactly what stage they're in. There is no "wait, did I draw?" question because the bead being on Collection means *no, you haven't drawn yet*, and the bead being on Casting means *yes, you have*.

It also helps neighbouring players catch errors. "Hey, your bead's still on Collection but I think you drew already" is a much easier callout than "wait, what stage are you on?"

### Print surfaces required

- One small Turn Tracker card per player (or per-player section on a combined player mat).
- One marker per player (commodity component, no print required).

If the game already includes a player aid or reference card, the tracker can be added to that surface. No new components beyond the trackers and beads are required.

---

## Step 5 — Integration check

**Conclusion: the two solutions reinforce each other strongly. If Option A is adopted, the tracker becomes 3-phase and is materially easier to grasp. There is one elegant single intervention that addresses both problems at once.**

### Mutual reinforcement

If Option A (Capacity Gauge) is adopted:

- Recall disappears from the turn entirely.
- The turn becomes Collection → Casting → Learning, three phases.
- The tracker has three boxes instead of four, no transition state to render, no asymmetric stage to explain.
- The "where am I?" question becomes structurally easier — three options is closer to the magic-number-three working memory limit.
- Counter mechanics no longer involve mid-turn movement of components, so there is no Recall-shaped gap in the turn structure for players to fall into.

This is a single intervention that addresses both problems: **replace physical counters with a Capacity Gauge, and the Recall stage with nothing at all.** The tracker then becomes a clean 3-phase aid that doesn't have to apologise for the transition step.

### Conflicts and redundancies

- If Option C (communication-only fix) is adopted instead of a redesign, the tracker still works but has to render Recall, which is structurally less clean. Recommend the dashed-border treatment in that case.
- If Option B is adopted, the tracker keeps four stages and Recall is needed only for Learning's counter retrieval. That's the worst of both worlds — the structural awkwardness remains, but the rule becomes more complicated.

### One-card consolidation

The Capacity Gauge and the Turn Tracker can live on the same printed Player Mat:

```
┌─────────────────────────────────────────────────────────────┐
│  CAPACITY:    [ 1 | 2 | 3 | 4 | ∞ ]    ← move marker        │
│                                                             │
│  TURN:    COLLECTION → CASTING → LEARNING    ← move bead    │
└─────────────────────────────────────────────────────────────┘
```

Two markers, one card, every personal piece of state visible at a glance. This is the recommended endpoint.

---

## Step 6 — Playtest brief

> **Test:** Run a 4–5 player session using the redesigned Player Mat (Capacity Gauge replacing physical counters; Turn Tracker with three stages: Collection → Casting → Learning; Recall step deleted). Teach the rules **without** verbal counter explanation — just hand players the mat and the rule sheet and let them read.
>
> **Observe:** (1) During the first three turns, does any player ask how counters/capacity work? (2) During the whole session, does any player ask "did I draw yet?" or lose their place in the turn? (3) How many players learn at least one Enchantment by game end? (4) Does anyone forget to slide the bead between phases, and if so, do they self-correct?
>
> **Verdict — fix worked:** At least 4 of 5 players grasp capacity from the mat alone with no verbal explanation. Zero "where am I in the turn?" lapses across the session. At least 3 of 5 players learn an Enchantment.
>
> **Verdict — fix failed:** Multiple players still ask how capacity works after reading the mat (suggests the gauge labels need rewording, not that the redesign is wrong). Players still lose stage orientation (suggests the tracker needs a stronger physical cue — bigger boxes, a dedicated meeple instead of a bead, or audible verbal checkpoints baked into the rules). Fewer than 2 of 5 players learn an Enchantment (suggests the bottleneck is starting capacity itself, and the next iteration should test starting capacity = 2).

---

## Quick summary for the top of your design notes

- Counter confusion is **a design problem** — the components fight the framing. **Replace physical counters with a Capacity Gauge.**
- Turn-stage confusion is a **cognitive-load + structure problem** — fix with a **per-player Turn Tracker card and bead**.
- Both problems are solved by the same intervention: a **Player Mat with Capacity Gauge + 3-phase Tracker**, which also lets you delete the Recall stage entirely.
- Test with 4–5 fresh players, no verbal counter teach. Pass = capacity grasped from the mat, no lost-in-turn moments, ≥3/5 learn an Enchantment.
