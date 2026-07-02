---
title: Expansion Concepts - Player Interaction & Conflict
type: design-exploration
status: draft-for-review
created: 2026-06-04
relates_to:
  - "[[Archmage Ascension - Complete Rulebook]]"
  - "[[Ascension Trials]]"
---

# Expansion Concepts — Player Interaction & Conflict

Three optional expansion modules that add interaction and conflict to the **main phases** of Archmage Ascension (Collection / Casting / Learning), where the base game is currently near-solitaire. Each is a self-contained, opt-in module — exactly the way *Ascension Trials* sits beside the base game — so none of them destabilises the core loop for players who don't want them.

They are deliberately spread along a complexity / deviation spectrum:

| | **A — The Living Array** | **B — Spell Duels** | **C — The Conclave** |
|---|---|---|---|
| Flavour | Indirect / competitive | Direct / take-that | Political / negotiation |
| Added components | ~none | small (tokens + ref card) | most (tokens, agendas, board) |
| Rules deviation | minimal | moderate | largest |
| Best player counts | 2–7 | 2–7 | 3–7 (2p reduction included) |
| One-line hook | The shared market actually runs dry | Channel interference at your neighbours | Form pacts, trade favours, vote the rules |

Each section below gives the concept, a first (naive) version, the problems I found when stress-testing it, the fixes, and a clean final ruleset — plus how it scales, how it behaves in the Drought, components, and the residual risks worth a playtest.

---

## A note before you build any of these (stage check)

`STATE.md` currently puts the project at **Stage 3 — Core Loop Testing**, with the Enchantment-capacity economy still unresolved, and it explicitly lists "steal-cards or conflict mechanics" under *Not doing yet*. That instinct is correct and worth protecting: **don't develop or test any of these until the base core loop is locked.** The right way to hold them is the way you already hold Trials — designed, parked, and clearly optional. Treat this document as concept work on the shelf, not a Stage-3 work item. With that said, here are three designs worth having ready.

---

# Expansion A — The Living Array
### Indirect / competitive · ~zero new components · minimal deviation

**The fantasy:** As the Source weakens, the Academy can no longer instantly crystallise a replacement every time a wizard takes from the Array. The shared market now *thins out* over each cycle. The components everyone can see become a contested, dwindling pool — you race rivals for what you need, and a card you leave on the table may be gone before your next turn.

This is the lightest possible way to convert the Array from a vending machine (take one, an identical slot refills instantly, nobody is denied anything) into a genuine shared market that rewards reading the table.

### The core change (one rule)

> In the **Collection phase**, when you *take* a component from the Array, **do not replace it immediately.** The Array refills back to full **from the Source at the start of each round** (when the start player begins their turn).

Everything else about the game is untouched.

### First version and the problems it surfaced

**v1 (naive):** "The Array never auto-refills; it only refills to full at round start." Clean idea, but stress-testing broke three things:

1. **Transfiguration/Perfect Transmutation could brick.** Those spells *must* claim from the Array to be cast (and the rules already say if you can't complete the exchange, you can't cast). If earlier players had emptied the Array during Collection, a Transfiguration player could lose their whole Casting phase through no fault of their own — a feel-bad, and a balance hit to two of the four spell paths.
2. **The Source clock drifted.** Batching all refills to round-start changes how fast the Source depletes, which moves the Drought timing — a big side effect for a "light" module.
3. **High player counts starved.** With 7 players and a 5-card Array, the market is empty almost immediately every round; late-in-order players never get a Collection pick.

### The fixes (v2)

- **Separate the two ways the Array empties.** Only **Collection-phase *takes*** deplete the market without replacing. **Spell-casting claims** (Transfiguration / Perfect Transmutation) still replace the claimed card immediately, exactly as in the base game — thematically, a *formal channelled transmutation* still makes the Academy crystallise a replacement, whereas simply grabbing a crystallised component does not. This single distinction fixes **both** the brick risk *and* the Source-clock drift: casting behaves identically to today, so the Drought arrives on the same schedule; only the Collection race is new.
- **Scale the Array with the deck split you already use.** The base game already switches decks at 5 players. Piggyback on it: **5-card Array for 2–4 players, 7-card Array for 5–7 players.** Scarcity stays proportional instead of brutal at high counts.
- **Empty-Array safety valve.** If the Array is ever completely empty when a player begins their Collection phase, that player refills it to full from the Source before choosing. Nobody is ever fully locked out; you can only be denied *specific* cards that were taken before you this round.

### Final ruleset (A)

1. **Setup:** Array size is 5 (2–4p) or 7 (5–7p).
2. **Collection — take:** taking an Array component leaves a gap; it is **not** refilled until round start.
3. **Collection — draw:** drawing blind from the Source is unchanged and is always available.
4. **Casting — Transfiguration / Perfect Transmutation:** claim from the Array and **replace immediately from the Source**, as in the base rules.
5. **Round start:** the start player refills the Array to full from the Source, then takes their turn.
6. **Safety:** an empty Array at the start of any player's Collection phase is refilled to full before they act.
7. **Drought:** the Array dissolves into the Released Reserve as normal — this module simply ends, with no special handling.

### How it plays / what interaction it creates

Other players' turns now matter to you: you watch the Array thin out and re-plan, which is the cheapest possible cure for multiplayer-solitaire downtime. You can **deny** a rival by taking the card you can see they're building toward — but it's clean, first-come denial, never an attack on their work, so there's no feel-bad and nobody gets singled out. Turn order gains real meaning (early order = first pick of a fresh market; late order = scraps but full information), which is a fair, self-correcting tension.

### Scaling 2–7

- **2p:** mild — the market thins by ~2 cards/round, so this mostly sharpens the existing Source race. Fine; 2p tension lives elsewhere.
- **3–5p:** the sweet spot — visible, frequent contests over specific cards.
- **6–7p:** the 7-card Array keeps it competitive without starving; the safety valve protects the last players in order.

### Components

None required. Optionally a **start-player token** if you don't already use one (needed to mark "round start" cleanly).

### Residual risks → playtest first

- **Transfiguration contention.** Even with self-replacing casting claims, Collection-phase denial subtly pressures sequence-builders (they rely on specific values). Watch whether Transfiguration/Perfect Transmutation uptake drops; if so, the dial is "Array refills to full at the start of every *turn*" (weaker scarcity, safer for sequence paths).
- **Turn-order fairness.** Confirm that going last isn't strictly punishing across a whole game. If it is, rotate the start player each round (standard) or let the last player in a round draw 2 and keep 1 as compensation.

---

# Expansion B — Spell Duels
### Direct / take-that · small component footprint · moderate deviation

> **Iterated further:** a deeper, frequency-driven rebuild of this module lives in [[Expansion B - Spell Duels (Deep Dive)]] — duel power now comes from each card's resonance frequency. The sketch below is the original concept.

**The fantasy:** Wizards stop being polite. You channel raw, unstructured energy *at* a rival — destabilising their flow, suppressing a spell, siphoning attuned energy out of their hand. The Academy's regulated calm gives way to open magical interference.

This is the direct-conflict module. The entire design problem here is making take-that *not* feel awful: the course's own warnings — kingmaking, ganging up, snowballing, and game-state volatility that makes planning pointless — are exactly the failure modes this has to dodge.

### Design rules I committed to up front (the anti-feel-bad spine)

1. **Never destroy built spells.** Attacks are *tempo* — delay, tax, suppress, or pull from the **hand** — never removal of components already arranged in a Spellbook. This protects players' plans from turn-to-turn volatility, the thing that makes people stop planning.
2. **Attacks cost real resources.** You pay with energy components from your hand, so interference has genuine opportunity cost and can't be spammed.
3. **The target always has counterplay.** Every disruption can be warded, so being hit is a decision point, not a helpless moment.
4. **You can only reach your neighbours.** This is the structural firewall against ganging up and dogpiling the leader.

### First version and the problems it surfaced

**v1 (naive):** "Spend energy to: steal a random card from any player's hand; or destroy one spell in any player's Spellbook; or skip a player's next cast." Stress-testing wrecked it:

1. **Destroying built spells = planning death.** Watching your Spellbook get dismantled between your turns is the single worst version of game-state volatility; people disengage.
2. **"Any player" = dogpile the leader.** Free targeting means everyone hits whoever's ahead → kingmaking and runaway negativity.
3. **Random hand-steal = pure feel-bad** with no counterplay.
4. **"Skip your cast" is too swingy** — at low capacity, skipping a turn's cast can be game-deciding, which is exactly when kingmaking hurts most.

### The fixes (v2 → v3)

- **Cut destruction entirely.** Replace with **Suppress**: tap one of the target's spells so it can't be *cast* next turn. The spell is untouched and fully scores; only its tempo is denied for one turn.
- **Neighbour-only targeting.** You may only channel at a player **adjacent** to you in seating. This scales perfectly: at 2p it's a duel; at 7p you threaten only two of six rivals, so no one can be six-on-one'd.
- **Steal becomes a *chosen* give, tied to an energy.** **Siphon** names an energy; the target hands you one component of that energy *of their choice* (or nothing, if they hold none). Choice removes the feel-bad; the energy tie gives counterplay (don't hoard the energy a neighbour is siphoning) and keeps it thematic.
- **Keep every effect small (one tempo point).** No single disruption is decisive — decisiveness is what makes kingmaking toxic. The pressure is cumulative and readable, not a sudden swing.
- **Add a per-round shield.** After you're hit, you take a **Warded** token; you can't be targeted again until the start of your next turn. This blocks focus-fire even between two neighbours.

### Final ruleset (B)

**New step:** during your **Casting phase**, in place of casting one spell, you may **Channel one Disruption** at an adjacent player. You may Channel at most **once per turn**. Each Disruption is paid from your hand and can be **Warded**.

**The Disruption menu (channel one):**

| Disruption | You pay | Effect on target (next turn) | Counterplay |
|---|---|---|---|
| **Drain** | 2 components of one energy | −1 capacity (cast/learn one fewer); minimum 1 | Ward |
| **Suppress** | 3 components of one energy | choose one of their spells; they can't *cast* it next turn (it still scores) | Ward |
| **Siphon** | 1 component, value 6+ | name an energy; they give you one such component **of their choice** (or nothing) | Ward |

**Ward (the universal defence):** when targeted, the defender may **discard 2 components** from hand to negate the Disruption entirely. Resolved immediately, then play continues — no deeper interrupt stack.

**Warded token:** a player who has been hit (or who Warded) gains a **Warded** marker and cannot be targeted again until the start of their next turn. Discard the marker then.

**Spent components** go to the Arcane Reserve (feeding the eventual Released Reserve), consistent with the base game's "drained energy" fiction.

### How it plays / what interaction it creates

Turns become a live read: who's about to come online, who's vulnerable, is it worth paying tempo to slow them. Because attacks are small, costed, neighbour-bound, and wardable, the table stays tense without turning into a pile-on. The attacker always pays — which also throttles snowballing, because the player in the lead spends *their own* resources to interfere and falls behind on building while doing it.

### Scaling 2–7

- **2p:** a true duel — both players are each other's only target. The **Warded** token and the deliberately *small* effects are what stop 2p snowballing (the course's main 2p warning). Watch this count most closely.
- **3–5p:** ideal — meaningful threats in both directions, no dogpiles.
- **6–7p:** still clean because reach is local; the table naturally fragments into overlapping duels rather than one global brawl.

### Drought handling

The Casting phase doesn't exist in the Drought, so Disruptions naturally **switch off** when the Source runs dry. That's thematically perfect (external magic collapses) and means the endgame stays a calm, solitaire optimisation — no last-second griefing of someone's final score.

### Components

A **Disruption reference card** per player (the menu above), a few **Suppress** tokens, and a set of **Warded** tokens. No new card deck — disruptions are paid with the energy components already in the game, which keeps the economy unified.

### Residual risks → playtest first

- **2p snowball.** The headline risk. If the leader can Drain-lock the trailer turn after turn, tighten the shield (e.g. "can't be Drained twice in a row") or raise Drain's cost.
- **Downtime from reactions.** The single Ward decision is fast, but watch total turn length; if it drags, make Disruptions resolve with no reaction and instead bake counterplay into the Warded token only.
- **Siphon fizzle.** If "give of your choice" makes Siphon feel toothless, change it to "they reveal hand; you take the lowest of the named energy" — still bounded, slightly sharper.

---

# Expansion C — The Conclave
### Political / negotiation · largest component footprint · biggest deviation

**The fantasy:** With magic failing, the Academy convenes the surviving wizards into a Conclave. Power is no longer just built — it is *brokered*. You strike binding pacts, trade attuned energy and favours, and bend the failing infrastructure itself through coalition votes. Alliances form, hold, and shatter.

This is the ambitious "big-box" module. Negotiation games are the hardest to get right: kingmaking, charisma-quarterbacking, analysis paralysis, runaway alliances, and the fact that real politics simply **doesn't exist at 2 players** are all waiting to sink it. The design below is built specifically around disarming those.

### First version and the problems it surfaced

**v1 (naive):** free table-talk deals, an open round-by-round vote on global rules, and a reputation track that rewards trustworthiness. Stress-testing found five serious faults:

1. **2-player politics is degenerate** — no coalition space, so every "vote" is just the higher resource winning and every "deal" is a straight trade. Politics needs 3+.
2. **Open, sequential voting invites quarterbacking** — the most analytical or loudest player solves the vote for everyone, and AP balloons as people deliberate.
3. **Unenforced deals** collapse into "but you *promised*" arguments, or become meaningless — neither is fun.
4. **A reputation track is fiddly and itself causes kingmaking** — players socially punish/reward, and a trailing player swings the game by who they "trust."
5. **Alliances can crown a winner** — two players quietly cooperate to hand one the game.

### The fixes (v2)

- **Scope honestly to 3–7 players**, and ship a deliberately *reduced* 2-player variant (below) rather than pretending the full system works head-to-head.
- **Make the Conclave a simultaneous, secret Influence allocation** — exactly the DNA of your *Ascension Trials* endgame, which already works and which your players know. Everyone allocates hidden, then reveals at once. This kills quarterbacking (no one can command a hidden vote) and AP (it's bounded, not a negotiation spiral), and it opens up bluffing and coalition-reading.
- **Make Pacts game-enforced and scope-limited.** A Pact covers components now and at most one simple, checkable action next turn — nothing vague, nothing game-long. A token marks it; the game enforces it; there is nothing to argue about.
- **Delete the reputation track.** Replace it with a single, concrete, bounded break-cost. No morality economy.
- **Hide final standings with secret Agendas** so the table cannot cleanly identify the leader to crown or gang — the core structural defence against kingmaking in a political game.

### Final ruleset (C) — the three subsystems

**1. Pacts (the deal layer).** On your turn you may propose **one** Pact to another player: an exchange of components now and/or one simple action on their next turn ("give me a Flux next turn"; "draw from the Source, not the Array"). If accepted, place a shared **Pact token**. When fulfilled, **both players gain 1 Influence** — cooperation pays. Breaking a Pact costs the breaker **2 Influence (or, if they have none, 2 components to the Arcane Reserve)**, resolved immediately. That's the entire enforcement — concrete and argument-free.

**2. Influence (the political currency).** Earned mainly by completing Pacts. Spent at the Conclave. It is the bridge between *cooperating now* and *power later*, which is what gives deals weight.

**3. The Conclave (the coalition layer).** Shuffle **2–3 Conclave divider cards** into the lower half of the Source. When one surfaces, pause. A small row of face-up **Edict** cards is on offer — each a temporary global rule until the next Conclave (e.g. *Conjurations draw +1*, *Transfigurations need no hand discard*, *Collection draws 2*, *the Array refills fully each turn*). Players **simultaneously and secretly allocate Influence** to one Edict, then reveal together. The Edict with the most Influence is enacted; spent Influence is gone (the sink). Ties enact neither.

**4. Hidden Agendas (the anti-kingmaker spine).** At setup each player draws one secret **Agenda** (e.g. *score the most from Transfigurations*, *hold 2+ Enchantments at the end*, *complete the most Pacts*), worth bonus Recognition Points at evaluation. Because final standing is partly concealed, nobody can be confidently identified as "the leader to stop."

### The 2-player reduction — "Cold Pact"

No Conclave (coalitions need a third party). Keep **Pacts**, and replace the vote with a single shared **Influence tug-of-war track**: completing pacts and out-trading your rival pulls a marker toward your end; reaching your end once unlocks a **one-time personal boon** (e.g. a free extra Collection draw for the rest of the game). It preserves the *negotiate-or-not* tension of the full game in the only form that works head-to-head.

### How it plays / what interaction it creates

The whole table is now a marketplace of leverage: who needs what, whose pact is worth honouring, which Edict your bloc wants, and whether the quiet allocation you're about to reveal matches what you whispered. It's the deepest interaction of the three — and the most table-talk — which is exactly why it's gated behind simultaneous reveals and bounded, enforced deals.

### Scaling 3–7 (and 2 via Cold Pact)

- **2p:** Cold Pact only (above).
- **3–4p:** politics is real but readable — the cleanest experience.
- **5–7p:** the richest coalition play; Conclaves become genuine blocs. Main thing to watch is table-talk time (see risks).

### Drought handling

Conclaves fire on Source thresholds, so they naturally stop once the Source is gone — the last Edict is the final one. In the Drought, Pacts can still resolve simple component trades during the Learning phase, but with casting and Conclaves gone, the political pressure winds down on its own into the base game's quiet endgame.

### Components

The most of the three: a deck of **Agenda** cards, **Influence** tokens, **Pact** tokens, a row of **Edict** cards, and **Conclave divider** cards (plus the 2p tug-of-war track). This is a true expansion box, not a rules tweak.

### Residual risks → playtest first

- **Soft collusion / repeated two-player alliances** is the headline risk no political game fully removes. Hidden Agendas + secret votes blunt it; if a pair still snowballs, add an Edict that specifically rewards the *trailing* half of the table, or cap Pacts at one *per pair* per Conclave period.
- **Table-talk downtime.** Bound proposals to the proposer's turn and keep Conclaves to a strict allocate-and-reveal with no open debate if turns drag.
- **Agenda balance.** Secret objectives must be roughly equal in achievability or they distort the whole game; this needs its own tuning pass.

---

# Side-by-side comparison

| Dimension | **A — The Living Array** | **B — Spell Duels** | **C — The Conclave** |
|---|---|---|---|
| Interaction flavour | Indirect (compete & deny) | Direct (tempo attacks) | Political (deals, votes, bluff) |
| Complexity added | Very low | Medium | High |
| New components | None (maybe a start-player token) | Ref cards + a few tokens | Agendas, Influence, Pacts, Edicts, dividers |
| Deviation from base | Minimal (1 changed rule) | Moderate (new Casting option) | Largest (three subsystems) |
| Player counts | 2–7 | 2–7 | 3–7 (+ 2p "Cold Pact") |
| Feel-bad risk | Negligible | Managed (no destruction, wardable, neighbour-only) | Low per-action, but politics can bruise |
| Downtime impact | Reduces it (others' turns matter) | Slight increase (one reaction) | Highest (table-talk) — bounded by design |
| Kingmaking risk | None | Low (small effects, local reach) | Highest — defended by hidden agendas + secret votes |
| Biggest residual risk | Transfiguration contention | 2p snowball | Soft two-player collusion |
| Teaches in | ~1 minute | ~5 minutes | ~15 minutes |
| Best suited to | Any group wanting *more* without *heavier* | Groups who want drama and teeth | Social groups who love negotiation |

---

# Recommendation

If you build one of these next, build **A — The Living Array first** — but as a *test*, not a commitment.

The reason is method, not just taste. The open question underneath your whole request is **"does added interaction actually make this game better, or does it just make it noisier?"** A answers that question for the lowest possible cost: one rule, no components, fully reversible, and zero threat to the core loop you're still stabilising. If a Living-Array game feels more alive than the solitaire baseline, you've validated the *direction* and earned the right to go heavier. If it doesn't, you've saved yourself from building a token-heavy conflict system on a foundation that didn't want one.

From there:

- Reach for **B — Spell Duels** if playtesters specifically say they want *teeth* — drama, tension, the ability to act on a rival. It's the right answer when "more interaction" really means "more conflict," and it's been designed to deliver that without the feel-bad that usually comes with take-that.
- Hold **C — The Conclave** as a future deluxe/"big-box" expansion for once the game has an audience. It's the most exciting and the most expensive to develop and balance, and it only sings at 3+ players. It's a *destination*, not a starting point.

One caution worth repeating: none of this is Stage-3 work. Park these next to *Trials* and come back when the Enchantment-capacity economy is solved and the base loop is locked. The cheapest version of "more interaction" is also the one you can afford to test the moment you're ready — which is part of why A leads.

